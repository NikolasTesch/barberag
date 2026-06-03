import Link from 'next/link'
import { Scissors, CircleDot, LayoutGrid, Sparkles, Eye } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Reveal } from '@/components/landing/Reveal'
import { formatBRL } from '@/lib/utils/format'
import type { LandingService } from '@/lib/landing'
import type { ServiceCategory } from '@prisma/client'

const CATEGORY_ICON: Record<ServiceCategory, LucideIcon> = {
  HAIR: Scissors,
  BEARD: CircleDot,
  COMBO: LayoutGrid,
  EYEBROW: Eye,
  TREATMENT: Sparkles,
}

export function Services({ services }: { services: LandingService[] }) {
  return (
    <section id="servicos" className="py-16 px-6 md:px-10 text-center max-w-6xl mx-auto scroll-mt-20">
      <Reveal>
        <p className="text-[11px] font-semibold tracking-widest uppercase text-accent mb-1.5">O que fazemos</p>
        <h2 className="font-display font-bold text-[32px] md:text-[38px] text-primary mb-8">Nossos serviços</h2>
      </Reveal>

      {services.length === 0 ? (
        <p className="text-textMuted">Em breve, nossos serviços por aqui.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {services.map((s, i) => {
            const Icon = CATEGORY_ICON[s.category] ?? Scissors
            return (
              <Reveal key={s.id} delay={i * 0.05}>
                <div className="border border-line rounded-xl p-5 bg-muted text-left hover:shadow-lg hover:-translate-y-1 transition-all h-full flex flex-col">
                  <div className="h-[72px] bg-white rounded-lg flex items-center justify-center mb-3">
                    <Icon size={30} className="text-accent" />
                  </div>
                  <div className="font-bold text-[16px] text-primary">{s.name}</div>
                  {s.description && <div className="text-[12px] text-textMuted mt-1 line-clamp-2">{s.description}</div>}
                  <div className="mt-auto pt-3 flex items-center justify-between">
                    <span className="text-sm font-semibold text-primary">
                      {s.basePrice > 0 ? formatBRL(s.basePrice) : 'Consulte'}
                    </span>
                    <span className="text-[11px] text-textMuted">{s.durationMinutes} min</span>
                  </div>
                </div>
              </Reveal>
            )
          })}
        </div>
      )}

      <Reveal delay={0.1}>
        <Link
          href="/agendar"
          className="inline-block mt-8 bg-accent text-white font-semibold px-7 py-3 rounded-lg hover:bg-accent-deep transition-colors"
        >
          Agende seu horário
        </Link>
      </Reveal>
    </section>
  )
}
