import { prisma } from '@/lib/prisma/client'
import { getSessionAdmin } from '@/lib/auth/admin'
import { resolveRange, previousRange, pctChange, type DateRange } from '@/lib/utils/period'

interface OverviewBlock {
  totalRevenue: number
  totalAppointments: number
  averageTicket: number
  newClients: number
  returningClients: number
}

async function computeBlock(range: DateRange): Promise<OverviewBlock> {
  const [completedAgg, newClients, completedGrouped] = await Promise.all([
    prisma.appointment.aggregate({
      where: { status: 'COMPLETED', scheduledAt: range },
      _sum: { totalPrice: true },
      _count: { _all: true },
    }),
    prisma.user.count({
      where: { role: 'CLIENT', createdAt: range },
    }),
    // clientes com ≥2 atendimentos concluídos no período
    prisma.appointment.groupBy({
      by: ['clientId'],
      where: { status: 'COMPLETED', scheduledAt: range },
      _count: true,
      orderBy: { clientId: 'asc' },
    }),
  ])

  const totalRevenue = completedAgg._sum.totalPrice ?? 0
  const totalAppointments = completedAgg._count._all
  const returningClients = completedGrouped.filter((g) => g._count >= 2).length

  return {
    totalRevenue,
    totalAppointments,
    averageTicket: totalAppointments > 0 ? Math.round((totalRevenue / totalAppointments) * 100) / 100 : 0,
    newClients,
    returningClients,
  }
}

/**
 * GET /api/admin/metrics/overview?period=today|week|month&from=&to=
 * KPIs do dashboard com variação vs. período anterior (trend).
 */
export async function GET(req: Request) {
  const { admin, error } = await getSessionAdmin()
  if (error) return error
  void admin

  const { searchParams } = new URL(req.url)
  const now = new Date()
  const { period, range } = resolveRange(
    searchParams.get('period'),
    searchParams.get('from'),
    searchParams.get('to'),
    now
  )
  const prevRange = previousRange(period, range, now)

  // Taxa de ocupação: atendimentos concluídos vs. capacidade estimada.
  const [current, previous, activeBarbers] = await Promise.all([
    computeBlock(range),
    computeBlock(prevRange),
    prisma.barber.count({ where: { isActive: true } }),
  ])

  const days = Math.max(1, Math.ceil((range.lte.getTime() - range.gte.getTime()) / 86_400_000))
  // capacidade simplificada: 8h de trabalho / slots de 30min = 16 slots/dia por barbeiro
  const capacity = activeBarbers * 16 * days
  const occupancyRate = capacity > 0 ? Math.round((current.totalAppointments / capacity) * 100) : 0

  return Response.json({
    period,
    range: { from: range.gte.toISOString(), to: range.lte.toISOString() },
    kpis: {
      totalRevenue: current.totalRevenue,
      totalAppointments: current.totalAppointments,
      averageTicket: current.averageTicket,
      newClients: current.newClients,
      returningClients: current.returningClients,
      occupancyRate,
    },
    trends: {
      totalRevenue: pctChange(current.totalRevenue, previous.totalRevenue),
      totalAppointments: pctChange(current.totalAppointments, previous.totalAppointments),
      averageTicket: pctChange(current.averageTicket, previous.averageTicket),
      newClients: pctChange(current.newClients, previous.newClients),
    },
  })
}
