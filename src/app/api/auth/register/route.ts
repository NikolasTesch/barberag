import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma/client'
import { RegisterSchema } from '@/lib/validations/auth'

export async function POST(req: Request) {
  // 1. Validação com Zod
  const body = await req.json().catch(() => null)
  const result = RegisterSchema.safeParse(body)
  if (!result.success) {
    return Response.json({ error: result.error.flatten() }, { status: 400 })
  }

  const { name, email, phone, password } = result.data

  // 2. E-mail já cadastrado?
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return Response.json(
      { error: 'Já existe uma conta com este e-mail.' },
      { status: 409 }
    )
  }

  // 3. Cria usuário com role CLIENT e senha hasheada
  const passwordHash = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: {
      name,
      email,
      phone: phone || null,
      passwordHash,
      role: 'CLIENT',
    },
    select: { id: true, name: true, email: true, role: true },
  })

  return Response.json({ user }, { status: 201 })
}
