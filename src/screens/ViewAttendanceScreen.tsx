import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from "react-native";
import {
  Title,
  Card,
  ActivityIndicator,
  Chip,
  Button,
  Surface,
} from "react-native-paper";
import { useAuth } from "../contexts/AuthContext";
import StudentAPI from "../services/api";
import { AttendanceRecord, WELRecord } from "../types";
import { format, parseISO, isValid } from "date-fns";

export default function ViewAttendanceScreen() {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [welRecords, setWelRecords] = useState<WELRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [totalRecords, setTotalRecords] = useState(0);
  const { user, isAuthenticated } = useAuth();

  const studentId = user?.id;

  const fetchAttendance = async (isRefresh = false) => {
    if (!isAuthenticated || !studentId) return;

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      console.log("📅 Fetching attendance for student:", studentId, "Year:", selectedYear);
      
      const response = await StudentAPI.getAttendanceWithWEL(studentId, selectedYear);

      console.log("✅ Attendance data received:", {
        attendanceCount: response.attendance.length,
        welCount: response.welRecords.length,
        totalRecords: response.totalRecords,
        year: response.year
      });
      
      setAttendanceRecords(response.attendance);
      setWelRecords(response.welRecords);
      setTotalRecords(response.totalRecords);
      
    } catch (error: any) {
      console.error("❌ Failed to fetch attendance:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to fetch attendance records. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [selectedYear, studentId, isAuthenticated]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "full":
        return "#4CAF50"; // Green
      case "absent":
        return "#F44336"; // Red
      case "absent with reason":
        return "#FF9800"; // Orange
      case "W.E.L":
        return "#2196F3"; // Blue
      case "sick":
        return "#9C27B0"; // Purple
      default:
        return "#757575"; // Grey
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      if (isValid(date)) {
        return format(date, "MMM dd, yyyy");
      }
      return dateString;
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return "Not recorded";
    try {
      const date = parseISO(timeString);
      if (isValid(date)) {
        return format(date, "HH:mm");
      }
      return timeString;
    } catch {
      return timeString;
    }
  };

  const changeYear = (increment: number) => {
    setSelectedYear(prev => prev + increment);
  };

  if (!isAuthenticated || !user) {
    return (
      <View style={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            <Title>Authentication Required</Title>
            <Text style={styles.errorText}>
              Please log in to view your attendance records.
            </Text>
          </Card.Content>
        </Card>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading attendance records...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchAttendance(true)} />
        }
      >
        {/* Year Selection */}
        <Surface style={styles.yearContainer}>
          <View style={styles.yearControls}>
            <Button
              mode="outlined"
              onPress={() => changeYear(-1)}
              style={styles.yearButton}
            >
              {selectedYear - 1}
            </Button>
            <Text style={styles.currentYear}>{selectedYear}</Text>
            <Button
              mode="outlined"
              onPress={() => changeYear(1)}
              style={styles.yearButton}
            >
              {selectedYear + 1}
            </Button>
          </View>
          <Text style={styles.recordCount}>
            {totalRecords} record{totalRecords !== 1 ? 's' : ''} found
          </Text>
        </Surface>

        {/* WEL Records */}
        {welRecords.length > 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Work Experience Learning</Title>
              {welRecords.map((record, index) => (
                <Surface key={index} style={styles.welRecord}>
                  <Text style={styles.welTitle}>{record.establishmentName}</Text>
                  <Text style={styles.welDate}>
                    {formatDate(record.startDate)} - {formatDate(record.endDate)}
                  </Text>
                </Surface>
              ))}
            </Card.Content>
          </Card>
        )}

        {/* Attendance Records */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Daily Attendance</Title>
            {attendanceRecords.length === 0 ? (
              <Text style={styles.emptyText}>
                No attendance records found for {selectedYear}
              </Text>
            ) : (
              attendanceRecords.map((record) => (
                <Surface key={record.id} style={styles.attendanceRecord}>
                  <View style={styles.recordHeader}>
                    <Text style={styles.recordDate}>
                      {formatDate(record.date)}
                    </Text>
                    <Chip
                      style={[
                        styles.statusChip,
                        { backgroundColor: getStatusColor(record.status) }
                      ]}
                      textStyle={styles.statusText}
                    >
                      {record.status.toUpperCase()}
                    </Chip>
                  </View>
                  {record.timeCheckedIn && (
                    <Text style={styles.timeText}>
                      Check-in: {formatTime(record.timeCheckedIn)}
                    </Text>
                  )}
                </Surface>
              ))
            )}
          </Card.Content>
        </Card>
      </ScrollView>
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
  yearContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
    elevation: 2,
  },
  yearControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  yearButton: {
    minWidth: 80,
  },
  currentYear: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  recordCount: {
    textAlign: "center",
    color: "#666",
    fontSize: 14,
  },
  card: {
    margin: 16,
    marginTop: 0,
    elevation: 4,
  },
  sectionTitle: {
    marginBottom: 16,
    color: "#333",
  },
  attendanceRecord: {
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    elevation: 1,
  },
  recordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  recordDate: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  statusChip: {
    height: 28,
  },
  statusText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
  },
  timeText: {
    fontSize: 14,
    color: "#666",
  },
  welRecord: {
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    elevation: 1,
  },
  welTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  welDate: {
    fontSize: 14,
    color: "#666",
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
    fontStyle: "italic",
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    color: "#666",
    textAlign: "center",
  },
});
