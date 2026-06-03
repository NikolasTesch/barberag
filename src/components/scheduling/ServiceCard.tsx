'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export interface ServiceCardData {
  id: string
  name: string
  durationMinutes: number
  price: number
  category: string
}

const CATEGORY_ICON: Record<string, string> = {
  HAIR: '✂',
  BEARD: '✦',
  COMBO: '✂',
  EYEBROW: '◯',
  TREATMENT: '✁',
}

export function ServiceCard({
  service,
  selected,
  onToggle,
}: {
  service: ServiceCardData
  selected: boolean
  onToggle: () => void
}) {
  return (
    <motion.button
      type="button"
      onClick={onToggle}
      variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
      animate={selected ? { scale: 1.02 } : { scale: 1 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'w-full flex items-center gap-2.5 p-2.5 rounded-[10px] border text-left transition-colors',
        selected ? 'border-accent bg-accent-soft' : 'border-line bg-white'
      )}
    >
      <div
        className={cn(
          'w-[38px] h-[38px] flex-shrink-0 rounded-lg border flex items-center justify-center text-base',
          selected ? 'border-accent bg-white' : 'border-line bg-fill'
        )}
      >
        {CATEGORY_ICON[service.category] ?? '✂'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-[14px] leading-tight">{service.name}</div>
        <div className="text-xs text-textMuted">
          {service.durationMinutes} min · R$ {service.price.toFixed(2).replace('.', ',')}
        </div>
      </div>
      <div
        className={cn(
          'w-[22px] h-[22px] rounded-md border flex items-center justify-center flex-shrink-0 transition-colors',
          selected ? 'border-accent bg-accent text-white' : 'border-line bg-white text-transparent'
        )}
      >
        {selected && <Check size={14} />}
      </div>
    </motion.button>
  )
}
