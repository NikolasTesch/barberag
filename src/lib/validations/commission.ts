import { z } from 'zod'

const PAYMENT_METHODS = ['CASH', 'PIX', 'DEBIT', 'CREDIT'] as const

/** Forma de pagamento do repasse ao barbeiro (não confundir com a do atendimento). */
export const PAYOUT_METHODS = ['PIX', 'CASH', 'TRANSFER'] as const
export const PAYOUT_METHOD_LABELS: Record<(typeof PAYOUT_METHODS)[number], string> = {
  PIX: 'Pix',
  CASH: 'Dinheiro',
  TRANSFER: 'Transferência',
}

/** Regra de comissão (RN-03). `ratePercent` em 0–100; a API converte para fração. */
export const CommissionRuleSchema = z.object({
  barberId: z.string().min(1).nullable().optional(),
  serviceId: z.string().min(1).nullable().optional(),
  paymentMethod: z.enum(PAYMENT_METHODS).nullable().optional(),
  ratePercent: z.number().min(0, 'Mínimo 0%').max(100, 'Máximo 100%'),
})

export const PayCommissionSchema = z.object({
  barberId: z.string().min(1, 'Barbeiro obrigatório'),
  paymentMethod: z.enum(PAYOUT_METHODS),
  paidAt: z.coerce.date(),
  notes: z.string().max(300).optional().or(z.literal('')),
})

export type CommissionRuleInput = z.infer<typeof CommissionRuleSchema>
export type PayCommissionInput = z.infer<typeof PayCommissionSchema>
