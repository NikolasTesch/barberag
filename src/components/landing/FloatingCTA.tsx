'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { Scissors } from 'lucide-react'

/** Botão flutuante 'Agendar' que aparece após rolar 300px. Full-width em mobile. */
export function FloatingCTA() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.25 }}
          className="fixed z-40 inset-x-0 bottom-0 px-4 pb-4 md:inset-x-auto md:right-6 md:bottom-6 md:px-0 md:pb-0"
        >
          <Link
            href="/agendar"
            className="flex items-center justify-center gap-2 bg-accent text-white font-semibold py-3.5 md:px-6 rounded-xl shadow-lg hover:bg-accent-deep transition-colors w-full md:w-auto"
          >
            <Scissors size={18} /> Agendar Agora
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
