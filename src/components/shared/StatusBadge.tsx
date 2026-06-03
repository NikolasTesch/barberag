import { cn } from '@/lib/utils/cn'

type StatusVariant = 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show' | 'pending' | 'paid'

interface StatusBadgeProps {
  status: StatusVariant
  className?: string
}

const config: Record<StatusVariant, { label: string; bg: string; fg: string }> = {
  scheduled: { label: 'Agendado', bg: 'bg-info/10', fg: 'text-info' },
  in_progress: { label: 'Em Atendimento', bg: 'bg-warning/12', fg: 'text-[#A9791F]' },
  completed: { label: 'Concluído', bg: 'bg-success/12', fg: 'text-success' },
  cancelled: { label: 'Cancelado', bg: 'bg-error/10', fg: 'text-error' },
  no_show: { label: 'Não Compareceu', bg: 'bg-error/10', fg: 'text-error' },
  pending: { label: 'Pendente', bg: 'bg-warning/12', fg: 'text-[#A9791F]' },
  paid: { label: 'Pago', bg: 'bg-success/12', fg: 'text-success' },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const { label, bg, fg } = config[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-[12.5px] font-semibold px-2.5 py-[5px] rounded-full',
        bg,
        fg,
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {label}
    </span>
  )
}
