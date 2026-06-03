'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Search, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import { initials } from '@/lib/utils/format'

interface ClientRow {
  id: string
  name: string
  email: string
  phone: string | null
  image: string | null
  createdAt: string
  appointmentCount: number
  lastVisit: string | null
}

export default function ClientesAdminPage() {
  const [clients, setClients] = useState<ClientRow[]>([])
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const load = useCallback(async (q: string, p: number) => {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch(`/api/admin/clients?q=${encodeURIComponent(q)}&page=${p}`)
      if (!res.ok) throw new Error()
      const json = await res.json()
      setClients(json.clients)
      setTotalPages(json.totalPages)
      setTotal(json.total)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  // debounce da busca; reseta para a página 1 ao buscar
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1)
      load(query, 1)
    }, 350)
    return () => clearTimeout(t)
  }, [query, load])

  useEffect(() => {
    load(query, page)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-[22px] py-4 border-b border-line bg-white">
        <div>
          <div className="font-bold text-[19px] text-primary">Clientes</div>
          <div className="text-[13px] text-textMuted">{total} cliente(s) cadastrado(s)</div>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-3.5 overflow-auto">
        <div className="relative max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-textDisabled" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nome, e-mail ou telefone…"
            className="w-full border border-line rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-accent"
          />
        </div>

        {error && (
          <div className="border border-error/30 bg-error/5 text-error rounded-lg px-4 py-2.5 text-sm flex items-center justify-between">
            <span>Erro ao carregar clientes.</span>
            <button onClick={() => load(query, page)} className="font-semibold underline">Tentar novamente</button>
          </div>
        )}

        <div className="border border-line rounded-xl bg-white overflow-hidden">
          <div
            className="grid px-3.5 py-2 border-b border-line font-mono text-[9px] text-textDisabled tracking-wide uppercase"
            style={{ gridTemplateColumns: '2fr 1.4fr 1fr 0.8fr 1fr 1fr' }}
          >
            <span>Cliente</span>
            <span>E-mail</span>
            <span>Telefone</span>
            <span>Agend.</span>
            <span>Última visita</span>
            <span>Cadastro</span>
          </div>

          {loading ? (
            <div className="py-10 flex items-center justify-center text-textMuted text-sm">
              <Loader2 size={16} className="animate-spin mr-2" /> Carregando…
            </div>
          ) : clients.length === 0 ? (
            <div className="py-10 text-center text-textMuted text-sm">Nenhum cliente encontrado.</div>
          ) : (
            clients.map((c, i) => (
              <Link
                key={c.id}
                href={`/clientes-admin/${c.id}`}
                className="grid items-center px-3.5 py-3 border-b border-fill text-[13px] hover:bg-accent-soft/30 transition-colors"
                style={{ gridTemplateColumns: '2fr 1.4fr 1fr 0.8fr 1fr 1fr', background: i % 2 ? '#F7F5F2' : '#fff' }}
              >
                <span className="flex items-center gap-2.5 min-w-0">
                  <span className="w-[30px] h-[30px] rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold flex-shrink-0 overflow-hidden">
                    {c.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
                    ) : (
                      initials(c.name)
                    )}
                  </span>
                  <span className="font-bold truncate">{c.name}</span>
                </span>
                <span className="text-textMuted truncate">{c.email}</span>
                <span className="text-textMuted">{c.phone ?? '—'}</span>
                <span className="text-textMuted">{c.appointmentCount}</span>
                <span className="text-textMuted">
                  {c.lastVisit ? format(new Date(c.lastVisit), 'dd/MM/yy', { locale: ptBR }) : '—'}
                </span>
                <span className="text-textMuted">{format(new Date(c.createdAt), 'dd/MM/yy', { locale: ptBR })}</span>
              </Link>
            ))
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-line disabled:opacity-40 hover:bg-fill"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm text-textMuted">
              Página {page} de {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-lg border border-line disabled:opacity-40 hover:bg-fill"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
