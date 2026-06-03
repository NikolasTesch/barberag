'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { StepIndicator } from '@/components/scheduling/StepIndicator'
import { CalendarPicker } from '@/components/scheduling/CalendarPicker'
import { SlotPicker } from '@/components/scheduling/SlotPicker'
import { useBookingStore } from '@/store/bookingStore'

export default function HorarioPage() {
  const router = useRouter()
  const {
    selectedBarberId,
    selectedDate,
    selectedSlot,
    totalDuration,
    selectDate,
    selectSlot,
  } = useBookingStore()

  // Guard: sem barbeiro, volta ao passo 2.
  useEffect(() => {
    if (!selectedBarberId) router.replace('/agendar/barbeiro')
  }, [selectedBarberId, router])

  if (!selectedBarberId) return null

  return (
    <div className="flex flex-col h-full bg-white">
      <StepIndicator activeStep={2} />
      <div className="px-3 pt-3 flex items-center gap-2">
        <Link href="/agendar/barbeiro" className="text-textMuted">
          <ChevronLeft size={18} />
        </Link>
        <p className="text-[10px] font-semibold tracking-widest uppercase text-textMuted">
          Escolha data e horário
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <CalendarPicker selectedDate={selectedDate} onSelect={selectDate} />
        {selectedDate && (
          <SlotPicker
            barberId={selectedBarberId}
            date={selectedDate}
            duration={totalDuration}
            selectedSlot={selectedSlot}
            onSelect={selectSlot}
          />
        )}
      </div>

      <div className="border-t border-line p-3 bg-white">
        <button
          disabled={!selectedSlot}
          onClick={() => router.push('/agendar/confirmar')}
          className="w-full bg-accent text-white font-semibold text-base py-3 rounded-xl hover:bg-accent-deep transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continuar →
        </button>
      </div>
    </div>
  )
}
