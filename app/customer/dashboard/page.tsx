'use client'

import { Suspense } from 'react'
import { HeroFullWidth } from '@/design-bhk-main/src/components/home/HeroFullWidth'
import { HowItWorksSection } from '@/design-bhk-main/src/components/home/HowItWorksSection'
import { AiStudioPreviewSection } from '@/design-bhk-main/src/components/home/AiStudioPreviewSection'
import { TestimonialsBentoSection } from '@/design-bhk-main/src/components/home/TestimonialsBentoSection'
import { ServicesSection } from '@/design-bhk-main/src/components/home/ServicesSection'
import { FeaturedDiscoverySection } from '@/design-bhk-main/src/components/home/FeaturedDiscoverSection'
import { ShoppingCtaSection } from '@/design-bhk-main/src/components/home/ShoppingCtaSection'
import Reveal from '@/design-bhk-main/src/components/Reveal'
import SiteHeader from '@/design-bhk-main/src/components/SiteHeader'
import SiteFooter from '@/design-bhk-main/src/components/SiteFooter'
import AppProviders from '@/design-bhk-main/src/components/providers/AppProviders'
import { AuthProvider } from '@/design-bhk-main/src/components/auth/AuthProvider'
import '@/design-bhk-main/src/app/globals.css'

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