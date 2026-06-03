import { prisma } from '@/lib/prisma/client'
import { getSessionAdmin } from '@/lib/auth/admin'

/**
 * GET /api/admin/reviews?status=pending|published — moderação de avaliações.
 * Default: pendentes (isPublished=false).
 */
export async function GET(req: Request) {
  const { admin, error } = await getSessionAdmin()
  if (error) return error
  void admin

  const status = new URL(req.url).searchParams.get('status') ?? 'pending'
  const reviews = await prisma.review.findMany({
    where: { isPublished: status === 'published' },
    select: {
      id: true,
      rating: true,
      comment: true,
      isPublished: true,
      createdAt: true,
      client: { select: { name: true } },
      barber: { select: { user: { select: { name: true } } } },
      appointment: { select: { services: { select: { service: { select: { name: true } } } } } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return Response.json({
    reviews: reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      isPublished: r.isPublished,
      createdAt: r.createdAt.toISOString(),
      clientName: r.client.name,
      barberName: r.barber.user.name,
      services: r.appointment.services.map((s) => s.service.name),
    })),
  })
}
