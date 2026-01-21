import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { AppState } from "react-native";
import * as Notifications from "expo-notifications";
import StudentAPI from "../services/api";
import { APP_CONFIG } from "../config";
import { useAuth } from "./AuthContext";

interface NotificationBadgeContextType {
  unreadCount: number;
  refreshUnreadCount: () => Promise<void>;
  markAsRead: (notificationId: string) => void;
  incrementUnread: () => void;
}

const NotificationBadgeContext = createContext<
  NotificationBadgeContextType | undefined
>(undefined);

export function NotificationBadgeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  const refreshUnreadCount = useCallback(async () => {
    if (!user?.id) return;

    try {
      console.log("🔢 Refreshing unread notification count...");

      // Fetch first page of notifications to count unread
      const response = await StudentAPI.getMobileNotifications(user.id, 1, 50);

      if (response.success && response.data?.notifications) {
        const unread = response.data.notifications.filter(
          (n: any) => !n.isRead
        ).length;
        setUnreadCount(unread);
        console.log("🔢 Unread notifications count:", unread);

        // Update app icon badge to match
        try {
          await Notifications.setBadgeCountAsync(unread);
          console.log("📱 App icon badge set to:", unread);
        } catch (error) {
          console.error("❌ Error setting badge count:", error);
        }
      }
    } catch (error) {
      console.error("❌ Error fetching unread count:", error);
      // Don't update count on error - keep existing count
    }
  }, [user?.id]);

  const markAsRead = useCallback((notificationId: string) => {
    setUnreadCount((prev) => {
      const newCount = Math.max(0, prev - 1);
      // Update app icon badge
      Notifications.setBadgeCountAsync(newCount).catch(console.error);
      return newCount;
    });
  }, []);

  const incrementUnread = useCallback(() => {
    setUnreadCount((prev) => {
      const newCount = prev + 1;
      // Update app icon badge
      Notifications.setBadgeCountAsync(newCount).catch(console.error);
      return newCount;
    });
  }, []);

  // Refresh count when app gains focus using AppState instead of useFocusEffect
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === "active") {
        refreshUnreadCount();
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );
    return () => subscription?.remove();
  }, [refreshUnreadCount]);

  // Initial load
  useEffect(() => {
    if (user?.id) {
      refreshUnreadCount();
    }
  }, [user?.id, refreshUnreadCount]);

  const value: NotificationBadgeContextType = {
    unreadCount,
    refreshUnreadCount,
    markAsRead,
    incrementUnread,
  };

  return (
    <NotificationBadgeContext.Provider value={value}>
      {children}
    </NotificationBadgeContext.Provider>
  );
}

export function useNotificationBadge(): NotificationBadgeContextType {
  const context = useContext(NotificationBadgeContext);
  if (context === undefined) {
    throw new Error(
      "useNotificationBadge must be used within a NotificationBadgeProvider"
    );
  }
  return context;
}
