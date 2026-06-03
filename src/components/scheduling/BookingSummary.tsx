'use client'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Clock, Calendar, User } from 'lucide-react'
import type { SelectedService } from '@/store/bookingStore'

export function BookingSummary({
  barberName,
  services,
  scheduledAt,
  totalDuration,
  totalPrice,
}: {
  barberName: string
  services: SelectedService[]
  scheduledAt: Date
  totalDuration: number
  totalPrice: number
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="bg-white border border-line rounded-xl p-3 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-accent/15 text-accent flex items-center justify-center">
          <User size={20} />
        </div>
        <div>
          <div className="text-[11px] text-textMuted">Barbeiro</div>
          <div className="font-bold text-[15px] text-primary">{barberName}</div>
        </div>
      </div>

      <div className="bg-white border border-line rounded-xl p-3">
        <div className="text-[11px] text-textMuted mb-2">Serviços</div>
        <div className="flex flex-col gap-2">
          {services.map((s) => (
            <div key={s.id} className="flex justify-between text-[14px]">
              <span>
                {s.name}{' '}
                <span className="text-textMuted text-[12px]">· {s.durationMinutes} min</span>
              </span>
              <span className="font-semibold">R$ {s.price.toFixed(2).replace('.', ',')}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-line rounded-xl p-3 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-[14px]">
          <Calendar size={16} className="text-accent" />
          <span className="capitalize">
            {format(scheduledAt, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[14px]">
          <Clock size={16} className="text-accent" />
          <span>
            {format(scheduledAt, 'HH:mm')} · {totalDuration} min
          </span>
        </div>
      </div>

      <div className="bg-primary text-white rounded-xl p-4 flex justify-between items-center">
        <span className="text-[13px] text-white/70">Total</span>
        <span className="font-display font-black text-[24px] text-accent">
          R$ {totalPrice.toFixed(2).replace('.', ',')}
        </span>
      </div>

      <p className="text-[12px] text-textMuted text-center px-4">
        Cancele com pelo menos 2h de antecedência através do app.
      </p>
    </div>
  )
}
