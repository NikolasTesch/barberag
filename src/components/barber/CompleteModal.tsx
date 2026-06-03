'use client'

import { useState } from 'react'
import { formatBRL } from '@/lib/utils/format'

export type PaymentMethod = 'CASH' | 'PIX' | 'DEBIT' | 'CREDIT'

export interface CompleteTarget {
  id: string
  clientName: string
  totalPrice: number
  totalDuration: number
  services: { name: string }[]
}

const PAYMENTS: { value: PaymentMethod; label: string; icon: string }[] = [
  { value: 'PIX', label: 'Pix', icon: '⚡' },
  { value: 'CASH', label: 'Dinheiro', icon: '💵' },
  { value: 'DEBIT', label: 'Débito', icon: '💳' },
  { value: 'CREDIT', label: 'Crédito', icon: '🪙' },
]

interface CompleteModalProps {
  target: CompleteTarget
  onClose: () => void
  /** Resolve quando a comissão é gerada com sucesso; lança em caso de erro. */
  onComplete: (payload: { paymentMethod: PaymentMethod; notes?: string }) => Promise<void>
}

export function CompleteModal({ target, onClose, onComplete }: CompleteModalProps) {
  const [payment, setPayment] = useState<PaymentMethod | null>(null)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(false)

  async function confirm() {
    if (!payment) return
    setSaving(true)
    setError(false)
    try {
      await onComplete({ paymentMethod: payment, notes: notes.trim() || undefined })
      onClose()
    } catch {
      setError(true)
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-5 max-h-[90vh] overflow-y-auto">
        <h2 className="font-bold text-[17px] text-primary mb-1">Concluir atendimento</h2>
        <p className="text-[13px] text-textMuted mb-4">{target.clientName}</p>

        {/* Serviços realizados */}
        <p className="text-[10px] font-semibold tracking-widest uppercase text-textMuted mb-1.5">
          Serviços realizados
        </p>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {target.services.map((s, i) => (
            <span
              key={i}
              className="text-[12px] font-semibold px-2.5 py-1 rounded-full bg-fill text-textMuted border border-line"
            >
              {s.name}
            </span>
          ))}
        </div>

        {/* Forma de pagamento */}
        <p className="text-[10px] font-semibold tracking-widest uppercase text-textMuted mb-1.5">
          Forma de pagamento
        </p>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {PAYMENTS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setPayment(p.value)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-[14px] font-semibold transition-colors ${
                payment === p.value
                  ? 'border-accent bg-accent-soft text-accent-deep'
                  : 'border-line bg-white text-textMuted hover:border-accent/40'
              }`}
            >
              <span>{p.icon}</span>
              {p.label}
            </button>
          ))}
        </div>

        {/* Observações */}
        <p className="text-[10px] font-semibold tracking-widest uppercase text-textMuted mb-1.5">
          Observações <span className="text-textDisabled normal-case">(opcional)</span>
        </p>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          maxLength={500}
          rows={2}
          placeholder="Ex: cliente pediu mais volume no friso"
          className="w-full border border-line rounded-lg px-3 py-2 text-[14px] resize-none focus:outline-none focus:border-accent mb-4"
        />

        {error && (
          <p className="text-[13px] text-error mb-3">Erro ao concluir. Tente novamente.</p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-[13px] text-textMuted">Total</span>
          <span className="font-bold text-[18px] text-accent-deep">{formatBRL(target.totalPrice)}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 py-2.5 rounded-lg border border-line font-semibold text-[14px] disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={confirm}
            disabled={!payment || saving}
            className="flex-1 py-2.5 rounded-lg bg-accent text-white font-semibold text-[14px] hover:bg-accent-deep transition-colors disabled:opacity-50"
          >
            {saving ? 'Aguarde...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  )
}
