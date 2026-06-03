import { BarberNav } from '@/components/navigation/BarberNav'
import { requireAuth } from '@/lib/auth/helpers'

export default async function BarberLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAuth('BARBER')

  return (
    <div className="flex h-screen overflow-hidden bg-fill-soft font-sans">
      <BarberNav user={{ name: session.user.name ?? 'Barbeiro' }} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
