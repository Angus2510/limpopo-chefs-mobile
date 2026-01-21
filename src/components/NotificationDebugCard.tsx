import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Card, Title } from "react-native-paper";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";

export default function NotificationDebugCard() {
  const [permissionStatus, setPermissionStatus] =
    useState<string>("checking...");
  const [pushToken, setPushToken] = useState<string>("Not registered");
  const [badgeCount, setBadgeCount] = useState<number>(0);

  useEffect(() => {
    checkNotificationStatus();
  }, []);

  const checkNotificationStatus = async () => {
    try {
      // Check permissions
      const { status } = await Notifications.getPermissionsAsync();
      setPermissionStatus(status);

      // Get push token from storage or current session
      try {
        const projectId = Constants.expoConfig?.extra?.eas?.projectId;
        console.log("🔑 Project ID:", projectId);

        if (!projectId) {
          setPushToken("No project ID configured");
          return;
        }

        const token = await Notifications.getExpoPushTokenAsync({
          projectId,
        });
        console.log("✅ Got push token:", token.data);
        setPushToken(token.data);
      } catch (error) {
        console.error("❌ Push token error:", error);
        setPushToken(
          `Error: ${error instanceof Error ? error.message : String(error)}`
        );
      }

      // Get badge count
      const count = await Notifications.getBadgeCountAsync();
      setBadgeCount(count);
    } catch (error) {
      console.error("Error checking notification status:", error);
    }
  };

  const copyToken = async () => {
    Alert.alert("Push Token", pushToken, [{ text: "OK" }]);
  };

  const testNotification = async () => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Test Notification 📱",
          body: "If you see this, notifications are working!",
          sound: true,
          badge: 1,
        },
        trigger: null,
      });
      Alert.alert("Test Sent", "Check for notification now");
    } catch (error) {
      Alert.alert(
        "Error",
        "Failed to send test notification: " + String(error)
      );
    }
  };

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Title style={styles.title}>🔔 Notification Status</Title>

        <View style={styles.row}>
          <Text style={styles.label}>Permission:</Text>
          <Text
            style={[
              styles.value,
              permissionStatus === "granted" ? styles.success : styles.error,
            ]}
          >
            {permissionStatus}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Badge Count:</Text>
          <Text style={styles.value}>{badgeCount}</Text>
        </View>

        <View style={styles.tokenRow}>
          <Text style={styles.label}>Push Token:</Text>
          <TouchableOpacity onPress={copyToken}>
            <Text style={styles.token} numberOfLines={2}>
              {pushToken}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.button}
            onPress={checkNotificationStatus}
          >
            <Text style={styles.buttonText}>Refresh</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={testNotification}>
            <Text style={styles.buttonText}>Test Notification</Text>
          </TouchableOpacity>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: "#fff3cd",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  tokenRow: {
    marginBottom: 12,
  },
  label: {
    fontWeight: "bold",
    fontSize: 14,
  },
  value: {
    fontSize: 14,
  },
  success: {
    color: "#4caf50",
    fontWeight: "bold",
  },
  error: {
    color: "#f44336",
    fontWeight: "bold",
  },
  token: {
    fontSize: 12,
    color: "#014b01",
    marginTop: 4,
    textDecorationLine: "underline",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 12,
  },
  button: {
    backgroundColor: "#014b01",
    padding: 10,
    borderRadius: 5,
    minWidth: 100,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
});
