import { getServerSession } from '@/lib/auth/helpers'

export interface SessionAdmin {
  id: string
  name: string
}

/**
 * Guard de API para rotas exclusivas de ADMIN (RN-04 / isolamento de dados).
 * Retorna { admin } em sucesso ou { error } com a Response (401/403). Toda
 * rota em /api/admin/* deve chamar isto ANTES de qualquer query ao banco.
 */
export async function getSessionAdmin(): Promise<
  { admin: SessionAdmin; error?: never } | { admin?: never; error: Response }
> {
  const session = await getServerSession()
  if (!session?.user) {
    return { error: Response.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  if (session.user.role !== 'ADMIN') {
    return { error: Response.json({ error: 'Forbidden' }, { status: 403 }) }
  }
  return { admin: { id: session.user.id, name: session.user.name ?? 'Admin' } }
}
