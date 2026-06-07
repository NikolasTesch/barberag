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
    </>
  )
}
