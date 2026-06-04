'use client'

import { Fragment, useCallback, useEffect, useState } from 'react'
import { addDays, format, isToday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { CompleteModal, type CompleteTarget, type PaymentMethod } from '@/components/barber/CompleteModal'
import { formatBRL, initials } from '@/lib/utils/format'

type Status = 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'NO_SHOW' | 'CANCELLED'

interface BarberAppointment {
  id: string
  status: Status
  totalPrice: number
  totalDuration: number
  scheduledAt: string
  client: { name: string; phone: string | null }
  services: { service: { name: string } }[]
  commission: { amount: number; status: 'PENDING' | 'PAID' } | null
}

const badgeVariant: Record<Status, 'scheduled' | 'in_progress' | 'completed' | 'no_show' | 'cancelled'> = {
  SCHEDULED: 'scheduled',
  CONFIRMED: 'scheduled',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  NO_SHOW: 'no_show',
  CANCELLED: 'cancelled',
}

const borderTone: Record<Status, string> = {
  SCHEDULED: 'border-l-info',
  CONFIRMED: 'border-l-info',
  IN_PROGRESS: 'border-l-accent',
  COMPLETED: 'border-l-success',
  NO_SHOW: 'border-l-error',
  CANCELLED: 'border-l-line',
}

function MainHead({ title, sub, right }: { title: string; sub?: string; right?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-3 px-4 sm:px-[22px] py-4 border-b border-line bg-white">
      <div>
        <div className="font-bold text-[19px] text-primary capitalize">{title}</div>
        {sub && <div className="text-[13px] text-textMuted">{sub}</div>}
      </div>
      {right && <div className="ml-auto flex items-center gap-2">{right}</div>}
    </div>
  )
}

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex-1 border border-line rounded-[10px] px-3.5 py-3 bg-white">
      <div className="font-mono text-[9.5px] text-textDisabled tracking-wide uppercase">{label}</div>
      <div className={`font-bold text-[22px] mt-0.5 ${color || 'text-primary'}`}>{value}</div>
    </div>
  )
}

export default function AgendaPage() {
  const [date, setDate] = useState<Date>(() => new Date())
  const [now, setNow] = useState<Date>(() => new Date())
  const [items, setItems] = useState<BarberAppointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [completeTarget, setCompleteTarget] = useState<CompleteTarget | null>(null)

  const load = useCallback((d: Date) => {
    setLoading(true)
    setError(false)
    fetch(`/api/barber/appointments?date=${format(d, 'yyyy-MM-dd')}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => setItems(data.appointments))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load(date)
  }, [date, load])

  // Polling leve para refletir check-ins de outros dispositivos (s03-04).
  useEffect(() => {
    const t = setInterval(() => load(date), 120_000)
    return () => clearInterval(t)
  }, [date, load])

  // Reposiciona a linha do horário atual a cada minuto (s03-04 / CurrentTimeLine).
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(t)
  }, [])

  async function checkIn(id: string) {
    setBusyId(id)
    const res = await fetch(`/api/barber/appointments/${id}/checkin`, { method: 'POST' })
    setBusyId(null)
    if (res.ok) {
      setItems((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'IN_PROGRESS' } : a)))
    }
  }

  async function complete(payload: { paymentMethod: PaymentMethod; notes?: string }) {
    if (!completeTarget) return
    const res = await fetch(`/api/barber/appointments/${completeTarget.id}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error('complete_failed')
    const data = await res.json()
    setItems((prev) =>
      prev.map((a) =>
        a.id === completeTarget.id
          ? { ...a, status: 'COMPLETED', commission: { amount: data.commission.amount, status: 'PENDING' } }
          : a
      )
    )
  }

  const completed = items.filter((a) => a.status === 'COMPLETED').length
  const expected = items
    .filter((a) => a.status !== 'CANCELLED' && a.status !== 'NO_SHOW')
    .reduce((sum, a) => sum + a.totalPrice, 0)
  const next = items.find((a) => a.status === 'SCHEDULED' || a.status === 'CONFIRMED')

  // Índice onde a linha "agora" entra: antes do 1º agendamento ainda por vir hoje.
  const showNowLine = isToday(date) && items.length > 0
  const nowLineIndex = showNowLine
    ? items.findIndex((a) => new Date(a.scheduledAt) > now)
    : -1

  const NowLine = () => (
    <div className="flex items-center gap-2 py-0.5" aria-label={`Horário atual ${format(now, 'HH:mm')}`}>
      <span className="text-[10px] font-mono font-bold text-error w-[58px] text-center flex-shrink-0">
        {format(now, 'HH:mm')}
      </span>
      <span className="h-2 w-2 rounded-full bg-error flex-shrink-0" />
      <span className="flex-1 h-px bg-error/40" />
    </div>
  )

  return (
    <div className="flex flex-col h-full">
      <MainHead
        title={`Agenda — ${format(date, "EEEE, dd 'de' MMM", { locale: ptBR })}`}
        sub="Sua agenda do dia, ordenada por horário"
        right={
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setDate((d) => addDays(d, -1))}
              className="w-7 h-7 rounded-lg border border-line text-textMuted hover:bg-fill transition-colors"
              aria-label="Dia anterior"
            >
              ‹
            </button>
            <button
              onClick={() => setDate(new Date())}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                isToday(date) ? 'bg-primary text-white border-primary' : 'border-line text-textMuted hover:bg-fill'
              }`}
            >
              hoje
            </button>
            <button
              onClick={() => setDate((d) => addDays(d, 1))}
              className="w-7 h-7 rounded-lg border border-line text-textMuted hover:bg-fill transition-colors"
              aria-label="Próximo dia"
            >
              ›
            </button>
          </div>
        }
      />

      <div className="p-[18px] flex flex-col gap-3.5 overflow-auto">
        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Stat label="Atendimentos" value={String(items.length)} />
          <Stat label="Concluídos" value={String(completed)} color="text-success" />
          <Stat label="Faturamento Prev." value={formatBRL(expected)} color="text-accent-deep" />
          <Stat
            label="Próximo"
            value={next ? format(new Date(next.scheduledAt), 'HH:mm') : '—'}
            color="text-accent-deep"
          />
        </div>

        {/* Lista */}
        {loading && (
          <div className="flex flex-col gap-2.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-[68px] rounded-[10px] bg-fill animate-pulse" />
            ))}
          </div>
        )}

        {!loading && error && (
          <p className="text-center text-sm text-textMuted py-8">Erro ao carregar a agenda. Tente novamente.</p>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-2">✂️</div>
            <p className="text-[15px] font-semibold text-primary">Nenhum agendamento para este dia.</p>
            <p className="text-[13px] text-textMuted">Aproveite!</p>
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="flex flex-col gap-2.5">
            {items.map((appt, idx) => (
              <Fragment key={appt.id}>
                {idx === nowLineIndex && <NowLine />}
                <div
                  className={`flex items-center gap-3.5 px-3.5 py-3 bg-white border border-line border-l-[5px] ${borderTone[appt.status]} rounded-[10px] ${
                    appt.status === 'COMPLETED' ? 'opacity-60' : ''
                  }`}
                >
                <div className="w-[58px] text-center flex-shrink-0">
                  <div className="font-bold text-[16px]">{format(new Date(appt.scheduledAt), 'HH:mm')}</div>
                  <div className="font-mono text-[9px] text-textDisabled">{appt.totalDuration}min</div>
                </div>

                <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                  {initials(appt.client.name)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-bold text-[14.5px]">{appt.client.name}</div>
                  <div className="text-[12.5px] text-textMuted truncate">
                    {appt.services.map((s) => s.service.name).join(', ')}
                  </div>
                </div>

                {appt.status === 'COMPLETED' && appt.commission ? (
                  <span className="text-[13px] font-bold text-success">{formatBRL(appt.commission.amount)}</span>
                ) : (
                  <StatusBadge status={badgeVariant[appt.status]} />
                )}

                {(appt.status === 'SCHEDULED' || appt.status === 'CONFIRMED') && (
                  <button
                    onClick={() => checkIn(appt.id)}
                    disabled={busyId === appt.id}
                    className="bg-success text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity ml-1 disabled:opacity-50"
                  >
                    {busyId === appt.id ? '...' : 'Check-in'}
                  </button>
                )}

                {appt.status === 'IN_PROGRESS' && (
                  <button
                    onClick={() =>
                      setCompleteTarget({
                        id: appt.id,
                        clientName: appt.client.name,
                        totalPrice: appt.totalPrice,
                        totalDuration: appt.totalDuration,
                        services: appt.services.map((s) => ({ name: s.service.name })),
                      })
                    }
                    className="bg-accent text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-accent-deep transition-colors ml-1"
                  >
                    Concluir
                  </button>
                )}
                </div>
                {idx === items.length - 1 && nowLineIndex === -1 && showNowLine && <NowLine />}
              </Fragment>
            ))}
          </div>
        )}
      </div>

      {completeTarget && (
        <CompleteModal
          target={completeTarget}
          onClose={() => setCompleteTarget(null)}
          onComplete={complete}
        />
      )}
    </div>
  )
}
