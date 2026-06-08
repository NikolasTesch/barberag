import { redirect } from 'next/navigation'
import type { Role } from '@prisma/client'
import { auth } from '@/lib/auth/config'

/** Home padrão de cada role — usada em redirects pós-login e em guards. */
export const ROLE_HOME: Record<Role, string> = {
  CLIENT: '/inicio',
  BARBER: '/agenda',
  ADMIN: '/dashboard',
}

/** Wrapper tipado para a sessão server-side. */
export async function getServerSession() {
  return auth()
}

/**
 * Guard server-side. Redireciona para /login se não autenticado.
 * Se `role` for informado e não bater, redireciona para a home do role do usuário.
 */
export async function requireAuth(role?: Role) {
  const session = await getServerSession()

  if (!session?.user) {
    redirect('/login')
  }

  if (role && session.user.role !== role) {
    redirect(ROLE_HOME[session.user.role])
  }

  return session
}
