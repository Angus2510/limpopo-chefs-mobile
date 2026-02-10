import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  TouchableOpacity,
  Image,
} from "react-native";
import {
  Card,
  Title,
  Paragraph,
  Button,
  ActivityIndicator,
} from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import StudentAPI from "../services/api";
import { DashboardData, Student } from "../types";
import { useAuth } from "../contexts/AuthContext";

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high":
      return "#f44336";
    case "medium":
      return "#FF9800";
    case "low":
      return "#4CAF50";
    default:
      return "#757575";
  }
};

export default function DashboardScreen() {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const { user, studentProfile, isAuthenticated, refreshStudentProfile } =
    useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = async () => {
    if (!isAuthenticated || !user?.id) {
      console.log("❌ Dashboard: No authenticated user");
      setLoading(false);
      return;
    }

    try {
      console.log("🔍 Dashboard: Loading data for user:", user.id);

      // Load actual student profile
      let profile = null;
      try {
        const apiResponse = await StudentAPI.getStudentProfile(user.id);
        console.log(
          "✅ Dashboard: Profile loaded from API:",
          JSON.stringify(apiResponse, null, 2),
        );

        if ((apiResponse as any)?.success && (apiResponse as any)?.data) {
          const studentData = (apiResponse as any).data.student;
          profile = {
            id: studentData.id || user.id,
            name: `${
              studentData.profile?.firstName || user?.firstName || "Student"
            } ${studentData.profile?.lastName || user?.lastName || ""}`.trim(),
            email: studentData.email || user?.email || "",
            studentNumber:
              studentData.admissionNumber || studentData.username || user.id,
            course: studentData.qualificationTitle || "Not enrolled",
            year: 1,
            profileImage: studentData.avatarUrl || undefined,
            campus: studentData.campusTitle || "",
            intakeGroup: studentData.intakeGroupTitle || "",
            intakeGroupId:
              studentData.intakeGroup || studentData.intakeGroupId || [],
          };
        }
      } catch (error) {
        console.log("⚠️ Dashboard: Profile API failed, using basic user data");
        profile = {
          id: user.id,
          name:
            `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
            "Student",
          email: user.email || "",
          studentNumber: user.id,
          course: "Culinary Arts",
          year: 1,
          profileImage: undefined,
        };
      }

      // Student profile now comes from centralized AuthContext

      // Load real events from API
      let upcomingEvents = [];
      try {
        console.log("📅 Dashboard: Loading events for user:", user.id);
        const eventsResponse = await StudentAPI.getEvents(user.id);
        console.log(
          "✅ Dashboard: Events response from API:",
          JSON.stringify(eventsResponse, null, 2),
        );

        // Extract events array from response - handle different response structures
        let eventsData = [];
        if (Array.isArray(eventsResponse)) {
          eventsData = eventsResponse;
        } else if (eventsResponse && typeof eventsResponse === "object") {
          const response = eventsResponse as any;
          if (response.events && Array.isArray(response.events)) {
            eventsData = response.events;
          } else if (response.data && Array.isArray(response.data)) {
            eventsData = response.data;
          } else {
            // Try to find an array property in the response
            const possibleArrays = Object.values(response).filter(
              Array.isArray,
            );
            if (possibleArrays.length > 0) {
              eventsData = possibleArrays[0] as any[];
            }
          }
        }

        console.log(
          `✅ Dashboard: Extracted ${eventsData.length} events from response`,
        );

        // Filter for today's events only using the same logic as WeeklyCalendarScreen
        const today = new Date();

        let todaysEvents = eventsData.filter((event: any) => {
          try {
            // Extract date parts directly from the string to avoid timezone conversion
            let eventDateString = event.startDate || event.date;
            
            // Handle different date formats from server
            if (eventDateString.includes('T')) {
              eventDateString = eventDateString.split('T')[0]; // Get "2026-02-11" part
            }
            
            // Parse date components manually to avoid timezone issues
            const [eventYear, eventMonth, eventDay] = eventDateString.split('-').map(Number);
            
            // Create a date object from the parsed components and add 1 day to compensate for server timezone issue
            const eventDate = new Date(eventYear, eventMonth - 1, eventDay); // month is 0-indexed in Date constructor
            eventDate.setDate(eventDate.getDate() + 1); // Add 1 day to compensate for server timezone shift
            
            // Get adjusted event date components
            const adjustedYear = eventDate.getFullYear();
            const adjustedMonth = eventDate.getMonth() + 1; // Convert back to 1-12
            const adjustedDay = eventDate.getDate();
            
            // Get local date components
            const localYear = today.getFullYear();
            const localMonth = today.getMonth() + 1; // getMonth() returns 0-11, but we want 1-12
            const localDay = today.getDate();

            const matches = adjustedYear === localYear && adjustedMonth === localMonth && adjustedDay === localDay;

            if (matches) {
              console.log("📅 Dashboard: Event matches today's date:", {
                eventTitle: event.title,
                originalEventDate: eventDateString,
                adjustedEventDate: eventDate.toDateString(),
                todayDate: today.toDateString(),
              });
            }

            return matches;
          } catch (error) {
            console.error("❌ Dashboard: Error parsing event date:", event.startDate || event.date, error);
            return false;
          }
        });

        console.log(
          `📅 Dashboard: Found ${todaysEvents.length} events for today`,
        );
        console.log(`📅 Dashboard: Profile data:`, profile);

        // Apply the same filtering logic as WeeklyCalendarScreen for student-specific events
        todaysEvents = todaysEvents.filter((event: any) => {
          // Check if the student is individually assigned to this event
          if (event.assignedToStudents && Array.isArray(event.assignedToStudents)) {
            const isIndividuallyAssigned = event.assignedToStudents.includes(user.id);
            if (isIndividuallyAssigned) {
              console.log(`📅 Dashboard: Event "${event.title}" individually assigned to user`);
              return true;
            }
          }

          // Check if the event is assigned to the user's intake group
          if (event.assignedToModel && Array.isArray(event.assignedToModel) && event.assignedToModel.length > 0) {
            // Handle case where user has multiple intake group IDs (array)
            if (profile?.intakeGroupId && Array.isArray(profile.intakeGroupId) && profile.intakeGroupId.length > 0) {
              const hasGroupMatch = profile.intakeGroupId.some((userGroupId: string) =>
                event.assignedToModel.includes(userGroupId)
              );
              if (hasGroupMatch) {
                console.log(`📅 Dashboard: Event "${event.title}" assigned to user's intake group (array)`);
                return true;
              }
            }
            // Handle case where user has single intake group ID (string)
            else if (profile?.intakeGroupId && typeof profile.intakeGroupId === "string") {
              const hasGroupMatch = event.assignedToModel.includes(profile.intakeGroupId);
              if (hasGroupMatch) {
                console.log(`📅 Dashboard: Event "${event.title}" assigned to user's intake group (string)`);
                return true;
              }
            }
          }

          // If event has no assignments at all (legacy events), show them
          if ((!event.assignedToModel || event.assignedToModel.length === 0) && 
              (!event.assignedToStudents || event.assignedToStudents.length === 0)) {
            console.log(`📅 Dashboard: Event "${event.title}" has no assignments (legacy)`);
            return true;
          }

          // Event is assigned but user is not included
          console.log(`📅 Dashboard: Event "${event.title}" filtered out - user not assigned`);
          return false;
        });

        console.log(
          `📅 Dashboard: After assignment filtering: ${todaysEvents.length} events`
        );

        // Filter by campus if available
        if (profile?.campus) {
          console.log(`📅 Dashboard: Filtering by campus: ${profile.campus}`);
          todaysEvents = todaysEvents.filter((event: any) => {
            if (!event.campus || event.campus === "") {
              return true; // Show events with no campus specified
            }

            // Handle variations: "Mokopane" vs "polokwane" etc.
            const userCampus = profile.campus
              .toLowerCase()
              .replace(/[^a-z]/g, "");
            const eventCampus = event.campus
              .toLowerCase()
              .replace(/[^a-z]/g, "");

            return (
              userCampus === eventCampus ||
              userCampus.includes(eventCampus) ||
              eventCampus.includes(userCampus)
            );
          });
          console.log(
            `📅 Dashboard: After campus filter: ${todaysEvents.length} events`,
          );
        }

        upcomingEvents = todaysEvents.slice(0, 5); // Take up to 5 events for today

        console.log("📅 Dashboard: Filtered upcoming events:", upcomingEvents);
      } catch (error) {
        console.log("⚠️ Dashboard: Events API failed, using mock data");
        // Fallback to mock events with real profile data
        const todayStr = new Date().toISOString().split("T")[0];
        upcomingEvents = [
          {
            id: "1",
            title: "Basic Knife Skills Lecture",
            startDate: todayStr,
            startTime: "09:00",
            endTime: "10:30",
            details: "Introduction to knife handling techniques",
            lecturer: "Chef Johnson",
            venue: "Kitchen Lab A",
            campus: profile?.campus || "Main Campus",
            color: "lecture",
            assignedToModel: [profile?.intakeGroup || "2025 Intake"],
          },
          {
            id: "2",
            title: "Food Safety Practical",
            startDate: todayStr,
            startTime: "14:00",
            endTime: "16:00",
            details: "HACCP principles hands-on",
            lecturer: "Chef Smith",
            venue: "Kitchen Lab B",
            campus: profile?.campus || "Main Campus",
            color: "practical",
            assignedToModel: [profile?.intakeGroup || "2025 Intake"],
          },
        ];
      }

      // Create dashboard data with real profile and events
      const dashboardData: DashboardData = {
        student: profile as Student,
        upcomingEvents: upcomingEvents,
        recentAttendance: [
          {
            id: "1",
            date: "2025-10-06",
            status: "full",
            timeCheckedIn: "08:00",
          },
          {
            id: "2",
            date: "2025-10-05",
            status: "full",
            timeCheckedIn: "08:15",
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
        announcements: await (async () => {
          try {
            const announcements = await StudentAPI.getAnnouncements(user.id);
            return announcements.sort((a, b) => {
              // Sort by priority first, then by date
              const priorityOrder = { high: 3, medium: 2, low: 1 };
              const priorityDiff =
                priorityOrder[b.priority] - priorityOrder[a.priority];
              if (priorityDiff !== 0) return priorityDiff;
              return new Date(b.date).getTime() - new Date(a.date).getTime();
            });
          } catch (error) {
            console.log("⚠️ Dashboard: Failed to load announcements", error);
            return [];
          }
        })(),
      };
      setDashboardData(dashboardData);
    } catch (error) {
      Alert.alert("Error", "Failed to load dashboard data");
      console.error("Dashboard load error:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshStudentProfile(), loadDashboardData()]);
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
      {/* App Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={require("../assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Welcome Card */}
      <Card style={styles.welcomeCard}>
        <Card.Content>
          <Title>Welcome back, {dashboardData.student.name}!</Title>
          <Paragraph>Username: {dashboardData.student.studentNumber}</Paragraph>
          <Paragraph>Qualification: {dashboardData.student.course}</Paragraph>
          {studentProfile?.campus && (
            <Paragraph>Campus: {studentProfile.campus}</Paragraph>
          )}
          {studentProfile?.intakeGroup && (
            <Paragraph>Intake: {studentProfile.intakeGroup}</Paragraph>
          )}
        </Card.Content>
      </Card>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="calendar" size={24} color="#014b01" />
          <Text style={styles.statNumber}>
            {dashboardData.upcomingEvents.length}
          </Text>
          <Text style={styles.statLabel}>Daily Roster</Text>
        </View>
        <TouchableOpacity
          style={styles.statCard}
          onPress={() => navigation.navigate("More" as any, { screen: "Fees" })}
          activeOpacity={0.7}
        >
          <Ionicons name="cash" size={24} color="#ff6b6b" />
          <Text style={styles.statNumber}>
            {dashboardData.pendingFees.length}
          </Text>
          <Text style={styles.statLabel}>Pending Fees</Text>
        </TouchableOpacity>
      </View>

      {/* Daily Roster */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Daily Roster</Title>
          {dashboardData.upcomingEvents.length > 0 ? (
            dashboardData.upcomingEvents.slice(0, 3).map((event) => (
              <TouchableOpacity key={event.id} style={styles.assignmentItem}>
                <View style={styles.assignmentContent}>
                  <Text style={styles.assignmentTitle}>{event.title}</Text>
                  <Text style={styles.assignmentDue}>
                    {new Date(event.startDate).toLocaleDateString()} at{" "}
                    {event.startTime}
                  </Text>
                  <Text style={styles.eventDetails}>
                    {event.lecturer} • {event.venue}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </TouchableOpacity>
            ))
          ) : (
            <Paragraph>No upcoming events</Paragraph>
          )}
          <Button
            mode="text"
            style={styles.viewAllButton}
            onPress={() =>
              navigation.navigate("More" as any, { screen: "WeeklyCalendar" })
            }
          >
            View Weekly Roster
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
      <Card style={[styles.card, styles.lastCard]}>
        <Card.Content>
          <Title>Notifications</Title>
          {dashboardData.announcements.length > 0 ? (
            dashboardData.announcements.slice(0, 2).map((announcement) => (
              <View
                key={announcement.id}
                style={[
                  styles.announcementItem,
                  {
                    borderLeftColor: getPriorityColor(announcement.priority),
                    borderLeftWidth: 4,
                  },
                ]}
              >
                <View style={styles.announcementHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.announcementTitle}>
                      {announcement.title}
                    </Text>
                    <Text
                      style={[
                        styles.priorityIndicator,
                        { color: getPriorityColor(announcement.priority) },
                      ]}
                    >
                      {announcement.priority.toUpperCase()}
                    </Text>
                  </View>
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
            <Paragraph>No new notifications</Paragraph>
          )}
          {dashboardData.announcements.length > 0 && (
            <Button
              mode="text"
              onPress={() => navigation.navigate("Announcements")}
              style={{ marginTop: 8 }}
            >
              View All Announcements
            </Button>
          )}
        </Card.Content>
      </Card>

      {/* Quick Actions removed per request */}
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
    paddingTop: 48,
    paddingBottom: 100,
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
    color: "#014b01",
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
  lastCard: {
    marginBottom: 80,
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
  eventDetails: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
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
  priorityIndicator: {
    fontSize: 10,
    fontWeight: "600",
    marginTop: 2,
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
    color: "#014b01",
    marginTop: 8,
    textAlign: "center",
  },
  viewAllButton: {
    marginTop: 8,
  },
  logoContainer: {
    alignItems: "center",
    paddingVertical: 20,
    backgroundColor: "#fff",
    marginBottom: 10,
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
  },
  logo: {
    width: "60%",
    height: 100,
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
});
