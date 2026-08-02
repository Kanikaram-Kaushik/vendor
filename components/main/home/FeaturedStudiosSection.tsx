import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getFeaturedEntities, getHomePageData } from "@/data";
import ButtonLink from "@/components/ButtonLink";
import SectionHeader from "@/components/SectionHeader";
import Reveal from "@/components/Reveal";

const formatType = (value?: string) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : "";

export function FeaturedStudiosSection() {
  const homePage = getHomePageData();
  const studios = homePage.featuredEntities.length
    ? homePage.featuredEntities
      .map((slug) => getFeaturedEntities().find((entity) => entity.slug === slug))
      .filter((entity): entity is NonNullable<typeof entity> => entity !== undefined)
    : getFeaturedEntities();
  const featuredStudios = studios.slice(0, 3);

  return (
    <section className="w-full px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-16">
        <SectionHeader
          eyebrow="Featured Studios"
          title="Designers shaping elevated interiors"
          description="A curated selection of trusted professionals transforming residential and hospitality spaces."
        />
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {featuredStudios.map((item, index) => (
            <Reveal key={item.slug} delay={0.05 * index}>
              <Link
                href={`/discover/${item.slug}`}
                className="group relative block overflow-hidden rounded-2xl bg-card shadow-sm transition-all duration-500 hover:shadow-xl"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  {item.featuredImage ? (
                    <Image
                      src={item.featuredImage}
                      alt={item.name}
                      fill
                      className="object-cover transition duration-700 group-hover:scale-105"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
                </div>
                <div className="p-6">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="text-xs font-medium uppercase tracking-wider text-accent">
                      {formatType(item.type)}
                    </span>
                    <span className="text-muted">·</span>
                    <span className="text-xs text-muted">{item.location}</span>
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-foreground transition group-hover:text-accent">
                    {item.name}
                  </h3>
                  <p className="text-sm text-muted">
                    {item.styles?.slice(0, 3).join(" · ")}
                  </p>
                </div>
                <div className="absolute bottom-6 right-6 flex h-10 w-10 items-center justify-center rounded-full bg-accent text-white opacity-0 transition duration-500 group-hover:opacity-100">
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
        <div className="flex justify-center">
          <ButtonLink href="/discover" label="View All Studios" variant="secondary" />
        </div>
      </div>
    </section>
  );
}
