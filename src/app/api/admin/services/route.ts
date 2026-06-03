import { prisma } from '@/lib/prisma/client'
import { getSessionAdmin } from '@/lib/auth/admin'
import { ServiceFormSchema } from '@/lib/validations/service'

/** GET /api/admin/services — catálogo completo (ativos e inativos). */
export async function GET() {
  const { admin, error } = await getSessionAdmin()
  if (error) return error
  void admin

  const services = await prisma.service.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      category: true,
      durationMinutes: true,
      basePrice: true,
      isActive: true,
      _count: { select: { barberServices: true } },
    },
    orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
  })

  return Response.json({
    services: services.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      category: s.category,
      durationMinutes: s.durationMinutes,
      basePrice: s.basePrice,
      isActive: s.isActive,
      barberCount: s._count.barberServices,
    })),
  })
}

/** POST /api/admin/services — cria Service + vínculos BarberService. */
export async function POST(req: Request) {
  const { admin, error } = await getSessionAdmin()
  if (error) return error
  void admin

  const body = await req.json().catch(() => null)
  const parsed = ServiceFormSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const data = parsed.data

  const service = await prisma.$transaction(async (tx) => {
    const created = await tx.service.create({
      data: {
        name: data.name,
        description: data.description || null,
        category: data.category,
        durationMinutes: data.durationMinutes,
        basePrice: data.basePrice,
        isActive: true,
      },
    })
    if (data.barbers.length > 0) {
      await tx.barberService.createMany({
        data: data.barbers.map((b) => ({
          serviceId: created.id,
          barberId: b.barberId,
          customPrice: b.customPrice ?? null,
        })),
      })
    }
    return created
  })

  return Response.json({ id: service.id }, { status: 201 })
}
