'use client'

import { useCallback, useEffect, useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Star, Loader2, Check, X } from 'lucide-react'

interface ReviewRow {
  id: string
  rating: number
  comment: string | null
  isPublished: boolean
  createdAt: string
  clientName: string
  barberName: string
  services: string[]
}

type StatusTab = 'pending' | 'published'

function Stars({ n }: { n: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${n} de 5 estrelas`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={14} className={i <= n ? 'text-accent fill-accent' : 'text-line'} />
      ))}
    </span>
  )
}

export default function AvaliacoesAdminPage() {
  const [tab, setTab] = useState<StatusTab>('pending')
  const [reviews, setReviews] = useState<ReviewRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [pending, setPending] = useState<string | null>(null)

  const load = useCallback(async (status: StatusTab) => {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch(`/api/admin/reviews?status=${status}`)
      if (!res.ok) throw new Error()
      setReviews((await res.json()).reviews)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load(tab)
  }, [tab, load])

  async function act(id: string, kind: 'publish' | 'unpublish' | 'reject') {
    setPending(id)
    try {
      const res =
        kind === 'reject'
          ? await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' })
          : await fetch(`/api/admin/reviews/${id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: kind === 'publish' ? 'publish' : 'unpublish' }),
            })
      if (!res.ok) throw new Error()
      await load(tab)
    } catch {
      setError(true)
    } finally {
      setPending(null)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-[22px] py-4 border-b border-line bg-white">
        <div>
          <div className="font-bold text-[19px] text-primary">Avaliações</div>
          <div className="text-[13px] text-textMuted">Modere as avaliações dos clientes</div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {(['pending', 'published'] as StatusTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                tab === t ? 'bg-primary text-white border-primary' : 'bg-white text-textMuted border-line hover:border-accent/40'
              }`}
            >
              {t === 'pending' ? 'Pendentes' : 'Publicadas'}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 flex flex-col gap-3 overflow-auto">
        {error && (
          <div className="border border-error/30 bg-error/5 text-error rounded-lg px-4 py-2.5 text-sm flex items-center justify-between">
            <span>Erro ao carregar avaliações.</span>
            <button onClick={() => load(tab)} className="font-semibold underline">Tentar novamente</button>
          </div>
        )}

        {loading ? (
          <div className="py-16 flex items-center justify-center text-textMuted text-sm">
            <Loader2 size={16} className="animate-spin mr-2" /> Carregando…
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-16 text-center text-textMuted text-sm">
            {tab === 'pending' ? 'Nenhuma avaliação aguardando moderação. 🎉' : 'Nenhuma avaliação publicada ainda.'}
          </div>
        ) : (
          reviews.map((r) => (
            <div key={r.id} className="border border-line rounded-xl bg-white p-4 flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <Stars n={r.rating} />
                <span className="text-[13px] text-textMuted">
                  <span className="font-semibold text-primary">{r.clientName}</span> · {r.barberName}
                </span>
                <span className="ml-auto text-[11px] text-textDisabled">
                  {format(new Date(r.createdAt), "dd 'de' MMM", { locale: ptBR })}
                </span>
              </div>
              {r.comment && <p className="text-[14px] text-primary italic">“{r.comment}”</p>}
              {r.services.length > 0 && (
                <p className="text-[11px] text-textDisabled">{r.services.join(' · ')}</p>
              )}
              <div className="flex items-center gap-2 pt-1">
                {tab === 'pending' ? (
                  <>
                    <button
                      disabled={pending === r.id}
                      onClick={() => act(r.id, 'publish')}
                      className="inline-flex items-center gap-1.5 bg-success text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:opacity-90 disabled:opacity-50"
                    >
                      <Check size={14} /> Publicar
                    </button>
                    <button
                      disabled={pending === r.id}
                      onClick={() => act(r.id, 'reject')}
                      className="inline-flex items-center gap-1.5 border border-error/30 text-error text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-error/5 disabled:opacity-50"
                    >
                      <X size={14} /> Rejeitar
                    </button>
                  </>
                ) : (
                  <button
                    disabled={pending === r.id}
                    onClick={() => act(r.id, 'unpublish')}
                    className="inline-flex items-center gap-1.5 border border-line text-textMuted text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-fill disabled:opacity-50"
                  >
                    Despublicar
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
