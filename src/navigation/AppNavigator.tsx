import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { useNotificationBadge } from "../contexts/NotificationBadgeContext";
import NotificationBadge from "../components/NotificationBadge";
import LoadingScreen from "../components/LoadingScreen";

// Import screens
import LoginScreen from "../screens/LoginScreen";
import DashboardScreen from "../screens/DashboardScreen";
import AttendanceScreen from "../screens/AttendanceScreen";
import ScanAttendanceScreen from "../screens/ScanAttendanceScreen";
import ViewAttendanceScreen from "../screens/ViewAttendanceScreen";
import FeesScreen from "../screens/FeesScreen";
import DownloadsScreen from "../screens/DownloadsScreen";
import ProfileScreen from "../screens/ProfileScreen";
import SORScreen from "../screens/SORScreen";
import WELScreen from "../screens/WELScreen";
import WELLocationsScreen from "../screens/WELLocationsScreen";
import WeeklyCalendarScreen from "../screens/WeeklyCalendarScreen";
import AnnouncementsScreen from "../screens/AnnouncementsScreen";
import NotificationsScreen from "../screens/NotificationsScreen";

// More Home Screen component
function MoreHomeScreen({ navigation }: any) {
  const { logout } = useAuth();
  const { unreadCount } = useNotificationBadge();
  console.log("MoreHomeScreen rendered"); // Debug log

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
          } catch (error) {
            console.error("Logout error:", error);
            Alert.alert("Error", "Failed to logout. Please try again.");
          }
        },
      },
    ]);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      <View style={{ padding: 20 }}>
        <Text
          style={{
            fontSize: 24,
            fontWeight: "bold",
            marginBottom: 20,
            color: "#333",
          }}
        >
          More Options
        </Text>

        <TouchableOpacity
          style={{
            backgroundColor: "#e3f2fd",
            padding: 20,
            borderRadius: 8,
            marginBottom: 15,
            elevation: 3,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 3,
            borderWidth: 2,
            borderColor: "#2196F3",
          }}
          onPress={() => {
            console.log("Weekly Calendar button pressed");
            navigation.navigate("WeeklyCalendar");
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "bold", color: "#1565c0" }}>
            📅 Weekly Schedule
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: "white",
            padding: 15,
            borderRadius: 8,
            marginBottom: 10,
            elevation: 2,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.2,
            shadowRadius: 2,
          }}
          onPress={() => navigation.navigate("Announcements")}
        >
          <Text style={{ fontSize: 16, fontWeight: "500", color: "#333" }}>
            📢 Announcements
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: "white",
            padding: 15,
            borderRadius: 8,
            marginBottom: 10,
            elevation: 2,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.2,
            shadowRadius: 2,
          }}
          onPress={() => navigation.navigate("Notifications")}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "500", color: "#333" }}>
              🔔 Notifications
            </Text>
            {unreadCount > 0 && (
              <NotificationBadge
                count={unreadCount}
                size="small"
                position="inline"
              />
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: "white",
            padding: 15,
            borderRadius: 8,
            marginBottom: 10,
            elevation: 2,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.2,
            shadowRadius: 2,
          }}
          onPress={() => navigation.navigate("Fees")}
        >
          <Text style={{ fontSize: 16, fontWeight: "500", color: "#333" }}>
            💰 Fees
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: "white",
            padding: 15,
            borderRadius: 8,
            marginBottom: 10,
            elevation: 2,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.2,
            shadowRadius: 2,
          }}
          onPress={() => navigation.navigate("Downloads")}
        >
          <Text style={{ fontSize: 16, fontWeight: "500", color: "#333" }}>
            📥 Downloads
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: "white",
            padding: 15,
            borderRadius: 8,
            marginBottom: 10,
            elevation: 2,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.2,
            shadowRadius: 2,
          }}
          onPress={() => navigation.navigate("Profile")}
        >
          <Text style={{ fontSize: 16, fontWeight: "500", color: "#333" }}>
            👤 Profile
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: "white",
            padding: 15,
            borderRadius: 8,
            marginBottom: 10,
            elevation: 2,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.2,
            shadowRadius: 2,
          }}
          onPress={() => navigation.navigate("SOR")}
        >
          <Text style={{ fontSize: 16, fontWeight: "500", color: "#333" }}>
            📋 Student Records
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: "white",
            padding: 15,
            borderRadius: 8,
            marginBottom: 10,
            elevation: 2,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.2,
            shadowRadius: 2,
          }}
          onPress={() => navigation.navigate("WEL")}
        >
          <Text style={{ fontSize: 16, fontWeight: "500", color: "#333" }}>
            💼 Work Experience
          </Text>
        </TouchableOpacity>

        {/* Logout Button */}
        <TouchableOpacity
          style={{
            backgroundColor: "#f44336",
            padding: 16,
            borderRadius: 8,
            marginTop: 20,
            marginBottom: 10,
            elevation: 3,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 3,
            alignItems: "center",
          }}
          onPress={handleLogout}
        >
          <Text style={{ fontSize: 14, fontWeight: "bold", color: "white" }}>
            🚪 Logout
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

export type RootStackParamList = {
  MainTabs: undefined;
  AssignmentDetail: { assignmentId: string };
  ScanAttendance: undefined;
  ViewAttendance: undefined;
  WeeklyCalendar: undefined;
  WELLocations: undefined;
  Notifications:
    | { notificationId?: string; highlightNotification?: boolean }
    | undefined;
};

export type BottomTabParamList = {
  Dashboard: undefined;
  Assignments: undefined;
  Attendance: undefined;
  More: undefined;
};

const Tab = createBottomTabNavigator<BottomTabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

function MoreStackNavigator() {
  const MoreStack = createStackNavigator();
  const { unreadCount } = useNotificationBadge();

  return (
    <MoreStack.Navigator>
      <MoreStack.Screen
        name="MoreHome"
        component={MoreHomeScreen}
        options={{ title: "More" }}
      />
      <MoreStack.Screen
        name="WeeklyCalendar"
        component={WeeklyCalendarScreen}
        options={{ title: "Weekly Schedule" }}
      />
      <MoreStack.Screen
        name="Announcements"
        component={AnnouncementsScreen}
        options={{ title: "Announcements" }}
      />
      <MoreStack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          title: "Notifications",
          headerRight: () =>
            unreadCount > 0 ? (
              <View style={{ marginRight: 16 }}>
                <NotificationBadge
                  count={unreadCount}
                  size="small"
                  position="inline"
                />
              </View>
            ) : null,
        }}
      />
      <MoreStack.Screen
        name="Fees"
        component={FeesScreen}
        options={{ title: "Fees" }}
      />
      <MoreStack.Screen
        name="Downloads"
        component={DownloadsScreen}
        options={{ title: "Downloads" }}
      />
      <MoreStack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: "Profile" }}
      />
      <MoreStack.Screen
        name="SOR"
        component={SORScreen}
        options={{ title: "Student Records" }}
      />
      <MoreStack.Screen
        name="WEL"
        component={WELScreen}
        options={{ title: "Work Experience" }}
      />
    </MoreStack.Navigator>
  );
}

function MoreTabsScreen() {
  const { unreadCount } = useNotificationBadge();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === "Dashboard") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Assignments") {
            iconName = focused ? "document-text" : "document-text-outline";
          } else if (route.name === "Attendance") {
            iconName = focused
              ? "checkmark-circle"
              : "checkmark-circle-outline";
          } else if (route.name === "More") {
            iconName = focused ? "menu" : "menu-outline";
          } else {
            iconName = "help-circle";
          }

          const IconComponent = () => (
            <View style={{ position: "relative" }}>
              <Ionicons name={iconName} size={size} color={color} />
              {route.name === "More" && unreadCount > 0 && (
                <NotificationBadge
                  count={unreadCount}
                  size="small"
                  position="top-right"
                />
              )}
            </View>
          );

          return <IconComponent />;
        },
        tabBarActiveTintColor: "#2196F3",
        tabBarInactiveTintColor: "gray",
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />

      <Tab.Screen name="Attendance" component={AttendanceTabNavigator} />
      <Tab.Screen name="More" component={MoreStackNavigator} />
    </Tab.Navigator>
  );
}

function AttendanceTabNavigator() {
  const AttendanceStack = createStackNavigator();

  return (
    <AttendanceStack.Navigator>
      <AttendanceStack.Screen
        name="AttendanceHome"
        component={AttendanceScreen}
        options={{ title: "Attendance" }}
      />
      <AttendanceStack.Screen
        name="ScanAttendance"
        component={ScanAttendanceScreen}
        options={{ title: "Scan Attendance" }}
      />
      <AttendanceStack.Screen
        name="ViewAttendance"
        component={ViewAttendanceScreen}
        options={{ title: "View Attendance" }}
      />
    </AttendanceStack.Navigator>
  );
}

function MainStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MainTabs"
        component={MoreTabsScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="WeeklyCalendar"
        component={WeeklyCalendarScreen}
        options={{ title: "Weekly Schedule" }}
      />

      <Stack.Screen
        name="WELLocations"
        component={WELLocationsScreen}
        options={{ title: "WEL Locations" }}
      />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Debug logging
  console.log("🔐 AppNavigator Debug:", {
    isLoading,
    isAuthenticated,
    hasUser: !!user,
    userInfo: user ? { id: user.id, email: user.email } : null,
  });

  // Show loading screen while checking authentication
  if (isLoading) {
    console.log("📱 Showing loading screen...");
    return <LoadingScreen message="Checking authentication..." />;
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    console.log("🔒 User not authenticated - showing login screen");
    return <LoginScreen />;
  }

  // Show main app if authenticated
  console.log("✅ User authenticated - showing main app");
  return <MainStackNavigator />;
}

const styles = StyleSheet.create({
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
});
