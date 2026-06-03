import { prisma } from '@/lib/prisma/client'
import { getSessionAdmin } from '@/lib/auth/admin'
import { CommissionRuleSchema } from '@/lib/validations/commission'

interface Ctx {
  params: { id: string }
}

/** PATCH /api/admin/commissions/rules/[id] — atualiza a taxa da regra. */
export async function PATCH(req: Request, { params }: Ctx) {
  const { admin, error } = await getSessionAdmin()
  if (error) return error
  void admin

  const existing = await prisma.commissionRule.findUnique({ where: { id: params.id }, select: { id: true } })
  if (!existing) return Response.json({ error: 'Regra não encontrada' }, { status: 404 })

  const body = await req.json().catch(() => null)
  const parsed = CommissionRuleSchema.pick({ ratePercent: true }).safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  await prisma.commissionRule.update({
    where: { id: params.id },
    data: { rate: parsed.data.ratePercent / 100 },
  })
  return Response.json({ ok: true })
}

/** DELETE /api/admin/commissions/rules/[id] — remove a regra. */
export async function DELETE(_req: Request, { params }: Ctx) {
  const { admin, error } = await getSessionAdmin()
  if (error) return error
  void admin

  const existing = await prisma.commissionRule.findUnique({ where: { id: params.id }, select: { id: true } })
  if (!existing) return Response.json({ error: 'Regra não encontrada' }, { status: 404 })

  await prisma.commissionRule.delete({ where: { id: params.id } })
  return Response.json({ ok: true }, { status: 200 })
}
