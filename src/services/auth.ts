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
      console.log(
        "🔍 Making login request to:",
        authApi.defaults.baseURL + "/auth/login"
      );
      console.log("🔍 With credentials:", {
        identifier: credentials.identifier,
        password: "[HIDDEN]",
      });

      const response = await authApi.post("/auth/login", credentials);
      console.log("✅ Login response status:", response.status);
      console.log(
        "✅ Login response data:",
        JSON.stringify(response.data, null, 2)
      );

      const { accessToken, user } = response.data;

      // Store token and user data (using accessToken as main token)
      await AsyncStorage.setItem(TOKEN_KEY, accessToken);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));

      // Note: Backend doesn't provide refresh token, so we'll skip it for now

      return response.data;
    } catch (error: any) {
      console.error("❌ Login error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        url: error.config?.url,
        method: error.config?.method,
      });
      throw new Error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Login failed"
      );
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
          }
        );
      }
    } catch (error) {
      console.log("Logout error:", error);
    } finally {
      // Clear all stored data
      await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY]);
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
      const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
      if (!refreshToken) return null;

      const response = await authApi.post("/auth/refresh", {
        refreshToken,
      });

      const { token, refreshToken: newRefreshToken } = response.data;

      // Update stored tokens
      await AsyncStorage.setItem(TOKEN_KEY, token);
      if (newRefreshToken) {
        await AsyncStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
      }

      return token;
    } catch (error) {
      console.log("Token refresh failed:", error);
      // If refresh fails, clear all auth data
      await this.logout();
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

      // Check if token is expired by trying a simple API call
      try {
        const testResponse = await authApi.get("/auth/verify", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("✅ AuthService: Token verification successful");
        return true;
      } catch (verifyError: any) {
        console.log(
          "⚠️ AuthService: Token verification failed, checking if we can refresh..."
        );

        // If token verification fails, try to refresh if we have a refresh token
        const refreshedToken = await this.refreshToken();
        if (refreshedToken) {
          console.log("✅ AuthService: Token refreshed successfully");
          return true;
        }

        console.log(
          "❌ AuthService: Token refresh failed, user needs to login again"
        );
        return false;
      }
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

      const isAuth = await this.isAuthenticated();
      if (!isAuth) {
        console.log("❌ AuthService: Auto-login failed - not authenticated");
        return null;
      }

      const user = await this.getUser();
      if (user) {
        console.log("✅ AuthService: Auto-login successful for user:", user.id);
        return user;
      }

      console.log("❌ AuthService: Auto-login failed - no user data");
      return null;
    } catch (error) {
      console.log("❌ AuthService: Auto-login error:", error);
      // Clear any corrupted auth data
      await this.logout();
      return null;
    }
  }

  // Check if we need to refresh the token proactively
  static async checkTokenValidity(): Promise<boolean> {
    try {
      const token = await this.getToken();
      if (!token) return false;

      // Try a lightweight API call to check token validity
      await authApi.get("/auth/verify", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return true;
    } catch (error) {
      console.log("🔄 AuthService: Token invalid, attempting refresh...");
      const refreshedToken = await this.refreshToken();
      return !!refreshedToken;
    }
  }
}

export default AuthService;
