'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { initials } from '@/lib/utils/format'

interface OccBarber {
  id: string
  name: string
  image: string | null
}

interface OccAppointment {
  id: string
  barberId: string
  status: 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'NO_SHOW' | 'CANCELLED'
  scheduledAt: string
  totalDuration: number
  clientName: string
  services: string[]
}

const SLOT_MINUTES = 15
const START_HOUR = 9
const END_HOUR = 19 // exclusivo → último slot 18:45

function buildSlots(): string[] {
  const slots: string[] = []
  for (let h = START_HOUR; h < END_HOUR; h++) {
    for (let m = 0; m < 60; m += SLOT_MINUTES) {
      slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
    }
  }
  return slots
}

const SLOTS = buildSlots()

function slotIndexOf(date: Date): number {
  const minutes = (date.getHours() - START_HOUR) * 60 + date.getMinutes()
  return Math.floor(minutes / SLOT_MINUTES)
}

const STATUS_STYLES: Record<string, string> = {
  SCHEDULED: 'bg-accent-soft text-accent-deep border border-accent/30',
  CONFIRMED: 'bg-accent-soft text-accent-deep border border-accent/30',
  IN_PROGRESS: 'bg-accent text-white border border-accent-deep animate-pulse',
  COMPLETED: 'bg-success/15 text-success border border-success/30',
  NO_SHOW: 'bg-primary/10 text-textMuted border border-line',
}

export function OccupancyGrid({ date }: { date: string }) {
  const [barbers, setBarbers] = useState<OccBarber[]>([])
  const [appointments, setAppointments] = useState<OccAppointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setError(false)
        const res = await fetch(`/api/admin/occupancy?date=${date}`)
        if (!res.ok) throw new Error('fetch failed')
        const json = await res.json()
        if (cancelled) return
        setBarbers(json.barbers)
        setAppointments(json.appointments)
      } catch {
        if (!cancelled) setError(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    const interval = setInterval(load, 60_000) // revalida a cada 60s
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [date])

  if (loading) {
    return <div className="h-40 flex items-center justify-center text-textMuted text-sm">Carregando ocupação…</div>
  }
  if (error) {
    return <div className="h-40 flex items-center justify-center text-error text-sm">Erro ao carregar ocupação.</div>
  }
  if (!barbers.length) {
    return <div className="h-40 flex items-center justify-center text-textMuted text-sm">Nenhum barbeiro ativo.</div>
  }

  // mapeia cada slot ocupado → appointment (e marca slots cobertos pela duração)
  const cellMap = new Map<string, { appt: OccAppointment; isStart: boolean; span: number }>()
  for (const appt of appointments) {
    const startIdx = slotIndexOf(new Date(appt.scheduledAt))
    const span = Math.max(1, Math.ceil(appt.totalDuration / SLOT_MINUTES))
    for (let i = 0; i < span; i++) {
      const slotIdx = startIdx + i
      if (slotIdx < 0 || slotIdx >= SLOTS.length) continue
      cellMap.set(`${appt.barberId}-${slotIdx}`, { appt, isStart: i === 0, span })
    }
  }

  return (
    <div className="overflow-auto max-h-[420px] border border-line rounded-lg">
      <table className="w-full border-collapse text-[11px]">
        <thead className="sticky top-0 z-10 bg-white">
          <tr>
            <th className="w-14 p-1.5 font-mono text-[9px] text-textDisabled border-b border-line text-left sticky left-0 bg-white">
              hora
            </th>
            {barbers.map((b) => (
              <th key={b.id} className="p-1.5 border-b border-l border-line min-w-[96px]">
                <span className="flex items-center gap-1.5 justify-center">
                  <span className="w-5 h-5 rounded-full bg-primary text-white text-[9px] flex items-center justify-center font-bold flex-shrink-0 overflow-hidden">
                    {b.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={b.image} alt={b.name} className="w-full h-full object-cover" />
                    ) : (
                      initials(b.name)
                    )}
                  </span>
                  <span className="font-bold truncate">{b.name.split(' ')[0]}</span>
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {SLOTS.map((slot, slotIdx) => (
            <tr key={slot}>
              <td className="p-1 font-mono text-[9px] text-textDisabled border-b border-fill sticky left-0 bg-white">
                {slot.endsWith(':00') ? slot : ''}
              </td>
              {barbers.map((b) => {
                const cell = cellMap.get(`${b.id}-${slotIdx}`)
                if (cell && !cell.isStart) return null
                if (cell?.isStart) {
                  const { appt, span } = cell
                  return (
                    <td
                      key={b.id}
                      rowSpan={span}
                      className="p-0.5 border-b border-l border-fill align-top"
                    >
                      <div
                        title={`${slot} · ${appt.clientName} · ${appt.services.join(', ')}`}
                        className={`h-full min-h-[22px] rounded px-1.5 py-1 text-[10px] leading-tight cursor-default ${
                          STATUS_STYLES[appt.status] ?? 'bg-fill'
                        }`}
                      >
                        <div className="font-semibold truncate">{appt.clientName.split(' ')[0]}</div>
                        <div className="truncate opacity-80">{appt.services[0]}</div>
                      </div>
                    </td>
                  )
                }
                return <td key={b.id} className="border-b border-l border-fill bg-fill-soft/40" />
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function nowDateParam(): string {
  return format(new Date(), 'yyyy-MM-dd')
}
