'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { StatusBadge } from '@/components/shared/StatusBadge'

type ActiveStatus = 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS'

interface Appointment {
  id: string
  status: ActiveStatus
  totalDuration: number
  scheduledAt: string
  client: { name: string }
  services: { service: { name: string } }[]
}

const badgeMap: Record<ActiveStatus, 'scheduled' | 'in_progress'> = {
  SCHEDULED: 'scheduled',
  CONFIRMED: 'scheduled',
  IN_PROGRESS: 'in_progress',
}

export default function AtendimentoListPage() {
  const [items, setItems] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    setError(false)
    const today = format(new Date(), 'yyyy-MM-dd')
    fetch(`/api/barber/appointments?date=${today}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) =>
        setItems(
          (data.appointments as Array<Appointment & { status: string }>).filter((a) =>
            ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'].includes(a.status)
          ) as Appointment[]
        )
      )
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-wrap items-center gap-3 px-4 sm:px-[22px] py-4 border-b border-line bg-white">
        <div>
          <div className="font-bold text-[19px] text-primary">Atendimentos de hoje</div>
          <div className="text-[13px] text-textMuted">
            {format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR })}
          </div>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-2.5 overflow-auto">
        {loading && (
          <div className="flex flex-col gap-2.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-[68px] rounded-xl bg-fill animate-pulse" />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-8">
            <p className="text-sm text-textMuted mb-2">Erro ao carregar atendimentos.</p>
            <button onClick={load} className="text-accent text-sm font-semibold">
              Tentar novamente
            </button>
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-2">✂️</div>
            <p className="text-[15px] font-semibold text-primary">Nenhum atendimento ativo hoje.</p>
            <p className="text-[13px] text-textMuted">
              Consulte sua{' '}
              <Link href="/agenda" className="text-accent font-semibold">
                agenda
              </Link>{' '}
              para ver todos os agendamentos.
            </p>
          </div>
        )}

        {!loading &&
          !error &&
          items.map((appt) => (
            <Link
              key={appt.id}
              href={`/atendimento/${appt.id}`}
              className={`flex items-center gap-3.5 px-3.5 py-3 bg-white border border-line rounded-xl hover:border-accent/40 transition-colors ${
                appt.status === 'IN_PROGRESS' ? 'border-l-[5px] border-l-accent' : ''
              }`}
            >
              <div className="text-center w-14 flex-shrink-0">
                <div className="font-bold text-[16px]">
                  {format(new Date(appt.scheduledAt), 'HH:mm')}
                </div>
                <div className="font-mono text-[9px] text-textDisabled">{appt.totalDuration}min</div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-[14.5px]">{appt.client.name}</div>
                <div className="text-[12.5px] text-textMuted truncate">
                  {appt.services.map((s) => s.service.name).join(', ')}
                </div>
              </div>
              <StatusBadge status={badgeMap[appt.status]} />
            </Link>
          ))}
      </div>
    </div>
  )
}
