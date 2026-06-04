import { StatusBadge } from '@/components/shared/StatusBadge'

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex-1 border border-line rounded-[10px] px-3.5 py-3 bg-white">
      <div className="font-mono text-[9.5px] text-textDisabled tracking-wide uppercase">{label}</div>
      <div className={`font-bold text-[22px] mt-0.5 ${color || 'text-primary'}`}>{value}</div>
    </div>
  )
}

const APPOINTMENTS = [
  { time: '09:00', client: 'Carlos M.', barber: 'Rafael', svc: 'Corte máquina', total: 'R$ 45', status: 'completed' as const },
  { time: '10:00', client: 'João P.', barber: 'Rafael', svc: 'Corte + Barba', total: 'R$ 75', status: 'completed' as const },
  { time: '11:00', client: 'André S.', barber: 'Bruno', svc: 'Barba', total: 'R$ 30', status: 'completed' as const },
  { time: '14:30', client: 'Felipe R.', barber: 'Rafael', svc: 'Corte + Barba', total: 'R$ 75', status: 'in_progress' as const },
  { time: '15:00', client: 'Diego A.', barber: 'Bruno', svc: 'Corte', total: 'R$ 45', status: 'scheduled' as const },
  { time: '15:30', client: 'Marcos V.', barber: 'Lucas', svc: 'Pézinho', total: 'R$ 20', status: 'scheduled' as const },
  { time: '16:00', client: 'Pedro L.', barber: 'Rafael', svc: 'Platinado', total: 'R$ 180', status: 'cancelled' as const },
]

export default function AgendamentosAdminPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-wrap items-center gap-3 px-4 sm:px-[22px] py-4 border-b border-line bg-white">
        <div>
          <div className="font-bold text-[19px] text-primary">Agendamentos</div>
          <div className="text-[13px] text-textMuted">Quinta, 04 jun · todos os barbeiros</div>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          {['Hoje', 'Semana', 'Mês'].map((t, i) => (
            <span key={t} className={`text-xs font-semibold px-3 py-1 rounded-full border cursor-pointer ${
              i === 0 ? 'bg-primary text-white border-primary' : 'bg-white text-textMuted border-line hover:border-accent/40'
            }`}>
              {t}
            </span>
          ))}
          <span className="text-xs font-semibold px-3 py-1 rounded-full border bg-white text-textMuted border-line cursor-pointer ml-1">
            Todos barbeiros ▾
          </span>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-3.5 overflow-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Stat label="Total do dia" value="8" />
          <Stat label="Concluídos" value="3" color="text-success" />
          <Stat label="Em andamento" value="1" color="text-warning" />
          <Stat label="Faturamento prev." value="R$ 470" color="text-accent-deep" />
        </div>

        <div className="border border-line rounded-xl bg-white overflow-hidden">
          <div className="overflow-x-auto">
          <div className="min-w-[620px]">
          <div
            className="grid px-3.5 py-2 border-b border-line font-mono text-[9px] text-textDisabled tracking-wide"
            style={{ gridTemplateColumns: '0.6fr 1.2fr 1fr 1.2fr 0.7fr 1fr' }}
          >
            {['HORA', 'CLIENTE', 'BARBEIRO', 'SERVIÇO', 'TOTAL', 'STATUS'].map((h) => (
              <span key={h}>{h}</span>
            ))}
          </div>
          {APPOINTMENTS.map((a, i) => (
            <div
              key={i}
              className="grid items-center px-3.5 py-3 border-b border-fill text-[13px]"
              style={{
                gridTemplateColumns: '0.6fr 1.2fr 1fr 1.2fr 0.7fr 1fr',
                background: i % 2 ? '#F7F5F2' : '#fff',
              }}
            >
              <span className="font-bold">{a.time}</span>
              <span className="font-bold">{a.client}</span>
              <span className="text-textMuted">{a.barber}</span>
              <span className="text-textMuted">{a.svc}</span>
              <span className="font-bold text-accent-deep">{a.total}</span>
              <span><StatusBadge status={a.status} /></span>
            </div>
          ))}
          </div>
          </div>
        </div>
      </div>
    </div>
  )
}
