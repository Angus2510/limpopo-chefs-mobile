import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Title } from "react-native-paper";

export default function WELLocationsScreen() {
  return (
    <View style={styles.container}>
      <Title>WEL Locations</Title>
      <Text>Work Experience Learning locations will be displayed here</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
});
