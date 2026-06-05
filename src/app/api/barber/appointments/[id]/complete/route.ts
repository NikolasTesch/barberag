import { randomUUID } from 'node:crypto'
import { prisma } from '@/lib/prisma/client'
import { getSessionBarber } from '@/lib/auth/barber'
import { CompleteAppointmentSchema } from '@/lib/validations/appointment'
import { calculateCommission } from '@/lib/utils/commission'
import { sendReviewLinkEmail } from '@/lib/notifications/email'
import { sendWhatsAppMessage } from '@/lib/notifications/whatsapp'
import { whatsappReviewLink } from '@/lib/notifications/templates'

/** POST /api/barber/appointments/[id]/complete — conclui o atendimento e gera a comissão. */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { barber, error } = await getSessionBarber()
  if (error) return error

  const body = await req.json().catch(() => null)
  const parsed = CompleteAppointmentSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const { paymentMethod, serviceIds, notes } = parsed.data

  const appointment = await prisma.appointment.findUnique({ where: { id: params.id } })
  if (!appointment || appointment.barberId !== barber.id) {
    return Response.json({ error: 'Não encontrado' }, { status: 404 })
  }
  if (appointment.status !== 'IN_PROGRESS') {
    return Response.json({ error: 'Invalid status transition' }, { status: 400 })
  }

  const reviewToken = randomUUID()

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Serviços alterados → recalcula totais e regrava o snapshot.
      if (serviceIds && serviceIds.length > 0) {
        const services = await tx.service.findMany({ where: { id: { in: serviceIds } } })
        if (services.length !== serviceIds.length) throw new Error('INVALID_SERVICE')

        // Preço efetivo por serviço: override do barbeiro (customPrice) ou basePrice.
        const overrides = await tx.barberService.findMany({
          where: { barberId: appointment.barberId, serviceId: { in: serviceIds } },
          select: { serviceId: true, customPrice: true },
        })
        const priceMap = new Map(overrides.map((o) => [o.serviceId, o.customPrice]))
        const lineItems = services.map((s) => ({
          appointmentId: appointment.id,
          serviceId: s.id,
          price: priceMap.get(s.id) ?? s.basePrice,
          duration: s.durationMinutes,
        }))

        await tx.appointmentService.deleteMany({ where: { appointmentId: appointment.id } })
        await tx.appointmentService.createMany({ data: lineItems })
        await tx.appointment.update({
          where: { id: appointment.id },
          data: {
            totalPrice: lineItems.reduce((a, li) => a + li.price, 0),
            totalDuration: services.reduce((a, s) => a + s.durationMinutes, 0),
          },
        })
      }

      // 2. Conclui o atendimento.
      await tx.appointment.update({
        where: { id: appointment.id },
        data: {
          status: 'COMPLETED',
          paymentMethod,
          notes: notes ?? appointment.notes,
          completedAt: new Date(),
          reviewToken,
        },
      })

      // 3. Comissão na mesma transaction (RN-06).
      const commission = await calculateCommission(tx, appointment.id)

      return { commission }
    })

    // 4. Link de avaliação — fire-and-forget (e-mail + WhatsApp), não bloqueia a resposta.
    prisma.appointment
      .findUnique({
        where: { id: appointment.id },
        select: {
          client: { select: { name: true, email: true, phone: true } },
          barber: { select: { user: { select: { name: true } } } },
        },
      })
      .then((a) => {
        if (!a) return
        if (a.client.email) {
          void sendReviewLinkEmail({ to: a.client.email, clientName: a.client.name, reviewToken })
        }
        if (a.client.phone) {
          const link = `${process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL ?? ''}/avaliar/${reviewToken}`
          void sendWhatsAppMessage(
            a.client.phone,
            whatsappReviewLink({ name: a.client.name, barberName: a.barber.user.name, link })
          )
        }
      })
      .catch(console.error)

    return Response.json({ commission: result.commission }, { status: 200 })
  } catch (err) {
    if (err instanceof Error && err.message === 'INVALID_SERVICE') {
      return Response.json({ error: 'Serviço inválido' }, { status: 400 })
    }
    console.error('[barber:complete]', err)
    return Response.json({ error: 'Erro ao concluir atendimento' }, { status: 500 })
  }
}
