import { prisma } from '@/lib/prisma/client'
import { getSessionAdmin } from '@/lib/auth/admin'
import { ConfigFormSchema } from '@/lib/validations/config'

/** GET /api/admin/config — config singleton + horário padrão da barbearia. */
export async function GET() {
  const { admin, error } = await getSessionAdmin()
  if (error) return error
  void admin

  const [config, defaultHours] = await Promise.all([
    prisma.barbershopConfig.findFirst(),
    prisma.workingHours.findMany({ where: { barberId: null } }),
  ])

  return Response.json({
    config: config
      ? {
          name: config.name,
          phone: config.phone,
          email: config.email,
          address: config.address,
          logoUrl: config.logoUrl,
          cancelPolicyHours: Math.round(config.cancelPolicy / 60),
        }
      : null,
    workingHours: defaultHours.map((w) => ({
      dayOfWeek: w.dayOfWeek,
      startTime: w.startTime,
      endTime: w.endTime,
      isActive: w.isActive,
    })),
  })
}

/** PATCH /api/admin/config — upsert do singleton + substituição do horário padrão. */
export async function PATCH(req: Request) {
  const { admin, error } = await getSessionAdmin()
  if (error) return error
  void admin

  const body = await req.json().catch(() => null)
  const parsed = ConfigFormSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const data = parsed.data

  await prisma.$transaction(async (tx) => {
    const existing = await tx.barbershopConfig.findFirst({ select: { id: true } })
    const configData = {
      name: data.name,
      phone: data.phone || null,
      email: data.email || null,
      address: data.address || null,
      logoUrl: data.logoUrl || null,
      cancelPolicy: Math.round(data.cancelPolicyHours * 60),
    }
    if (existing) {
      await tx.barbershopConfig.update({ where: { id: existing.id }, data: configData })
    } else {
      await tx.barbershopConfig.create({ data: configData })
    }

    // horário padrão da barbearia = WorkingHours com barberId null
    await tx.workingHours.deleteMany({ where: { barberId: null } })
    const activeDays = data.workingHours.filter((w) => w.isActive)
    if (activeDays.length > 0) {
      await tx.workingHours.createMany({
        data: activeDays.map((w) => ({
          barberId: null,
          dayOfWeek: w.dayOfWeek,
          startTime: w.startTime,
          endTime: w.endTime,
          isActive: true,
        })),
      })
    }
  })

  return Response.json({ ok: true })
}
