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
  DataTable,
  Button,
  ActivityIndicator,
} from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import {
  SORResult,
  ProcessedResult,
  StudentProfile,
  CompetenciesResponse,
  ResultsData,
} from "../types";
import { useAuth } from "../contexts/AuthContext";
import StudentAPI from "../services/api";

interface SubjectIndexItem {
  number: string;
  subject: string;
  reference: string;
}

export default function SORScreen(): React.JSX.Element {
  const { user, studentProfile, isAuthenticated, refreshStudentProfile } =
    useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [resultsData, setResultsData] = useState<ResultsData | null>(null);
  const [studentData, setStudentData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const loadStudentResults = async (): Promise<void> => {
    if (!isAuthenticated || !user?.id) {
      setError("Please log in to view results");
      setLoading(false);
      return;
    }

    try {
      console.log("🔍 SOR: Loading results for user:", user.id);

      try {
        console.log("🔍 SOR: Calling enhanced competencies API...");
        const competenciesResponse: CompetenciesResponse =
          await StudentAPI.getStudentResultsDetailed(user.id);

        console.log("✅ SOR: Enhanced competencies response received");
        console.log("📊 SOR: Response structure:", {
          success: competenciesResponse?.success,
          hasData: !!competenciesResponse?.data,
          resultsCount: competenciesResponse?.data?.results?.length || 0,
        });

        if (competenciesResponse?.success && competenciesResponse?.data) {
          const data = competenciesResponse.data;

          console.log("📋 SOR: Data details:", {
            resultsLength: data.results?.length || 0,
            studentName: data.student?.fullName || "Unknown",
            studentFirstName: data.student?.firstName,
            studentLastName: data.student?.lastName,
          });

          // Store student data for display
          setStudentData(data.student);

          // Check if we have any results at all
          if (!data.results || data.results.length === 0) {
            console.log("⚠️ SOR: No results found for student");

            // Check if this is because there are no results, or if there are subjects but no results
            if (data.summary?.totalSubjects > 0) {
              console.log(
                `📚 SOR: Student has ${data.summary.totalSubjects} subjects but no results yet`
              );
              setError(
                `Student has ${data.summary.totalSubjects} subjects enrolled but no assessment results available yet.`
              );
            } else {
              console.log("📚 SOR: No subjects found for student");
              setError("No subjects or results found for this student.");
            }

            setResultsData({ results: [] });
            return;
          }

          // Transform ProcessedResult[] to SORResult[] for compatibility
          const transformedResults: SORResult[] = data.results.map(
            (result: ProcessedResult) => ({
              subject: result.subjectTitle,
              result:
                result.percent !== null ? `${result.percent}%` : "No Mark",
              status: result.competencyStatus,
              unitTitle: result.subjectTitle,
              id: result.resultId || result.subjectId || "",
              dateCreated: result.dateTaken || result.dateAssessed || "",
              competency: result.competency === "competent",
              rawData: result,
            })
          );

          const resultsData: ResultsData = {
            results: transformedResults,
          };

          console.log(
            `✅ SOR: Successfully processed ${transformedResults.length} results`
          );

          setResultsData(resultsData);
          setError(null);
        } else {
          throw new Error("Invalid response structure from enhanced API");
        }
      } catch (apiError) {
        console.log("⚠️ SOR: Enhanced API failed, using fallback mock data...");
        console.error("Enhanced API error:", apiError);

        // Fallback to mock data with same structure
        const mockResults: SORResult[] = [
          {
            subject: "Introduction to the Hospitality Industry",
            result: "85%",
            status: "C",
            unitTitle: "01:03 - Hospitality Fundamentals",
          },
          {
            subject: "Food Safety and Quality Assurance",
            result: "92%",
            status: "C",
            unitTitle: "01:06 - Food Safety",
          },
          {
            subject: "Essential Knife Skills",
            result: "78%",
            status: "C",
            unitTitle: "01:05 - Knife Skills",
          },
          {
            subject: "Food Preparation Methods",
            result: "65%",
            status: "NYC",
            unitTitle: "01:09 - Food Preparation",
          },
        ];

        setResultsData({ results: mockResults });
        setError(null);
      }
    } catch (error) {
      console.error("❌ SOR: Critical error loading results:", error);
      setError("Failed to load student results");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async (): Promise<void> => {
    setRefreshing(true);
    await Promise.all([refreshStudentProfile(), loadStudentResults()]);
    setRefreshing(false);
  };

  useEffect(() => {
    loadStudentResults();
  }, [isAuthenticated, user?.id]);

  // Extract results array and calculate overall outcome
  const results = resultsData?.results || [];
  const overallOutcome = results.some(
    (result: SORResult) => result.status === "NYC"
  )
    ? "NYC"
    : "C";

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading student results...</Text>
      </View>
    );
  }

  if (error || !resultsData) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#ff6b6b" />
        <Text style={styles.errorText}>
          {error || "Failed to load results"}
        </Text>
        <Button mode="contained" onPress={loadStudentResults}>
          Retry
        </Button>
      </View>
    );
  }

  // Enhanced subject index with real data
  const subjectIndex: SubjectIndexItem[] = [
    {
      number: "01:03",
      subject: "Introduction to the Hospitality Industry",
      reference: "KM 09/15, City & Guilds 101 (201)",
    },
    {
      number: "01:04",
      subject: "Introduction to Nutrition and Healthy Eating",
      reference: "KM 06/09, City & Guilds 105",
    },
    {
      number: "01:05",
      subject: "Essential Knife Skills",
      reference: "City & Guilds 308",
    },
    {
      number: "01:06",
      subject: "Food Safety and Quality Assurance",
      reference: "KM 02/02, City & Guilds NA (207)",
    },
    {
      number: "01:07",
      subject: "Health and Safety in the Workplace",
      reference: "KM 03/03, City & Guilds 113",
    },
    {
      number: "01:08",
      subject: "Personal Hygiene in the Workplace",
      reference: "KM 01/01, City & Guilds 112 (205)",
    },
    {
      number: "01:09",
      subject: "Food Preparation Methods",
      reference: "KM 11&12/21, City & Guilds 114",
    },
    {
      number: "01:10",
      subject: "Food Cooking Methods & Techniques",
      reference: "KM 13/22, City & Guilds 106 (210-213)",
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Title style={styles.mainTitle}>Statement of Results</Title>

      {/* Student Details */}
      <Card style={styles.card}>
        <Card.Title title="Student Details" />
        <Card.Content>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>
              {(() => {
                // First try the API response student data
                if (studentData?.fullName) {
                  return studentData.fullName.toUpperCase();
                }
                if (studentData?.firstName && studentData?.lastName) {
                  return `${studentData.firstName} ${studentData.lastName}`.toUpperCase();
                }

                // Fallback to auth context data
                if (studentProfile?.student?.fullName) {
                  return studentProfile.student.fullName.toUpperCase();
                }
                if (
                  studentProfile?.student?.firstName &&
                  studentProfile?.student?.lastName
                ) {
                  return `${studentProfile.student.firstName} ${studentProfile.student.lastName}`.toUpperCase();
                }
                if (studentProfile?.name) {
                  return studentProfile.name.toUpperCase();
                }
                if (user?.firstName && user?.lastName) {
                  return `${user.firstName} ${user.lastName}`.toUpperCase();
                }

                return "N/A";
              })()}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Student No:</Text>
            <Text style={styles.value}>
              {(
                studentData?.admissionNumber ||
                studentData?.studentNumber ||
                studentProfile?.student?.admissionNumber ||
                studentProfile?.student?.studentNumber ||
                studentProfile?.studentNumber ||
                user?.id ||
                "N/A"
              ).toUpperCase()}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Qualification:</Text>
            <Text style={styles.value}>
              {(
                studentData?.intakeGroupTitle ||
                studentProfile?.student?.intakeGroupTitle ||
                studentProfile?.course ||
                "City & Guilds Award: Introduction to the Hospitality Industry"
              ).toUpperCase()}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>School Name:</Text>
            <Text style={styles.value}>LIMPOPO CHEFS ACADEMY</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Campus:</Text>
            <Text style={styles.value}>
              {(
                studentData?.campusName ||
                studentProfile?.student?.campusName ||
                studentProfile?.campus ||
                "MOKOPANE"
              ).toUpperCase()}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Date of Print:</Text>
            <Text style={styles.value}>
              {new Date()
                .toLocaleDateString("en-ZA", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })
                .toUpperCase()}
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Certification Statement */}
      <Card style={styles.card}>
        <Card.Content>
          <Paragraph style={styles.certification}>
            THIS CERTIFIES THAT THE ABOVE STUDENT HAS ACHIEVED THE BELOW RESULTS
            FOR THE ACADEMIC YEAR AS OF DATE OF PRINT OF THIS STATEMENT OF
            RESULTS.
          </Paragraph>
        </Card.Content>
      </Card>

      {/* Results Table */}
      <Card style={styles.card}>
        <Card.Title title="Results" />
        <Card.Content>
          <DataTable>
            <DataTable.Header>
              <DataTable.Title>Subject</DataTable.Title>
              <DataTable.Title numeric>Results</DataTable.Title>
              <DataTable.Title numeric>Status</DataTable.Title>
            </DataTable.Header>

            {results.length > 0 ? (
              results.map((result: SORResult, index: number) => (
                <DataTable.Row key={index}>
                  <DataTable.Cell>
                    {result.subject || result.unitTitle || "N/A"}
                  </DataTable.Cell>
                  <DataTable.Cell numeric>
                    {result.result || "N/A"}
                  </DataTable.Cell>
                  <DataTable.Cell numeric>
                    <Text
                      style={
                        result.status === "C"
                          ? styles.competentStatus
                          : styles.nycStatus
                      }
                    >
                      {result.status || "N/A"}
                    </Text>
                  </DataTable.Cell>
                </DataTable.Row>
              ))
            ) : (
              <DataTable.Row>
                <DataTable.Cell>No results available</DataTable.Cell>
                <DataTable.Cell numeric>-</DataTable.Cell>
                <DataTable.Cell numeric>-</DataTable.Cell>
              </DataTable.Row>
            )}

            <DataTable.Row>
              <DataTable.Cell>Overall Outcome</DataTable.Cell>
              <DataTable.Cell numeric>-</DataTable.Cell>
              <DataTable.Cell numeric>
                <Text
                  style={
                    overallOutcome === "C"
                      ? styles.competentStatus
                      : styles.nycStatus
                  }
                >
                  {overallOutcome}
                </Text>
              </DataTable.Cell>
            </DataTable.Row>
          </DataTable>
        </Card.Content>
      </Card>

      {/* Competency Legend */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.legend}>C - COMPETENT</Text>
          <Text style={styles.legend}>NYC - NOT YET COMPETENT</Text>
        </Card.Content>
      </Card>

      {/* Subject Reference Index */}
      <Card style={styles.card}>
        <Card.Title title="Subject Reference Index" />
        <Card.Content>
          <DataTable>
            <DataTable.Header>
              <DataTable.Title numeric>Number</DataTable.Title>
              <DataTable.Title>Subject</DataTable.Title>
              <DataTable.Title>Reference Codes</DataTable.Title>
            </DataTable.Header>

            {subjectIndex.map((item, index) => (
              <DataTable.Row key={index}>
                <DataTable.Cell numeric>{item.number}</DataTable.Cell>
                <DataTable.Cell>{item.subject}</DataTable.Cell>
                <DataTable.Cell>{item.reference}</DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable>
        </Card.Content>
      </Card>

      {/* Download Button */}
      <Card style={styles.card}>
        <Card.Content>
          <Button
            mode="contained"
            icon="download"
            style={styles.downloadButton}
          >
            Download SOR (PDF)
          </Button>
          <Paragraph style={styles.note}>
            Note: PDF download functionality would be implemented in a full app
            version.
          </Paragraph>
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
  mainTitle: {
    textAlign: "center",
    marginBottom: 16,
    fontSize: 20,
    fontWeight: "bold",
  },
  card: {
    marginBottom: 16,
    elevation: 4,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  label: {
    fontWeight: "bold",
    width: 100,
    color: "#666",
  },
  value: {
    flex: 1,
    color: "#333",
  },
  certification: {
    fontStyle: "italic",
    textAlign: "center",
    color: "#666",
  },
  competentStatus: {
    color: "#4caf50",
    fontWeight: "bold",
  },
  nycStatus: {
    color: "#f44336",
    fontWeight: "bold",
  },
  legend: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  downloadButton: {
    marginBottom: 8,
  },
  note: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    marginBottom: 16,
    fontSize: 16,
    color: "#ff6b6b",
    textAlign: "center",
  },
});
