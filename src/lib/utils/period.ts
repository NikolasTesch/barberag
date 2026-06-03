import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subDays,
  subWeeks,
  subMonths,
} from 'date-fns'

export type Period = 'today' | 'week' | 'month' | 'custom'

export interface DateRange {
  gte: Date
  lte: Date
}

/**
 * Resolve um `period` (e `from`/`to` quando custom) em um intervalo de datas.
 * Usado por todos os endpoints de métricas para manter consistência. Para
 * `custom` sem datas válidas, faz fallback para o mês corrente.
 */
export function resolveRange(
  period: string | null,
  from?: string | null,
  to?: string | null,
  now: Date = new Date()
): { period: Period; range: DateRange } {
  switch (period) {
    case 'today':
      return { period: 'today', range: { gte: startOfDay(now), lte: endOfDay(now) } }
    case 'week':
      return {
        period: 'week',
        range: { gte: startOfWeek(now, { weekStartsOn: 1 }), lte: endOfWeek(now, { weekStartsOn: 1 }) },
      }
    case 'custom': {
      if (from && to) {
        const gte = startOfDay(new Date(from))
        const lte = endOfDay(new Date(to))
        if (!isNaN(gte.getTime()) && !isNaN(lte.getTime())) {
          return { period: 'custom', range: { gte, lte } }
        }
      }
      return { period: 'month', range: { gte: startOfMonth(now), lte: endOfMonth(now) } }
    }
    case 'month':
    default:
      return { period: 'month', range: { gte: startOfMonth(now), lte: endOfMonth(now) } }
  }
}

/**
 * Intervalo imediatamente anterior ao `range`, de mesma duração — usado para
 * calcular variação percentual (trend) nos KPIs do dashboard.
 */
export function previousRange(period: Period, range: DateRange, now: Date = new Date()): DateRange {
  switch (period) {
    case 'today':
      return { gte: startOfDay(subDays(now, 1)), lte: endOfDay(subDays(now, 1)) }
    case 'week': {
      const prev = subWeeks(now, 1)
      return { gte: startOfWeek(prev, { weekStartsOn: 1 }), lte: endOfWeek(prev, { weekStartsOn: 1 }) }
    }
    case 'month': {
      const prev = subMonths(now, 1)
      return { gte: startOfMonth(prev), lte: endOfMonth(prev) }
    }
    case 'custom':
    default: {
      const durationMs = range.lte.getTime() - range.gte.getTime()
      return {
        gte: new Date(range.gte.getTime() - durationMs - 1),
        lte: new Date(range.gte.getTime() - 1),
      }
    }
  }
}

/** Variação percentual de `current` vs `previous`. null quando base é 0. */
export function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null
  return Math.round(((current - previous) / previous) * 100)
}
