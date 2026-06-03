import { StatusBadge } from '@/components/shared/StatusBadge'

function MainHead({ title, sub, right }: { title: string; sub?: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 px-[22px] py-4 border-b border-line bg-white">
      <div>
        <div className="font-bold text-[19px] text-primary">{title}</div>
        {sub && <div className="text-[13px] text-textMuted">{sub}</div>}
      </div>
      {right && <div className="ml-auto flex items-center gap-2">{right}</div>}
    </div>
  )
}

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex-1 border border-line rounded-[10px] px-3.5 py-3 bg-white">
      <div className="font-mono text-[9.5px] text-textDisabled tracking-wide uppercase">{label}</div>
      <div className={`font-bold text-[22px] mt-0.5 ${color || 'text-primary'}`}>{value}</div>
    </div>
  )
}

function Chip({ children, active }: { children: React.ReactNode; active?: boolean }) {
  return (
    <span className={`text-xs font-semibold px-3 py-1 rounded-full border transition-colors cursor-pointer ${
      active ? 'bg-primary text-white border-primary' : 'bg-white text-textMuted border-line hover:border-accent/40'
    }`}>
      {children}
    </span>
  )
}

const appointments = [
  { time: '09:00', dur: '30min', name: 'Carlos M.', svc: 'Corte máquina', tone: 'done', status: 'completed' as const },
  { time: '10:00', dur: '50min', name: 'João P.', svc: 'Corte + Barba', tone: 'done', status: 'completed' as const },
  { time: '11:00', dur: '20min', name: 'André S.', svc: 'Barba', tone: 'done', status: 'completed' as const },
  { time: '14:30', dur: '50min', name: 'Felipe R.', svc: 'Corte + Barba', tone: 'next', status: 'in_progress' as const, isNext: true },
  { time: '15:30', dur: '30min', name: 'Diego A.', svc: 'Corte tesoura', tone: 'sched', status: 'scheduled' as const },
  { time: '16:30', dur: '20min', name: 'Marcos V.', svc: 'Pézinho', tone: 'sched', status: 'scheduled' as const },
]

const borderColors: Record<string, string> = {
  sched: 'border-l-info',
  prog: 'border-l-accent',
  done: 'border-l-success',
  next: 'border-l-accent',
}

export default function AgendaPage() {
  return (
    <div className="flex flex-col h-full">
      <MainHead
        title="Agenda — Quinta, 04 jun"
        sub="Sua agenda de hoje, ordenada por horário"
        right={
          <>
            <Chip active>Dia</Chip>
            <Chip>Semana</Chip>
            <span className="text-textMuted ml-1.5">‹ hoje ›</span>
          </>
        }
      />

      <div className="p-[18px] flex flex-col gap-3.5 overflow-auto">
        {/* KPIs */}
        <div className="flex gap-3">
          <Stat label="Atendimentos" value="8" />
          <Stat label="Concluídos" value="3" color="text-success" />
          <Stat label="Faturamento Prev." value="R$ 540" color="text-accent-deep" />
          <Stat label="Próximo" value="14:30" color="text-accent-deep" />
        </div>

        {/* Appointments */}
        <div className="flex flex-col gap-2.5">
          {appointments.map((appt) => (
            <div
              key={appt.time}
              className={`flex items-center gap-3.5 px-3.5 py-3 bg-white border border-line border-l-[5px] ${borderColors[appt.tone] || 'border-l-line'} rounded-[10px] relative`}
            >
              <div className="w-[58px] text-center flex-shrink-0">
                <div className="font-bold text-[16px]">{appt.time}</div>
                <div className="font-mono text-[9px] text-textDisabled">{appt.dur}</div>
              </div>

              <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                {appt.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="font-bold text-[14.5px]">{appt.name}</div>
                <div className="text-[12.5px] text-textMuted">{appt.svc}</div>
              </div>

              <StatusBadge status={appt.status} />

              {appt.isNext && (
                <button className="bg-accent text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-accent-deep transition-colors ml-1">
                  Check-in
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
