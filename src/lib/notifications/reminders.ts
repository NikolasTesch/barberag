import { prisma } from '@/lib/prisma/client'
import { sendReminderEmail } from '@/lib/notifications/email'
import { sendWhatsAppMessage } from '@/lib/notifications/whatsapp'
import { whatsappReminder24h, whatsappReminder2h } from '@/lib/notifications/templates'

type ReminderKind = '24h' | '2h'

const MINUTE = 60 * 1000

/** Janela de busca para cada tipo de lembrete (tolerância p/ a cadência do cron). */
function windowFor(kind: ReminderKind, now: Date): { gte: Date; lte: Date } {
  if (kind === '24h') {
    return { gte: new Date(now.getTime() + 23 * 60 * MINUTE), lte: new Date(now.getTime() + 25 * 60 * MINUTE) }
  }
  // 2h: de +1h50 a +2h10
  return { gte: new Date(now.getTime() + 110 * MINUTE), lte: new Date(now.getTime() + 130 * MINUTE) }
}

/**
 * Dispara lembretes de agendamentos próximos via WhatsApp + e-mail. Idempotente:
 * usa os flags reminderSent24h/2h para nunca reenviar. Retorna a contagem enviada.
 */
export async function runReminders(kind: ReminderKind): Promise<number> {
  const now = new Date()
  const range = windowFor(kind, now)
  const sentField = kind === '24h' ? 'reminderSent24h' : 'reminderSent2h'

  const appointments = await prisma.appointment.findMany({
    where: {
      scheduledAt: range,
      status: { in: ['SCHEDULED', 'CONFIRMED'] },
      [sentField]: false,
    },
    select: {
      id: true,
      scheduledAt: true,
      client: { select: { name: true, email: true, phone: true } },
      barber: { select: { user: { select: { name: true } } } },
    },
  })

  if (appointments.length === 0) return 0

  const config = await prisma.barbershopConfig.findFirst({ select: { address: true } })

  let sent = 0
  for (const appt of appointments) {
    const barberName = appt.barber.user.name

    if (appt.client.email) {
      await sendReminderEmail({
        to: appt.client.email,
        clientName: appt.client.name,
        barberName,
        scheduledAt: appt.scheduledAt,
        kind,
        address: config?.address,
      })
    }
    if (appt.client.phone) {
      const message =
        kind === '24h'
          ? whatsappReminder24h({ name: appt.client.name, scheduledAt: appt.scheduledAt, barberName })
          : whatsappReminder2h({ name: appt.client.name, scheduledAt: appt.scheduledAt, barberName })
      await sendWhatsAppMessage(appt.client.phone, message)
    }

    await prisma.appointment.update({
      where: { id: appt.id },
      data: { [sentField]: true },
    })
    sent++
  }

  return sent
}
