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
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Mock student data - should come from context/auth
        const studentData = {
          intakeGroup: ["2025 Intake"],
          campus: ["Main Campus"],
          campusTitle: "Main Campus",
        };

        // Mock events data - replace with actual API call
        const mockEvents: Event[] = [
          {
            id: "1",
            title: "Basic Knife Skills Lecture",
            startDate: "2025-10-02",
            startTime: "09:00",
            endTime: "10:30",
            details: "Introduction to knife handling techniques",
            lecturer: "Chef Johnson",
            venue: "Kitchen Lab A",
            campus: "Main Campus",
            color: "lecture",
            assignedToModel: ["2025 Intake"],
          },
          {
            id: "2",
            title: "Food Safety Practical",
            startDate: "2025-10-03",
            startTime: "14:00",
            endTime: "16:00",
            details: "HACCP principles hands-on",
            lecturer: "Chef Smith",
            venue: "Kitchen Lab B",
            campus: "Main Campus",
            color: "practical",
            assignedToModel: ["2025 Intake"],
          },
          {
            id: "3",
            title: "Menu Planning Workshop",
            startDate: "2025-10-04",
            startTime: "11:00",
            endTime: "12:30",
            details: "Planning seasonal menus",
            lecturer: "Chef Davis",
            venue: "Classroom 101",
            campus: "Main Campus",
            color: "lecture",
            assignedToModel: ["2025 Intake"],
          },
          {
            id: "4",
            title: "Baking Assessment",
            startDate: "2025-10-07",
            startTime: "09:00",
            endTime: "12:00",
            details: "Practical baking assessment",
            lecturer: "Chef Wilson",
            venue: "Baking Lab",
            campus: "Main Campus",
            color: "assessment",
            assignedToModel: ["2025 Intake"],
          },
        ];

        const filtered = mockEvents.filter((event) => {
          if (!event || !event.campus || !event.assignedToModel) return false;
          const isAssignedToGroup = event.assignedToModel.includes(
            studentData.intakeGroup[0]
          );
          const isCampusMatch =
            event.campus?.toLowerCase() ===
            studentData.campusTitle.toLowerCase();
          return isAssignedToGroup && isCampusMatch;
        });
        setEvents(filtered);
      } catch (error) {
        console.error("❌ Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []); // Empty dependency array - runs only once on mount

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

      {/* Monday to Wednesday */}
      <View style={styles.weekGrid}>
        {weekDays.slice(0, 3).map((day, index) => {
          const date = addDays(startOfCurrentWeek, index);
          const dateEvents = getEventsForDate(date);
          return (
            <Card key={day} style={styles.dayCard}>
              <Card.Content style={styles.dayHeader}>
                <Title style={styles.dayTitle}>
                  {day} {format(date, "d")}
                </Title>
              </Card.Content>
              <ScrollView style={styles.dayContent}>
                {dateEvents.length > 0 ? (
                  <View style={styles.eventsList}>
                    {dateEvents.map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </View>
                ) : (
                  <Text style={styles.noEventsText}>No events</Text>
                )}
              </ScrollView>
            </Card>
          );
        })}
      </View>

      {/* Thursday to Friday */}
      <View style={styles.weekGridBottom}>
        {weekDays.slice(3, 5).map((day, index) => {
          const date = addDays(startOfCurrentWeek, index + 3);
          const dateEvents = getEventsForDate(date);
          return (
            <Card key={day} style={styles.dayCard}>
              <Card.Content style={styles.dayHeader}>
                <Title style={styles.dayTitle}>
                  {day} {format(date, "d")}
                </Title>
              </Card.Content>
              <ScrollView style={styles.dayContent}>
                {dateEvents.length > 0 ? (
                  <View style={styles.eventsList}>
                    {dateEvents.map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </View>
                ) : (
                  <Text style={styles.noEventsText}>No events</Text>
                )}
              </ScrollView>
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
  weekGrid: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 16,
  },
  weekGridBottom: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 16,
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
    maxHeight: 200,
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
