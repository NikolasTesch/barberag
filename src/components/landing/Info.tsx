import { MapPin, Phone, Clock, Instagram, MessageCircle } from 'lucide-react'
import { Reveal } from '@/components/landing/Reveal'
import type { LandingConfig } from '@/lib/landing'

export function Info({ config }: { config: LandingConfig | null }) {
  const name = config?.name ?? 'BARBERAG'
  const address = config?.address ?? 'Rua das Tesouras, 100 — Centro'
  const phone = config?.phone ?? process.env.NEXT_PUBLIC_BARBERSHOP_PHONE ?? ''
  const phoneDigits = phone.replace(/\D/g, '')
  const mapsSrc = `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`

  return (
    <section id="contato" className="py-16 px-6 md:px-10 bg-muted scroll-mt-20">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-center">
        <Reveal>
          <p className="text-[11px] font-semibold tracking-widest uppercase text-accent mb-1.5">Onde estamos</p>
          <h2 className="font-display font-bold text-[32px] md:text-[38px] text-primary mb-6">Venha nos visitar</h2>

          <ul className="flex flex-col gap-4">
            <li className="flex items-start gap-3">
              <MapPin size={20} className="text-accent flex-shrink-0 mt-0.5" />
              <span className="text-primary">{address}</span>
            </li>
            <li className="flex items-start gap-3">
              <Clock size={20} className="text-accent flex-shrink-0 mt-0.5" />
              <span className="text-primary">Seg–Sex 9h–19h · Sáb 9h–18h · Dom fechado</span>
            </li>
            {phoneDigits && (
              <li className="flex items-center gap-3">
                <Phone size={20} className="text-accent flex-shrink-0" />
                <a href={`tel:+${phoneDigits}`} className="text-primary hover:text-accent transition-colors">
                  {phone}
                </a>
              </li>
            )}
          </ul>

          <div className="flex gap-3 mt-6">
            {phoneDigits && (
              <a
                href={`https://wa.me/${phoneDigits}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-success text-white font-semibold px-4 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
              >
                <MessageCircle size={18} /> WhatsApp
              </a>
            )}
            <a
              href="https://instagram.com/barberag"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-primary text-primary font-semibold px-4 py-2.5 rounded-lg hover:bg-primary hover:text-white transition-colors"
            >
              <Instagram size={18} /> Instagram
            </a>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="rounded-2xl overflow-hidden border border-line shadow-sm aspect-[4/3]">
            <iframe
              title={`Mapa — ${name}`}
              src={mapsSrc}
              className="w-full h-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </Reveal>
      </div>
    </section>
  )
}
