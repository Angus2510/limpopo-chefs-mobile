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

      // Calculate and store token expiry time (default 7 days if not provided)
      const expiryTime = Date.now() + (expiresIn || 7 * 24 * 60 * 60) * 1000;
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
      // Clear all stored data
      await AsyncStorage.multiRemove([
        TOKEN_KEY,
        REFRESH_TOKEN_KEY,
        USER_KEY,
        TOKEN_EXPIRY_KEY,
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

  // Refresh token
  static async refreshToken(): Promise<string | null> {
    try {
      console.log("🔄 AuthService: Attempting to refresh token...");

      const currentToken = await AsyncStorage.getItem(TOKEN_KEY);
      const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);

      // If we have a refresh token, use it
      if (refreshToken) {
        console.log("🔄 Using refresh token to get new access token");
        const response = await authApi.post("/auth/refresh", {
          refreshToken,
        });

        const {
          accessToken,
          refreshToken: newRefreshToken,
          expiresIn,
        } = response.data;

        // Update stored tokens
        await AsyncStorage.setItem(TOKEN_KEY, accessToken);
        console.log("✅ New access token stored");

        if (newRefreshToken) {
          await AsyncStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
          console.log("✅ New refresh token stored");
        }

        // Update expiry time
        const expiryTime = Date.now() + (expiresIn || 7 * 24 * 60 * 60) * 1000;
        await AsyncStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
        console.log(
          "✅ Token refreshed successfully, expires:",
          new Date(expiryTime).toISOString(),
        );

        return accessToken;
      }

      // If no refresh token but we have a current token, try to extend it
      // by making a request to verify/refresh endpoint with current token
      if (currentToken) {
        console.log("🔄 No refresh token, trying to extend current token");
        try {
          const response = await authApi.post(
            "/auth/refresh",
            {},
            {
              headers: { Authorization: `Bearer ${currentToken}` },
            },
          );

          if (response.data?.accessToken) {
            const { accessToken, expiresIn } = response.data;
            await AsyncStorage.setItem(TOKEN_KEY, accessToken);

            const expiryTime =
              Date.now() + (expiresIn || 7 * 24 * 60 * 60) * 1000;
            await AsyncStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
            console.log("✅ Token extended successfully");
            return accessToken;
          }
        } catch (extendError) {
          console.log(
            "⚠️ Token extension failed, keeping current token:",
            extendError,
          );
        }
      }

      console.log("⚠️ No refresh token available, will use existing token");
      return currentToken;
    } catch (error) {
      console.log("⚠️ Token refresh failed (not logging out):", error);
      // DON'T logout - just return the current token
      // The user can still use the app with their existing token
      const currentToken = await AsyncStorage.getItem(TOKEN_KEY);
      return currentToken;
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

      // Check if token will expire soon (within 1 hour)
      const expiryStr = await AsyncStorage.getItem(TOKEN_EXPIRY_KEY);
      if (expiryStr) {
        const expiryTime = parseInt(expiryStr);
        const timeUntilExpiry = expiryTime - Date.now();
        const oneHour = 60 * 60 * 1000;

        // If token expires in less than 1 hour, refresh it proactively
        if (timeUntilExpiry < oneHour && timeUntilExpiry > 0) {
          console.log("⏰ Token expires soon, refreshing proactively...");
          await this.refreshToken();
        } else if (timeUntilExpiry <= 0) {
          console.log("⏰ Token expired, refreshing...");
          await this.refreshToken();
        }
      }

      return true;
    } catch (error) {
      console.log(
        "🔄 AuthService: Token check error (keeping user logged in):",
        error,
      );
      // Don't return false - keep user logged in even if check fails
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
