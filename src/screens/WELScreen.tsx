import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import {
  Card,
  Title,
  Paragraph,
  Button,
  ProgressBar,
} from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Student, WELRecord } from "../types";

export default function WELScreen() {
  const navigation = useNavigation();

  // Mock student data
  const student: Student = {
    id: "current-student-id",
    name: "John Doe",
    email: "john.doe@example.com",
    studentNumber: "LCA2024001",
    course: "Culinary Arts",
    year: 2,
    intakeGroupTitle: "Certificate Cook",
  };

  // Mock WEL records
  const wellnessRecords: WELRecord[] = [
    {
      id: "1",
      startDate: "2025-01-01",
      endDate: "2025-03-01",
      totalHours: 200,
      establishmentName: "Fine Dining Restaurant",
      establishmentContact: "Chef Manager",
      evaluated: true,
    },
    {
      id: "2",
      startDate: "2025-04-01",
      endDate: "2025-06-01",
      totalHours: 150,
      establishmentName: "Hotel Kitchen",
      establishmentContact: "Head Chef",
      evaluated: false,
    },
  ];

  const [totalHours, setTotalHours] = useState(0);

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

  const maxHours = getWelMaxHoursForIntake(student.intakeGroupTitle);

  useEffect(() => {
    if (wellnessRecords && wellnessRecords.length > 0) {
      const total = wellnessRecords.reduce(
        (sum, record) => sum + record.totalHours,
        0
      );
      setTotalHours(total);
    } else {
      setTotalHours(0);
    }
  }, [wellnessRecords]);

  const progressPercentage = maxHours > 0 ? totalHours / maxHours : 0;
  const remainingHours = Math.max(0, maxHours - totalHours);

  const evaluatedHours = wellnessRecords
    .filter((record) => record.evaluated)
    .reduce((sum, record) => sum + record.totalHours, 0);

  const pendingHours = wellnessRecords
    .filter((record) => !record.evaluated)
    .reduce((sum, record) => sum + record.totalHours, 0);

  const handleViewSOR = () => {
    // Navigate to SOR screen
    navigation.navigate("SOR" as never);
  };

  return (
    <ScrollView style={styles.container}>
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
                {totalHours} hours completed
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
            <Text style={styles.targetText}>Target: {maxHours} hours</Text>
          </View>

          <View style={styles.hoursContainer}>
            <View style={styles.hourItem}>
              <Text style={styles.hourLabel}>Evaluated Hours:</Text>
              <Text style={[styles.hourValue, styles.evaluated]}>
                {evaluatedHours}
              </Text>
            </View>
            {pendingHours > 0 && (
              <View style={styles.hourItem}>
                <Text style={styles.hourLabel}>Pending Evaluation:</Text>
                <Text style={[styles.hourValue, styles.pending]}>
                  {pendingHours}
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

      {/* WEL Records List */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>WEL Placements</Title>
          {wellnessRecords.map((record) => (
            <View key={record.id} style={styles.recordItem}>
              <Text style={styles.recordTitle}>{record.establishmentName}</Text>
              <Text style={styles.recordDetails}>
                {record.startDate} - {record.endDate}
              </Text>
              <Text style={styles.recordDetails}>
                Hours: {record.totalHours} | Evaluated:{" "}
                {record.evaluated ? "Yes" : "No"}
              </Text>
            </View>
          ))}
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
