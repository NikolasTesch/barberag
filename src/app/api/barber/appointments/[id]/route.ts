import { prisma } from '@/lib/prisma/client'
import { getSessionBarber } from '@/lib/auth/barber'
import { selectCommissionRate } from '@/lib/utils/commission'
import type { PaymentMethod } from '@prisma/client'

const PAYMENT_METHODS: PaymentMethod[] = ['CASH', 'PIX', 'DEBIT', 'CREDIT']

/** GET /api/barber/appointments/[id] — detalhes do atendimento + previsão de comissão. */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const { barber, error } = await getSessionBarber()
  if (error) return error

  const appointment = await prisma.appointment.findUnique({
    where: { id: params.id, barberId: barber.id },
    select: {
      id: true,
      status: true,
      scheduledAt: true,
      totalPrice: true,
      totalDuration: true,
      paymentMethod: true,
      notes: true,
      client: { select: { name: true, phone: true } },
      services: {
        select: {
          price: true,
          duration: true,
          serviceId: true,
          service: { select: { name: true } },
        },
      },
    },
  })

  if (!appointment) {
    return Response.json({ error: 'Não encontrado' }, { status: 404 })
  }

  const rules = await prisma.commissionRule.findMany({
    select: { barberId: true, serviceId: true, paymentMethod: true, rate: true, priority: true },
  })

  const serviceIds = appointment.services.map((s) => s.serviceId)

  const commissionPreviews = Object.fromEntries(
    PAYMENT_METHODS.map((pm) => {
      const { rate } = selectCommissionRate(rules, {
        barberId: barber.id,
        serviceIds,
        paymentMethod: pm,
      })
      return [pm, { rate, amount: Math.round(rate * appointment.totalPrice * 100) / 100 }]
    })
  )

  const flat = {
    ...appointment,
    services: appointment.services.map((s) => ({
      serviceId: s.serviceId,
      name: s.service.name,
      price: s.price,
      duration: s.duration,
    })),
  }

  return Response.json({ appointment: flat, commissionPreviews })
}
