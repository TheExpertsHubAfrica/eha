import type { TravelPackage } from "@/lib/catalog/types";

export const travelPackages: TravelPackage[] = [
  {
    id: "pkg_dubai",
    slug: "dubai",
    destination: "Dubai",
    country: "United Arab Emirates",
    name: "Holiday Package",
    duration: "5 days / 4 nights",
    summary:
      "A guided city stay covering Dubai’s skyline, desert edge, and landmark districts — paced for first-time visitors.",
    featured: true,
    published: true,
    includes: ["Airport transfers", "Hotel stay", "Selected sightseeing"],
    excludes: ["International flights unless stated", "Personal spending"],
    accent: "navy",
  },
  {
    id: "pkg_paris",
    slug: "paris",
    destination: "Paris",
    country: "France",
    name: "Romantic Getaway",
    duration: "5 days / 4 nights",
    summary:
      "A walkable Paris itinerary with time for riverfront neighbourhoods, galleries, and unhurried evenings.",
    featured: true,
    published: true,
    includes: ["Airport transfers", "Hotel stay", "Selected sightseeing"],
    excludes: ["International flights unless stated", "Personal spending"],
    accent: "blue",
  },
  {
    id: "pkg_cape-town",
    slug: "cape-town",
    destination: "Cape Town",
    country: "South Africa",
    name: "Adventure Package",
    duration: "6 days / 5 nights",
    summary:
      "Mountain, harbour, and peninsula days with room for both landmark visits and quieter coastline time.",
    featured: true,
    published: true,
    includes: ["Airport transfers", "Hotel stay", "Selected activities"],
    excludes: ["International flights unless stated", "Optional adventure add-ons"],
    accent: "sand",
  },
];
