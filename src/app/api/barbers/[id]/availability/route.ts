import { getAvailableSlots } from '@/lib/utils/slots'

/**
 * GET /api/barbers/[id]/availability?date=YYYY-MM-DD&duration=30
 * Público. Retorna os slots livres ('HH:mm') do barbeiro na data informada.
 */
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { searchParams } = new URL(req.url)
  const dateParam = searchParams.get('date')
  const durationParam = searchParams.get('duration')

  if (!dateParam) {
    return Response.json({ error: 'Parâmetro "date" obrigatório' }, { status: 400 })
  }
  const duration = Number(durationParam)
  if (!Number.isFinite(duration) || duration <= 0) {
    return Response.json({ error: 'Parâmetro "duration" inválido' }, { status: 400 })
  }

  // Interpreta a data como local (meia-noite) para alinhar com getDay()/WorkingHours.
  const [y, m, d] = dateParam.split('-').map(Number)
  const date = new Date(y, (m ?? 1) - 1, d ?? 1)
  if (isNaN(date.getTime())) {
    return Response.json({ error: 'Data inválida' }, { status: 400 })
  }

  const slots = await getAvailableSlots(params.id, date, duration)
  return Response.json({ slots })
}
