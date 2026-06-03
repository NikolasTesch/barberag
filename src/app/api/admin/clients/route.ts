import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma/client'
import { getSessionAdmin } from '@/lib/auth/admin'

const PAGE_SIZE = 20

/**
 * GET /api/admin/clients?q=&page=1
 * Listagem paginada de clientes com busca server-side por nome, e-mail ou telefone.
 */
export async function GET(req: Request) {
  const { admin, error } = await getSessionAdmin()
  if (error) return error
  void admin

  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim() ?? ''
  const page = Math.max(1, Number(searchParams.get('page') ?? '1') || 1)

  const where: Prisma.UserWhereInput = { role: 'CLIENT' }
  if (q) {
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { email: { contains: q, mode: 'insensitive' } },
      { phone: { contains: q, mode: 'insensitive' } },
    ]
  }

  const [total, clients] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        createdAt: true,
        _count: { select: { appointments: true } },
        appointments: {
          where: { status: 'COMPLETED' },
          select: { scheduledAt: true },
          orderBy: { scheduledAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { name: 'asc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ])

  return Response.json({
    page,
    pageSize: PAGE_SIZE,
    total,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    clients: clients.map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      image: c.image,
      createdAt: c.createdAt.toISOString(),
      appointmentCount: c._count.appointments,
      lastVisit: c.appointments[0]?.scheduledAt.toISOString() ?? null,
    })),
  })
}
