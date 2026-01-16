import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { API_CONFIG } from "../config";
import StudentAPI from "./api";

// Configure how notifications should be handled when app is running
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface NotificationData {
  notificationId?: string;
  type?: string;
  priority?: string;
}

export async function registerForPushNotificationsAsync(
  studentId: string
): Promise<string | null> {
  let token: string | null = null;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("❌ Failed to get push token for push notification!");
      return null;
    }

    try {
      const projectId =
        Constants.expoConfig?.extra?.eas?.projectId ||
        Constants.easConfig?.projectId;

      if (!projectId) {
        console.log("❌ No project ID found for push notifications");
        return null;
      }

      const expoPushToken = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      token = expoPushToken.data;
      console.log("✅ Got push token:", token);

      // Send token to backend
      await sendTokenToBackend(studentId, token);
    } catch (error) {
      console.error("❌ Error getting push token:", error);
      return null;
    }
  } else {
    console.log("❌ Must use physical device for Push Notifications");
    return null;
  }

  return token;
}

async function sendTokenToBackend(
  studentId: string,
  token: string
): Promise<void> {
  try {
    console.log("📤 Sending push token to backend for student:", studentId);

    // Use the existing API infrastructure with failover
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/students/${studentId}/push-token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // TODO: Add authorization header when auth is implemented
          // 'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ pushToken: token }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      if (data?.success) {
        console.log("✅ Push token registered successfully");
      } else {
        console.error("❌ Failed to register push token:", data);
      }
    } else {
      console.error("❌ HTTP error registering push token:", response.status);
    }
  } catch (error) {
    console.error("❌ Error registering push token:", error);
    // Don't throw - allow the app to continue without push notifications
  }
}

export function addNotificationListener(
  callback: (notification: Notifications.Notification) => void
) {
  return Notifications.addNotificationReceivedListener(callback);
}

export function addNotificationResponseListener(
  callback: (response: Notifications.NotificationResponse) => void
) {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

export async function handleNotificationTap(
  notification: Notifications.Notification,
  navigation?: any
): Promise<void> {
  const data = notification.request.content.data as unknown as NotificationData;

  console.log("🔔 Notification tapped:", {
    title: notification.request.content.title,
    data,
  });

  if (data?.notificationId && navigation) {
    // Navigate to notifications screen with specific notification
    navigation.navigate("Notifications", {
      notificationId: data.notificationId,
      highlightNotification: true,
    });
  }
}

export async function getBadgeCountAsync(): Promise<number> {
  return await Notifications.getBadgeCountAsync();
}

export async function setBadgeCountAsync(count: number): Promise<void> {
  await Notifications.setBadgeCountAsync(count);
}

export async function dismissAllNotificationsAsync(): Promise<void> {
  return await Notifications.dismissAllNotificationsAsync();
}
