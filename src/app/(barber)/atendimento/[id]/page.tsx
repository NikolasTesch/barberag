'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ChevronLeft, X } from 'lucide-react'
import { StatusBadge } from '@/components/shared/StatusBadge'

const paymentMethods = ['Dinheiro', 'Pix', 'Débito', 'Crédito']
const services = [
  { name: 'Corte máquina+tesoura', price: 'R$ 45' },
  { name: 'Barba completa', price: 'R$ 30' },
]

export default function AtendimentoPage() {
  const [selectedPayment, setSelectedPayment] = useState<number>(1)
  const [showNoShow, setShowNoShow] = useState(false)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-[22px] py-4 border-b border-line bg-white">
        <div>
          <div className="flex items-center gap-1.5 font-bold text-[19px] text-primary">
            <Link href="/agenda" className="text-textMuted hover:text-primary">
              <ChevronLeft size={20} />
            </Link>
            Atendimento — Felipe R.
          </div>
          <div className="text-[13px] text-textMuted">14:30 · Qui 04 jun</div>
        </div>
        <div className="ml-auto">
          <StatusBadge status="in_progress" />
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 p-[18px] grid grid-cols-[1.3fr_1fr] gap-4 overflow-auto">
        {/* Left: client + services */}
        <div className="flex flex-col gap-3">
          {/* Client card */}
          <div className="flex items-center gap-3 p-3.5 border border-line rounded-[10px] bg-white">
            <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold flex-shrink-0">
              FR
            </div>
            <div className="flex-1">
              <div className="font-bold text-[16px]">Felipe Ramos</div>
              <div className="text-[12.5px] text-textMuted">(11) 9 8888-7777 · 12ª visita</div>
            </div>
            <button className="text-xs border border-line text-textMuted px-2.5 py-1.5 rounded-lg hover:bg-fill transition-colors">
              histórico
            </button>
          </div>

          {/* Services */}
          <div className="border border-line rounded-[10px] bg-white p-3.5">
            <div className="flex justify-between items-center mb-2.5">
              <p className="text-[10px] font-semibold tracking-widest uppercase text-textMuted">
                Serviços realizados
              </p>
              <button className="text-xs border border-line px-2.5 py-1 rounded-lg hover:bg-fill transition-colors">
                + adicionar
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {services.map(({ name, price }) => (
                <div key={name} className="flex items-center gap-2.5 px-2.5 py-2 bg-fill-soft rounded-lg">
                  <span className="flex-1 text-[14px] font-bold">{name}</span>
                  <span className="text-[14px]">{price}</span>
                  <button className="text-textDisabled hover:text-error transition-colors">
                    <X size={14} />
                  </button>
                </div>
              ))}

              <div className="flex justify-between pt-2 border-t border-dashed border-line font-bold text-[16px]">
                <span>Total</span>
                <span className="text-accent-deep">R$ 75</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: payment + commission + actions */}
        <div className="flex flex-col gap-3">
          {/* Payment */}
          <div className="border border-line rounded-[10px] bg-white p-3.5">
            <p className="text-[10px] font-semibold tracking-widest uppercase text-textMuted mb-2.5">
              Forma de pagamento
            </p>
            <div className="grid grid-cols-2 gap-[7px]">
              {paymentMethods.map((method, i) => (
                <button
                  key={method}
                  onClick={() => setSelectedPayment(i)}
                  className={`text-center py-[9px] rounded-[10px] font-bold text-[13px] border transition-all ${
                    selectedPayment === i
                      ? 'border-accent bg-accent-soft text-accent-deep'
                      : 'border-line bg-white text-primary hover:border-accent/40'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          {/* Commission preview */}
          <div className="border border-success rounded-[10px] bg-success/5 p-3.5">
            <p className="text-[10px] font-semibold tracking-widest uppercase text-textMuted mb-1.5">
              Comissão prevista
            </p>
            <div className="flex justify-between text-[13px] text-textMuted">
              <span>Base R$ 75 · Pix +5%</span>
              <span>40%</span>
            </div>
            <div className="font-bold text-[28px] text-success mt-0.5">R$ 31,50</div>
            <p className="text-[14px] text-success/80 mt-1">calculada automaticamente (RN-04)</p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 mt-auto">
            <button className="w-full bg-accent text-white font-semibold text-[15px] py-3 rounded-xl hover:bg-accent-deep transition-colors">
              ✓ Marcar como concluído
            </button>
            <button
              onClick={() => setShowNoShow(true)}
              className="w-full text-textMuted text-sm py-2 hover:text-error transition-colors"
            >
              Cliente faltou (no-show)
            </button>
          </div>
        </div>
      </div>

      {/* No-show confirmation modal */}
      {showNoShow && (
        <div className="fixed inset-0 bg-primary/55 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-primary rounded-xl p-[18px] w-full max-w-sm shadow-lg">
            <div className="w-[42px] h-[42px] rounded-full bg-error/10 text-error flex items-center justify-center text-[22px] mb-2.5">
              !
            </div>
            <div className="font-bold text-[16px] mb-1.5">Confirmar no-show?</div>
            <p className="text-[15px] text-textMuted leading-snug mb-3.5">
              Felipe R. · 14:30. Isso libera o horário e registra a falta no histórico do cliente.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowNoShow(false)}
                className="flex-1 border border-line text-textMuted font-semibold text-[14px] py-2.5 rounded-lg hover:bg-fill transition-colors"
              >
                Voltar
              </button>
              <button className="flex-1 bg-error text-white font-semibold text-[14px] py-2.5 rounded-lg hover:bg-red-700 transition-colors">
                Confirmar falta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
