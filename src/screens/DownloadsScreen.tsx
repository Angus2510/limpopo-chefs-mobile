import React, { useState, useEffect, useRef } from "react";
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
  AppState,
  AppStateStatus,
} from "react-native";
import { Card, Title, Paragraph, Chip } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { useAuth } from "../contexts/AuthContext";
import AuthService from "../services/auth";
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
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      loadDownloads();
    }
  }, [user?.id, isAuthenticated]);

  // Re-fetch when app returns from background
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (nextState: AppStateStatus) => {
        if (
          appStateRef.current.match(/inactive|background/) &&
          nextState === "active" &&
          isAuthenticated &&
          user?.id
        ) {
          loadDownloads();
        }
        appStateRef.current = nextState;
      },
    );
    return () => subscription.remove();
  }, [isAuthenticated, user?.id]);

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

  const handleDownload = async (download: DownloadItem) => {
    if (downloadingFiles.has(download.id)) return;

    try {
      setDownloadingFiles((prev) => new Set(prev).add(download.id));
      setDownloadProgress((prev) => ({ ...prev, [download.id]: 0 }));

      console.log("📱 Starting download for:", download.title);

      // Always fetch a fresh server proxy URL - never use stale listing URLs
      let downloadUrl: string;
      if (download.fileKey) {
        downloadUrl = await StudentAPI.downloadFileWithKey(
          download.fileKey,
          download.title,
        );
      } else {
        downloadUrl = await StudentAPI.downloadFile(
          download.id,
          download.title,
        );
      }

      if (!downloadUrl) {
        throw new Error("No download URL received from server");
      }

      // Extract extension from fileKey first, fall back to fileType
      const keyExt = download.fileKey?.split(".").pop()?.toLowerCase();
      const fileExtension =
        keyExt && keyExt.length <= 5 && keyExt !== download.fileKey
          ? keyExt
          : download.fileType || "pdf";

      const safeFileName = `${download.title.replace(/[^a-z0-9]/gi, "_")}_${Date.now()}.${fileExtension}`;
      const fileUri = `${FileSystem.documentDirectory}${safeFileName}`;

      console.log("📥 Downloading to:", fileUri);

      // Only add auth header for our own server URLs.
      // S3 pre-signed URLs are self-authenticating - sending an Authorization
      // header alongside the pre-signed signature causes S3 to reject the request.
      const isS3Url =
        downloadUrl.includes("amazonaws.com") ||
        downloadUrl.includes("X-Amz-") ||
        downloadUrl.includes("x-amz-");
      const token = isS3Url ? null : await AuthService.getToken();
      const downloadHeaders: Record<string, string> = {};
      if (token) {
        downloadHeaders["Authorization"] = `Bearer ${token}`;
      }

      const downloadResumable = FileSystem.createDownloadResumable(
        downloadUrl,
        fileUri,
        { headers: downloadHeaders },
        (downloadProgress) => {
          const total = downloadProgress.totalBytesExpectedToWrite;
          const pct =
            total > 0
              ? Math.round((downloadProgress.totalBytesWritten / total) * 100)
              : 0;
          setDownloadProgress((prev) => ({ ...prev, [download.id]: pct }));
        },
      );

      const result = await downloadResumable.downloadAsync();

      if (!result?.uri) {
        throw new Error("Download failed - no file returned");
      }

      // downloadAsync doesn't throw on HTTP errors - check status manually
      if (result.status && result.status !== 200) {
        await FileSystem.deleteAsync(result.uri, { idempotent: true });
        throw new Error(
          `Server returned ${result.status}. The file may not be available.`,
        );
      }

      setDownloadProgress((prev) => {
        const updated = { ...prev };
        delete updated[download.id];
        return updated;
      });

      console.log("✅ File downloaded:", result.uri);

      const isSharingAvailable = await Sharing.isAvailableAsync();
      if (isSharingAvailable) {
        await Sharing.shareAsync(result.uri, {
          mimeType: getMimeType(fileExtension),
          dialogTitle: download.title,
          UTI: `.${fileExtension}`,
        });
      } else {
        Alert.alert("Download Complete", "File saved successfully.");
      }
    } catch (error: any) {
      console.error("❌ Download failed:", error.message || error);

      setDownloadProgress((prev) => {
        const updated = { ...prev };
        delete updated[download.id];
        return updated;
      });

      Alert.alert(
        "Download Failed",
        error.message || "Unable to download the file. Please try again.",
      );
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
