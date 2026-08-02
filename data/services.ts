import { Service } from "./types";

export const services: Service[] = [
  {
    id: "service.design-consultation",
    title: "Design Consultation",
    slug: "design-consultation",
    description:
      "One-on-one guidance to align your space, budget, and design direction.",
    ctaLabel: "Book a consult",
    ctaHref: "/contact",
    image:
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1400&q=80",
    featured: true,
    order: 1,
  },
  {
    id: "service.full-service-interiors",
    title: "Full-Service Interiors",
    slug: "full-service-interiors",
    description:
      "End-to-end interiors including layout planning, materials, and execution.",
    ctaLabel: "Explore studios",
    ctaHref: "/discover",
    image:
      "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=1400&q=80",
    featured: true,
    order: 2,
  },
  {
    id: "service.styling-and-accessories",
    title: "Styling & Accessories",
    slug: "styling-and-accessories",
    description:
      "Curated finishing touches with textiles, art, and decor sourcing.",
    ctaLabel: "Browse inspirations",
    ctaHref: "/designs",
    image:
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1400&q=80",
    featured: false,
    order: 3,
  },
  {
    id: "service.renovation-planning",
    title: "Renovation Planning",
    slug: "renovation-planning",
    description:
      "Scope, timelines, and contractor alignment for a smooth renovation.",
    ctaLabel: "Get in touch",
    ctaHref: "/contact",
    image:
      "https://images.unsplash.com/photo-1505691723518-36a5ac3be353?auto=format&fit=crop&w=1400&q=80",
    featured: false,
    order: 4,
  },
];

export const getServiceBySlug = (slug: string): Service | undefined =>
  services.find((s) => s.slug === slug);

export const getFeaturedServices = (): Service[] =>
  services.filter((s) => s.featured).sort((a, b) => a.order - b.order);

export const getAllServices = (): Service[] =>
  services.sort((a, b) => a.order - b.order);
