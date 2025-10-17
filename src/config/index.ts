// Configuration file for the mobile app

export const API_CONFIG = {
  // Change this to your actual API URL
  BASE_URL: "http://192.168.101.148:3000/api/mobile", // For development - Next.js backend (using network IP)
  // BASE_URL: "http://localhost:3000/api/mobile", // Alternative: localhost (only works on web)
  // BASE_URL: 'https://your-domain.com/api/mobile', // For production

  TIMEOUT: 10000, // 10 seconds
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
    ENABLE_PUSH_NOTIFICATIONS: false,
  },
};

export default {
  API_CONFIG,
  APP_CONFIG,
};
