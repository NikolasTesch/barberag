import { prisma } from '@/lib/prisma/client'
import { getSessionAdmin } from '@/lib/auth/admin'
import { BarberFormSchema } from '@/lib/validations/barber'
import { sendAppointmentCancelledEmail } from '@/lib/notifications/email'

interface Ctx {
  params: { id: string }
}

/** GET /api/admin/barbers/[id] — dados completos para o formulário de edição. */
export async function GET(_req: Request, { params }: Ctx) {
  const { admin, error } = await getSessionAdmin()
  if (error) return error
  void admin

  const barber = await prisma.barber.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      bio: true,
      specialties: true,
      commissionRate: true,
      isActive: true,
      user: { select: { name: true, email: true, phone: true, image: true } },
      barberServices: { select: { serviceId: true, customPrice: true } },
      workingHours: { select: { dayOfWeek: true, startTime: true, endTime: true, isActive: true } },
    },
  })

  if (!barber) return Response.json({ error: 'Barbeiro não encontrado' }, { status: 404 })
  return Response.json({ barber })
}

/**
 * PATCH /api/admin/barbers/[id]
 * - { action: 'set-active', isActive } → ativa/desativa. Ao desativar, cancela
 *   agendamentos futuros (SCHEDULED/CONFIRMED) e notifica os clientes.
 * - caso contrário → edição completa via BarberFormSchema.
 */
export async function PATCH(req: Request, { params }: Ctx) {
  const { admin, error } = await getSessionAdmin()
  if (error) return error
  void admin

  const existing = await prisma.barber.findUnique({
    where: { id: params.id },
    select: { id: true, userId: true },
  })
  if (!existing) return Response.json({ error: 'Barbeiro não encontrado' }, { status: 404 })

  const body = await req.json().catch(() => null)

  // ── Toggle de ativação ────────────────────────────────────────────────
  if (body && body.action === 'set-active') {
    const isActive = Boolean(body.isActive)

    if (isActive) {
      await prisma.barber.update({ where: { id: params.id }, data: { isActive: true } })
      return Response.json({ ok: true, cancelled: 0 })
    }

    // Desativando: busca agendamentos futuros para cancelar + notificar.
    const future = await prisma.appointment.findMany({
      where: {
        barberId: params.id,
        status: { in: ['SCHEDULED', 'CONFIRMED'] },
        scheduledAt: { gte: new Date() },
      },
      select: {
        id: true,
        scheduledAt: true,
        client: { select: { name: true, email: true } },
      },
    })

    await prisma.$transaction(async (tx) => {
      await tx.barber.update({ where: { id: params.id }, data: { isActive: false } })
      if (future.length > 0) {
        await tx.appointment.updateMany({
          where: { id: { in: future.map((f) => f.id) } },
          data: { status: 'CANCELLED', cancelledAt: new Date(), cancelReason: 'Barbeiro indisponível' },
        })
      }
    })

    for (const appt of future) {
      void sendAppointmentCancelledEmail({
        to: appt.client.email,
        clientName: appt.client.name,
        scheduledAt: appt.scheduledAt,
        reason: 'barbeiro indisponível',
      })
    }

    return Response.json({ ok: true, cancelled: future.length })
  }

  // ── Edição completa ───────────────────────────────────────────────────
  const parsed = BarberFormSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const data = parsed.data

  // e-mail deve permanecer único (exceto o próprio usuário)
  const emailOwner = await prisma.user.findUnique({
    where: { email: data.email },
    select: { id: true },
  })
  if (emailOwner && emailOwner.id !== existing.userId) {
    return Response.json(
      { error: { formErrors: ['E-mail já usado por outro usuário.'], fieldErrors: {} } },
      { status: 409 }
    )
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: existing.userId },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        image: data.image || null,
      },
    })

    await tx.barber.update({
      where: { id: params.id },
      data: {
        bio: data.bio || null,
        specialties: data.specialties,
        commissionRate: data.commissionPercent / 100,
      },
    })

    // Sincroniza serviços: substitui o conjunto inteiro.
    await tx.barberService.deleteMany({ where: { barberId: params.id } })
    if (data.services.length > 0) {
      await tx.barberService.createMany({
        data: data.services.map((s) => ({
          barberId: params.id,
          serviceId: s.serviceId,
          customPrice: s.customPrice ?? null,
        })),
      })
    }

    // Sincroniza horários: substitui o conjunto inteiro.
    await tx.workingHours.deleteMany({ where: { barberId: params.id } })
    const activeDays = data.workingHours.filter((w) => w.isActive)
    if (activeDays.length > 0) {
      await tx.workingHours.createMany({
        data: activeDays.map((w) => ({
          barberId: params.id,
          dayOfWeek: w.dayOfWeek,
          startTime: w.startTime,
          endTime: w.endTime,
          isActive: true,
        })),
      })
    }
  })

  return Response.json({ ok: true })
}
