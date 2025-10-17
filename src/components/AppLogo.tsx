import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import images from "../assets/images";

interface LogoProps {
  size?: "small" | "medium" | "large";
  showText?: boolean;
  style?: any;
}

export const AppLogo: React.FC<LogoProps> = ({
  size = "medium",
  showText = true,
  style,
}) => {
  const logoSizes = {
    small: { width: 40, height: 40 },
    medium: { width: 80, height: 80 },
    large: { width: 120, height: 120 },
  };

  const textSizes = {
    small: 16,
    medium: 20,
    large: 24,
  };

  return (
    <View style={[styles.container, style]}>
      <Image
        source={images.logo}
        style={[styles.logo, logoSizes[size]]}
        resizeMode="contain"
      />
      {showText && (
        <Text style={[styles.appName, { fontSize: textSizes[size] }]}>
          Limpopo Chefs Academy
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    marginBottom: 8,
  },
  appName: {
    fontWeight: "bold",
    textAlign: "center",
    color: "#2c3e50",
  },
});

export default AppLogo;
