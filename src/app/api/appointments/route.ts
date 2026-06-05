import { Prisma } from '@prisma/client'
import { startOfDay, endOfDay } from 'date-fns'
import { prisma } from '@/lib/prisma/client'
import { getServerSession } from '@/lib/auth/helpers'
import { CreateAppointmentSchema } from '@/lib/validations/appointment'
import { isSlotWithinSchedule } from '@/lib/utils/slots'
import { sendConfirmationEmail } from '@/lib/notifications/email'

class SlotConflictError extends Error {}

/** Checa, dentro da transaction, se [scheduledAt, endAt] colide com algum agendamento do barbeiro. */
async function hasConflict(
  tx: Prisma.TransactionClient,
  barberId: string,
  scheduledAt: Date,
  endAt: Date
): Promise<boolean> {
  const sameDay = await tx.appointment.findMany({
    where: {
      barberId,
      status: { not: 'CANCELLED' },
      scheduledAt: { gte: startOfDay(scheduledAt), lte: endOfDay(scheduledAt) },
    },
    select: { scheduledAt: true, totalDuration: true },
  })
  return sameDay.some((a) => {
    const aStart = a.scheduledAt.getTime()
    const aEnd = aStart + a.totalDuration * 60_000
    return scheduledAt.getTime() < aEnd && endAt.getTime() > aStart
  })
}

export async function POST(req: Request) {
  // 1. Auth — apenas CLIENT cria agendamento para si.
  const session = await getServerSession()
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.role !== 'CLIENT') {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  // 2. Validação.
  const body = await req.json().catch(() => null)
  const parsed = CreateAppointmentSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const { barberId, scheduledAt, services } = parsed.data
  const serviceIds = services.map((s) => s.serviceId)

  // 3. Serviços → totais (RN-02: duração é a soma).
  const dbServices = await prisma.service.findMany({
    where: { id: { in: serviceIds }, isActive: true },
  })
  if (dbServices.length !== serviceIds.length) {
    return Response.json({ error: 'Serviço inválido ou indisponível' }, { status: 400 })
  }
  const totalDuration = dbServices.reduce((acc, s) => acc + s.durationMinutes, 0)
  const endAt = new Date(scheduledAt.getTime() + totalDuration * 60_000)

  // 4. Resolve barbeiro: 'any' → primeiro barbeiro que atende todos os serviços e está livre.
  let candidateBarberIds: string[]
  if (barberId === 'any') {
    const barbers = await prisma.barber.findMany({
      where: {
        isActive: true,
        barberServices: { some: {} },
      },
      select: { id: true, barberServices: { select: { serviceId: true } } },
    })
    candidateBarberIds = barbers
      .filter((b) => serviceIds.every((id) => b.barberServices.some((bs) => bs.serviceId === id)))
      .map((b) => b.id)
    if (candidateBarberIds.length === 0) {
      return Response.json({ error: 'Nenhum barbeiro atende esses serviços' }, { status: 400 })
    }
  } else {
    candidateBarberIds = [barberId]
  }

  // 5. Transaction Serializable — anti-double-booking (RN-01).
  try {
    const appointment = await prisma.$transaction(
      async (tx) => {
        // Slot válido = livre de conflito (RN-01) E dentro do horário de trabalho,
        // sem bloqueio. Ambos checados no servidor — nunca confiar só no front.
        let chosen: string | null = null
        for (const id of candidateBarberIds) {
          if (
            !(await hasConflict(tx, id, scheduledAt, endAt)) &&
            (await isSlotWithinSchedule(tx, id, scheduledAt, endAt))
          ) {
            chosen = id
            break
          }
        }
        if (!chosen) throw new SlotConflictError()

        // Preço efetivo por serviço: override do barbeiro (customPrice) ou basePrice.
        const overrides = await tx.barberService.findMany({
          where: { barberId: chosen, serviceId: { in: serviceIds } },
          select: { serviceId: true, customPrice: true },
        })
        const priceMap = new Map(overrides.map((o) => [o.serviceId, o.customPrice]))
        const lineItems = dbServices.map((s) => ({
          serviceId: s.id,
          price: priceMap.get(s.id) ?? s.basePrice,
          duration: s.durationMinutes,
        }))
        const totalPrice = lineItems.reduce((acc, li) => acc + li.price, 0)

        return tx.appointment.create({
          data: {
            clientId: session.user.id,
            barberId: chosen,
            status: 'SCHEDULED',
            scheduledAt,
            totalDuration,
            totalPrice,
            services: {
              create: lineItems,
            },
          },
          include: {
            barber: { include: { user: { select: { name: true } } } },
            services: { include: { service: { select: { name: true } } } },
            client: { select: { name: true, email: true } },
          },
        })
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
    )

    // 6. E-mail de confirmação — fire-and-forget, não bloqueia a resposta.
    sendConfirmationEmail({
      to: appointment.client.email,
      clientName: appointment.client.name,
      barberName: appointment.barber.user.name,
      services: appointment.services.map((s) => ({
        name: s.service.name,
        durationMinutes: s.duration,
      })),
      scheduledAt: appointment.scheduledAt,
      totalDuration: appointment.totalDuration,
    }).catch(console.error)

    return Response.json({ appointment }, { status: 201 })
  } catch (err) {
    // Conflito de slot (detectado manualmente ou serialization failure do Postgres).
    if (
      err instanceof SlotConflictError ||
      (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2034')
    ) {
      return Response.json({ error: 'Slot unavailable' }, { status: 409 })
    }
    console.error('[appointments:POST]', err)
    return Response.json({ error: 'Erro ao criar agendamento' }, { status: 500 })
  }
}

export async function GET(req: Request) {
  const session = await getServerSession()
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const status = new URL(req.url).searchParams.get('status')
  const now = new Date()
  const where: Prisma.AppointmentWhereInput = { clientId: session.user.id }
  if (status === 'upcoming') {
    where.scheduledAt = { gte: now }
    where.status = { notIn: ['CANCELLED', 'COMPLETED', 'NO_SHOW'] }
  } else if (status === 'past') {
    where.OR = [{ scheduledAt: { lt: now } }, { status: { in: ['CANCELLED', 'COMPLETED', 'NO_SHOW'] } }]
  }

  const appointments = await prisma.appointment.findMany({
    where,
    include: {
      barber: { include: { user: { select: { name: true, image: true } } } },
      services: { include: { service: { select: { name: true } } } },
    },
    orderBy: { scheduledAt: 'desc' },
  })

  return Response.json({ appointments })
}
