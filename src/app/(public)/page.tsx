import { getLandingData } from '@/lib/landing'
import { PublicNav } from '@/components/landing/PublicNav'
import { Hero } from '@/components/landing/Hero'
import { Services } from '@/components/landing/Services'
import { Team } from '@/components/landing/Team'
import { Gallery } from '@/components/landing/Gallery'
import { Testimonials } from '@/components/landing/Testimonials'
import { Info } from '@/components/landing/Info'
import { Footer } from '@/components/landing/Footer'
import { FloatingCTA } from '@/components/landing/FloatingCTA'

// ISR: regenera a landing a cada 1h (dados de serviços/equipe/avaliações).
export const revalidate = 3600

export default async function LandingPage() {
  const { services, barbers, gallery, testimonials, config, stats } = await getLandingData()

  return (
    <div className="min-h-screen font-sans text-primary bg-white">
      <PublicNav />
      <main>
        <Hero stats={stats} />
        <Services services={services} />
        <Team barbers={barbers} />
        <Gallery images={gallery} />
        <Testimonials reviews={testimonials} />
        <Info config={config} />
      </main>
      <Footer config={config} />
      <FloatingCTA />
    </div>
  )
}
