import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Platform,
} from "react-native";
import { Card, Title, Paragraph, Chip } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { useAuth } from "../contexts/AuthContext";
import StudentAPI from "../services/api";
import { DownloadItem } from "../types";

export default function DownloadsScreen() {
  const { user, isAuthenticated } = useAuth();
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [downloadingFiles, setDownloadingFiles] = useState<Set<string>>(
    new Set(),
  );
  const [downloadProgress, setDownloadProgress] = useState<{
    [key: string]: number;
  }>({});

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
    useS3: boolean = true,
  ) => {
    try {
      setDownloadingFiles((prev) => new Set(prev).add(download.id));
      setDownloadProgress((prev) => ({ ...prev, [download.id]: 0 }));

      let downloadUrl: string;

      console.log("📱 Requesting fresh download URL for:", {
        id: download.id,
        title: download.title,
        hasFileKey: !!download.fileKey,
        useS3,
      });

      // Always fetch a fresh URL - never use cached fileUrl as it expires
      if (useS3 && download.fileKey) {
        console.log("📱 Fetching fresh URL with fileKey...");
        downloadUrl = await StudentAPI.downloadFileWithKey(
          download.fileKey,
          download.title,
        );
      } else {
        console.log("📱 Fetching fresh URL with download ID...");
        downloadUrl = await StudentAPI.downloadFile(
          download.id,
          download.title,
        );
      }

      if (!downloadUrl) {
        throw new Error("No download URL received from server");
      }

      // Generate safe filename
      const fileExtension = download.fileType || "pdf";
      const safeFileName = `${download.title.replace(/[^a-z0-9]/gi, "_")}_${Date.now()}.${fileExtension}`;
      const fileUri = `${FileSystem.documentDirectory}${safeFileName}`;

      console.log("📥 Downloading file to:", fileUri);

      // Download file with progress tracking
      const downloadResumable = FileSystem.createDownloadResumable(
        downloadUrl,
        fileUri,
        {},
        (downloadProgress) => {
          const progress =
            downloadProgress.totalBytesWritten /
            downloadProgress.totalBytesExpectedToWrite;
          setDownloadProgress((prev) => ({
            ...prev,
            [download.id]: Math.round(progress * 100),
          }));
        },
      );

      const result = await downloadResumable.downloadAsync();

      if (result?.uri) {
        console.log("✅ File downloaded successfully:", result.uri);

        // Clear progress
        setDownloadProgress((prev) => {
          const newProgress = { ...prev };
          delete newProgress[download.id];
          return newProgress;
        });

        // Check if sharing is available and share the file
        const isSharingAvailable = await Sharing.isAvailableAsync();
        if (isSharingAvailable) {
          await Sharing.shareAsync(result.uri, {
            mimeType: getMimeType(download.fileType),
            dialogTitle: download.title,
            UTI: `.${download.fileType || "pdf"}`,
          });
        } else {
          Alert.alert(
            "Download Complete",
            `File saved to: ${result.uri}\n\nYou can access it from your device's file manager.`,
          );
        }
      } else {
        throw new Error("Download failed - no file URI returned");
      }
    } catch (error: any) {
      console.error("❌ Error downloading file:", error.message || error);

      // Clear progress on error
      setDownloadProgress((prev) => {
        const newProgress = { ...prev };
        delete newProgress[download.id];
        return newProgress;
      });

      // Try fallback method if primary fails
      if (useS3) {
        console.log("⚠️ S3 download failed, trying direct download method...");
        await handleDownload(download, false);
      } else {
        Alert.alert(
          "Download Error",
          "Unable to download the file. The download link may have expired or the file may not be available. Please try refreshing the page or contact support if the problem persists.",
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

  const getMimeType = (fileType?: string): string => {
    if (!fileType) return "application/octet-stream";

    const mimeTypes: { [key: string]: string } = {
      pdf: "application/pdf",
      doc: "application/msword",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      xls: "application/vnd.ms-excel",
      xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ppt: "application/vnd.ms-powerpoint",
      pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      mp4: "video/mp4",
      mp3: "audio/mpeg",
      txt: "text/plain",
    };

    return mimeTypes[fileType.toLowerCase()] || "application/octet-stream";
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
    const progress = downloadProgress[item.id] || 0;

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
                {isDownloading && progress > 0 && (
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                      <View
                        style={[styles.progressFill, { width: `${progress}%` }]}
                      />
                    </View>
                    <Text style={styles.progressText}>{progress}%</Text>
                  </View>
                )}
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
  progressContainer: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: "#e0e0e0",
    borderRadius: 3,
    overflow: "hidden",
    marginRight: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#6200EE",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: "#6200EE",
    fontWeight: "600",
    minWidth: 35,
  },
});
