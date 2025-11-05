import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { APP_CONFIG } from "../config";

interface NotificationBadgeProps {
  count: number;
  size?: "small" | "medium" | "large";
  position?:
    | "top-right"
    | "top-left"
    | "bottom-right"
    | "bottom-left"
    | "inline";
  style?: any;
}

export default function NotificationBadge({
  count,
  size = "medium",
  position = "top-right",
  style,
}: NotificationBadgeProps) {
  if (count <= 0) return null;

  const displayCount = count > 99 ? "99+" : count.toString();

  const sizeStyles = {
    small: { width: 16, height: 16, fontSize: 10 },
    medium: { width: 20, height: 20, fontSize: 12 },
    large: { width: 24, height: 24, fontSize: 14 },
  };

  const positionStyles = {
    "top-right": { position: "absolute" as const, top: -8, right: -8 },
    "top-left": { position: "absolute" as const, top: -8, left: -8 },
    "bottom-right": { position: "absolute" as const, bottom: -8, right: -8 },
    "bottom-left": { position: "absolute" as const, bottom: -8, left: -8 },
    inline: { position: "relative" as const },
  };

  return (
    <View
      style={[styles.badge, sizeStyles[size], positionStyles[position], style]}
    >
      <Text style={[styles.badgeText, { fontSize: sizeStyles[size].fontSize }]}>
        {displayCount}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: APP_CONFIG.COLORS.ERROR,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 20,
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: "white",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  badgeText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    includeFontPadding: false,
  },
});
