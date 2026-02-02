import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
  RefreshControl,
} from "react-native";
import { Card, Title, Paragraph, Chip } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";
import StudentAPI from "../services/api";
import { DownloadItem } from "../types";

export default function DownloadsScreen() {
  const { user, isAuthenticated } = useAuth();
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [downloadingFiles, setDownloadingFiles] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      loadDownloads();
    }
  }, [user?.id, isAuthenticated]);

  const loadDownloads = async () => {
    if (!isAuthenticated || !user?.id) return;

    try {
      setLoading(true);
      console.log("📁 Loading downloads for user:", user.id);

      const downloads = await StudentAPI.getDownloads(user.id);

      console.log("📁 Downloads loaded:", {
        count: downloads?.length || 0,
        isArray: Array.isArray(downloads),
        firstItem: downloads?.[0] ? Object.keys(downloads[0]) : null,
      });

      // Ensure downloads is always an array
      if (Array.isArray(downloads)) {
        setDownloads(downloads);
      } else {
        console.warn("⚠️ Downloads is not an array:", typeof downloads);
        setDownloads([]);
      }
    } catch (error) {
      console.error("Error fetching downloads:", error);
      setDownloads([]); // Set empty array on error
      Alert.alert("Error", "Failed to load downloads");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDownloads();
    setRefreshing(false);
  };

  const handleDownload = async (
    download: DownloadItem,
    useS3: boolean = true
  ) => {
    try {
      setDownloadingFiles((prev) => new Set(prev).add(download.id));

      let downloadUrl: string;

      console.log("📱 Requesting fresh download URL for:", {
        id: download.id,
        title: download.title,
        hasFileKey: !!download.fileKey,
        useS3
      });

      // Always fetch a fresh URL - never use cached fileUrl as it expires
      if (useS3 && download.fileKey) {
        // Try using fileKey to get fresh signed URL
        console.log("📱 Fetching fresh URL with fileKey...");
        downloadUrl = await StudentAPI.downloadFileWithKey(
          download.fileKey,
          download.title
        );
      } else {
        // Use download ID to get fresh signed URL
        console.log("📱 Fetching fresh URL with download ID...");
        downloadUrl = await StudentAPI.downloadFile(download.id, download.title);
      }

      if (downloadUrl) {
        console.log("📱 Opening fresh download URL:", downloadUrl.substring(0, 100) + "...");
        await Linking.openURL(downloadUrl);
      } else {
        throw new Error("No download URL received from server");
      }
    } catch (error: any) {
      console.error("❌ Error downloading file:", error.message || error);
      // Try fallback method if primary fails
      if (useS3) {
        console.log("⚠️ S3 download failed, trying direct download method...");
        await handleDownload(download, false);
      } else {
        Alert.alert(
          "Download Error",
          "Unable to download the file. The download link may have expired or the file may not be available. Please try refreshing the page or contact support if the problem persists."
        );
      }
    } finally {
      setDownloadingFiles((prev) => {
        const newSet = new Set(prev);
        newSet.delete(download.id);
        return newSet;
      });
    }
  };

  const formatFileSize = (bytes?: string) => {
    // Since DownloadItem doesn't have fileSize, this is optional
    if (!bytes) return "Unknown size";
    const size = parseInt(bytes);
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getFileIcon = (fileType?: string) => {
    if (!fileType) return "document-outline";

    switch (fileType.toLowerCase()) {
      case "pdf":
        return "document-text";
      case "doc":
      case "docx":
        return "document";
      case "xls":
      case "xlsx":
        return "grid";
      case "ppt":
      case "pptx":
        return "easel";
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return "image";
      case "mp4":
      case "mov":
      case "avi":
        return "videocam";
      case "mp3":
      case "wav":
        return "musical-notes";
      default:
        return "document-outline";
    }
  };

  const renderDownloadItem = ({ item }: { item: DownloadItem }) => {
    const isDownloading = downloadingFiles.has(item.id);

    return (
      <Card style={styles.downloadCard} key={item.id}>
        <Card.Content>
          <View style={styles.downloadHeader}>
            <View style={styles.fileInfo}>
              <Ionicons
                name={getFileIcon(item.fileType)}
                size={24}
                color="#6200EE"
                style={styles.fileIcon}
              />
              <View style={styles.fileDetails}>
                <Title style={styles.fileName}>{item.title}</Title>
                {item.description && (
                  <Paragraph style={styles.fileDescription}>
                    {item.description}
                  </Paragraph>
                )}
                <View style={styles.fileMeta}>
                  <Chip style={styles.categoryChip} compact>
                    {item.category}
                  </Chip>
                  <Text style={styles.fileMetaText}>
                    {formatDate(item.uploadDate)}
                  </Text>
                </View>
              </View>
            </View>
            <TouchableOpacity
              style={[
                styles.downloadButton,
                isDownloading && styles.downloadingButton,
              ]}
              onPress={() => handleDownload(item)}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="download" size={20} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </Card.Content>
      </Card>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200EE" />
        <Text style={styles.loadingText}>Loading downloads...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Title style={styles.screenTitle}>Downloads</Title>

        {downloads.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="download-outline" size={64} color="#ccc" />
            <Text style={styles.emptyStateText}>No downloads available</Text>
            <Text style={styles.emptyStateSubtext}>
              Check back later for course materials and documents
            </Text>
          </View>
        ) : (
          <View style={styles.downloadsContainer}>
            {downloads.map((item) => renderDownloadItem({ item }))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingTop: 48,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: "bold",
    margin: 16,
    color: "#333",
  },
  downloadsContainer: {
    padding: 16,
    paddingTop: 0,
  },
  downloadCard: {
    marginBottom: 12,
    elevation: 2,
  },
  downloadHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  fileInfo: {
    flexDirection: "row",
    flex: 1,
    alignItems: "center",
  },
  fileIcon: {
    marginRight: 12,
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    color: "#333",
  },
  fileDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  fileMeta: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  categoryChip: {
    marginRight: 8,
    marginBottom: 4,
  },
  fileMetaText: {
    fontSize: 12,
    color: "#888",
  },
  downloadButton: {
    backgroundColor: "#6200EE",
    padding: 12,
    borderRadius: 8,
    marginLeft: 12,
  },
  downloadingButton: {
    backgroundColor: "#9E9E9E",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 64,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 32,
  },
});
