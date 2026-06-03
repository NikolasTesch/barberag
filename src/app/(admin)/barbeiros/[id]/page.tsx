import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { prisma } from '@/lib/prisma/client'
import { BarberForm } from '@/components/admin/BarberForm'

export const dynamic = 'force-dynamic'

export default async function EditBarbeiroPage({ params }: { params: { id: string } }) {
  const [barber, services] = await Promise.all([
    prisma.barber.findUnique({
      where: { id: params.id },
      select: {
        bio: true,
        specialties: true,
        commissionRate: true,
        user: { select: { name: true, email: true, phone: true, image: true } },
        barberServices: { select: { serviceId: true, customPrice: true } },
        workingHours: { select: { dayOfWeek: true, startTime: true, endTime: true, isActive: true } },
      },
    }),
    prisma.service.findMany({
      where: { isActive: true },
      select: { id: true, name: true, basePrice: true },
      orderBy: { name: 'asc' },
    }),
  ])

  if (!barber) notFound()

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-[22px] py-4 border-b border-line bg-white">
        <Link href="/barbeiros" className="text-textMuted hover:text-primary">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <div className="font-bold text-[19px] text-primary">Editar · {barber.user.name}</div>
          <div className="text-[13px] text-textMuted">{barber.user.email}</div>
        </div>
      </div>
      <div className="p-4 overflow-auto">
        <BarberForm
          services={services}
          mode="edit"
          barberId={params.id}
          initial={{
            name: barber.user.name,
            email: barber.user.email,
            phone: barber.user.phone ?? '',
            bio: barber.bio ?? '',
            image: barber.user.image ?? '',
            commissionPercent: Math.round(barber.commissionRate * 100),
            specialties: barber.specialties,
            services: barber.barberServices,
            workingHours: barber.workingHours,
          }}
        />
      </div>
    </div>
  )
}
