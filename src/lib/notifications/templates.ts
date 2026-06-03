import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

/** Templates de mensagem WhatsApp (Evolution API). Ver spec-geral#notifications_templates. */

export function whatsappReminder24h(p: { name: string; scheduledAt: Date; barberName: string }): string {
  const hora = format(p.scheduledAt, 'HH:mm', { locale: ptBR })
  return `🔔 Olá ${p.name}! Lembrando do seu agendamento amanhã às ${hora} com ${p.barberName} na BARBERAG.`
}

export function whatsappReminder2h(p: { name: string; scheduledAt: Date; barberName: string }): string {
  const hora = format(p.scheduledAt, 'HH:mm', { locale: ptBR })
  return `⏰ Olá ${p.name}! Seu horário com ${p.barberName} começa em 2 horas (${hora}). Te esperamos! 💈`
}

export function whatsappReviewLink(p: { name: string; barberName: string; link: string }): string {
  return `⭐ Olá ${p.name}! Como foi seu atendimento com ${p.barberName} na BARBERAG? Conte pra gente: ${p.link}`
}
