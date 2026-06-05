import { describe, it, expect, vi } from 'vitest'
import {
  calculateCommission,
  selectCommissionRate,
  ruleSpecificity,
  DEFAULT_COMMISSION_RATE,
  type RuleLike,
} from '@/lib/utils/commission'

interface Appt {
  barberId: string
  totalPrice: number
  paymentMethod: string | null
  services: { serviceId: string }[]
}

interface Rule {
  barberId: string | null
  serviceId: string | null
  paymentMethod: string | null
  rate: number
  priority: number
}

/** Cria um tx Prisma falso que devolve o appointment e as rules informados. */
function fakeTx(appt: Appt, rules: Rule[]) {
  const create = vi.fn(async ({ data }: { data: unknown }) => data)
  const tx = {
    appointment: { findUniqueOrThrow: vi.fn(async () => appt) },
    commissionRule: {
      findMany: vi.fn(async () => [...rules].sort((a, b) => b.priority - a.priority)),
    },
    commission: { create },
  }
  return { tx: tx as never, create }
}

const baseAppt: Appt = {
  barberId: 'rafael',
  totalPrice: 55,
  paymentMethod: 'PIX',
  services: [{ serviceId: 'combo' }],
}

describe('calculateCommission — hierarquia de regras', () => {
  it('aplica priority 4 (barbeiro+serviço+pagamento) quando tudo bate', async () => {
    const { tx, create } = fakeTx(baseAppt, [
      { barberId: null, serviceId: null, paymentMethod: null, rate: 0.3, priority: 1 },
      { barberId: 'rafael', serviceId: null, paymentMethod: null, rate: 0.4, priority: 2 },
      { barberId: 'rafael', serviceId: 'combo', paymentMethod: 'PIX', rate: 0.5, priority: 4 },
    ])
    await calculateCommission(tx, 'appt-1')
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ rate: 0.5 }) })
    )
  })

  it('ignora priority 4 e usa priority 3 quando paymentMethod difere', async () => {
    const { tx, create } = fakeTx(baseAppt, [
      { barberId: 'rafael', serviceId: 'combo', paymentMethod: 'CASH', rate: 0.5, priority: 4 },
      { barberId: 'rafael', serviceId: 'combo', paymentMethod: null, rate: 0.45, priority: 3 },
      { barberId: 'rafael', serviceId: null, paymentMethod: null, rate: 0.4, priority: 2 },
    ])
    await calculateCommission(tx, 'appt-1')
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ rate: 0.45 }) })
    )
  })

  it('usa priority 2 (barbeiro geral) quando não há regra para o serviço', async () => {
    const { tx, create } = fakeTx(baseAppt, [
      { barberId: null, serviceId: null, paymentMethod: null, rate: 0.3, priority: 1 },
      { barberId: 'rafael', serviceId: null, paymentMethod: null, rate: 0.4, priority: 2 },
    ])
    await calculateCommission(tx, 'appt-1')
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ rate: 0.4 }) })
    )
  })

  it('usa priority 1 (padrão da barbearia) quando o barbeiro não tem regra', async () => {
    const { tx, create } = fakeTx({ ...baseAppt, barberId: 'novato' }, [
      { barberId: null, serviceId: null, paymentMethod: null, rate: 0.3, priority: 1 },
      { barberId: 'rafael', serviceId: null, paymentMethod: null, rate: 0.4, priority: 2 },
    ])
    await calculateCommission(tx, 'appt-1')
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ rate: 0.3 }) })
    )
  })

  it('usa fallback de 30% quando não há nenhuma CommissionRule', async () => {
    const { tx, create } = fakeTx(baseAppt, [])
    await calculateCommission(tx, 'appt-1')
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ rate: DEFAULT_COMMISSION_RATE }) })
    )
  })

  it('calcula o valor: 0.40 * 55.00 = 22.00', async () => {
    const { tx, create } = fakeTx({ ...baseAppt, totalPrice: 55 }, [
      { barberId: 'rafael', serviceId: null, paymentMethod: null, rate: 0.4, priority: 2 },
    ])
    await calculateCommission(tx, 'appt-1')
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ amount: 22 }) })
    )
  })

  it('arredonda corretamente: 0.33 * 35.00 = 11.55', async () => {
    const { tx, create } = fakeTx({ ...baseAppt, totalPrice: 35 }, [
      { barberId: 'rafael', serviceId: null, paymentMethod: null, rate: 0.33, priority: 2 },
    ])
    await calculateCommission(tx, 'appt-1')
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ amount: 11.55 }) })
    )
  })
})

describe('selectCommissionRate — núcleo puro (preview + cálculo)', () => {
  const ctx = { barberId: 'rafael', serviceIds: ['combo'], paymentMethod: 'PIX' as const }

  it('escolhe a regra de maior priority entre as que casam', () => {
    const rules: RuleLike[] = [
      { barberId: null, serviceId: null, paymentMethod: null, rate: 0.3, priority: 0 },
      { barberId: 'rafael', serviceId: null, paymentMethod: null, rate: 0.4, priority: 1 },
      { barberId: 'rafael', serviceId: 'combo', paymentMethod: 'PIX', rate: 0.5, priority: 3 },
    ]
    const { rate, rule } = selectCommissionRate(rules, ctx)
    expect(rate).toBe(0.5)
    expect(rule?.priority).toBe(3)
  })

  it('ignora regras cujo paymentMethod não casa', () => {
    const rules: RuleLike[] = [
      { barberId: 'rafael', serviceId: 'combo', paymentMethod: 'CASH', rate: 0.5, priority: 3 },
      { barberId: 'rafael', serviceId: null, paymentMethod: null, rate: 0.4, priority: 1 },
    ]
    expect(selectCommissionRate(rules, ctx).rate).toBe(0.4)
  })

  it('cai no fallback quando nenhuma regra casa', () => {
    const rules: RuleLike[] = [
      { barberId: 'outro', serviceId: null, paymentMethod: null, rate: 0.9, priority: 1 },
    ]
    const { rate, rule } = selectCommissionRate(rules, ctx)
    expect(rate).toBe(DEFAULT_COMMISSION_RATE)
    expect(rule).toBeNull()
  })

  it('desempata por especificidade — barbeiro (4) vence serviço (2), mesmo com priority defasada', () => {
    // Ambas casam; antes (priority por contagem) empatavam em 1. Agora barbeiro vence.
    const rules: RuleLike[] = [
      { barberId: null, serviceId: 'combo', paymentMethod: null, rate: 0.2, priority: 99 },
      { barberId: 'rafael', serviceId: null, paymentMethod: null, rate: 0.4, priority: 0 },
    ]
    const { rate } = selectCommissionRate(rules, ctx)
    expect(rate).toBe(0.4)
  })

  it('a seleção ignora a coluna priority persistida (usa os campos da regra)', () => {
    const rules: RuleLike[] = [
      { barberId: 'rafael', serviceId: 'combo', paymentMethod: 'PIX', rate: 0.5, priority: 0 },
      { barberId: 'rafael', serviceId: null, paymentMethod: null, rate: 0.4, priority: 100 },
    ]
    expect(selectCommissionRate(rules, ctx).rate).toBe(0.5)
  })
})

describe('ruleSpecificity — ordem total ponderada (RN-03)', () => {
  it('barbeiro+serviço+pagamento (7) > barbeiro+serviço (6) > barbeiro (4) > padrão (0)', () => {
    expect(ruleSpecificity({ barberId: 'b', serviceId: 's', paymentMethod: 'PIX' })).toBe(7)
    expect(ruleSpecificity({ barberId: 'b', serviceId: 's', paymentMethod: null })).toBe(6)
    expect(ruleSpecificity({ barberId: 'b', serviceId: null, paymentMethod: null })).toBe(4)
    expect(ruleSpecificity({ barberId: null, serviceId: null, paymentMethod: null })).toBe(0)
  })

  it('barbeiro (4) > serviço+pagamento (3) — barbeiro domina', () => {
    expect(ruleSpecificity({ barberId: 'b', serviceId: null, paymentMethod: null })).toBeGreaterThan(
      ruleSpecificity({ barberId: null, serviceId: 's', paymentMethod: 'PIX' })
    )
  })
})
