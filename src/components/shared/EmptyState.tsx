import { cn } from '@/lib/utils/cn'

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
  action?: React.ReactNode
  tone?: 'default' | 'accent' | 'error'
  className?: string
}

const toneMap = {
  default: 'border-line text-textDisabled',
  accent: 'border-accent text-accent',
  error: 'border-error text-error',
}

export function EmptyState({ icon, title, description, action, tone = 'default', className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'bg-white border border-line rounded-xl flex flex-col items-center justify-center gap-3 p-6 text-center',
        className
      )}
    >
      <div
        className={cn(
          'w-[60px] h-[60px] rounded-full border border-dashed flex items-center justify-center text-[28px]',
          toneMap[tone]
        )}
      >
        {icon}
      </div>
      <div className="font-bold text-[16px] text-primary">{title}</div>
      <p className="text-[15px] text-textMuted leading-snug max-w-[220px]">{description}</p>
      {action && <div className="mt-0.5">{action}</div>}
    </div>
  )
}
