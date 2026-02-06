#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

// This script creates google-services.json from the EAS Secret during build
const googleServicesJson = process.env.GOOGLE_SERVICES_JSON;

if (googleServicesJson) {
  const filePath = path.join(__dirname, "..", "google-services.json");
  console.log("📝 Writing google-services.json from EAS Secret...");
  fs.writeFileSync(filePath, googleServicesJson);
  console.log("✅ google-services.json created successfully");
} else {
  console.log(
    "ℹ️  GOOGLE_SERVICES_JSON environment variable not found, skipping...",
  );
}
