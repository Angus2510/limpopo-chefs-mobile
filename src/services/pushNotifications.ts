import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform, Alert } from "react-native";
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
    // Create notification channel with proper configuration
    try {
      await Notifications.setNotificationChannelAsync("default", {
        name: "Limpopo Chefs Academy",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#014b01",
        sound: "default",
        enableVibrate: true,
        showBadge: true,
        enableLights: true,
        lockscreenVisibility:
          Notifications.AndroidNotificationVisibility.PUBLIC,
        bypassDnd: false,
      });
      console.log("✅ Android notification channel created successfully");
    } catch (error) {
      console.error("❌ Error creating notification channel:", error);
    }
  }

  if (Platform.OS === "ios") {
    // Request additional iOS permissions
    await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
        allowDisplayInCarPlay: false,
        allowCriticalAlerts: false,
        allowProvisional: false,
        allowAnnouncements: false,
      },
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    console.log("📱 Current notification permission status:", existingStatus);

    if (existingStatus !== "granted") {
      console.log("📱 Requesting notification permissions...");
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
      console.log("📱 Permission request result:", status);
    }

    if (finalStatus !== "granted") {
      console.log("❌ Failed to get push token - permission not granted!");
      Alert.alert(
        "Notifications Disabled",
        "Please enable notifications in your phone settings to receive updates.",
        [{ text: "OK" }]
      );
      return null;
    }

    console.log("✅ Notification permissions granted");

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

    // Use StudentAPI which handles auth and proper routing
    const response = await StudentAPI.registerPushToken(studentId, token);

    if (response?.success) {
      console.log("✅ Push token registered successfully");
    } else {
      console.error("❌ Failed to register push token:", response);
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
