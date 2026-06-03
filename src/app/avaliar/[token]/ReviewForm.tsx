'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Star, Loader2, CheckCircle2 } from 'lucide-react'
import { SubmitReviewSchema } from '@/lib/validations/review'

export function ReviewForm({
  token,
  barberName,
  services,
}: {
  token: string
  barberName: string
  services: string[]
}) {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const parsed = SubmitReviewSchema.safeParse({ token, rating, comment })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Selecione uma nota.')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => null)
        throw new Error(json?.error ?? 'Não foi possível enviar a avaliação.')
      }
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado.')
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white text-primary rounded-2xl p-8 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: 'spring' }}
          className="flex justify-center mb-3"
        >
          <CheckCircle2 size={56} className="text-success" />
        </motion.div>
        <h2 className="font-display font-bold text-2xl mb-1">Obrigado pela sua avaliação! ⭐</h2>
        <p className="text-textMuted text-sm">Seu feedback ajuda nossa equipe a melhorar sempre.</p>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white text-primary rounded-2xl p-6">
      <h1 className="font-display font-bold text-xl text-center mb-1">
        Como foi seu atendimento com {barberName}?
      </h1>
      {services.length > 0 && (
        <p className="text-center text-textMuted text-[13px] mb-5">{services.join(' · ')}</p>
      )}

      {/* estrelas */}
      <div className="flex justify-center gap-2 mb-5" role="radiogroup" aria-label="Nota de 1 a 5 estrelas">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            aria-label={`${n} estrela${n > 1 ? 's' : ''}`}
            aria-pressed={rating === n}
            onClick={() => setRating(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            className="transition-transform hover:scale-110"
          >
            <Star
              size={38}
              className={
                n <= (hover || rating) ? 'text-accent fill-accent' : 'text-line'
              }
            />
          </button>
        ))}
      </div>

      <label htmlFor="comment" className="block text-[12px] font-semibold text-textMuted mb-1">
        Comentário (opcional)
      </label>
      <textarea
        id="comment"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        maxLength={500}
        rows={3}
        placeholder="Conte como foi sua experiência…"
        className="w-full border border-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent resize-none"
      />
      <div className="text-right text-[11px] text-textDisabled mb-3">{comment.length}/500</div>

      {error && <div className="text-error text-sm mb-3 text-center">{error}</div>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full inline-flex items-center justify-center gap-2 bg-accent text-white font-semibold py-3 rounded-lg hover:bg-accent-deep transition-colors disabled:opacity-60"
      >
        {submitting && <Loader2 size={16} className="animate-spin" />}
        Enviar avaliação
      </button>
    </form>
  )
}
