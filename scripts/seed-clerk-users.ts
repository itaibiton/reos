/**
 * Seed Clerk Users Script
 *
 * Creates Clerk users for all service providers so they can actually log in.
 * Run with: npx tsx scripts/seed-clerk-users.ts
 */

import { Clerk } from "@clerk/clerk-sdk-node";

// Get Clerk secret key from environment
const clerkSecretKey = process.env.CLERK_SECRET_KEY;

if (!clerkSecretKey) {
  console.error("❌ CLERK_SECRET_KEY environment variable is required");
  console.log("Get it from: https://dashboard.clerk.com/");
  process.exit(1);
}

const clerk = new Clerk({ secretKey: clerkSecretKey });

// Service provider data (matching seedData.ts)
const serviceProviders = [
  {
    email: "sarah.broker@reos.dev",
    firstName: "Sarah",
    lastName: "Cohen",
    role: "broker",
    password: "REOS_Dev_2026!Secure#Pass",
  },
  {
    email: "david.broker@reos.dev",
    firstName: "David",
    lastName: "Levy",
    role: "broker",
    password: "REOS_Dev_2026!Secure#Pass",
  },
  {
    email: "rachel.broker@reos.dev",
    firstName: "Rachel",
    lastName: "Goldstein",
    role: "broker",
    password: "REOS_Dev_2026!Secure#Pass",
  },
  {
    email: "michael.mortgage@reos.dev",
    firstName: "Michael",
    lastName: "Rosenberg",
    role: "mortgage_advisor",
    password: "REOS_Dev_2026!Secure#Pass",
  },
  {
    email: "lisa.mortgage@reos.dev",
    firstName: "Lisa",
    lastName: "Friedman",
    role: "mortgage_advisor",
    password: "REOS_Dev_2026!Secure#Pass",
  },
  {
    email: "jonathan.mortgage@reos.dev",
    firstName: "Jonathan",
    lastName: "Schwartz",
    role: "mortgage_advisor",
    password: "REOS_Dev_2026!Secure#Pass",
  },
  {
    email: "daniel.lawyer@reos.dev",
    firstName: "Daniel",
    lastName: "Steinberg",
    role: "lawyer",
    password: "REOS_Dev_2026!Secure#Pass",
  },
  {
    email: "rebecca.lawyer@reos.dev",
    firstName: "Rebecca",
    lastName: "Kaplan",
    role: "lawyer",
    password: "REOS_Dev_2026!Secure#Pass",
  },
  {
    email: "adam.lawyer@reos.dev",
    firstName: "Adam",
    lastName: "Cohen",
    role: "lawyer",
    password: "REOS_Dev_2026!Secure#Pass",
  },
  {
    email: "emma.broker@reos.dev",
    firstName: "Emma",
    lastName: "Ben-David",
    role: "broker",
    password: "REOS_Dev_2026!Secure#Pass",
  },
  {
    email: "yossi.mortgage@reos.dev",
    firstName: "Yossi",
    lastName: "Mizrahi",
    role: "mortgage_advisor",
    password: "REOS_Dev_2026!Secure#Pass",
  },
];

async function createClerkUser(provider: typeof serviceProviders[0]) {
  try {
    // Check if user already exists
    const existingUsers = await clerk.users.getUserList({
      emailAddress: [provider.email],
    });

    if (existingUsers && Array.isArray(existingUsers) && existingUsers.length > 0) {
      console.log(`✓ User already exists: ${provider.email} (${existingUsers[0].id})`);
      return existingUsers[0];
    }

    // Create new user with password
    const user = await clerk.users.createUser({
      emailAddress: [provider.email],
      firstName: provider.firstName,
      lastName: provider.lastName,
      password: provider.password,
      publicMetadata: {
        role: provider.role,
      },
    });

    console.log(`✅ Created: ${provider.email} (${user.id})`);
    return user;
  } catch (error: any) {
    console.error(`❌ Failed to create ${provider.email}:`, error.message || error);
    if (error.errors) {
      console.error("  Errors:", JSON.stringify(error.errors, null, 2));
    }
    return null;
  }
}

async function main() {
  console.log("🔐 Creating Clerk users for service providers...\n");
  console.log("Default password for all users: REOS_Dev_2026!Secure#Pass\n");

  let created = 0;
  let existing = 0;
  let failed = 0;

  for (const provider of serviceProviders) {
    const result = await createClerkUser(provider);
    if (result) {
      if (result.createdAt) {
        created++;
      } else {
        existing++;
      }
    } else {
      failed++;
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log(`✅ Created: ${created}`);
  console.log(`✓ Already existed: ${existing}`);
  if (failed > 0) {
    console.log(`❌ Failed: ${failed}`);
  }
  console.log("=".repeat(60));

  console.log("\n📝 Next steps:");
  console.log("1. Users can now log in with their email and password: REOS_Dev_2026!Secure#Pass");
  console.log("2. Run the Convex seeding to populate the database:");
  console.log("   npx convex run seed:seedEverything");
  console.log("3. The Convex users table will automatically link to these Clerk users");
  console.log("\n🔗 Manage users at: https://dashboard.clerk.com/");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
