'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Menu, X, Scissors } from 'lucide-react'

const LINKS = [
  { label: 'Serviços', href: '#servicos' },
  { label: 'Equipe', href: '#equipe' },
  { label: 'Galeria', href: '#galeria' },
  { label: 'Contato', href: '#contato' },
]

export function PublicNav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-colors duration-300 ${
        scrolled ? 'bg-primary shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="flex items-center gap-4 px-6 md:px-10 py-3.5 max-w-7xl mx-auto">
        <Link href="/" className="font-display font-black text-[24px] text-accent tracking-tight">
          BARBERAG
        </Link>

        <nav className="ml-auto hidden md:flex gap-[22px] items-center">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="text-sm text-white/80 hover:text-white transition-colors">
              {l.label}
            </a>
          ))}
          <Link
            href="/agendar"
            className="bg-accent text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-accent-deep transition-colors"
          >
            Agendar
          </Link>
        </nav>

        <button
          className="ml-auto md:hidden text-white p-1"
          aria-label="Abrir menu"
          aria-expanded={open}
          onClick={() => setOpen(true)}
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Drawer mobile */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-64 bg-primary text-white p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-display font-black text-xl text-accent flex items-center gap-1.5">
                <Scissors size={18} /> BARBERAG
              </span>
              <button aria-label="Fechar menu" onClick={() => setOpen(false)}>
                <X size={22} />
              </button>
            </div>
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-white/85 hover:text-white text-[15px] py-1"
              >
                {l.label}
              </a>
            ))}
            <Link
              href="/agendar"
              className="mt-2 bg-accent text-white text-center font-semibold px-4 py-2.5 rounded-lg hover:bg-accent-deep transition-colors"
            >
              Agendar agora
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
