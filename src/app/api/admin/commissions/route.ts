import { prisma } from '@/lib/prisma/client'
import { getSessionAdmin } from '@/lib/auth/admin'

/**
 * GET /api/admin/commissions — comissões PENDENTES agrupadas por barbeiro,
 * para a tela de fechamento. Cada barbeiro traz total e detalhamento.
 */
export async function GET() {
  const { admin, error } = await getSessionAdmin()
  if (error) return error
  void admin

  const pending = await prisma.commission.findMany({
    where: { status: 'PENDING' },
    select: {
      id: true,
      barberId: true,
      amount: true,
      rate: true,
      createdAt: true,
      barber: { select: { user: { select: { name: true } } } },
      appointment: {
        select: {
          scheduledAt: true,
          completedAt: true,
          paymentMethod: true,
          client: { select: { name: true } },
          services: { select: { service: { select: { name: true } } } },
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  })

  const byBarber = new Map<
    string,
    { barberId: string; barberName: string; total: number; commissions: unknown[] }
  >()

  for (const c of pending) {
    let group = byBarber.get(c.barberId)
    if (!group) {
      group = { barberId: c.barberId, barberName: c.barber.user.name, total: 0, commissions: [] }
      byBarber.set(c.barberId, group)
    }
    group.total = Math.round((group.total + c.amount) * 100) / 100
    group.commissions.push({
      id: c.id,
      amount: c.amount,
      rate: c.rate,
      date: c.appointment.scheduledAt.toISOString(),
      completedAt: c.appointment.completedAt?.toISOString() ?? null,
      clientName: c.appointment.client.name,
      paymentMethod: c.appointment.paymentMethod,
      services: c.appointment.services.map((s) => s.service.name),
    })
  }

  return Response.json({ groups: Array.from(byBarber.values()).sort((a, b) => b.total - a.total) })
}
