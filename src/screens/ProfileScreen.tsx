import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Image,
} from "react-native";
import {
  Card,
  Title,
  Paragraph,
  Avatar,
  Button,
  ActivityIndicator,
  Divider,
  Chip,
} from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import StudentAPI from "../services/api";
import { Student } from "../types";
import { useAuth } from "../contexts/AuthContext";

interface StudentProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  studentNumber?: string;
  course?: string;
  year?: number;
  profileImage?: string;
  avatarUrl?: string | null;
  campus?: string;
  intakeGroup?: string;
  intakeGroupId?: string;
  enrollmentDate?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  guardian?: {
    name?: string;
    phone?: string;
    email?: string;
    relationship?: string;
  };
  status?: string;
}

export default function ProfileScreen() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState("overview");
  const [documents, setDocuments] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [competencies, setCompetencies] = useState<any[]>([]);
  const [fees, setFees] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { user, studentProfile, isAuthenticated, refreshStudentProfile } =
    useAuth();

  useEffect(() => {
    console.log("🔍 ProfileScreen: useEffect triggered");
    console.log("🔍 ProfileScreen: isAuthenticated:", isAuthenticated);
    console.log("🔍 ProfileScreen: user:", JSON.stringify(user, null, 2));

    if (isAuthenticated && user) {
      console.log(
        "✅ ProfileScreen: User is authenticated, loading profile data"
      );
      loadProfileData();
    } else {
      console.log(
        "❌ ProfileScreen: User not authenticated or user data missing"
      );
    }
  }, [isAuthenticated, user]);

  const loadProfileData = async () => {
    console.log("🔍 ProfileScreen: loadProfileData called");
    console.log("🔍 ProfileScreen: user data:", JSON.stringify(user, null, 2));

    if (!user?.id) {
      console.log("❌ ProfileScreen: No user ID available");
      return;
    }

    try {
      setIsLoading(true);

      // Create a comprehensive student profile
      let profile: StudentProfile = {
        id: user.id,
        firstName: user.firstName || "Not Provided",
        lastName: user.lastName || "Not Provided",
        email: user.email || "",
        studentNumber: user.studentNumber || user.id,
        course: "Culinary Arts", // Default course
        year: 1,
        status: "Active",
        phone: "",
        dateOfBirth: "",
        enrollmentDate: new Date().toISOString().split("T")[0],
      };

      // Try to load additional profile data from API
      try {
        console.log(
          "🔍 ProfileScreen: Calling getStudentProfile with ID:",
          user.id
        );
        const apiResponse = await StudentAPI.getStudentProfile(user.id);
        console.log(
          "✅ ProfileScreen: Profile loaded from API:",
          JSON.stringify(apiResponse, null, 2)
        );

        // Extract data from the nested API response structure
        if ((apiResponse as any)?.success && (apiResponse as any)?.data) {
          const studentData = (apiResponse as any).data.student;
          const guardianData = (apiResponse as any).data.guardians?.[0];

          // Override the profile with actual API data
          profile = {
            id: studentData.id || user.id,
            firstName:
              studentData.profile?.firstName || user?.firstName || "Student",
            lastName: studentData.profile?.lastName || user?.lastName || "",
            email: studentData.email || user?.email || "",
            studentNumber:
              studentData.admissionNumber || studentData.username || user.id,
            course: studentData.qualificationTitle || "Not enrolled",
            year: 1,
            enrollmentDate: studentData.profile?.admissionDate
              ? new Date(studentData.profile.admissionDate)
                  .toISOString()
                  .split("T")[0]
              : new Date().toISOString().split("T")[0],
            phone: studentData.profile?.mobileNumber || "",
            dateOfBirth: studentData.profile?.dateOfBirth
              ? new Date(studentData.profile.dateOfBirth)
                  .toISOString()
                  .split("T")[0]
              : "",
            avatarUrl: studentData.avatarUrl || null,
            campus: studentData.campusTitle || "",
            intakeGroup: studentData.intakeGroupTitle || "",
            intakeGroupId:
              studentData.intakeGroup || studentData.intakeGroupId || [],
            status: studentData.active ? "Active" : "Inactive",
            address: {
              street: studentData.profile?.address?.street1 || "",
              city: studentData.profile?.address?.city || "",
              state: studentData.profile?.address?.province || "",
              zipCode: studentData.profile?.address?.postalCode || "",
            },
            guardian: {
              name: guardianData
                ? `${guardianData.firstName} ${guardianData.lastName}`
                : "",
              relationship: guardianData?.relation || "",
              phone: guardianData?.mobileNumber || "",
              email: guardianData?.email || "",
            },
          };
        }
      } catch (error) {
        console.log(
          "⚠️ ProfileScreen: Profile API failed, using basic user data"
        );
        console.log("⚠️ ProfileScreen: Error:", error);
      }

      console.log(
        "🔧 ProfileScreen: Using centralized profile from AuthContext"
      );

      // Load additional data based on active tab
      await loadTabData();
    } catch (error) {
      console.error("❌ ProfileScreen: Error loading profile data:", error);
      Alert.alert("Error", "Failed to load profile data");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const loadTabData = async () => {
    if (!user?.id) return;

    try {
      // Load documents
      if (activeTab === "documents") {
        try {
          const docs = await StudentAPI.getStudentDocuments(user.id);
          setDocuments(docs);
        } catch (error) {
          console.log("Documents not available");
          setDocuments([]);
        }
      }

      // Load results and competencies
      if (activeTab === "results") {
        try {
          const [resultsData, competenciesData] = await Promise.all([
            StudentAPI.getStudentResults(user.id),
            StudentAPI.getStudentCompetencies(user.id),
          ]);
          setResults(resultsData);
          setCompetencies(competenciesData);
        } catch (error) {
          console.log("Results/competencies not available");
          setResults([]);
          setCompetencies([]);
        }
      }

      // Load finance data (removed for now)
      /*
      if (activeTab === "finance") {
        try {
          setFees([]);
          setTransactions([]);
        } catch (error) {
          console.log("Finance data not available");
          setFees([]);
          setTransactions([]);
        }
      }
      */
    } catch (error) {
      console.log("Error loading tab data:", error);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadProfileData();
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    loadTabData(); // Reload data when switching tabs
  };

  const renderStudentHeader = () => {
    if (!studentProfile) return null;

    console.log(
      "🔍 ProfileScreen: renderStudentHeader - studentProfile:",
      JSON.stringify(studentProfile, null, 2)
    );

    // Handle the nested data structure from API
    const student = studentProfile.student || studentProfile;
    const profile = student.profile || student;

    const firstName = profile.firstName || student.firstName || "";
    const lastName = profile.lastName || student.lastName || "";
    const fullName = `${firstName} ${lastName}`.trim();
    const initials =
      `${firstName.charAt(0) || ""}${lastName.charAt(0) || ""}`.toUpperCase() ||
      "ST";

    return (
      <Card style={styles.headerCard}>
        <Card.Content>
          <View style={styles.profileImageContainer}>
            {student.avatarUrl ? (
              <Image
                source={{ uri: student.avatarUrl }}
                style={styles.profileImage}
              />
            ) : (
              <Avatar.Text
                size={80}
                label={initials}
                style={styles.avatarPlaceholder}
              />
            )}
          </View>

          <View style={styles.headerInfo}>
            <Text style={styles.studentName}>{fullName || "Student"}</Text>
            <Text style={styles.studentNumber}>
              {student.admissionNumber ||
                student.studentNumber ||
                student.username ||
                "No ID"}
            </Text>

            <View style={styles.statusContainer}>
              <Chip
                mode="outlined"
                icon="school"
                style={styles.courseChip}
                compact
              >
                {student.intakeGroupTitle || "No Intake Group"}
              </Chip>
              {student.campusTitle && (
                <Chip
                  mode="outlined"
                  icon="map-marker"
                  style={styles.statusChip}
                  compact
                >
                  {student.campusTitle}
                </Chip>
              )}
            </View>

            {student.qualificationTitle && (
              <Text style={styles.intakeGroup}>
                {student.qualificationTitle}
              </Text>
            )}
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderStudentInfo = () => {
    if (!studentProfile) return null;

    // Handle the nested data structure from API
    const student = studentProfile.student || studentProfile;
    const profile = student.profile || student;

    return (
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Student Information</Title>
          <Divider style={styles.divider} />

          <View style={styles.infoGrid}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Full Name:</Text>
              <Text style={styles.value}>
                {(profile.firstName || "") + " " + (profile.lastName || "")}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Username:</Text>
              <Text style={styles.value}>
                {student.admissionNumber || student.username}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>
                {student.email || "Not provided"}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Phone:</Text>
              <Text style={styles.value}>
                {profile.mobileNumber || "Not provided"}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Date of Birth:</Text>
              <Text style={styles.value}>
                {profile.dateOfBirth
                  ? new Date(profile.dateOfBirth).toLocaleDateString()
                  : "Not provided"}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Qualification:</Text>
              <Text style={styles.value}>
                {student.qualificationTitle || "Not enrolled"}
              </Text>
            </View>
            {student.campusTitle && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Campus:</Text>
                <Text style={styles.value}>{student.campusTitle}</Text>
              </View>
            )}
            <View style={styles.infoRow}>
              <Text style={styles.label}>Admission Date:</Text>
              <Text style={styles.value}>
                {profile.admissionDate
                  ? new Date(profile.admissionDate).toLocaleDateString()
                  : "Not provided"}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderAddressInfo = () => {
    if (!studentProfile) return null;

    // Handle the nested data structure from API
    const student = studentProfile.student || studentProfile;
    const profile = student.profile || student;
    const address = profile.address || {};

    return (
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Address Information</Title>
          <Divider style={styles.divider} />

          <View style={styles.infoGrid}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Street:</Text>
              <Text style={styles.value}>
                {address.street1 || "Not provided"}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>City:</Text>
              <Text style={styles.value}>{address.city || "Not provided"}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Province:</Text>
              <Text style={styles.value}>
                {address.province || "Not provided"}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Postal Code:</Text>
              <Text style={styles.value}>
                {address.postalCode || "Not provided"}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderGuardianInfo = () => {
    if (!studentProfile) return null;

    // Handle the nested data structure from API
    const guardians = studentProfile.guardians || [];
    const guardian = guardians[0]; // Get first guardian if available

    if (!guardian) return null;

    return (
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Guardian Information</Title>
          <Divider style={styles.divider} />

          <View style={styles.infoGrid}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Name:</Text>
              <Text style={styles.value}>
                {`${guardian.firstName || ""} ${
                  guardian.lastName || ""
                }`.trim() || "Not provided"}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Relationship:</Text>
              <Text style={styles.value}>
                {guardian.relation || "Not provided"}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Phone:</Text>
              <Text style={styles.value}>
                {guardian.mobileNumber || "Not provided"}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>
                {guardian.email || "Not provided"}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderTabContent = () => {
    console.log(
      "🔍 ProfileScreen: renderTabContent called for tab:",
      activeTab
    );

    if (isLoading && !studentProfile) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      );
    }

    switch (activeTab) {
      case "overview":
        return (
          <View>
            {renderStudentInfo()}
            {renderAddressInfo()}
            {renderGuardianInfo()}
          </View>
        );

      case "documents":
        return (
          <Card style={styles.sectionCard}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Documents</Title>
              <Divider style={styles.divider} />
              {documents.length > 0 ? (
                documents.map((doc, index) => (
                  <View key={index} style={styles.documentItem}>
                    <Ionicons name="document-text" size={24} color="#014b01" />
                    <Text style={styles.documentTitle}>
                      {doc.title || doc.name || `Document ${index + 1}`}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No documents available</Text>
              )}
            </Card.Content>
          </Card>
        );

      case "results":
        return (
          <View>
            <Card style={styles.sectionCard}>
              <Card.Content>
                <Title style={styles.sectionTitle}>Academic Results</Title>
                <Divider style={styles.divider} />
                {results.length > 0 ? (
                  results.map((result, index) => (
                    <View key={index} style={styles.resultItem}>
                      <Text style={styles.resultSubject}>
                        {result.subject || `Subject ${index + 1}`}
                      </Text>
                      <Text style={styles.resultGrade}>
                        {result.result || result.grade || "Pending"}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyText}>No results available</Text>
                )}
              </Card.Content>
            </Card>

            <Card style={styles.sectionCard}>
              <Card.Content>
                <Title style={styles.sectionTitle}>Competencies</Title>
                <Divider style={styles.divider} />
                {competencies.length > 0 ? (
                  competencies.map((comp, index) => (
                    <View key={index} style={styles.competencyItem}>
                      <Text style={styles.competencyTitle}>
                        {comp.competencyTitle ||
                          comp.title ||
                          `Competency ${index + 1}`}
                      </Text>
                      <Chip
                        mode="outlined"
                        style={[
                          styles.competencyChip,
                          comp.status === "achieved" && styles.achievedStatus,
                        ]}
                      >
                        {comp.status || "In Progress"}
                      </Chip>
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyText}>No competencies recorded</Text>
                )}
              </Card.Content>
            </Card>
          </View>
        );

      default:
        return null;
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <View style={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            <Title>Please log in to view your profile</Title>
          </Card.Content>
        </Card>
      </View>
    );
  }

  return (
    <View style={styles.screenContainer}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        {renderStudentHeader()}

        {/* Profile Content */}
        {renderStudentInfo()}
        {renderAddressInfo()}
        {renderGuardianInfo()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 5,
    backgroundColor: "#f5f5f5",
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: "#014b01",
    fontWeight: "500",
  },
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
    paddingTop: 48,
  },
  // Header styles
  profileImageContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    backgroundColor: "#D1ffbd",
  },
  headerInfo: {
    alignItems: "center",
    paddingHorizontal: 16,
  },
  studentName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
    textAlign: "center",
  },
  studentNumber: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
    textAlign: "center",
  },
  statusContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  courseChip: {
    marginHorizontal: 2,
  },
  statusChip: {
    marginHorizontal: 2,
  },
  intakeGroup: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
    fontStyle: "italic",
    paddingHorizontal: 16,
    lineHeight: 16,
  },

  // Card styles
  sectionCard: {
    marginBottom: 16,
    elevation: 4,
  },
  divider: {
    marginVertical: 12,
  },
  infoGrid: {
    paddingTop: 8,
  },
  headerCard: {
    marginBottom: 16,
    elevation: 4,
  },
  headerContent: {
    alignItems: "center",
    paddingVertical: 20,
  },
  headerText: {
    alignItems: "center",
    marginTop: 12,
  },
  avatar: {
    backgroundColor: "#D1ffbd",
  },
  card: {
    marginBottom: 16,
    elevation: 4,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 8,
    paddingVertical: 4,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },

  // Tab styles
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
    backgroundColor: "#014b01",
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

  // Loading styles
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
  },

  // Document styles
  documentItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  documentTitle: {
    marginLeft: 12,
    fontSize: 16,
    color: "#333",
  },

  // Result styles
  resultItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  resultSubject: {
    flex: 1,
    fontWeight: "500",
  },
  resultGrade: {
    fontWeight: "bold",
    color: "#014b01",
  },

  // Competency styles
  competencyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  competencyTitle: {
    flex: 1,
    fontWeight: "500",
  },
  competencyChip: {
    backgroundColor: "#ff9800",
  },
  competencyStatus: {
    fontWeight: "bold",
    color: "#ff9800",
  },
  achievedStatus: {
    backgroundColor: "#4caf50",
  },

  // Finance styles
  feeItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  feeInfo: {
    flex: 1,
  },
  feeDescription: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  feeDueDate: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  feeAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#f44336",
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  transactionDate: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "bold",
  },
  creditAmount: {
    color: "#4caf50",
  },
  debitAmount: {
    color: "#f44336",
  },

  // Empty state
  emptyText: {
    textAlign: "center",
    color: "#666",
    fontStyle: "italic",
    paddingVertical: 20,
  },
});
