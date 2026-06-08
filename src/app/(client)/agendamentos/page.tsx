'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarX } from 'lucide-react'
import { AppointmentCard, type AppointmentDTO } from '@/components/shared/AppointmentCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { useBookingStore } from '@/store/bookingStore'
import { cn } from '@/lib/utils/cn'

type Tab = 'upcoming' | 'past'

export default function AgendamentosPage() {
  const router = useRouter()
  const reset = useBookingStore((s) => s.reset)
  const addService = useBookingStore((s) => s.addService)

  const [tab, setTab] = useState<Tab>('upcoming')
  const [items, setItems] = useState<AppointmentDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [cancelTarget, setCancelTarget] = useState<AppointmentDTO | null>(null)
  const [cancelling, setCancelling] = useState(false)

  const load = useCallback((t: Tab) => {
    setLoading(true)
    setError(false)
    fetch(`/api/appointments?status=${t}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setItems(d.appointments))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load(tab)
  }, [tab, load])

  async function confirmCancel() {
    if (!cancelTarget) return
    setCancelling(true)
    const res = await fetch(`/api/appointments/${cancelTarget.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'cancel' }),
    })
    setCancelling(false)
    if (res.ok) {
      setItems((prev) => prev.filter((a) => a.id !== cancelTarget.id)) // otimista
      setCancelTarget(null)
    }
  }

  function reschedule(a: AppointmentDTO) {
    reset()
    a.services.forEach((s) =>
      addService({ id: s.serviceId, name: s.service.name, durationMinutes: s.duration, price: s.price })
    )
    router.push('/agendar/barbeiro')
  }

  const lateCancel =
    cancelTarget && (new Date(cancelTarget.scheduledAt).getTime() - Date.now()) / 60000 < 120

  return (
    <div className="flex flex-col h-full bg-fill-soft">
      <div className="bg-primary text-white px-4 py-3">
        <h1 className="font-bold text-[16px]">Meus Agendamentos</h1>
      </div>

      <div className="flex border-b border-line bg-white">
        {(['upcoming', 'past'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'flex-1 py-2.5 text-[13px] font-semibold transition-colors border-b-2',
              tab === t ? 'border-accent text-accent' : 'border-transparent text-textMuted'
            )}
          >
            {t === 'upcoming' ? 'Próximos' : 'Histórico'}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5 lg:max-w-2xl lg:w-full lg:mx-auto">
        {loading && [0, 1].map((i) => <div key={i} className="h-40 rounded-xl bg-fill animate-pulse" />)}
        {!loading && error && (
          <div className="flex flex-col items-center gap-3 py-8">
            <p className="text-center text-sm text-textMuted">Erro ao carregar agendamentos.</p>
            <button
              onClick={() => load(tab)}
              className="text-[13px] font-semibold text-accent-deep border border-accent/30 px-4 py-2 rounded-lg hover:bg-accent-soft transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        )}
        {!loading && !error && items.length === 0 && (
          <EmptyState
            icon={<CalendarX size={28} />}
            title={tab === 'upcoming' ? 'Nenhum agendamento' : 'Histórico vazio'}
            description={
              tab === 'upcoming'
                ? 'Você ainda não tem agendamentos futuros.'
                : 'Seus atendimentos anteriores aparecerão aqui.'
            }
            action={
              tab === 'upcoming' ? (
                <button
                  onClick={() => router.push('/agendar')}
                  className="bg-accent text-white text-[13px] font-semibold px-4 py-2 rounded-lg"
                >
                  Agendar agora
                </button>
              ) : undefined
            }
          />
        )}
        {!loading &&
          !error &&
          items.map((a) => (
            <AppointmentCard
              key={a.id}
              appointment={a}
              onCancel={() => setCancelTarget(a)}
              onReschedule={() => reschedule(a)}
            />
          ))}
      </div>

      {/* Dialog de cancelamento */}
      {cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5">
            <h2 className="font-bold text-[17px] text-primary mb-1">Cancelar agendamento</h2>
            <p className="text-[14px] text-textMuted mb-4">
              {lateCancel
                ? 'Este cancelamento é com menos de 2 horas de antecedência e será registrado.'
                : 'Tem certeza que deseja cancelar? O horário será liberado.'}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCancelTarget(null)}
                className="flex-1 py-2.5 rounded-lg border border-line font-semibold text-[14px]"
              >
                Voltar
              </button>
              <button
                onClick={confirmCancel}
                disabled={cancelling}
                className="flex-1 py-2.5 rounded-lg bg-error text-white font-semibold text-[14px] disabled:opacity-50"
              >
                {cancelling ? 'Cancelando...' : 'Confirmar Cancelamento'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
