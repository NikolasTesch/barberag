const DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
const HOURS = ['08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19']

type CellState = 'work' | 'lunch' | 'off' | 'block'

function cellState(d: number, hIdx: number): CellState {
  if (d === 6) return 'off'
  if (d === 5 && hIdx > 8) return 'off'
  if (hIdx === 4) return 'lunch'
  if (d === 2 && hIdx === 8) return 'block'
  if (hIdx === 0 || hIdx === 11) return 'off'
  return 'work'
}

const toneMap: Record<CellState, { bg: string; border: string; text: string }> = {
  work: { bg: 'bg-accent-soft', border: 'border-accent', text: '' },
  lunch: { bg: 'bg-[#f7e9cf]', border: 'border-[#e0c178]', text: '◷' },
  off: { bg: 'bg-fill-soft', border: 'border-line', text: '' },
  block: { bg: 'bg-error/10', border: 'border-error', text: '✕' },
}

export default function DisponibilidadePage() {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-[22px] py-4 border-b border-line bg-white">
        <div>
          <div className="font-bold text-[19px] text-primary">Disponibilidade</div>
          <div className="text-[13px] text-textMuted">Rafael · defina sua grade semanal e bloqueios</div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {['Grade semanal', 'Folgas'].map((t, i) => (
            <span key={t} className={`text-xs font-semibold px-3 py-1 rounded-full border cursor-pointer ${
              i === 0 ? 'bg-primary text-white border-primary' : 'bg-white text-textMuted border-line'
            }`}>
              {t}
            </span>
          ))}
          <button className="bg-accent text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-accent-deep transition-colors ml-1">
            Salvar grade
          </button>
        </div>
      </div>

      <div className="p-4 grid grid-cols-[1fr_250px] gap-3.5 overflow-auto">
        {/* Grid */}
        <div className="border border-line rounded-xl bg-white p-4">
          <p className="text-[10px] font-semibold tracking-widest uppercase text-textMuted mb-3">
            Grade — quem agenda enxerga só os horários livres
          </p>
          <div
            className="grid gap-[3px]"
            style={{ gridTemplateColumns: '38px repeat(7, 1fr)' }}
          >
            {/* Header row */}
            <span />
            {DAYS.map((d) => (
              <div key={d} className="text-center font-mono text-[10px] text-textMuted font-bold pb-1">{d}</div>
            ))}

            {/* Hour rows */}
            {HOURS.map((h, hIdx) => (
              <>
                <div key={`h-${h}`} className="font-mono text-[9px] text-textDisabled text-right pr-1 self-center">
                  {h}h
                </div>
                {DAYS.map((_, d) => {
                  const st = cellState(d, hIdx)
                  const { bg, border, text } = toneMap[st]
                  return (
                    <div
                      key={`${h}-${d}`}
                      className={`h-[22px] rounded border ${bg} ${border} flex items-center justify-center text-[9px] font-mono`}
                      style={{ color: st === 'block' ? '#C0392B' : st === 'lunch' ? '#a9791f' : undefined }}
                    >
                      {text}
                    </div>
                  )
                })}
              </>
            ))}
          </div>

          {/* Legend */}
          <div className="flex gap-3.5 mt-3.5 flex-wrap">
            {[
              ['Trabalha', 'bg-accent-soft', 'border-accent'],
              ['Almoço', 'bg-[#f7e9cf]', 'border-[#e0c178]'],
              ['Bloqueio', 'bg-error/10', 'border-error'],
              ['Folga', 'bg-fill-soft', 'border-line'],
            ].map(([label, bg, bd]) => (
              <span key={label} className="flex items-center gap-1.5 text-[12px] text-textMuted">
                <span className={`w-3 h-3 rounded border ${bg} ${bd}`} />
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div className="flex flex-col gap-3">
          {/* Standard hours */}
          <div className="border border-line rounded-xl bg-white p-3.5">
            <p className="text-[10px] font-semibold tracking-widest uppercase text-textMuted mb-2">
              Jornada padrão
            </p>
            {[
              ['Início', '09:00'],
              ['Almoço', '12:00–13:00'],
              ['Fim', '19:00'],
              ['Intervalo entre cortes', '5 min'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between py-[7px] border-b border-dashed border-line text-[13px]">
                <span className="text-textMuted">{k}</span>
                <span className="font-bold">{v}</span>
              </div>
            ))}
          </div>

          {/* Blocked slots */}
          <div className="border border-error rounded-xl bg-error/5 p-3.5">
            <p className="text-[10px] font-semibold tracking-widest uppercase text-textMuted mb-2">
              Bloqueios pontuais
            </p>
            <div className="flex flex-col gap-2">
              {[
                ['Qua 04 · 16h–17h', '· médico'],
                ['Sex 06 · dia todo', '· folga'],
              ].map(([time, reason], i) => (
                <div key={i} className="flex items-center gap-2 text-[12.5px]">
                  <span className="text-error">✕</span>
                  <span className="flex-1">
                    {time} <span className="text-textMuted">{reason}</span>
                  </span>
                </div>
              ))}
            </div>
            <button className="w-full mt-2.5 border border-error text-error text-xs font-semibold py-2 rounded-lg hover:bg-error/5 transition-colors">
              + Novo bloqueio
            </button>
          </div>

          <div className="border border-dashed border-line rounded-xl p-3 text-[14px] text-textMuted leading-snug">
            💡 Mudanças não afetam agendamentos já confirmados.
          </div>
        </div>
      </div>
    </div>
  )
}
