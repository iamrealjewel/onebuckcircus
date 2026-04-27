import { sendVerificationEmail } from "../lib/mail";
import * as dotenv from "dotenv";
import path from "path";

// Load .env manually for the script
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function testConnection() {
  console.log("--- SMTP Connectivity Diagnostic ---");
  console.log("Configured User:", process.env.SMTP_USER);
  console.log("Has Password:", !!process.env.SMTP_PASS);
  
  const testEmail = process.env.SMTP_USER || "test@example.com";
  
  try {
    console.log("Sending test verification to:", testEmail);
    const result = await sendVerificationEmail(testEmail, "test-token-123");
    
    if (result.success) {
      console.log("✅ SUCCESS: SMTP connection established and mail sent.");
    } else {
      console.error("❌ FAILED: SMTP connection failed.");
      console.error("Error Detail:", result.error);
    }
  } catch (err) {
    console.error("❌ CRITICAL ERROR:", err);
  }
  process.exit(0);
}

testConnection();
