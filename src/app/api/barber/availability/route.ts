import { startOfDay } from 'date-fns'
import { prisma } from '@/lib/prisma/client'
import { getSessionBarber } from '@/lib/auth/barber'
import { UpdateAvailabilitySchema } from '@/lib/validations/availability'

/** GET /api/barber/availability — WorkingHours + BlockedSlots futuros do barbeiro logado. */
export async function GET() {
  const { barber, error } = await getSessionBarber()
  if (error) return error

  const [workingHours, blockedSlots] = await Promise.all([
    prisma.workingHours.findMany({ where: { barberId: barber.id } }),
    prisma.blockedSlot.findMany({
      where: { barberId: barber.id, date: { gte: startOfDay(new Date()) } },
      orderBy: { date: 'asc' },
    }),
  ])

  return Response.json({ workingHours, blockedSlots })
}

/** PATCH /api/barber/availability — substitui horários e adiciona bloqueios. */
export async function PATCH(req: Request) {
  const { barber, error } = await getSessionBarber()
  if (error) return error

  const body = await req.json().catch(() => null)
  const parsed = UpdateAvailabilitySchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const { workingHours, blockedSlots } = parsed.data

  await prisma.$transaction(async (tx) => {
    if (workingHours) {
      // Upsert por substituição: limpa os horários do barbeiro e recria.
      await tx.workingHours.deleteMany({ where: { barberId: barber.id } })
      if (workingHours.length > 0) {
        await tx.workingHours.createMany({
          data: workingHours.map((w) => ({ ...w, barberId: barber.id })),
        })
      }
    }
    if (blockedSlots && blockedSlots.length > 0) {
      await tx.blockedSlot.createMany({
        data: blockedSlots.map((b) => ({
          barberId: barber.id,
          date: b.date,
          allDay: b.allDay,
          startTime: b.startTime,
          endTime: b.endTime,
          reason: b.reason,
        })),
      })
    }
  })

  return Response.json({ ok: true })
}
