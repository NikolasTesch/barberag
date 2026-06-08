'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ServiceCard, type ServiceCardData } from './ServiceCard'
import { useBookingStore } from '@/store/bookingStore'
import { cn } from '@/lib/utils/cn'

const CATEGORY_LABEL: Record<string, string> = {
  HAIR: 'Cabelo',
  BEARD: 'Barba',
  COMBO: 'Combo',
  EYEBROW: 'Sobrancelha',
  TREATMENT: 'Tratamento',
}

export function ServiceSelector({ services }: { services: ServiceCardData[] }) {
  const router = useRouter()
  const { selectedServices, toggleService, totalDuration, totalPrice } = useBookingStore()
  const [category, setCategory] = useState<string>('ALL')

  const categories = ['ALL', ...Array.from(new Set(services.map((s) => s.category)))]
  const visible = category === 'ALL' ? services : services.filter((s) => s.category === category)
  const isSelected = (id: string) => selectedServices.some((s) => s.id === id)

  return (
    <div className="flex flex-col h-full">
      {/* Filtro por categoria */}
      <div className="flex gap-1.5 overflow-x-auto px-3 py-2.5 border-b border-fill">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={cn(
              'whitespace-nowrap text-[12px] font-semibold px-3 py-1.5 rounded-full transition-colors',
              category === c ? 'bg-accent text-white' : 'bg-fill text-textMuted'
            )}
          >
            {c === 'ALL' ? 'Todos' : CATEGORY_LABEL[c] ?? c}
          </button>
        ))}
      </div>

      {/* Grid de serviços */}
      <motion.div
        className="flex-1 overflow-y-auto p-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5"
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.05 } } }}
      >
        {visible.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            selected={isSelected(service.id)}
            onToggle={() => toggleService(service)}
          />
        ))}
      </motion.div>

      {/* Footer sticky */}
      <div className="border-t border-line p-3 bg-white">
        <div className="flex justify-between mb-2 text-[13px]">
          {selectedServices.length === 0 ? (
            <span className="text-textMuted">Selecione um serviço para continuar</span>
          ) : (
            <>
              <span>
                {selectedServices.length} serviço{selectedServices.length !== 1 ? 's' : ''} · {totalDuration} min
              </span>
              <span className="font-bold text-accent-deep">
                R$ {totalPrice.toFixed(2).replace('.', ',')}
              </span>
            </>
          )}
        </div>
        <button
          disabled={selectedServices.length === 0}
          onClick={() => router.push('/agendar/barbeiro')}
          className="w-full bg-accent text-white font-semibold text-base py-3 rounded-xl hover:bg-accent-deep transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continuar →
        </button>
      </div>
    </div>
  )
}
