import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import * as fs from "fs";
import * as path from "path";
import * as https from "https";
import * as http from "http";

// Scraped property data from JPost and Yad2
const scrapedProperties = [
  // JPost listings
  {
    title: "Luxury Villa in Rishpon",
    address: "Rishpon",
    city: "Rishpon",
    priceIls: 19000000,
    bedrooms: 5,
    bathrooms: 3,
    squareMeters: 300,
    propertyType: "residential" as const,
    description: "A luxurious villa for sale in Rishpon with premium finishes, spacious rooms, and beautiful garden. Perfect for families looking for upscale living in a prestigious neighborhood.",
    latitude: 32.201856,
    longitude: 34.824723,
    images: ["https://realestate.jpost.com/wp-content/uploads/2025/12/WhatsApp-Image-2025-11-25-at-16.18.36-eyal-katz.jpeg"],
    yearBuilt: 2020,
  },
  {
    title: "Mini Penthouse with Panoramic Views",
    address: "Hashofet Chaim Cohen St., Jerusalem",
    city: "Jerusalem",
    priceIls: 7400000,
    bedrooms: 3,
    bathrooms: 2,
    squareMeters: 151,
    propertyType: "residential" as const,
    description: "Sophisticated mini penthouse with great views from all exposures. High-end finishes throughout with modern design. Located in prime Jerusalem location.",
    latitude: 31.7458457,
    longitude: 35.2191009,
    images: ["https://realestate.jpost.com/wp-content/uploads/2025/12/תוכניות-אדריכליות-כללי-min-Natalia-Volkov.jpg"],
    yearBuilt: 2023,
  },
  {
    title: "Semi-Detached House in Yavniel",
    address: "Yavniel",
    city: "Yavniel",
    priceIls: 5100000,
    bedrooms: 4,
    bathrooms: 2,
    squareMeters: 250,
    propertyType: "residential" as const,
    description: "Beautiful semi-detached house on 2 floors in the scenic village of Yavniel. Spacious layout with mountain views and private garden.",
    latitude: 32.7037641,
    longitude: 35.5062245,
    images: ["https://realestate.jpost.com/wp-content/uploads/2025/12/IMG_4599-Jacqueline-Perle-1.jpeg"],
    yearBuilt: 2018,
  },
  {
    title: "Penthouse with Temple Mount View",
    address: "Arnona, Jerusalem",
    city: "Jerusalem",
    priceIls: 8500000,
    bedrooms: 3,
    bathrooms: 2,
    squareMeters: 153,
    propertyType: "residential" as const,
    description: "Spectacular penthouse with breathtaking views of the Temple Mount and the Dead Sea. Premium location in Jerusalem with world-class amenities.",
    latitude: 31.7458457,
    longitude: 35.2191009,
    images: ["https://realestate.jpost.com/wp-content/uploads/2025/12/Hashofet-Chaim-Cohen-East-mini-penthouse-23rd-floor-11-scaled-Natalia-Volkov.jpg"],
    yearBuilt: 2022,
  },
  {
    title: "Modern Apartment in Arnona Tower",
    address: "Arnona, Jerusalem",
    city: "Jerusalem",
    priceIls: 3800000,
    bedrooms: 2,
    bathrooms: 1,
    squareMeters: 96,
    propertyType: "residential" as const,
    description: "New 3BR resale in Arnona luxury tower. Modern finishes, great views, and premium building amenities including gym and lobby.",
    latitude: 31.7458457,
    longitude: 35.2191009,
    images: ["https://realestate.jpost.com/wp-content/uploads/2025/12/y2_1pa_010477_20240518221307-scaled-Natalia-Volkov.jpeg"],
    yearBuilt: 2024,
  },
  {
    title: "German Colony Pre-Construction Apartment",
    address: "Hamagid Street, German Colony, Jerusalem",
    city: "Jerusalem",
    priceIls: 5950000,
    bedrooms: 3,
    bathrooms: 2,
    squareMeters: 101,
    propertyType: "residential" as const,
    description: "Pre-construction opportunity in the prestigious German Colony. 101 sqm on Hamagid Street with balcony and modern design.",
    latitude: 31.7657597,
    longitude: 35.220131,
    images: ["https://realestate.jpost.com/wp-content/uploads/2025/12/Hamagid6-furnished-balcony-Natalia-Volkov.jpeg"],
    yearBuilt: 2026,
  },
  {
    title: "Old Katamon Park View Apartment",
    address: "Old Katamon, Jerusalem",
    city: "Jerusalem",
    priceIls: 12140000,
    bedrooms: 4,
    bathrooms: 3,
    squareMeters: 194,
    propertyType: "residential" as const,
    description: "Pre-development opportunity in Old Katamon by the park. Spacious 4-bedroom apartment with stunning park views.",
    latitude: 31.7768831,
    longitude: 35.2224346,
    images: ["https://realestate.jpost.com/wp-content/uploads/2025/12/Building-Illustrauion-Old-Katamon-1-Natalia-Volkov.jpeg"],
    yearBuilt: 2026,
  },
  {
    title: "Kiryat Moshe Premium Apartment",
    address: "Rova 1, Kiryat Moshe, Jerusalem",
    city: "Jerusalem",
    priceIls: 8990000,
    bedrooms: 5,
    bathrooms: 3,
    squareMeters: 210,
    propertyType: "residential" as const,
    description: "Rare luxury 210sqm listing in Kiryat Moshe - 'Rova 1' premium project. High-end finishes and exclusive amenities.",
    latitude: 31.7855031,
    longitude: 35.1966557,
    images: ["https://realestate.jpost.com/wp-content/uploads/2025/11/רובע-אחד-הדמיה_-min-Natalia-Volkov-1.jpeg"],
    yearBuilt: 2025,
  },
  {
    title: "Magshimim Country Estate",
    address: "Moshav Magshimim",
    city: "Magshimim",
    priceIls: 18500000,
    bedrooms: 4,
    bathrooms: 3,
    squareMeters: 320,
    propertyType: "residential" as const,
    description: "Spacious country estate property in Moshav Magshimim, Central Israel. Large plot with beautiful landscaping.",
    latitude: 32.0506884,
    longitude: 34.9023182,
    images: ["https://realestate.jpost.com/wp-content/uploads/2025/11/WhatsApp-Image-2025-11-27-at-13.27.58-3-Jessica-Kamir.jpeg"],
    yearBuilt: 2019,
  },
  {
    title: "Galilee Mountain Villa",
    address: "Kfar Shamay",
    city: "Kfar Shamay",
    priceIls: 8500000,
    bedrooms: 7,
    bathrooms: 4,
    squareMeters: 500,
    propertyType: "residential" as const,
    description: "A beautiful vacation villa in the green mountains of the Galilee, surrounded by lush trees overlooking the mountains of Meron.",
    latitude: 32.955698,
    longitude: 35.457916,
    images: ["https://realestate.jpost.com/wp-content/uploads/2025/11/9-Isaac-Nuri.jpeg"],
    yearBuilt: 2015,
  },
  {
    title: "Garden Apartment in Kiryat Shmuel",
    address: "Kiryat Shmuel, Jerusalem",
    city: "Jerusalem",
    priceIls: 7700000,
    bedrooms: 4,
    bathrooms: 2,
    squareMeters: 150,
    propertyType: "residential" as const,
    description: "Stunning new garden apartment in Kiryat Shmuel on the border of Rechavia. Contemporary design with private garden.",
    latitude: 31.7768831,
    longitude: 35.2224346,
    images: ["https://realestate.jpost.com/wp-content/uploads/2025/11/1-Kenny-Sherman.jpg"],
    yearBuilt: 2024,
  },
  {
    title: "Telz Stone Garden Apartment",
    address: "Telz Stone, Kiryat Ye'arim",
    city: "Kiryat Ye'arim",
    priceIls: 4550000,
    bedrooms: 4,
    bathrooms: 2,
    squareMeters: 142,
    propertyType: "residential" as const,
    description: "Beautiful and spacious garden apartment in the Telz Stone community. Family-friendly neighborhood with great schools.",
    latitude: 31.8049549,
    longitude: 35.151392,
    images: ["https://realestate.jpost.com/wp-content/uploads/2025/11/noi9the5vgYk0gwJDPFL_17622535648286-אורטל-מצליח.jpg"],
    yearBuilt: 2017,
  },
  {
    title: "German Colony Garden Apartment",
    address: "German Colony, Jerusalem",
    city: "Jerusalem",
    priceIls: 5800000,
    bedrooms: 1,
    bathrooms: 1,
    squareMeters: 90,
    propertyType: "residential" as const,
    description: "Charming garden apartment in the German Colony with 90 sqm living space and 77 sqm private garden.",
    latitude: 31.7768831,
    longitude: 35.22243460000001,
    images: ["https://realestate.jpost.com/wp-content/uploads/2025/11/IMG_3200-טפרברג-נכסים.jpg"],
    yearBuilt: 2010,
  },
  // Yad2 listings
  {
    title: "Family Apartment in Lahavim",
    address: "Agur 26, Lahavim",
    city: "Lahavim",
    priceIls: 2850000,
    bedrooms: 4,
    bathrooms: 2,
    squareMeters: 159,
    propertyType: "residential" as const,
    description: "Spacious ground floor apartment in the quiet and green town of Lahavim. Perfect for families with children.",
    latitude: 31.3747,
    longitude: 34.8242,
    images: ["https://img.yad2.co.il/Pic/202601/24/2_1/o/y2_1pa_010326_20260124193714.jpeg"],
    yearBuilt: 2015,
  },
  {
    title: "Modern Penthouse in Tel Aviv",
    address: "Modigliani 12, Tel Aviv",
    city: "Tel Aviv",
    priceIls: 4650000,
    bedrooms: 3,
    bathrooms: 2,
    squareMeters: 75,
    propertyType: "residential" as const,
    description: "Modern 2.5 room apartment on the 3rd floor in central Tel Aviv. Walking distance to Rothschild Boulevard.",
    latitude: 32.0853,
    longitude: 34.7818,
    images: ["https://img.yad2.co.il/Pic/202601/23/2_1/o/y2_1_05256_20260123160117.jpeg"],
    yearBuilt: 2020,
  },
  {
    title: "Large Family Home in Or Akiva",
    address: "Kerem 13, Or Akiva",
    city: "Or Akiva",
    priceIls: 4600000,
    bedrooms: 7,
    bathrooms: 3,
    squareMeters: 250,
    propertyType: "residential" as const,
    description: "Spacious 7-room family home with large garden. Ground floor with direct access. Great for large families.",
    latitude: 32.5063,
    longitude: 34.9172,
    images: ["https://img.yad2.co.il/Pic/202601/23/2_1/o/y2_1pa_010198_20260123102428.jpeg"],
    yearBuilt: 2012,
  },
  {
    title: "Penthouse in Modiin",
    address: "Ofroni 9, Modiin",
    city: "Modiin",
    priceIls: 5400000,
    bedrooms: 4,
    bathrooms: 2,
    squareMeters: 500,
    propertyType: "residential" as const,
    description: "Stunning penthouse on the 4th floor in Modiin Maccabim. 500 sqm of luxury living with panoramic views.",
    latitude: 31.8977,
    longitude: 35.0104,
    images: ["https://img.yad2.co.il/Pic/202601/20/2_1/o/y2_1pa_010481_20260120112947.jpeg"],
    yearBuilt: 2021,
  },
  {
    title: "Desert Retreat in Mitzpe Ramon",
    address: "Har Tzin 2, Mitzpe Ramon",
    city: "Mitzpe Ramon",
    priceIls: 790000,
    bedrooms: 8,
    bathrooms: 4,
    squareMeters: 498,
    propertyType: "residential" as const,
    description: "Unique property in Mitzpe Ramon overlooking the Ramon Crater. Perfect for a desert retreat or B&B business.",
    latitude: 30.6095,
    longitude: 34.8014,
    images: ["https://img.yad2.co.il/Pic/202511/23/2_1/o/y2_1pa_010583_20251123102454.jpeg"],
    yearBuilt: 2000,
  },
  {
    title: "Affordable Apartment in Dimona",
    address: "Merhavim 1332, Dimona",
    city: "Dimona",
    priceIls: 560000,
    bedrooms: 3,
    bathrooms: 1,
    squareMeters: 80,
    propertyType: "residential" as const,
    description: "Affordable 3-room apartment on the 4th floor in Dimona. Great investment opportunity in southern Israel.",
    latitude: 31.0697,
    longitude: 35.0328,
    images: ["https://img.yad2.co.il/Pic/202601/22/2_1/o/y2_1_04086_20260122210440.jpeg"],
    yearBuilt: 1985,
  },
  {
    title: "Luxury Villa in Baka Jerusalem",
    address: "Baka, Jerusalem",
    city: "Jerusalem",
    priceIls: 25000000,
    bedrooms: 6,
    bathrooms: 5,
    squareMeters: 768,
    propertyType: "residential" as const,
    description: "One-of-a-kind luxury villa in the heart of Baka. Distinctive architecture with premium finishes throughout. Private garden and pool.",
    latitude: 31.7768831,
    longitude: 35.22243460000001,
    images: ["https://realestate.jpost.com/wp-content/uploads/2025/12/Baka-Jerusalem-private-house-for-sale-3-Natalia-Volkov-1.jpeg"],
    yearBuilt: 2018,
  },
];

// Convert ILS to USD (approximate rate)
const ILS_TO_USD_RATE = 0.27;

async function downloadImage(url: string, filename: string): Promise<Buffer | null> {
  return new Promise((resolve) => {
    const protocol = url.startsWith("https") ? https : http;

    const request = protocol.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "Accept": "image/webp,image/apng,image/*,*/*;q=0.8",
      },
      timeout: 30000,
    }, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          downloadImage(redirectUrl, filename).then(resolve);
          return;
        }
      }

      if (response.statusCode !== 200) {
        console.log(`Failed to download ${filename}: HTTP ${response.statusCode}`);
        resolve(null);
        return;
      }

      const chunks: Buffer[] = [];
      response.on("data", (chunk) => chunks.push(chunk));
      response.on("end", () => resolve(Buffer.concat(chunks)));
      response.on("error", () => resolve(null));
    });

    request.on("error", () => resolve(null));
    request.on("timeout", () => {
      request.destroy();
      resolve(null);
    });
  });
}

async function main() {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    console.error("NEXT_PUBLIC_CONVEX_URL not set");
    process.exit(1);
  }

  const client = new ConvexHttpClient(convexUrl);

  console.log(`Processing ${scrapedProperties.length} properties...`);

  // First, create a system user for seeding
  console.log("Getting or creating system user...");

  // We'll use the seed:seedProperties mutation which handles user creation
  // But first let's create properties directly

  let successCount = 0;
  let failCount = 0;

  for (const property of scrapedProperties) {
    try {
      console.log(`\nProcessing: ${property.title}`);

      // Download the first image
      let featuredImage = property.images[0];
      const imageBuffer = await downloadImage(property.images[0], `${property.city}-property.jpg`);

      if (imageBuffer) {
        console.log(`  Downloaded image (${imageBuffer.length} bytes)`);
        // For now, we'll use the original URL since uploading requires authentication
        // In production, you'd upload to Convex storage
      } else {
        console.log(`  Could not download image, using placeholder`);
        featuredImage = `https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop`;
      }

      // Calculate USD price
      const priceUsd = Math.round(property.priceIls * ILS_TO_USD_RATE);

      // Calculate estimated monthly rent (roughly 0.3-0.4% of property value)
      const monthlyRent = Math.round(property.priceIls * 0.0035 / 3.7); // In USD

      // Calculate ROI metrics
      const expectedRoi = 3 + Math.random() * 4; // 3-7%
      const capRate = 2.5 + Math.random() * 3; // 2.5-5.5%
      const cashOnCash = 4 + Math.random() * 5; // 4-9%

      console.log(`  Price: ${property.priceIls.toLocaleString()} ILS (~${priceUsd.toLocaleString()} USD)`);

      // Note: Since we cleared all users, we need to recreate the system user
      // The property creation requires a createdBy field
      // We'll need to call seedProperties first or modify to handle this

      successCount++;
    } catch (error) {
      console.error(`  Error processing ${property.title}:`, error);
      failCount++;
    }
  }

  console.log(`\n=== Summary ===`);
  console.log(`Processed: ${successCount} properties`);
  console.log(`Failed: ${failCount} properties`);
  console.log(`\nTo complete the import, run: npx convex run seed:seedScrapedProperties`);
}

main().catch(console.error);
