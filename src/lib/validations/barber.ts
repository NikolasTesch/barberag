import { z } from 'zod'

const DAYS = [
  'SUNDAY',
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
] as const

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/

export const BarberWorkingDaySchema = z
  .object({
    dayOfWeek: z.enum(DAYS),
    isActive: z.boolean(),
    startTime: z.string().regex(timeRegex, 'Horário inválido (HH:mm)'),
    endTime: z.string().regex(timeRegex, 'Horário inválido (HH:mm)'),
  })
  .refine((d) => !d.isActive || d.endTime > d.startTime, {
    message: 'O fim deve ser após o início',
    path: ['endTime'],
  })

export const BarberServiceInputSchema = z.object({
  serviceId: z.string().min(1),
  customPrice: z.number().nonnegative().nullable().optional(),
})

/**
 * Schema compartilhado entre o BarberForm (frontend) e as API Routes de barbeiro.
 * `commissionPercent` é em pontos percentuais (0–100); a API converte para
 * fração (0–1) antes de persistir em Barber.commissionRate.
 */
export const BarberFormSchema = z.object({
  name: z.string().min(2, 'Nome obrigatório').max(80),
  email: z.string().email('E-mail inválido'),
  phone: z
    .string()
    .max(20)
    .optional()
    .or(z.literal('')),
  bio: z.string().max(500).optional().or(z.literal('')),
  image: z.string().url('URL inválida').optional().or(z.literal('')),
  commissionPercent: z.number().min(0, 'Mínimo 0%').max(100, 'Máximo 100%'),
  specialties: z.array(z.string().min(1)).default([]),
  services: z.array(BarberServiceInputSchema).default([]),
  workingHours: z.array(BarberWorkingDaySchema).default([]),
})

export type BarberFormInput = z.infer<typeof BarberFormSchema>
export type BarberWorkingDay = z.infer<typeof BarberWorkingDaySchema>
