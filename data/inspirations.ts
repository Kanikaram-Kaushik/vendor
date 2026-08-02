import { Inspiration } from "./types";

export const inspirations: Inspiration[] = [
  {
    id: "inspiration.sunlit-reading-nook",
    title: "Sunlit Reading Nook",
    slug: "sunlit-reading-nook",
    type: "real project",
    featured: true,
    description:
      "A compact reading corner with layered textiles and soft natural light.",
    creditText: "Photography by Studio Nomad.",
    roomTypes: ["living-room"],
    styles: ["japandi", "warm-minimal"],
    images: [
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1481277542470-605612bd2d61?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop&w=1200&q=80",
    ],
    attribution: "studio-nomad",
  },
  {
    id: "inspiration.courtyard-bedroom",
    title: "Courtyard Bedroom",
    slug: "courtyard-bedroom",
    type: "concept",
    featured: false,
    description: "A tranquil bedroom concept anchored by natural materials.",
    creditText: "Concept by Cedar & Moss.",
    roomTypes: ["bedroom"],
    styles: ["biophilic", "warm-minimal"],
    images: [
      "https://images.unsplash.com/photo-1505691723518-36a5ac3be353?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1502005097973-6a7082348e28?auto=format&fit=crop&w=1200&q=80",
    ],
    attribution: "cedar-and-moss",
  },
  {
    id: "inspiration.coastal-kitchen",
    title: "Coastal Kitchen",
    slug: "coastal-kitchen",
    type: "real project",
    featured: true,
    description: "Bright kitchen with coastal textures and soft neutrals.",
    creditText: "Designed by Atelier North.",
    roomTypes: ["kitchen"],
    styles: ["coastal", "contemporary"],
    images: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80",
    ],
    attribution: "atelier-north",
  },
  {
    id: "inspiration.heritage-dining-salon",
    title: "Heritage Dining Salon",
    slug: "heritage-dining-salon",
    type: "real project",
    featured: false,
    description:
      "Layered textiles and sculptural pieces in a moody dining room.",
    creditText: "Styled by Leena Kapoor Studio.",
    roomTypes: ["dining-room"],
    styles: ["heritage", "contemporary"],
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1505691723518-36a5ac3be353?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=1200&q=80",
    ],
    attribution: "leena-kapoor-studio",
  },
];

export const getInspirationBySlug = (slug: string): Inspiration | undefined =>
  inspirations.find((i) => i.slug === slug);

export const getFeaturedInspirations = (): Inspiration[] =>
  inspirations.filter((i) => i.featured);

export const getInspirationsByRoom = (roomSlug: string): Inspiration[] =>
  inspirations.filter((i) => i.roomTypes.includes(roomSlug));

export const getInspirationsByStyle = (styleSlug: string): Inspiration[] =>
  inspirations.filter((i) => i.styles.includes(styleSlug));

export const getAllInspirations = (): Inspiration[] => inspirations;

export const getInspirationsByEntity = (entitySlug: string): Inspiration[] =>
  inspirations.filter((i) => i.attribution === entitySlug);
