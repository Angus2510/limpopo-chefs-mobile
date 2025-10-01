import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from "react-native";
import {
  Card,
  Title,
  Paragraph,
  Button,
  ActivityIndicator,
} from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import StudentAPI from "../services/api";
import { DashboardData } from "../types";

export default function DashboardScreen() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // This should come from authentication context
  const studentId = "current-student-id"; // Replace with actual student ID

  const loadDashboardData = async () => {
    try {
      // Mock data for demonstration
      const mockData: DashboardData = {
        student: {
          id: "current-student-id",
          name: "John Doe",
          email: "john.doe@example.com",
          studentNumber: "LCA2024001",
          course: "Culinary Arts",
          year: 2,
          profileImage: undefined,
        },
        upcomingAssignments: [
          {
            id: "1",
            title: "Basic Knife Skills Assessment",
            description: "Demonstrate proper knife handling techniques",
            dueDate: "2025-10-15T23:59:59Z",
            status: "pending",
          },
          {
            id: "2",
            title: "Food Safety Quiz",
            description: "Complete the HACCP food safety quiz",
            dueDate: "2025-10-20T23:59:59Z",
            status: "pending",
          },
        ],
        recentAttendance: [
          {
            id: "1",
            studentId: "current-student-id",
            date: "2025-09-25",
            status: "present",
            timeIn: "08:00",
            location: "Main Kitchen",
          },
          {
            id: "2",
            studentId: "current-student-id",
            date: "2025-09-24",
            status: "present",
            timeIn: "08:15",
            location: "Main Kitchen",
          },
        ],
        pendingFees: [
          {
            id: "1",
            description: "Course Materials Fee",
            amount: 500.0,
            dueDate: "2025-11-01",
            status: "unpaid",
          },
        ],
        announcements: [
          {
            id: "1",
            title: "Kitchen Renovation Update",
            content:
              "The main kitchen will be closed for renovations from Oct 15-17",
            date: "2025-09-28",
            priority: "high",
            read: false,
          },
        ],
      };
      setDashboardData(mockData);
    } catch (error) {
      Alert.alert("Error", "Failed to load dashboard data");
      console.error("Dashboard load error:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  if (!dashboardData) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#ff6b6b" />
        <Text style={styles.errorText}>Failed to load dashboard</Text>
        <Button mode="contained" onPress={loadDashboardData}>
          Retry
        </Button>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Welcome Card */}
      <Card style={styles.welcomeCard}>
        <Card.Content>
          <Title>Welcome back, {dashboardData.student.name}!</Title>
          <Paragraph>
            Student ID: {dashboardData.student.studentNumber}
          </Paragraph>
          <Paragraph>Course: {dashboardData.student.course}</Paragraph>
        </Card.Content>
      </Card>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="document-text" size={24} color="#2196F3" />
          <Text style={styles.statNumber}>
            {dashboardData.upcomingAssignments.length}
          </Text>
          <Text style={styles.statLabel}>Upcoming Assignments</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="cash" size={24} color="#ff6b6b" />
          <Text style={styles.statNumber}>
            {dashboardData.pendingFees.length}
          </Text>
          <Text style={styles.statLabel}>Pending Fees</Text>
        </View>
      </View>

      {/* Upcoming Assignments */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Upcoming Assignments</Title>
          {dashboardData.upcomingAssignments.length > 0 ? (
            dashboardData.upcomingAssignments.slice(0, 3).map((assignment) => (
              <TouchableOpacity
                key={assignment.id}
                style={styles.assignmentItem}
              >
                <View style={styles.assignmentContent}>
                  <Text style={styles.assignmentTitle}>{assignment.title}</Text>
                  <Text style={styles.assignmentDue}>
                    Due: {new Date(assignment.dueDate).toLocaleDateString()}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </TouchableOpacity>
            ))
          ) : (
            <Paragraph>No upcoming assignments</Paragraph>
          )}
          <Button mode="text" style={styles.viewAllButton}>
            View All Assignments
          </Button>
        </Card.Content>
      </Card>

      {/* Recent Attendance */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Recent Attendance</Title>
          {dashboardData.recentAttendance.length > 0 ? (
            dashboardData.recentAttendance.slice(0, 3).map((record) => (
              <View key={record.id} style={styles.attendanceItem}>
                <View style={styles.attendanceContent}>
                  <Text style={styles.attendanceDate}>
                    {new Date(record.date).toLocaleDateString()}
                  </Text>
                  <Text
                    style={[
                      styles.attendanceStatus,
                      { color: getStatusColor(record.status) },
                    ]}
                  >
                    {record.status.toUpperCase()}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Paragraph>No attendance records</Paragraph>
          )}
        </Card.Content>
      </Card>

      {/* Announcements */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Announcements</Title>
          {dashboardData.announcements.length > 0 ? (
            dashboardData.announcements.slice(0, 2).map((announcement) => (
              <View key={announcement.id} style={styles.announcementItem}>
                <View style={styles.announcementHeader}>
                  <Text style={styles.announcementTitle}>
                    {announcement.title}
                  </Text>
                  <Text style={styles.announcementDate}>
                    {new Date(announcement.date).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={styles.announcementContent} numberOfLines={2}>
                  {announcement.content}
                </Text>
              </View>
            ))
          ) : (
            <Paragraph>No new announcements</Paragraph>
          )}
        </Card.Content>
      </Card>

      {/* Quick Actions */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Quick Actions</Title>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickAction}>
              <Ionicons name="download-outline" size={32} color="#2196F3" />
              <Text style={styles.quickActionText}>Downloads</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAction}>
              <Ionicons name="person-outline" size={32} color="#2196F3" />
              <Text style={styles.quickActionText}>Profile</Text>
            </TouchableOpacity>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "present":
      return "#4caf50";
    case "late":
      return "#ff9800";
    case "absent":
      return "#f44336";
    default:
      return "#666";
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: "#666",
    marginVertical: 16,
    textAlign: "center",
  },
  welcomeCard: {
    margin: 16,
    elevation: 4,
  },
  statsContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: "white",
    padding: 16,
    marginHorizontal: 4,
    borderRadius: 8,
    alignItems: "center",
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2196F3",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginTop: 4,
  },
  card: {
    margin: 16,
    elevation: 4,
  },
  assignmentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  assignmentContent: {
    flex: 1,
  },
  assignmentTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  assignmentDue: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  attendanceItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  attendanceContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  attendanceDate: {
    fontSize: 16,
    color: "#333",
  },
  attendanceStatus: {
    fontSize: 14,
    fontWeight: "bold",
  },
  announcementItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  announcementHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  announcementTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  announcementDate: {
    fontSize: 12,
    color: "#666",
  },
  announcementContent: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
  },
  quickAction: {
    alignItems: "center",
    padding: 16,
  },
  quickActionText: {
    fontSize: 12,
    color: "#2196F3",
    marginTop: 8,
    textAlign: "center",
  },
  viewAllButton: {
    marginTop: 8,
  },
});
