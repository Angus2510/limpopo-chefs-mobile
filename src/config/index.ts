import { Platform } from "react-native";
import Constants from "expo-constants";

// Configuration file for the mobile app

// FORCE CONSISTENT BEHAVIOR: Always use the same settings
// This ensures Expo Go and standalone apps work identically
const FORCE_PRODUCTION_MODE = true;

// Check if running in Expo Go (which doesn't support push notifications in SDK 53+)
const isExpoGo = Constants.appOwnership === "expo";

console.log("🔧 App Environment:", {
  forcedMode: "ALWAYS_PRODUCTION",
  reason: "Ensuring consistent behavior between Expo Go and standalone",
  isExpoGo: isExpoGo,
  pushNotificationsSupported: !isExpoGo,
});

export const API_CONFIG = {
  // PRODUCTION: Using actual server endpoints
  PORTAL_BASE_URL: "https://portal.limpopochefs.co.za/api/mobile",
  VERCEL_BASE_URL: "https://portal.limpopochefs.co.za/api/mobile",

  // PRIMARY: Production server (portal)
  BASE_URL: "https://portal.limpopochefs.co.za/api/mobile",

  // Fallback URL if primary fails (same as primary for now)
  FALLBACK_URL: "https://portal.limpopochefs.co.za/api/mobile",

  // FIXED: Same timeout for all environments
  TIMEOUT: 15000,

  // Retry configuration
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

console.log("🌐 API Configuration:", {
  primaryURL: API_CONFIG.BASE_URL,
  fallbackURL: API_CONFIG.FALLBACK_URL,
  timeout: API_CONFIG.TIMEOUT,
});

// Network connectivity test function
export const testNetworkConnectivity = async () => {
  try {
    console.log("🔍 Testing network connectivity to:", API_CONFIG.BASE_URL);

    const response = await fetch(`${API_CONFIG.BASE_URL}/health`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-cache",
    });

    console.log("✅ Network test response:", {
      status: response.status,
      statusText: response.statusText,
      url: response.url,
    });

    return {
      success: true,
      status: response.status,
      statusText: response.statusText,
    };
  } catch (error: any) {
    console.error("❌ Network connectivity test failed:", {
      message: error.message,
      name: error.name,
      stack: error.stack,
    });

    return {
      success: false,
      error: error.message,
      name: error.name,
    };
  }
};

export const APP_CONFIG = {
  // App-wide settings
  DEFAULT_STUDENT_ID: "current-student-id", // This should be managed by authentication

  // Colors
  COLORS: {
    PRIMARY: "#2196F3",
    SUCCESS: "#4caf50",
    WARNING: "#ff9800",
    ERROR: "#f44336",
    BACKGROUND: "#f5f5f5",
    TEXT_PRIMARY: "#333",
    TEXT_SECONDARY: "#666",
  },

  // Feature flags
  FEATURES: {
    ENABLE_QR_SCANNING: true,
    ENABLE_FILE_DOWNLOADS: true,
    ENABLE_PUSH_NOTIFICATIONS: !isExpoGo, // Disable push notifications in Expo Go
  },
};

export default {
  API_CONFIG,
  APP_CONFIG,
};
