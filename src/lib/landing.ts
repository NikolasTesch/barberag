import { prisma } from '@/lib/prisma/client'
import type { ServiceCategory } from '@prisma/client'

export interface LandingService {
  id: string
  name: string
  description: string | null
  category: ServiceCategory
  durationMinutes: number
  basePrice: number
}

export interface LandingBarber {
  id: string
  name: string
  image: string | null
  specialties: string[]
  avgRating: number | null
  reviewCount: number
}

export interface LandingGalleryImage {
  id: string
  url: string
  caption: string | null
}

export interface LandingTestimonial {
  id: string
  rating: number
  comment: string | null
  clientName: string
  barberName: string
  createdAt: string
}

export interface LandingConfig {
  name: string
  address: string | null
  phone: string | null
  email: string | null
}

export interface LandingData {
  services: LandingService[]
  barbers: LandingBarber[]
  gallery: LandingGalleryImage[]
  testimonials: LandingTestimonial[]
  config: LandingConfig | null
  stats: { avgRating: number | null; reviewCount: number; barberCount: number; appointmentCount: number }
}

/** Abrevia o sobrenome por privacidade: "Carlos Mendes" → "Carlos M." */
function abbreviateName(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0]
  return `${parts[0]} ${parts[parts.length - 1][0]}.`
}

/**
 * Busca todos os dados da landing page. Cada query é isolada em try/catch para
 * que falha de banco (ex.: build sem DATABASE_URL) não quebre o prerender — a
 * página renderiza com fallback vazio e o ISR (revalidate) preenche em runtime.
 */
export async function getLandingData(): Promise<LandingData> {
  const services = await prisma.service
    .findMany({
      where: { isActive: true },
      select: { id: true, name: true, description: true, category: true, durationMinutes: true, basePrice: true },
      orderBy: { basePrice: 'asc' },
      take: 8,
    })
    .catch(() => [])

  const barbersRaw = await prisma.barber
    .findMany({
      where: { isActive: true },
      select: {
        id: true,
        specialties: true,
        user: { select: { name: true, image: true } },
        reviews: { where: { isPublished: true }, select: { rating: true } },
      },
      orderBy: { user: { name: 'asc' } },
    })
    .catch(() => [])

  const barbers: LandingBarber[] = barbersRaw.map((b) => {
    const ratings = b.reviews.map((r) => r.rating)
    const avg = ratings.length ? Math.round((ratings.reduce((a, c) => a + c, 0) / ratings.length) * 10) / 10 : null
    return {
      id: b.id,
      name: b.user.name,
      image: b.user.image,
      specialties: b.specialties,
      avgRating: avg,
      reviewCount: ratings.length,
    }
  })

  const gallery = await prisma.galleryImage
    .findMany({
      where: { isActive: true },
      select: { id: true, url: true, caption: true },
      orderBy: { order: 'asc' },
    })
    .catch(() => [])

  const testimonialsRaw = await prisma.review
    .findMany({
      where: { isPublished: true, rating: { gte: 4 } },
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        client: { select: { name: true } },
        barber: { select: { user: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })
    .catch(() => [])

  const testimonials: LandingTestimonial[] = testimonialsRaw.map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    clientName: abbreviateName(r.client.name),
    barberName: r.barber.user.name,
    createdAt: r.createdAt.toISOString(),
  }))

  const config = await prisma.barbershopConfig
    .findFirst({ select: { name: true, address: true, phone: true, email: true } })
    .catch(() => null)

  // Estatísticas para a hero (todas tolerantes a falha).
  const allPublished = await prisma.review
    .findMany({ where: { isPublished: true }, select: { rating: true } })
    .catch(() => [])
  const appointmentCount = await prisma.appointment.count({ where: { status: 'COMPLETED' } }).catch(() => 0)

  const avgAll = allPublished.length
    ? Math.round((allPublished.reduce((a, r) => a + r.rating, 0) / allPublished.length) * 10) / 10
    : null

  return {
    services,
    barbers,
    gallery,
    testimonials,
    config,
    stats: {
      avgRating: avgAll,
      reviewCount: allPublished.length,
      barberCount: barbers.length,
      appointmentCount,
    },
  }
}
