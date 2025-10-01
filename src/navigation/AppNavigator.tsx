import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";

// Import screens
import DashboardScreen from "../screens/DashboardScreen";
import AssignmentsScreen from "../screens/AssignmentsScreen";
import AssignmentDetailScreen from "../screens/AssignmentDetailScreen";
import AttendanceScreen from "../screens/AttendanceScreen";
import ScanAttendanceScreen from "../screens/ScanAttendanceScreen";
import ViewAttendanceScreen from "../screens/ViewAttendanceScreen";
import FeesScreen from "../screens/FeesScreen";
import DownloadsScreen from "../screens/DownloadsScreen";
import ProfileScreen from "../screens/ProfileScreen";
import SORScreen from "../screens/SORScreen";
import WELScreen from "../screens/WELScreen";
import WELLocationsScreen from "../screens/WELLocationsScreen";

export type RootStackParamList = {
  MainTabs: undefined;
  AssignmentDetail: { assignmentId: string };
  ScanAttendance: undefined;
  ViewAttendance: undefined;
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
        component={MoreTabsScreen}
        options={{ title: "More" }}
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
            iconName = "circle";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#2196F3",
        tabBarInactiveTintColor: "gray",
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Assignments" component={AssignmentsScreen} />
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
        name="AssignmentDetail"
        component={AssignmentDetailScreen}
        options={{ title: "Assignment Details" }}
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
