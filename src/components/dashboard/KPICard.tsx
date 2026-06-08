'use client'

import { useEffect, useRef, useState } from 'react'
import type { LucideIcon } from 'lucide-react'

/** Anima de 0 até `value` em `duration` ms via requestAnimationFrame. */
function useCountUp(value: number, duration = 800): number {
  const [display, setDisplay] = useState(0)
  const fromRef = useRef(0)

  useEffect(() => {
    const from = fromRef.current
    const start = performance.now()
    let raf = 0

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3) // easeOutCubic
      setDisplay(from + (value - from) * eased)
      if (t < 1) raf = requestAnimationFrame(tick)
      else fromRef.current = value
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value, duration])

  return display
}

export interface KPICardProps {
  label: string
  /** valor numérico bruto — animado de 0 até ele */
  value: number
  /** formata o valor animado para exibição */
  format: (n: number) => string
  /** variação % vs período anterior (null = sem base de comparação) */
  trend?: number | null
  trendLabel?: string
  loading?: boolean
  accent?: boolean
  icon?: LucideIcon
}

export function KPICard({ label, value, format, trend, trendLabel, loading, accent, icon: Icon }: KPICardProps) {
  const animated = useCountUp(loading ? 0 : value)

  return (
    <div
      className={`flex-1 rounded-[10px] px-3.5 py-3 bg-white shadow-sm transition-shadow hover:shadow ${
        accent ? 'border border-accent/40' : 'border border-line'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="font-mono text-[9.5px] text-textDisabled tracking-wide uppercase leading-tight">{label}</div>
        {Icon && (
          <div
            className={`w-[26px] h-[26px] rounded-lg flex items-center justify-center flex-shrink-0 ${
              accent ? 'bg-accent/10 text-accent' : 'bg-fill text-textMuted'
            }`}
          >
            <Icon size={13} />
          </div>
        )}
      </div>
      {loading ? (
        <div className="h-[27px] w-20 bg-fill rounded animate-pulse" />
      ) : (
        <div className={`font-bold text-[22px] tracking-tight ${accent ? 'text-accent-deep' : 'text-primary'}`}>
          {format(animated)}
        </div>
      )}
      {!loading && trend != null && (
        <div
          className={`mt-1 inline-flex items-center gap-1 text-[11px] font-semibold ${
            trend >= 0 ? 'text-success' : 'text-error'
          }`}
        >
          {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}%
          {trendLabel && <span className="text-textDisabled font-normal ml-0.5">{trendLabel}</span>}
        </div>
      )}
    </div>
  )
}
