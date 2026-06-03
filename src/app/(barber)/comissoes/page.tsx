import { StatusBadge } from '@/components/shared/StatusBadge'

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex-1 border border-line rounded-[10px] px-3.5 py-3 bg-white">
      <div className="font-mono text-[9.5px] text-textDisabled tracking-wide uppercase">{label}</div>
      <div className={`font-bold text-[22px] mt-0.5 ${color || 'text-primary'}`}>{value}</div>
    </div>
  )
}

const rows = [
  { date: '04 jun', client: 'Felipe R.', svc: 'Corte+Barba', value: 'R$ 75', pct: '40%', commission: 'R$ 31,50', status: 'pending' as const },
  { date: '04 jun', client: 'Diego A.', svc: 'Corte tesoura', value: 'R$ 45', pct: '40%', commission: 'R$ 18,00', status: 'pending' as const },
  { date: '03 jun', client: 'André S.', svc: 'Barba', value: 'R$ 30', pct: '40%', commission: 'R$ 12,00', status: 'pending' as const },
  { date: '31 mai', client: 'Carlos M.', svc: 'Corte+Barba', value: 'R$ 75', pct: '40%', commission: 'R$ 31,50', status: 'paid' as const },
  { date: '29 mai', client: 'João P.', svc: 'Platinado', value: 'R$ 180', pct: '40%', commission: 'R$ 72,00', status: 'paid' as const },
  { date: '28 mai', client: 'Marcos V.', svc: 'Corte', value: 'R$ 45', pct: '40%', commission: 'R$ 18,00', status: 'paid' as const },
]

const spark = [30, 45, 28, 60, 52, 70, 48, 66]

export default function ComissoesBarbelroPage() {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-[22px] py-4 border-b border-line bg-white">
        <div>
          <div className="font-bold text-[19px] text-primary">Minhas comissões</div>
          <div className="text-[13px] text-textMuted">Rafael · período: Junho 2026</div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {['Mai', 'Jun', 'Personalizado'].map((t, i) => (
            <span key={t} className={`text-xs font-semibold px-3 py-1 rounded-full border cursor-pointer ${
              i === 1 ? 'bg-primary text-white border-primary' : 'bg-white text-textMuted border-line hover:border-accent/40'
            }`}>
              {t}
            </span>
          ))}
          <button className="text-xs border border-line px-3 py-1.5 rounded-lg hover:bg-fill transition-colors ml-1">
            ↓ Extrato
          </button>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-3.5 overflow-auto">
        {/* KPIs */}
        <div className="flex gap-3">
          <Stat label="A receber (pendente)" value="R$ 61,50" color="text-accent-deep" />
          <Stat label="Já pago · mês" value="R$ 121,50" color="text-success" />
          <Stat label="Atendimentos" value="6" />
          <Stat label="Taxa média" value="40%" />
        </div>

        <div className="grid grid-cols-[1.6fr_1fr] gap-3.5">
          {/* Table */}
          <div className="border border-line rounded-xl bg-white overflow-hidden">
            <div className="grid grid-cols-[0.7fr_1.1fr_1.1fr_0.7fr_0.5fr_0.8fr_0.7fr] px-3 py-2 border-b border-line">
              {['DATA', 'CLIENTE', 'SERVIÇO', 'VALOR', '%', 'COMISSÃO', 'STATUS'].map((h) => (
                <span key={h} className="font-mono text-[9px] text-textDisabled tracking-wide">{h}</span>
              ))}
            </div>
            {rows.map((row, i) => (
              <div
                key={i}
                className={`grid grid-cols-[0.7fr_1.1fr_1.1fr_0.7fr_0.5fr_0.8fr_0.7fr] items-center px-3 py-2.5 border-b border-fill text-[12.5px] ${
                  i % 2 ? 'bg-fill-soft' : 'bg-white'
                }`}
              >
                <span className="text-textMuted">{row.date}</span>
                <span className="font-bold">{row.client}</span>
                <span className="text-textMuted">{row.svc}</span>
                <span>{row.value}</span>
                <span className="text-textMuted">{row.pct}</span>
                <span className="font-bold text-accent-deep">{row.commission}</span>
                <span><StatusBadge status={row.status} /></span>
              </div>
            ))}
          </div>

          {/* Right panel */}
          <div className="flex flex-col gap-3.5">
            {/* Sparkline */}
            <div className="border border-line rounded-xl bg-white p-3.5">
              <p className="text-[10px] font-semibold tracking-widest uppercase text-textMuted mb-2">
                Evolução · 8 semanas
              </p>
              <div className="flex items-end gap-2 h-24">
                {spark.map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t border border-line"
                    style={{
                      height: `${h}%`,
                      background: i === spark.length - 1 ? '#D4830A' : '#FBEDD6',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Next payment */}
            <div className="border border-accent rounded-xl bg-accent-soft p-3.5">
              <p className="text-[10px] font-semibold tracking-widest uppercase text-textMuted mb-1">
                Próximo pagamento
              </p>
              <div className="font-bold text-[26px] text-accent-deep">R$ 61,50</div>
              <p className="text-[15px] text-accent-deep mt-0.5">fecha sexta · 06 jun</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
