import Link from 'next/link'
import type { LandingConfig } from '@/lib/landing'

export function Footer({ config }: { config: LandingConfig | null }) {
  const address = config?.address ?? 'Rua das Tesouras, 100 — Centro'
  const phone = config?.phone ?? '(11) 9 9999-9999'
  const email = config?.email ?? 'oi@barberag.com'
  const year = new Date().getFullYear()

  return (
    <footer className="bg-primary text-white/70">
      {/* CTA Banner */}
      <div className="mx-6 md:mx-10 mb-11 bg-accent rounded-2xl p-8 md:p-9 flex flex-col md:flex-row items-center gap-6 text-white">
        <div className="flex-1 text-center md:text-left">
          <h3 className="font-display font-bold text-[26px] md:text-[32px] leading-tight">
            Pronto pra um corte de respeito?
          </h3>
          <p className="text-sm opacity-90 mt-1">Agende online em menos de 1 minuto.</p>
        </div>
        <Link
          href="/agendar"
          className="bg-primary text-white font-semibold text-base px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap"
        >
          Agendar agora →
        </Link>
      </div>

      <div className="px-6 md:px-10 pb-7 flex flex-col md:flex-row gap-8 border-t border-white/10 pt-7 max-w-7xl mx-auto">
        <div className="flex-1">
          <span className="font-display font-black text-[24px] text-accent tracking-tight">BARBERAG</span>
          <p className="text-xs mt-2 max-w-[240px] leading-relaxed">Authentic barbershop. {address}.</p>
        </div>

        <div>
          <div className="font-mono text-[10px] tracking-widest uppercase text-accent mb-2">Horário</div>
          {['Seg–Sex 9h–19h', 'Sáb 9h–18h', 'Dom fechado'].map((i) => (
            <div key={i} className="text-[12.5px] mb-1.5">{i}</div>
          ))}
        </div>
        <div>
          <div className="font-mono text-[10px] tracking-widest uppercase text-accent mb-2">Contato</div>
          <div className="text-[12.5px] mb-1.5">{phone}</div>
          <div className="text-[12.5px] mb-1.5">{email}</div>
          <div className="text-[12.5px] mb-1.5">@barberag</div>
        </div>
        <div>
          <div className="font-mono text-[10px] tracking-widest uppercase text-accent mb-2">Navegação</div>
          {[['Serviços', '#servicos'], ['Equipe', '#equipe'], ['Galeria', '#galeria'], ['Contato', '#contato']].map(([l, h]) => (
            <a key={l} href={h} className="block text-[12.5px] mb-1.5 hover:text-white transition-colors">{l}</a>
          ))}
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-[12px] text-white/50">
        © {year} BARBERAG. Todos os direitos reservados.
      </div>
    </footer>
  )
}
