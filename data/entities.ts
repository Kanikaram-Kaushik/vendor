import { Entity } from "./types";

export const entities: Entity[] = [
  {
    id: "entity.leena-kapoor-studio",
    name: "Leena Kapoor Studio",
    slug: "leena-kapoor-studio",
    type: "designer",
    featured: true,
    bio: "Curated, sculptural interiors blending heritage textiles with contemporary silhouettes.",
    location: "Delhi, India",
    website: "https://example.com",
    styles: ["contemporary", "heritage"],
    services: ["Full-service interiors", "Styling", "Custom furniture"],
    featuredImage:
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    id: "entity.atelier-north",
    name: "Atelier North",
    slug: "atelier-north",
    type: "architect",
    featured: true,
    bio: "Architectural studio crafting airy modern homes with a focus on natural light.",
    location: "Bengaluru, India",
    website: "https://example.com",
    styles: ["warm-minimal", "biophilic"],
    services: ["Architecture", "Space planning", "Renovations"],
    featuredImage:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    id: "entity.studio-nomad",
    name: "Studio Nomad",
    slug: "studio-nomad",
    type: "company",
    featured: true,
    bio: "Hospitality interiors inspired by coastal palettes and layered materials.",
    location: "Mumbai, India",
    website: "https://example.com",
    styles: ["coastal", "contemporary"],
    services: ["Hospitality design", "Brand styling", "FF&E sourcing"],
    featuredImage:
      "https://images.unsplash.com/photo-1505691723518-36a5ac3be353?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1481277542470-605612bd2d61?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    id: "entity.cedar-and-moss",
    name: "Cedar & Moss",
    slug: "cedar-and-moss",
    type: "designer",
    featured: false,
    bio: "Warm minimalism with a tactile focus on wood, stone, and artisanal accents.",
    location: "Jaipur, India",
    website: "https://example.com",
    styles: ["warm-minimal", "japandi"],
    services: ["Residential interiors", "Material consulting", "Styling"],
    featuredImage:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1502005097973-6a7082348e28?auto=format&fit=crop&w=1200&q=80",
    ],
  },
];

export const getEntityBySlug = (slug: string): Entity | undefined =>
  entities.find((e) => e.slug === slug);

export const getFeaturedEntities = (): Entity[] =>
  entities.filter((e) => e.featured);

export const getEntitiesByStyle = (styleSlug: string): Entity[] =>
  entities.filter((e) => e.styles.includes(styleSlug));

export const getAllEntities = (): Entity[] => entities;
