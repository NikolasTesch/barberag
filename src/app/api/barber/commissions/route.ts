import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'
import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma/client'
import { getSessionBarber } from '@/lib/auth/barber'

/** GET /api/barber/commissions?period=today|week|month|custom&from=&to= */
export async function GET(req: Request) {
  const { barber, error } = await getSessionBarber()
  if (error) return error

  const { searchParams } = new URL(req.url)
  const period = searchParams.get('period') ?? 'month'
  const now = new Date()

  let range: { gte: Date; lte: Date } | undefined
  if (period === 'today') range = { gte: startOfDay(now), lte: endOfDay(now) }
  else if (period === 'week') range = { gte: startOfWeek(now), lte: endOfWeek(now) }
  else if (period === 'month') range = { gte: startOfMonth(now), lte: endOfMonth(now) }
  else if (period === 'custom') {
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    if (from && to) range = { gte: startOfDay(new Date(from)), lte: endOfDay(new Date(to)) }
  }

  const where: Prisma.CommissionWhereInput = { barberId: barber.id }
  if (range) where.createdAt = range

  const commissions = await prisma.commission.findMany({
    where,
    include: {
      appointment: {
        select: {
          scheduledAt: true,
          paymentMethod: true,
          client: { select: { name: true } },
          services: { select: { service: { select: { name: true } } } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const summary = commissions.reduce(
    (acc, c) => {
      acc.totalAll += c.amount
      if (c.status === 'PAID') acc.totalPaid += c.amount
      else acc.totalPending += c.amount
      return acc
    },
    { totalPending: 0, totalPaid: 0, totalAll: 0 }
  )

  return Response.json({ commissions, summary })
}
