'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Search, Loader2 } from 'lucide-react'
import { formatBRL } from '@/lib/utils/format'
import { CATEGORY_LABELS, type SERVICE_CATEGORIES } from '@/lib/validations/service'

interface ServiceRow {
  id: string
  name: string
  category: (typeof SERVICE_CATEGORIES)[number]
  durationMinutes: number
  basePrice: number
  isActive: boolean
  barberCount: number
}

export default function ServicosPage() {
  const [services, setServices] = useState<ServiceRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [pending, setPending] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/services')
      if (!res.ok) throw new Error()
      setServices((await res.json()).services)
    } catch {
      setError('Erro ao carregar serviços.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function setActive(svc: ServiceRow, isActive: boolean) {
    setPending(svc.id)
    setError(null)
    try {
      const res = await fetch(`/api/admin/services/${svc.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set-active', isActive }),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => null)
        throw new Error(json?.error?.formErrors?.[0] ?? 'Não foi possível alterar o status.')
      }
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado.')
    } finally {
      setPending(null)
    }
  }

  const filtered = services.filter((s) => s.name.toLowerCase().includes(query.toLowerCase()))

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-wrap items-center gap-3 px-4 sm:px-[22px] py-4 border-b border-line bg-white">
        <div>
          <div className="font-bold text-[19px] text-primary">Serviços</div>
          <div className="text-[13px] text-textMuted">Catálogo da barbearia</div>
        </div>
        <Link
          href="/servicos/novo"
          className="ml-auto inline-flex items-center gap-2 bg-accent text-white font-semibold px-4 py-2 rounded-lg hover:bg-accent-deep transition-colors text-sm"
        >
          <Plus size={16} /> Novo serviço
        </Link>
      </div>

      <div className="p-4 flex flex-col gap-3.5 overflow-auto">
        <div className="relative max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-textDisabled" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nome…"
            className="w-full border border-line rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-accent"
          />
        </div>

        {error && (
          <div className="border border-error/30 bg-error/5 text-error rounded-lg px-4 py-2.5 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={load} className="font-semibold underline">Recarregar</button>
          </div>
        )}

        <div className="border border-line rounded-xl bg-white overflow-hidden">
          <div className="overflow-x-auto">
          <div className="min-w-[760px]">
          <div
            className="grid px-3.5 py-2 border-b border-line font-mono text-[9px] text-textDisabled tracking-wide uppercase"
            style={{ gridTemplateColumns: '2fr 1fr 0.8fr 0.9fr 0.8fr 0.7fr 1.2fr' }}
          >
            <span>Nome</span>
            <span>Categoria</span>
            <span>Duração</span>
            <span>Preço</span>
            <span>Barbeiros</span>
            <span>Status</span>
            <span className="text-right">Ações</span>
          </div>

          {loading ? (
            <div className="py-10 flex items-center justify-center text-textMuted text-sm">
              <Loader2 size={16} className="animate-spin mr-2" /> Carregando…
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-10 text-center text-textMuted text-sm">Nenhum serviço encontrado.</div>
          ) : (
            filtered.map((s, i) => (
              <div
                key={s.id}
                className="grid items-center px-3.5 py-3 border-b border-fill text-[13px]"
                style={{ gridTemplateColumns: '2fr 1fr 0.8fr 0.9fr 0.8fr 0.7fr 1.2fr', background: i % 2 ? '#F7F5F2' : '#fff' }}
              >
                <span className="font-bold truncate">{s.name}</span>
                <span className="text-textMuted">{CATEGORY_LABELS[s.category]}</span>
                <span className="text-textMuted">{s.durationMinutes} min</span>
                <span className="font-mono">{formatBRL(s.basePrice)}</span>
                <span className="text-textMuted">{s.barberCount}</span>
                <span>
                  {s.isActive ? (
                    <span className="text-[11px] font-semibold bg-success/12 text-success px-2.5 py-1 rounded-full">Ativo</span>
                  ) : (
                    <span className="text-[11px] font-semibold bg-fill text-textMuted px-2.5 py-1 rounded-full">Inativo</span>
                  )}
                </span>
                <span className="flex items-center justify-end gap-2">
                  <Link href={`/servicos/${s.id}`} className="border border-line text-primary text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-fill">
                    Editar
                  </Link>
                  <button
                    disabled={pending === s.id}
                    onClick={() => setActive(s, !s.isActive)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg disabled:opacity-50 ${
                      s.isActive
                        ? 'border border-error/30 text-error hover:bg-error/5'
                        : 'border border-success/30 text-success hover:bg-success/5'
                    }`}
                  >
                    {pending === s.id ? '…' : s.isActive ? 'Desativar' : 'Ativar'}
                  </button>
                </span>
              </div>
            ))
          )}
          </div>
          </div>
        </div>
      </div>
    </div>
  )
}
