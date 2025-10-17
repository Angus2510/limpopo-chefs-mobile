#!/usr/bin/env node

/**
 * Detailed Login Test Script
 * Tests login with better error reporting
 */

const axios = require("axios");

const API_BASE_URL = "http://localhost:3000/api/mobile";

async function testLogin() {
  console.log("🔍 Testing Login with Better Error Reporting...\n");

  // Real credentials from user
  const credentials = {
    identifier: "ANG123", // Username
    password: "Gooseman12!", // Password
  };

  console.log("Testing with credentials:");
  console.log("Identifier:", credentials.identifier);
  console.log("Password: [HIDDEN]");
  console.log("");

  try {
    console.log("Making request to:", `${API_BASE_URL}/auth/login`);

    const response = await axios.post(
      `${API_BASE_URL}/auth/login`,
      credentials,
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );

    console.log("✅ Login successful!");
    console.log("Response status:", response.status);
    console.log("Response data:", JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log("❌ Login failed!");
    console.log("Error status:", error.response?.status);
    console.log(
      "Error message:",
      error.response?.data?.message || error.message
    );
    console.log(
      "Full error response:",
      JSON.stringify(error.response?.data, null, 2)
    );

    if (error.response?.status === 400) {
      console.log("\n💡 This might be due to:");
      console.log("   - Invalid email format");
      console.log("   - Missing email or password");
      console.log("   - Validation errors");
    }

    if (error.response?.status === 401) {
      console.log("\n💡 This might be due to:");
      console.log("   - Wrong email or password");
      console.log("   - User not found");
      console.log("   - Account not active");
    }

    if (error.response?.status === 500) {
      console.log("\n💡 This might be due to:");
      console.log("   - Database connection issues");
      console.log("   - Server configuration problems");
    }
  }
}

console.log(
  "📝 NOTE: Update the credentials in this script with real values from your database"
);
console.log("📝 You can find user credentials in your Next.js database\n");

testLogin().catch(console.error);
