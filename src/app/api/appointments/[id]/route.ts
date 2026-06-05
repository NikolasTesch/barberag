import { Prisma } from '@prisma/client'
import { startOfDay, endOfDay } from 'date-fns'
import { prisma } from '@/lib/prisma/client'
import { getServerSession } from '@/lib/auth/helpers'
import { AppointmentActionSchema } from '@/lib/validations/appointment'
import { isSlotWithinSchedule } from '@/lib/utils/slots'

class SlotConflictError extends Error {}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession()
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const parsed = AppointmentActionSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const appointment = await prisma.appointment.findUnique({ where: { id: params.id } })
  if (!appointment) return Response.json({ error: 'Não encontrado' }, { status: 404 })

  // RN-04: cliente só age sobre os próprios agendamentos.
  if (appointment.clientId !== session.user.id) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  // ─── CANCELAR ──────────────────────────────────────────────────────────────
  if (parsed.data.action === 'cancel') {
    if (!['SCHEDULED', 'CONFIRMED'].includes(appointment.status)) {
      return Response.json(
        { error: 'Este agendamento não pode ser cancelado' },
        { status: 400 }
      )
    }

    const config = await prisma.barbershopConfig.findFirst()
    const minutesUntil = (appointment.scheduledAt.getTime() - Date.now()) / 60_000
    const lateCancel = minutesUntil < (config?.cancelPolicy ?? 120)

    const updated = await prisma.appointment.update({
      where: { id: appointment.id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancelReason: parsed.data.reason ?? (lateCancel ? 'Cancelamento tardio' : null),
      },
    })
    return Response.json({ appointment: updated, lateCancel })
  }

  // ─── REAGENDAR ───────────────────────────────────────────────────────────────
  if (appointment.status !== 'SCHEDULED') {
    return Response.json({ error: 'Apenas agendamentos pendentes podem ser reagendados' }, { status: 400 })
  }

  const newBarberId = parsed.data.barberId ?? appointment.barberId
  const newScheduledAt = parsed.data.scheduledAt
  const endAt = new Date(newScheduledAt.getTime() + appointment.totalDuration * 60_000)

  try {
    const updated = await prisma.$transaction(
      async (tx) => {
        const sameDay = await tx.appointment.findMany({
          where: {
            barberId: newBarberId,
            status: { not: 'CANCELLED' },
            id: { not: appointment.id },
            scheduledAt: { gte: startOfDay(newScheduledAt), lte: endOfDay(newScheduledAt) },
          },
          select: { scheduledAt: true, totalDuration: true },
        })
        const conflict = sameDay.some((a) => {
          const aStart = a.scheduledAt.getTime()
          const aEnd = aStart + a.totalDuration * 60_000
          return newScheduledAt.getTime() < aEnd && endAt.getTime() > aStart
        })
        if (conflict) throw new SlotConflictError()

        // Horário de trabalho + bloqueios também valem no reagendamento (RN-01).
        if (!(await isSlotWithinSchedule(tx, newBarberId, newScheduledAt, endAt))) {
          throw new SlotConflictError()
        }

        return tx.appointment.update({
          where: { id: appointment.id },
          data: { scheduledAt: newScheduledAt, barberId: newBarberId },
        })
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
    )
    return Response.json({ appointment: updated })
  } catch (err) {
    if (
      err instanceof SlotConflictError ||
      (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2034')
    ) {
      return Response.json({ error: 'Slot unavailable' }, { status: 409 })
    }
    console.error('[appointments:PATCH]', err)
    return Response.json({ error: 'Erro ao reagendar' }, { status: 500 })
  }
}
