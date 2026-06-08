'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronDown, Loader2 } from 'lucide-react'
import { formatBRL, initials } from '@/lib/utils/format'
import { PAYOUT_METHODS, PAYOUT_METHOD_LABELS } from '@/lib/validations/commission'

interface CommissionDetail {
  id: string
  amount: number
  rate: number
  date: string
  clientName: string
  paymentMethod: string | null
  services: string[]
}

export interface CommissionGroup {
  barberId: string
  barberName: string
  total: number
  commissions: CommissionDetail[]
}

const PAYMENT_LABEL: Record<string, string> = {
  CASH: 'Dinheiro',
  PIX: 'Pix',
  DEBIT: 'Débito',
  CREDIT: 'Crédito',
}

function PaymentDialog({
  group,
  onClose,
  onConfirm,
}: {
  group: CommissionGroup
  onClose: () => void
  onConfirm: (data: { paymentMethod: string; paidAt: string; notes: string }) => Promise<void>
}) {
  const [paymentMethod, setPaymentMethod] = useState<string>('PIX')
  const [paidAt, setPaidAt] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl p-5 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-bold text-[16px] mb-1">Fechar comissões — {group.barberName}</h3>
        <p className="text-sm text-textMuted mb-4">
          {group.commissions.length} comissão(ões) · total{' '}
          <span className="font-bold text-accent-deep">{formatBRL(group.total)}</span>
        </p>

        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-[12px] font-semibold text-textMuted mb-1">Forma de pagamento</label>
            <div className="flex gap-2">
              {PAYOUT_METHODS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setPaymentMethod(m)}
                  className={`flex-1 text-sm font-semibold py-2 rounded-lg border transition-colors ${
                    paymentMethod === m
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-textMuted border-line hover:border-accent/40'
                  }`}
                >
                  {PAYOUT_METHOD_LABELS[m]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-textMuted mb-1">Data do pagamento</label>
            <input
              type="date"
              value={paidAt}
              onChange={(e) => setPaidAt(e.target.value)}
              className="w-full border border-line rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-textMuted mb-1">Observação (opcional)</label>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border border-line rounded-md px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-line font-semibold text-sm hover:bg-fill">
            Cancelar
          </button>
          <button
            disabled={submitting}
            onClick={async () => {
              setSubmitting(true)
              await onConfirm({ paymentMethod, paidAt, notes })
              setSubmitting(false)
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white font-semibold text-sm hover:bg-accent-deep disabled:opacity-60"
          >
            {submitting && <Loader2 size={14} className="animate-spin" />}
            Confirmar pagamento
          </button>
        </div>
      </div>
    </div>
  )
}

export function CommissionClosingTable({
  groups,
  onPaid,
}: {
  groups: CommissionGroup[]
  onPaid: (msg: string) => void
}) {
  const [open, setOpen] = useState<string | null>(groups[0]?.barberId ?? null)
  const [dialog, setDialog] = useState<CommissionGroup | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function pay(group: CommissionGroup, data: { paymentMethod: string; paidAt: string; notes: string }) {
    setError(null)
    try {
      const res = await fetch('/api/admin/commissions/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barberId: group.barberId, ...data }),
      })
      if (!res.ok) throw new Error()
      const json = await res.json()
      setDialog(null)
      onPaid(`${json.count} comissões de ${group.barberName} fechadas! Total: ${formatBRL(json.total)}.`)
    } catch {
      setError('Falha ao registrar o pagamento.')
    }
  }

  if (groups.length === 0) {
    return (
      <div className="border border-line rounded-xl bg-white py-10 text-center text-textMuted text-sm">
        Nenhuma comissão pendente. 🎉
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2.5">
      {error && (
        <div className="border border-error/30 bg-error/5 text-error rounded-lg px-4 py-2.5 text-sm">{error}</div>
      )}
      {groups.map((g) => {
        const isOpen = open === g.barberId
        return (
          <div key={g.barberId} className="border border-line rounded-xl bg-white shadow-sm overflow-hidden">
            <button
              onClick={() => setOpen(isOpen ? null : g.barberId)}
              className="w-full flex items-center gap-3 px-3.5 py-3 text-left hover:bg-fill-soft transition-colors cursor-pointer"
            >
              <span className="w-[30px] h-[30px] rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold flex-shrink-0">
                {initials(g.barberName)}
              </span>
              <span className="font-bold flex-1">{g.barberName}</span>
              <span className="text-textMuted text-[12px]">{g.commissions.length} comissões</span>
              <span className="font-bold text-[15px] text-accent-deep">{formatBRL(g.total)}</span>
              <ChevronDown size={18} className={`text-textMuted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
              <div className="border-t border-line">
                <div className="overflow-x-auto">
                <div className="min-w-[480px]">
                <div
                  className="grid px-3.5 py-2 font-mono text-[9px] text-textDisabled tracking-wide uppercase border-b border-fill"
                  style={{ gridTemplateColumns: '0.9fr 1.6fr 0.9fr 0.5fr 0.8fr' }}
                >
                  <span>Data</span>
                  <span>Atendimento</span>
                  <span>Pagamento</span>
                  <span>%</span>
                  <span className="text-right">Valor</span>
                </div>
                {g.commissions.map((c) => (
                  <div
                    key={c.id}
                    className="grid items-center px-3.5 py-2.5 text-[12.5px] border-b border-fill hover:bg-fill-soft transition-colors"
                    style={{ gridTemplateColumns: '0.9fr 1.6fr 0.9fr 0.5fr 0.8fr' }}
                  >
                    <span className="text-textMuted">{format(new Date(c.date), 'dd/MM', { locale: ptBR })}</span>
                    <span className="truncate">
                      <span className="font-semibold">{c.clientName}</span>
                      <span className="text-textDisabled"> · {c.services.join(', ')}</span>
                    </span>
                    <span className="text-textMuted">{c.paymentMethod ? PAYMENT_LABEL[c.paymentMethod] : '—'}</span>
                    <span className="text-textMuted font-mono">{Math.round(c.rate * 100)}%</span>
                    <span className="text-right font-bold text-accent-deep">{formatBRL(c.amount)}</span>
                  </div>
                ))}
                </div>
                </div>
                <div className="flex items-center gap-3 px-3.5 py-3 bg-fill-soft">
                  <span className="flex-1 text-[13px] font-semibold">Total pendente</span>
                  <span className="font-bold text-[16px] text-accent-deep">{formatBRL(g.total)}</span>
                  <button
                    onClick={() => setDialog(g)}
                    className="bg-accent text-white font-semibold text-sm px-4 py-2 rounded-lg hover:bg-accent-deep transition-colors"
                  >
                    Fechar comissões
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      })}

      {dialog && <PaymentDialog group={dialog} onClose={() => setDialog(null)} onConfirm={(d) => pay(dialog, d)} />}
    </div>
  )
}
