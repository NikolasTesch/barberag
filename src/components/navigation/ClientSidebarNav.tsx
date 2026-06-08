'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Calendar, User, Plus, Home } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const tabs = [
  { label: 'Início', href: '/inicio', icon: Home },
  { label: 'Agenda', href: '/agendamentos', icon: Calendar },
  { label: 'Agendar', href: '/agendar', icon: Plus },
  { label: 'Perfil', href: '/perfil', icon: User },
]

export function ClientSidebarNav({
  userName,
  userEmail,
}: {
  userName: string | null
  userEmail: string | null
}) {
  const pathname = usePathname()

  return (
    <nav className="flex-1 p-3 flex flex-col gap-0.5">
      {tabs.map(({ label, href, icon: Icon }) => {
        const isActive =
          pathname === href || (href !== '/inicio' && pathname.startsWith(href))
        return (
          <Link
            key={label}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-[14px] font-medium',
              isActive
                ? 'bg-white/10 text-accent'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            )}
          >
            <Icon size={18} />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
