import { prisma } from '@/lib/prisma/client'
import { getServerSession } from '@/lib/auth/helpers'

export async function GET() {
  const session = await getServerSession()
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const clientId = session.user.id

  const [userRecord, completed] = await Promise.all([
    prisma.user.findUnique({
      where: { id: clientId },
      select: { name: true, email: true, phone: true, image: true },
    }),
    prisma.appointment.findMany({
      where: { clientId, status: 'COMPLETED' },
      include: {
        barber: { include: { user: { select: { name: true } } } },
        services: { include: { service: { select: { name: true } } } },
      },
      orderBy: { scheduledAt: 'desc' },
    }),
  ])

  const totalVisits = completed.length
  const totalSpent = completed.reduce((acc, a) => acc + a.totalPrice, 0)

  const barberCount = new Map<string, number>()
  completed.forEach((a) => {
    const name = a.barber.user.name
    barberCount.set(name, (barberCount.get(name) ?? 0) + 1)
  })
  const barberEntries = Array.from(barberCount.entries())
  const favoriteBarber =
    barberEntries.sort((a, b) => b[1] - a[1])[0]?.[0] ?? null

  const loyaltyCount = totalVisits % 10

  const recentHistory = completed.slice(0, 5).map((a) => ({
    id: a.id,
    scheduledAt: a.scheduledAt.toISOString(),
    services: a.services.map((s) => s.service.name).join(' + '),
    barberName: a.barber.user.name,
    totalPrice: a.totalPrice,
  }))

  return Response.json({
    user: userRecord,
    stats: { totalVisits, totalSpent, favoriteBarber, loyaltyCount },
    recentHistory,
  })
}
