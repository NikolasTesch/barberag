'use client'

import { useMemo, useState } from 'react'
import { Plus, Trash2, Loader2 } from 'lucide-react'
import { formatBRL } from '@/lib/utils/format'
import { selectCommissionRate, DEFAULT_COMMISSION_RATE, type RuleLike } from '@/lib/utils/commission'
import type { PaymentMethod } from '@prisma/client'

export interface RuleRow {
  id: string
  barberId: string | null
  barberName: string | null
  serviceId: string | null
  serviceName: string | null
  paymentMethod: PaymentMethod | null
  rate: number
  priority: number
}

interface Option {
  id: string
  name: string
}

const PAYMENT_METHODS: PaymentMethod[] = ['CASH', 'PIX', 'DEBIT', 'CREDIT']
const PAYMENT_LABEL: Record<string, string> = { CASH: 'Dinheiro', PIX: 'Pix', DEBIT: 'Débito', CREDIT: 'Crédito' }
const LEVEL_LABEL = ['Padrão da barbearia', 'Por barbeiro', 'Barbeiro + serviço', 'Barbeiro + serviço + pagamento']

const inputClass = 'border border-line rounded-md px-2.5 py-1.5 text-sm focus:outline-none focus:border-accent'

export function CommissionRuleForm({
  rules,
  barbers,
  services,
  onChange,
}: {
  rules: RuleRow[]
  barbers: Option[]
  services: Option[]
  onChange: () => void
}) {
  const defaultRule = rules.find((r) => r.priority === 0) ?? null
  const otherRules = rules.filter((r) => r.priority > 0)

  const [defaultPercent, setDefaultPercent] = useState(
    Math.round((defaultRule?.rate ?? DEFAULT_COMMISSION_RATE) * 100)
  )
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // form de nova regra
  const [barberId, setBarberId] = useState('')
  const [serviceId, setServiceId] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [ratePercent, setRatePercent] = useState(40)

  // simulador
  const [simBarber, setSimBarber] = useState('')
  const [simService, setSimService] = useState('')
  const [simPayment, setSimPayment] = useState('')
  const [simValue, setSimValue] = useState(60)

  async function api(url: string, method: string, body?: unknown) {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      })
      if (!res.ok) {
        const json = await res.json().catch(() => null)
        throw new Error(json?.error?.formErrors?.[0] ?? 'Falha na operação.')
      }
      onChange()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado.')
    } finally {
      setBusy(false)
    }
  }

  const simResult = useMemo(() => {
    const ruleLikes: RuleLike[] = rules.map((r) => ({
      barberId: r.barberId,
      serviceId: r.serviceId,
      paymentMethod: r.paymentMethod,
      rate: r.rate,
      priority: r.priority,
    }))
    if (!simBarber) return null
    const { rate, rule } = selectCommissionRate(ruleLikes, {
      barberId: simBarber,
      serviceIds: simService ? [simService] : [],
      paymentMethod: (simPayment || null) as PaymentMethod | null,
    })
    const level = rule ? rule.priority : 0
    return { rate, amount: Math.round(rate * simValue * 100) / 100, level, isFallback: !rule }
  }, [rules, simBarber, simService, simPayment, simValue])

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <div className="border border-error/30 bg-error/5 text-error rounded-lg px-4 py-2.5 text-sm">{error}</div>
      )}

      {/* Nível 1 — padrão */}
      <section className="border border-line rounded-xl bg-white p-4">
        <h4 className="text-[11px] font-semibold tracking-widest uppercase text-textMuted mb-2">
          Nível 1 — {LEVEL_LABEL[0]}
        </h4>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min={0}
            max={100}
            value={defaultPercent}
            onChange={(e) => setDefaultPercent(Number(e.target.value))}
            className={`${inputClass} w-24`}
          />
          <span className="text-textMuted text-sm">% — aplicado quando nenhuma regra mais específica casa</span>
          <button
            disabled={busy}
            onClick={() => api('/api/admin/commissions/rules', 'POST', { ratePercent: defaultPercent })}
            className="ml-auto bg-accent text-white text-sm font-semibold px-4 py-1.5 rounded-lg hover:bg-accent-deep disabled:opacity-60"
          >
            Salvar padrão
          </button>
        </div>
      </section>

      {/* Regras específicas (níveis 2-4) */}
      <section className="border border-line rounded-xl bg-white p-4">
        <h4 className="text-[11px] font-semibold tracking-widest uppercase text-textMuted mb-3">
          Regras específicas (níveis 2–4)
        </h4>

        {/* form de adição */}
        <div className="flex flex-wrap items-end gap-2 mb-3 pb-3 border-b border-fill">
          <div className="flex flex-col">
            <label className="text-[10px] text-textMuted mb-0.5">Barbeiro</label>
            <select value={barberId} onChange={(e) => setBarberId(e.target.value)} className={inputClass}>
              <option value="">— qualquer —</option>
              {barbers.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-[10px] text-textMuted mb-0.5">Serviço</label>
            <select value={serviceId} onChange={(e) => setServiceId(e.target.value)} className={inputClass}>
              <option value="">— qualquer —</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-[10px] text-textMuted mb-0.5">Pagamento</label>
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className={inputClass}>
              <option value="">— qualquer —</option>
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>{PAYMENT_LABEL[m]}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-[10px] text-textMuted mb-0.5">Taxa %</label>
            <input
              type="number"
              min={0}
              max={100}
              value={ratePercent}
              onChange={(e) => setRatePercent(Number(e.target.value))}
              className={`${inputClass} w-20`}
            />
          </div>
          <button
            disabled={busy || !barberId}
            title={!barberId ? 'Selecione ao menos um barbeiro' : ''}
            onClick={() =>
              api('/api/admin/commissions/rules', 'POST', {
                barberId,
                serviceId: serviceId || null,
                paymentMethod: paymentMethod || null,
                ratePercent,
              })
            }
            className="inline-flex items-center gap-1.5 bg-primary text-white text-sm font-semibold px-3 py-1.5 rounded-lg hover:opacity-90 disabled:opacity-50"
          >
            <Plus size={14} /> Adicionar
          </button>
        </div>

        {/* tabela de regras */}
        {otherRules.length === 0 ? (
          <p className="text-sm text-textMuted">Nenhuma regra específica cadastrada.</p>
        ) : (
          <div className="flex flex-col">
            {otherRules.map((r) => (
              <div key={r.id} className="flex items-center gap-2 py-2 border-b border-fill text-[13px]">
                <span className="text-[10px] font-mono bg-fill text-textMuted px-2 py-0.5 rounded">N{r.priority + 1}</span>
                <span className="flex-1">
                  <span className="font-semibold">{r.barberName ?? 'Qualquer barbeiro'}</span>
                  {r.serviceName && <span className="text-textMuted"> · {r.serviceName}</span>}
                  {r.paymentMethod && <span className="text-textMuted"> · {PAYMENT_LABEL[r.paymentMethod]}</span>}
                </span>
                <span className="font-bold text-accent-deep">{Math.round(r.rate * 100)}%</span>
                <button
                  disabled={busy}
                  onClick={() => api(`/api/admin/commissions/rules/${r.id}`, 'DELETE')}
                  className="text-error hover:bg-error/5 p-1.5 rounded disabled:opacity-50"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Simulador */}
      <section className="border border-line rounded-xl bg-fill-soft p-4">
        <h4 className="text-[11px] font-semibold tracking-widest uppercase text-textMuted mb-3">
          Simulador de comissão
        </h4>
        <div className="flex flex-wrap items-end gap-2">
          <select value={simBarber} onChange={(e) => setSimBarber(e.target.value)} className={inputClass}>
            <option value="">Barbeiro…</option>
            {barbers.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          <select value={simService} onChange={(e) => setSimService(e.target.value)} className={inputClass}>
            <option value="">Serviço…</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <select value={simPayment} onChange={(e) => setSimPayment(e.target.value)} className={inputClass}>
            <option value="">Pagamento…</option>
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>{PAYMENT_LABEL[m]}</option>
            ))}
          </select>
          <input
            type="number"
            min={0}
            value={simValue}
            onChange={(e) => setSimValue(Number(e.target.value))}
            className={`${inputClass} w-24`}
            placeholder="Valor R$"
          />
        </div>
        {simResult && (
          <div className="mt-3 flex items-center gap-4 text-sm bg-white border border-line rounded-lg px-4 py-3">
            <span>
              Regra aplicada:{' '}
              <span className="font-semibold">
                {simResult.isFallback ? 'Padrão (fallback)' : `Nível ${simResult.level + 1} — ${LEVEL_LABEL[simResult.level]}`}
              </span>
            </span>
            <span className="text-textMuted">·</span>
            <span>Taxa: <span className="font-semibold">{Math.round(simResult.rate * 100)}%</span></span>
            <span className="ml-auto font-bold text-accent-deep text-[15px]">{formatBRL(simResult.amount)}</span>
          </div>
        )}
        {!simResult && <p className="mt-2 text-xs text-textMuted">Selecione um barbeiro para simular.</p>}
      </section>

      {busy && (
        <div className="flex items-center gap-2 text-sm text-textMuted">
          <Loader2 size={14} className="animate-spin" /> Salvando…
        </div>
      )}
    </div>
  )
}
