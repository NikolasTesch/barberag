import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { StepIndicator } from '@/components/scheduling/StepIndicator'
import { BarberSelector } from '@/components/scheduling/BarberSelector'

export default function BarbeiroPage() {
  return (
    <div className="flex flex-col h-full bg-white">
      <StepIndicator activeStep={1} />
      <div className="px-3 pt-3 flex items-center gap-2">
        <Link href="/agendar" className="text-textMuted">
          <ChevronLeft size={18} />
        </Link>
        <p className="text-[10px] font-semibold tracking-widest uppercase text-textMuted">
          Escolha o barbeiro
        </p>
      </div>
      <div className="flex-1 overflow-y-auto">
        <BarberSelector />
      </div>
    </div>
  )
}
