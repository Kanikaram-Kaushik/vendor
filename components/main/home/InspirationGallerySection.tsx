import Image from "next/image";
import Link from "next/link";
import { getFeaturedInspirations, getHomePageData } from "@/data";
import ButtonLink from "@/components/ButtonLink";
import SectionHeader from "@/components/SectionHeader";
import Reveal from "@/components/Reveal";

export function InspirationGallerySection() {
  const homePage = getHomePageData();
  const inspirations = homePage.featuredInspirations.length
    ? homePage.featuredInspirations
        .map((slug) =>
          getFeaturedInspirations().find((inspiration) => inspiration.slug === slug),
        )
        .filter(
          (inspiration): inspiration is NonNullable<typeof inspiration> =>
            inspiration !== undefined,
        )
    : getFeaturedInspirations();
  const featuredInspirations = inspirations.slice(0, 4);

  return (
    <section className="w-full bg-card/50 px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-16">
        <SectionHeader
          eyebrow="Inspiration"
          title="Spaces that spark creativity"
          description="Browse our gallery of curated interiors organized by room, style, and mood."
        />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {featuredInspirations.map((item, index) => (
            <Reveal key={item.slug} delay={0.05 * index}>
              <Link
                href={`/designs/${item.slug}`}
                className="group relative block overflow-hidden rounded-2xl"
              >
                <div className="relative aspect-[3/4] overflow-hidden">
                  {item.images?.[0] ? (
                    <Image
                      src={item.images[0]}
                      alt={item.title}
                      fill
                      className="object-cover transition duration-700 group-hover:scale-110"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute inset-0 flex flex-col justify-end p-5">
                    <span className="mb-2 inline-block w-fit rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                      {(item.roomTypes || []).slice(0, 1).join("")}
                    </span>
                    <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                    <p className="mt-1 text-sm text-white/80">
                      {(item.styles || []).slice(0, 1).join("")}
                    </p>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
        <div className="flex justify-center">
          <ButtonLink
            href="/designs"
            label="Explore Gallery"
            variant="secondary"
          />
        </div>
      </div>
    </section>
  );
}
