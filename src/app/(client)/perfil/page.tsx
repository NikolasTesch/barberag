import { Button } from '@/components/ui/button'

function TopBar({ title }: { title: string }) {
  return (
    <div className="bg-primary text-white px-3 py-3 flex items-center gap-2.5">
      <span className="font-bold text-[15px] flex-1">{title}</span>
      <span className="font-display font-black text-[19px] text-accent tracking-tight">BARBERAG</span>
    </div>
  )
}

const history = [
  ['20 mai', 'Corte + Barba', 'Rafael', 'R$ 75'],
  ['02 mai', 'Corte máquina', 'Bruno', 'R$ 45'],
  ['15 abr', 'Corte + Barba', 'Rafael', 'R$ 75'],
]

export default function PerfilPage() {
  return (
    <div className="flex flex-col h-full bg-fill-soft">
      <TopBar title="Meu perfil" />

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
        {/* Profile header */}
        <div className="flex items-center gap-3 p-3.5 bg-primary rounded-xl text-white">
          <div className="w-[50px] h-[50px] rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center font-bold text-base flex-shrink-0">
            FR
          </div>
          <div className="flex-1">
            <div className="font-bold text-[16px]">Felipe Ramos</div>
            <div className="text-xs text-white/60">(11) 9 8888-7777</div>
          </div>
          <button className="border border-white/50 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors">
            Editar
          </button>
        </div>

        {/* Stats */}
        <div className="flex gap-2.5">
          {[['12', 'visitas'], ['R$ 890', 'total gasto'], ['Rafael', 'favorito']].map(([value, label]) => (
            <div
              key={label}
              className="flex-1 border border-line rounded-[10px] py-2.5 px-2 text-center bg-white"
            >
              <div className="font-bold text-[17px] text-accent-deep">{value}</div>
              <div className="font-mono text-[9px] text-textDisabled uppercase tracking-wide">{label}</div>
            </div>
          ))}
        </div>

        {/* Loyalty */}
        <div className="border border-accent rounded-xl bg-accent-soft p-3">
          <div className="flex justify-between mb-2">
            <p className="text-[10px] font-semibold tracking-widest uppercase text-textMuted">
              Fidelidade · 8 de 10 cortes
            </p>
            <span className="font-bold text-[12px] text-accent-deep">+2 = grátis 🎁</span>
          </div>
          <div className="flex gap-1">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-3.5 rounded-sm border border-accent ${i < 8 ? 'bg-accent' : 'bg-white'}`}
              />
            ))}
          </div>
        </div>

        {/* History */}
        <p className="text-[10px] font-semibold tracking-widest uppercase text-textMuted mt-1">
          Histórico de cortes
        </p>

        <div className="flex flex-col gap-2">
          {history.map(([date, svc, barber, price], i) => (
            <div
              key={i}
              className="flex items-center gap-2.5 px-3 py-2.5 bg-white border border-line rounded-[10px]"
            >
              <div className="w-10 text-center">
                <div className="font-mono text-[11px] text-textMuted">{date}</div>
              </div>
              <div className="flex-1">
                <div className="font-bold text-[13px]">{svc}</div>
                <div className="text-[11px] text-textMuted">com {barber}</div>
              </div>
              <span className="font-bold text-[13px] text-primary">{price}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
