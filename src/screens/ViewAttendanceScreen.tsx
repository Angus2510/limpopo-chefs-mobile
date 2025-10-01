import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Title } from "react-native-paper";

export default function ViewAttendanceScreen() {
  return (
    <View style={styles.container}>
      <Title>View Attendance</Title>
      <Text>Attendance records will be displayed here</Text>
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
