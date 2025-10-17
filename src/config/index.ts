// Configuration file for the mobile app

// Determine environment
const isDevelopment = __DEV__ || process.env.NODE_ENV === "development";

console.log("🔧 App Environment:", {
  isDevelopment,
  NODE_ENV: process.env.NODE_ENV,
  __DEV__,
});

export const API_CONFIG = {
  // Primary API endpoints
  PORTAL_BASE_URL: "https://portal.limpopochefs.co.za/api/mobile", // Main portal server
  VERCEL_BASE_URL: "https://limpopo-chefs-backend.vercel.app/api/mobile", // Backup Vercel server

  // Automatically switch between development and production URLs
  BASE_URL: isDevelopment
    ? "http://192.168.101.148:3000/api/mobile" // Development
    : "https://portal.limpopochefs.co.za/api/mobile", // Production - Portal server

  // Fallback URL if primary fails
  FALLBACK_URL: "https://limpopo-chefs-backend.vercel.app/api/mobile",

  TIMEOUT: isDevelopment ? 10000 : 15000, // Longer timeout for production

  // Retry configuration for mobile apps
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
