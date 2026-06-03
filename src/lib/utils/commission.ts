import type { Prisma, Commission, PaymentMethod } from '@prisma/client'

/** Taxa de fallback quando não há NENHUMA CommissionRule cadastrada. */
export const DEFAULT_COMMISSION_RATE = 0.3

export interface RuleLike {
  barberId: string | null
  serviceId: string | null
  paymentMethod: PaymentMethod | null
  rate: number
  priority: number
}

export interface CommissionContext {
  barberId: string
  serviceIds: string[]
  paymentMethod: PaymentMethod | null
}

/**
 * Núcleo puro da hierarquia de comissão (RN-03). Recebe as regras e o contexto
 * do atendimento e devolve a taxa vencedora + a regra aplicada. Campos nulos na
 * regra atuam como curinga; vence a regra de MAIOR `priority` que casa.
 *
 * Reutilizado por `calculateCommission` (persistência) e pelo simulador da UI —
 * garante que preview e cálculo real nunca divirjam.
 */
export function selectCommissionRate(
  rules: RuleLike[],
  ctx: CommissionContext
): { rate: number; rule: RuleLike | null } {
  const matching = rules
    .filter((rule) => {
      const barberOk = rule.barberId === null || rule.barberId === ctx.barberId
      const serviceOk = rule.serviceId === null || ctx.serviceIds.includes(rule.serviceId)
      const paymentOk = rule.paymentMethod === null || rule.paymentMethod === ctx.paymentMethod
      return barberOk && serviceOk && paymentOk
    })
    .sort((a, b) => b.priority - a.priority)

  const winner = matching[0] ?? null
  return { rate: winner?.rate ?? DEFAULT_COMMISSION_RATE, rule: winner }
}

/**
 * Calcula e persiste a comissão de um atendimento concluído (RN-03 / RN-06).
 * Deve ser chamada DENTRO da transaction que muda o status para COMPLETED, para
 * garantir atomicidade — se a criação da comissão falhar, o status não muda.
 *
 * Regra vencedora = a CommissionRule de MAIOR `priority` cujos campos definidos
 * (barberId, serviceId, paymentMethod) batem com o contexto do agendamento.
 * Campos nulos na regra atuam como curinga.
 */
export async function calculateCommission(
  tx: Prisma.TransactionClient,
  appointmentId: string
): Promise<Commission> {
  const appointment = await tx.appointment.findUniqueOrThrow({
    where: { id: appointmentId },
    select: {
      barberId: true,
      totalPrice: true,
      paymentMethod: true,
      services: { select: { serviceId: true } },
    },
  })

  const serviceIds = appointment.services.map((s) => s.serviceId)
  const rules = await tx.commissionRule.findMany()

  const { rate } = selectCommissionRate(rules, {
    barberId: appointment.barberId,
    serviceIds,
    paymentMethod: appointment.paymentMethod,
  })
  const amount = Math.round(rate * appointment.totalPrice * 100) / 100

  return tx.commission.create({
    data: {
      appointmentId,
      barberId: appointment.barberId,
      amount,
      rate,
      status: 'PENDING',
    },
  })
}
