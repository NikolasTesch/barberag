import { prisma } from '@/lib/prisma/client'
import { getServerSession } from '@/lib/auth/helpers'

export interface SessionBarber {
  id: string
  userId: string
}

/**
 * Resolve o Barber do usuário logado. Retorna { barber } em sucesso ou
 * { error } com a Response apropriada (401/403). O barberId SEMPRE vem da
 * session — nunca de parâmetro de URL (RN-04 / isolamento de dados).
 */
export async function getSessionBarber(): Promise<
  { barber: SessionBarber; error?: never } | { barber?: never; error: Response }
> {
  const session = await getServerSession()
  if (!session?.user) {
    return { error: Response.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  if (session.user.role !== 'BARBER') {
    return { error: Response.json({ error: 'Forbidden' }, { status: 403 }) }
  }
  const barber = await prisma.barber.findUnique({
    where: { userId: session.user.id },
    select: { id: true, userId: true },
  })
  if (!barber) {
    return { error: Response.json({ error: 'Perfil de barbeiro não encontrado' }, { status: 403 }) }
  }
  return { barber }
}
