import { format, eachDayOfInterval } from 'date-fns'
import { prisma } from '@/lib/prisma/client'
import { getSessionAdmin } from '@/lib/auth/admin'
import { resolveRange, type DateRange } from '@/lib/utils/period'

/** Faturamento agregado por dia — preenche dias sem venda com 0 (para o gráfico de linha). */
async function byDay(range: DateRange) {
  const appointments = await prisma.appointment.findMany({
    where: { status: 'COMPLETED', scheduledAt: range },
    select: { scheduledAt: true, totalPrice: true },
  })

  const buckets = new Map<string, number>()
  for (const a of appointments) {
    const key = format(a.scheduledAt, 'yyyy-MM-dd')
    buckets.set(key, (buckets.get(key) ?? 0) + a.totalPrice)
  }

  return eachDayOfInterval({ start: range.gte, end: range.lte }).map((d) => {
    const key = format(d, 'yyyy-MM-dd')
    return { date: key, revenue: Math.round((buckets.get(key) ?? 0) * 100) / 100 }
  })
}

/** Faturamento por serviço (para gráfico de pizza). */
async function byService(range: DateRange) {
  const grouped = await prisma.appointmentService.groupBy({
    by: ['serviceId'],
    where: { appointment: { status: 'COMPLETED', scheduledAt: range } },
    _sum: { price: true },
    _count: true,
    orderBy: { serviceId: 'asc' },
  })

  const services = await prisma.service.findMany({
    where: { id: { in: grouped.map((g) => g.serviceId) } },
    select: { id: true, name: true },
  })
  const nameById = new Map(services.map((s) => [s.id, s.name]))

  return grouped
    .map((g) => ({
      serviceName: nameById.get(g.serviceId) ?? 'Serviço removido',
      revenue: Math.round((g._sum.price ?? 0) * 100) / 100,
      count: g._count,
    }))
    .sort((a, b) => b.revenue - a.revenue)
}

/** Faturamento por barbeiro (para ranking). */
async function byBarber(range: DateRange) {
  const grouped = await prisma.appointment.groupBy({
    by: ['barberId'],
    where: { status: 'COMPLETED', scheduledAt: range },
    _sum: { totalPrice: true },
    _count: true,
    orderBy: { barberId: 'asc' },
  })

  const barbers = await prisma.barber.findMany({
    where: { id: { in: grouped.map((g) => g.barberId) } },
    select: { id: true, user: { select: { name: true } } },
  })
  const nameById = new Map(barbers.map((b) => [b.id, b.user.name]))

  return grouped
    .map((g) => ({
      barberName: nameById.get(g.barberId) ?? 'Barbeiro removido',
      revenue: Math.round((g._sum.totalPrice ?? 0) * 100) / 100,
      appointments: g._count,
    }))
    .sort((a, b) => b.revenue - a.revenue)
}

/**
 * GET /api/admin/metrics/revenue?groupBy=day|service|barber&period=&from=&to=
 */
export async function GET(req: Request) {
  const { admin, error } = await getSessionAdmin()
  if (error) return error
  void admin

  const { searchParams } = new URL(req.url)
  const groupBy = searchParams.get('groupBy') ?? 'day'
  const { range } = resolveRange(
    searchParams.get('period'),
    searchParams.get('from'),
    searchParams.get('to')
  )

  switch (groupBy) {
    case 'service':
      return Response.json({ data: await byService(range) })
    case 'barber':
      return Response.json({ data: await byBarber(range) })
    case 'day':
    default:
      return Response.json({ data: await byDay(range) })
  }
}
