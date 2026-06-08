import { prisma } from '@/lib/prisma/client'
import { getServerSession } from '@/lib/auth/helpers'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar, Plus, Clock, User, Scissors, ChevronRight } from 'lucide-react'

export default async function InicioPage() {
  const session = await getServerSession()
  const clientId = session!.user.id
  const firstName = session!.user.name?.split(' ')[0] ?? 'Cliente'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'

  const [nextAppointment, totalVisits] = await Promise.all([
    prisma.appointment.findFirst({
      where: {
        clientId,
        scheduledAt: { gte: new Date() },
        status: { notIn: ['CANCELLED', 'NO_SHOW'] },
      },
      orderBy: { scheduledAt: 'asc' },
      include: {
        barber: { include: { user: { select: { name: true } } } },
        services: { include: { service: { select: { name: true } } } },
      },
    }),
    prisma.appointment.count({ where: { clientId, status: 'COMPLETED' } }),
  ])

  return (
    <div className="flex flex-col h-full bg-fill-soft">
      {/* Greeting header */}
      <div className="bg-primary text-white px-5 py-4 lg:px-10 lg:py-8 flex-shrink-0">
        <p className="text-white/50 text-sm lg:text-base">{greeting},</p>
        <h1 className="font-bold text-xl lg:text-4xl mt-0.5">{firstName}</h1>
      </div>

      {/* Content — single col on mobile, 2-col on desktop */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-8">
        <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[1fr_296px] lg:gap-8 lg:items-start">

          {/* Left: Próximo agendamento */}
          <section>
            <p className="text-[10px] font-semibold tracking-widest uppercase text-textMuted mb-2 lg:mb-3">
              Próximo agendamento
            </p>

            {nextAppointment ? (
              <div className="bg-white border border-line rounded-xl p-4 lg:p-6 flex flex-col gap-3 lg:gap-5">
                {/* Barber row */}
                <div className="flex items-center gap-3 lg:gap-4">
                  <div className="w-10 h-10 lg:w-14 lg:h-14 rounded-full bg-primary flex items-center justify-center text-white flex-shrink-0">
                    <User size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-[15px] lg:text-xl">
                      {nextAppointment.barber.user.name}
                    </div>
                    <div className="text-[12px] lg:text-sm text-textMuted truncate">
                      {nextAppointment.services.map((s) => s.service.name).join(' + ')}
                    </div>
                  </div>
                  <div className="font-bold text-accent-deep text-[15px] lg:text-2xl flex-shrink-0">
                    R$ {nextAppointment.totalPrice.toFixed(2).replace('.', ',')}
                  </div>
                </div>

                {/* Date + time */}
                <div className="flex items-center gap-4 lg:gap-6 text-[13px] lg:text-sm text-textMuted border-t border-fill pt-3 lg:pt-4">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={14} />
                    {format(new Date(nextAppointment.scheduledAt), "EEE, d 'de' MMM", { locale: ptBR })}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={14} />
                    {format(new Date(nextAppointment.scheduledAt), 'HH:mm')}
                    {' '}· {nextAppointment.totalDuration} min
                  </span>
                </div>

                <Link
                  href="/agendamentos"
                  className="flex items-center justify-center gap-1.5 text-[13px] lg:text-sm font-semibold text-accent-deep border border-accent/30 rounded-lg py-2 lg:py-2.5 hover:bg-accent-soft transition-colors"
                >
                  Ver todos os agendamentos
                  <ChevronRight size={14} />
                </Link>
              </div>
            ) : (
              <div className="bg-white border border-line rounded-xl p-5 lg:p-10 text-center flex flex-col items-center gap-3 lg:gap-4">
                <div className="w-14 h-14 lg:w-20 lg:h-20 rounded-full bg-fill flex items-center justify-center text-textDisabled">
                  <Calendar size={28} />
                </div>
                <div>
                  <p className="font-bold text-primary lg:text-lg">Nenhum agendamento futuro</p>
                  <p className="text-sm lg:text-base text-textMuted mt-1">
                    Que tal agendar seu próximo corte?
                  </p>
                </div>
                <Link
                  href="/agendar"
                  className="bg-accent text-white font-semibold px-5 py-2.5 rounded-xl text-sm lg:text-base hover:bg-accent-deep transition-colors"
                >
                  Agendar agora
                </Link>
              </div>
            )}
          </section>

          {/* Right: Ações rápidas */}
          <section>
            <p className="text-[10px] font-semibold tracking-widest uppercase text-textMuted mb-2 lg:mb-3">
              Ações rápidas
            </p>
            <div className="grid grid-cols-2 gap-2.5 lg:gap-3">
              <Link
                href="/agendar"
                className="bg-accent text-white rounded-xl p-4 flex flex-col gap-2 hover:bg-accent-deep transition-colors"
              >
                <Plus size={20} />
                <span className="font-semibold text-sm">Novo agendamento</span>
              </Link>
              <Link
                href="/agendamentos"
                className="bg-white border border-line rounded-xl p-4 flex flex-col gap-2 hover:bg-fill transition-colors"
              >
                <Calendar size={20} className="text-accent" />
                <span className="font-semibold text-sm text-primary">Ver agenda</span>
              </Link>
              <Link
                href="/perfil"
                className="bg-white border border-line rounded-xl p-4 flex flex-col gap-2 hover:bg-fill transition-colors"
              >
                <User size={20} className="text-accent" />
                <span className="font-semibold text-sm text-primary">Meu perfil</span>
              </Link>
              <div className="bg-white border border-line rounded-xl p-4 flex flex-col gap-2">
                <Scissors size={20} className="text-textDisabled" />
                <div>
                  <span className="font-semibold text-sm text-primary">{totalVisits}</span>
                  <span className="text-xs text-textMuted">
                    {' '}{totalVisits === 1 ? 'visita' : 'visitas'}
                  </span>
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}
