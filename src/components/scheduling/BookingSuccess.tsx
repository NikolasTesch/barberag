'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Check } from 'lucide-react'

export function BookingSuccess() {
  const router = useRouter()

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-6 gap-4">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        className="w-20 h-20 rounded-full bg-success/15 text-success flex items-center justify-center"
      >
        <Check size={40} strokeWidth={3} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <h1 className="font-display font-black text-[22px] text-primary">Agendamento confirmado!</h1>
        <p className="text-[14px] text-textMuted mt-1">
          Enviamos os detalhes para o seu e-mail.
        </p>
      </motion.div>

      <div className="flex flex-col gap-2 w-full max-w-xs mt-2">
        <button
          onClick={() => router.push('/agendamentos')}
          className="w-full bg-accent text-white font-semibold py-3 rounded-xl hover:bg-accent-deep transition-colors"
        >
          Ver meus agendamentos
        </button>
        <button
          onClick={() => router.push('/agendar')}
          className="w-full bg-fill text-primary font-semibold py-3 rounded-xl hover:bg-line transition-colors"
        >
          Fazer outro agendamento
        </button>
      </div>
    </div>
  )
}
