import { startOfDay, endOfDay } from 'date-fns'
import { prisma } from '@/lib/prisma/client'
import { getSessionAdmin } from '@/lib/auth/admin'

/**
 * GET /api/admin/occupancy?date=YYYY-MM-DD
 * Visão de ocupação do dia para TODOS os barbeiros ativos — alimenta o grid
 * em tempo real do dashboard. Admin enxerga tudo (RN-04).
 */
export async function GET(req: Request) {
  const { admin, error } = await getSessionAdmin()
  if (error) return error
  void admin

  const dateParam = new URL(req.url).searchParams.get('date')
  const base = dateParam ? new Date(`${dateParam}T00:00:00`) : new Date()
  if (isNaN(base.getTime())) {
    return Response.json({ error: 'Data inválida' }, { status: 400 })
  }

  const [barbers, appointments] = await Promise.all([
    prisma.barber.findMany({
      where: { isActive: true },
      select: { id: true, user: { select: { name: true, image: true } } },
      orderBy: { user: { name: 'asc' } },
    }),
    prisma.appointment.findMany({
      where: {
        scheduledAt: { gte: startOfDay(base), lte: endOfDay(base) },
        status: { not: 'CANCELLED' },
      },
      select: {
        id: true,
        barberId: true,
        status: true,
        scheduledAt: true,
        totalDuration: true,
        client: { select: { name: true } },
        services: { select: { service: { select: { name: true } } } },
      },
      orderBy: { scheduledAt: 'asc' },
    }),
  ])

  return Response.json({
    barbers: barbers.map((b) => ({ id: b.id, name: b.user.name, image: b.user.image })),
    appointments: appointments.map((a) => ({
      id: a.id,
      barberId: a.barberId,
      status: a.status,
      scheduledAt: a.scheduledAt.toISOString(),
      totalDuration: a.totalDuration,
      clientName: a.client.name,
      services: a.services.map((s) => s.service.name),
    })),
  })
}
