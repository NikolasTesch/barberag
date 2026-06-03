import Link from 'next/link'
import { Star } from 'lucide-react'
import { Reveal } from '@/components/landing/Reveal'
import { initials } from '@/lib/utils/format'
import type { LandingBarber } from '@/lib/landing'

export function Team({ barbers }: { barbers: LandingBarber[] }) {
  if (barbers.length === 0) return null

  return (
    <section id="equipe" className="py-16 px-6 md:px-10 bg-muted text-center scroll-mt-20">
      <div className="max-w-6xl mx-auto">
        <Reveal>
          <p className="text-[11px] font-semibold tracking-widest uppercase text-accent mb-1.5">Quem corta</p>
          <h2 className="font-display font-bold text-[32px] md:text-[38px] text-primary mb-8">Nossa equipe</h2>
        </Reveal>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {barbers.map((b, i) => (
            <Reveal key={b.id} delay={i * 0.05}>
              <div className="border border-line rounded-xl p-5 bg-white flex flex-col items-center gap-2 shadow-sm h-full">
                <div className="w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center text-lg font-bold overflow-hidden">
                  {b.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={b.image} alt={b.name} className="w-full h-full object-cover" />
                  ) : (
                    initials(b.name)
                  )}
                </div>
                <div className="font-bold text-base text-primary mt-1">{b.name}</div>
                {b.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-1 justify-center">
                    {b.specialties.slice(0, 3).map((s) => (
                      <span key={s} className="text-[10px] font-semibold bg-accent-soft text-accent-deep px-2 py-0.5 rounded-full">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
                {b.avgRating != null ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
                    <Star size={13} className="text-accent fill-accent" />
                    {b.avgRating.toFixed(1)}
                    <span className="text-textDisabled font-normal">({b.reviewCount})</span>
                  </span>
                ) : (
                  <span className="text-[11px] text-textDisabled">Sem avaliações ainda</span>
                )}
                <Link
                  href={`/agendar?barberId=${b.id}`}
                  className="w-full mt-1 text-center text-sm font-semibold border border-primary text-primary rounded-lg py-2 hover:bg-primary hover:text-white transition-colors"
                >
                  Agendar
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
