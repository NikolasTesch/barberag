'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatBRL, initials } from '@/lib/utils/format'

type Status = 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'NO_SHOW' | 'CANCELLED'
type PaymentMethod = 'CASH' | 'PIX' | 'DEBIT' | 'CREDIT'

interface AppointmentDetail {
  id: string
  status: Status
  scheduledAt: string
  totalPrice: number
  totalDuration: number
  paymentMethod: PaymentMethod | null
  notes: string | null
  client: { name: string; phone: string | null }
  services: { serviceId: string; name: string; price: number; duration: number }[]
}

interface CommissionPreviews {
  CASH: { rate: number; amount: number }
  PIX: { rate: number; amount: number }
  DEBIT: { rate: number; amount: number }
  CREDIT: { rate: number; amount: number }
}

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  CASH: 'Dinheiro',
  PIX: 'Pix',
  DEBIT: 'Débito',
  CREDIT: 'Crédito',
}

const BADGE_VARIANT: Record<Status, 'scheduled' | 'in_progress' | 'completed' | 'no_show' | 'cancelled'> = {
  SCHEDULED: 'scheduled',
  CONFIRMED: 'scheduled',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  NO_SHOW: 'no_show',
  CANCELLED: 'cancelled',
}

export default function AtendimentoDetailPage({ params }: { params: { id: string } }) {
  const [appointment, setAppointment] = useState<AppointmentDetail | null>(null)
  const [previews, setPreviews] = useState<CommissionPreviews | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('PIX')
  const [busy, setBusy] = useState(false)
  const [showNoShow, setShowNoShow] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    setError(false)
    fetch(`/api/barber/appointments/${params.id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        setAppointment(data.appointment)
        setPreviews(data.commissionPreviews)
        if (data.appointment.paymentMethod) {
          setSelectedPayment(data.appointment.paymentMethod as PaymentMethod)
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [params.id])

  useEffect(() => {
    load()
  }, [load])

  async function handleCheckin() {
    if (!appointment) return
    setBusy(true)
    try {
      const res = await fetch(`/api/barber/appointments/${appointment.id}/checkin`, { method: 'POST' })
      if (!res.ok) throw new Error()
      setAppointment((prev) => (prev ? { ...prev, status: 'IN_PROGRESS' } : prev))
    } finally {
      setBusy(false)
    }
  }

  async function handleComplete() {
    if (!appointment) return
    setBusy(true)
    try {
      const res = await fetch(`/api/barber/appointments/${appointment.id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethod: selectedPayment }),
      })
      if (!res.ok) throw new Error()
      setAppointment((prev) =>
        prev ? { ...prev, status: 'COMPLETED', paymentMethod: selectedPayment } : prev
      )
    } finally {
      setBusy(false)
    }
  }

  async function handleNoShow() {
    if (!appointment) return
    setBusy(true)
    try {
      const res = await fetch(`/api/barber/appointments/${appointment.id}/no-show`, { method: 'POST' })
      if (!res.ok) throw new Error()
      setAppointment((prev) => (prev ? { ...prev, status: 'NO_SHOW' } : prev))
      setShowNoShow(false)
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 px-4 sm:px-[22px] py-4 border-b border-line bg-white">
          <div className="h-6 w-52 bg-fill rounded animate-pulse" />
        </div>
        <div className="p-4 flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-24 rounded-[10px] bg-fill animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !appointment) {
    return (
      <div className="flex flex-col h-full items-center justify-center gap-3">
        <p className="text-textMuted">Atendimento não encontrado.</p>
        <button onClick={load} className="text-accent text-sm font-semibold">
          Tentar novamente
        </button>
      </div>
    )
  }

  const isActive = appointment.status === 'SCHEDULED' || appointment.status === 'CONFIRMED'
  const isInProgress = appointment.status === 'IN_PROGRESS'
  const isDone =
    appointment.status === 'COMPLETED' ||
    appointment.status === 'NO_SHOW' ||
    appointment.status === 'CANCELLED'

  const preview = previews?.[selectedPayment]

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 px-4 sm:px-[22px] py-4 border-b border-line bg-white">
        <div>
          <div className="flex items-center gap-1.5 font-bold text-[19px] text-primary">
            <Link href="/atendimento" className="text-textMuted hover:text-primary">
              <ChevronLeft size={20} />
            </Link>
            {appointment.client.name}
          </div>
          <div className="text-[13px] text-textMuted">
            {format(new Date(appointment.scheduledAt), "HH:mm · EEE dd 'de' MMM", { locale: ptBR })}
            {' · '}
            {appointment.totalDuration}min
          </div>
        </div>
        <div className="ml-auto">
          <StatusBadge status={BADGE_VARIANT[appointment.status]} />
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 p-4 sm:p-[18px] grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-4 overflow-auto">
        {/* Left: cliente + serviços */}
        <div className="flex flex-col gap-3">
          {/* Cliente */}
          <div className="flex items-center gap-3 p-3.5 border border-line rounded-[10px] bg-white">
            <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold flex-shrink-0">
              {initials(appointment.client.name)}
            </div>
            <div>
              <div className="font-bold text-[16px]">{appointment.client.name}</div>
              {appointment.client.phone && (
                <div className="text-[12.5px] text-textMuted">{appointment.client.phone}</div>
              )}
            </div>
          </div>

          {/* Serviços */}
          <div className="border border-line rounded-[10px] bg-white p-3.5">
            <p className="text-[10px] font-semibold tracking-widest uppercase text-textMuted mb-2.5">
              Serviços
            </p>
            <div className="flex flex-col gap-2">
              {appointment.services.map(({ serviceId, name, price }) => (
                <div
                  key={serviceId}
                  className="flex items-center gap-2.5 px-2.5 py-2 bg-fill-soft rounded-lg"
                >
                  <span className="flex-1 text-[14px] font-bold">{name}</span>
                  <span className="text-[14px] text-textMuted">{formatBRL(price)}</span>
                </div>
              ))}
              <div className="flex justify-between pt-2 border-t border-dashed border-line font-bold text-[16px]">
                <span>Total</span>
                <span className="text-accent-deep">{formatBRL(appointment.totalPrice)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: ações */}
        <div className="flex flex-col gap-3">
          {/* Forma de pagamento — só em IN_PROGRESS */}
          {isInProgress && (
            <div className="border border-line rounded-[10px] bg-white p-3.5">
              <p className="text-[10px] font-semibold tracking-widest uppercase text-textMuted mb-2.5">
                Forma de pagamento
              </p>
              <div className="grid grid-cols-2 gap-[7px]">
                {(['CASH', 'PIX', 'DEBIT', 'CREDIT'] as PaymentMethod[]).map((pm) => (
                  <button
                    key={pm}
                    onClick={() => setSelectedPayment(pm)}
                    className={`text-center py-[9px] rounded-[10px] font-bold text-[13px] border transition-all ${
                      selectedPayment === pm
                        ? 'border-accent bg-accent-soft text-accent-deep'
                        : 'border-line bg-white text-primary hover:border-accent/40'
                    }`}
                  >
                    {PAYMENT_LABELS[pm]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Previsão de comissão — só em IN_PROGRESS */}
          {isInProgress && preview && (
            <div className="border border-success rounded-[10px] bg-success/5 p-3.5">
              <p className="text-[10px] font-semibold tracking-widest uppercase text-textMuted mb-1.5">
                Comissão prevista
              </p>
              <div className="flex justify-between text-[13px] text-textMuted mb-0.5">
                <span>{PAYMENT_LABELS[selectedPayment]}</span>
                <span>{Math.round(preview.rate * 100)}%</span>
              </div>
              <div className="font-bold text-[28px] text-success">{formatBRL(preview.amount)}</div>
            </div>
          )}

          {/* Estado COMPLETED */}
          {appointment.status === 'COMPLETED' && (
            <div className="border border-success rounded-[10px] bg-success/5 p-3.5">
              <p className="text-[10px] font-semibold tracking-widest uppercase text-success mb-1.5">
                Atendimento concluído
              </p>
              {appointment.paymentMethod && (
                <p className="text-[14px] text-textMuted">
                  Pagamento: {PAYMENT_LABELS[appointment.paymentMethod]}
                </p>
              )}
              <p className="text-[13px] text-success mt-1">Comissão gerada automaticamente.</p>
            </div>
          )}

          {/* Estado NO_SHOW */}
          {appointment.status === 'NO_SHOW' && (
            <div className="border border-error rounded-[10px] bg-error/5 p-3.5">
              <p className="text-[14px] font-semibold text-error">Cliente não compareceu.</p>
              <p className="text-[12.5px] text-textMuted mt-0.5">Horário liberado e falta registrada.</p>
            </div>
          )}

          {/* Estado CANCELLED */}
          {appointment.status === 'CANCELLED' && (
            <div className="border border-line rounded-[10px] bg-fill p-3.5">
              <p className="text-[14px] font-semibold text-textMuted">Agendamento cancelado.</p>
            </div>
          )}

          {/* Ações — SCHEDULED / CONFIRMED */}
          {isActive && (
            <div className="flex flex-col gap-2 mt-auto">
              <button
                onClick={handleCheckin}
                disabled={busy}
                className="w-full bg-success text-white font-semibold text-[15px] py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {busy ? '...' : '▶ Iniciar atendimento'}
              </button>
              <button
                onClick={() => setShowNoShow(true)}
                disabled={busy}
                className="w-full text-textMuted text-sm py-2 hover:text-error transition-colors"
              >
                Cliente faltou (no-show)
              </button>
            </div>
          )}

          {/* Ações — IN_PROGRESS */}
          {isInProgress && (
            <div className="flex flex-col gap-2 mt-auto">
              <button
                onClick={handleComplete}
                disabled={busy}
                className="w-full bg-accent text-white font-semibold text-[15px] py-3 rounded-xl hover:bg-accent-deep transition-colors disabled:opacity-50"
              >
                {busy ? '...' : '✓ Marcar como concluído'}
              </button>
              <button
                onClick={() => setShowNoShow(true)}
                disabled={busy}
                className="w-full text-textMuted text-sm py-2 hover:text-error transition-colors"
              >
                Cliente faltou (no-show)
              </button>
            </div>
          )}

          {isDone && (
            <Link
              href="/agenda"
              className="text-center text-sm text-accent font-semibold py-2 mt-auto"
            >
              ← Voltar à agenda
            </Link>
          )}
        </div>
      </div>

      {/* Modal no-show */}
      {showNoShow && (
        <div className="fixed inset-0 bg-primary/55 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-primary rounded-xl p-[18px] w-full max-w-sm shadow-lg">
            <div className="w-[42px] h-[42px] rounded-full bg-error/10 text-error flex items-center justify-center text-[22px] mb-2.5">
              !
            </div>
            <div className="font-bold text-[16px] mb-1.5">Confirmar no-show?</div>
            <p className="text-[15px] text-textMuted leading-snug mb-3.5">
              {appointment.client.name} ·{' '}
              {format(new Date(appointment.scheduledAt), 'HH:mm')}. Isso libera o horário e
              registra a falta no histórico do cliente.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowNoShow(false)}
                disabled={busy}
                className="flex-1 border border-line text-textMuted font-semibold text-[14px] py-2.5 rounded-lg hover:bg-fill transition-colors"
              >
                Voltar
              </button>
              <button
                onClick={handleNoShow}
                disabled={busy}
                className="flex-1 bg-error text-white font-semibold text-[14px] py-2.5 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {busy ? '...' : 'Confirmar falta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
