'use client'

import { motion } from 'framer-motion'

/**
 * Wrapper de animação de entrada por scroll (fade + slideY). Anima apenas na
 * primeira vez que entra na viewport (once:true, threshold 0.2). Client Component
 * isolado para manter as seções de dados como Server Components.
 */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}
