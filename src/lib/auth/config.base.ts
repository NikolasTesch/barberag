import type { NextAuthConfig } from 'next-auth'
import type { Role } from '@prisma/client'
import Google from 'next-auth/providers/google'

/**
 * Configuração base, segura para o Edge Runtime (usada pelo middleware).
 * NÃO importa o PrismaClient nem bcrypt — apenas providers OAuth e callbacks
 * de propagação de token. O CredentialsProvider e o PrismaAdapter ficam em
 * `config.ts` (runtime Node), que estende esta base.
 */
export const authConfig = {
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: { strategy: 'jwt' },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      // No sign-in `user` está presente — propaga id e role para o token.
      if (user) {
        token.id = user.id as string
        token.role = (user.role ?? 'CLIENT') as Role
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as Role
      }
      return session
    },
  },
} satisfies NextAuthConfig
