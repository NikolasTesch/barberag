'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Calendar, User, Plus, Home } from 'lucide-react'

const tabs = [
  { label: 'Início', href: '/', icon: Home },
  { label: 'Agenda', href: '/agendamentos', icon: Calendar },
  { label: 'Agendar', href: '/agendar', icon: Plus, cta: true },
  { label: 'Perfil', href: '/perfil', icon: User },
]

export function ClientNav() {
  const pathname = usePathname()

  return (
    <nav className="flex border-t border-line bg-white">
      {tabs.map(({ label, href, icon: Icon, cta }) => {
        const isActive = href === pathname || (href !== '/' && pathname.startsWith(href))
        return (
          <Link
            key={label}
            href={href}
            className="flex-1 flex flex-col items-center gap-0.5 py-2.5 relative"
          >
            {cta ? (
              <>
                <div className="w-9 h-9 rounded-full bg-accent text-white flex items-center justify-center -mt-5 shadow-md">
                  <Icon size={20} />
                </div>
                <span className="text-[8.5px] font-mono text-textDisabled mt-0.5">{label}</span>
              </>
            ) : (
              <>
                <Icon size={18} className={isActive ? 'text-accent-deep' : 'text-textDisabled'} />
                <span
                  className={`text-[8.5px] font-mono ${
                    isActive ? 'text-accent-deep font-bold' : 'text-textDisabled'
                  }`}
                >
                  {label}
                </span>
              </>
            )}
          </Link>
        )
      })}
    </nav>
  )
}
