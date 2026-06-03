'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn, getSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { LoginSchema } from '@/lib/validations/auth'

const ROLE_HOME: Record<string, string> = {
  CLIENT: '/agendar',
  BARBER: '/agenda',
  ADMIN: '/dashboard',
}

const inputClass =
  'w-full bg-muted border border-transparent rounded-lg px-3.5 py-2.5 text-sm text-primary placeholder:text-textDisabled focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition'

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || undefined
  const registered = searchParams.get('registered') === 'true'

  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)
    const parsed = LoginSchema.safeParse({
      email: formData.get('email'),
      password: formData.get('password'),
    })
    if (!parsed.success) {
      setError(parsed.error.issues[0].message)
      return
    }

    setIsLoading(true)
    const result = await signIn('credentials', {
      ...parsed.data,
      redirect: false,
    })

    if (!result || result.error) {
      setError('E-mail ou senha incorretos.')
      setIsLoading(false)
      return
    }

    // Resolve a home pelo role da sessão recém-criada.
    const session = await getSession()
    const role = session?.user?.role
    router.push(callbackUrl || (role ? ROLE_HOME[role] : '/'))
    router.refresh()
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-primary mb-1">Entrar na conta</h1>
      <p className="text-sm text-textMuted mb-6">
        Não tem conta?{' '}
        <Link href="/cadastro" className="text-accent font-semibold hover:underline">
          Cadastre-se grátis
        </Link>
      </p>

      {registered && (
        <div className="mb-4 rounded-lg bg-success/10 border border-success/30 px-3.5 py-2.5 text-sm text-success">
          Conta criada com sucesso! Faça login para continuar.
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg bg-error/10 border border-error/30 px-3.5 py-2.5 text-sm text-error">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-primary mb-1.5">E-mail</label>
          <input name="email" type="email" required placeholder="seu@email.com" className={inputClass} />
        </div>

        <div>
          <label className="block text-sm font-medium text-primary mb-1.5">Senha</label>
          <input name="password" type="password" required placeholder="••••••••" className={inputClass} />
          <div className="text-right mt-1.5">
            <Link href="#" className="text-xs text-textMuted hover:text-accent transition-colors">
              Esqueci minha senha
            </Link>
          </div>
        </div>

        <Button type="submit" size="lg" full isLoading={isLoading} className="mt-2">
          Entrar
        </Button>
      </form>

      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-line" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-xs text-textMuted">ou continue com</span>
        </div>
      </div>

      <Button
        variant="secondary"
        size="lg"
        full
        isLoading={isGoogleLoading}
        onClick={() => {
          setIsGoogleLoading(true)
          signIn('google', { callbackUrl: callbackUrl || '/agendar' })
        }}
      >
        {!isGoogleLoading && (
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
        )}
        Entrar com Google
      </Button>
    </>
  )
}
