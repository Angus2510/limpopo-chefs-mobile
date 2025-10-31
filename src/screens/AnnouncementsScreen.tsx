import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
import {
  Card,
  Title,
  Paragraph,
  Chip,
  ActivityIndicator,
  FAB,
} from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";
import StudentAPI from "../services/api";
import { Announcement } from "../types";

export default function AnnouncementsScreen() {
  const { user, isAuthenticated } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [markingAsRead, setMarkingAsRead] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      loadAnnouncements();
    }
  }, [user?.id, isAuthenticated]);

  const loadAnnouncements = async () => {
    if (!isAuthenticated || !user?.id) return;

    try {
      setLoading(true);
      console.log("📢 Loading announcements for user:", user.id);

      const announcements = await StudentAPI.getAnnouncements(user.id);

      console.log("📢 Announcements loaded:", {
        count: announcements?.length || 0,
        unreadCount: announcements?.filter((a) => !a.read).length || 0,
      });

      // Ensure announcements is always an array
      if (Array.isArray(announcements)) {
        // Sort by date (newest first) and priority
        const sortedAnnouncements = announcements.sort((a, b) => {
          // First sort by read status (unread first)
          if (a.read !== b.read) {
            return a.read ? 1 : -1;
          }
          // Then by priority (high first)
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          if (a.priority !== b.priority) {
            return priorityOrder[b.priority] - priorityOrder[a.priority];
          }
          // Finally by date (newest first)
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });

        setAnnouncements(sortedAnnouncements);
      } else {
        console.warn("⚠️ Announcements is not an array:", typeof announcements);
        setAnnouncements([]);
      }
    } catch (error) {
      console.error("Error fetching announcements:", error);
      setAnnouncements([]);
      Alert.alert("Error", "Failed to load announcements");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnnouncements();
    setRefreshing(false);
  };

  const handleMarkAsRead = async (announcementId: string) => {
    try {
      setMarkingAsRead((prev) => new Set(prev).add(announcementId));

      await StudentAPI.markAnnouncementAsRead(announcementId);

      // Update local state
      setAnnouncements((prev) =>
        prev.map((announcement) =>
          announcement.id === announcementId
            ? { ...announcement, read: true }
            : announcement
        )
      );

      console.log("✅ Marked announcement as read:", announcementId);
    } catch (error) {
      console.error("Error marking announcement as read:", error);
      Alert.alert("Error", "Failed to mark announcement as read");
    } finally {
      setMarkingAsRead((prev) => {
        const newSet = new Set(prev);
        newSet.delete(announcementId);
        return newSet;
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    const unreadAnnouncements = announcements.filter((a) => !a.read);

    if (unreadAnnouncements.length === 0) {
      Alert.alert("Info", "All announcements are already marked as read");
      return;
    }

    Alert.alert(
      "Mark All as Read",
      `Mark ${unreadAnnouncements.length} announcements as read?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Mark All",
          onPress: async () => {
            try {
              // Mark all unread announcements as read
              const promises = unreadAnnouncements.map((announcement) =>
                StudentAPI.markAnnouncementAsRead(announcement.id)
              );

              await Promise.all(promises);

              // Update local state
              setAnnouncements((prev) =>
                prev.map((announcement) => ({ ...announcement, read: true }))
              );

              console.log("✅ Marked all announcements as read");
            } catch (error) {
              console.error("Error marking all announcements as read:", error);
              Alert.alert("Error", "Failed to mark all announcements as read");
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return "Today";
    } else if (diffDays === 2) {
      return "Yesterday";
    } else if (diffDays <= 7) {
      return `${diffDays - 1} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "#f44336";
      case "medium":
        return "#ff9800";
      case "low":
        return "#4caf50";
      default:
        return "#757575";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return "alert-circle";
      case "medium":
        return "information-circle";
      case "low":
        return "checkmark-circle";
      default:
        return "notifications";
    }
  };

  const renderAnnouncementItem = (announcement: Announcement) => {
    const isMarkingRead = markingAsRead.has(announcement.id);

    return (
      <Card
        key={announcement.id}
        style={[
          styles.announcementCard,
          !announcement.read && styles.unreadCard,
        ]}
      >
        <Card.Content>
          <View style={styles.announcementHeader}>
            <View style={styles.announcementInfo}>
              <View style={styles.titleRow}>
                <Title
                  style={[
                    styles.announcementTitle,
                    !announcement.read && styles.unreadTitle,
                  ]}
                >
                  {announcement.title}
                </Title>
                {!announcement.read && <View style={styles.unreadIndicator} />}
              </View>

              <View style={styles.metaRow}>
                <Chip
                  style={[
                    styles.priorityChip,
                    {
                      backgroundColor: getPriorityColor(announcement.priority),
                    },
                  ]}
                  textStyle={styles.priorityText}
                  icon={getPriorityIcon(announcement.priority)}
                  compact
                >
                  {announcement.priority.toUpperCase()}
                </Chip>
                <Text style={styles.dateText}>
                  {formatDate(announcement.date)}
                </Text>
              </View>
            </View>

            {!announcement.read && (
              <TouchableOpacity
                style={styles.markReadButton}
                onPress={() => handleMarkAsRead(announcement.id)}
                disabled={isMarkingRead}
              >
                {isMarkingRead ? (
                  <ActivityIndicator size="small" color="#2196F3" />
                ) : (
                  <Ionicons name="checkmark" size={20} color="#2196F3" />
                )}
              </TouchableOpacity>
            )}
          </View>

          <Paragraph
            style={[
              styles.announcementContent,
              !announcement.read && styles.unreadContent,
            ]}
          >
            {announcement.content}
          </Paragraph>
        </Card.Content>
      </Card>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading announcements...</Text>
      </View>
    );
  }

  const unreadCount = announcements.filter((a) => !a.read).length;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Title style={styles.screenTitle}>Announcements</Title>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount} new</Text>
            </View>
          )}
        </View>

        {announcements.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-outline" size={64} color="#ccc" />
            <Text style={styles.emptyStateText}>No announcements</Text>
            <Text style={styles.emptyStateSubtext}>
              Check back later for important updates and notifications
            </Text>
          </View>
        ) : (
          <View style={styles.announcementsContainer}>
            {announcements.map(renderAnnouncementItem)}
          </View>
        )}
      </ScrollView>

      {unreadCount > 0 && (
        <FAB
          style={styles.fab}
          icon="check-all"
          label={`Mark all read (${unreadCount})`}
          onPress={handleMarkAllAsRead}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  unreadBadge: {
    backgroundColor: "#f44336",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  unreadBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  announcementsContainer: {
    padding: 16,
    paddingTop: 0,
  },
  announcementCard: {
    marginBottom: 12,
    elevation: 2,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#2196F3",
    elevation: 4,
  },
  announcementHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  announcementInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  announcementTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  unreadTitle: {
    fontWeight: "bold",
    color: "#1565C0",
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2196F3",
    marginLeft: 8,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  priorityChip: {
    marginRight: 8,
  },
  priorityText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  dateText: {
    fontSize: 12,
    color: "#888",
  },
  markReadButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#e3f2fd",
    marginLeft: 12,
  },
  announcementContent: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  unreadContent: {
    color: "#333",
    fontWeight: "500",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 64,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 32,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: "#2196F3",
  },
});
