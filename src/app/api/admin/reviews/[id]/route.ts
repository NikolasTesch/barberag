import { prisma } from '@/lib/prisma/client'
import { getSessionAdmin } from '@/lib/auth/admin'

interface Ctx {
  params: { id: string }
}

/** PATCH /api/admin/reviews/[id] { action: 'publish' } — publica a avaliação. */
export async function PATCH(req: Request, { params }: Ctx) {
  const { admin, error } = await getSessionAdmin()
  if (error) return error
  void admin

  const existing = await prisma.review.findUnique({ where: { id: params.id }, select: { id: true } })
  if (!existing) return Response.json({ error: 'Avaliação não encontrada' }, { status: 404 })

  const body = await req.json().catch(() => null)
  const publish = body?.action === 'publish'

  await prisma.review.update({
    where: { id: params.id },
    data: { isPublished: publish },
  })
  return Response.json({ ok: true })
}

/** DELETE /api/admin/reviews/[id] — rejeita (remove) a avaliação. */
export async function DELETE(_req: Request, { params }: Ctx) {
  const { admin, error } = await getSessionAdmin()
  if (error) return error
  void admin

  const existing = await prisma.review.findUnique({ where: { id: params.id }, select: { id: true } })
  if (!existing) return Response.json({ error: 'Avaliação não encontrada' }, { status: 404 })

  await prisma.review.delete({ where: { id: params.id } })
  return Response.json({ ok: true })
}
