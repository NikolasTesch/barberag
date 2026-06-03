const CLIENTS = [
  { initials: 'FR', name: 'Felipe Ramos', phone: '(11) 9 8888-7777', visits: 12, last: '20 mai' },
  { initials: 'CM', name: 'Carlos Mendes', phone: '(11) 9 7777-6666', visits: 8, last: '31 mai' },
  { initials: 'JP', name: 'João Paulo', phone: '(11) 9 6666-5555', visits: 5, last: '02 mai' },
  { initials: 'AS', name: 'André Silva', phone: '(11) 9 5555-4444', visits: 3, last: '03 jun' },
]

export default function BarberClientesPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-[22px] py-4 border-b border-line bg-white">
        <div>
          <div className="font-bold text-[19px] text-primary">Meus clientes</div>
          <div className="text-[13px] text-textMuted">Clientes que você já atendeu</div>
        </div>
        <span className="ml-auto text-xs font-semibold px-3 py-1 rounded-full border bg-white text-textMuted border-line cursor-pointer">
          Buscar ⌕
        </span>
      </div>

      <div className="p-4 grid grid-cols-2 gap-3 overflow-auto">
        {CLIENTS.map((c) => (
          <div key={c.name} className="flex items-center gap-3 p-3.5 bg-white border border-line rounded-xl">
            <div className="w-[42px] h-[42px] rounded-full bg-primary text-white flex items-center justify-center font-bold flex-shrink-0">
              {c.initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-[14.5px]">{c.name}</div>
              <div className="text-[12px] text-textMuted">{c.phone}</div>
            </div>
            <div className="text-right">
              <div className="font-bold text-[15px] text-accent-deep">{c.visits}</div>
              <div className="font-mono text-[9px] text-textDisabled uppercase">visitas</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
