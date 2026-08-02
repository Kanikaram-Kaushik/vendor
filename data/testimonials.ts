import type { Testimonial } from "./types";

export const testimonials: Testimonial[] = [
  {
    id: "tara-mehta",
    name: "Tara Mehta",
    role: "Homeowner",
    company: "Private Residence",
    location: "Mumbai",
    quote:
      "Our apartment finally feels intentional. The studio translated our references into a warm, calm layout that works for daily life and entertaining.",
    rating: 5,
    avatar:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=320&q=80",
    projectType: "Full Home Interior",
    featured: true,
  },
  {
    id: "nikhil-ahuja",
    name: "Nikhil Ahuja",
    role: "Founder",
    company: "Ahuja Hospitality",
    location: "Goa",
    quote:
      "The team balanced character and functionality across our boutique property. Guests consistently mention the design as a highlight of their stay.",
    rating: 5,
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=320&q=80",
    projectType: "Hospitality Renovation",
  },
  {
    id: "sanya-rai",
    name: "Sanya Rai",
    role: "Product Lead",
    company: "Nexa Labs",
    location: "Bengaluru",
    quote:
      "We needed a focused home-office plus a softer living zone. The final result improved both productivity and how we unwind at night.",
    rating: 4,
    avatar:
      "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=320&q=80",
    projectType: "Apartment Upgrade",
  },
  {
    id: "arjun-singh",
    name: "Arjun Singh",
    role: "Co-founder",
    company: "Northline Studio",
    location: "Delhi NCR",
    quote:
      "From concept to handover, communication was clear and decisions were data-backed. Budget and timelines stayed realistic throughout execution.",
    rating: 5,
    projectType: "Villa Interiors",
  },
  {
    id: "meera-iyer",
    name: "Meera Iyer",
    role: "Consultant",
    company: "Independent",
    location: "Chennai",
    quote:
      "Their material recommendations were practical and beautiful. Even six months later, every finish still feels relevant and easy to maintain.",
    rating: 5,
    avatar:
      "https://images.unsplash.com/photo-1531123414780-f74242c2b052?auto=format&fit=crop&w=320&q=80",
    projectType: "Living + Dining Refresh",
  },
  {
    id: "kabir-shah",
    name: "Kabir Shah",
    role: "Director",
    company: "Shah & Co",
    location: "Pune",
    quote:
      "The discovery process made shortlisting effortless. We found a studio aligned with our taste quickly and moved from ideas to build without friction.",
    rating: 4,
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=320&q=80",
    projectType: "Design Consultation",
  },
];

export const getTestimonials = (): Testimonial[] => testimonials;
