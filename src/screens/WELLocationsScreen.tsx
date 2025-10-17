import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from "react-native";
import {
  Card,
  Title,
  Paragraph,
  Button,
  ActivityIndicator,
  Chip,
} from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { WELLocation } from "../types";
import { useAuth } from "../contexts/AuthContext";
import StudentAPI from "../services/api";

export default function WELLocationsScreen() {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [locations, setLocations] = useState<WELLocation[]>([]);

  const loadWELLocations = async () => {
    try {
      console.log("🔍 WELLocations: Loading locations");
      const locationsData = await StudentAPI.getWELLocations();
      console.log(
        "✅ WELLocations: Locations loaded:",
        JSON.stringify(locationsData, null, 2)
      );

      setLocations(Array.isArray(locationsData) ? locationsData : []);
    } catch (error) {
      console.error("❌ WELLocations: Error loading locations:", error);
      Alert.alert("Error", "Failed to load WEL locations");
      setLocations([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWELLocations();
    setRefreshing(false);
  };

  const handleApplyForPlacement = async (locationId: string) => {
    if (!isAuthenticated || !user?.id) {
      Alert.alert("Error", "Please log in to apply for placements");
      return;
    }

    try {
      // For now, just show an alert. In a real app, you'd navigate to an application form
      Alert.alert(
        "Apply for Placement",
        "This feature will allow you to apply for a WEL placement at this location.",
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error("❌ WELLocations: Error applying for placement:", error);
      Alert.alert("Error", "Failed to apply for placement");
    }
  };

  useEffect(() => {
    loadWELLocations();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading WEL locations...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Card style={styles.headerCard}>
        <Card.Content>
          <View style={styles.header}>
            <Ionicons name="location" size={24} color="#2196F3" />
            <Title style={styles.title}>Work Experience Locations</Title>
          </View>
          <Paragraph>
            Browse available work experience learning locations and apply for
            placements.
          </Paragraph>
        </Card.Content>
      </Card>

      {locations.length > 0 ? (
        locations.map((location) => (
          <Card key={location.id} style={styles.locationCard}>
            <Card.Content>
              <View style={styles.locationHeader}>
                <Title style={styles.locationName}>{location.name}</Title>
                {location.availableSlots > 0 && (
                  <Chip
                    icon="check-circle"
                    mode="outlined"
                    style={styles.availableChip}
                  >
                    {location.availableSlots} slots
                  </Chip>
                )}
              </View>

              <View style={styles.locationDetails}>
                <View style={styles.detailRow}>
                  <Ionicons name="location-outline" size={16} color="#666" />
                  <Text style={styles.detailText}>{location.address}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="person-outline" size={16} color="#666" />
                  <Text style={styles.detailText}>
                    {location.contactPerson}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="mail-outline" size={16} color="#666" />
                  <Text style={styles.detailText}>{location.contactEmail}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="call-outline" size={16} color="#666" />
                  <Text style={styles.detailText}>{location.contactPhone}</Text>
                </View>
              </View>

              {location.requirements && location.requirements.length > 0 && (
                <View style={styles.requirementsSection}>
                  <Text style={styles.requirementsTitle}>Requirements:</Text>
                  {location.requirements.map((req, index) => (
                    <Text key={index} style={styles.requirementItem}>
                      • {req}
                    </Text>
                  ))}
                </View>
              )}

              <Button
                mode="contained"
                onPress={() => handleApplyForPlacement(location.id)}
                style={styles.applyButton}
                disabled={location.availableSlots === 0}
                icon="send"
              >
                {location.availableSlots > 0
                  ? "Apply for Placement"
                  : "No Slots Available"}
              </Button>
            </Card.Content>
          </Card>
        ))
      ) : (
        <Card style={styles.emptyCard}>
          <Card.Content style={styles.emptyContent}>
            <Ionicons name="business-outline" size={48} color="#ccc" />
            <Title style={styles.emptyTitle}>No Locations Available</Title>
            <Paragraph style={styles.emptyText}>
              There are currently no work experience locations available. Please
              check back later.
            </Paragraph>
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
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
  headerCard: {
    margin: 16,
    elevation: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    marginLeft: 8,
    fontSize: 18,
  },
  locationCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
  },
  locationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  locationName: {
    fontSize: 16,
    flex: 1,
  },
  availableChip: {
    backgroundColor: "#e8f5e8",
  },
  locationDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  requirementsSection: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  requirementItem: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  applyButton: {
    marginTop: 8,
  },
  emptyCard: {
    marginHorizontal: 16,
    marginTop: 32,
    elevation: 2,
  },
  emptyContent: {
    alignItems: "center",
    padding: 32,
  },
  emptyTitle: {
    marginTop: 16,
    color: "#999",
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
    marginTop: 8,
  },
});
