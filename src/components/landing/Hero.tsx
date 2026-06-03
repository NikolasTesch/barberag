'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Scissors } from 'lucide-react'

export interface HeroProps {
  stats: { avgRating: number | null; reviewCount: number; barberCount: number; appointmentCount: number }
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.2, delayChildren: 0.1 } },
}
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

export function Hero({ stats }: HeroProps) {
  const ratingLabel = stats.avgRating != null ? `${stats.avgRating.toFixed(1)}★` : '5.0★'

  return (
    <section className="relative min-h-screen flex items-center justify-center text-white overflow-hidden bg-primary">
      {/* fundo: gradiente escuro sobre textura sutil */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 30% 20%, rgba(212,131,10,0.18), transparent 45%), linear-gradient(180deg, #1A1A1A 0%, #111 100%)',
        }}
      />
      <div className="absolute inset-0 opacity-[0.04] [background-image:repeating-linear-gradient(45deg,#fff_0,#fff_1px,transparent_1px,transparent_12px)]" />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 text-center px-6 max-w-3xl"
      >
        <motion.div
          variants={item}
          className="inline-flex items-center gap-2.5 mb-6 border border-white/25 rounded-full px-4 py-1.5"
        >
          <Scissors size={14} className="text-accent" />
          <span className="font-mono text-[11px] tracking-[0.25em] text-accent uppercase">Authentic Barbershop</span>
        </motion.div>

        <motion.h1
          variants={item}
          className="font-display font-black text-[44px] sm:text-[68px] leading-[0.95] tracking-tight mb-4"
        >
          Seu estilo<br />começa aqui.
        </motion.h1>

        <motion.p variants={item} className="text-white/70 text-base sm:text-lg max-w-xl mx-auto leading-relaxed mb-8">
          Agende com os melhores barbeiros da região. Rápido, fácil e sem ligação.
        </motion.p>

        <motion.div variants={item} className="flex flex-col sm:flex-row gap-3 items-center justify-center">
          <Link
            href="/agendar"
            className="bg-accent text-white font-semibold text-base px-8 py-3.5 rounded-lg hover:bg-accent-deep transition-colors w-full sm:w-auto"
          >
            Agendar Agora
          </Link>
          <a href="#servicos" className="text-white/80 hover:text-white text-sm font-medium transition-colors py-2">
            Ver nossos serviços ↓
          </a>
        </motion.div>

        <motion.div variants={item} className="flex gap-8 mt-12 justify-center">
          {[
            [ratingLabel, `${stats.reviewCount || '0'} avaliações`],
            [`${stats.appointmentCount > 0 ? `${stats.appointmentCount}+` : '—'}`, 'cortes feitos'],
            [String(stats.barberCount || '—'), 'barbeiros'],
          ].map(([value, label]) => (
            <div key={label}>
              <div className="font-bold text-[22px] text-accent">{value}</div>
              <div className="text-[11px] text-white/60">{label}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  )
}
