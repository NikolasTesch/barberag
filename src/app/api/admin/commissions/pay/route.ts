import { prisma } from '@/lib/prisma/client'
import { getSessionAdmin } from '@/lib/auth/admin'
import { PayCommissionSchema, PAYOUT_METHOD_LABELS } from '@/lib/validations/commission'

/**
 * POST /api/admin/commissions/pay — fecha (marca como PAID) todas as comissões
 * PENDENTES de um barbeiro em lote. Grava paidAt, paidById (admin) e nota.
 */
export async function POST(req: Request) {
  const { admin, error } = await getSessionAdmin()
  if (error) return error

  const body = await req.json().catch(() => null)
  const parsed = PayCommissionSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const { barberId, paymentMethod, paidAt, notes } = parsed.data

  const note = [`Repasse via ${PAYOUT_METHOD_LABELS[paymentMethod]}`, notes]
    .filter(Boolean)
    .join(' — ')

  // Leitura + escrita na mesma transaction: o total cobrado bate exatamente com
  // o conjunto marcado como PAID, sem brecha p/ comissão criada nesse intervalo.
  const payout = await prisma.$transaction(async (tx) => {
    const pending = await tx.commission.findMany({
      where: { barberId, status: 'PENDING' },
      select: { amount: true },
    })
    if (pending.length === 0) return null

    const total = Math.round(pending.reduce((acc, c) => acc + c.amount, 0) * 100) / 100
    const result = await tx.commission.updateMany({
      where: { barberId, status: 'PENDING' },
      data: { status: 'PAID', paidAt, paidById: admin.id, paymentNote: note },
    })
    return { count: result.count, total }
  })

  if (!payout) {
    return Response.json({ error: 'Nenhuma comissão pendente para este barbeiro.' }, { status: 409 })
  }

  return Response.json(payout)
}
