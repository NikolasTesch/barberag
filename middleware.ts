import NextAuth from 'next-auth'
import { NextResponse } from 'next/server'
import type { Role } from '@prisma/client'
import { authConfig } from '@/lib/auth/config.base'

const { auth } = NextAuth(authConfig)

const ROLE_HOME: Record<Role, string> = {
  CLIENT: '/agendar',
  BARBER: '/agenda',
  ADMIN: '/dashboard',
}

/** Prefixos de rota protegidos por role. A ordem importa: o primeiro match vence. */
const ROUTE_ROLES: { prefix: string; role: Role }[] = [
  // Admin
  { prefix: '/dashboard', role: 'ADMIN' },
  { prefix: '/barbeiros', role: 'ADMIN' },
  { prefix: '/servicos', role: 'ADMIN' },
  { prefix: '/relatorios', role: 'ADMIN' },
  { prefix: '/agendamentos-admin', role: 'ADMIN' },
  { prefix: '/comissoes-admin', role: 'ADMIN' },
  { prefix: '/clientes-admin', role: 'ADMIN' },
  { prefix: '/avaliacoes-admin', role: 'ADMIN' },
  { prefix: '/configuracoes', role: 'ADMIN' },
  // Barber
  { prefix: '/agenda', role: 'BARBER' },
  { prefix: '/atendimento', role: 'BARBER' },
  { prefix: '/comissoes', role: 'BARBER' },
  { prefix: '/disponibilidade', role: 'BARBER' },
  { prefix: '/clientes', role: 'BARBER' },
  // Client
  { prefix: '/agendar', role: 'CLIENT' },
  { prefix: '/agendamentos', role: 'CLIENT' },
  { prefix: '/perfil', role: 'CLIENT' },
]

function requiredRole(pathname: string): Role | null {
  const match = ROUTE_ROLES.find(
    (r) => pathname === r.prefix || pathname.startsWith(r.prefix + '/')
  )
  return match?.role ?? null
}

export default auth((req) => {
  const { pathname } = req.nextUrl
  const role = requiredRole(pathname)

  // Rota pública — segue normalmente.
  if (!role) return NextResponse.next()

  const session = req.auth
  const userRole = session?.user?.role

  // Não autenticado → login, preservando destino.
  if (!session?.user) {
    const url = new URL('/login', req.nextUrl)
    url.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(url)
  }

  // Autenticado mas role incorreto → home do próprio role.
  if (userRole && userRole !== role) {
    return NextResponse.redirect(new URL(ROLE_HOME[userRole], req.nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/auth|api/cron).*)'],
}
