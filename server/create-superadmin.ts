// server/create-superadmin.ts
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import * as readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query: string): Promise<string> => {
  return new Promise(resolve => {
    rl.question(query, resolve);
  });
};

async function run() {
  console.log("\n🔒 Bandhan & Co. - SuperAdmin Setup CLI");
  console.log("------------------------------------------\n");

  const name = await question("Enter SuperAdmin Name (e.g., Rhythm): ");
  const email = await question("Enter SuperAdmin Email: ");
  const password = await question("Enter Secure Password: ");

  if (!name || !email || !password) {
    console.error("❌ Error: All fields are required.");
    process.exit(1);
  }

  const safeEmail = email.toLowerCase().trim();
  
  // FIX 1: We must 'await' the network call!
  const existingUser = await storage.getUserByEmail(safeEmail);

  if (existingUser) {
    console.error(`❌ Error: A user with email ${email} already exists.`);
    process.exit(1);
  }

  try {
    // FIX 2: We must 'await', and we must provide the 6-digit deletePin we added to the schema!
    const masterOrg = await storage.createOrganization(
      "Bandhan & Co. HQ", 
      new Date(8640000000000000).toISOString(), 
      "000000" // Default pin for HQ
    );
    
    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // FIX 3: We must 'await' the user creation!
    const superAdmin = await storage.createUser({
      orgId: masterOrg.id,
      name,
      email: safeEmail,
      password: hashedPassword,
      phone: null,
      role: "superadmin" // The magic key
    });

    console.log("\n✅ Success! SuperAdmin account created.");
    console.log(`Organization ID: ${masterOrg.id} (${masterOrg.name})`);
    console.log(`User ID: ${superAdmin.id}`);
    console.log(`Email: ${superAdmin.email}`);
    console.log(`Role: ${superAdmin.role}\n`);
    console.log("You can now log in to the dashboard with these credentials.");

  } catch (error) {
    console.error("\n❌ Setup failed:", error);
  } finally {
    process.exit(0);
  }
}

run();