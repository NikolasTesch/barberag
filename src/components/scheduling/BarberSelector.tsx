'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { BarberCard, AnyBarberCard, type BarberCardData } from './BarberCard'
import { useBookingStore } from '@/store/bookingStore'

export function BarberSelector() {
  const router = useRouter()
  const { selectedServices, selectedBarberId, selectBarber } = useBookingStore()

  const [barbers, setBarbers] = useState<BarberCardData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  // Guard: sem serviços, volta ao passo 1.
  useEffect(() => {
    if (selectedServices.length === 0) router.replace('/agendar')
  }, [selectedServices.length, router])

  useEffect(() => {
    if (selectedServices.length === 0) return
    const serviceIds = selectedServices.map((s) => s.id).join(',')
    setLoading(true)
    setError(false)
    fetch(`/api/barbers?serviceIds=${serviceIds}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setBarbers(d.barbers))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [selectedServices])

  function choose(id: string, name: string) {
    selectBarber(id, name)
    router.push('/agendar/horario')
  }

  if (loading) {
    return (
      <div className="p-3 flex flex-col gap-2.5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-[72px] rounded-xl bg-fill animate-pulse" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 text-center text-textMuted text-sm">
        Erro ao carregar barbeiros. Tente novamente.
      </div>
    )
  }

  return (
    <motion.div
      className="p-3 flex flex-col gap-2.5"
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.05 } } }}
    >
      <AnyBarberCard
        selected={selectedBarberId === 'any'}
        onSelect={() => choose('any', 'Qualquer barbeiro')}
      />
      {barbers.map((b) => (
        <BarberCard
          key={b.id}
          barber={b}
          selected={selectedBarberId === b.id}
          onSelect={() => choose(b.id, b.name)}
        />
      ))}
      {barbers.length === 0 && (
        <p className="text-center text-sm text-textMuted py-4">
          Nenhum barbeiro atende todos os serviços escolhidos.
        </p>
      )}
    </motion.div>
  )
}
