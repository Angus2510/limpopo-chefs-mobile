#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

// This script creates google-services.json from the EAS Secret during build
const googleServicesPath = process.env.GOOGLE_SERVICES_JSON;

if (googleServicesPath) {
  console.log("📝 Reading google-services.json from EAS Secret...");
  console.log(`Secret file path: ${googleServicesPath}`);

  try {
    // Read the content from the secret file path
    const googleServicesContent = fs.readFileSync(googleServicesPath, "utf8");

    // Write to the project root
    const targetPath = path.join(__dirname, "..", "google-services.json");
    fs.writeFileSync(targetPath, googleServicesContent);

    console.log("✅ google-services.json created successfully");
    console.log(`Written to: ${targetPath}`);
  } catch (error) {
    console.error("❌ Error processing google-services.json:", error.message);
    process.exit(1);
  }
} else {
  console.log(
    "ℹ️  GOOGLE_SERVICES_JSON environment variable not found, skipping...",
  );
}
