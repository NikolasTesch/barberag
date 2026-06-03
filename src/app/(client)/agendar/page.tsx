import { prisma } from '@/lib/prisma/client'
import { StepIndicator } from '@/components/scheduling/StepIndicator'
import { ServiceSelector } from '@/components/scheduling/ServiceSelector'

export default async function AgendarPage() {
  const services = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: { basePrice: 'asc' },
    select: { id: true, name: true, durationMinutes: true, basePrice: true, category: true },
  })

  const data = services.map((s) => ({
    id: s.id,
    name: s.name,
    durationMinutes: s.durationMinutes,
    price: s.basePrice,
    category: s.category as string,
  }))

  return (
    <div className="flex flex-col h-full bg-white">
      <StepIndicator activeStep={0} />
      <div className="px-3 pt-3">
        <p className="text-[10px] font-semibold tracking-widest uppercase text-textMuted">
          Escolha um ou mais serviços
        </p>
      </div>
      <div className="flex-1 min-h-0">
        <ServiceSelector services={data} />
      </div>
    </div>
  )
}
