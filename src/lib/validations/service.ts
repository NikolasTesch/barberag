import { z } from 'zod'

export const SERVICE_CATEGORIES = ['HAIR', 'BEARD', 'EYEBROW', 'COMBO', 'TREATMENT'] as const

/** Rótulos PT-BR para o enum ServiceCategory. */
export const CATEGORY_LABELS: Record<(typeof SERVICE_CATEGORIES)[number], string> = {
  HAIR: 'Cabelo',
  BEARD: 'Barba',
  EYEBROW: 'Sobrancelha',
  COMBO: 'Combo',
  TREATMENT: 'Tratamento',
}

export const ServiceBarberInputSchema = z.object({
  barberId: z.string().min(1),
  customPrice: z.number().nonnegative().nullable().optional(),
})

/** Schema compartilhado entre ServiceForm (frontend) e as API Routes de serviço. */
export const ServiceFormSchema = z.object({
  name: z.string().min(2, 'Nome obrigatório').max(80, 'Máximo 80 caracteres'),
  description: z.string().max(300, 'Máximo 300 caracteres').optional().or(z.literal('')),
  category: z.enum(SERVICE_CATEGORIES),
  durationMinutes: z
    .number()
    .int()
    .min(5, 'Mínimo 5 minutos')
    .max(480, 'Máximo 480 minutos'),
  basePrice: z.number().nonnegative('Preço inválido'),
  barbers: z.array(ServiceBarberInputSchema).default([]),
})

export type ServiceFormInput = z.infer<typeof ServiceFormSchema>
