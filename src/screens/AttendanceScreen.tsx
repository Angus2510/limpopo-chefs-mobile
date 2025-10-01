import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Card, Title, Button } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";

export default function AttendanceScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>Attendance Options</Title>
          <Text style={styles.description}>
            Choose an option to manage your attendance
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.optionCard}>
        <Card.Content>
          <View style={styles.option}>
            <Ionicons name="qr-code-outline" size={48} color="#2196F3" />
            <View style={styles.optionText}>
              <Text style={styles.optionTitle}>Scan Attendance</Text>
              <Text style={styles.optionDescription}>
                Scan QR code to mark your attendance
              </Text>
            </View>
          </View>
          <Button
            mode="contained"
            onPress={() => navigation.navigate("ScanAttendance")}
            style={styles.optionButton}
          >
            Scan QR Code
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.optionCard}>
        <Card.Content>
          <View style={styles.option}>
            <Ionicons name="list-outline" size={48} color="#4caf50" />
            <View style={styles.optionText}>
              <Text style={styles.optionTitle}>View Attendance</Text>
              <Text style={styles.optionDescription}>
                View your attendance history and records
              </Text>
            </View>
          </View>
          <Button
            mode="outlined"
            onPress={() => navigation.navigate("ViewAttendance")}
            style={styles.optionButton}
          >
            View Records
          </Button>
        </Card.Content>
      </Card>
    </View>
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
  description: {
    marginTop: 8,
    color: "#666",
  },
  optionCard: {
    marginBottom: 16,
    elevation: 4,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  optionText: {
    flex: 1,
    marginLeft: 16,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  optionDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  optionButton: {
    marginTop: 8,
  },
});
