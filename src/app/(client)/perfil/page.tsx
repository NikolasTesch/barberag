'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Scissors } from 'lucide-react'

interface ProfileData {
  user: {
    name: string | null
    email: string | null
    phone: string | null
    image: string | null
  }
  stats: {
    totalVisits: number
    totalSpent: number
    favoriteBarber: string | null
    loyaltyCount: number
  }
  recentHistory: {
    id: string
    scheduledAt: string
    services: string
    barberName: string
    totalPrice: number
  }[]
}

function TopBar({ title }: { title: string }) {
  return (
    <div className="bg-primary text-white px-4 py-3 flex items-center gap-2.5 flex-shrink-0">
      <span className="font-bold text-[15px] flex-1">{title}</span>
      <span className="font-display font-black text-[19px] text-accent tracking-tight">BARBERAG</span>
    </div>
  )
}

export default function PerfilPage() {
  const [data, setData] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/client/profile')
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  const initials = (data?.user?.name ?? 'U')
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')

  const { totalVisits = 0, totalSpent = 0, favoriteBarber = null, loyaltyCount = 0 } =
    data?.stats ?? {}

  return (
    <div className="flex flex-col h-full bg-fill-soft">
      <TopBar title="Meu perfil" />

      {loading ? (
        <div className="flex-1 p-3 flex flex-col gap-3">
          <div className="h-[76px] rounded-xl bg-primary/20 animate-pulse" />
          <div className="flex gap-2.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex-1 h-16 rounded-[10px] bg-fill animate-pulse" />
            ))}
          </div>
          <div className="h-20 rounded-xl bg-fill animate-pulse" />
          <div className="h-4 w-32 rounded bg-fill animate-pulse mt-1" />
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-12 rounded-[10px] bg-fill animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 lg:max-w-2xl lg:w-full">
          {/* Profile header */}
          <div className="flex items-center gap-3 p-3.5 bg-primary rounded-xl text-white">
            <div className="w-[50px] h-[50px] rounded-full bg-white/10 border border-white/20 flex items-center justify-center font-bold text-base flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-[16px] truncate">{data?.user?.name ?? '—'}</div>
              <div className="text-xs text-white/60 truncate">
                {data?.user?.phone ?? data?.user?.email ?? '—'}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-2.5">
            {(
              [
                [String(totalVisits), 'visitas'],
                [`R$ ${totalSpent.toFixed(0)}`, 'total gasto'],
                [favoriteBarber ?? '—', 'favorito'],
              ] as [string, string][]
            ).map(([value, label]) => (
              <div
                key={label}
                className="flex-1 border border-line rounded-[10px] py-2.5 px-2 text-center bg-white"
              >
                <div className="font-bold text-[17px] text-accent-deep truncate">{value}</div>
                <div className="font-mono text-[9px] text-textDisabled uppercase tracking-wide">
                  {label}
                </div>
              </div>
            ))}
          </div>

          {/* Loyalty */}
          <div className="border border-accent rounded-xl bg-accent-soft p-3">
            <div className="flex justify-between mb-2">
              <p className="text-[10px] font-semibold tracking-widest uppercase text-textMuted">
                Fidelidade · {loyaltyCount} de 10 cortes
              </p>
              {loyaltyCount >= 8 && (
                <span className="font-bold text-[12px] text-accent-deep">
                  +{10 - loyaltyCount} = grátis 🎁
                </span>
              )}
            </div>
            <div className="flex gap-1">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-3.5 rounded-sm border border-accent ${
                    i < loyaltyCount ? 'bg-accent' : 'bg-white'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* History */}
          <p className="text-[10px] font-semibold tracking-widest uppercase text-textMuted mt-1">
            Histórico de cortes
          </p>

          {data?.recentHistory && data.recentHistory.length > 0 ? (
            <div className="flex flex-col gap-2">
              {data.recentHistory.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2.5 px-3 py-2.5 bg-white border border-line rounded-[10px]"
                >
                  <div className="w-10 text-center flex-shrink-0">
                    <div className="font-mono text-[11px] text-textMuted">
                      {format(new Date(item.scheduledAt), 'd MMM', { locale: ptBR })}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-[13px] truncate">{item.services}</div>
                    <div className="text-[11px] text-textMuted">com {item.barberName}</div>
                  </div>
                  <span className="font-bold text-[13px] text-primary flex-shrink-0">
                    R$ {item.totalPrice.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <Scissors size={28} className="text-textDisabled" />
              <p className="text-sm text-textMuted">Nenhum corte registrado ainda.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
