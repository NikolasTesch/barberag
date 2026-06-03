'use client'

import { format } from 'date-fns'

export type PeriodValue = 'today' | 'week' | 'month' | 'custom'

export interface PeriodState {
  period: PeriodValue
  from: string // YYYY-MM-DD (usado só em custom)
  to: string
}

const TABS: { value: PeriodValue; label: string }[] = [
  { value: 'today', label: 'Hoje' },
  { value: 'week', label: 'Esta semana' },
  { value: 'month', label: 'Este mês' },
  { value: 'custom', label: 'Personalizado' },
]

export function defaultPeriod(): PeriodState {
  const today = format(new Date(), 'yyyy-MM-dd')
  return { period: 'month', from: today, to: today }
}

/** Monta a query string de período para os endpoints de métricas. */
export function periodQuery(state: PeriodState): string {
  const params = new URLSearchParams({ period: state.period })
  if (state.period === 'custom') {
    params.set('from', state.from)
    params.set('to', state.to)
  }
  return params.toString()
}

export function PeriodFilter({
  value,
  onChange,
}: {
  value: PeriodState
  onChange: (next: PeriodState) => void
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {TABS.map((t) => (
        <button
          key={t.value}
          onClick={() => onChange({ ...value, period: t.value })}
          className={`text-xs font-semibold px-3 py-1 rounded-full border transition-colors ${
            value.period === t.value
              ? 'bg-primary text-white border-primary'
              : 'bg-white text-textMuted border-line hover:border-accent/40'
          }`}
        >
          {t.label}
        </button>
      ))}

      {value.period === 'custom' && (
        <span className="flex items-center gap-1.5 text-xs">
          <input
            type="date"
            value={value.from}
            max={value.to}
            onChange={(e) => onChange({ ...value, from: e.target.value })}
            className="border border-line rounded-md px-2 py-1 text-textPrimary"
          />
          <span className="text-textDisabled">→</span>
          <input
            type="date"
            value={value.to}
            min={value.from}
            onChange={(e) => onChange({ ...value, to: e.target.value })}
            className="border border-line rounded-md px-2 py-1 text-textPrimary"
          />
        </span>
      )}
    </div>
  )
}
