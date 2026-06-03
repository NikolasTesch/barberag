import { z } from 'zod'

export const CreateAppointmentSchema = z.object({
  barberId: z.string().min(1, 'Barbeiro obrigatório'),
  scheduledAt: z.coerce
    .date()
    .refine((d) => d.getTime() > Date.now(), 'A data deve ser futura'),
  services: z
    .array(z.object({ serviceId: z.string().min(1) }))
    .min(1, 'Selecione ao menos um serviço'),
})

export const CancelAppointmentSchema = z.object({
  reason: z.string().max(200, 'Máximo 200 caracteres').optional(),
})

export const RescheduleAppointmentSchema = z.object({
  scheduledAt: z.coerce
    .date()
    .refine((d) => d.getTime() > Date.now(), 'A data deve ser futura'),
  barberId: z.string().min(1).optional(),
})

/** Discriminador usado no PATCH /api/appointments/[id]. */
export const AppointmentActionSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('cancel'), reason: z.string().max(200).optional() }),
  z.object({
    action: z.literal('reschedule'),
    scheduledAt: z.coerce.date().refine((d) => d.getTime() > Date.now(), 'A data deve ser futura'),
    barberId: z.string().min(1).optional(),
  }),
])

export const CompleteAppointmentSchema = z.object({
  paymentMethod: z.enum(['CASH', 'PIX', 'DEBIT', 'CREDIT']),
  serviceIds: z.array(z.string().min(1)).min(1).optional(),
  notes: z.string().max(500).optional(),
})

export type CompleteAppointmentInput = z.infer<typeof CompleteAppointmentSchema>
export type CreateAppointmentInput = z.infer<typeof CreateAppointmentSchema>
export type RescheduleAppointmentInput = z.infer<typeof RescheduleAppointmentSchema>
