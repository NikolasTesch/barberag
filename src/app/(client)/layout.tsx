import { ClientNav } from '@/components/navigation/ClientNav'
import { ClientSidebarNav } from '@/components/navigation/ClientSidebarNav'
import { SignOutButton } from '@/components/auth/SignOutButton'
import { requireAuth } from '@/lib/auth/helpers'

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAuth('CLIENT')
  const initials = (session.user.name ?? 'U')
    .split(' ')
    .slice(0, 2)
    .map((p: string) => p[0]?.toUpperCase() ?? '')
    .join('')

  return (
    <div className="flex h-screen overflow-hidden bg-fill-soft font-sans">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-primary text-white flex-shrink-0">
        <div className="px-5 py-5 border-b border-white/10">
          <span className="font-display font-black text-2xl text-accent tracking-tight">BARBERAG</span>
          <p className="text-white/40 text-xs mt-0.5">Authentic Barbershop</p>
        </div>
        <ClientSidebarNav userName={session.user.name ?? null} userEmail={session.user.email ?? null} />
        <div className="p-4 border-t border-white/10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-white truncate">{session.user.name}</div>
            <div className="text-xs text-white/40 truncate">{session.user.email}</div>
          </div>
          <SignOutButton />
        </div>
      </aside>

      {/* Right side */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between bg-primary px-4 py-2.5 flex-shrink-0">
          <span className="font-display font-black text-[18px] text-accent tracking-tight">BARBERAG</span>
          <div className="flex items-center gap-3">
            <span className="text-[12px] text-white/70">{session.user.name?.split(' ')[0]}</span>
            <SignOutButton />
          </div>
        </header>

        <div className="flex-1 overflow-auto">{children}</div>

        {/* Mobile bottom nav */}
        <div className="lg:hidden flex-shrink-0">
          <ClientNav />
        </div>
      </div>
    </div>
  )
}
