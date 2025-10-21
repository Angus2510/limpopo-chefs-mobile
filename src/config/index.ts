// Configuration file for the mobile app

// FORCE CONSISTENT BEHAVIOR: Always use the same settings
// This ensures Expo Go and standalone apps work identically
const FORCE_PRODUCTION_MODE = true;

console.log("🔧 App Environment:", {
  forcedMode: "ALWAYS_PRODUCTION",
  reason: "Ensuring consistent behavior between Expo Go and standalone",
});

export const API_CONFIG = {
  // ALWAYS use the same API endpoints regardless of environment
  PORTAL_BASE_URL: "https://portal.limpopochefs.co.za/api/mobile",
  VERCEL_BASE_URL: "https://limpopo-chefs-backend.vercel.app/api/mobile",

  // FIXED: Always use Portal server (no environment switching)
  BASE_URL: "https://portal.limpopochefs.co.za/api/mobile",

  // Fallback URL if primary fails
  FALLBACK_URL: "https://limpopo-chefs-backend.vercel.app/api/mobile",

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
    ENABLE_PUSH_NOTIFICATIONS: false,
  },
};

export default {
  API_CONFIG,
  APP_CONFIG,
};
