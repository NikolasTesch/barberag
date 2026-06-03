'use client'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar, Clock, User } from 'lucide-react'
import { StatusBadge } from '@/components/shared/StatusBadge'

export interface AppointmentDTO {
  id: string
  status: 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'NO_SHOW' | 'CANCELLED'
  scheduledAt: string
  totalDuration: number
  totalPrice: number
  barber: { user: { name: string } }
  services: { serviceId: string; price: number; duration: number; service: { name: string } }[]
}

const STATUS_MAP = {
  SCHEDULED: 'scheduled',
  CONFIRMED: 'scheduled',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  NO_SHOW: 'no_show',
  CANCELLED: 'cancelled',
} as const

export function AppointmentCard({
  appointment,
  onCancel,
  onReschedule,
}: {
  appointment: AppointmentDTO
  onCancel?: () => void
  onReschedule?: () => void
}) {
  const date = new Date(appointment.scheduledAt)
  const isFuture = date.getTime() > Date.now()
  const canManage =
    isFuture && (appointment.status === 'SCHEDULED' || appointment.status === 'CONFIRMED')

  return (
    <div className="bg-white border border-line rounded-xl p-3 flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <StatusBadge status={STATUS_MAP[appointment.status]} />
        <span className="font-bold text-accent-deep text-[14px]">
          R$ {appointment.totalPrice.toFixed(2).replace('.', ',')}
        </span>
      </div>

      <div className="flex flex-wrap gap-1">
        {appointment.services.map((s) => (
          <span key={s.serviceId} className="text-[11px] bg-fill text-textMuted px-2 py-0.5 rounded-full">
            {s.service.name}
          </span>
        ))}
      </div>

      <div className="flex flex-col gap-1 text-[13px] text-textMuted">
        <div className="flex items-center gap-1.5">
          <User size={14} /> {appointment.barber.user.name}
        </div>
        <div className="flex items-center gap-1.5 capitalize">
          <Calendar size={14} /> {format(date, "EEE, d 'de' MMM", { locale: ptBR })}
        </div>
        <div className="flex items-center gap-1.5">
          <Clock size={14} /> {format(date, 'HH:mm')} · {appointment.totalDuration} min
        </div>
      </div>

      {canManage && (
        <div className="flex gap-2 pt-1">
          <button
            onClick={onReschedule}
            className="flex-1 text-[13px] font-semibold py-2 rounded-lg border border-line text-primary hover:bg-fill transition-colors"
          >
            Reagendar
          </button>
          <button
            onClick={onCancel}
            className="flex-1 text-[13px] font-semibold py-2 rounded-lg border border-error/40 text-error hover:bg-error/5 transition-colors"
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  )
}
