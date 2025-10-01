import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Card, Title, Paragraph, Avatar, Button } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import StudentAPI from "../services/api";
import { Student } from "../types";

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState("documents");

  // Mock student data
  const student: Student = {
    id: "current-student-id",
    name: "John Doe",
    email: "john.doe@example.com",
    studentNumber: "LCA2024001",
    course: "Culinary Arts",
    year: 2,
    phone: "+1234567890",
    dateOfBirth: "2000-01-01",
    profileImage: undefined,
    address: {
      street: "123 Main St",
      city: "Pretoria",
      state: "Gauteng",
      zipCode: "0001",
    },
    guardian: {
      name: "Jane Doe",
      phone: "+0987654321",
      email: "jane.doe@example.com",
      relationship: "Mother",
    },
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "documents":
        return (
          <View>
            <Title>Documents</Title>
            <Paragraph>Student ID Card</Paragraph>
            <Paragraph>Enrollment Letter</Paragraph>
            <Paragraph>Medical Certificate</Paragraph>
          </View>
        );
      case "finance":
        return (
          <View>
            <Title>Finance</Title>
            <Paragraph>Course Materials Fee: R500 (Unpaid)</Paragraph>
            <Paragraph>Uniform Deposit: R200 (Paid)</Paragraph>
            <Paragraph>Kitchen Equipment Fee: R750 (Unpaid)</Paragraph>
          </View>
        );
      case "results":
        return (
          <View>
            <Title>Results</Title>
            <Paragraph>Basic Knife Skills: Achieved</Paragraph>
            <Paragraph>Food Safety Quiz: 85%</Paragraph>
            <Paragraph>Menu Planning: In Progress</Paragraph>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <Card style={styles.headerCard}>
        <Card.Content style={styles.headerContent}>
          <Avatar.Image
            size={80}
            source={{
              uri: student.profileImage || "https://via.placeholder.com/80",
            }}
          />
          <View style={styles.headerText}>
            <Title>{student.name}</Title>
            <Paragraph>{student.studentNumber}</Paragraph>
            <Paragraph>
              {student.course} - Year {student.year}
            </Paragraph>
          </View>
        </Card.Content>
      </Card>

      {/* Student Info */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Student Information</Title>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{student.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Phone:</Text>
            <Text style={styles.value}>{student.phone}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Date of Birth:</Text>
            <Text style={styles.value}>{student.dateOfBirth}</Text>
          </View>
        </Card.Content>
      </Card>

      {/* Address Info */}
      {student.address && (
        <Card style={styles.card}>
          <Card.Content>
            <Title>Address Information</Title>
            <Text style={styles.value}>{student.address.street}</Text>
            <Text style={styles.value}>
              {student.address.city}, {student.address.state}{" "}
              {student.address.zipCode}
            </Text>
          </Card.Content>
        </Card>
      )}

      {/* Guardian Info */}
      {student.guardian && (
        <Card style={styles.card}>
          <Card.Content>
            <Title>Guardian Information</Title>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Name:</Text>
              <Text style={styles.value}>{student.guardian.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Relationship:</Text>
              <Text style={styles.value}>{student.guardian.relationship}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Phone:</Text>
              <Text style={styles.value}>{student.guardian.phone}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{student.guardian.email}</Text>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Tabs */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === "documents" && styles.activeTab,
              ]}
              onPress={() => setActiveTab("documents")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "documents" && styles.activeTabText,
                ]}
              >
                Documents
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === "finance" && styles.activeTab]}
              onPress={() => setActiveTab("finance")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "finance" && styles.activeTabText,
                ]}
              >
                Finance
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === "results" && styles.activeTab]}
              onPress={() => setActiveTab("results")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "results" && styles.activeTabText,
                ]}
              >
                Results
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.tabContent}>{renderTabContent()}</View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  headerCard: {
    marginBottom: 16,
    elevation: 4,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerText: {
    marginLeft: 16,
    flex: 1,
  },
  card: {
    marginBottom: 16,
    elevation: 4,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  label: {
    fontWeight: "bold",
    width: 120,
    color: "#666",
  },
  value: {
    flex: 1,
    color: "#333",
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    padding: 12,
    alignItems: "center",
    backgroundColor: "#e0e0e0",
    marginHorizontal: 2,
    borderRadius: 4,
  },
  activeTab: {
    backgroundColor: "#2196F3",
  },
  tabText: {
    color: "#666",
    fontWeight: "bold",
  },
  activeTabText: {
    color: "#fff",
  },
  tabContent: {
    paddingTop: 16,
  },
});
