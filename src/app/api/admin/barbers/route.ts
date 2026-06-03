import { randomBytes } from 'crypto'
import bcrypt from 'bcryptjs'
import { startOfMonth, endOfMonth } from 'date-fns'
import { prisma } from '@/lib/prisma/client'
import { getSessionAdmin } from '@/lib/auth/admin'
import { BarberFormSchema } from '@/lib/validations/barber'
import { sendBarberWelcomeEmail } from '@/lib/notifications/email'

/** GET /api/admin/barbers — listagem com contagem de serviços e atendimentos do mês. */
export async function GET() {
  const { admin, error } = await getSessionAdmin()
  if (error) return error
  void admin

  const now = new Date()
  const barbers = await prisma.barber.findMany({
    select: {
      id: true,
      isActive: true,
      commissionRate: true,
      specialties: true,
      user: { select: { id: true, name: true, email: true, phone: true, image: true } },
      _count: { select: { barberServices: true } },
      appointments: {
        where: {
          status: 'COMPLETED',
          scheduledAt: { gte: startOfMonth(now), lte: endOfMonth(now) },
        },
        select: { id: true },
      },
    },
    orderBy: { user: { name: 'asc' } },
  })

  return Response.json({
    barbers: barbers.map((b) => ({
      id: b.id,
      name: b.user.name,
      email: b.user.email,
      phone: b.user.phone,
      image: b.user.image,
      isActive: b.isActive,
      commissionRate: b.commissionRate,
      specialties: b.specialties,
      serviceCount: b._count.barberServices,
      monthAppointments: b.appointments.length,
    })),
  })
}

/** POST /api/admin/barbers — cria User(BARBER) + Barber + serviços + horários. */
export async function POST(req: Request) {
  const { admin, error } = await getSessionAdmin()
  if (error) return error
  void admin

  const body = await req.json().catch(() => null)
  const parsed = BarberFormSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const data = parsed.data

  const existing = await prisma.user.findUnique({ where: { email: data.email } })
  if (existing) {
    return Response.json(
      { error: { formErrors: ['Já existe um usuário com este e-mail.'], fieldErrors: {} } },
      { status: 409 }
    )
  }

  const tempPassword = randomBytes(6).toString('base64url').slice(0, 10)
  const passwordHash = await bcrypt.hash(tempPassword, 10)

  const barber = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        image: data.image || null,
        passwordHash,
        role: 'BARBER',
      },
    })

    const created = await tx.barber.create({
      data: {
        userId: user.id,
        bio: data.bio || null,
        specialties: data.specialties,
        commissionRate: data.commissionPercent / 100,
        isActive: true,
      },
    })

    if (data.services.length > 0) {
      await tx.barberService.createMany({
        data: data.services.map((s) => ({
          barberId: created.id,
          serviceId: s.serviceId,
          customPrice: s.customPrice ?? null,
        })),
      })
    }

    const activeDays = data.workingHours.filter((w) => w.isActive)
    if (activeDays.length > 0) {
      await tx.workingHours.createMany({
        data: activeDays.map((w) => ({
          barberId: created.id,
          dayOfWeek: w.dayOfWeek,
          startTime: w.startTime,
          endTime: w.endTime,
          isActive: true,
        })),
      })
    }

    return created
  })

  // fire-and-forget: falha de e-mail não quebra a criação
  void sendBarberWelcomeEmail({ to: data.email, barberName: data.name, tempPassword })

  return Response.json({ id: barber.id }, { status: 201 })
}
