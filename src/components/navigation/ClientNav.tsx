'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Calendar, User, Plus, Home } from 'lucide-react'

const tabs = [
  { label: 'Início', href: '/inicio', icon: Home },
  { label: 'Agenda', href: '/agendamentos', icon: Calendar },
  { label: 'Agendar', href: '/agendar', icon: Plus },
  { label: 'Perfil', href: '/perfil', icon: User },
]

export function ClientNav() {
  const pathname = usePathname()

  return (
    <nav className="flex border-t border-line bg-white">
      {tabs.map(({ label, href, icon: Icon }) => {
        const isActive = href === pathname || (href !== '/inicio' && pathname.startsWith(href))
        return (
          <Link
            key={label}
            href={href}
            className="flex-1 flex flex-col items-center gap-0.5 py-2.5"
          >
            <Icon size={18} className={isActive ? 'text-accent-deep' : 'text-textDisabled'} />
            <span
              className={`text-[8.5px] font-mono ${
                isActive ? 'text-accent-deep font-bold' : 'text-textDisabled'
              }`}
            >
              {label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
