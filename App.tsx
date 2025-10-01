import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar } from "expo-status-bar";
import { PaperProvider } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Card } from "react-native-paper";

// Import screens
import DashboardScreen from "./src/screens/DashboardScreen";
import AttendanceScreen from "./src/screens/AttendanceScreen";
import ViewAttendanceScreen from "./src/screens/ViewAttendanceScreen";
import FeesScreen from "./src/screens/FeesScreen";
import DownloadsScreen from "./src/screens/DownloadsScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import SORScreen from "./src/screens/SORScreen";
import WELScreen from "./src/screens/WELScreen";
import WeeklyCalendarScreen from "./src/screens/WeeklyCalendarScreen";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function MoreScreen({ navigation }: any) {
  return <MoreStackNavigator />;
}

function MoreStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MoreHome"
        component={MoreTabsScreen}
        options={{ title: "More" }}
      />
      <Stack.Screen
        name="WeeklyCalendar"
        component={WeeklyCalendarScreen}
        options={{ title: "Weekly Calendar" }}
      />
      <Stack.Screen
        name="Fees"
        component={FeesScreen}
        options={{ title: "Fees" }}
      />
      <Stack.Screen
        name="Downloads"
        component={DownloadsScreen}
        options={{ title: "Downloads" }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: "Profile" }}
      />
      <Stack.Screen
        name="SOR"
        component={SORScreen}
        options={{ title: "Student Records" }}
      />
      <Stack.Screen
        name="WEL"
        component={WELScreen}
        options={{ title: "Work Experience" }}
      />
    </Stack.Navigator>
  );
}

function MoreTabsScreen({ navigation }: any) {
  const menuItems = [
    {
      title: "Weekly Calendar",
      screen: "WeeklyCalendar",
      icon: "calendar-outline",
    },
    { title: "Fees", screen: "Fees", icon: "cash-outline" },
    { title: "Downloads", screen: "Downloads", icon: "download-outline" },
    { title: "Profile", screen: "Profile", icon: "person-outline" },
    { title: "Student Records", screen: "SOR", icon: "document-text-outline" },
    { title: "Work Experience", screen: "WEL", icon: "business-outline" },
  ];

  return (
    <View style={styles.moreContainer}>
      {menuItems.map((item) => (
        <TouchableOpacity
          key={item.screen}
          onPress={() => navigation.navigate(item.screen)}
        >
          <Card style={styles.menuCard}>
            <Card.Content style={styles.menuContent}>
              <Ionicons name={item.icon as any} size={24} color="#2196F3" />
              <Text style={styles.menuTitle}>{item.title}</Text>
            </Card.Content>
          </Card>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function AttendanceStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="AttendanceHome"
        component={AttendanceScreen}
        options={{ title: "Attendance" }}
      />
      <Stack.Screen
        name="ViewAttendance"
        component={ViewAttendanceScreen}
        options={{ title: "View Attendance" }}
      />
    </Stack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          if (route.name === "Dashboard") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Attendance") {
            iconName = focused
              ? "checkmark-circle"
              : "checkmark-circle-outline";
          } else if (route.name === "More") {
            iconName = focused ? "menu" : "menu-outline";
          } else {
            iconName = "home-outline";
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#2196F3",
        tabBarInactiveTintColor: "gray",
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Attendance" component={AttendanceStackNavigator} />
      <Tab.Screen name="More" component={MoreScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <PaperProvider>
      <NavigationContainer>
        <MainTabs />
        <StatusBar style="auto" />
      </NavigationContainer>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  moreContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  menuCard: {
    marginBottom: 12,
    elevation: 4,
  },
  menuContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  menuTitle: {
    marginLeft: 16,
    fontSize: 16,
    color: "#333",
  },
});
