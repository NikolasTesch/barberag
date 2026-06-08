'use client'

import { useCallback, useEffect, useState } from 'react'
import { DollarSign, Scissors, CreditCard, UserPlus, BarChart2 } from 'lucide-react'
import { KPICard } from '@/components/dashboard/KPICard'
import { RevenueChart, type RevenuePoint } from '@/components/dashboard/RevenueChart'
import { ServicesPieChart, type ServiceSlice } from '@/components/dashboard/ServicesPieChart'
import { BarberRanking, type BarberMetric } from '@/components/dashboard/BarberRanking'
import { OccupancyGrid, nowDateParam } from '@/components/dashboard/OccupancyGrid'
import {
  PeriodFilter,
  defaultPeriod,
  periodQuery,
  type PeriodState,
} from '@/components/dashboard/PeriodFilter'
import { formatBRL, formatBRLCompact } from '@/lib/utils/format'

interface Overview {
  kpis: {
    totalRevenue: number
    totalAppointments: number
    averageTicket: number
    newClients: number
    occupancyRate: number
  }
  trends: {
    totalRevenue: number | null
    totalAppointments: number | null
    averageTicket: number | null
    newClients: number | null
  }
}

const TREND_LABEL: Record<PeriodState['period'], string> = {
  today: 'vs. ontem',
  week: 'vs. semana ant.',
  month: 'vs. mês ant.',
  custom: 'vs. período ant.',
}

function Panel({
  title,
  right,
  children,
}: {
  title: string
  right?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="border border-line rounded-xl bg-white shadow-sm flex flex-col p-3.5">
      <div className="flex items-center mb-3">
        <p className="text-[10px] font-bold tracking-widest uppercase text-textDisabled flex-1">{title}</p>
        {right}
      </div>
      <div className="border-t border-fill -mx-3.5 mb-3.5" />
      {children}
    </div>
  )
}

export default function DashboardPage() {
  const [period, setPeriod] = useState<PeriodState>(defaultPeriod)
  const [overview, setOverview] = useState<Overview | null>(null)
  const [revenue, setRevenue] = useState<RevenuePoint[]>([])
  const [services, setServices] = useState<ServiceSlice[]>([])
  const [barbers, setBarbers] = useState<BarberMetric[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const load = useCallback(async (state: PeriodState) => {
    setLoading(true)
    setError(false)
    const qs = periodQuery(state)
    try {
      const [ov, rev, svc, brb] = await Promise.all([
        fetch(`/api/admin/metrics/overview?${qs}`),
        fetch(`/api/admin/metrics/revenue?groupBy=day&${qs}`),
        fetch(`/api/admin/metrics/revenue?groupBy=service&${qs}`),
        fetch(`/api/admin/metrics/barbers?${qs}`),
      ])
      if (![ov, rev, svc, brb].every((r) => r.ok)) throw new Error('fetch failed')
      setOverview(await ov.json())
      setRevenue((await rev.json()).data)
      setServices((await svc.json()).data)
      setBarbers((await brb.json()).data)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // re-fetcha sempre que o período (ou as datas do custom) mudam
    if (period.period === 'custom' && (!period.from || !period.to)) return
    load(period)
  }, [period, load])

  const k = overview?.kpis
  const t = overview?.trends
  const trendLabel = TREND_LABEL[period.period]

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 px-4 sm:px-[22px] py-4 border-b border-line bg-white">
        <div>
          <div className="font-bold text-[19px] text-primary">Dashboard</div>
          <div className="text-[13px] text-textMuted">Métricas em tempo real · atualizado a cada atendimento</div>
        </div>
        <div className="ml-auto">
          <PeriodFilter value={period} onChange={setPeriod} />
        </div>
      </div>

      <div className="p-4 flex flex-col gap-3.5 overflow-auto">
        {error && (
          <div className="border border-error/30 bg-error/5 text-error rounded-lg px-4 py-3 text-sm flex items-center justify-between">
            <span>Erro ao carregar as métricas.</span>
            <button onClick={() => load(period)} className="font-semibold underline">
              Tentar novamente
            </button>
          </div>
        )}

        {/* KPIs */}
        <div className="flex gap-3 flex-wrap">
          <KPICard
            label="Faturamento"
            value={k?.totalRevenue ?? 0}
            format={formatBRLCompact}
            trend={t?.totalRevenue}
            trendLabel={trendLabel}
            loading={loading}
            accent
            icon={DollarSign}
          />
          <KPICard
            label="Atendimentos"
            value={k?.totalAppointments ?? 0}
            format={(n) => String(Math.round(n))}
            trend={t?.totalAppointments}
            trendLabel={trendLabel}
            loading={loading}
            icon={Scissors}
          />
          <KPICard
            label="Ticket Médio"
            value={k?.averageTicket ?? 0}
            format={formatBRL}
            trend={t?.averageTicket}
            trendLabel={trendLabel}
            loading={loading}
            icon={CreditCard}
          />
          <KPICard
            label="Novos Clientes"
            value={k?.newClients ?? 0}
            format={(n) => `+${Math.round(n)}`}
            trend={t?.newClients}
            trendLabel={trendLabel}
            loading={loading}
            icon={UserPlus}
          />
          <KPICard
            label="Ocupação"
            value={k?.occupancyRate ?? 0}
            format={(n) => `${Math.round(n)}%`}
            loading={loading}
            icon={BarChart2}
          />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-3.5">
          <Panel title="Faturamento no período">
            {loading ? (
              <div className="h-[300px] bg-fill/40 rounded animate-pulse" />
            ) : (
              <RevenueChart data={revenue} />
            )}
          </Panel>

          <Panel title="Por serviço">
            {loading ? (
              <div className="h-[160px] bg-fill/40 rounded animate-pulse" />
            ) : (
              <ServicesPieChart data={services} />
            )}
          </Panel>
        </div>

        {/* Ranking */}
        <Panel title="Ranking de barbeiros">
          {loading ? (
            <div className="h-32 bg-fill/40 rounded animate-pulse" />
          ) : (
            <BarberRanking data={barbers} />
          )}
        </Panel>

        {/* Live occupancy */}
        <Panel
          title="Agenda em tempo real — hoje"
          right={
            <span className="text-[11px] font-semibold text-accent bg-accent-soft px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse flex-shrink-0" />
              ao vivo
            </span>
          }
        >
          <OccupancyGrid date={nowDateParam()} />
        </Panel>
      </div>
    </div>
  )
}
