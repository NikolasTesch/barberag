import { prisma } from '@/lib/prisma/client'
import { getSessionAdmin } from '@/lib/auth/admin'
import { ServiceFormSchema } from '@/lib/validations/service'

interface Ctx {
  params: { id: string }
}

/** GET /api/admin/services/[id] — dados para o formulário de edição. */
export async function GET(_req: Request, { params }: Ctx) {
  const { admin, error } = await getSessionAdmin()
  if (error) return error
  void admin

  const service = await prisma.service.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      description: true,
      category: true,
      durationMinutes: true,
      basePrice: true,
      isActive: true,
      barberServices: { select: { barberId: true, customPrice: true } },
    },
  })
  if (!service) return Response.json({ error: 'Serviço não encontrado' }, { status: 404 })
  return Response.json({ service })
}

/**
 * PATCH /api/admin/services/[id]
 * - { action: 'set-active', isActive } → ativa/desativa (soft delete).
 *   Ao desativar, bloqueia se houver agendamentos futuros usando o serviço.
 * - caso contrário → edição completa + sincronização de BarberService.
 */
export async function PATCH(req: Request, { params }: Ctx) {
  const { admin, error } = await getSessionAdmin()
  if (error) return error
  void admin

  const existing = await prisma.service.findUnique({ where: { id: params.id }, select: { id: true } })
  if (!existing) return Response.json({ error: 'Serviço não encontrado' }, { status: 404 })

  const body = await req.json().catch(() => null)

  if (body && body.action === 'set-active') {
    const isActive = Boolean(body.isActive)
    if (!isActive) {
      const futureCount = await prisma.appointment.count({
        where: {
          status: { in: ['SCHEDULED', 'CONFIRMED'] },
          scheduledAt: { gte: new Date() },
          services: { some: { serviceId: params.id } },
        },
      })
      if (futureCount > 0) {
        return Response.json(
          { error: { formErrors: [`Há ${futureCount} agendamento(s) futuro(s) com este serviço.`], fieldErrors: {} } },
          { status: 409 }
        )
      }
    }
    await prisma.service.update({ where: { id: params.id }, data: { isActive } })
    return Response.json({ ok: true })
  }

  const parsed = ServiceFormSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const data = parsed.data

  await prisma.$transaction(async (tx) => {
    await tx.service.update({
      where: { id: params.id },
      data: {
        name: data.name,
        description: data.description || null,
        category: data.category,
        durationMinutes: data.durationMinutes,
        basePrice: data.basePrice,
      },
    })
    // Sincroniza vínculos: substitui o conjunto inteiro.
    await tx.barberService.deleteMany({ where: { serviceId: params.id } })
    if (data.barbers.length > 0) {
      await tx.barberService.createMany({
        data: data.barbers.map((b) => ({
          serviceId: params.id,
          barberId: b.barberId,
          customPrice: b.customPrice ?? null,
        })),
      })
    }
  })

  return Response.json({ ok: true })
}
