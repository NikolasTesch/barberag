'use client'

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { formatBRL } from '@/lib/utils/format'

export interface ServiceSlice {
  serviceName: string
  revenue: number
  count: number
}

const PALETTE = ['#D4830A', '#B86E08', '#E8A94D', '#F1C684', '#FBEDD6', '#8C5A06', '#C99A5B']

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload as ServiceSlice
  return (
    <div className="bg-white border border-line rounded-lg shadow-sm px-3 py-2 text-[12px]">
      <div className="font-bold">{d.serviceName}</div>
      <div className="text-textMuted">
        {d.count} atend. · <span className="text-accent-deep font-semibold">{formatBRL(d.revenue)}</span>
      </div>
    </div>
  )
}

export function ServicesPieChart({ data }: { data: ServiceSlice[] }) {
  if (!data.length) {
    return <div className="h-[180px] flex items-center justify-center text-textMuted text-sm">Sem dados no período.</div>
  }

  return (
    <div className="flex items-center gap-3">
      <ResponsiveContainer width={140} height={160}>
        <PieChart>
          <Pie
            data={data}
            dataKey="revenue"
            nameKey="serviceName"
            cx="50%"
            cy="50%"
            innerRadius={38}
            outerRadius={66}
            paddingAngle={2}
            stroke="none"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex-1 flex flex-col gap-1.5 min-w-0">
        {data.slice(0, 6).map((s, i) => (
          <div key={s.serviceName} className="flex items-center gap-2 text-[12px]">
            <span
              className="w-3 h-3 rounded-[3px] flex-shrink-0"
              style={{ background: PALETTE[i % PALETTE.length] }}
            />
            <span className="flex-1 font-medium truncate">{s.serviceName}</span>
            <span className="text-textMuted font-mono text-[11px]">{formatBRL(s.revenue)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
