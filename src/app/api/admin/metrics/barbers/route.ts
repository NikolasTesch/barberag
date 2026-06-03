import { prisma } from '@/lib/prisma/client'
import { getSessionAdmin } from '@/lib/auth/admin'
import { resolveRange } from '@/lib/utils/period'

/**
 * GET /api/admin/metrics/barbers?period=&from=&to=
 * Métricas por barbeiro: atendimentos, faturamento, ticket médio, avaliação
 * média e comissão pendente. Usado no ranking e na visão de equipe do admin.
 */
export async function GET(req: Request) {
  const { admin, error } = await getSessionAdmin()
  if (error) return error
  void admin

  const { searchParams } = new URL(req.url)
  const { range } = resolveRange(
    searchParams.get('period'),
    searchParams.get('from'),
    searchParams.get('to')
  )

  const barbers = await prisma.barber.findMany({
    where: { isActive: true },
    select: { id: true, user: { select: { name: true, image: true } } },
  })
  const barberIds = barbers.map((b) => b.id)

  const [revenueGrouped, ratingGrouped, pendingGrouped] = await Promise.all([
    prisma.appointment.groupBy({
      by: ['barberId'],
      where: { barberId: { in: barberIds }, status: 'COMPLETED', scheduledAt: range },
      _sum: { totalPrice: true },
      _count: true,
      orderBy: { barberId: 'asc' },
    }),
    prisma.review.groupBy({
      by: ['barberId'],
      where: { barberId: { in: barberIds }, createdAt: range },
      _avg: { rating: true },
      _count: true,
      orderBy: { barberId: 'asc' },
    }),
    prisma.commission.groupBy({
      by: ['barberId'],
      where: { barberId: { in: barberIds }, status: 'PENDING' },
      _sum: { amount: true },
      orderBy: { barberId: 'asc' },
    }),
  ])

  const revById = new Map(revenueGrouped.map((g) => [g.barberId, g]))
  const ratingById = new Map(ratingGrouped.map((g) => [g.barberId, g]))
  const pendingById = new Map(pendingGrouped.map((g) => [g.barberId, g]))

  const data = barbers
    .map((b) => {
      const rev = revById.get(b.id)
      const totalRevenue = Math.round((rev?._sum.totalPrice ?? 0) * 100) / 100
      const appointments = rev?._count ?? 0
      const rating = ratingById.get(b.id)
      return {
        barberId: b.id,
        name: b.user.name,
        image: b.user.image,
        appointments,
        totalRevenue,
        averageTicket: appointments > 0 ? Math.round((totalRevenue / appointments) * 100) / 100 : 0,
        averageRating: rating?._avg.rating != null ? Math.round(rating._avg.rating * 10) / 10 : null,
        reviewCount: rating?._count ?? 0,
        commissionPending: Math.round((pendingById.get(b.id)?._sum.amount ?? 0) * 100) / 100,
      }
    })
    .sort((a, b) => b.totalRevenue - a.totalRevenue)

  return Response.json({ data })
}
