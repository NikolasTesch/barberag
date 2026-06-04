import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { prisma } from '@/lib/prisma/client'
import { BarberForm } from '@/components/admin/BarberForm'

export const dynamic = 'force-dynamic'

export default async function NovoBarbeiroPage() {
  const services = await prisma.service.findMany({
    where: { isActive: true },
    select: { id: true, name: true, basePrice: true },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-wrap items-center gap-3 px-4 sm:px-[22px] py-4 border-b border-line bg-white">
        <Link href="/barbeiros" className="text-textMuted hover:text-primary">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <div className="font-bold text-[19px] text-primary">Novo barbeiro</div>
          <div className="text-[13px] text-textMuted">Uma senha temporária será enviada por e-mail</div>
        </div>
      </div>
      <div className="p-4 overflow-auto">
        <BarberForm services={services} mode="create" />
      </div>
    </div>
  )
}
