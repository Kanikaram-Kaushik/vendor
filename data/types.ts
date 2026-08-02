// Types for local data (migrated from Sanity)

export type Style = {
  id: string;
  title: string;
  slug: string;
};

export type Room = {
  id: string;
  title: string;
  slug: string;
};

export type Entity = {
  id: string;
  name: string;
  slug: string;
  type: "designer" | "architect" | "company";
  featured: boolean;
  bio?: string;
  location?: string;
  website?: string;
  styles: string[]; // style slugs
  services: string[];
  featuredImage: string; // URL
  gallery: string[]; // URLs
};

export type Service = {
  id: string;
  title: string;
  slug: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
  image: string; // URL
  featured: boolean;
  order: number;
};

export type Inspiration = {
  id: string;
  title: string;
  slug: string;
  type: "real project" | "concept";
  featured: boolean;
  description?: string;
  creditText?: string;
  roomTypes: string[]; // room slugs
  styles: string[]; // style slugs
  images: string[]; // URLs
  attribution?: string; // entity slug
};

export type HeroItem = {
  eyebrow: string;
  title: string;
  subtitle: string;
  accent: string;
  primaryCta: {
    label: string;
    href: string;
  };
  secondaryCta: {
    label: string;
    href: string;
  };
  image: string; // URL
};

export type HomePageData = {
  title: string;
  heroItems: HeroItem[];
  featuredEntities: string[]; // entity slugs
  featuredInspirations: string[]; // inspiration slugs
  featuredServices: string[]; // service slugs
};

export type Testimonial = {
  id: string;
  name: string;
  role: string;
  company?: string;
  location?: string;
  quote: string;
  rating: 1 | 2 | 3 | 4 | 5;
  avatar?: string;
  projectType?: string;
  featured?: boolean;
};

export type Review = {
  name: string;
  rating: number;
  date: string;
  text: string;
};
