import { Resend } from 'resend'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export interface ConfirmationEmailData {
  to: string
  clientName: string
  barberName: string
  services: { name: string; durationMinutes: number }[]
  scheduledAt: Date
  totalDuration: number
}

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

function buildHtml(data: ConfirmationEmailData): string {
  const formattedDate = format(data.scheduledAt, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })
  const formattedTime = format(data.scheduledAt, 'HH:mm', { locale: ptBR })
  const cancelLink = `${process.env.NEXTAUTH_URL ?? ''}/agendamentos`
  const servicesList = data.services
    .map((s) => `<li>${s.name} — ${s.durationMinutes} min</li>`)
    .join('')

  return `
  <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;color:#1A1A1A">
    <div style="background:#1A1A1A;padding:24px;text-align:center">
      <span style="color:#D4830A;font-size:24px;font-weight:900;letter-spacing:-0.5px">BARBERAG</span>
    </div>
    <div style="padding:24px">
      <h1 style="font-size:20px">Agendamento confirmado! ✂️</h1>
      <p>Olá, ${data.clientName}! Seu horário está reservado.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:6px 0;color:#666">Barbeiro</td><td style="text-align:right;font-weight:600">${data.barberName}</td></tr>
        <tr><td style="padding:6px 0;color:#666">Data</td><td style="text-align:right;font-weight:600">${formattedDate}</td></tr>
        <tr><td style="padding:6px 0;color:#666">Horário</td><td style="text-align:right;font-weight:600">${formattedTime}</td></tr>
        <tr><td style="padding:6px 0;color:#666">Duração</td><td style="text-align:right;font-weight:600">${data.totalDuration} min</td></tr>
      </table>
      <p style="color:#666;font-weight:600;margin-bottom:4px">Serviços</p>
      <ul style="margin-top:0">${servicesList}</ul>
      <a href="${cancelLink}" style="display:inline-block;margin-top:16px;background:#D4830A;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600">Ver meus agendamentos</a>
      <p style="color:#666;font-size:13px;margin-top:24px">Cancele com pelo menos 2h de antecedência através do app.</p>
    </div>
  </div>`
}

/**
 * Envia o e-mail de confirmação. Nunca lança — falha de notificação não pode
 * quebrar o fluxo de agendamento. Use sempre como fire-and-forget com .catch().
 */
export interface ReviewLinkEmailData {
  to: string
  clientName: string
  reviewToken: string
}

/** Envia o link de avaliação pós-atendimento. Nunca lança. */
export async function sendReviewLinkEmail(data: ReviewLinkEmailData): Promise<void> {
  try {
    if (!resend) {
      console.warn('[email] RESEND_API_KEY ausente — link de avaliação não enviado.')
      return
    }
    const link = `${process.env.NEXTAUTH_URL ?? ''}/avaliar/${data.reviewToken}`
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? 'BARBERAG <noreply@barberag.com.br>',
      to: data.to,
      subject: 'Como foi seu atendimento na BARBERAG?',
      html: `
        <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;color:#1A1A1A">
          <div style="background:#1A1A1A;padding:24px;text-align:center">
            <span style="color:#D4830A;font-size:24px;font-weight:900">BARBERAG</span>
          </div>
          <div style="padding:24px">
            <p>Olá, ${data.clientName}! Que tal nos contar como foi seu atendimento?</p>
            <a href="${link}" style="display:inline-block;margin-top:12px;background:#D4830A;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600">Avaliar atendimento</a>
          </div>
        </div>`,
    })
  } catch (err) {
    console.error('[email] Falha ao enviar link de avaliação:', err)
  }
}

export interface BarberWelcomeEmailData {
  to: string
  barberName: string
  tempPassword: string
}

/** E-mail de boas-vindas com credenciais de acesso ao novo barbeiro. Nunca lança. */
export async function sendBarberWelcomeEmail(data: BarberWelcomeEmailData): Promise<void> {
  try {
    if (!resend) {
      console.warn('[email] RESEND_API_KEY ausente — e-mail de boas-vindas não enviado.')
      return
    }
    const loginLink = `${process.env.NEXTAUTH_URL ?? ''}/login`
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? 'BARBERAG <noreply@barberag.com.br>',
      to: data.to,
      subject: 'Bem-vindo à equipe BARBERAG ✂️',
      html: `
        <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;color:#1A1A1A">
          <div style="background:#1A1A1A;padding:24px;text-align:center">
            <span style="color:#D4830A;font-size:24px;font-weight:900">BARBERAG</span>
          </div>
          <div style="padding:24px">
            <h1 style="font-size:20px">Olá, ${data.barberName}!</h1>
            <p>Sua conta de barbeiro foi criada. Use as credenciais abaixo para acessar o painel:</p>
            <table style="width:100%;border-collapse:collapse;margin:16px 0">
              <tr><td style="padding:6px 0;color:#666">E-mail</td><td style="text-align:right;font-weight:600">${data.to}</td></tr>
              <tr><td style="padding:6px 0;color:#666">Senha temporária</td><td style="text-align:right;font-weight:600;font-family:monospace">${data.tempPassword}</td></tr>
            </table>
            <a href="${loginLink}" style="display:inline-block;margin-top:8px;background:#D4830A;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600">Acessar painel</a>
            <p style="color:#666;font-size:13px;margin-top:24px">Por segurança, altere sua senha no primeiro acesso.</p>
          </div>
        </div>`,
    })
  } catch (err) {
    console.error('[email] Falha ao enviar boas-vindas:', err)
  }
}

/** Notifica o cliente que um agendamento futuro foi cancelado pela barbearia. Nunca lança. */
export async function sendAppointmentCancelledEmail(data: {
  to: string
  clientName: string
  scheduledAt: Date
  reason: string
}): Promise<void> {
  try {
    if (!resend) {
      console.warn('[email] RESEND_API_KEY ausente — e-mail de cancelamento não enviado.')
      return
    }
    const when = format(data.scheduledAt, "EEEE, d 'de' MMMM 'às' HH:mm", { locale: ptBR })
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? 'BARBERAG <noreply@barberag.com.br>',
      to: data.to,
      subject: 'Seu agendamento na BARBERAG precisa ser remarcado',
      html: `
        <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;color:#1A1A1A">
          <div style="background:#1A1A1A;padding:24px;text-align:center">
            <span style="color:#D4830A;font-size:24px;font-weight:900">BARBERAG</span>
          </div>
          <div style="padding:24px">
            <p>Olá, ${data.clientName}.</p>
            <p>Infelizmente seu agendamento de <strong>${when}</strong> precisou ser cancelado (${data.reason}).</p>
            <p>Pedimos desculpas pelo transtorno. Acesse o app para reagendar com outro horário ou profissional.</p>
            <a href="${process.env.NEXTAUTH_URL ?? ''}/agendar" style="display:inline-block;margin-top:8px;background:#D4830A;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600">Reagendar</a>
          </div>
        </div>`,
    })
  } catch (err) {
    console.error('[email] Falha ao enviar cancelamento:', err)
  }
}

export interface ReminderEmailData {
  to: string
  clientName: string
  barberName: string
  scheduledAt: Date
  kind: '24h' | '2h'
  address?: string | null
}

/** Lembrete de agendamento (24h ou 2h antes). Nunca lança. */
export async function sendReminderEmail(data: ReminderEmailData): Promise<void> {
  try {
    if (!resend) {
      console.warn('[email] RESEND_API_KEY ausente — lembrete não enviado.')
      return
    }
    const when = format(data.scheduledAt, "EEEE, d 'de' MMMM 'às' HH:mm", { locale: ptBR })
    const hora = format(data.scheduledAt, 'HH:mm', { locale: ptBR })
    const subject =
      data.kind === '24h'
        ? 'Lembrete: seu agendamento é amanhã — BARBERAG'
        : 'Seu agendamento começa em 2 horas — BARBERAG'
    const intro =
      data.kind === '24h'
        ? `Passando para lembrar do seu agendamento <strong>amanhã às ${hora}</strong> com ${data.barberName}.`
        : `Seu horário com ${data.barberName} começa em <strong>2 horas (${hora})</strong>. Te esperamos! 💈`

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? 'BARBERAG <noreply@barberag.com.br>',
      to: data.to,
      subject,
      html: `
        <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;color:#1A1A1A">
          <div style="background:#1A1A1A;padding:24px;text-align:center">
            <span style="color:#D4830A;font-size:24px;font-weight:900">BARBERAG</span>
          </div>
          <div style="padding:24px">
            <p>Olá, ${data.clientName}!</p>
            <p>${intro}</p>
            <table style="width:100%;border-collapse:collapse;margin:12px 0">
              <tr><td style="padding:6px 0;color:#666">Quando</td><td style="text-align:right;font-weight:600">${when}</td></tr>
              <tr><td style="padding:6px 0;color:#666">Barbeiro</td><td style="text-align:right;font-weight:600">${data.barberName}</td></tr>
              ${data.address ? `<tr><td style="padding:6px 0;color:#666">Endereço</td><td style="text-align:right;font-weight:600">${data.address}</td></tr>` : ''}
            </table>
            <a href="${process.env.NEXTAUTH_URL ?? ''}/agendamentos" style="display:inline-block;margin-top:8px;background:#D4830A;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600">Gerenciar agendamento</a>
          </div>
        </div>`,
    })
  } catch (err) {
    console.error('[email] Falha ao enviar lembrete:', err)
  }
}

export async function sendConfirmationEmail(data: ConfirmationEmailData): Promise<void> {
  try {
    if (!resend) {
      console.warn('[email] RESEND_API_KEY ausente — e-mail de confirmação não enviado.')
      return
    }
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? 'BARBERAG <noreply@barberag.com.br>',
      to: data.to,
      subject: 'Seu agendamento na BARBERAG está confirmado',
      html: buildHtml(data),
    })
  } catch (err) {
    console.error('[email] Falha ao enviar confirmação:', err)
  }
}
