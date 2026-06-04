import Link from 'next/link'
import { StatusBadge } from '@/components/shared/StatusBadge'

export default function AtendimentoListPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-wrap items-center gap-3 px-4 sm:px-[22px] py-4 border-b border-line bg-white">
        <div className="font-bold text-[19px] text-primary">Atendimentos de hoje</div>
      </div>
      <div className="p-4 flex flex-col gap-2.5">
        {[
          { id: '1', time: '14:30', name: 'Felipe R.', svc: 'Corte + Barba', status: 'in_progress' as const },
          { id: '2', time: '15:30', name: 'Diego A.', svc: 'Corte tesoura', status: 'scheduled' as const },
        ].map((appt) => (
          <Link
            key={appt.id}
            href={`/atendimento/${appt.id}`}
            className="flex items-center gap-3.5 px-3.5 py-3 bg-white border border-line rounded-xl hover:border-accent/40 transition-colors"
          >
            <div className="text-center w-14 flex-shrink-0">
              <div className="font-bold text-[16px]">{appt.time}</div>
            </div>
            <div className="flex-1">
              <div className="font-bold text-[14.5px]">{appt.name}</div>
              <div className="text-[12.5px] text-textMuted">{appt.svc}</div>
            </div>
            <StatusBadge status={appt.status} />
          </Link>
        ))}
      </div>
    </div>
  )
}
