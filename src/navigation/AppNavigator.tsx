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
} from "react-native";

// Import screens
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

// More Home Screen component
function MoreHomeScreen({ navigation }: any) {
  console.log("MoreHomeScreen rendered"); // Debug log

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>
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
            📅 Weekly Calendar
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
          onPress={() => navigation.navigate("Fees")}
        >
          <Text style={{ fontSize: 16, fontWeight: "500" }}>💰 Fees</Text>
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
          <Text style={{ fontSize: 16, fontWeight: "500" }}>📥 Downloads</Text>
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
          <Text style={{ fontSize: 16, fontWeight: "500" }}>👤 Profile</Text>
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
          <Text style={{ fontSize: 16, fontWeight: "500" }}>
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
          <Text style={{ fontSize: 16, fontWeight: "500" }}>
            💼 Work Experience
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
        options={{ title: "Weekly Calendar" }}
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

          return <Ionicons name={iconName} size={size} color={color} />;
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
        options={{ title: "Weekly Calendar" }}
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
  return (
    <NavigationContainer>
      <MainStackNavigator />
    </NavigationContainer>
  );
}
