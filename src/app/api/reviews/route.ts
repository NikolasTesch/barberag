import { prisma } from '@/lib/prisma/client'
import { SubmitReviewSchema } from '@/lib/validations/review'

const SEVENTY_TWO_HOURS_MS = 72 * 60 * 60 * 1000

/**
 * POST /api/reviews — submissão pública de avaliação via token único (sem login).
 * O token é a própria autenticação. Cria Review com isPublished=false (moderação
 * do admin) e limpa o reviewToken do Appointment para impedir reuso.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const parsed = SubmitReviewSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const { token, rating, comment } = parsed.data

  const appointment = await prisma.appointment.findUnique({
    where: { reviewToken: token },
    select: {
      id: true,
      clientId: true,
      barberId: true,
      scheduledAt: true,
      review: { select: { id: true } },
    },
  })

  if (!appointment) {
    return Response.json({ error: 'Link inválido ou já utilizado' }, { status: 404 })
  }
  if (appointment.review) {
    return Response.json({ error: 'Este atendimento já foi avaliado' }, { status: 409 })
  }
  if (Date.now() - appointment.scheduledAt.getTime() > SEVENTY_TWO_HOURS_MS) {
    return Response.json({ error: 'Link expirado' }, { status: 410 })
  }

  await prisma.$transaction(async (tx) => {
    await tx.review.create({
      data: {
        appointmentId: appointment.id,
        clientId: appointment.clientId,
        barberId: appointment.barberId,
        rating,
        comment: comment || null,
        isPublished: false,
      },
    })
    // invalida o token para não permitir reuso
    await tx.appointment.update({
      where: { id: appointment.id },
      data: { reviewToken: null },
    })
  })

  return Response.json({ ok: true }, { status: 201 })
}
