import React, { useEffect, useRef } from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { Provider as PaperProvider, MD3LightTheme } from "react-native-paper";
import { StatusBar } from "expo-status-bar";
import * as Notifications from "expo-notifications";
import { AuthProvider } from "./src/contexts/AuthContext";
import {
  NotificationBadgeProvider,
  useNotificationBadge,
} from "./src/contexts/NotificationBadgeContext";
import AppNavigator from "./src/navigation/AppNavigator";
import { View, Text, StyleSheet } from "react-native";
import {
  registerForPushNotificationsAsync,
  addNotificationListener,
  addNotificationResponseListener,
  handleNotificationTap,
} from "./src/services/pushNotifications";
import { APP_CONFIG } from "./src/config";

// Force Light Theme for React Native Paper
const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#2196F3",
    background: "#ffffff",
    surface: "#ffffff",
    onBackground: "#000000",
    onSurface: "#000000",
  },
};

// Force Light Theme for React Navigation
const navigationTheme = {
  ...DefaultTheme,
  dark: false,
  colors: {
    ...DefaultTheme.colors,
    primary: "#2196F3",
    background: "#ffffff",
    card: "#ffffff",
    text: "#000000",
    border: "#e0e0e0",
    notification: "#2196F3",
  },
};

// Error Boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("App Error:", error);
    console.error("Error Info:", errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>App Error</Text>
          <Text style={styles.errorText}>
            {this.state.error?.message || "Something went wrong"}
          </Text>
          <Text style={styles.errorDetails}>
            Check your internet connection and try restarting the app.
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

// Main App component with push notification setup
function AppWithNotifications() {
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);
  const navigationRef = useRef<any>(null);
  const { incrementUnread, refreshUnreadCount } = useNotificationBadge();

  useEffect(() => {
    // Setup push notifications if enabled (disabled in Expo Go)
    setupPushNotifications();

    return () => {
      // Cleanup notification listeners
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  const setupPushNotifications = async () => {
    try {
      // Check if push notifications are enabled (disabled in Expo Go)
      if (!APP_CONFIG.FEATURES.ENABLE_PUSH_NOTIFICATIONS) {
        console.log(
          "📱 Push notifications disabled in Expo Go - using notification polling instead"
        );
        return;
      }

      // Register for push notifications
      const studentId = APP_CONFIG.DEFAULT_STUDENT_ID; // Replace with actual student ID from auth
      await registerForPushNotificationsAsync(studentId);

      // Listen for notifications when app is running
      notificationListener.current = addNotificationListener((notification) => {
        console.log("🔔 Notification received while app active:", notification);
        // Increment unread count when notification is received
        incrementUnread();
      });

      // Listen for user tapping on notifications
      responseListener.current = addNotificationResponseListener((response) => {
        console.log("🔔 Notification tapped:", response);
        handleNotificationTap(response.notification, navigationRef.current);
        // Refresh unread count after user interacts with notification
        setTimeout(() => refreshUnreadCount(), 1000);
      });

      console.log("✅ Push notifications setup complete");
    } catch (error) {
      console.error("❌ Error setting up push notifications:", error);
      // Don't crash the app if push notifications fail
    }
  };

  return (
    <NavigationContainer ref={navigationRef} theme={navigationTheme}>
      <AppNavigator />
      <StatusBar style="dark" backgroundColor="#ffffff" />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <PaperProvider theme={lightTheme}>
        <AuthProvider>
          <NotificationBadgeProvider>
            <AppWithNotificationsWrapper />
          </NotificationBadgeProvider>
        </AuthProvider>
      </PaperProvider>
    </ErrorBoundary>
  );
}

// Wrapper component to use notification badge context
function AppWithNotificationsWrapper() {
  return <AppWithNotifications />;
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#f44336",
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginBottom: 16,
  },
  errorDetails: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
});
