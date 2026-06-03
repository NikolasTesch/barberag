import { z } from 'zod'

export const SubmitReviewSchema = z.object({
  token: z.string().min(1, 'Token obrigatório'),
  rating: z.number().int().min(1, 'Mínimo 1 estrela').max(5, 'Máximo 5 estrelas'),
  comment: z.string().max(500, 'Máximo 500 caracteres').optional().or(z.literal('')),
})

export type SubmitReviewInput = z.infer<typeof SubmitReviewSchema>
