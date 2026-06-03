'use client'

import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatBRL, formatBRLCompact } from '@/lib/utils/format'

export interface RevenuePoint {
  date: string // YYYY-MM-DD
  revenue: number
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-line rounded-lg shadow-sm px-3 py-2 text-[12px]">
      <div className="font-mono text-[10px] text-textDisabled uppercase">
        {format(parseISO(label), "d 'de' MMM", { locale: ptBR })}
      </div>
      <div className="font-bold text-accent-deep">{formatBRL(payload[0].value)}</div>
    </div>
  )
}

export function RevenueChart({ data }: { data: RevenuePoint[] }) {
  if (!data.length) {
    return <div className="h-[300px] flex items-center justify-center text-textMuted text-sm">Sem dados no período.</div>
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
        <defs>
          <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#D4830A" stopOpacity={0.2} />
            <stop offset="100%" stopColor="#D4830A" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#F1EFEB" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={(d) => format(parseISO(d), 'dd/MM', { locale: ptBR })}
          tick={{ fontSize: 10, fill: '#B0B0B0' }}
          axisLine={{ stroke: '#E7E4DF' }}
          tickLine={false}
          minTickGap={24}
        />
        <YAxis
          tickFormatter={(v) => formatBRLCompact(v)}
          tick={{ fontSize: 10, fill: '#B0B0B0' }}
          axisLine={false}
          tickLine={false}
          width={56}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#D4830A"
          strokeWidth={2}
          fill="url(#revFill)"
          dot={false}
          activeDot={{ r: 4, fill: '#D4830A' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
