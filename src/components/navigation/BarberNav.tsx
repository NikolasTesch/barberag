'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Calendar, Scissors, DollarSign, Clock, Users } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { SignOutButton } from '@/components/auth/SignOutButton'

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
}

const navItems = [
  { label: 'Agenda', href: '/agenda', icon: Calendar },
  { label: 'Atendimento', href: '/atendimento', icon: Scissors },
  { label: 'Comissões', href: '/comissoes', icon: DollarSign },
  { label: 'Disponibilidade', href: '/disponibilidade', icon: Clock },
  { label: 'Clientes', href: '/clientes', icon: Users },
]

export function BarberNav({ user }: { user: { name: string } }) {
  const pathname = usePathname()

  return (
    <aside className="w-[188px] bg-primary text-white flex flex-col flex-shrink-0 h-screen sticky top-0">
      <div className="px-3 pt-4 pb-4 border-b border-white/10">
        <Link href="/agenda" className="font-display font-black text-[24px] text-accent tracking-tight px-2">
          BARBERAG
        </Link>
      </div>

      <nav className="flex-1 p-3 flex flex-col gap-1">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={label}
              href={href}
              className={cn(
                'flex items-center gap-2.5 px-2.5 py-[9px] rounded-lg font-bold text-[14px] transition-colors',
                'border-l-[3px]',
                isActive
                  ? 'bg-accent/20 border-accent text-accent'
                  : 'border-transparent text-white/72 hover:bg-white/5'
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-white/10">
        <div className="flex items-center gap-2 px-2 py-2.5">
          <div className="w-[30px] h-[30px] rounded-full bg-white/10 border border-white/20 flex items-center justify-center font-bold text-xs flex-shrink-0">
            {initials(user.name)}
          </div>
          <div className="text-[13px] leading-tight">
            {user.name.split(' ')[0]}
            <br />
            <span className="text-[10px] text-white/50">barbeiro</span>
          </div>
        </div>
        <div className="px-2 pt-1">
          <SignOutButton />
        </div>
      </div>
    </aside>
  )
}
