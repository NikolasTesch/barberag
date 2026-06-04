import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { prisma } from '@/lib/prisma/client'
import { ServiceForm } from '@/components/admin/ServiceForm'

export const dynamic = 'force-dynamic'

export default async function EditServicoPage({ params }: { params: { id: string } }) {
  const [service, barbers] = await Promise.all([
    prisma.service.findUnique({
      where: { id: params.id },
      select: {
        name: true,
        description: true,
        category: true,
        durationMinutes: true,
        basePrice: true,
        barberServices: { select: { barberId: true, customPrice: true } },
      },
    }),
    prisma.barber.findMany({
      where: { isActive: true },
      select: { id: true, user: { select: { name: true } } },
      orderBy: { user: { name: 'asc' } },
    }),
  ])

  if (!service) notFound()

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-wrap items-center gap-3 px-4 sm:px-[22px] py-4 border-b border-line bg-white">
        <Link href="/servicos" className="text-textMuted hover:text-primary">
          <ChevronLeft size={20} />
        </Link>
        <div className="font-bold text-[19px] text-primary">Editar · {service.name}</div>
      </div>
      <div className="p-4 overflow-auto">
        <ServiceForm
          barbers={barbers.map((b) => ({ id: b.id, name: b.user.name }))}
          mode="edit"
          serviceId={params.id}
          initial={{
            name: service.name,
            description: service.description ?? '',
            category: service.category,
            durationMinutes: service.durationMinutes,
            basePrice: service.basePrice,
            barbers: service.barberServices,
          }}
        />
      </div>
    </div>
  )
}
