/**
 * Script to create Clerk users for seed data
 * Run with: npx tsx --env-file=.env.local scripts/create-clerk-users.ts
 */

const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;

if (!CLERK_SECRET_KEY) {
  console.error("CLERK_SECRET_KEY not found in .env.local");
  process.exit(1);
}

// Seed users that need Clerk accounts
// Each user has a unique password to avoid breach detection
const seedUsers = [
  {
    oldClerkId: "seed_broker_david.cohen",
    email: "david.cohen@reosbrokers.com",
    firstName: "David",
    lastName: "Cohen",
    password: "Reos2025DavidCBroker",
  },
  {
    oldClerkId: "seed_broker_sarah.levy",
    email: "sarah.levy@tlvproperties.com",
    firstName: "Sarah",
    lastName: "Levy",
    password: "Reos2025SarahLTlvProp",
  },
  {
    oldClerkId: "seed_broker_michael",
    email: "michael@jerusalemhomes.com",
    firstName: "Michael",
    lastName: "Azoulay",
    password: "Reos2025MichaelAJlmHomes",
  },
  {
    oldClerkId: "seed_broker_rachel",
    email: "rachel@haifarealty.com",
    firstName: "Rachel",
    lastName: "Ben-David",
    password: "Reos2025RachelBDHaifa",
  },
  {
    oldClerkId: "seed_broker_yosef",
    email: "yosef@southernproperties.com",
    firstName: "Yosef",
    lastName: "Mizrachi",
    password: "Reos2025YosefMSouthern",
  },
  {
    oldClerkId: "seed_mortgage_advisor_natan",
    email: "natan@mortgageisrael.com",
    firstName: "Natan",
    lastName: "Goldberg",
    password: "Reos2025NatanGMortgage",
  },
  {
    oldClerkId: "seed_mortgage_advisor_tamar",
    email: "tamar@homeloans.co.il",
    firstName: "Tamar",
    lastName: "Shapira",
    password: "Reos2025TamarSHomeLoans",
  },
  {
    oldClerkId: "seed_mortgage_advisor_avi",
    email: "avi@finansim.co.il",
    firstName: "Avi",
    lastName: "Rosenberg",
    password: "Reos2025AviRFinansim",
  },
  {
    oldClerkId: "seed_lawyer_ruth.katz",
    email: "ruth.katz@katzlaw.co.il",
    firstName: "Ruth",
    lastName: "Katz",
    password: "Reos2025RuthKKatzLaw",
  },
  {
    oldClerkId: "seed_lawyer_daniel",
    email: "daniel@peretzlaw.com",
    firstName: "Daniel",
    lastName: "Peretz",
    password: "Reos2025DanielPPeretzLaw",
  },
  {
    oldClerkId: "seed_lawyer_miriam",
    email: "miriam@southlegal.co.il",
    firstName: "Miriam",
    lastName: "Levi",
    password: "Reos2025MiriamLSouthLegal",
  },
];

async function createClerkUser(user: (typeof seedUsers)[0]) {
  const response = await fetch("https://api.clerk.com/v1/users", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${CLERK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email_address: [user.email],
      first_name: user.firstName,
      last_name: user.lastName,
      password: user.password,
      skip_password_checks: true,
      skip_password_requirement: false,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to create user ${user.email}: ${JSON.stringify(error)}`);
  }

  const clerkUser = await response.json();
  return {
    oldClerkId: user.oldClerkId,
    newClerkId: clerkUser.id,
    email: user.email,
  };
}

async function main() {
  console.log("Creating Clerk users for seed data...\n");

  const results: { oldClerkId: string; newClerkId: string; email: string }[] = [];
  const errors: { email: string; error: string }[] = [];

  for (const user of seedUsers) {
    try {
      console.log(`Creating user: ${user.email}...`);
      const result = await createClerkUser(user);
      results.push(result);
      console.log(`  ✓ Created with ID: ${result.newClerkId}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      errors.push({ email: user.email, error: errorMessage });
      console.log(`  ✗ Failed: ${errorMessage}`);
    }
  }

  console.log("\n=== SUMMARY ===");
  console.log(`Successfully created: ${results.length}/${seedUsers.length} users`);

  if (results.length > 0) {
    console.log("\n=== ID MAPPINGS (for Convex update) ===");
    console.log(JSON.stringify(results, null, 2));
  }

  if (errors.length > 0) {
    console.log("\n=== ERRORS ===");
    errors.forEach((e) => console.log(`- ${e.email}: ${e.error}`));
  }

  console.log("\n=== LOGIN CREDENTIALS ===");
  console.log("Each user has a unique password in format: Reos2025!{FirstName}{LastInitial}#{Company}");
  console.log("\nCredentials:");
  results.forEach((r) => {
    const user = seedUsers.find((u) => u.email === r.email);
    console.log(`  - ${r.email} | ${user?.password}`);
  });
}

main().catch(console.error);
