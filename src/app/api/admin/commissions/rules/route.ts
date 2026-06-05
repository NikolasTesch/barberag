import { prisma } from '@/lib/prisma/client'
import { getSessionAdmin } from '@/lib/auth/admin'
import { CommissionRuleSchema } from '@/lib/validations/commission'

/**
 * Especificidade ponderada (RN-03): barbeiro (4) > serviço (2) > pagamento (1).
 * Ordem TOTAL, sem empates entre conjuntos de campos diferentes. Persistida em
 * `priority` apenas para ordenação de exibição — a seleção real usa
 * `ruleSpecificity` calculada dos campos (ver commission.ts).
 */
function derivePriority(r: { barberId?: string | null; serviceId?: string | null; paymentMethod?: string | null }): number {
  return (r.barberId ? 4 : 0) + (r.serviceId ? 2 : 0) + (r.paymentMethod ? 1 : 0)
}

/** GET /api/admin/commissions/rules — todas as regras com nomes resolvidos. */
export async function GET() {
  const { admin, error } = await getSessionAdmin()
  if (error) return error
  void admin

  const [rules, barbers, services] = await Promise.all([
    prisma.commissionRule.findMany({ orderBy: { priority: 'desc' } }),
    prisma.barber.findMany({ select: { id: true, user: { select: { name: true } } } }),
    prisma.service.findMany({ select: { id: true, name: true } }),
  ])
  const barberName = new Map(barbers.map((b) => [b.id, b.user.name]))
  const serviceName = new Map(services.map((s) => [s.id, s.name]))

  return Response.json({
    rules: rules.map((r) => ({
      id: r.id,
      barberId: r.barberId,
      barberName: r.barberId ? barberName.get(r.barberId) ?? '—' : null,
      serviceId: r.serviceId,
      serviceName: r.serviceId ? serviceName.get(r.serviceId) ?? '—' : null,
      paymentMethod: r.paymentMethod,
      rate: r.rate,
      priority: r.priority,
    })),
  })
}

/** POST /api/admin/commissions/rules — cria regra. A regra padrão (tudo null) é única. */
export async function POST(req: Request) {
  const { admin, error } = await getSessionAdmin()
  if (error) return error
  void admin

  const body = await req.json().catch(() => null)
  const parsed = CommissionRuleSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const { barberId, serviceId, paymentMethod, ratePercent } = parsed.data
  const rate = ratePercent / 100
  const priority = derivePriority({ barberId, serviceId, paymentMethod })

  // Regra padrão (tudo null) é singleton: faz upsert lógico.
  if (priority === 0) {
    const existingDefault = await prisma.commissionRule.findFirst({
      where: { barberId: null, serviceId: null, paymentMethod: null },
    })
    if (existingDefault) {
      const updated = await prisma.commissionRule.update({
        where: { id: existingDefault.id },
        data: { rate },
      })
      return Response.json({ id: updated.id }, { status: 200 })
    }
  }

  const created = await prisma.commissionRule.create({
    data: {
      barberId: barberId ?? null,
      serviceId: serviceId ?? null,
      paymentMethod: paymentMethod ?? null,
      rate,
      priority,
    },
  })

  return Response.json({ id: created.id }, { status: 201 })
}
