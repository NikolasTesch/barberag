/**
 * Integração com a Evolution API para envio de mensagens WhatsApp.
 * Best-effort: nunca lança — falha de WhatsApp não pode quebrar nenhum fluxo.
 */

/**
 * Normaliza um telefone para o formato esperado pela Evolution API:
 * `55` + DDD + número, somente dígitos. Ex: '(11) 99999-9999' → '5511999999999'.
 */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('55')) return digits
  return `55${digits}`
}

export async function sendWhatsAppMessage(phone: string, message: string): Promise<void> {
  const baseUrl = process.env.EVOLUTION_API_URL
  const apiKey = process.env.EVOLUTION_API_KEY
  const instance = process.env.EVOLUTION_INSTANCE_NAME ?? 'barberag'

  if (!baseUrl || !apiKey) {
    console.warn('[whatsapp] EVOLUTION_API_URL/KEY ausente — mensagem não enviada.')
    return
  }

  try {
    const res = await fetch(`${baseUrl.replace(/\/$/, '')}/message/sendText/${instance}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: apiKey,
      },
      body: JSON.stringify({ number: formatPhone(phone), text: message }),
    })
    if (!res.ok) {
      console.error('[whatsapp] resposta não-OK:', res.status, await res.text().catch(() => ''))
    }
  } catch (err) {
    console.error('[whatsapp] falha ao enviar mensagem:', err)
  }
}
