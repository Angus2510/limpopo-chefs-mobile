import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { Alert, AppState, AppStateStatus } from "react-native";
import AuthService, { User, LoginCredentials } from "../services/auth";
import StudentAPI from "../services/api";

interface AuthContextType {
  user: User | null;
  studentProfile: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  refreshStudentProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [studentProfile, setStudentProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const userRef = useRef<User | null>(null);

  // Keep userRef in sync so the AppState callback always sees the latest user
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // Check authentication status on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Register the session-expiry callback so the API interceptor can signal us
  // when a token refresh genuinely fails (e.g. account suspended, server down).
  // We clear state and show a friendly "please log in again" prompt.
  useEffect(() => {
    AuthService.sessionExpiredCallback = () => {
      console.log("🔒 AuthContext: Handling session expiry");
      setUser(null);
      setStudentProfile(null);
      Alert.alert(
        "Session Expired",
        "Your session has expired. Please log in again.",
        [{ text: "OK" }],
      );
    };
    return () => {
      AuthService.sessionExpiredCallback = null;
    };
  }, []);

  // Re-fetch profile whenever the app returns to the foreground
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      async (nextState: AppStateStatus) => {
        if (
          appStateRef.current.match(/inactive|background/) &&
          nextState === "active"
        ) {
          console.log("📱 App foregrounded - refreshing token and profile");
          const currentUser = userRef.current;
          if (currentUser?.id) {
            await AuthService.ensureTokenFresh();
            try {
              const profileResponse = await StudentAPI.getStudentProfile(
                currentUser.id,
              );
              const profileData = (profileResponse as any)?.success
                ? (profileResponse as any).data
                : profileResponse;
              setStudentProfile(profileData);
              await AuthService.cacheStudentProfile(profileData);
              console.log("✅ AuthContext: Profile refreshed on foreground");
            } catch (e) {
              console.log(
                "⚠️ AuthContext: Profile refresh on foreground failed:",
                e,
              );
            }
          }
        }
        appStateRef.current = nextState;
      },
    );
    return () => subscription.remove();
  }, []);

  // Periodic token refresh - check every 30 minutes
  useEffect(() => {
    if (!user) return;

    console.log("⏰ Setting up periodic token refresh (every 30 minutes)");

    // Check immediately
    AuthService.ensureTokenFresh();

    // Then check every 30 minutes
    const interval = setInterval(
      () => {
        console.log("⏰ Periodic token refresh check...");
        AuthService.ensureTokenFresh();
      },
      30 * 60 * 1000,
    ); // 30 minutes

    return () => {
      console.log("⏰ Clearing periodic token refresh");
      clearInterval(interval);
    };
  }, [user]);

  const checkAuthStatus = async () => {
    try {
      console.log("🔐 AuthContext: Starting auto-login check...");
      setIsLoading(true);

      // Use the new auto-login method
      const userData = await AuthService.attemptAutoLogin();

      if (userData) {
        console.log(
          "✅ AuthContext: Auto-login successful for user:",
          userData.id,
        );
        setUser(userData);

        // Immediately show cached profile so the UI has data while we fetch fresh
        const cachedProfile = await AuthService.getCachedStudentProfile();
        if (cachedProfile) {
          setStudentProfile(cachedProfile);
          console.log("✅ AuthContext: Loaded cached student profile");
        }

        // Ensure token is fresh BEFORE making any API calls
        await AuthService.ensureTokenFresh();

        // Fetch fresh profile from the server
        try {
          const profileResponse = await StudentAPI.getStudentProfile(
            userData.id,
          );
          const profileData = (profileResponse as any)?.success
            ? (profileResponse as any).data
            : profileResponse;
          setStudentProfile(profileData);
          await AuthService.cacheStudentProfile(profileData);
          console.log(
            "✅ AuthContext: Student profile loaded and cached:",
            profileData,
          );
        } catch (profileError) {
          console.log(
            "⚠️ AuthContext: Failed to load fresh student profile (using cached):",
            profileError,
          );
          // cachedProfile (if any) is already set above — user still sees data
        }
      } else {
        // No stored credentials, only then clear user
        setUser(null);
        setStudentProfile(null);
      }
    } catch (error) {
      console.log(
        "❌ AuthContext: Auto-login error (keeping user logged in):",
        error,
      );
      // Do NOT clear user or studentProfile on error
    } finally {
      console.log("🔐 AuthContext: Auto-login check completed");
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      const response = await AuthService.login(credentials);
      setUser(response.user);

      console.log("✅ Login successful - user will stay logged in");
      console.log("✅ Token and user data saved to device storage");

      // Load student profile after successful login
      try {
        const profileResponse = await StudentAPI.getStudentProfile(
          response.user.id,
        );
        const profileData = (profileResponse as any)?.success
          ? (profileResponse as any).data
          : profileResponse;
        setStudentProfile(profileData);
        await AuthService.cacheStudentProfile(profileData);
        console.log(
          "✅ AuthContext: Student profile loaded and cached on login:",
          profileData,
        );
      } catch (profileError) {
        console.log(
          "⚠️ AuthContext: Failed to load student profile on login:",
          profileError,
        );
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await AuthService.logout();
      setUser(null);
      setStudentProfile(null);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const currentUser = await AuthService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }
    } catch (error) {
      console.error("Refresh user error:", error);
    }
  };

  const refreshStudentProfile = async () => {
    if (!user?.id) return;

    try {
      const profileResponse = await StudentAPI.getStudentProfile(user.id);
      const profileData = (profileResponse as any)?.success
        ? (profileResponse as any).data
        : profileResponse;
      setStudentProfile(profileData);
      await AuthService.cacheStudentProfile(profileData);
      console.log(
        "✅ AuthContext: Student profile refreshed and cached:",
        profileData,
      );
    } catch (error) {
      console.error(
        "⚠️ AuthContext: Failed to refresh student profile:",
        error,
      );
    }
  };

  const value: AuthContextType = {
    user,
    studentProfile,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUser,
    refreshStudentProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
