// Mock property data for seeding the database
// 15 diverse Israeli properties covering various cities, types, and price ranges

import { USD_TO_ILS_RATE } from "../src/lib/constants";

export type SeedProperty = {
  title: string;
  description: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  propertyType: "residential" | "commercial" | "mixed_use" | "land";
  status: "available" | "pending" | "sold";
  priceUsd: number;
  priceIls: number;
  expectedRoi?: number;
  cashOnCash?: number;
  capRate?: number;
  monthlyRent?: number;
  bedrooms?: number;
  bathrooms?: number;
  squareMeters?: number;
  yearBuilt?: number;
  images: string[];
  featuredImage?: string;
};

export const SEED_PROPERTIES: SeedProperty[] = [
  // Tel Aviv properties
  {
    title: "Modern Penthouse in Tel Aviv",
    description:
      "Stunning penthouse with panoramic sea views in the heart of Tel Aviv. Features a large rooftop terrace, high-end finishes, and smart home technology.",
    address: "45 Rothschild Blvd",
    city: "Tel Aviv",
    latitude: 32.0636,
    longitude: 34.7721,
    propertyType: "residential",
    status: "available",
    priceUsd: 1850000,
    priceIls: Math.round(1850000 * USD_TO_ILS_RATE),
    expectedRoi: 8.5,
    cashOnCash: 6.2,
    capRate: 4.8,
    monthlyRent: 8500,
    bedrooms: 4,
    bathrooms: 3,
    squareMeters: 220,
    yearBuilt: 2021,
    images: ["https://placehold.co/800x600?text=Tel+Aviv+Penthouse+1"],
    featuredImage: "https://placehold.co/800x600?text=Tel+Aviv+Penthouse+1",
  },
  {
    title: "Boutique Investment Apartment",
    description:
      "Charming 2-bedroom apartment on Dizengoff Street. Great rental potential in a prime location close to cafes, shops, and the beach.",
    address: "122 Dizengoff St",
    city: "Tel Aviv",
    latitude: 32.0789,
    longitude: 34.7739,
    propertyType: "residential",
    status: "available",
    priceUsd: 580000,
    priceIls: Math.round(580000 * USD_TO_ILS_RATE),
    expectedRoi: 7.2,
    cashOnCash: 5.8,
    capRate: 5.1,
    monthlyRent: 3200,
    bedrooms: 2,
    bathrooms: 1,
    squareMeters: 75,
    yearBuilt: 2015,
    images: ["https://placehold.co/800x600?text=Dizengoff+Apartment"],
    featuredImage: "https://placehold.co/800x600?text=Dizengoff+Apartment",
  },
  {
    title: "Commercial Space - Prime Retail",
    description:
      "Ground floor retail space on King George Street. High foot traffic area, ideal for boutique or cafe. Currently leased with 3 years remaining.",
    address: "78 King George St",
    city: "Tel Aviv",
    latitude: 32.0741,
    longitude: 34.7752,
    propertyType: "commercial",
    status: "available",
    priceUsd: 920000,
    priceIls: Math.round(920000 * USD_TO_ILS_RATE),
    expectedRoi: 9.8,
    cashOnCash: 7.5,
    capRate: 6.2,
    monthlyRent: 6500,
    squareMeters: 95,
    yearBuilt: 2008,
    images: ["https://placehold.co/800x600?text=Tel+Aviv+Commercial"],
    featuredImage: "https://placehold.co/800x600?text=Tel+Aviv+Commercial",
  },

  // Jerusalem properties
  {
    title: "Historic Stone Villa",
    description:
      "Beautiful Jerusalem stone villa in Rehavia. Classic architecture with modern updates, private garden, and close to the German Colony.",
    address: "15 Ramban St, Rehavia",
    city: "Jerusalem",
    latitude: 31.7694,
    longitude: 35.2128,
    propertyType: "residential",
    status: "available",
    priceUsd: 2100000,
    priceIls: Math.round(2100000 * USD_TO_ILS_RATE),
    expectedRoi: 6.5,
    cashOnCash: 4.8,
    capRate: 4.2,
    monthlyRent: 9500,
    bedrooms: 5,
    bathrooms: 3,
    squareMeters: 280,
    yearBuilt: 1995,
    images: ["https://placehold.co/800x600?text=Jerusalem+Villa"],
    featuredImage: "https://placehold.co/800x600?text=Jerusalem+Villa",
  },
  {
    title: "German Colony Investment Apartment",
    description:
      "Renovated 3-bedroom in the heart of the German Colony. Walking distance to Emek Refaim restaurants and First Station.",
    address: "28 Emek Refaim St",
    city: "Jerusalem",
    latitude: 31.7623,
    longitude: 35.2182,
    propertyType: "residential",
    status: "available",
    priceUsd: 780000,
    priceIls: Math.round(780000 * USD_TO_ILS_RATE),
    expectedRoi: 7.8,
    cashOnCash: 5.5,
    capRate: 5.3,
    monthlyRent: 4200,
    bedrooms: 3,
    bathrooms: 2,
    squareMeters: 110,
    yearBuilt: 2010,
    images: ["https://placehold.co/800x600?text=German+Colony+Apt"],
    featuredImage: "https://placehold.co/800x600?text=German+Colony+Apt",
  },

  // Herzliya properties
  {
    title: "Luxury Marina Apartment",
    description:
      "High-end apartment overlooking Herzliya Marina. Resort-style living with pool, gym, and 24/7 security. Walking distance to beach.",
    address: "3 HaShunit St, Herzliya Pituach",
    city: "Herzliya",
    latitude: 32.1612,
    longitude: 34.8014,
    propertyType: "residential",
    status: "available",
    priceUsd: 1450000,
    priceIls: Math.round(1450000 * USD_TO_ILS_RATE),
    expectedRoi: 7.0,
    cashOnCash: 5.2,
    capRate: 4.5,
    monthlyRent: 7000,
    bedrooms: 3,
    bathrooms: 2,
    squareMeters: 150,
    yearBuilt: 2019,
    images: ["https://placehold.co/800x600?text=Herzliya+Marina"],
    featuredImage: "https://placehold.co/800x600?text=Herzliya+Marina",
  },
  {
    title: "Tech Park Office Space",
    description:
      "Modern office space in Herzliya tech park. Open floor plan, fiber internet, parking included. Suitable for startups.",
    address: "12 Maskit St",
    city: "Herzliya",
    latitude: 32.1628,
    longitude: 34.8203,
    propertyType: "commercial",
    status: "pending",
    priceUsd: 650000,
    priceIls: Math.round(650000 * USD_TO_ILS_RATE),
    expectedRoi: 10.2,
    cashOnCash: 8.0,
    capRate: 7.1,
    monthlyRent: 5200,
    squareMeters: 120,
    yearBuilt: 2017,
    images: ["https://placehold.co/800x600?text=Herzliya+Office"],
    featuredImage: "https://placehold.co/800x600?text=Herzliya+Office",
  },

  // Haifa properties
  {
    title: "Carmel Mountain View Apartment",
    description:
      "Spacious apartment on Mount Carmel with stunning bay views. Close to University of Haifa and Technion.",
    address: "55 Panorama Rd, Carmel",
    city: "Haifa",
    latitude: 32.7936,
    longitude: 34.9847,
    propertyType: "residential",
    status: "available",
    priceUsd: 420000,
    priceIls: Math.round(420000 * USD_TO_ILS_RATE),
    expectedRoi: 8.8,
    cashOnCash: 7.2,
    capRate: 6.5,
    monthlyRent: 2800,
    bedrooms: 3,
    bathrooms: 2,
    squareMeters: 105,
    yearBuilt: 2012,
    images: ["https://placehold.co/800x600?text=Haifa+Carmel"],
    featuredImage: "https://placehold.co/800x600?text=Haifa+Carmel",
  },
  {
    title: "Downtown Haifa Mixed-Use Building",
    description:
      "Three-story building with ground floor retail and upper residential units. Great income diversification opportunity.",
    address: "18 Ben Gurion Blvd",
    city: "Haifa",
    latitude: 32.8156,
    longitude: 34.9889,
    propertyType: "mixed_use",
    status: "available",
    priceUsd: 890000,
    priceIls: Math.round(890000 * USD_TO_ILS_RATE),
    expectedRoi: 11.5,
    cashOnCash: 9.2,
    capRate: 8.0,
    monthlyRent: 7800,
    squareMeters: 350,
    yearBuilt: 2005,
    images: ["https://placehold.co/800x600?text=Haifa+Mixed+Use"],
    featuredImage: "https://placehold.co/800x600?text=Haifa+Mixed+Use",
  },

  // Netanya properties
  {
    title: "Beachfront Studio",
    description:
      "Cozy studio apartment just steps from Netanya beach. Perfect for short-term rentals with high tourist demand.",
    address: "8 Jabotinsky St",
    city: "Netanya",
    latitude: 32.3286,
    longitude: 34.8551,
    propertyType: "residential",
    status: "available",
    priceUsd: 185000,
    priceIls: Math.round(185000 * USD_TO_ILS_RATE),
    expectedRoi: 9.5,
    cashOnCash: 8.0,
    capRate: 7.2,
    monthlyRent: 1400,
    bedrooms: 1,
    bathrooms: 1,
    squareMeters: 42,
    yearBuilt: 2018,
    images: ["https://placehold.co/800x600?text=Netanya+Studio"],
    featuredImage: "https://placehold.co/800x600?text=Netanya+Studio",
  },
  {
    title: "Family Home Near Poleg Beach",
    description:
      "Spacious family home in quiet neighborhood. Large backyard, modern kitchen, and close to excellent schools.",
    address: "22 Ussishkin St, Ir Yamim",
    city: "Netanya",
    latitude: 32.3024,
    longitude: 34.8493,
    propertyType: "residential",
    status: "available",
    priceUsd: 720000,
    priceIls: Math.round(720000 * USD_TO_ILS_RATE),
    expectedRoi: 6.8,
    cashOnCash: 5.0,
    capRate: 4.8,
    monthlyRent: 3800,
    bedrooms: 4,
    bathrooms: 2,
    squareMeters: 180,
    yearBuilt: 2016,
    images: ["https://placehold.co/800x600?text=Netanya+Family+Home"],
    featuredImage: "https://placehold.co/800x600?text=Netanya+Family+Home",
  },

  // Ra'anana properties
  {
    title: "Garden Apartment in Ra'anana",
    description:
      "Ground floor apartment with private garden in prestigious Ra'anana neighborhood. Popular with expat families.",
    address: "35 Ahuza St",
    city: "Ra'anana",
    latitude: 32.1826,
    longitude: 34.8715,
    propertyType: "residential",
    status: "available",
    priceUsd: 850000,
    priceIls: Math.round(850000 * USD_TO_ILS_RATE),
    expectedRoi: 6.2,
    cashOnCash: 4.5,
    capRate: 4.3,
    monthlyRent: 4500,
    bedrooms: 4,
    bathrooms: 2,
    squareMeters: 140,
    yearBuilt: 2014,
    images: ["https://placehold.co/800x600?text=Raanana+Garden+Apt"],
    featuredImage: "https://placehold.co/800x600?text=Raanana+Garden+Apt",
  },

  // Ashdod properties
  {
    title: "New Development Apartment",
    description:
      "Brand new apartment in Ashdod's growing marina district. Modern design, sea views, and excellent investment potential.",
    address: "5 Hatayelet St",
    city: "Ashdod",
    latitude: 31.7993,
    longitude: 34.6324,
    propertyType: "residential",
    status: "available",
    priceUsd: 320000,
    priceIls: Math.round(320000 * USD_TO_ILS_RATE),
    expectedRoi: 9.0,
    cashOnCash: 7.5,
    capRate: 6.8,
    monthlyRent: 2200,
    bedrooms: 3,
    bathrooms: 2,
    squareMeters: 95,
    yearBuilt: 2024,
    images: ["https://placehold.co/800x600?text=Ashdod+New+Dev"],
    featuredImage: "https://placehold.co/800x600?text=Ashdod+New+Dev",
  },

  // Beer Sheva properties
  {
    title: "Student Housing Investment",
    description:
      "Multi-unit property near Ben-Gurion University. Consistently rented to students with stable cash flow.",
    address: "12 Rager Blvd",
    city: "Beer Sheva",
    latitude: 31.2518,
    longitude: 34.7913,
    propertyType: "residential",
    status: "available",
    priceUsd: 280000,
    priceIls: Math.round(280000 * USD_TO_ILS_RATE),
    expectedRoi: 12.5,
    cashOnCash: 10.8,
    capRate: 9.5,
    monthlyRent: 2600,
    bedrooms: 4,
    bathrooms: 2,
    squareMeters: 110,
    yearBuilt: 2008,
    images: ["https://placehold.co/800x600?text=Beer+Sheva+Student"],
    featuredImage: "https://placehold.co/800x600?text=Beer+Sheva+Student",
  },

  // Eilat properties
  {
    title: "Resort Vacation Condo",
    description:
      "Turnkey vacation rental in Eilat resort area. Fully furnished with hotel amenities, perfect for short-term rental income.",
    address: "2 HaTmarim Blvd",
    city: "Eilat",
    latitude: 29.5569,
    longitude: 34.9517,
    propertyType: "residential",
    status: "available",
    priceUsd: 390000,
    priceIls: Math.round(390000 * USD_TO_ILS_RATE),
    expectedRoi: 11.0,
    cashOnCash: 9.5,
    capRate: 8.2,
    monthlyRent: 3200,
    bedrooms: 2,
    bathrooms: 1,
    squareMeters: 68,
    yearBuilt: 2020,
    images: ["https://placehold.co/800x600?text=Eilat+Resort+Condo"],
    featuredImage: "https://placehold.co/800x600?text=Eilat+Resort+Condo",
  },
];
