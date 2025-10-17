import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Card, Title, Button } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import {
  format,
  startOfWeek,
  addDays,
  addWeeks,
  subWeeks,
  getWeek,
} from "date-fns";
import { useAuth } from "../contexts/AuthContext";
import StudentAPI from "../services/api";

interface Event {
  id: string;
  title: string;
  startDate: string;
  startTime: string;
  endTime?: string;
  details?: string;
  lecturer?: string;
  venue?: string;
  campus?: string;
  color: string;
  assignedToModel: string[];
}

const EVENT_TYPES: Record<string, string> = {
  lecture: "bg-blue-100 text-blue-800",
  practical: "bg-green-100 text-green-800",
  assessment: "bg-red-100 text-red-800",
  meeting: "bg-purple-100 text-purple-800",
  other: "bg-gray-100 text-gray-800",
};

export default function WeeklyCalendarScreen() {
  const { user, isAuthenticated } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentProfile, setStudentProfile] = useState<any>(null);

  const fetchEvents = async () => {
    if (!isAuthenticated || !user?.id) {
      console.log("❌ WeeklyCalendar: No authenticated user");
      setLoading(false);
      return;
    }

    try {
      console.log("📅 WeeklyCalendar: Loading events for user:", user.id);

      // Load student profile for filtering
      let profile = null;
      try {
        const apiResponse = await StudentAPI.getStudentProfile(user.id);
        if ((apiResponse as any)?.success && (apiResponse as any)?.data) {
          const studentData = (apiResponse as any).data.student;
          profile = {
            intakeGroup: studentData.intakeGroupTitle || "",
            intakeGroupId:
              studentData.intakeGroup || studentData.intakeGroupId || [],
            campus: studentData.campusTitle || "",
          };
        }
      } catch (error) {
        console.log("⚠️ WeeklyCalendar: Profile API failed");
      }

      setStudentProfile(profile);

      // Load events from API
      try {
        const eventsResponse = await StudentAPI.getEvents(user.id);
        console.log(
          "✅ WeeklyCalendar: Events response from API:",
          JSON.stringify(eventsResponse, null, 2)
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
              Array.isArray
            );
            if (possibleArrays.length > 0) {
              eventsData = possibleArrays[0] as any[];
            }
          }
        }

        console.log(
          `✅ WeeklyCalendar: Extracted ${eventsData.length} events from response`
        );

        // Filter events for current user's intake group and campus if available
        let filteredEvents = Array.isArray(eventsData) ? eventsData : [];

        console.log(
          `📅 WeeklyCalendar: Starting with ${filteredEvents.length} events`
        );
        console.log(
          "📅 WeeklyCalendar: User profile:",
          JSON.stringify(profile, null, 2)
        );

        // Filter by user's intake group if available
        if (
          profile?.intakeGroupId &&
          Array.isArray(profile.intakeGroupId) &&
          profile.intakeGroupId.length > 0
        ) {
          console.log(
            `📅 WeeklyCalendar: Filtering by intake group IDs:`,
            profile.intakeGroupId
          );

          filteredEvents = filteredEvents.filter((event: any) => {
            if (!event.assignedToModel || event.assignedToModel.length === 0) {
              return true; // Show events with no specific assignment
            }

            // Check if any of the user's intake group IDs match any of the event's assigned groups
            const hasMatch = profile.intakeGroupId.some((userGroupId: string) =>
              event.assignedToModel.includes(userGroupId)
            );

            return hasMatch;
          });

          console.log(
            `📅 WeeklyCalendar: After intake group filtering: ${filteredEvents.length} events`
          );
        } else if (
          profile?.intakeGroupId &&
          typeof profile.intakeGroupId === "string"
        ) {
          // Handle case where intakeGroupId is a string
          console.log(
            `📅 WeeklyCalendar: Filtering by intake group ID (string):`,
            profile.intakeGroupId
          );

          filteredEvents = filteredEvents.filter((event: any) => {
            if (!event.assignedToModel || event.assignedToModel.length === 0) {
              return true; // Show events with no specific assignment
            }
            return event.assignedToModel.includes(profile.intakeGroupId);
          });

          console.log(
            `📅 WeeklyCalendar: After intake group filtering: ${filteredEvents.length} events`
          );
        }

        // Filter by campus if available
        if (profile?.campus) {
          console.log(
            `📅 WeeklyCalendar: Filtering by campus: ${profile.campus}`
          );
          filteredEvents = filteredEvents.filter((event: any) => {
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
            `📅 WeeklyCalendar: After campus filtering: ${filteredEvents.length} events`
          );
        }

        console.log(
          `📅 WeeklyCalendar: Final filtered events: ${filteredEvents.length}`
        );

        setEvents(filteredEvents);
      } catch (error) {
        console.error("❌ WeeklyCalendar: Error fetching events:", error);
        setEvents([]);
      }
    } catch (error) {
      console.error("❌ WeeklyCalendar: Error in fetchEvents:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [isAuthenticated, user?.id]); // Re-fetch when auth state changes

  const getEventsForDate = (date: Date) => {
    return events
      .filter((event) => {
        const eventDate = new Date(event.startDate);
        return format(eventDate, "yyyy-MM-dd") === format(date, "yyyy-MM-dd");
      })
      .sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""));
  };

  const formatTime = (time: string) => {
    return time || "00:00";
  };

  const getEventColorClass = (eventType: string) => {
    const type = EVENT_TYPES[eventType] || EVENT_TYPES.other;
    // Convert to React Native colors
    if (type.includes("blue")) return "#dbeafe";
    if (type.includes("green")) return "#dcfce7";
    if (type.includes("red")) return "#fee2e2";
    if (type.includes("purple")) return "#f3e8ff";
    return "#f3f4f6";
  };

  const getEventTextColor = (eventType: string) => {
    const type = EVENT_TYPES[eventType] || EVENT_TYPES.other;
    if (type.includes("blue")) return "#1e40af";
    if (type.includes("green")) return "#166534";
    if (type.includes("red")) return "#dc2626";
    if (type.includes("purple")) return "#7c3aed";
    return "#374151";
  };

  const startOfCurrentWeek = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const currentWeekNumber = getWeek(currentDate);

  const goToPreviousWeek = () => setCurrentDate(subWeeks(currentDate, 1));
  const goToNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));

  const EventCard = ({ event }: { event: Event }) => (
    <View style={styles.eventCard}>
      <View style={styles.eventHeader}>
        <View style={styles.eventTitleContainer}>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <Text style={styles.eventTime}>
            {formatTime(event.startTime)} - {formatTime(event.endTime || "")}
          </Text>
        </View>
        <View
          style={[
            styles.eventTypeBadge,
            { backgroundColor: getEventColorClass(event.color) },
          ]}
        >
          <Text
            style={[
              styles.eventTypeText,
              { color: getEventTextColor(event.color) },
            ]}
          >
            {event.color}
          </Text>
        </View>
      </View>
      {event.details && (
        <Text style={styles.eventDetails}>{event.details}</Text>
      )}
      <View style={styles.eventMeta}>
        <Text style={styles.eventMetaText}>
          👨‍🏫 {event.lecturer || "No lecturer assigned"}
        </Text>
        <Text style={styles.eventMetaText}>
          📍 {event.venue || "No venue specified"}
        </Text>
        <Text style={styles.eventMetaText}>
          🏢 {event.campus || "No campus specified"}
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading calendar...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.headerCard}>
        <Card.Content>
          <View style={styles.headerContent}>
            <View>
              <Title style={styles.headerTitle}>
                {format(startOfCurrentWeek, "MMMM d, yyyy")}
              </Title>
              <Text style={styles.headerSubtitle}>
                Week {currentWeekNumber} of {format(currentDate, "yyyy")}
              </Text>
            </View>
            <View style={styles.navigationButtons}>
              <TouchableOpacity
                style={styles.navButton}
                onPress={goToPreviousWeek}
              >
                <Ionicons name="chevron-back" size={24} color="#2196F3" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.navButton} onPress={goToNextWeek}>
                <Ionicons name="chevron-forward" size={24} color="#2196F3" />
              </TouchableOpacity>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* All Days Stacked Vertically */}
      <View style={styles.daysContainer}>
        {weekDays.map((day, index) => {
          const date = addDays(startOfCurrentWeek, index);
          const dateEvents = getEventsForDate(date);
          return (
            <Card key={day} style={styles.fullWidthDayCard}>
              <Card.Content style={styles.dayHeader}>
                <Title style={styles.dayTitle}>
                  {day} {format(date, "d")}
                </Title>
              </Card.Content>
              <View style={styles.dayContent}>
                {dateEvents.length > 0 ? (
                  <View style={styles.eventsList}>
                    {dateEvents.map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </View>
                ) : (
                  <Text style={styles.noEventsText}>No events scheduled</Text>
                )}
              </View>
            </Card>
          );
        })}
      </View>
    </ScrollView>
  );
}

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
  headerCard: {
    margin: 16,
    elevation: 4,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  navigationButtons: {
    flexDirection: "row",
  },
  navButton: {
    padding: 8,
    marginHorizontal: 4,
  },
  daysContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  fullWidthDayCard: {
    width: "100%",
    marginBottom: 16,
    elevation: 2,
  },
  dayCard: {
    flex: 1,
    marginHorizontal: 4,
    elevation: 2,
  },
  dayHeader: {
    padding: 12,
  },
  dayTitle: {
    fontSize: 16,
    textAlign: "center",
  },
  dayContent: {
    minHeight: 60,
  },
  eventsList: {
    padding: 8,
  },
  eventCard: {
    backgroundColor: "#f9f9f9",
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#2196F3",
  },
  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  eventTitleContainer: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  eventTime: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  eventTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  eventTypeText: {
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  eventDetails: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
  eventMeta: {
    marginTop: 8,
  },
  eventMetaText: {
    fontSize: 11,
    color: "#666",
    marginBottom: 2,
  },
  noEventsText: {
    textAlign: "center",
    padding: 16,
    fontSize: 14,
    color: "#999",
  },
});
