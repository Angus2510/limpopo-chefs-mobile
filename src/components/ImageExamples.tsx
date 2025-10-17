// Example component showing different ways to use images
import React from "react";
import { View, Image, StyleSheet } from "react-native";
import { Avatar } from "react-native-paper";
import images from "../assets/images";

export const ImageExamples = () => {
  return (
    <View style={styles.container}>
      {/* Method 1: Direct require */}
      <Image source={require("../../assets/icon.png")} style={styles.logo} />

      {/* Method 2: Using images index */}
      <Image source={images.icon} style={styles.logo} />

      {/* Method 3: Avatar component with image */}
      <Avatar.Image source={images.icon} size={64} />

      {/* Method 4: Remote image (from URL) */}
      <Image
        source={{ uri: "https://example.com/image.jpg" }}
        style={styles.remoteImage}
      />

      {/* Method 5: Conditional image with fallback */}
      <Image
        source={images.icon || require("../../assets/icon.png")}
        style={styles.logo}
        defaultSource={require("../../assets/icon.png")}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  remoteImage: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
});
