import { ClientNav } from '@/components/navigation/ClientNav'
import { SignOutButton } from '@/components/auth/SignOutButton'
import { requireAuth } from '@/lib/auth/helpers'

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAuth('CLIENT')

  return (
    <div className="min-h-screen bg-fill-soft flex flex-col font-sans max-w-sm mx-auto shadow-lg">
      <header className="flex items-center justify-between bg-primary px-4 py-2.5">
        <span className="font-display font-black text-[18px] text-accent tracking-tight">BARBERAG</span>
        <div className="flex items-center gap-3">
          <span className="text-[12px] text-white/70">{session.user.name?.split(' ')[0]}</span>
          <SignOutButton />
        </div>
      </header>
      <div className="flex-1 overflow-auto">{children}</div>
      <ClientNav />
    </div>
  )
}
