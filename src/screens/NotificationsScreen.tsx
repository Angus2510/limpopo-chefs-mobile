import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import StudentAPI from "../services/api";
import { useNotificationBadge } from "../contexts/NotificationBadgeContext";
import { useAuth } from "../contexts/AuthContext";
import { APP_CONFIG } from "../config";

interface MobileNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  createdAt: string;
  isRead: boolean;
}

interface NotificationsScreenProps {
  route?: {
    params?: {
      notificationId?: string;
      highlightNotification?: boolean;
    };
  };
}

export default function NotificationsScreen({
  route,
}: NotificationsScreenProps) {
  const [notifications, setNotifications] = useState<MobileNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [highlightedNotificationId, setHighlightedNotificationId] = useState<
    string | null
  >(null);

  const { markAsRead: updateBadgeCount, refreshUnreadCount } =
    useNotificationBadge();
  const { user, isAuthenticated } = useAuth();

  // Get actual student ID from authenticated user
  const studentId = user?.id;

  useFocusEffect(
    useCallback(() => {
      fetchNotifications(true);

      // Handle navigation from notification tap
      if (
        route?.params?.notificationId &&
        route?.params?.highlightNotification
      ) {
        setHighlightedNotificationId(route.params.notificationId);

        // Clear highlight after 3 seconds
        setTimeout(() => {
          setHighlightedNotificationId(null);
        }, 3000);
      }
    }, [route?.params])
  );

  const fetchNotifications = async (reset = false) => {
    if (!isAuthenticated || !studentId) {
      console.log("❌ NotificationsScreen: No authenticated user");
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      const currentPage = reset ? 1 : page;
      setLoading(reset);

      console.log(
        `📱 NotificationsScreen: Fetching notifications for user ${studentId}, page ${currentPage}`
      );

      const response = await StudentAPI.getMobileNotifications(
        studentId,
        currentPage,
        20
      );

      console.log(
        `📱 NotificationsScreen: Response received:`,
        JSON.stringify(response, null, 2)
      );

      if (response.success && response.data) {
        const newNotifications = response.data.notifications || [];

        console.log(
          `📱 NotificationsScreen: Found ${newNotifications.length} notifications`
        );

        if (reset) {
          setNotifications(newNotifications);
          setPage(2);
        } else {
          setNotifications((prev) => [...prev, ...newNotifications]);
          setPage((prev) => prev + 1);
        }

        // Check if there are more pages
        const pagination = response.data.pagination;
        setHasMore(pagination ? currentPage < pagination.pages : false);
      } else {
        console.log(
          "❌ NotificationsScreen: Invalid response structure:",
          response
        );
        Alert.alert("Error", "Invalid response format from server");
      }
    } catch (error: any) {
      console.error(
        "❌ NotificationsScreen: Error fetching notifications:",
        error
      );
      Alert.alert(
        "Error",
        `Failed to fetch notifications: ${error.message || "Unknown error"}`
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNotifications(true);
    // Also refresh the badge count
    refreshUnreadCount();
  };

  const markAsRead = async (notificationId: string) => {
    if (!studentId) {
      console.log("❌ NotificationsScreen: No student ID for marking as read");
      return;
    }

    // Check if notification is already read
    const notification = notifications.find((n) => n.id === notificationId);
    if (notification?.isRead) {
      console.log("📖 Notification already marked as read:", notificationId);
      return;
    }

    try {
      console.log("📖 Marking notification as read:", notificationId);
      await StudentAPI.markMobileNotificationAsRead(studentId, notificationId);

      // Update local state
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );

      // Update badge count
      updateBadgeCount(notificationId);
      console.log("✅ Notification marked as read successfully");
    } catch (error) {
      console.error("Error marking notification as read:", error);
      // Don't show error to user as this is not critical
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchNotifications(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "#FF3B30";
      case "high":
        return "#FF9500";
      case "normal":
        return "#007AFF";
      default:
        return "#8E8E93";
    }
  };

  const renderNotification = ({ item }: { item: MobileNotification }) => {
    const isHighlighted = highlightedNotificationId === item.id;

    return (
      <TouchableOpacity
        style={[
          styles.notificationItem,
          !item.isRead && styles.unread,
          isHighlighted && styles.highlighted,
        ]}
        onPress={() => markAsRead(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.notificationHeader}>
          <Text style={[styles.title, !item.isRead && styles.unreadTitle]}>
            {item.title}
          </Text>
          <View style={styles.metaInfo}>
            <Text style={styles.timestamp}>
              {new Date(item.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
            {!item.isRead && <View style={styles.unreadDot} />}
          </View>
        </View>

        <Text style={[styles.message, !item.isRead && styles.unreadMessage]}>
          {item.message}
        </Text>

        <View style={styles.notificationFooter}>
          <View style={styles.typeContainer}>
            <Text style={styles.typeText}>{item.type}</Text>
          </View>

          {item.priority !== "normal" && (
            <View
              style={[
                styles.priorityBadge,
                { backgroundColor: getPriorityColor(item.priority) },
              ]}
            >
              <Text style={styles.priorityText}>
                {item.priority.toUpperCase()}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderFooter = () => {
    if (!loading || page === 1) return null;

    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={APP_CONFIG.COLORS.PRIMARY} />
        <Text style={styles.loadingText}>Loading more notifications...</Text>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No Notifications</Text>
      <Text style={styles.emptyText}>
        You'll receive notifications from the academy here when they're sent.
      </Text>
    </View>
  );

  if (!isAuthenticated || !studentId) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Please log in</Text>
        <Text style={styles.emptyText}>
          You need to be logged in to view notifications.
        </Text>
      </View>
    );
  }

  if (loading && page === 1) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={APP_CONFIG.COLORS.PRIMARY} />
        <Text style={styles.loadingText}>Loading notifications...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotification}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[APP_CONFIG.COLORS.PRIMARY]}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          notifications.length === 0 ? styles.emptyList : undefined
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_CONFIG.COLORS.BACKGROUND,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: APP_CONFIG.COLORS.BACKGROUND,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: APP_CONFIG.COLORS.TEXT_SECONDARY,
  },
  notificationItem: {
    backgroundColor: "white",
    padding: 16,
    marginVertical: 4,
    marginHorizontal: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  unread: {
    borderLeftWidth: 4,
    borderLeftColor: APP_CONFIG.COLORS.PRIMARY,
    backgroundColor: "#F8F9FF",
  },
  highlighted: {
    borderColor: APP_CONFIG.COLORS.WARNING,
    borderWidth: 2,
    backgroundColor: "#FFF9E5",
  },
  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: APP_CONFIG.COLORS.TEXT_PRIMARY,
    flex: 1,
    marginRight: 8,
  },
  unreadTitle: {
    fontWeight: "700",
    color: "#000",
  },
  metaInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  timestamp: {
    fontSize: 12,
    color: APP_CONFIG.COLORS.TEXT_SECONDARY,
    marginRight: 8,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: APP_CONFIG.COLORS.PRIMARY,
  },
  message: {
    fontSize: 14,
    color: APP_CONFIG.COLORS.TEXT_PRIMARY,
    lineHeight: 20,
    marginBottom: 12,
  },
  unreadMessage: {
    color: "#000",
  },
  notificationFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  typeContainer: {
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 12,
    color: APP_CONFIG.COLORS.TEXT_SECONDARY,
    fontWeight: "500",
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityText: {
    color: "white",
    fontSize: 12,
    fontWeight: "700",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: APP_CONFIG.COLORS.TEXT_PRIMARY,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: APP_CONFIG.COLORS.TEXT_SECONDARY,
    textAlign: "center",
    lineHeight: 24,
  },
  loadingFooter: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
  },
});
