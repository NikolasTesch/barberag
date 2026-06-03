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

export const WorkingHoursInputSchema = z.object({
  dayOfWeek: z.enum(DAYS),
  startTime: z.string().regex(timeRegex, 'Horário inválido (HH:mm)'),
  endTime: z.string().regex(timeRegex, 'Horário inválido (HH:mm)'),
  isActive: z.boolean().default(true),
})

export const BlockedSlotInputSchema = z
  .object({
    date: z.coerce.date(),
    allDay: z.boolean().default(false),
    startTime: z.string().regex(timeRegex).default('00:00'),
    endTime: z.string().regex(timeRegex).default('23:59'),
    reason: z.string().max(200).optional(),
  })
  .refine((d) => d.allDay || d.endTime > d.startTime, {
    message: 'O fim deve ser após o início',
    path: ['endTime'],
  })

export const UpdateAvailabilitySchema = z.object({
  workingHours: z.array(WorkingHoursInputSchema).optional(),
  blockedSlots: z.array(BlockedSlotInputSchema).optional(),
})

export type UpdateAvailabilityInput = z.infer<typeof UpdateAvailabilitySchema>
