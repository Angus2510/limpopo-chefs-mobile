import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
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

  // Check authentication status on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const isAuth = await AuthService.isAuthenticated();

      if (isAuth) {
        const userData = await AuthService.getUser();
        setUser(userData);

        // Try to refresh user data from server
        const currentUser = await AuthService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);

          // Load student profile data
          try {
            const profileResponse = await StudentAPI.getStudentProfile(
              currentUser.id
            );
            const profileData = (profileResponse as any)?.success
              ? (profileResponse as any).data
              : profileResponse;
            setStudentProfile(profileData);
            console.log("✅ AuthContext: Student profile loaded:", profileData);
          } catch (profileError) {
            console.log(
              "⚠️ AuthContext: Failed to load student profile:",
              profileError
            );
          }
        }
      }
    } catch (error) {
      console.log("Auth check error:", error);
      // If there's an error, clear any stored auth data
      await AuthService.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      const response = await AuthService.login(credentials);
      setUser(response.user);

      // Load student profile after successful login
      try {
        const profileResponse = await StudentAPI.getStudentProfile(
          response.user.id
        );
        const profileData = (profileResponse as any)?.success
          ? (profileResponse as any).data
          : profileResponse;
        setStudentProfile(profileData);
        console.log(
          "✅ AuthContext: Student profile loaded on login:",
          profileData
        );
      } catch (profileError) {
        console.log(
          "⚠️ AuthContext: Failed to load student profile on login:",
          profileError
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
      console.log("✅ AuthContext: Student profile refreshed:", profileData);
    } catch (error) {
      console.error(
        "⚠️ AuthContext: Failed to refresh student profile:",
        error
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
