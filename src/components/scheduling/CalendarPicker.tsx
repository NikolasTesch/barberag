'use client'

import { useState } from 'react'
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
  isSameDay,
  isSameMonth,
  isBefore,
  startOfDay,
  format,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

export function CalendarPicker({
  selectedDate,
  onSelect,
}: {
  selectedDate: Date | null
  onSelect: (date: Date) => void
}) {
  const [month, setMonth] = useState(startOfMonth(selectedDate ?? new Date()))
  const today = startOfDay(new Date())

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(month)),
    end: endOfWeek(endOfMonth(month)),
  })

  // Desabilita dias passados e domingos (barbearia fechada — sem WorkingHours dia 0).
  const isDisabled = (d: Date) => isBefore(d, today) || d.getDay() === 0

  return (
    <div className="bg-white border border-line rounded-xl p-3">
      <div className="flex items-center justify-between mb-2">
        <button onClick={() => setMonth(addMonths(month, -1))} className="p-1 text-textMuted">
          <ChevronLeft size={18} />
        </button>
        <span className="font-bold text-[14px] capitalize">
          {format(month, "MMMM 'de' yyyy", { locale: ptBR })}
        </span>
        <button onClick={() => setMonth(addMonths(month, 1))} className="p-1 text-textMuted">
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-1">
        {WEEKDAYS.map((w, i) => (
          <span key={i} className="text-[10px] font-mono text-textDisabled">
            {w}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((d) => {
          const disabled = isDisabled(d)
          const selected = selectedDate && isSameDay(d, selectedDate)
          const faded = !isSameMonth(d, month)
          return (
            <button
              key={d.toISOString()}
              disabled={disabled}
              onClick={() => onSelect(startOfDay(d))}
              className={cn(
                'aspect-square rounded-lg text-[13px] font-semibold transition-colors',
                selected && 'bg-accent text-white',
                !selected && !disabled && 'hover:bg-fill text-primary',
                disabled && 'text-textDisabled/40 cursor-not-allowed',
                faded && !selected && 'opacity-40'
              )}
            >
              {d.getDate()}
            </button>
          )
        })}
      </div>
    </div>
  )
}
