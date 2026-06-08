'use client'

import { useCallback, useEffect, useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatBRL } from '@/lib/utils/format'

type Period = 'today' | 'week' | 'month'

interface CommissionRow {
  id: string
  amount: number
  rate: number
  status: 'PENDING' | 'PAID'
  paidAt: string | null
  createdAt: string
  appointment: {
    scheduledAt: string
    completedAt: string | null
    paymentMethod: string | null
    client: { name: string }
    services: { service: { name: string } }[]
  }
}

interface Summary {
  totalPending: number
  totalPaid: number
  totalAll: number
}

const PERIODS: { value: Period; label: string }[] = [
  { value: 'today', label: 'Hoje' },
  { value: 'week', label: 'Esta semana' },
  { value: 'month', label: 'Este mês' },
]

const PAGE_SIZE = 20

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex-1 border border-line rounded-[10px] px-3.5 py-3 bg-white">
      <div className="font-mono text-[9.5px] text-textDisabled tracking-wide uppercase">{label}</div>
      <div className={`font-bold text-[22px] mt-0.5 ${color || 'text-primary'}`}>{value}</div>
    </div>
  )
}

export default function ComissoesBarberPage() {
  const [period, setPeriod] = useState<Period>('month')
  const [rows, setRows] = useState<CommissionRow[]>([])
  const [summary, setSummary] = useState<Summary>({ totalPending: 0, totalPaid: 0, totalAll: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [page, setPage] = useState(0)

  const load = useCallback((p: Period) => {
    setLoading(true)
    setError(false)
    setPage(0)
    fetch(`/api/barber/commissions?period=${p}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        setRows(data.commissions)
        setSummary(data.summary)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load(period)
  }, [period, load])

  const totalPages = Math.ceil(rows.length / PAGE_SIZE)
  const pageRows = rows.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE)
  const avgRate = rows.length ? rows.reduce((s, r) => s + r.rate, 0) / rows.length : 0

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 px-4 sm:px-[22px] py-4 border-b border-line bg-white">
        <div>
          <div className="font-bold text-[19px] text-primary">Minhas comissões</div>
          <div className="text-[13px] text-textMuted">
            Período: {PERIODS.find((p) => p.value === period)?.label}
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`text-xs font-semibold px-3 py-1 rounded-full border transition-colors ${
                period === p.value
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-textMuted border-line hover:border-accent/40'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 flex flex-col gap-3.5 overflow-auto">
        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Stat label="A receber (pendente)" value={formatBRL(summary.totalPending)} color="text-accent-deep" />
          <Stat label="Já pago" value={formatBRL(summary.totalPaid)} color="text-success" />
          <Stat label="Atendimentos" value={String(rows.length)} />
          <Stat label="Taxa média" value={`${Math.round(avgRate * 100)}%`} />
        </div>

        {/* Tabela */}
        <div className="border border-line rounded-xl bg-white overflow-hidden">
          <div className="overflow-x-auto">
          <div className="min-w-[680px]">
          <div className="grid grid-cols-[0.7fr_1.1fr_1.2fr_0.8fr_0.5fr_0.8fr_0.9fr] px-3 py-2 border-b border-line">
            {['DATA', 'CLIENTE', 'SERVIÇO', 'PAGAMENTO', '%', 'COMISSÃO', 'STATUS'].map((h) => (
              <span key={h} className="font-mono text-[9px] text-textDisabled tracking-wide">
                {h}
              </span>
            ))}
          </div>

          {loading && (
            <div className="p-3 flex flex-col gap-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-8 rounded bg-fill animate-pulse" />
              ))}
            </div>
          )}

          {!loading && error && (
            <p className="text-center text-sm text-textMuted py-8">Erro ao carregar comissões.</p>
          )}

          {!loading && !error && rows.length === 0 && (
            <p className="text-center text-sm text-textMuted py-8">Nenhuma comissão no período selecionado.</p>
          )}

          {!loading &&
            !error &&
            pageRows.map((row, i) => (
              <div
                key={row.id}
                className={`grid grid-cols-[0.7fr_1.1fr_1.2fr_0.8fr_0.5fr_0.8fr_0.9fr] items-center px-3 py-2.5 border-b border-fill text-[12.5px] ${
                  i % 2 ? 'bg-fill-soft' : 'bg-white'
                }`}
              >
                <span className="text-textMuted leading-tight">
                  <span className="block">{format(new Date(row.appointment.scheduledAt), 'dd MMM', { locale: ptBR })}</span>
                  <span className="block font-mono text-[10px]">
                    {row.appointment.completedAt
                      ? format(new Date(row.appointment.completedAt), 'HH:mm')
                      : '—'}
                  </span>
                </span>
                <span className="font-bold truncate">{row.appointment.client.name}</span>
                <span className="text-textMuted truncate">
                  {row.appointment.services.map((s) => s.service.name).join(', ')}
                </span>
                <span className="text-textMuted">{row.appointment.paymentMethod ?? '—'}</span>
                <span className="text-textMuted">{Math.round(row.rate * 100)}%</span>
                <span className="font-bold text-accent-deep">{formatBRL(row.amount)}</span>
                <span>
                  <StatusBadge status={row.status === 'PAID' ? 'paid' : 'pending'} />
                </span>
              </div>
            ))}
          </div>
          </div>
        </div>

        {/* Paginação */}
        {!loading && !error && totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 text-[13px]">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1.5 rounded-lg border border-line disabled:opacity-40 hover:bg-fill transition-colors"
            >
              ‹ Anterior
            </button>
            <span className="text-textMuted">
              {page + 1} de {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-1.5 rounded-lg border border-line disabled:opacity-40 hover:bg-fill transition-colors"
            >
              Próximo ›
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
