import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { Card, Title, Button, ActivityIndicator } from "react-native-paper";
import { Camera } from "expo-camera";
// import { BarCodeScanner } from "expo-barcode-scanner"; // Temporarily disabled
import StudentAPI from "../services/api";

export default function ScanAttendanceScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);

  const studentId = "current-student-id"; // Replace with actual student ID

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const handleBarCodeScanned = async ({
    type,
    data,
  }: {
    type: string;
    data: string;
  }) => {
    setScanned(true);
    setLoading(true);

    try {
      await StudentAPI.scanAttendance(data, studentId);
      Alert.alert("Success", "Attendance marked successfully!", [
        { text: "OK", onPress: () => setScanned(false) },
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to mark attendance. Please try again.");
      setScanned(false);
    } finally {
      setLoading(false);
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            <Title>Camera Permission Required</Title>
            <Text style={styles.errorText}>
              Please enable camera permission to scan attendance QR codes.
            </Text>
          </Card.Content>
        </Card>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.camera}>
        <Card style={styles.placeholderCard}>
          <Card.Content>
            <Title>QR Scanner Temporarily Unavailable</Title>
            <Text style={styles.placeholderText}>
              The barcode scanner will be re-enabled in the next update. For
              now, you can manually mark attendance.
            </Text>
            <Button
              mode="contained"
              onPress={() =>
                Alert.alert("Manual Attendance", "Feature coming soon!")
              }
              style={styles.manualButton}
            >
              Manual Attendance
            </Button>
          </Card.Content>
        </Card>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: "#fff",
    borderRadius: 12,
    backgroundColor: "transparent",
  },
  instructionText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    marginTop: 32,
    paddingHorizontal: 32,
  },
  resultContainer: {
    position: "absolute",
    bottom: 100,
    alignItems: "center",
  },
  scanAgainButton: {
    backgroundColor: "#2196F3",
  },
  card: {
    margin: 16,
    elevation: 4,
  },
  errorText: {
    marginTop: 16,
    color: "#666",
    textAlign: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  placeholderCard: {
    margin: 16,
    elevation: 4,
  },
  placeholderText: {
    marginTop: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
  },
  manualButton: {
    marginTop: 20,
    backgroundColor: "#2196F3",
  },
});
