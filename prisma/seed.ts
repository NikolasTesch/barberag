import { PrismaClient, DayOfWeek, ServiceCategory } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const WEEKDAYS: DayOfWeek[] = [
  DayOfWeek.MONDAY,
  DayOfWeek.TUESDAY,
  DayOfWeek.WEDNESDAY,
  DayOfWeek.THURSDAY,
  DayOfWeek.FRIDAY,
  DayOfWeek.SATURDAY,
]

async function reset() {
  // Limpa na ordem de dependência (filhos → pais) para tornar o seed reexecutável.
  await prisma.commission.deleteMany()
  await prisma.appointmentService.deleteMany()
  await prisma.review.deleteMany()
  await prisma.appointment.deleteMany()
  await prisma.commissionRule.deleteMany()
  await prisma.barberService.deleteMany()
  await prisma.workingHours.deleteMany()
  await prisma.blockedSlot.deleteMany()
  await prisma.galleryImage.deleteMany()
  await prisma.barbershopConfig.deleteMany()
  await prisma.barber.deleteMany()
  await prisma.service.deleteMany()
  await prisma.account.deleteMany()
  await prisma.session.deleteMany()
  await prisma.user.deleteMany()
}

async function main() {
  await reset()

  // ─── Admin ──────────────────────────────────────────────────────────────────
  await prisma.user.create({
    data: {
      name: 'Marcos Oliveira',
      email: 'admin@barberag.com',
      role: 'ADMIN',
      passwordHash: await bcrypt.hash('admin123', 10),
    },
  })

  // ─── Barbeiros ───────────────────────────────────────────────────────────────
  const rafael = await prisma.user.create({
    data: {
      name: 'Rafael Santos',
      email: 'rafael@barberag.com',
      role: 'BARBER',
      passwordHash: await bcrypt.hash('barber123', 10),
      barberProfile: {
        create: {
          bio: 'Especialista em cortes degradê e barba',
          specialties: ['Degradê', 'Barba Completa', 'Sobrancelha'],
          commissionRate: 0.4,
        },
      },
    },
    include: { barberProfile: true },
  })

  const bruno = await prisma.user.create({
    data: {
      name: 'Bruno Costa',
      email: 'bruno@barberag.com',
      role: 'BARBER',
      passwordHash: await bcrypt.hash('barber123', 10),
      barberProfile: {
        create: {
          bio: 'Master em cortes clássicos e navalha',
          specialties: ['Corte Clássico', 'Navalha', 'Platinado'],
          commissionRate: 0.35,
        },
      },
    },
    include: { barberProfile: true },
  })

  const rafaelBarber = rafael.barberProfile!
  const brunoBarber = bruno.barberProfile!

  // ─── Serviços ─────────────────────────────────────────────────────────────────
  const servicesData = [
    { name: 'Corte Masculino', durationMinutes: 30, basePrice: 35, category: ServiceCategory.HAIR },
    { name: 'Barba Completa', durationMinutes: 25, basePrice: 30, category: ServiceCategory.BEARD },
    { name: 'Combo Corte + Barba', durationMinutes: 50, basePrice: 55, category: ServiceCategory.COMBO },
    { name: 'Sobrancelha', durationMinutes: 15, basePrice: 15, category: ServiceCategory.EYEBROW },
    { name: 'Pigmentação de Barba', durationMinutes: 40, basePrice: 45, category: ServiceCategory.TREATMENT },
  ]
  const services = []
  for (const s of servicesData) {
    services.push(await prisma.service.create({ data: s }))
  }

  // ─── BarberService (ambos atendem todos os serviços) ──────────────────────────
  for (const barber of [rafaelBarber, brunoBarber]) {
    for (const service of services) {
      await prisma.barberService.create({
        data: { barberId: barber.id, serviceId: service.id },
      })
    }
  }

  // ─── Horários de funcionamento — Seg a Sáb, 09h–19h ───────────────────────────
  // Padrão da barbearia (barberId null) + cada barbeiro com os mesmos horários.
  for (const barberId of [null, rafaelBarber.id, brunoBarber.id]) {
    for (const dayOfWeek of WEEKDAYS) {
      await prisma.workingHours.create({
        data: { barberId, dayOfWeek, startTime: '09:00', endTime: '19:00' },
      })
    }
  }

  // ─── Bloqueio exemplo: domingo fechado (feriado) ──────────────────────────────
  // Domingo já está fechado por ausência de WorkingHours; este é um exemplo de
  // bloqueio pontual da barbearia inteira no próximo domingo.
  const nextSunday = new Date()
  nextSunday.setDate(nextSunday.getDate() + ((7 - nextSunday.getDay()) % 7 || 7))
  nextSunday.setHours(0, 0, 0, 0)
  await prisma.blockedSlot.create({
    data: {
      barberId: null,
      date: nextSunday,
      startTime: '00:00',
      endTime: '23:59',
      allDay: true,
      reason: 'Fechado aos domingos',
    },
  })

  // ─── Regras de comissão (hierarquia por prioridade) ───────────────────────────
  await prisma.commissionRule.createMany({
    data: [
      { barberId: null, serviceId: null, paymentMethod: null, rate: 0.3, priority: 1 },
      { barberId: rafaelBarber.id, serviceId: null, paymentMethod: null, rate: 0.4, priority: 2 },
      { barberId: brunoBarber.id, serviceId: null, paymentMethod: null, rate: 0.35, priority: 2 },
    ],
  })

  // ─── Configuração singleton da barbearia ──────────────────────────────────────
  await prisma.barbershopConfig.create({
    data: {
      name: 'BARBERAG',
      address: 'Rua Exemplo, 123',
      phone: '(11) 99999-9999',
      timezone: 'America/Sao_Paulo',
      cancelPolicy: 120,
    },
  })

  console.log('✅ Seed concluído: 1 admin, 2 barbeiros, 5 serviços, horários Seg–Sáb 09h–19h.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
