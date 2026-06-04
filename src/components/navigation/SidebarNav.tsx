'use client'

import { useState, useEffect, type ComponentType } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { SignOutButton } from '@/components/auth/SignOutButton'

export interface NavItem {
  label: string
  href: string
  icon: ComponentType<{ size?: number | string }>
}

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
}

function NavLinks({
  items,
  pathname,
  onNavigate,
  itemClassName,
}: {
  items: NavItem[]
  pathname: string
  onNavigate?: () => void
  itemClassName?: string
}) {
  return (
    <>
      {items.map(({ label, href, icon: Icon }) => {
        const isActive = pathname === href || pathname.startsWith(href + '/')
        return (
          <Link
            key={label}
            href={href}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-2.5 px-2.5 py-2 rounded-lg font-bold text-[13.5px] transition-colors',
              'border-l-[3px]',
              isActive
                ? 'bg-accent/20 border-accent text-accent'
                : 'border-transparent text-white/72 hover:bg-white/5',
              itemClassName
            )}
          >
            <Icon size={16} />
            {label}
          </Link>
        )
      })}
    </>
  )
}

function Footer({ user, roleLabel }: { user: { name: string }; roleLabel: string }) {
  return (
    <div className="p-3 border-t border-white/10">
      <div className="flex items-center gap-2 px-2 py-2.5">
        <div className="w-[30px] h-[30px] rounded-full bg-white/10 border border-white/20 flex items-center justify-center font-bold text-xs flex-shrink-0">
          {initials(user.name)}
        </div>
        <div className="text-[13px] leading-tight">
          {user.name.split(' ')[0]}
          <br />
          <span className="text-[10px] text-white/50">{roleLabel}</span>
        </div>
      </div>
      <div className="px-2 pt-1">
        <SignOutButton />
      </div>
    </div>
  )
}

interface SidebarNavProps {
  user: { name: string }
  items: NavItem[]
  homeHref: string
  roleLabel: string
  subtitle?: string
}

export function SidebarNav({ user, items, homeHref, roleLabel, subtitle }: SidebarNavProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  // Fecha o drawer ao navegar entre rotas
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // Trava o scroll do body enquanto o drawer está aberto
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [open])

  return (
    <>
      {/* Top bar mobile */}
      <header className="md:hidden flex items-center justify-between bg-primary text-white px-4 py-3 flex-shrink-0 sticky top-0 z-30">
        <Link href={homeHref} className="font-display font-black text-[20px] text-accent tracking-tight">
          BARBERAG
        </Link>
        <button
          type="button"
          aria-label="Abrir menu"
          onClick={() => setOpen(true)}
          className="p-1.5 -mr-1.5 text-white/80 hover:text-white"
        >
          <Menu size={24} />
        </button>
      </header>

      {/* Sidebar desktop */}
      <aside className="hidden md:flex w-[188px] bg-primary text-white flex-col flex-shrink-0 h-screen sticky top-0">
        <div className="px-3 pt-4 pb-4 border-b border-white/10">
          <Link
            href={homeHref}
            className="font-display font-black text-[24px] text-accent tracking-tight px-2 block"
          >
            BARBERAG
          </Link>
          {subtitle && (
            <span className="font-mono text-[8.5px] text-white/40 tracking-widest px-2 uppercase">
              {subtitle}
            </span>
          )}
        </div>
        <nav className="flex-1 p-3 flex flex-col gap-0.5 overflow-auto">
          <NavLinks items={items} pathname={pathname} />
        </nav>
        <Footer user={user} roleLabel={roleLabel} />
      </aside>

      {/* Drawer mobile */}
      <div className={cn('md:hidden fixed inset-0 z-50', open ? 'pointer-events-auto' : 'pointer-events-none')}>
        <div
          className={cn(
            'absolute inset-0 bg-black/50 transition-opacity duration-200',
            open ? 'opacity-100' : 'opacity-0'
          )}
          onClick={() => setOpen(false)}
        />
        <aside
          className={cn(
            'absolute left-0 top-0 w-[80%] max-w-[280px] bg-primary text-white flex flex-col h-full shadow-lg transition-transform duration-200',
            open ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="px-3 pt-4 pb-4 border-b border-white/10 flex items-center justify-between">
            <Link href={homeHref} className="font-display font-black text-[24px] text-accent tracking-tight px-2">
              BARBERAG
            </Link>
            <button
              type="button"
              aria-label="Fechar menu"
              onClick={() => setOpen(false)}
              className="p-1.5 text-white/70 hover:text-white"
            >
              <X size={22} />
            </button>
          </div>
          <nav className="flex-1 p-3 flex flex-col gap-0.5 overflow-auto">
            <NavLinks items={items} pathname={pathname} onNavigate={() => setOpen(false)} />
          </nav>
          <Footer user={user} roleLabel={roleLabel} />
        </aside>
      </div>
    </>
  )
}
