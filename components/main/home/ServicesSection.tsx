import { ArrowRight, Compass, Palette, Sparkles } from "lucide-react";
import { getFeaturedServices, getHomePageData } from "@/data";
import ButtonLink from "@/components/ButtonLink";
import SectionHeader from "@/components/SectionHeader";
import Reveal from "@/components/Reveal";

export function ServicesSection() {
  const homePage = getHomePageData();
  const services = homePage.featuredServices.length
    ? homePage.featuredServices
        .map((slug) => getFeaturedServices().find((service) => service.slug === slug))
        .filter((service): service is NonNullable<typeof service> => service !== undefined)
    : getFeaturedServices();
  const featuredServices = services.slice(0, 4);

  return (
    <section className="w-full px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-16">
        <SectionHeader
          eyebrow="Services"
          title="From vision to reality"
          description="Comprehensive design services tailored to your project needs, from consultation to completion."
        />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {featuredServices.map((service, index) => (
            <Reveal key={service.title} delay={0.05 * index}>
              <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-foreground/10 bg-card p-6 transition-all duration-300 hover:border-accent/30 hover:shadow-lg">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  {index === 0 && <Compass className="h-6 w-6" />}
                  {index === 1 && <Palette className="h-6 w-6" />}
                  {index === 2 && <Sparkles className="h-6 w-6" />}
                  {index === 3 && <ArrowRight className="h-6 w-6" />}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  {service.title}
                </h3>
                <p className="mb-6 flex-1 text-sm leading-relaxed text-muted">
                  {service.description}
                </p>
                <ButtonLink
                  href={service.ctaHref ?? "/contact"}
                  label={service.ctaLabel ?? "Learn more"}
                  variant="secondary"
                  size="sm"
                  external={service.ctaHref ? service.ctaHref.startsWith("http") : false}
                />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
