import React from "react";
import { View, Text, StyleSheet, ActivityIndicator, Image } from "react-native";

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({
  message = "Loading...",
}: LoadingScreenProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* App Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require("../assets/images/logo.png")}
            style={styles.fullLogo}
            resizeMode="contain"
          />
        </View>

        {/* Loading indicator */}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>{message}</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Shaping people's future</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    justifyContent: "space-between",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  logoContainer: {
    marginBottom: 20,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  fullLogo: {
    width: "75%",
    height: "100%",
  },
  loadingContainer: {
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  footer: {
    paddingBottom: 40,
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: "#888",
    fontStyle: "italic",
  },
});
