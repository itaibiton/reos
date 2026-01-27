/**
 * Seed Clerk Users Script - Correct Emails
 *
 * Creates Clerk users matching the seedData.ts service providers
 * Run with: npx tsx scripts/seed-clerk-users-correct.ts
 */

import { Clerk } from "@clerk/clerk-sdk-node";

const clerkSecretKey = process.env.CLERK_SECRET_KEY;

if (!clerkSecretKey) {
  console.error("❌ CLERK_SECRET_KEY environment variable is required");
  process.exit(1);
}

const clerk = new Clerk({ secretKey: clerkSecretKey });

// Service provider data matching seedData.ts EXACTLY
const serviceProviders = [
  {
    email: "david.cohen@reosbrokers.com",
    firstName: "David",
    lastName: "Cohen",
    role: "broker",
    password: "REOS_Dev_2026!Secure#Pass",
  },
  {
    email: "sarah.levy@tlvproperties.com",
    firstName: "Sarah",
    lastName: "Levy",
    role: "broker",
    password: "REOS_Dev_2026!Secure#Pass",
  },
  {
    email: "michael@jerusalemhomes.com",
    firstName: "Michael",
    lastName: "Azoulay",
    role: "broker",
    password: "REOS_Dev_2026!Secure#Pass",
  },
  {
    email: "rachel@haifarealty.com",
    firstName: "Rachel",
    lastName: "Ben-David",
    role: "broker",
    password: "REOS_Dev_2026!Secure#Pass",
  },
  {
    email: "yosef@southernproperties.com",
    firstName: "Yosef",
    lastName: "Mizrachi",
    role: "broker",
    password: "REOS_Dev_2026!Secure#Pass",
  },
  {
    email: "natan@mortgageisrael.com",
    firstName: "Natan",
    lastName: "Goldberg",
    role: "mortgage_advisor",
    password: "REOS_Dev_2026!Secure#Pass",
  },
  {
    email: "tamar@homeloans.co.il",
    firstName: "Tamar",
    lastName: "Shapira",
    role: "mortgage_advisor",
    password: "REOS_Dev_2026!Secure#Pass",
  },
  {
    email: "avi@finansim.co.il",
    firstName: "Avi",
    lastName: "Rosenberg",
    role: "mortgage_advisor",
    password: "REOS_Dev_2026!Secure#Pass",
  },
  {
    email: "ruth.katz@katzlaw.co.il",
    firstName: "Ruth",
    lastName: "Katz",
    role: "lawyer",
    password: "REOS_Dev_2026!Secure#Pass",
  },
  {
    email: "daniel@peretzlaw.com",
    firstName: "Daniel",
    lastName: "Peretz",
    role: "lawyer",
    password: "REOS_Dev_2026!Secure#Pass",
  },
  {
    email: "miriam@southlegal.co.il",
    firstName: "Miriam",
    lastName: "Levi",
    role: "lawyer",
    password: "REOS_Dev_2026!Secure#Pass",
  },
];

async function createClerkUser(provider: typeof serviceProviders[0]) {
  try {
    const existingUsers = await clerk.users.getUserList({
      emailAddress: [provider.email],
    });

    if (existingUsers && Array.isArray(existingUsers) && existingUsers.length > 0) {
      console.log(`✓ Already exists: ${provider.email} (${existingUsers[0].id})`);
      return { user: existingUsers[0], isNew: false };
    }

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
    return { user, isNew: true };
  } catch (error: any) {
    console.error(`❌ Failed: ${provider.email}:`, error.message || error);
    if (error.errors) {
      console.error("  Details:", JSON.stringify(error.errors, null, 2));
    }
    return null;
  }
}

async function main() {
  console.log("🔐 Creating Clerk users for service providers...\n");
  console.log("Password for all users: REOS_Dev_2026!Secure#Pass\n");

  let created = 0;
  let existing = 0;
  let failed = 0;
  const clerkIdMappings: Record<string, string> = {};

  for (const provider of serviceProviders) {
    const result = await createClerkUser(provider);
    if (result) {
      clerkIdMappings[provider.email] = result.user.id;
      if (result.isNew) {
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

  console.log("\n📋 Clerk ID Mappings (for syncClerkUsers.ts):");
  console.log(JSON.stringify(clerkIdMappings, null, 2));

  console.log("\n📝 Next steps:");
  console.log("1. Copy the mappings above to convex/syncClerkUsers.ts");
  console.log("2. Run: npx convex run syncClerkUsers:syncClerkIds");
  console.log("3. Users can now log in at your app!");
  console.log("\n🔗 Manage users at: https://dashboard.clerk.com/");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
