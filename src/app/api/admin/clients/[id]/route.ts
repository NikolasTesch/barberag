import { prisma } from '@/lib/prisma/client'
import { getSessionAdmin } from '@/lib/auth/admin'

interface Ctx {
  params: { id: string }
}

/** GET /api/admin/clients/[id] — perfil do cliente com histórico e estatísticas. */
export async function GET(_req: Request, { params }: Ctx) {
  const { admin, error } = await getSessionAdmin()
  if (error) return error
  void admin

  const client = await prisma.user.findFirst({
    where: { id: params.id, role: 'CLIENT' },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      image: true,
      createdAt: true,
      appointments: {
        select: {
          id: true,
          status: true,
          scheduledAt: true,
          totalPrice: true,
          barber: { select: { user: { select: { name: true } } } },
          services: { select: { service: { select: { name: true } } } },
        },
        orderBy: { scheduledAt: 'desc' },
      },
    },
  })

  if (!client) return Response.json({ error: 'Cliente não encontrado' }, { status: 404 })

  const completed = client.appointments.filter((a) => a.status === 'COMPLETED')
  const totalSpent = Math.round(completed.reduce((acc, a) => acc + a.totalPrice, 0) * 100) / 100

  // barbeiro favorito = mais atendimentos concluídos
  const barberFreq = new Map<string, number>()
  for (const a of completed) {
    const name = a.barber.user.name
    barberFreq.set(name, (barberFreq.get(name) ?? 0) + 1)
  }
  const favoriteBarber =
    Array.from(barberFreq.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null

  return Response.json({
    client: {
      id: client.id,
      name: client.name,
      email: client.email,
      phone: client.phone,
      image: client.image,
      createdAt: client.createdAt.toISOString(),
    },
    stats: {
      totalSpent,
      visitCount: completed.length,
      favoriteBarber,
    },
    appointments: client.appointments.map((a) => ({
      id: a.id,
      status: a.status,
      scheduledAt: a.scheduledAt.toISOString(),
      totalPrice: a.totalPrice,
      barberName: a.barber.user.name,
      services: a.services.map((s) => s.service.name),
    })),
  })
}
