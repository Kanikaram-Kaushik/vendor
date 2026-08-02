'use client'

import { Suspense } from 'react'
import { HeroFullWidth } from '@/components/main/home/HeroFullWidth'
import { HowItWorksSection } from '@/components/main/home/HowItWorksSection'
import { AiStudioPreviewSection } from '@/components/main/home/AiStudioPreviewSection'
import { TestimonialsBentoSection } from '@/components/main/home/TestimonialsBentoSection'
import { ServicesSection } from '@/components/main/home/ServicesSection'
import { FeaturedDiscoverySection } from '@/components/main/home/FeaturedDiscoverSection'
import { ShoppingCtaSection } from '@/components/main/home/ShoppingCtaSection'
import Reveal from '@/components/main/Reveal'
import SiteHeader from '@/components/main/SiteHeader'
import SiteFooter from '@/components/main/SiteFooter'
import AppProviders from '@/components/main/providers/AppProviders'
import { AuthProvider } from '@/components/main/auth/AuthProvider'

export default function CustomerDashboardPage() {
  return (
    <AppProviders>
      <AuthProvider>
        <div className="min-h-screen bg-background text-foreground">
          <SiteHeader />
          <main className="flex w-full flex-col">
            <HeroFullWidth />
            <Reveal>
              <HowItWorksSection />
            </Reveal>
            <Reveal>
              <AiStudioPreviewSection />
            </Reveal>
            <Reveal>
              <TestimonialsBentoSection />
            </Reveal>
            <Reveal>
              <ServicesSection />
            </Reveal>
            <Reveal>
              <Suspense fallback={null}>
                <FeaturedDiscoverySection />
              </Suspense>
            </Reveal>
            <Reveal>
              <ShoppingCtaSection />
            </Reveal>
          </main>
          <SiteFooter />
        </div>
      </AuthProvider>
    </AppProviders>
  )
}