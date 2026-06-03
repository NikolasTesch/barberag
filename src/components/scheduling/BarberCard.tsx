'use client'

import { motion } from 'framer-motion'
import { Star, Users } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export interface BarberCardData {
  id: string
  name: string
  image: string | null
  specialties: string[]
  avgRating: number | null
  reviewCount: number
}

export function BarberCard({
  barber,
  selected,
  onSelect,
}: {
  barber: BarberCardData
  selected: boolean
  onSelect: () => void
}) {
  const initials = barber.name
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
      animate={selected ? { scale: 1.02 } : { scale: 1 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-colors',
        selected ? 'border-accent bg-accent-soft' : 'border-line bg-white'
      )}
    >
      <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold flex-shrink-0 overflow-hidden">
        {barber.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={barber.image} alt={barber.name} className="w-full h-full object-cover" />
        ) : (
          initials
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-[15px] text-primary">{barber.name}</div>
        <div className="flex flex-wrap gap-1 mt-1">
          {barber.specialties.slice(0, 3).map((s) => (
            <span key={s} className="text-[10px] bg-fill text-textMuted px-2 py-0.5 rounded-full">
              {s}
            </span>
          ))}
        </div>
      </div>
      {barber.avgRating !== null && (
        <div className="flex items-center gap-1 text-[13px] text-textMuted flex-shrink-0">
          <Star size={14} className="fill-warning text-warning" />
          <span className="font-semibold text-primary">{barber.avgRating.toFixed(1)}</span>
          <span className="text-[11px]">({barber.reviewCount})</span>
        </div>
      )}
    </motion.button>
  )
}

export function AnyBarberCard({ selected, onSelect }: { selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-colors',
        selected ? 'border-accent bg-accent-soft' : 'border-line bg-white'
      )}
    >
      <div className="w-12 h-12 rounded-full bg-accent/15 text-accent flex items-center justify-center flex-shrink-0">
        <Users size={22} />
      </div>
      <div className="flex-1">
        <div className="font-bold text-[15px] text-primary">Qualquer barbeiro disponível</div>
        <div className="text-[12px] text-textMuted">Atribuímos o profissional com melhor horário</div>
      </div>
    </button>
  )
}
