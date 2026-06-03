'use client'

import { useEffect, useState } from 'react'
import { Star } from 'lucide-react'
import { initials } from '@/lib/utils/format'
import type { LandingTestimonial } from '@/lib/landing'

export function Testimonials({ reviews }: { reviews: LandingTestimonial[] }) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused || reviews.length <= 1) return
    const t = setInterval(() => setIndex((i) => (i + 1) % reviews.length), 5000)
    return () => clearInterval(t)
  }, [paused, reviews.length])

  // seção oculta se não há avaliações publicadas
  if (reviews.length === 0) return null

  return (
    <section id="avaliacoes" className="py-16 px-6 md:px-10 text-center scroll-mt-20">
      <p className="text-[11px] font-semibold tracking-widest uppercase text-accent mb-1.5">O que dizem</p>
      <h2 className="font-display font-bold text-[32px] md:text-[38px] text-primary mb-8">Clientes satisfeitos</h2>

      <div
        className="max-w-2xl mx-auto overflow-hidden"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {reviews.map((r) => (
            <div key={r.id} className="min-w-full px-2">
              <div className="border border-line rounded-2xl p-7 bg-white shadow-sm">
                <div className="flex justify-center gap-0.5 mb-3" aria-label={`${r.rating} de 5 estrelas`}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} size={18} className={n <= r.rating ? 'text-accent fill-accent' : 'text-line'} />
                  ))}
                </div>
                {r.comment && <p className="text-[18px] leading-relaxed text-primary italic mb-4">“{r.comment}”</p>}
                <div className="flex items-center gap-2 justify-center">
                  <div className="w-8 h-8 rounded-full bg-primary text-white text-xs flex items-center justify-center font-semibold">
                    {initials(r.clientName)}
                  </div>
                  <span className="text-[13px] font-bold text-primary">{r.clientName}</span>
                  <span className="text-[12px] text-textMuted">· atendido por {r.barberName}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {reviews.length > 1 && (
          <div className="flex justify-center gap-2 mt-5">
            {reviews.map((_, i) => (
              <button
                key={i}
                aria-label={`Ir para avaliação ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-2 rounded-full transition-all ${i === index ? 'w-6 bg-accent' : 'w-2 bg-line'}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
