import { z } from 'zod'
import { BarberWorkingDaySchema } from '@/lib/validations/barber'

/**
 * Configurações da barbearia. Trabalha sobre o model BarbershopConfig existente
 * (singleton) + os WorkingHours padrão (barberId = null). `cancelPolicyHours` é
 * em horas; a API converte para minutos antes de persistir em cancelPolicy.
 */
export const ConfigFormSchema = z.object({
  name: z.string().min(2, 'Nome obrigatório').max(80),
  phone: z.string().max(20).optional().or(z.literal('')),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  address: z.string().max(200).optional().or(z.literal('')),
  logoUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  cancelPolicyHours: z.number().min(0, 'Mínimo 0').max(168, 'Máximo 168 horas'),
  workingHours: z.array(BarberWorkingDaySchema).default([]),
})

export type ConfigFormInput = z.infer<typeof ConfigFormSchema>
