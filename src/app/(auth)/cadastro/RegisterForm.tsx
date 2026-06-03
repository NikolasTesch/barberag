'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { RegisterSchema } from '@/lib/validations/auth'

const inputClass =
  'w-full bg-muted border border-transparent rounded-lg px-3.5 py-2.5 text-sm text-primary placeholder:text-textDisabled focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition'

export function RegisterForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)
    const parsed = RegisterSchema.safeParse({
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword'),
    })
    if (!parsed.success) {
      setError(parsed.error.issues[0].message)
      return
    }

    setIsLoading(true)
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed.data),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => null)
      setError(
        typeof data?.error === 'string'
          ? data.error
          : 'Não foi possível criar a conta. Tente novamente.'
      )
      setIsLoading(false)
      return
    }

    router.push('/login?registered=true')
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-primary mb-1">Criar conta</h1>
      <p className="text-sm text-textMuted mb-6">
        Já tem conta?{' '}
        <Link href="/login" className="text-accent font-semibold hover:underline">
          Entrar
        </Link>
      </p>

      {error && (
        <div className="mb-4 rounded-lg bg-error/10 border border-error/30 px-3.5 py-2.5 text-sm text-error">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-primary mb-1.5">Nome completo</label>
          <input name="name" type="text" required placeholder="Seu nome" className={inputClass} />
        </div>

        <div>
          <label className="block text-sm font-medium text-primary mb-1.5">E-mail</label>
          <input name="email" type="email" required placeholder="seu@email.com" className={inputClass} />
        </div>

        <div>
          <label className="block text-sm font-medium text-primary mb-1.5">
            Telefone <span className="text-textDisabled font-normal">(opcional)</span>
          </label>
          <input name="phone" type="tel" placeholder="(11) 9 9999-9999" className={inputClass} />
        </div>

        <div>
          <label className="block text-sm font-medium text-primary mb-1.5">Senha</label>
          <input name="password" type="password" required placeholder="Mínimo 6 caracteres" className={inputClass} />
        </div>

        <div>
          <label className="block text-sm font-medium text-primary mb-1.5">Confirmar senha</label>
          <input name="confirmPassword" type="password" required placeholder="Repita a senha" className={inputClass} />
        </div>

        <Button type="submit" size="lg" full isLoading={isLoading} className="mt-2">
          Criar conta
        </Button>
      </form>
    </>
  )
}
