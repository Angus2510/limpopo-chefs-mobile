import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_CONFIG } from "../config";

const authApi = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// Token storage keys
const TOKEN_KEY = "auth_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const USER_KEY = "user_data";
const TOKEN_EXPIRY_KEY = "token_expiry";
const STUDENT_PROFILE_KEY = "student_profile";

export interface LoginCredentials {
  identifier: string; // Can be email or username
  password: string;
}

export interface LoginResponse {
  success: boolean;
  accessToken: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    userType: string;
  };
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  userType: string;
  email?: string;
  studentNumber?: string;
}

export class AuthService {
  // Callback triggered when a session genuinely expires (401 + refresh failed)
  static sessionExpiredCallback: (() => void) | null = null;
  // Flag to prevent firing the callback more than once per expired session
  static _sessionExpiredTriggered = false;

  // Decode the exp claim from a JWT without verifying the signature.
  // Returns the expiry as a JS timestamp (ms), or null if decoding fails.
  private static decodeTokenExpiry(token: string): number | null {
    try {
      const parts = token.split(".");
      if (parts.length !== 3) return null;
      // Base64url → base64, add padding
      const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      const padded = base64 + "===".slice((base64.length + 3) % 4);
      const decoded = JSON.parse(atob(padded));
      return typeof decoded.exp === "number" ? decoded.exp * 1000 : null;
    } catch {
      return null;
    }
  }

  // Signal that the session has expired – called by the API interceptor
  static triggerSessionExpiry(): void {
    if (this._sessionExpiredTriggered) return;
    this._sessionExpiredTriggered = true;
    console.log("🔒 AuthService: Session expired – notifying AuthContext");
    if (this.sessionExpiredCallback) {
      this.sessionExpiredCallback();
    }
  }

  // Clear all stored tokens/user data without calling the logout API endpoint
  static async clearSession(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        TOKEN_KEY,
        REFRESH_TOKEN_KEY,
        USER_KEY,
        TOKEN_EXPIRY_KEY,
        STUDENT_PROFILE_KEY,
      ]);
      console.log("✅ AuthService: Session cleared from storage");
    } catch (error) {
      console.log("⚠️ AuthService: Failed to clear session:", error);
    }
  }

  // Login
  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      console.log("🔍 Starting login process...");
      console.log("🔍 API Base URL:", authApi.defaults.baseURL);
      console.log(
        "🔍 Full login URL:",
        authApi.defaults.baseURL + "/auth/login",
      );
      console.log("🔍 Credentials:", {
        identifier: credentials.identifier,
        password: "[HIDDEN]",
      });
      console.log("🔍 Request headers:", authApi.defaults.headers);

      // Test basic connectivity first
      console.log("🌐 Testing basic connectivity...");
      try {
        const testResponse = await fetch(authApi.defaults.baseURL + "/health", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        console.log("✅ Connectivity test result:", {
          status: testResponse.status,
          statusText: testResponse.statusText,
        });
      } catch (connectError: any) {
        console.error("❌ Basic connectivity failed:", connectError.message);
      }

      console.log("📤 Making actual login request...");
      const response = await authApi.post("/auth/login", credentials);

      console.log("✅ Login response received:");
      console.log("   Status:", response.status);
      console.log("   Status Text:", response.statusText);
      console.log("   Headers:", response.headers);
      console.log("   Data:", JSON.stringify(response.data, null, 2));

      const { accessToken, user, refreshToken, expiresIn } = response.data;

      // Reset session-expiry flag so the newly-issued session works cleanly
      AuthService._sessionExpiredTriggered = false;

      // Store token and user data (using accessToken as main token)
      // Store both individually with error handling
      try {
        await AsyncStorage.setItem(TOKEN_KEY, accessToken);
        console.log("✅ Token stored successfully");
      } catch (storageError) {
        console.error("❌ Failed to store token:", storageError);
        throw new Error("Failed to save login session");
      }

      // Store refresh token if provided
      if (refreshToken) {
        try {
          await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
          console.log("✅ Refresh token stored successfully");
        } catch (storageError) {
          console.error("❌ Failed to store refresh token:", storageError);
        }
      }

      // Decode the real expiry directly from the JWT so we always store the
      // correct value regardless of whether the server sends expiresIn.
      const expiryTime =
        AuthService.decodeTokenExpiry(accessToken) ??
        Date.now() + 5 * 60 * 60 * 1000; // fallback: 5 h
      try {
        await AsyncStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
        console.log(
          "✅ Token expiry stored:",
          new Date(expiryTime).toISOString(),
        );
      } catch (storageError) {
        console.error("❌ Failed to store token expiry:", storageError);
      }

      try {
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
        console.log("✅ User data stored successfully");
      } catch (storageError) {
        console.error("❌ Failed to store user data:", storageError);
        throw new Error("Failed to save user data");
      }

      console.log(
        "✅ Login complete - user will stay logged in until manual logout",
      );

      // Note: Backend doesn't provide refresh token, so we'll skip it for now

      return response.data;
    } catch (error: any) {
      console.error("❌ Login error - FULL DETAILS:");
      console.error("   Error Type:", error.name || "Unknown");
      console.error("   Error Message:", error.message || "No message");
      console.error("   Network Error:", error.code || "No code");
      console.error("   Request Config:", {
        url: error.config?.url || "No URL",
        method: error.config?.method || "No method",
        baseURL: error.config?.baseURL || "No baseURL",
        timeout: error.config?.timeout || "No timeout",
        headers: error.config?.headers || "No headers",
      });

      if (error.response) {
        console.error("   Response Status:", error.response.status);
        console.error("   Response Status Text:", error.response.statusText);
        console.error("   Response Headers:", error.response.headers);
        console.error("   Response Data:", error.response.data);
      } else if (error.request) {
        console.error("   Request Made But No Response:", error.request);
      } else {
        console.error("   Error Setting Up Request:", error.message);
      }

      // Provide more specific error messages
      let errorMessage = "Login failed";
      if (
        error.code === "NETWORK_ERROR" ||
        error.message.includes("Network Error")
      ) {
        errorMessage =
          "Network connection failed. Please check your internet connection and try again.";
      } else if (
        error.code === "ENOTFOUND" ||
        error.message.includes("ENOTFOUND")
      ) {
        errorMessage = "Cannot reach the server. Please try again later.";
      } else if (error.response?.status === 401) {
        errorMessage = "Invalid username or password. Please try again.";
      } else if (error.response?.status === 500) {
        errorMessage = "Server error. Please try again later.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }

      throw new Error(errorMessage);
    }
  }

  // Logout
  static async logout(): Promise<void> {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (token) {
        await authApi.post(
          "/auth/logout",
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
      }
    } catch (error) {
      console.log("Logout error:", error);
    } finally {
      // Only clear all stored data on explicit logout
      await AsyncStorage.multiRemove([
        TOKEN_KEY,
        REFRESH_TOKEN_KEY,
        USER_KEY,
        TOKEN_EXPIRY_KEY,
        STUDENT_PROFILE_KEY,
      ]);
    }
  }

  // Get stored token
  static async getToken(): Promise<string | null> {
    return await AsyncStorage.getItem(TOKEN_KEY);
  }

  // Get stored refresh token
  static async getRefreshToken(): Promise<string | null> {
    return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
  }

  // Get stored user data
  static async getUser(): Promise<User | null> {
    const userData = await AsyncStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  // Cache student profile locally for instant display on next open
  static async cacheStudentProfile(profile: any): Promise<void> {
    try {
      await AsyncStorage.setItem(STUDENT_PROFILE_KEY, JSON.stringify(profile));
    } catch (error) {
      console.log("⚠️ Failed to cache student profile:", error);
    }
  }

  // Get cached student profile
  static async getCachedStudentProfile(): Promise<any | null> {
    try {
      const data = await AsyncStorage.getItem(STUDENT_PROFILE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      return null;
    }
  }

  // Refresh token
  static async refreshToken(): Promise<string | null> {
    try {
      console.log("🔄 AuthService: Attempting to refresh token...");

      const currentToken = await AsyncStorage.getItem(TOKEN_KEY);
      if (!currentToken) {
        console.log("⚠️ AuthService: No token available to refresh");
        return null;
      }

      try {
        // Always send the current token as a Bearer header.
        // The backend's /auth/refresh endpoint accepts expired tokens
        // (ignoreExpiration: true) so this works even after expiry.
        const response = await authApi.post(
          "/auth/refresh",
          {},
          {
            headers: { Authorization: `Bearer ${currentToken}` },
          },
        );

        const newToken = response.data?.accessToken;
        if (newToken) {
          await AsyncStorage.setItem(TOKEN_KEY, newToken);
          // Decode real expiry from the JWT; fallback to 5 hours
          const expiryTime =
            AuthService.decodeTokenExpiry(newToken) ??
            Date.now() + 5 * 60 * 60 * 1000;
          await AsyncStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
          console.log("✅ AuthService: Token refreshed successfully");
          return newToken;
        }

        console.log("⚠️ AuthService: Refresh response had no accessToken");
        return null;
      } catch (refreshError: any) {
        console.log(
          "⚠️ AuthService: Token refresh call failed:",
          refreshError?.response?.status,
          refreshError?.message,
        );
        // Return null to signal that refresh failed — do NOT return the expired
        // token, because the interceptor uses non-null to mean "retry with this".
        return null;
      }
    } catch (error) {
      console.log("⚠️ AuthService: Token refresh error:", error);
      return null;
    }
  }

  // Check if user is authenticated
  static async isAuthenticated(): Promise<boolean> {
    try {
      const token = await this.getToken();
      const user = await this.getUser();

      if (!token || !user) {
        console.log("🔐 AuthService: No token or user found");
        return false;
      }

      // Token and user exist - assume authenticated
      // Don't make API call to verify as it may not exist or cause issues
      console.log(
        "✅ AuthService: Token and user found, assuming authenticated",
      );
      console.log("✅ AuthService: User should stay logged in");
      return true;
    } catch (error) {
      console.log("❌ AuthService: Authentication check failed:", error);
      return false;
    }
  }

  // Get current user profile
  static async getCurrentUser(): Promise<User | null> {
    try {
      const token = await this.getToken();
      if (!token) return null;

      const response = await authApi.get("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const user = response.data;
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
      return user;
    } catch (error) {
      console.log("Get current user failed:", error);
      return null;
    }
  }

  // Update stored user data
  static async updateUserData(userData: Partial<User>): Promise<void> {
    const currentUser = await this.getUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData };
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
    }
  }

  // Auto-login attempt on app start
  static async attemptAutoLogin(): Promise<User | null> {
    try {
      console.log("🔄 AuthService: Attempting auto-login...");

      const token = await this.getToken();
      const user = await this.getUser();

      // If we have both token and user, assume we're logged in
      if (token && user) {
        console.log("✅ AuthService: Auto-login successful for user:", user.id);
        console.log("✅ AuthService: User stays logged in - token exists");
        return user;
      }

      console.log("❌ AuthService: Auto-login failed - no stored credentials");
      return null;
    } catch (error) {
      console.log(
        "⚠️ AuthService: Auto-login error (but not clearing data):",
        error,
      );
      // DON'T logout on error - just return null
      // This prevents auto-logout when there's a temporary issue
      return null;
    }
  }

  // Check if we need to refresh the token proactively
  static async checkTokenValidity(): Promise<boolean> {
    try {
      const token = await this.getToken();
      if (!token) return false;

      const expiryStr = await AsyncStorage.getItem(TOKEN_EXPIRY_KEY);

      if (expiryStr) {
        const expiryTime = parseInt(expiryStr);
        const timeUntilExpiry = expiryTime - Date.now();
        const oneHour = 60 * 60 * 1000;

        if (timeUntilExpiry <= 0) {
          // Token already expired — refresh immediately
          console.log("⏰ Token expired, refreshing now...");
          await this.refreshToken();
        } else if (timeUntilExpiry < oneHour) {
          // Token expires within 1 hour — refresh proactively
          console.log("⏰ Token expires soon, refreshing proactively...");
          await this.refreshToken();
        }
      } else {
        // No expiry record stored (e.g. old install / first launch after update).
        // Try to decode from the token itself; if that fails, refresh anyway to
        // ensure we have a fresh token and a correct expiry on record.
        const decoded = AuthService.decodeTokenExpiry(token);
        if (decoded) {
          await AsyncStorage.setItem(TOKEN_EXPIRY_KEY, decoded.toString());
          const timeUntilExpiry = decoded - Date.now();
          if (timeUntilExpiry <= 60 * 60 * 1000) {
            console.log("⏰ (recovered expiry) Token due soon, refreshing...");
            await this.refreshToken();
          }
        } else {
          console.log("⏰ No expiry record — refreshing proactively");
          await this.refreshToken();
        }
      }

      return true;
    } catch (error) {
      console.log(
        "🔄 AuthService: Token check error (keeping user logged in):",
        error,
      );
      return true;
    }
  }

  // Proactively refresh token if needed (call this periodically)
  static async ensureTokenFresh(): Promise<void> {
    try {
      await this.checkTokenValidity();
    } catch (error) {
      console.log("⚠️ Token freshness check failed (not critical):", error);
    }
  }
}

export default AuthService;
