import { cn } from '@/lib/utils/cn'

const STEPS = ['Serviço', 'Barbeiro', 'Horário', 'Confirmar']

interface StepIndicatorProps {
  activeStep: number
}

export function StepIndicator({ activeStep }: StepIndicatorProps) {
  return (
    <div className="px-3 pt-3 pb-2 border-b border-fill lg:max-w-3xl lg:w-full lg:mx-auto lg:px-0">
      <div className="flex gap-1.5 mb-1.5">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={cn(
              'flex-1 h-1.5 rounded-full transition-colors',
              i <= activeStep ? 'bg-accent' : 'bg-fill'
            )}
          />
        ))}
      </div>
      <div className="flex justify-between">
        {STEPS.map((label, i) => (
          <span
            key={label}
            className={cn(
              'text-[9px] font-mono',
              i === activeStep ? 'text-accent-deep font-bold' : 'text-textDisabled'
            )}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}
