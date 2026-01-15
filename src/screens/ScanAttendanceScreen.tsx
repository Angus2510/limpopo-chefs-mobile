import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { Card, Title, Button, ActivityIndicator } from "react-native-paper";
import { Camera, CameraView, BarcodeScanningResult } from "expo-camera";
import { useAuth } from "../contexts/AuthContext";
import StudentAPI from "../services/api";
import {
  showAttendanceMessage,
  createAttendanceMessage,
} from "../utils/attendanceMessages";

export default function ScanAttendanceScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const studentId = user?.id;

  // Check if user is logged in
  if (!isAuthenticated || !user) {
    return (
      <View style={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            <Title>Authentication Required</Title>
            <Text style={styles.errorText}>
              Please log in to scan attendance QR codes.
            </Text>
          </Card.Content>
        </Card>
      </View>
    );
  }

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const handleBarCodeScanned = async (result: BarcodeScanningResult) => {
    if (scanned || loading) return;

    setScanned(true);
    setLoading(true);

    try {
      if (!studentId) {
        throw new Error("No student ID found. Please log in again.");
      }

      console.log("📱 Scanned QR code:", result.data);
      const response = await StudentAPI.scanAttendance(result.data, studentId);

      // Use the new message utility for consistent UI feedback
      const messageConfig = createAttendanceMessage(response);
      showAttendanceMessage(messageConfig, () => setScanned(false));

      // Log additional details for debugging
      if (response.success && response.data) {
        const { campus, outcome, date, alreadyMarked } = response.data;
        console.log("📊 Attendance details:", {
          campus,
          outcome,
          date,
          wasAlreadyMarked: alreadyMarked,
          isNewAttendance: !alreadyMarked,
        });
      }
    } catch (error: any) {
      console.error("❌ Attendance scan error:", error);
      showAttendanceMessage(
        {
          title: "Connection Failed",
          message: error.message || "Network error. Please try again.",
          type: "error",
        },
        () => setScanned(false)
      );
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
      <CameraView
        style={styles.camera}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
      >
        <View style={styles.overlay}>
          <View style={styles.scanFrame} />
          <Text style={styles.instructionText}>
            Point your camera at the QR code to mark attendance
          </Text>

          {loading && (
            <View style={styles.resultContainer}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={[styles.instructionText, { marginTop: 16 }]}>
                Marking attendance...
              </Text>
            </View>
          )}

          {scanned && !loading && (
            <View style={styles.resultContainer}>
              <Button
                mode="contained"
                onPress={() => setScanned(false)}
                style={styles.scanAgainButton}
              >
                Scan Again
              </Button>
            </View>
          )}
        </View>
      </CameraView>
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
    backgroundColor: "#014b01",
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
    backgroundColor: "#014b01",
  },
});
