import { prisma } from '@/lib/prisma/client'

/**
 * GET /api/barbers?serviceIds=id1,id2
 * Público. Lista barbeiros ativos que realizam TODOS os serviços pedidos,
 * com avaliação média. Sem serviceIds, lista todos os barbeiros ativos.
 */
export async function GET(req: Request) {
  const param = new URL(req.url).searchParams.get('serviceIds')
  const serviceIds = param ? param.split(',').filter(Boolean) : []

  const barbers = await prisma.barber.findMany({
    where: { isActive: true },
    include: {
      user: { select: { name: true, image: true } },
      barberServices: { select: { serviceId: true } },
      reviews: { select: { rating: true } },
    },
  })

  const result = barbers
    .filter((b) =>
      serviceIds.length === 0
        ? true
        : serviceIds.every((id) => b.barberServices.some((bs) => bs.serviceId === id))
    )
    .map((b) => {
      const ratings = b.reviews.map((r) => r.rating)
      const avgRating =
        ratings.length > 0
          ? Math.round((ratings.reduce((a, c) => a + c, 0) / ratings.length) * 10) / 10
          : null
      return {
        id: b.id,
        name: b.user.name,
        image: b.user.image,
        bio: b.bio,
        specialties: b.specialties,
        avgRating,
        reviewCount: ratings.length,
      }
    })

  return Response.json({ barbers: result })
}
