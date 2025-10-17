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
  Card,
  Title,
  Paragraph,
  Button,
  ProgressBar,
  ActivityIndicator,
} from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Student, WELPlacement, WELRecord } from "../types";
import { useAuth } from "../contexts/AuthContext";
import StudentAPI from "../services/api";

interface WELHoursData {
  totalHours: number;
  evaluatedHours: number;
  pendingHours: number;
  maxHours: number;
  placements: any[];
}

export default function WELScreen() {
  const navigation = useNavigation();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [welData, setWelData] = useState<WELHoursData | null>(null);
  const [studentProfile, setStudentProfile] = useState<any>(null);

  const loadWELData = async () => {
    if (!isAuthenticated || !user?.id) {
      console.log("❌ WEL: No authenticated user");
      setLoading(false);
      return;
    }

    try {
      console.log("🔍 WEL: Loading data for user:", user.id);

      // Load student profile for intake group info
      let profile = null;
      try {
        const apiResponse = await StudentAPI.getStudentProfile(user.id);
        if ((apiResponse as any)?.success && (apiResponse as any)?.data) {
          const studentData = (apiResponse as any).data.student;
          profile = {
            intakeGroup: studentData.intakeGroupTitle || "",
            course: studentData.qualificationTitle || "Not enrolled",
          };
        }
      } catch (error) {
        console.log("⚠️ WEL: Profile API failed");
      }

      setStudentProfile(profile);

      // Load WEL hours data (contains both hours summary and placements)
      const hoursResponse = await StudentAPI.getWELHours(user.id);

      console.log(
        "✅ WEL: Hours data:",
        JSON.stringify(hoursResponse, null, 2)
      );

      // Determine max hours based on intake group
      const maxHours = getWelMaxHoursForIntake(profile?.intakeGroup);

      // Extract data from API response
      const hoursData = (hoursResponse as any)?.success
        ? (hoursResponse as any).data
        : hoursResponse;

      // Use hours API data for both summary and placements (since they're the same)
      const placements = hoursData?.placements || [];

      // Calculate hours from the API response
      let totalHours = 0;
      let evaluatedHours = 0;
      let pendingHours = 0;

      if (hoursData) {
        totalHours = hoursData.totalHours || 0;
        evaluatedHours = hoursData.evaluatedHours || 0;
        pendingHours = hoursData.pendingHours || 0;
      }

      setWelData({
        totalHours,
        evaluatedHours,
        pendingHours,
        maxHours,
        placements: placements || [],
      });
    } catch (error) {
      console.error("❌ WEL: Error loading data:", error);
      Alert.alert("Error", "Failed to load WEL data");

      // Fallback to basic data structure
      const maxHours = getWelMaxHoursForIntake(studentProfile?.intakeGroup);
      setWelData({
        totalHours: 0,
        evaluatedHours: 0,
        pendingHours: 0,
        maxHours,
        placements: [],
      });
    } finally {
      setLoading(false);
    }
  };

  // Determine maxHours based on intake group
  const getWelMaxHoursForIntake = (intakeString?: string): number => {
    if (!intakeString || intakeString.trim() === "") return 0;
    const upperIntake = intakeString.trim().toUpperCase();

    if (upperIntake.includes("OCG")) return 2700;
    if (upperIntake.includes("DIPLOMA")) return 900;
    if (upperIntake.includes("PASTRY")) return 900;
    if (upperIntake.includes("CERTIFICATE") || upperIntake.includes("COOK"))
      return 750;
    if (upperIntake.includes("AWARD")) return 200;
    return 0;
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWELData();
    setRefreshing(false);
  };

  useEffect(() => {
    loadWELData();
  }, [isAuthenticated, user?.id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading WEL data...</Text>
      </View>
    );
  }

  if (!welData) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#ff6b6b" />
        <Text style={styles.errorText}>Failed to load WEL data</Text>
        <Button mode="contained" onPress={loadWELData}>
          Retry
        </Button>
      </View>
    );
  }

  const progressPercentage =
    welData.maxHours > 0 ? welData.totalHours / welData.maxHours : 0;
  const remainingHours = Math.max(0, welData.maxHours - welData.totalHours);

  const handleViewSOR = () => {
    navigation.navigate("SOR" as never);
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <Ionicons name="business" size={24} color="#2196F3" />
            <Title style={styles.title}>WEL Hours</Title>
          </View>

          <View style={styles.progressContainer}>
            <ProgressBar
              progress={progressPercentage}
              color="#2196F3"
              style={styles.progressBar}
            />
            <View style={styles.progressText}>
              <Text style={styles.progressLabel}>
                {welData.totalHours} hours completed
              </Text>
              <Text style={styles.progressLabel}>
                {remainingHours} remaining
              </Text>
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Total Progress</Text>
              <Text style={styles.statValue}>
                {Math.round(progressPercentage * 100)}%
              </Text>
            </View>
            <Text style={styles.targetText}>
              Target: {welData.maxHours} hours
            </Text>
          </View>

          <View style={styles.hoursContainer}>
            <View style={styles.hourItem}>
              <Text style={styles.hourLabel}>Evaluated Hours:</Text>
              <Text style={[styles.hourValue, styles.evaluated]}>
                {welData.evaluatedHours}
              </Text>
            </View>
            {welData.pendingHours > 0 && (
              <View style={styles.hourItem}>
                <Text style={styles.hourLabel}>Pending Evaluation:</Text>
                <Text style={[styles.hourValue, styles.pending]}>
                  {welData.pendingHours}
                </Text>
              </View>
            )}
          </View>

          <Button
            mode="contained"
            onPress={handleViewSOR}
            style={styles.button}
            icon="download"
          >
            View SOR
          </Button>
        </Card.Content>
      </Card>

      {/* WEL Placements List */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>WEL Placements</Title>
          {welData?.placements && welData.placements.length > 0 ? (
            welData.placements.map((placement: any) => (
              <View key={placement.id} style={styles.recordItem}>
                <Text style={styles.recordTitle}>
                  {placement.establishmentName || "Unknown Establishment"}
                </Text>
                <Text style={styles.recordDetails}>
                  {new Date(placement.startDate).toLocaleDateString()} -{" "}
                  {new Date(placement.endDate).toLocaleDateString()}
                </Text>
                <Text style={styles.recordDetails}>
                  Hours: {placement.totalHours || 0}
                </Text>
                <Text style={styles.recordDetails}>
                  Status: {placement.evaluated ? "Completed" : "Pending"}
                </Text>
                {placement.establishmentContact && (
                  <Text style={styles.recordDetails}>
                    Contact: {placement.establishmentContact}
                  </Text>
                )}
              </View>
            ))
          ) : (
            <Paragraph>No WEL placements found</Paragraph>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
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
  card: {
    marginBottom: 16,
    elevation: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    marginLeft: 8,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    marginBottom: 8,
  },
  progressText: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressLabel: {
    fontSize: 12,
    color: "#666",
  },
  statsContainer: {
    marginBottom: 16,
  },
  stat: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#333",
  },
  statValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2196F3",
  },
  targetText: {
    fontSize: 12,
    color: "#666",
    textAlign: "right",
  },
  hoursContainer: {
    marginBottom: 16,
  },
  hourItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  hourLabel: {
    fontSize: 14,
    color: "#333",
  },
  hourValue: {
    fontSize: 14,
    fontWeight: "bold",
  },
  evaluated: {
    color: "#4caf50",
  },
  pending: {
    color: "#ff9800",
  },
  button: {
    marginTop: 16,
  },
  buttonContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  recordItem: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
  },
  recordTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  recordDetails: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
});
