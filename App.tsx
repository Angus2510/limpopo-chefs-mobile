import React from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { Provider as PaperProvider, MD3LightTheme } from "react-native-paper";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "./src/contexts/AuthContext";
import AppNavigator from "./src/navigation/AppNavigator";
import { View, Text, StyleSheet } from "react-native";

// Force Light Theme for React Native Paper
const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#2196F3",
    background: "#ffffff",
    surface: "#ffffff",
    onBackground: "#000000",
    onSurface: "#000000",
  },
};

// Force Light Theme for React Navigation
const navigationTheme = {
  ...DefaultTheme,
  dark: false,
  colors: {
    ...DefaultTheme.colors,
    primary: "#2196F3",
    background: "#ffffff",
    card: "#ffffff",
    text: "#000000",
    border: "#e0e0e0",
    notification: "#2196F3",
  },
};

// Error Boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("App Error:", error);
    console.error("Error Info:", errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>App Error</Text>
          <Text style={styles.errorText}>
            {this.state.error?.message || "Something went wrong"}
          </Text>
          <Text style={styles.errorDetails}>
            Check your internet connection and try restarting the app.
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <PaperProvider theme={lightTheme}>
        <AuthProvider>
          <NavigationContainer theme={navigationTheme}>
            <AppNavigator />
            <StatusBar style="dark" backgroundColor="#ffffff" />
          </NavigationContainer>
        </AuthProvider>
      </PaperProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#f44336",
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginBottom: 16,
  },
  errorDetails: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
});
