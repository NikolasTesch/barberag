'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { StepIndicator } from '@/components/scheduling/StepIndicator'
import { BookingSummary } from '@/components/scheduling/BookingSummary'
import { BookingSuccess } from '@/components/scheduling/BookingSuccess'
import { useBookingStore } from '@/store/bookingStore'

export default function ConfirmarPage() {
  const router = useRouter()
  const store = useBookingStore()
  const {
    selectedServices,
    selectedBarberId,
    selectedBarberName,
    selectedDate,
    selectedSlot,
    totalDuration,
    totalPrice,
  } = store

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Guard: sem slot, volta ao passo 3.
  useEffect(() => {
    if (!success && (!selectedSlot || !selectedDate)) router.replace('/agendar/horario')
  }, [success, selectedSlot, selectedDate, router])

  if (success) {
    return (
      <div className="flex flex-col h-full bg-white">
        <BookingSuccess />
      </div>
    )
  }

  if (!selectedSlot || !selectedDate || !selectedBarberId) return null

  const scheduledAt = new Date(selectedDate)
  const [h, m] = selectedSlot.split(':').map(Number)
  scheduledAt.setHours(h, m, 0, 0)

  async function confirm() {
    setError(null)
    setSubmitting(true)
    const res = await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        barberId: selectedBarberId,
        scheduledAt: scheduledAt.toISOString(),
        services: selectedServices.map((s) => ({ serviceId: s.id })),
      }),
    })

    if (res.status === 201) {
      setSuccess(true)
      store.reset()
      return
    }

    setSubmitting(false)
    if (res.status === 409) {
      setError('Este horário acabou de ser ocupado. Por favor, escolha outro.')
      setTimeout(() => router.push('/agendar/horario'), 1600)
      return
    }
    setError('Erro ao confirmar agendamento. Tente novamente.')
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <StepIndicator activeStep={3} />
      <div className="px-3 pt-3 flex items-center gap-2">
        <Link href="/agendar/horario" className="text-textMuted">
          <ChevronLeft size={18} />
        </Link>
        <p className="text-[10px] font-semibold tracking-widest uppercase text-textMuted">
          Confirme seu agendamento
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {error && (
          <div className="mb-3 rounded-lg bg-error/10 border border-error/30 px-3.5 py-2.5 text-sm text-error">
            {error}
          </div>
        )}
        <BookingSummary
          barberName={selectedBarberName ?? 'Qualquer barbeiro'}
          services={selectedServices}
          scheduledAt={scheduledAt}
          totalDuration={totalDuration}
          totalPrice={totalPrice}
        />
      </div>

      <div className="border-t border-line p-3 bg-white">
        <button
          disabled={submitting}
          onClick={confirm}
          className="w-full bg-accent text-white font-semibold text-base py-3 rounded-xl hover:bg-accent-deep transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Aguarde...' : 'Confirmar Agendamento'}
        </button>
      </div>
    </div>
  )
}
