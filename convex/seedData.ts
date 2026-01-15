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
  amenities?: string[];
  images: string[];
  featuredImage?: string;
  soldDate?: number;
  soldPrice?: number;
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
    amenities: ["airConditioning", "elevator", "parking", "balcony", "security", "renovated", "safeRoom"],
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&h=600&fit=crop",
    ],
    featuredImage: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop",
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
    amenities: ["airConditioning", "elevator", "balcony", "renovated"],
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop",
    ],
    featuredImage: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
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
    amenities: ["airConditioning", "security", "accessible"],
    images: [
      "https://images.unsplash.com/photo-1604014237800-1c9102c219da?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=600&fit=crop",
    ],
    featuredImage: "https://images.unsplash.com/photo-1604014237800-1c9102c219da?w=800&h=600&fit=crop",
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
    amenities: ["airConditioning", "parking", "garden", "renovated", "safeRoom", "storage"],
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=800&h=600&fit=crop",
    ],
    featuredImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop",
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
    amenities: ["airConditioning", "elevator", "balcony", "renovated", "safeRoom"],
    images: [
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800&h=600&fit=crop",
    ],
    featuredImage: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=600&fit=crop",
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
    amenities: ["airConditioning", "elevator", "parking", "balcony", "security", "gym", "pool", "safeRoom"],
    images: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1567496898669-ee935f5f647a?w=800&h=600&fit=crop",
    ],
    featuredImage: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop",
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
    amenities: ["airConditioning", "parking", "elevator", "security", "accessible"],
    images: [
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1497366412874-3415097a27e7?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&h=600&fit=crop",
    ],
    featuredImage: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&h=600&fit=crop",
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
    amenities: ["airConditioning", "elevator", "parking", "balcony", "storage"],
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1560448075-cbc16bb4af8e?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop",
    ],
    featuredImage: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
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
    amenities: ["airConditioning", "parking", "elevator", "storage", "accessible"],
    images: [
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1464938050520-ef2571867405?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1577495508048-b635879837f1?w=800&h=600&fit=crop",
    ],
    featuredImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop",
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
    amenities: ["airConditioning", "elevator", "furnished", "renovated"],
    images: [
      "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1501183638710-841dd1904471?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&h=600&fit=crop",
    ],
    featuredImage: "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&h=600&fit=crop",
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
    amenities: ["airConditioning", "parking", "garden", "storage", "safeRoom", "petFriendly", "solar"],
    images: [
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop",
    ],
    featuredImage: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop",
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
    amenities: ["airConditioning", "parking", "garden", "storage", "safeRoom", "petFriendly", "accessible"],
    images: [
      "https://images.unsplash.com/photo-1598228723793-52759bba239c?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&h=600&fit=crop",
    ],
    featuredImage: "https://images.unsplash.com/photo-1598228723793-52759bba239c?w=800&h=600&fit=crop",
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
    amenities: ["airConditioning", "elevator", "parking", "balcony", "safeRoom", "solar"],
    images: [
      "https://images.unsplash.com/photo-1551361415-69c87624334f?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1560185008-b033106af5c3?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1560448205-4d9b3e6bb6db?w=800&h=600&fit=crop",
    ],
    featuredImage: "https://images.unsplash.com/photo-1551361415-69c87624334f?w=800&h=600&fit=crop",
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
    amenities: ["airConditioning", "parking", "storage", "petFriendly"],
    images: [
      "https://images.unsplash.com/photo-1460317442991-0ec209397118?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1495433324511-bf8e92934d90?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&h=600&fit=crop",
    ],
    featuredImage: "https://images.unsplash.com/photo-1460317442991-0ec209397118?w=800&h=600&fit=crop",
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
    amenities: ["airConditioning", "elevator", "pool", "gym", "security", "furnished", "balcony"],
    images: [
      "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop",
    ],
    featuredImage: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&h=600&fit=crop",
  },

  // ============= SOLD PROPERTIES =============
  // Tel Aviv - Sold
  {
    title: "Sold: Neve Tzedek Townhouse",
    description: "Charming renovated townhouse in historic Neve Tzedek. Premium location near Suzanne Dellal Center.",
    address: "18 Shabazi St",
    city: "Tel Aviv",
    latitude: 32.0589,
    longitude: 34.7659,
    propertyType: "residential",
    status: "sold",
    priceUsd: 1250000,
    priceIls: Math.round(1250000 * USD_TO_ILS_RATE),
    bedrooms: 3,
    bathrooms: 2,
    squareMeters: 145,
    yearBuilt: 1925,
    amenities: ["airConditioning", "renovated", "garden"],
    images: ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop"],
    featuredImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop",
    soldDate: Date.now() - 15 * 24 * 60 * 60 * 1000, // 15 days ago
    soldPrice: 1220000,
  },
  {
    title: "Sold: Florentin Loft",
    description: "Industrial-style loft in trendy Florentin neighborhood. High ceilings, open floor plan.",
    address: "42 Florentin St",
    city: "Tel Aviv",
    latitude: 32.0545,
    longitude: 34.7683,
    propertyType: "residential",
    status: "sold",
    priceUsd: 680000,
    priceIls: Math.round(680000 * USD_TO_ILS_RATE),
    bedrooms: 2,
    bathrooms: 1,
    squareMeters: 90,
    yearBuilt: 2018,
    amenities: ["airConditioning", "elevator", "renovated"],
    images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop"],
    featuredImage: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
    soldDate: Date.now() - 32 * 24 * 60 * 60 * 1000, // 32 days ago
    soldPrice: 695000,
  },

  // Jerusalem - Sold
  {
    title: "Sold: Baka Family Apartment",
    description: "Spacious apartment in family-friendly Baka. Close to the Promenade with beautiful views.",
    address: "8 Derech Beit Lechem",
    city: "Jerusalem",
    latitude: 31.7568,
    longitude: 35.2234,
    propertyType: "residential",
    status: "sold",
    priceUsd: 620000,
    priceIls: Math.round(620000 * USD_TO_ILS_RATE),
    bedrooms: 4,
    bathrooms: 2,
    squareMeters: 125,
    yearBuilt: 2005,
    amenities: ["airConditioning", "elevator", "parking", "safeRoom"],
    images: ["https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=600&fit=crop"],
    featuredImage: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=600&fit=crop",
    soldDate: Date.now() - 45 * 24 * 60 * 60 * 1000, // 45 days ago
    soldPrice: 610000,
  },
  {
    title: "Sold: Mamilla Studio",
    description: "Luxury studio near Mamilla Mall. Perfect pied-à-terre near the Old City.",
    address: "3 King Solomon St",
    city: "Jerusalem",
    latitude: 31.7778,
    longitude: 35.2241,
    propertyType: "residential",
    status: "sold",
    priceUsd: 450000,
    priceIls: Math.round(450000 * USD_TO_ILS_RATE),
    bedrooms: 1,
    bathrooms: 1,
    squareMeters: 55,
    yearBuilt: 2012,
    amenities: ["airConditioning", "elevator", "security", "furnished"],
    images: ["https://images.unsplash.com/photo-1560185008-b033106af5c3?w=800&h=600&fit=crop"],
    featuredImage: "https://images.unsplash.com/photo-1560185008-b033106af5c3?w=800&h=600&fit=crop",
    soldDate: Date.now() - 60 * 24 * 60 * 60 * 1000, // 60 days ago
    soldPrice: 465000,
  },

  // Herzliya - Sold
  {
    title: "Sold: Herzliya Hills Villa",
    description: "Modern villa in prestigious Herzliya Hills. Pool, garden, and sea views.",
    address: "25 HaNasi St",
    city: "Herzliya",
    latitude: 32.1654,
    longitude: 34.8123,
    propertyType: "residential",
    status: "sold",
    priceUsd: 2800000,
    priceIls: Math.round(2800000 * USD_TO_ILS_RATE),
    bedrooms: 6,
    bathrooms: 4,
    squareMeters: 320,
    yearBuilt: 2020,
    amenities: ["airConditioning", "parking", "pool", "garden", "security", "safeRoom"],
    images: ["https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&h=600&fit=crop"],
    featuredImage: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&h=600&fit=crop",
    soldDate: Date.now() - 21 * 24 * 60 * 60 * 1000, // 21 days ago
    soldPrice: 2750000,
  },
  {
    title: "Sold: Arena Mall Area Apartment",
    description: "New apartment near Herzliya Arena Mall. Walking distance to beach and restaurants.",
    address: "10 Shiv'at HaKokhavim",
    city: "Herzliya",
    latitude: 32.1589,
    longitude: 34.7998,
    propertyType: "residential",
    status: "sold",
    priceUsd: 890000,
    priceIls: Math.round(890000 * USD_TO_ILS_RATE),
    bedrooms: 3,
    bathrooms: 2,
    squareMeters: 110,
    yearBuilt: 2022,
    amenities: ["airConditioning", "elevator", "parking", "balcony", "safeRoom"],
    images: ["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop"],
    featuredImage: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop",
    soldDate: Date.now() - 38 * 24 * 60 * 60 * 1000, // 38 days ago
    soldPrice: 905000,
  },

  // Haifa - Sold
  {
    title: "Sold: German Colony Apartment",
    description: "Historic apartment in Haifa's German Colony. Original stone walls with modern updates.",
    address: "45 Ben Gurion Blvd",
    city: "Haifa",
    latitude: 32.8123,
    longitude: 34.9912,
    propertyType: "residential",
    status: "sold",
    priceUsd: 380000,
    priceIls: Math.round(380000 * USD_TO_ILS_RATE),
    bedrooms: 3,
    bathrooms: 1,
    squareMeters: 95,
    yearBuilt: 1935,
    amenities: ["airConditioning", "renovated", "balcony"],
    images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop"],
    featuredImage: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
    soldDate: Date.now() - 28 * 24 * 60 * 60 * 1000, // 28 days ago
    soldPrice: 375000,
  },
  {
    title: "Sold: Carmel Center Penthouse",
    description: "Top floor penthouse with panoramic bay views. Premium Carmel Center location.",
    address: "78 HaNassi Ave",
    city: "Haifa",
    latitude: 32.8012,
    longitude: 34.9867,
    propertyType: "residential",
    status: "sold",
    priceUsd: 520000,
    priceIls: Math.round(520000 * USD_TO_ILS_RATE),
    bedrooms: 4,
    bathrooms: 2,
    squareMeters: 140,
    yearBuilt: 2015,
    amenities: ["airConditioning", "elevator", "parking", "balcony", "storage"],
    images: ["https://images.unsplash.com/photo-1560448075-cbc16bb4af8e?w=800&h=600&fit=crop"],
    featuredImage: "https://images.unsplash.com/photo-1560448075-cbc16bb4af8e?w=800&h=600&fit=crop",
    soldDate: Date.now() - 52 * 24 * 60 * 60 * 1000, // 52 days ago
    soldPrice: 535000,
  },

  // Netanya - Sold
  {
    title: "Sold: Kikar HaAtzmaut Apartment",
    description: "Renovated apartment in central Netanya. Walking distance to beach and main square.",
    address: "15 Herzl St",
    city: "Netanya",
    latitude: 32.3298,
    longitude: 34.8562,
    propertyType: "residential",
    status: "sold",
    priceUsd: 295000,
    priceIls: Math.round(295000 * USD_TO_ILS_RATE),
    bedrooms: 2,
    bathrooms: 1,
    squareMeters: 72,
    yearBuilt: 2010,
    amenities: ["airConditioning", "elevator", "renovated"],
    images: ["https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&h=600&fit=crop"],
    featuredImage: "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&h=600&fit=crop",
    soldDate: Date.now() - 18 * 24 * 60 * 60 * 1000, // 18 days ago
    soldPrice: 290000,
  },
  {
    title: "Sold: South Beach Penthouse",
    description: "Luxury penthouse with direct sea views. Private rooftop and premium finishes.",
    address: "5 Nice Blvd",
    city: "Netanya",
    latitude: 32.3156,
    longitude: 34.8534,
    propertyType: "residential",
    status: "sold",
    priceUsd: 850000,
    priceIls: Math.round(850000 * USD_TO_ILS_RATE),
    bedrooms: 4,
    bathrooms: 3,
    squareMeters: 180,
    yearBuilt: 2021,
    amenities: ["airConditioning", "elevator", "parking", "balcony", "security", "safeRoom"],
    images: ["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop"],
    featuredImage: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop",
    soldDate: Date.now() - 42 * 24 * 60 * 60 * 1000, // 42 days ago
    soldPrice: 865000,
  },

  // Ra'anana - Sold
  {
    title: "Sold: North Ra'anana Family Home",
    description: "Large family home in north Ra'anana. Close to American International School.",
    address: "12 Borochov St",
    city: "Ra'anana",
    latitude: 32.1912,
    longitude: 34.8756,
    propertyType: "residential",
    status: "sold",
    priceUsd: 1100000,
    priceIls: Math.round(1100000 * USD_TO_ILS_RATE),
    bedrooms: 5,
    bathrooms: 3,
    squareMeters: 200,
    yearBuilt: 2008,
    amenities: ["airConditioning", "parking", "garden", "storage", "safeRoom"],
    images: ["https://images.unsplash.com/photo-1598228723793-52759bba239c?w=800&h=600&fit=crop"],
    featuredImage: "https://images.unsplash.com/photo-1598228723793-52759bba239c?w=800&h=600&fit=crop",
    soldDate: Date.now() - 25 * 24 * 60 * 60 * 1000, // 25 days ago
    soldPrice: 1080000,
  },
  {
    title: "Sold: Park Ra'anana Apartment",
    description: "Modern apartment overlooking Park Ra'anana. Great schools nearby.",
    address: "28 Yerushalayim St",
    city: "Ra'anana",
    latitude: 32.1845,
    longitude: 34.8698,
    propertyType: "residential",
    status: "sold",
    priceUsd: 720000,
    priceIls: Math.round(720000 * USD_TO_ILS_RATE),
    bedrooms: 3,
    bathrooms: 2,
    squareMeters: 105,
    yearBuilt: 2016,
    amenities: ["airConditioning", "elevator", "parking", "balcony", "safeRoom"],
    images: ["https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop"],
    featuredImage: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop",
    soldDate: Date.now() - 55 * 24 * 60 * 60 * 1000, // 55 days ago
    soldPrice: 735000,
  },

  // Ashdod - Sold
  {
    title: "Sold: Marina District Apartment",
    description: "Sea view apartment in new marina development. Modern building with all amenities.",
    address: "22 HaYam St",
    city: "Ashdod",
    latitude: 31.8012,
    longitude: 34.6298,
    propertyType: "residential",
    status: "sold",
    priceUsd: 340000,
    priceIls: Math.round(340000 * USD_TO_ILS_RATE),
    bedrooms: 3,
    bathrooms: 2,
    squareMeters: 100,
    yearBuilt: 2023,
    amenities: ["airConditioning", "elevator", "parking", "balcony", "safeRoom"],
    images: ["https://images.unsplash.com/photo-1551361415-69c87624334f?w=800&h=600&fit=crop"],
    featuredImage: "https://images.unsplash.com/photo-1551361415-69c87624334f?w=800&h=600&fit=crop",
    soldDate: Date.now() - 12 * 24 * 60 * 60 * 1000, // 12 days ago
    soldPrice: 352000,
  },
  {
    title: "Sold: City Center Commercial",
    description: "Ground floor retail space in busy commercial area. Long-term tenant in place.",
    address: "8 HaAtzmaut Ave",
    city: "Ashdod",
    latitude: 31.7956,
    longitude: 34.6512,
    propertyType: "commercial",
    status: "sold",
    priceUsd: 420000,
    priceIls: Math.round(420000 * USD_TO_ILS_RATE),
    squareMeters: 85,
    yearBuilt: 2015,
    amenities: ["airConditioning", "accessible"],
    images: ["https://images.unsplash.com/photo-1604014237800-1c9102c219da?w=800&h=600&fit=crop"],
    featuredImage: "https://images.unsplash.com/photo-1604014237800-1c9102c219da?w=800&h=600&fit=crop",
    soldDate: Date.now() - 35 * 24 * 60 * 60 * 1000, // 35 days ago
    soldPrice: 415000,
  },

  // Beer Sheva - Sold
  {
    title: "Sold: Old City Renovated Apartment",
    description: "Fully renovated apartment in Beer Sheva's historic old city. Unique character.",
    address: "5 Smilansky St",
    city: "Beer Sheva",
    latitude: 31.2456,
    longitude: 34.7923,
    propertyType: "residential",
    status: "sold",
    priceUsd: 180000,
    priceIls: Math.round(180000 * USD_TO_ILS_RATE),
    bedrooms: 2,
    bathrooms: 1,
    squareMeters: 65,
    yearBuilt: 1960,
    amenities: ["airConditioning", "renovated"],
    images: ["https://images.unsplash.com/photo-1460317442991-0ec209397118?w=800&h=600&fit=crop"],
    featuredImage: "https://images.unsplash.com/photo-1460317442991-0ec209397118?w=800&h=600&fit=crop",
    soldDate: Date.now() - 8 * 24 * 60 * 60 * 1000, // 8 days ago
    soldPrice: 185000,
  },
  {
    title: "Sold: New City Apartment",
    description: "Modern apartment in Beer Sheva's new residential quarter. Near BGU campus.",
    address: "15 Henrietta Szold St",
    city: "Beer Sheva",
    latitude: 31.2612,
    longitude: 34.8023,
    propertyType: "residential",
    status: "sold",
    priceUsd: 245000,
    priceIls: Math.round(245000 * USD_TO_ILS_RATE),
    bedrooms: 3,
    bathrooms: 1,
    squareMeters: 85,
    yearBuilt: 2019,
    amenities: ["airConditioning", "elevator", "parking", "safeRoom"],
    images: ["https://images.unsplash.com/photo-1495433324511-bf8e92934d90?w=800&h=600&fit=crop"],
    featuredImage: "https://images.unsplash.com/photo-1495433324511-bf8e92934d90?w=800&h=600&fit=crop",
    soldDate: Date.now() - 48 * 24 * 60 * 60 * 1000, // 48 days ago
    soldPrice: 242000,
  },

  // Eilat - Sold
  {
    title: "Sold: North Beach Hotel Unit",
    description: "Investment unit in hotel complex. Full hotel services, consistent rental income.",
    address: "1 HaPalmach St",
    city: "Eilat",
    latitude: 29.5523,
    longitude: 34.9534,
    propertyType: "residential",
    status: "sold",
    priceUsd: 320000,
    priceIls: Math.round(320000 * USD_TO_ILS_RATE),
    bedrooms: 1,
    bathrooms: 1,
    squareMeters: 52,
    yearBuilt: 2018,
    amenities: ["airConditioning", "pool", "gym", "security", "furnished"],
    images: ["https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&h=600&fit=crop"],
    featuredImage: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&h=600&fit=crop",
    soldDate: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
    soldPrice: 325000,
  },
  {
    title: "Sold: Lagoon Area Family Apartment",
    description: "Spacious apartment near Eilat lagoon. Family-friendly area with parks.",
    address: "18 Derech HaArava",
    city: "Eilat",
    latitude: 29.5612,
    longitude: 34.9478,
    propertyType: "residential",
    status: "sold",
    priceUsd: 480000,
    priceIls: Math.round(480000 * USD_TO_ILS_RATE),
    bedrooms: 4,
    bathrooms: 2,
    squareMeters: 120,
    yearBuilt: 2015,
    amenities: ["airConditioning", "parking", "storage", "balcony"],
    images: ["https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?w=800&h=600&fit=crop"],
    featuredImage: "https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?w=800&h=600&fit=crop",
    soldDate: Date.now() - 65 * 24 * 60 * 60 * 1000, // 65 days ago
    soldPrice: 472000,
  },
];

// Neighborhood data for 9 Israeli cities
export type SeedNeighborhood = {
  city: string;
  population?: number;
  avgPricePerSqm: number;
  priceChange1Year?: number;
  nearbyAmenities: string[];
  description?: string;
};

export const SEED_NEIGHBORHOODS: SeedNeighborhood[] = [
  {
    city: "Tel Aviv",
    population: 460000,
    avgPricePerSqm: 12500,
    priceChange1Year: 8.2,
    nearbyAmenities: ["beaches", "transit", "shopping", "restaurants", "parks"],
    description: "Israel's economic and cultural center, known for its vibrant nightlife, tech industry, and Mediterranean beaches.",
  },
  {
    city: "Jerusalem",
    population: 936000,
    avgPricePerSqm: 9800,
    priceChange1Year: 5.5,
    nearbyAmenities: ["schools", "hospitals", "shopping", "transit", "parks"],
    description: "Israel's capital and spiritual center, home to significant religious sites and a diverse population.",
  },
  {
    city: "Herzliya",
    population: 97000,
    avgPricePerSqm: 11200,
    priceChange1Year: 7.8,
    nearbyAmenities: ["beaches", "shopping", "parks", "hospitals", "transit"],
    description: "Upscale coastal city known for its tech park, marina, and affluent neighborhoods.",
  },
  {
    city: "Haifa",
    population: 285000,
    avgPricePerSqm: 6200,
    priceChange1Year: 6.3,
    nearbyAmenities: ["beaches", "transit", "hospitals", "schools", "parks"],
    description: "Major port city on Mount Carmel, home to the Technion and known for religious coexistence.",
  },
  {
    city: "Netanya",
    population: 221000,
    avgPricePerSqm: 5800,
    priceChange1Year: 9.1,
    nearbyAmenities: ["beaches", "shopping", "parks", "hospitals"],
    description: "Coastal resort city with beautiful beaches, popular with tourists and French-speaking immigrants.",
  },
  {
    city: "Ra'anana",
    population: 155000,
    avgPricePerSqm: 8900,
    priceChange1Year: 5.2,
    nearbyAmenities: ["schools", "parks", "shopping", "transit"],
    description: "Affluent city in the Sharon region, popular with English-speaking families and tech professionals.",
  },
  {
    city: "Ashdod",
    population: 225000,
    avgPricePerSqm: 4500,
    priceChange1Year: 10.5,
    nearbyAmenities: ["beaches", "shopping", "hospitals", "parks"],
    description: "Israel's largest port city with growing residential development and improving infrastructure.",
  },
  {
    city: "Beer Sheva",
    population: 210000,
    avgPricePerSqm: 3200,
    priceChange1Year: 12.8,
    nearbyAmenities: ["hospitals", "schools", "transit", "shopping"],
    description: "Capital of the Negev desert, home to Ben-Gurion University and a growing tech sector.",
  },
  {
    city: "Eilat",
    population: 52000,
    avgPricePerSqm: 5500,
    priceChange1Year: 4.2,
    nearbyAmenities: ["beaches", "shopping", "restaurants"],
    description: "Red Sea resort city with tax-free status, coral reefs, and year-round tourism.",
  },
];

// Price history data - 12 monthly data points per city (market averages)
export type SeedPriceHistory = {
  city: string;
  date: number;
  priceUsd: number;
  eventType: "listing" | "sale" | "market_avg";
};

// Generate price history for the past 12 months
function generatePriceHistory(): SeedPriceHistory[] {
  const history: SeedPriceHistory[] = [];
  const now = Date.now();
  const oneMonth = 30 * 24 * 60 * 60 * 1000;

  // Base prices per sqm for each city (at month 0, i.e., 12 months ago)
  const cityBasePrices: Record<string, { basePrice: number; monthlyGrowth: number }> = {
    "Tel Aviv": { basePrice: 11500, monthlyGrowth: 0.68 },
    "Jerusalem": { basePrice: 9300, monthlyGrowth: 0.46 },
    "Herzliya": { basePrice: 10400, monthlyGrowth: 0.65 },
    "Haifa": { basePrice: 5800, monthlyGrowth: 0.53 },
    "Netanya": { basePrice: 5300, monthlyGrowth: 0.76 },
    "Ra'anana": { basePrice: 8450, monthlyGrowth: 0.43 },
    "Ashdod": { basePrice: 4070, monthlyGrowth: 0.88 },
    "Beer Sheva": { basePrice: 2840, monthlyGrowth: 1.07 },
    "Eilat": { basePrice: 5280, monthlyGrowth: 0.35 },
  };

  for (const [city, { basePrice, monthlyGrowth }] of Object.entries(cityBasePrices)) {
    for (let monthsAgo = 11; monthsAgo >= 0; monthsAgo--) {
      const monthsFromStart = 11 - monthsAgo;
      const priceUsd = Math.round(basePrice * (1 + (monthlyGrowth / 100) * monthsFromStart));
      const date = now - (monthsAgo * oneMonth);

      history.push({
        city,
        date,
        priceUsd,
        eventType: "market_avg",
      });
    }
  }

  return history;
}

export const SEED_PRICE_HISTORY = generatePriceHistory();

// Service provider seed data
type Language = "english" | "hebrew" | "russian" | "french" | "spanish";

export type SeedServiceProvider = {
  name: string;
  email: string;
  role: "broker" | "mortgage_advisor" | "lawyer";
  imageUrl?: string;
  profile: {
    companyName?: string;
    licenseNumber?: string;
    yearsExperience?: number;
    specializations: string[];
    serviceAreas: string[];
    bio?: string;
    languages: Language[];
    phoneNumber?: string;
  };
};

export const SEED_SERVICE_PROVIDERS: SeedServiceProvider[] = [
  // Brokers
  {
    name: "David Cohen",
    email: "david.cohen@reosbrokers.com",
    role: "broker",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
    profile: {
      companyName: "Cohen Real Estate",
      licenseNumber: "BRK-12345",
      yearsExperience: 12,
      specializations: ["luxury", "investment", "residential"],
      serviceAreas: ["Tel Aviv", "Herzliya", "Ra'anana", "Netanya"],
      bio: "Specializing in luxury properties for international investors. 12 years of experience in the Israeli market.",
      languages: ["english", "hebrew", "french"],
      phoneNumber: "+972-52-123-4567",
    },
  },
  {
    name: "Sarah Levy",
    email: "sarah.levy@tlvproperties.com",
    role: "broker",
    imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face",
    profile: {
      companyName: "TLV Properties",
      licenseNumber: "BRK-23456",
      yearsExperience: 8,
      specializations: ["residential", "new_development", "first_time_buyers"],
      serviceAreas: ["Tel Aviv", "Herzliya", "Ramat Gan"],
      bio: "Helping families find their perfect home in the greater Tel Aviv area.",
      languages: ["english", "hebrew"],
      phoneNumber: "+972-52-234-5678",
    },
  },
  {
    name: "Michael Azoulay",
    email: "michael@jerusalemhomes.com",
    role: "broker",
    imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
    profile: {
      companyName: "Jerusalem Homes",
      licenseNumber: "BRK-34567",
      yearsExperience: 15,
      specializations: ["luxury", "historic", "investment"],
      serviceAreas: ["Jerusalem", "Beit Shemesh"],
      bio: "Jerusalem specialist with deep knowledge of historic neighborhoods.",
      languages: ["english", "hebrew", "french"],
      phoneNumber: "+972-52-345-6789",
    },
  },
  {
    name: "Rachel Ben-David",
    email: "rachel@haifarealty.com",
    role: "broker",
    imageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face",
    profile: {
      companyName: "Haifa Realty Group",
      licenseNumber: "BRK-45678",
      yearsExperience: 10,
      specializations: ["residential", "commercial", "student_housing"],
      serviceAreas: ["Haifa", "Acre", "Nahariya"],
      bio: "North Israel property expert, specializing in Haifa and surrounding areas.",
      languages: ["english", "hebrew", "russian"],
      phoneNumber: "+972-52-456-7890",
    },
  },
  {
    name: "Yosef Mizrachi",
    email: "yosef@southernproperties.com",
    role: "broker",
    imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face",
    profile: {
      companyName: "Southern Properties",
      licenseNumber: "BRK-56789",
      yearsExperience: 7,
      specializations: ["investment", "new_development", "commercial"],
      serviceAreas: ["Ashdod", "Ashkelon", "Beer Sheva", "Eilat"],
      bio: "Southern Israel specialist focusing on high-yield investment opportunities.",
      languages: ["english", "hebrew"],
      phoneNumber: "+972-52-567-8901",
    },
  },

  // Mortgage Advisors
  {
    name: "Natan Goldberg",
    email: "natan@mortgageisrael.com",
    role: "mortgage_advisor",
    imageUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop&crop=face",
    profile: {
      companyName: "Mortgage Israel",
      licenseNumber: "MGA-12345",
      yearsExperience: 14,
      specializations: ["foreign_buyers", "investment_properties", "refinancing"],
      serviceAreas: ["Tel Aviv", "Jerusalem", "Herzliya", "Ra'anana", "Netanya"],
      bio: "Expert in mortgage solutions for American and European investors.",
      languages: ["english", "hebrew"],
      phoneNumber: "+972-52-678-9012",
    },
  },
  {
    name: "Tamar Shapira",
    email: "tamar@homeloans.co.il",
    role: "mortgage_advisor",
    imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=face",
    profile: {
      companyName: "Home Loans Israel",
      licenseNumber: "MGA-23456",
      yearsExperience: 9,
      specializations: ["first_time_buyers", "residential", "government_programs"],
      serviceAreas: ["Tel Aviv", "Herzliya", "Haifa", "Netanya", "Ashdod"],
      bio: "Helping families navigate the Israeli mortgage system with personalized solutions.",
      languages: ["english", "hebrew", "spanish"],
      phoneNumber: "+972-52-789-0123",
    },
  },
  {
    name: "Avi Rosenberg",
    email: "avi@finansim.co.il",
    role: "mortgage_advisor",
    imageUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop&crop=face",
    profile: {
      companyName: "Finansim Consulting",
      licenseNumber: "MGA-34567",
      yearsExperience: 20,
      specializations: ["commercial", "investment_properties", "large_portfolios"],
      serviceAreas: ["Tel Aviv", "Jerusalem", "Haifa", "Beer Sheva", "Eilat"],
      bio: "Two decades of experience in commercial and investment property financing.",
      languages: ["english", "hebrew", "french"],
      phoneNumber: "+972-52-890-1234",
    },
  },

  // Lawyers
  {
    name: "Dr. Ruth Katz",
    email: "ruth.katz@katzlaw.co.il",
    role: "lawyer",
    imageUrl: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=200&h=200&fit=crop&crop=face",
    profile: {
      companyName: "Katz & Partners Law Firm",
      licenseNumber: "LAW-12345",
      yearsExperience: 18,
      specializations: ["real_estate", "contracts", "international_transactions"],
      serviceAreas: ["Tel Aviv", "Jerusalem", "Herzliya", "Ra'anana"],
      bio: "Senior real estate attorney specializing in international property transactions.",
      languages: ["english", "hebrew", "french"],
      phoneNumber: "+972-52-901-2345",
    },
  },
  {
    name: "Daniel Peretz",
    email: "daniel@peretzlaw.com",
    role: "lawyer",
    imageUrl: "https://images.unsplash.com/photo-1556157382-97ede2916cd7?w=200&h=200&fit=crop&crop=face",
    profile: {
      companyName: "Peretz Legal Services",
      licenseNumber: "LAW-23456",
      yearsExperience: 12,
      specializations: ["real_estate", "taxation", "corporate"],
      serviceAreas: ["Tel Aviv", "Herzliya", "Netanya", "Haifa"],
      bio: "Expert in real estate law and tax optimization for property investments.",
      languages: ["english", "hebrew"],
      phoneNumber: "+972-52-012-3456",
    },
  },
  {
    name: "Miriam Levi",
    email: "miriam@southlegal.co.il",
    role: "lawyer",
    imageUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=face",
    profile: {
      companyName: "South Legal Associates",
      licenseNumber: "LAW-34567",
      yearsExperience: 8,
      specializations: ["real_estate", "contracts", "disputes"],
      serviceAreas: ["Ashdod", "Ashkelon", "Beer Sheva", "Eilat"],
      bio: "Southern Israel real estate law specialist with focus on buyer protection.",
      languages: ["english", "hebrew", "russian"],
      phoneNumber: "+972-52-123-4567",
    },
  },
];

// Sample deals seed data
// Note: Deals require real user IDs and property IDs which are assigned at seed time
// These templates define the deal configurations to be created
export type SeedDeal = {
  // Property index from SEED_PROPERTIES (will be resolved to actual ID at seed time)
  propertyIndex: number;
  // Stage of the deal
  stage: "interest" | "broker_assigned" | "mortgage" | "legal" | "closing" | "completed" | "cancelled";
  // Optional offer price
  offerPrice?: number;
  // Notes about the deal
  notes?: string;
  // How many days ago the deal was created (for realistic timestamps)
  daysAgo: number;
};

export const SEED_DEALS: SeedDeal[] = [
  {
    propertyIndex: 0, // Modern Penthouse in Tel Aviv
    stage: "broker_assigned",
    offerPrice: 1800000,
    notes: "Serious buyer, negotiating terms",
    daysAgo: 14,
  },
  {
    propertyIndex: 3, // Historic Stone Villa in Jerusalem
    stage: "mortgage",
    offerPrice: 2050000,
    notes: "Pre-approved for financing, processing mortgage application",
    daysAgo: 21,
  },
  {
    propertyIndex: 5, // Luxury Marina Apartment in Herzliya
    stage: "legal",
    offerPrice: 1420000,
    notes: "Contract review in progress",
    daysAgo: 30,
  },
  {
    propertyIndex: 9, // Beachfront Studio in Netanya
    stage: "interest",
    notes: "Initial inquiry, requested more information",
    daysAgo: 3,
  },
  {
    propertyIndex: 12, // New Development Apartment in Ashdod
    stage: "completed",
    offerPrice: 315000,
    notes: "Deal closed successfully",
    daysAgo: 45,
  },
];

// Deal flow scenarios for comprehensive seeding
// Each scenario includes deal config, provider assignments, and message templates
export type SeedDealScenario = {
  propertyIndex: number;
  stage: "interest" | "broker_assigned" | "mortgage" | "legal" | "closing" | "completed" | "cancelled";
  offerPrice?: number;
  notes?: string;
  daysAgo: number;
  // Provider assignments by email (matched from SEED_SERVICE_PROVIDERS)
  brokerEmail?: string;
  mortgageAdvisorEmail?: string;
  lawyerEmail?: string;
  // Message thread IDs to include (indexes into SEED_MESSAGE_TEMPLATES)
  messageThreads: number[];
};

export const SEED_DEAL_SCENARIOS: SeedDealScenario[] = [
  // Deal 1: Interest stage - just started, no providers yet
  {
    propertyIndex: 1, // Boutique Investment Apartment - Tel Aviv
    stage: "interest",
    notes: "Just discovered this property, want to learn more",
    daysAgo: 2,
    messageThreads: [],
  },
  // Deal 2: Broker assigned - working with broker
  {
    propertyIndex: 2, // Commercial Space - Prime Retail - Tel Aviv
    stage: "broker_assigned",
    offerPrice: 880000,
    notes: "Negotiating terms with seller through broker",
    daysAgo: 8,
    brokerEmail: "david.cohen@reosbrokers.com",
    messageThreads: [0], // broker intro thread
  },
  // Deal 3: Mortgage stage - broker + mortgage advisor
  {
    propertyIndex: 4, // German Colony Investment Apartment - Jerusalem
    stage: "mortgage",
    offerPrice: 760000,
    notes: "Mortgage pre-approval in progress",
    daysAgo: 18,
    brokerEmail: "michael@jerusalemhomes.com",
    mortgageAdvisorEmail: "natan@mortgageisrael.com",
    messageThreads: [1, 2], // broker + mortgage threads
  },
  // Deal 4: Legal stage - all providers assigned
  {
    propertyIndex: 6, // Tech Park Office Space - Herzliya
    stage: "legal",
    offerPrice: 635000,
    notes: "Contract under legal review",
    daysAgo: 25,
    brokerEmail: "sarah.levy@tlvproperties.com",
    mortgageAdvisorEmail: "tamar@homeloans.co.il",
    lawyerEmail: "ruth.katz@katzlaw.co.il",
    messageThreads: [3, 4, 5], // broker + mortgage + lawyer threads
  },
  // Deal 5: Closing stage - final steps
  {
    propertyIndex: 7, // Carmel Mountain View Apartment - Haifa
    stage: "closing",
    offerPrice: 410000,
    notes: "Closing scheduled for next week",
    daysAgo: 35,
    brokerEmail: "rachel@haifarealty.com",
    mortgageAdvisorEmail: "avi@finansim.co.il",
    lawyerEmail: "daniel@peretzlaw.com",
    messageThreads: [6, 7, 8], // closing threads
  },
  // Deal 6: Completed deal
  {
    propertyIndex: 10, // Family Home Near Poleg Beach - Netanya
    stage: "completed",
    offerPrice: 705000,
    notes: "Successfully closed! Keys handed over.",
    daysAgo: 60,
    brokerEmail: "david.cohen@reosbrokers.com",
    mortgageAdvisorEmail: "tamar@homeloans.co.il",
    lawyerEmail: "daniel@peretzlaw.com",
    messageThreads: [9, 10, 11],
  },
  // Deal 7: Another interest stage
  {
    propertyIndex: 11, // Garden Apartment in Ra'anana
    stage: "interest",
    notes: "Interested in family-friendly neighborhood",
    daysAgo: 1,
    messageThreads: [],
  },
  // Deal 8: Cancelled deal
  {
    propertyIndex: 13, // Student Housing Investment - Beer Sheva
    stage: "cancelled",
    offerPrice: 265000,
    notes: "Decided not to proceed - found better opportunity",
    daysAgo: 20,
    brokerEmail: "yosef@southernproperties.com",
    messageThreads: [12],
  },
  // Deal 9: Mortgage stage with different providers
  {
    propertyIndex: 14, // Resort Vacation Condo - Eilat
    stage: "mortgage",
    offerPrice: 375000,
    notes: "Vacation rental investment, arranging financing",
    daysAgo: 15,
    brokerEmail: "yosef@southernproperties.com",
    mortgageAdvisorEmail: "avi@finansim.co.il",
    messageThreads: [13, 14],
  },
  // Deal 10: Legal stage
  {
    propertyIndex: 8, // Downtown Haifa Mixed-Use Building
    stage: "legal",
    offerPrice: 860000,
    notes: "Due diligence on commercial tenants",
    daysAgo: 28,
    brokerEmail: "rachel@haifarealty.com",
    mortgageAdvisorEmail: "natan@mortgageisrael.com",
    lawyerEmail: "miriam@southlegal.co.il",
    messageThreads: [15, 16, 17],
  },
];

// Message templates for seeding conversations between investors and providers
export type SeedMessageThread = {
  providerRole: "broker" | "mortgage_advisor" | "lawyer";
  messages: Array<{
    fromInvestor: boolean;
    content: string;
    offsetMinutes: number; // offset from thread start
  }>;
};

export const SEED_MESSAGE_TEMPLATES: SeedMessageThread[] = [
  // Thread 0: Broker intro for commercial property
  {
    providerRole: "broker",
    messages: [
      { fromInvestor: true, content: "Hi, I'm interested in the commercial space on King George. Is it still available?", offsetMinutes: 0 },
      { fromInvestor: false, content: "Yes, it's available! Great location with high foot traffic. The current tenant lease has 3 years remaining. Would you like to schedule a viewing?", offsetMinutes: 15 },
      { fromInvestor: true, content: "Yes please. I'm also curious about the rental income history.", offsetMinutes: 45 },
      { fromInvestor: false, content: "The property has been consistently rented for 8 years. I'll send over the rental history. How does Thursday at 2pm work for viewing?", offsetMinutes: 60 },
      { fromInvestor: true, content: "Thursday works. See you then!", offsetMinutes: 90 },
    ],
  },
  // Thread 1: Broker for Jerusalem property
  {
    providerRole: "broker",
    messages: [
      { fromInvestor: true, content: "I saw your listing for the German Colony apartment. I'm relocating from the US and this looks perfect.", offsetMinutes: 0 },
      { fromInvestor: false, content: "Welcome! The German Colony is wonderful for American families. This particular unit was just renovated. When are you planning to move?", offsetMinutes: 20 },
      { fromInvestor: true, content: "We're looking at early next year. Is there flexibility on the price?", offsetMinutes: 60 },
      { fromInvestor: false, content: "The seller is motivated. I think we have room for negotiation. Let me set up a video call to discuss the property in detail.", offsetMinutes: 90 },
    ],
  },
  // Thread 2: Mortgage advisor conversation
  {
    providerRole: "mortgage_advisor",
    messages: [
      { fromInvestor: false, content: "Hi! Michael mentioned you're looking at the German Colony property. I specialize in helping American buyers with Israeli mortgages.", offsetMinutes: 0 },
      { fromInvestor: true, content: "Yes! I'm not sure how Israeli mortgages work compared to the US.", offsetMinutes: 30 },
      { fromInvestor: false, content: "It's quite different. Israeli banks typically finance up to 50% for foreign residents, and we'll need to structure the loan in ILS or USD. What's your budget?", offsetMinutes: 45 },
      { fromInvestor: true, content: "I'm planning to put down about 400k USD and finance the rest.", offsetMinutes: 120 },
      { fromInvestor: false, content: "That works well. With 50% down, you'll get the best rates. I'll prepare a comparison of offers from Bank Leumi, Mizrachi, and Discount.", offsetMinutes: 150 },
    ],
  },
  // Thread 3: Broker for Herzliya tech park
  {
    providerRole: "broker",
    messages: [
      { fromInvestor: true, content: "I'm interested in the tech park office space. Is this good for a startup?", offsetMinutes: 0 },
      { fromInvestor: false, content: "Absolutely! It's right in the heart of Herzliya tech hub. Many startups and established tech companies nearby. Open floor plan with great natural light.", offsetMinutes: 25 },
      { fromInvestor: true, content: "What about parking? My team will need several spots.", offsetMinutes: 60 },
      { fromInvestor: false, content: "The unit comes with 4 parking spots included. Additional spots can be leased from the building management.", offsetMinutes: 80 },
      { fromInvestor: true, content: "That sounds good. Let's move forward with the offer.", offsetMinutes: 180 },
    ],
  },
  // Thread 4: Mortgage for Herzliya
  {
    providerRole: "mortgage_advisor",
    messages: [
      { fromInvestor: false, content: "Sarah mentioned you're purchasing the tech park office. I can help with commercial property financing.", offsetMinutes: 0 },
      { fromInvestor: true, content: "Great, what are the rates for commercial properties?", offsetMinutes: 45 },
      { fromInvestor: false, content: "Commercial rates are typically 0.5-1% higher than residential. For this property, I'm seeing around 4.5-5% fixed. How much financing do you need?", offsetMinutes: 60 },
      { fromInvestor: true, content: "I'd like to finance about 60% if possible.", offsetMinutes: 120 },
      { fromInvestor: false, content: "We can do that with strong financials. I'll need your last 3 years of tax returns and a business plan for the space.", offsetMinutes: 150 },
    ],
  },
  // Thread 5: Lawyer for Herzliya
  {
    providerRole: "lawyer",
    messages: [
      { fromInvestor: false, content: "I've received the purchase contract for the tech park property. I'm reviewing it now and will have comments within 48 hours.", offsetMinutes: 0 },
      { fromInvestor: true, content: "Thank you! Anything concerning so far?", offsetMinutes: 60 },
      { fromInvestor: false, content: "The main issue is the parking rights - they're listed as leasehold rather than ownership. I'm negotiating to convert them to ownership.", offsetMinutes: 180 },
      { fromInvestor: true, content: "That would be better for resale value. Thanks for catching that.", offsetMinutes: 240 },
      { fromInvestor: false, content: "Exactly. I'll update you once I hear back from seller's counsel.", offsetMinutes: 270 },
    ],
  },
  // Thread 6: Broker for Haifa closing
  {
    providerRole: "broker",
    messages: [
      { fromInvestor: false, content: "Great news! The seller accepted our counter-offer of 410k. We're moving to closing!", offsetMinutes: 0 },
      { fromInvestor: true, content: "That's wonderful! What are the next steps?", offsetMinutes: 30 },
      { fromInvestor: false, content: "I'll coordinate with the mortgage advisor and lawyer. Closing is scheduled for next week. We need to arrange the key handover.", offsetMinutes: 45 },
      { fromInvestor: true, content: "I can fly in for the closing. Will everything be ready by then?", offsetMinutes: 120 },
      { fromInvestor: false, content: "Yes, all paperwork is being finalized. I'll send you the closing checklist.", offsetMinutes: 150 },
    ],
  },
  // Thread 7: Mortgage for Haifa closing
  {
    providerRole: "mortgage_advisor",
    messages: [
      { fromInvestor: false, content: "The bank has approved the final disbursement. Funds will be transferred on closing day.", offsetMinutes: 0 },
      { fromInvestor: true, content: "Perfect! Do I need to sign anything else?", offsetMinutes: 60 },
      { fromInvestor: false, content: "Just the final closing documents. Everything else is in order. You'll get a great rate at 4.2%.", offsetMinutes: 90 },
    ],
  },
  // Thread 8: Lawyer for Haifa closing
  {
    providerRole: "lawyer",
    messages: [
      { fromInvestor: false, content: "All documents are ready for closing. The title transfer will be registered with Tabu within 3 business days after closing.", offsetMinutes: 0 },
      { fromInvestor: true, content: "Thanks for handling everything smoothly.", offsetMinutes: 45 },
      { fromInvestor: false, content: "My pleasure! See you at the signing.", offsetMinutes: 60 },
    ],
  },
  // Thread 9: Completed deal - broker
  {
    providerRole: "broker",
    messages: [
      { fromInvestor: false, content: "Congratulations on your new home! It was a pleasure working with you.", offsetMinutes: 0 },
      { fromInvestor: true, content: "Thank you so much for all your help! The kids love the beach already.", offsetMinutes: 120 },
      { fromInvestor: false, content: "So happy to hear that! Don't hesitate to reach out if you ever need anything.", offsetMinutes: 180 },
    ],
  },
  // Thread 10: Completed deal - mortgage
  {
    providerRole: "mortgage_advisor",
    messages: [
      { fromInvestor: false, content: "Your first mortgage payment has been set up. Let me know if you have any questions about the repayment schedule.", offsetMinutes: 0 },
      { fromInvestor: true, content: "Got it, thank you for making the process so easy!", offsetMinutes: 60 },
    ],
  },
  // Thread 11: Completed deal - lawyer
  {
    providerRole: "lawyer",
    messages: [
      { fromInvestor: false, content: "The property is now officially registered in your name. I'll send the final documentation package by courier.", offsetMinutes: 0 },
      { fromInvestor: true, content: "Excellent! Thanks for your diligence throughout.", offsetMinutes: 90 },
    ],
  },
  // Thread 12: Cancelled deal - broker
  {
    providerRole: "broker",
    messages: [
      { fromInvestor: true, content: "I've decided not to proceed with the Beer Sheva property. Found something closer to my work.", offsetMinutes: 0 },
      { fromInvestor: false, content: "I understand completely. Let me know if you need help with your new search!", offsetMinutes: 30 },
      { fromInvestor: true, content: "Will do, thanks for understanding.", offsetMinutes: 60 },
    ],
  },
  // Thread 13: Eilat broker
  {
    providerRole: "broker",
    messages: [
      { fromInvestor: true, content: "Looking at the Eilat condo as a vacation rental investment. What are the typical occupancy rates?", offsetMinutes: 0 },
      { fromInvestor: false, content: "Eilat properties see 70-80% occupancy during peak season. The resort complex handles rentals for owners.", offsetMinutes: 30 },
      { fromInvestor: true, content: "That's better than I expected. Let's put in an offer.", offsetMinutes: 120 },
      { fromInvestor: false, content: "Great! I'll prepare the paperwork. The tax-free status makes this extra attractive.", offsetMinutes: 150 },
    ],
  },
  // Thread 14: Eilat mortgage
  {
    providerRole: "mortgage_advisor",
    messages: [
      { fromInvestor: false, content: "For investment properties in Eilat, banks typically require 40% down. I can work with Bank Mizrachi on this.", offsetMinutes: 0 },
      { fromInvestor: true, content: "40% is doable. What documents do you need?", offsetMinutes: 45 },
      { fromInvestor: false, content: "I'll send you the checklist. Main items are proof of income, bank statements, and passport copies.", offsetMinutes: 60 },
    ],
  },
  // Thread 15: Haifa mixed-use broker
  {
    providerRole: "broker",
    messages: [
      { fromInvestor: true, content: "The mixed-use building in Haifa looks interesting. What's the tenant situation?", offsetMinutes: 0 },
      { fromInvestor: false, content: "Ground floor is a cafe with 5 years remaining on lease. Upper units are residential, all occupied with long-term tenants.", offsetMinutes: 20 },
      { fromInvestor: true, content: "What's the total monthly income?", offsetMinutes: 60 },
      { fromInvestor: false, content: "Combined rent is 7,800 USD monthly. Very stable cash flow.", offsetMinutes: 75 },
      { fromInvestor: true, content: "Let's proceed with due diligence.", offsetMinutes: 180 },
    ],
  },
  // Thread 16: Haifa mixed-use mortgage
  {
    providerRole: "mortgage_advisor",
    messages: [
      { fromInvestor: false, content: "Mixed-use properties require commercial underwriting. I'm working with Discount Bank on your application.", offsetMinutes: 0 },
      { fromInvestor: true, content: "How long does commercial underwriting typically take?", offsetMinutes: 60 },
      { fromInvestor: false, content: "Usually 3-4 weeks. The existing tenants with long leases actually help your case.", offsetMinutes: 90 },
    ],
  },
  // Thread 17: Haifa mixed-use lawyer
  {
    providerRole: "lawyer",
    messages: [
      { fromInvestor: false, content: "I'm reviewing the lease agreements with current tenants. Important to understand the terms before purchase.", offsetMinutes: 0 },
      { fromInvestor: true, content: "Any red flags?", offsetMinutes: 120 },
      { fromInvestor: false, content: "The commercial lease is solid. One residential tenant has month-to-month - might want to lock that in.", offsetMinutes: 180 },
      { fromInvestor: true, content: "Good catch. Can we make that a condition of closing?", offsetMinutes: 240 },
      { fromInvestor: false, content: "Absolutely. I'll add it to the purchase agreement.", offsetMinutes: 270 },
    ],
  },
];
