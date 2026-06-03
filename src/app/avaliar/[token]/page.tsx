import { Scissors } from 'lucide-react'
import { prisma } from '@/lib/prisma/client'
import { ReviewForm } from './ReviewForm'

export const dynamic = 'force-dynamic'

const SEVENTY_TWO_HOURS_MS = 72 * 60 * 60 * 1000

function InvalidState({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-primary text-white flex flex-col items-center justify-center px-6 text-center">
      <Scissors size={40} className="text-accent mb-4" />
      <h1 className="font-display font-bold text-2xl mb-2">Ops…</h1>
      <p className="text-white/70 max-w-sm">{message}</p>
    </div>
  )
}

export default async function AvaliarPage({ params }: { params: { token: string } }) {
  const appointment = await prisma.appointment.findUnique({
    where: { reviewToken: params.token },
    select: {
      scheduledAt: true,
      barber: { select: { user: { select: { name: true } } } },
      services: { select: { service: { select: { name: true } } } },
      review: { select: { id: true } },
    },
  })

  if (!appointment || appointment.review) {
    return <InvalidState message="Este link não é válido ou já foi utilizado." />
  }
  if (Date.now() - appointment.scheduledAt.getTime() > SEVENTY_TWO_HOURS_MS) {
    return <InvalidState message="Este link de avaliação expirou (válido por 72h após o atendimento)." />
  }

  return (
    <div className="min-h-screen bg-primary text-white flex flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Scissors size={22} className="text-accent" />
          <span className="font-display font-black text-2xl text-accent tracking-tight">BARBERAG</span>
        </div>
        <ReviewForm
          token={params.token}
          barberName={appointment.barber.user.name}
          services={appointment.services.map((s) => s.service.name)}
        />
      </div>
    </div>
  )
}
