import { startOfDay, endOfDay } from 'date-fns'
import { prisma } from '@/lib/prisma/client'
import { getSessionBarber } from '@/lib/auth/barber'

/** GET /api/barber/appointments?date=YYYY-MM-DD — agenda do barbeiro logado. */
export async function GET(req: Request) {
  const { barber, error } = await getSessionBarber()
  if (error) return error

  const dateParam = new URL(req.url).searchParams.get('date')
  const base = dateParam ? new Date(`${dateParam}T00:00:00`) : new Date()
  if (isNaN(base.getTime())) {
    return Response.json({ error: 'Data inválida' }, { status: 400 })
  }

  const appointments = await prisma.appointment.findMany({
    where: {
      barberId: barber.id,
      scheduledAt: { gte: startOfDay(base), lte: endOfDay(base) },
    },
    include: {
      client: { select: { name: true, phone: true } },
      services: { include: { service: { select: { name: true } } } },
      commission: { select: { amount: true, status: true } },
    },
    orderBy: { scheduledAt: 'asc' },
  })

  return Response.json({ appointments })
}
