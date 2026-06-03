import {
  PrismaClient,
  DayOfWeek,
  ServiceCategory,
  PaymentMethod,
  AppointmentStatus,
  CommissionStatus,
} from '@prisma/client'
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

/** Retorna uma data N dias atrás às HH:00 — usada para histórico de atendimentos. */
function daysAgo(days: number, hour = 14): Date {
  const d = new Date()
  d.setDate(d.getDate() - days)
  d.setHours(hour, 0, 0, 0)
  return d
}

async function main() {
  await reset()

  // ─── Admin ──────────────────────────────────────────────────────────────────
  const admin = await prisma.user.create({
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
      phone: '(11) 98888-1001',
      image:
        'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400&h=400&fit=crop&crop=faces',
      passwordHash: await bcrypt.hash('barber123', 10),
      barberProfile: {
        create: {
          bio: 'Especialista em cortes degradê e barba. 8 anos de barbearia.',
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
      phone: '(11) 98888-1002',
      image:
        'https://images.unsplash.com/photo-1503443207922-dff7d543fd0e?w=400&h=400&fit=crop&crop=faces',
      passwordHash: await bcrypt.hash('barber123', 10),
      barberProfile: {
        create: {
          bio: 'Master em cortes clássicos e navalha. Referência em platinado.',
          specialties: ['Corte Clássico', 'Navalha', 'Platinado'],
          commissionRate: 0.35,
        },
      },
    },
    include: { barberProfile: true },
  })

  const diego = await prisma.user.create({
    data: {
      name: 'Diego Almeida',
      email: 'diego@barberag.com',
      role: 'BARBER',
      phone: '(11) 98888-1003',
      image:
        'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=400&h=400&fit=crop&crop=faces',
      passwordHash: await bcrypt.hash('barber123', 10),
      barberProfile: {
        create: {
          bio: 'Cortes modernos, freestyle e desenhos. O queridinho da galera jovem.',
          specialties: ['Freestyle', 'Desenho', 'Degradê'],
          commissionRate: 0.38,
        },
      },
    },
    include: { barberProfile: true },
  })

  const rafaelBarber = rafael.barberProfile!
  const brunoBarber = bruno.barberProfile!
  const diegoBarber = diego.barberProfile!
  const barbers = [rafaelBarber, brunoBarber, diegoBarber]

  // ─── Serviços ─────────────────────────────────────────────────────────────────
  const servicesData = [
    {
      name: 'Corte Masculino',
      durationMinutes: 30,
      basePrice: 35,
      category: ServiceCategory.HAIR,
      description: 'Corte na tesoura ou máquina, lavagem e finalização com produtos premium.',
    },
    {
      name: 'Barba Completa',
      durationMinutes: 25,
      basePrice: 30,
      category: ServiceCategory.BEARD,
      description: 'Modelagem com navalha, toalha quente e hidratação da barba.',
    },
    {
      name: 'Combo Corte + Barba',
      durationMinutes: 50,
      basePrice: 55,
      category: ServiceCategory.COMBO,
      description: 'O pacote completo: corte e barba alinhados no mesmo atendimento.',
    },
    {
      name: 'Sobrancelha',
      durationMinutes: 15,
      basePrice: 15,
      category: ServiceCategory.EYEBROW,
      description: 'Alinhamento na navalha ou pinça para realçar o olhar.',
    },
    {
      name: 'Pigmentação de Barba',
      durationMinutes: 40,
      basePrice: 45,
      category: ServiceCategory.TREATMENT,
      description: 'Preenche falhas e dá uniformidade à barba com pigmento natural.',
    },
    {
      name: 'Corte Infantil',
      durationMinutes: 25,
      basePrice: 30,
      category: ServiceCategory.HAIR,
      description: 'Atendimento paciente e divertido para os pequenos.',
    },
    {
      name: 'Platinado / Descoloração',
      durationMinutes: 90,
      basePrice: 120,
      category: ServiceCategory.TREATMENT,
      description: 'Descoloração e tonalização feitas por especialista.',
    },
    {
      name: 'Relaxamento Capilar',
      durationMinutes: 60,
      basePrice: 70,
      category: ServiceCategory.TREATMENT,
      description: 'Reduz o volume e alinha os fios para um visual impecável.',
    },
  ]
  const services = []
  for (const s of servicesData) {
    services.push(await prisma.service.create({ data: s }))
  }

  // ─── BarberService (todos atendem todos os serviços) ──────────────────────────
  for (const barber of barbers) {
    for (const service of services) {
      await prisma.barberService.create({
        data: { barberId: barber.id, serviceId: service.id },
      })
    }
  }

  // ─── Horários de funcionamento — Seg a Sáb, 09h–19h ───────────────────────────
  // Padrão da barbearia (barberId null) + cada barbeiro com os mesmos horários.
  for (const barberId of [null, ...barbers.map((b) => b.id)]) {
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
      { barberId: diegoBarber.id, serviceId: null, paymentMethod: null, rate: 0.38, priority: 2 },
    ],
  })

  // ─── Configuração singleton da barbearia ──────────────────────────────────────
  await prisma.barbershopConfig.create({
    data: {
      name: 'BARBERAG',
      address: 'Av. Paulista, 1578 — Bela Vista, São Paulo - SP',
      phone: '(11) 99999-9999',
      email: 'contato@barberag.com',
      timezone: 'America/Sao_Paulo',
      cancelPolicy: 120,
    },
  })

  // ─── Galeria ──────────────────────────────────────────────────────────────────
  const galleryData = [
    {
      url: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&q=80',
      caption: 'Ambiente da barbearia',
    },
    {
      url: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800&q=80',
      caption: 'Degradê na régua',
    },
    {
      url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80',
      caption: 'Barba feita na navalha',
    },
    {
      url: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=800&q=80',
      caption: 'Cadeira clássica',
    },
    {
      url: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800&q=80',
      caption: 'Acabamento na navalha',
    },
    {
      url: 'https://images.unsplash.com/photo-1512690459411-b9245aed614b?w=800&q=80',
      caption: 'Corte finalizado',
    },
    {
      url: 'https://images.unsplash.com/photo-1593702275687-f8b402bf1fb5?w=800&q=80',
      caption: 'Detalhe da máquina',
    },
    {
      url: 'https://images.unsplash.com/photo-1567894340315-735d7c361db0?w=800&q=80',
      caption: 'Produtos de finalização',
    },
  ]
  await prisma.galleryImage.createMany({
    data: galleryData.map((g, i) => ({ url: g.url, caption: g.caption, order: i })),
  })

  // ─── Clientes ─────────────────────────────────────────────────────────────────
  const clientNames = [
    'Lucas Pereira',
    'Gabriel Rodrigues',
    'Felipe Martins',
    'André Souza',
    'Thiago Lima',
    'Matheus Ferreira',
    'João Vitor Alves',
    'Pedro Henrique Gomes',
  ]
  const clients = []
  for (let i = 0; i < clientNames.length; i++) {
    clients.push(
      await prisma.user.create({
        data: {
          name: clientNames[i],
          email: `cliente${i + 1}@exemplo.com`,
          role: 'CLIENT',
          phone: `(11) 97777-10${String(i + 10).padStart(2, '0')}`,
          passwordHash: await bcrypt.hash('cliente123', 10),
        },
      }),
    )
  }

  // ─── Atendimentos concluídos + comissões + avaliações ─────────────────────────
  // Histórico realista para alimentar a landing (estatísticas, avaliações) e os
  // dashboards de admin/barbeiro.
  const reviewComments = [
    'Melhor corte que já fiz! Atendimento impecável e ambiente top.',
    'Profissional atencioso, saí muito satisfeito com a barba.',
    'Chego sempre na hora e sou atendido na hora. Recomendo demais.',
    'Degradê perfeito, exatamente como pedi. Voltarei com certeza.',
    'Lugar limpo, equipe simpática e preço justo. Nota 10.',
    'A navalha desse cara é cirúrgica. Barba alinhada como nunca.',
    'Ótima experiência do agendamento online ao acabamento.',
    'Levei meu filho e ele amou. Equipe paciente com criança.',
    'Platinado ficou show, sem danificar o cabelo. Muito profissional.',
    'Atendimento rápido e resultado excelente. Já é meu lugar fixo.',
    null,
    null,
  ]

  const paymentMethods: PaymentMethod[] = [
    PaymentMethod.PIX,
    PaymentMethod.CREDIT,
    PaymentMethod.DEBIT,
    PaymentMethod.CASH,
  ]

  let apptIndex = 0
  // 18 atendimentos concluídos distribuídos entre clientes/barbeiros nos últimos 60 dias.
  for (let i = 0; i < 18; i++) {
    const client = clients[i % clients.length]
    const barber = barbers[i % barbers.length]
    const service = services[i % services.length]
    const payment = paymentMethods[i % paymentMethods.length]
    const scheduledAt = daysAgo(60 - i * 3, 10 + (i % 7))

    const totalPrice = service.basePrice
    const totalDuration = service.durationMinutes
    const rate = barber.commissionRate
    const commissionAmount = Math.round(totalPrice * rate * 100) / 100

    const appointment = await prisma.appointment.create({
      data: {
        clientId: client.id,
        barberId: barber.id,
        status: AppointmentStatus.COMPLETED,
        totalDuration,
        totalPrice,
        paymentMethod: payment,
        scheduledAt,
        completedAt: scheduledAt,
        services: {
          create: [{ serviceId: service.id, price: service.basePrice, duration: service.durationMinutes }],
        },
        commission: {
          create: {
            barberId: barber.id,
            amount: commissionAmount,
            rate,
            status: i % 3 === 0 ? CommissionStatus.PAID : CommissionStatus.PENDING,
            paidAt: i % 3 === 0 ? scheduledAt : null,
            paidById: i % 3 === 0 ? admin.id : null,
          },
        },
      },
    })

    // ~70% dos atendimentos recebem avaliação publicada.
    if (i % 10 !== 3 && i % 10 !== 7) {
      const rating = i % 9 === 0 ? 4 : 5
      await prisma.review.create({
        data: {
          appointmentId: appointment.id,
          clientId: client.id,
          barberId: barber.id,
          rating,
          comment: reviewComments[apptIndex % reviewComments.length],
          isPublished: true,
        },
      })
      apptIndex++
    }
  }

  // ─── Alguns agendamentos futuros (SCHEDULED) para popular as agendas ───────────
  for (let i = 0; i < 4; i++) {
    const client = clients[i % clients.length]
    const barber = barbers[i % barbers.length]
    const service = services[(i + 2) % services.length]
    const scheduledAt = daysAgo(-(i + 1), 11 + i) // dias no futuro

    await prisma.appointment.create({
      data: {
        clientId: client.id,
        barberId: barber.id,
        status: AppointmentStatus.SCHEDULED,
        totalDuration: service.durationMinutes,
        totalPrice: service.basePrice,
        scheduledAt,
        services: {
          create: [{ serviceId: service.id, price: service.basePrice, duration: service.durationMinutes }],
        },
      },
    })
  }

  console.log(
    '✅ Seed concluído: 1 admin, 3 barbeiros, 8 clientes, 8 serviços, 8 fotos na galeria,\n' +
      '   18 atendimentos concluídos com comissões, ~14 avaliações publicadas e 4 agendamentos futuros.',
  )
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
