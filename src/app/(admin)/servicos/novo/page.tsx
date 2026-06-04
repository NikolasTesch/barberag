import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { prisma } from '@/lib/prisma/client'
import { ServiceForm } from '@/components/admin/ServiceForm'

export const dynamic = 'force-dynamic'

export default async function NovoServicoPage() {
  const barbers = await prisma.barber.findMany({
    where: { isActive: true },
    select: { id: true, user: { select: { name: true } } },
    orderBy: { user: { name: 'asc' } },
  })

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-wrap items-center gap-3 px-4 sm:px-[22px] py-4 border-b border-line bg-white">
        <Link href="/servicos" className="text-textMuted hover:text-primary">
          <ChevronLeft size={20} />
        </Link>
        <div className="font-bold text-[19px] text-primary">Novo serviço</div>
      </div>
      <div className="p-4 overflow-auto">
        <ServiceForm barbers={barbers.map((b) => ({ id: b.id, name: b.user.name }))} mode="create" />
      </div>
    </div>
  )
}
