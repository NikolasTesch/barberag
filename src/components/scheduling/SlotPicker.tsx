'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils/cn'

const GROUPS: { label: string; from: number; to: number }[] = [
  { label: 'Manhã', from: 9 * 60, to: 12 * 60 },
  { label: 'Tarde', from: 12 * 60, to: 17 * 60 },
  { label: 'Noite', from: 17 * 60, to: 19 * 60 },
]

function toMinutes(slot: string) {
  const [h, m] = slot.split(':').map(Number)
  return h * 60 + m
}

export function SlotPicker({
  barberId,
  date,
  duration,
  selectedSlot,
  onSelect,
}: {
  barberId: string
  date: Date
  duration: number
  selectedSlot: string | null
  onSelect: (slot: string) => void
}) {
  const [slots, setSlots] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const dateStr = format(date, 'yyyy-MM-dd')
    // 'any' não tem disponibilidade própria — usa a janela padrão da barbearia (barberId null).
    const id = barberId === 'any' ? 'any' : barberId
    setLoading(true)
    setError(false)
    fetch(`/api/barbers/${id}/availability?date=${dateStr}&duration=${duration}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setSlots(d.slots))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [barberId, date, duration])

  if (loading) {
    return (
      <div className="grid grid-cols-4 gap-2 mt-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-9 rounded-lg bg-fill animate-pulse" />
        ))}
      </div>
    )
  }

  if (error) {
    return <p className="text-center text-sm text-textMuted py-6">Erro ao carregar horários.</p>
  }

  if (slots.length === 0) {
    return (
      <p className="text-center text-sm text-textMuted py-6">
        Nenhum horário disponível neste dia. Escolha outra data.
      </p>
    )
  }

  return (
    <div className="mt-3 flex flex-col gap-3">
      {GROUPS.map((g) => {
        const groupSlots = slots.filter((s) => toMinutes(s) >= g.from && toMinutes(s) < g.to)
        if (groupSlots.length === 0) return null
        return (
          <div key={g.label}>
            <p className="text-[10px] font-semibold tracking-widest uppercase text-textMuted mb-1.5">
              {g.label}
            </p>
            <div className="grid grid-cols-4 gap-2">
              {groupSlots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => onSelect(slot)}
                  className={cn(
                    'h-9 rounded-lg text-[13px] font-semibold border transition-colors',
                    selectedSlot === slot
                      ? 'bg-accent text-white border-accent'
                      : 'bg-white border-line text-primary hover:border-accent'
                  )}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
