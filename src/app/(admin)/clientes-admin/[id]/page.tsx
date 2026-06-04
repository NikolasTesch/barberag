import Link from 'next/link'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft } from 'lucide-react'
import { prisma } from '@/lib/prisma/client'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatBRL, initials } from '@/lib/utils/format'

export const dynamic = 'force-dynamic'

const STATUS_VARIANT: Record<string, 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'> = {
  SCHEDULED: 'scheduled',
  CONFIRMED: 'scheduled',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show',
}

export default async function ClientProfilePage({ params }: { params: { id: string } }) {
  const client = await prisma.user.findFirst({
    where: { id: params.id, role: 'CLIENT' },
    select: {
      name: true,
      email: true,
      phone: true,
      image: true,
      createdAt: true,
      appointments: {
        select: {
          id: true,
          status: true,
          scheduledAt: true,
          totalPrice: true,
          barber: { select: { user: { select: { name: true } } } },
          services: { select: { service: { select: { name: true } } } },
        },
        orderBy: { scheduledAt: 'desc' },
      },
    },
  })

  if (!client) notFound()

  const completed = client.appointments.filter((a) => a.status === 'COMPLETED')
  const totalSpent = Math.round(completed.reduce((acc, a) => acc + a.totalPrice, 0) * 100) / 100
  const barberFreq = new Map<string, number>()
  for (const a of completed) {
    const n = a.barber.user.name
    barberFreq.set(n, (barberFreq.get(n) ?? 0) + 1)
  }
  const favoriteBarber = Array.from(barberFreq.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—'

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-wrap items-center gap-3 px-4 sm:px-[22px] py-4 border-b border-line bg-white">
        <Link href="/clientes-admin" className="text-textMuted hover:text-primary">
          <ChevronLeft size={20} />
        </Link>
        <div className="font-bold text-[19px] text-primary">{client.name}</div>
      </div>

      <div className="p-4 flex flex-col gap-3.5 overflow-auto">
        {/* Dados + stats */}
        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_2fr] gap-3.5">
          <div className="border border-line rounded-xl bg-white p-4 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg overflow-hidden mb-2">
              {client.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={client.image} alt={client.name} className="w-full h-full object-cover" />
              ) : (
                initials(client.name)
              )}
            </div>
            <div className="font-bold">{client.name}</div>
            <div className="text-[13px] text-textMuted">{client.email}</div>
            <div className="text-[13px] text-textMuted">{client.phone ?? 'Sem telefone'}</div>
            <div className="text-[11px] text-textDisabled mt-1">
              Cliente desde {format(client.createdAt, "MMM 'de' yyyy", { locale: ptBR })}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
            {[
              { label: 'Total gasto', value: formatBRL(totalSpent), accent: true },
              { label: 'Visitas', value: String(completed.length) },
              { label: 'Barbeiro favorito', value: favoriteBarber },
            ].map((s) => (
              <div key={s.label} className="border border-line rounded-xl bg-white px-3.5 py-3 flex flex-col justify-center">
                <div className="font-mono text-[9.5px] text-textDisabled tracking-wide uppercase">{s.label}</div>
                <div className={`font-bold text-[18px] mt-1 ${s.accent ? 'text-accent-deep' : 'text-primary'}`}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Histórico */}
        <div className="border border-line rounded-xl bg-white overflow-hidden">
          <div className="px-3.5 py-2.5 border-b border-line">
            <p className="text-[10px] font-semibold tracking-widest uppercase text-textMuted">
              Histórico de agendamentos ({client.appointments.length})
            </p>
          </div>
          {client.appointments.length === 0 ? (
            <div className="py-8 text-center text-textMuted text-sm">Nenhum agendamento.</div>
          ) : (
            client.appointments.map((a, i) => (
              <div
                key={a.id}
                className="flex items-center gap-3 px-3.5 py-3 border-b border-fill text-[13px]"
                style={{ background: i % 2 ? '#F7F5F2' : '#fff' }}
              >
                <span className="font-mono text-[11px] text-textMuted w-24">
                  {format(new Date(a.scheduledAt), 'dd/MM/yy HH:mm', { locale: ptBR })}
                </span>
                <span className="flex-1 truncate">
                  <span className="font-semibold">{a.barber.user.name}</span>
                  <span className="text-textDisabled"> · {a.services.map((s) => s.service.name).join(', ')}</span>
                </span>
                <span className="font-mono text-[12px]">{formatBRL(a.totalPrice)}</span>
                <StatusBadge status={STATUS_VARIANT[a.status] ?? 'scheduled'} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
