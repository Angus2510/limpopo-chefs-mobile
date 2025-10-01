import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import { Card, Title, Paragraph, ActivityIndicator } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import StudentAPI from "../services/api";
import { DownloadItem } from "../types";

export default function DownloadsScreen() {
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDownloads = async () => {
    try {
      // Mock data for demonstration
      const mockDownloads: DownloadItem[] = [
        {
          id: "1",
          title: "Student Handbook",
          description: "Complete guide for students",
          fileUrl: "https://example.com/handbook.pdf",
          fileType: "pdf",
          uploadDate: "2025-09-01",
          category: "General",
        },
        {
          id: "2",
          title: "Course Syllabus",
          description: "Culinary Arts syllabus",
          fileUrl: "https://example.com/syllabus.pdf",
          fileType: "pdf",
          uploadDate: "2025-09-01",
          category: "Academic",
        },
        {
          id: "3",
          title: "Assignment Template",
          description: "Template for assignments",
          fileUrl: "https://example.com/template.docx",
          fileType: "docx",
          uploadDate: "2025-09-15",
          category: "Assignments",
        },
      ];
      setDownloads(mockDownloads);
    } catch (error) {
      Alert.alert("Error", "Failed to load downloads");
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = async (item: DownloadItem) => {
    Alert.alert(
      "Download",
      `Downloading ${item.title}... (Mock functionality)`
    );
    // In a real app, this would download the file
    // const fileUri = FileSystem.cacheDirectory + item.title.replace(/[^a-zA-Z0-9]/g, '_') + "." + item.fileType;
    // const { uri } = await FileSystem.downloadAsync(item.fileUrl, fileUri);
    // Alert.alert("Download Complete", `File saved to ${uri}`);
  };

  useEffect(() => {
    loadDownloads();
  }, []);

  const renderDownloadItem = ({ item }: { item: DownloadItem }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.itemHeader}>
          <View style={styles.itemInfo}>
            <Title style={styles.itemTitle}>{item.title}</Title>
            <Paragraph style={styles.itemDescription}>
              {item.description}
            </Paragraph>
            <Text style={styles.itemMeta}>
              {item.category} • {new Date(item.uploadDate).toLocaleDateString()}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.downloadButton}
            onPress={() => downloadFile(item)}
          >
            <Ionicons name="download" size={24} color="#2196F3" />
          </TouchableOpacity>
        </View>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading downloads...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Title style={styles.screenTitle}>Downloads</Title>
      <FlatList
        data={downloads}
        renderItem={renderDownloadItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  screenTitle: {
    marginBottom: 16,
  },
  card: {
    marginBottom: 12,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 18,
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  itemMeta: {
    fontSize: 12,
    color: "#999",
  },
  downloadButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
});
