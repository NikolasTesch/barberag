import { AdminNav } from '@/components/navigation/AdminNav'
import { requireAuth } from '@/lib/auth/helpers'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAuth('ADMIN')

  return (
    <div className="flex h-screen overflow-hidden bg-fill-soft font-sans">
      <AdminNav user={{ name: session.user.name ?? 'Admin' }} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
