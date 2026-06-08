'use client'

import { Star } from 'lucide-react'
import { formatBRL } from '@/lib/utils/format'
import { initials } from '@/lib/utils/format'

export interface BarberMetric {
  barberId: string
  name: string
  image: string | null
  appointments: number
  totalRevenue: number
  averageTicket: number
  averageRating: number | null
}

export function BarberRanking({ data }: { data: BarberMetric[] }) {
  if (!data.length) {
    return <div className="py-8 text-center text-textMuted text-sm">Sem atendimentos no período.</div>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="font-mono text-[9px] text-textDisabled tracking-wide uppercase text-left">
            <th className="font-normal py-2 pl-1 pr-2">#</th>
            <th className="font-normal py-2 pr-2">Barbeiro</th>
            <th className="font-normal py-2 pr-2 text-right">Atend.</th>
            <th className="font-normal py-2 pr-2 text-right">Faturamento</th>
            <th className="font-normal py-2 pr-2 text-right">Ticket</th>
            <th className="font-normal py-2 pr-1 text-right">Aval.</th>
          </tr>
        </thead>
        <tbody>
          {data.map((b, i) => (
            <tr
              key={b.barberId}
              className={`border-t border-fill transition-colors hover:bg-fill-soft ${i === 0 ? 'bg-accent-soft/40 hover:bg-accent-soft/60' : ''}`}
            >
              <td className="py-2.5 pl-1 pr-2 font-mono text-[11px] text-textDisabled">{i + 1}</td>
              <td className="py-2.5 pr-2">
                <span className="flex items-center gap-2.5">
                  <span className="w-[28px] h-[28px] rounded-full bg-primary text-white text-[11px] flex items-center justify-center font-bold flex-shrink-0 overflow-hidden">
                    {b.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={b.image} alt={b.name} className="w-full h-full object-cover" />
                    ) : (
                      initials(b.name)
                    )}
                  </span>
                  <span className="font-bold">{b.name}</span>
                </span>
              </td>
              <td className="py-2.5 pr-2 text-right text-textMuted">{b.appointments}</td>
              <td className="py-2.5 pr-2 text-right font-bold text-accent-deep">{formatBRL(b.totalRevenue)}</td>
              <td className="py-2.5 pr-2 text-right text-textMuted">{formatBRL(b.averageTicket)}</td>
              <td className="py-2.5 pr-1 text-right">
                {b.averageRating != null ? (
                  <span className="inline-flex items-center gap-0.5 font-semibold">
                    <Star size={12} className="text-accent fill-accent" />
                    {b.averageRating.toFixed(1)}
                  </span>
                ) : (
                  <span className="text-textDisabled">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
