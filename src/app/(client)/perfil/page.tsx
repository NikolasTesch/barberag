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

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-fill-soft">
        {/* Mobile header skeleton */}
        <div className="bg-primary text-white px-4 py-3 flex-shrink-0 lg:hidden">
          <div className="h-4 w-24 bg-white/20 rounded animate-pulse" />
        </div>
        {/* Skeleton body */}
        <div className="flex-1 p-3 lg:p-8 flex flex-col gap-3 lg:grid lg:grid-cols-[380px_1fr] lg:gap-8 lg:items-start">
          <div className="flex flex-col gap-3">
            <div className="h-8 w-36 rounded bg-primary/20 animate-pulse hidden lg:block" />
            <div className="h-[88px] rounded-xl bg-primary/20 animate-pulse" />
            <div className="flex gap-2.5">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex-1 h-16 rounded-[10px] bg-fill animate-pulse" />
              ))}
            </div>
            <div className="h-20 rounded-xl bg-fill animate-pulse" />
          </div>
          <div className="flex flex-col gap-3">
            <div className="h-4 w-40 rounded bg-fill animate-pulse" />
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-14 rounded-[10px] bg-fill animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-fill-soft">
      {/* Mobile-only header */}
      <div className="bg-primary text-white px-4 py-3 flex-shrink-0 lg:hidden">
        <span className="font-bold text-[15px]">Meu perfil</span>
      </div>

      {/* Content — single col mobile, 2-col desktop */}
      <div className="flex-1 overflow-y-auto lg:overflow-hidden">
        <div className="flex flex-col gap-3 p-3 lg:h-full lg:grid lg:grid-cols-[380px_1fr] lg:gap-0 lg:p-0">

          {/* Left column: identity + stats + loyalty */}
          <div className="flex flex-col gap-3 lg:p-8 lg:border-r lg:border-line lg:overflow-y-auto">
            {/* Desktop title */}
            <h1 className="hidden lg:block font-bold text-2xl text-primary mb-1">Meu perfil</h1>

            {/* User card */}
            <div className="flex items-center gap-3 lg:gap-4 p-4 lg:p-5 bg-primary rounded-xl text-white">
              <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center font-bold text-base lg:text-xl flex-shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-[16px] lg:text-xl truncate">
                  {data?.user?.name ?? '—'}
                </div>
                <div className="text-xs lg:text-sm text-white/60 truncate mt-0.5">
                  {data?.user?.phone ?? data?.user?.email ?? '—'}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-2.5">
              {(
                [
                  [String(totalVisits), 'visitas'],
                  [favoriteBarber ?? '—', 'favorito'],
                ] as [string, string][]
              ).map(([value, label]) => (
                <div
                  key={label}
                  className="flex-1 border border-line rounded-[10px] py-3 px-2 text-center bg-white"
                >
                  <div className="font-bold text-[17px] lg:text-xl text-accent-deep truncate">
                    {value}
                  </div>
                  <div className="font-mono text-[9px] lg:text-[10px] text-textDisabled uppercase tracking-wide mt-0.5">
                    {label}
                  </div>
                </div>
              ))}
            </div>

            {/* Loyalty */}
            <div className="border border-accent rounded-xl bg-accent-soft p-3 lg:p-4">
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
          </div>

          {/* Right column: history */}
          <div className="flex flex-col gap-3 lg:p-8 lg:overflow-y-auto">
            <p className="text-[10px] font-semibold tracking-widest uppercase text-textMuted">
              Histórico de cortes
            </p>

            {data?.recentHistory && data.recentHistory.length > 0 ? (
              <div className="flex flex-col gap-2">
                {data.recentHistory.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 px-4 py-3 lg:py-4 bg-white border border-line rounded-[10px] hover:border-accent/30 transition-colors"
                  >
                    <div className="w-12 text-center flex-shrink-0">
                      <div className="font-mono text-[11px] lg:text-xs text-textMuted">
                        {format(new Date(item.scheduledAt), 'd MMM', { locale: ptBR })}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-[13px] lg:text-sm truncate">{item.services}</div>
                      <div className="text-[11px] lg:text-xs text-textMuted">com {item.barberName}</div>
                    </div>
                    <span className="font-bold text-[13px] lg:text-sm text-primary flex-shrink-0">
                      R$ {item.totalPrice.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 py-16 text-center">
                <Scissors size={32} className="text-textDisabled" />
                <p className="text-sm text-textMuted">Nenhum corte registrado ainda.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
