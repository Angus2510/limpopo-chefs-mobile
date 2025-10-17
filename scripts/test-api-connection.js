#!/usr/bin/env node

/**
 * Quick API Test Script
 * Tests if the mobile app can connect to the backend APIs
 */

const axios = require("axios");

const API_BASE_URL = "http://localhost:3000/api/mobile";

async function testAPIConnection() {
  console.log("🔍 Testing API Connection...\n");

  try {
    // Test 1: Check if backend is running
    console.log("1. Testing backend connection...");
    const healthCheck = await axios.get(`${API_BASE_URL}/auth/me`, {
      timeout: 5000,
      validateStatus: () => true, // Don't throw on 401
    });

    if (healthCheck.status === 401) {
      console.log(
        "✅ Backend is running (returned 401 - expected for unauthorized request)"
      );
    } else {
      console.log(`✅ Backend responded with status: ${healthCheck.status}`);
    }

    // Test 2: Try a login (you'll need real credentials)
    console.log("\n2. Testing login endpoint...");
    try {
      const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: "test@example.com", // Replace with real email
        password: "testpassword", // Replace with real password
      });

      if (loginResponse.data.token) {
        console.log("✅ Login successful - JWT token received");

        // Test 3: Try authenticated request
        console.log("\n3. Testing authenticated request...");
        const userResponse = await axios.get(`${API_BASE_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${loginResponse.data.token}`,
          },
        });

        console.log("✅ Authenticated request successful");
        console.log("User data:", userResponse.data);
      } else {
        console.log("❌ Login failed - no token received");
      }
    } catch (loginError) {
      console.log(
        "⚠️  Login test failed:",
        loginError.response?.data?.message || loginError.message
      );
      console.log(
        "   (This is expected if you don't have test credentials set up)"
      );
    }
  } catch (error) {
    console.log("❌ Backend connection failed:", error.message);
    console.log("\nMake sure your Next.js backend is running:");
    console.log(
      '   cd "c:\\Users\\angus\\Desktop\\Limpopo Chefs Acadamy\\limpopochefs-next"'
    );
    console.log("   npm run dev");
  }
}

// Run the test
testAPIConnection().catch(console.error);
