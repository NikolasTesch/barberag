'use client'

import { useCallback, useEffect, useState } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import type { LandingGalleryImage } from '@/lib/landing'

export function Gallery({ images }: { images: LandingGalleryImage[] }) {
  const [active, setActive] = useState<number | null>(null)

  const close = useCallback(() => setActive(null), [])
  const prev = useCallback(() => setActive((i) => (i == null ? i : (i - 1 + images.length) % images.length)), [images.length])
  const next = useCallback(() => setActive((i) => (i == null ? i : (i + 1) % images.length)), [images.length])

  useEffect(() => {
    if (active == null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      else if (e.key === 'ArrowLeft') prev()
      else if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, close, prev, next])

  if (images.length === 0) return null

  return (
    <section id="galeria" className="py-16 px-6 md:px-10 max-w-6xl mx-auto scroll-mt-20">
      <p className="text-[11px] font-semibold tracking-widest uppercase text-accent mb-1.5 text-center">Nosso espaço</p>
      <h2 className="font-display font-bold text-[32px] md:text-[38px] text-primary mb-8 text-center">Galeria</h2>

      <div className="columns-2 md:columns-3 gap-3 [&>*]:mb-3">
        {images.map((img, i) => (
          <button
            key={img.id}
            onClick={() => setActive(i)}
            className="block w-full overflow-hidden rounded-xl border border-line group"
            aria-label={img.caption ?? 'Ampliar imagem'}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.url}
              alt={img.caption ?? 'Foto da barbearia'}
              loading="lazy"
              className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </button>
        ))}
      </div>

      {active != null && (
        <div className="fixed inset-0 z-[60] bg-black/85 flex items-center justify-center" onClick={close} role="dialog" aria-modal="true">
          <button className="absolute top-4 right-4 text-white p-2" aria-label="Fechar" onClick={close}>
            <X size={28} />
          </button>
          {images.length > 1 && (
            <>
              <button
                className="absolute left-3 md:left-8 text-white p-2"
                aria-label="Anterior"
                onClick={(e) => { e.stopPropagation(); prev() }}
              >
                <ChevronLeft size={34} />
              </button>
              <button
                className="absolute right-3 md:right-8 text-white p-2"
                aria-label="Próxima"
                onClick={(e) => { e.stopPropagation(); next() }}
              >
                <ChevronRight size={34} />
              </button>
            </>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[active].url}
            alt={images[active].caption ?? 'Foto ampliada'}
            className="max-w-[92vw] max-h-[88vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  )
}
