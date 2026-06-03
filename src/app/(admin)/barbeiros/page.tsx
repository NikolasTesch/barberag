'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Search, Loader2 } from 'lucide-react'
import { initials } from '@/lib/utils/format'

interface BarberRow {
  id: string
  name: string
  email: string
  image: string | null
  isActive: boolean
  commissionRate: number
  serviceCount: number
  monthAppointments: number
}

export default function BarbeirosPage() {
  const [barbers, setBarbers] = useState<BarberRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [query, setQuery] = useState('')
  const [pending, setPending] = useState<string | null>(null)
  const [confirm, setConfirm] = useState<BarberRow | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch('/api/admin/barbers')
      if (!res.ok) throw new Error()
      setBarbers((await res.json()).barbers)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function setActive(barber: BarberRow, isActive: boolean) {
    setPending(barber.id)
    setConfirm(null)
    try {
      const res = await fetch(`/api/admin/barbers/${barber.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set-active', isActive }),
      })
      if (!res.ok) throw new Error()
      await load()
    } catch {
      setError(true)
    } finally {
      setPending(null)
    }
  }

  const filtered = barbers.filter((b) => b.name.toLowerCase().includes(query.toLowerCase()))

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-[22px] py-4 border-b border-line bg-white">
        <div>
          <div className="font-bold text-[19px] text-primary">Barbeiros</div>
          <div className="text-[13px] text-textMuted">Gestão da equipe</div>
        </div>
        <Link
          href="/barbeiros/novo"
          className="ml-auto inline-flex items-center gap-2 bg-accent text-white font-semibold px-4 py-2 rounded-lg hover:bg-accent-deep transition-colors text-sm"
        >
          <Plus size={16} /> Novo barbeiro
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
            <span>Erro ao carregar barbeiros.</span>
            <button onClick={load} className="font-semibold underline">Tentar novamente</button>
          </div>
        )}

        <div className="border border-line rounded-xl bg-white overflow-hidden">
          <div
            className="grid px-3.5 py-2 border-b border-line font-mono text-[9px] text-textDisabled tracking-wide uppercase"
            style={{ gridTemplateColumns: '2fr 0.8fr 0.7fr 1fr 1fr 1.2fr' }}
          >
            <span>Barbeiro</span>
            <span>Status</span>
            <span>Serviços</span>
            <span>Atend./mês</span>
            <span>Comissão</span>
            <span className="text-right">Ações</span>
          </div>

          {loading ? (
            <div className="py-10 flex items-center justify-center text-textMuted text-sm">
              <Loader2 size={16} className="animate-spin mr-2" /> Carregando…
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-10 text-center text-textMuted text-sm">Nenhum barbeiro encontrado.</div>
          ) : (
            filtered.map((b, i) => (
              <div
                key={b.id}
                className="grid items-center px-3.5 py-3 border-b border-fill text-[13px]"
                style={{ gridTemplateColumns: '2fr 0.8fr 0.7fr 1fr 1fr 1.2fr', background: i % 2 ? '#F7F5F2' : '#fff' }}
              >
                <span className="flex items-center gap-2.5 min-w-0">
                  <span className="w-[30px] h-[30px] rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold flex-shrink-0 overflow-hidden">
                    {b.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={b.image} alt={b.name} className="w-full h-full object-cover" />
                    ) : (
                      initials(b.name)
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="font-bold block truncate">{b.name}</span>
                    <span className="text-textDisabled text-[11px] block truncate">{b.email}</span>
                  </span>
                </span>
                <span>
                  {b.isActive ? (
                    <span className="text-[11px] font-semibold bg-success/12 text-success px-2.5 py-1 rounded-full">Ativo</span>
                  ) : (
                    <span className="text-[11px] font-semibold bg-fill text-textMuted px-2.5 py-1 rounded-full">Inativo</span>
                  )}
                </span>
                <span className="text-textMuted">{b.serviceCount}</span>
                <span className="text-textMuted">{b.monthAppointments}</span>
                <span className="font-mono">{Math.round(b.commissionRate * 100)}%</span>
                <span className="flex items-center justify-end gap-2">
                  <Link href={`/barbeiros/${b.id}`} className="border border-line text-primary text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-fill">
                    Editar
                  </Link>
                  <button
                    disabled={pending === b.id}
                    onClick={() => (b.isActive ? setConfirm(b) : setActive(b, true))}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg disabled:opacity-50 ${
                      b.isActive
                        ? 'border border-error/30 text-error hover:bg-error/5'
                        : 'border border-success/30 text-success hover:bg-success/5'
                    }`}
                  >
                    {pending === b.id ? '…' : b.isActive ? 'Desativar' : 'Ativar'}
                  </button>
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {confirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setConfirm(null)}>
          <div className="bg-white rounded-xl p-5 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-[16px] mb-2">Desativar {confirm.name}?</h3>
            <p className="text-sm text-textMuted mb-4">
              Agendamentos futuros deste barbeiro serão <strong>cancelados</strong> e os clientes
              notificados por e-mail para reagendar. Esta ação pode ser revertida reativando o barbeiro.
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setConfirm(null)} className="px-4 py-2 rounded-lg border border-line font-semibold text-sm hover:bg-fill">
                Cancelar
              </button>
              <button onClick={() => setActive(confirm, false)} className="px-4 py-2 rounded-lg bg-error text-white font-semibold text-sm hover:opacity-90">
                Desativar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
