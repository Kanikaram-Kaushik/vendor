import { HomePageData } from "./types";

export const homePage: HomePageData = {
  title: "Homepage",
  heroItems: [
    {
      eyebrow: "Discovery Platform",
      title: "Discover studios shaping elevated, livable interiors.",
      subtitle:
        "Explore designers, architects, and inspirations curated for calm, contemporary living. Build your brief, then connect with the teams that fit your vision.",
      accent: "Quiet luxury · 2026",
      primaryCta: {
        label: "Start Exploring",
        href: "/discover",
      },
      secondaryCta: {
        label: "Browse Inspirations",
        href: "/designs",
      },
      image:
        "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1600&q=80",
    },
    {
      eyebrow: "Curated Talent",
      title: "Find designers who speak your aesthetic language.",
      subtitle:
        "Filter by style, location, and project type to shortlist studios that match your taste and timeline.",
      accent: "Design matchmaking",
      primaryCta: {
        label: "Meet the Studios",
        href: "/discover",
      },
      secondaryCta: {
        label: "View Services",
        href: "/services",
      },
      image:
        "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=1600&q=80",
    },
    {
      eyebrow: "Inspiration Gallery",
      title: "Build a moodboard across rooms, styles, and moods.",
      subtitle:
        "Save references, explore material palettes, and turn inspiration into an actionable brief.",
      accent: "Material stories",
      primaryCta: {
        label: "Explore Inspirations",
        href: "/designs",
      },
      secondaryCta: {
        label: "Read the Journal",
        href: "/blog",
      },
      image:
        "https://images.unsplash.com/photo-1501045661006-fcebe0257c3f?auto=format&fit=crop&w=1600&q=80",
    },
  ],
  featuredEntities: [
    "leena-kapoor-studio",
    "atelier-north",
    "studio-nomad",
  ],
  featuredInspirations: [
    "sunlit-reading-nook",
    "coastal-kitchen",
    "heritage-dining-salon",
  ],
  featuredServices: [
    "design-consultation",
    "full-service-interiors",
    "renovation-planning",
  ],
};

export const getHomePageData = (): HomePageData => homePage;
