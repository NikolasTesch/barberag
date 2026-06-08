import { prisma } from '@/lib/prisma/client'
import { getSessionBarber } from '@/lib/auth/barber'

/** POST /api/barber/appointments/[id]/no-show — SCHEDULED/CONFIRMED → NO_SHOW (RN-05). */
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const { barber, error } = await getSessionBarber()
  if (error) return error

  const appointment = await prisma.appointment.findUnique({ where: { id: params.id } })
  if (!appointment || appointment.barberId !== barber.id) {
    return Response.json({ error: 'Não encontrado' }, { status: 404 })
  }
  if (!['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'].includes(appointment.status)) {
    return Response.json({ error: 'Invalid status transition' }, { status: 400 })
  }

  const updated = await prisma.appointment.update({
    where: { id: appointment.id },
    data: { status: 'NO_SHOW' },
  })
  return Response.json({ appointment: updated })
}
