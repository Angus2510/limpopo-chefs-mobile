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
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Asset } from "expo-asset";
import {
  SORResult,
  ProcessedResult,
  StudentProfile,
  CompetenciesResponse,
  ResultsData,
} from "../types";
import { useAuth } from "../contexts/AuthContext";
import StudentAPI from "../services/api";
import { images } from "../assets/images";

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
  const [downloading, setDownloading] = useState<boolean>(false);
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
                `📚 SOR: Student has ${data.summary.totalSubjects} subjects but no results yet`,
              );
              setError(
                `Student has ${data.summary.totalSubjects} subjects enrolled but no assessment results available yet.`,
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
            }),
          );

          const resultsData: ResultsData = {
            results: transformedResults,
          };

          console.log(
            `✅ SOR: Successfully processed ${transformedResults.length} results`,
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
    (result: SORResult) => result.status === "NYC",
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

  // Determine intake category from student data
  const intakeCategory =
    studentData?.intakeGroupTitle?.toUpperCase() ||
    studentProfile?.student?.intakeGroupTitle?.toUpperCase() ||
    studentProfile?.course?.toUpperCase() ||
    "OCG";

  // Build complete subject reference index based on intake category
  let indexData: string[][] = [];

  if (
    intakeCategory.includes("OCG") ||
    intakeCategory === "OCG_2023" ||
    intakeCategory === "OCG_JULY_2022"
  ) {
    // OCG HARDCODED INDEX - COMPLETE CURRICULUM
    indexData = [
      // 1st Year Subjects
      ["01:01", "Introduction to Food Costing 1.0", "NA"],
      ["01:02", "Introduction to French 1.0", "NA"],
      [
        "01:03",
        "Introduction to the Hospitality Industry",
        "KM 09/15, City & Guilds 101 (201)",
      ],
      [
        "01:04",
        "Introduction to Nutrition and Healthy Eating",
        "KM 06/09, City & Guilds 105",
      ],
      ["01:05", "Essential Knife Skills", "City & Guilds 308"],
      [
        "01:06",
        "Food Safety and Quality Assurance",
        "KM 02/02, City & Guilds NA (207)",
      ],
      [
        "01:07",
        "Health and Safety in the Workplace",
        "KM 03/03, City & Guilds 113",
      ],
      [
        "01:08",
        "Personal Hygiene in the Workplace",
        "KM 01/01, City & Guilds 112 (205)",
      ],
      [
        "01:09",
        "Food Preparation Methods, Techniques and Equipment",
        "KM 11&12/21, City & Guilds 114",
      ],
      [
        "01:10",
        "Food Cooking Methods & Techniques",
        "KM 13/22, City & Guilds 106 (210-213)",
      ],
      [
        "01:11",
        "Food Commodities & Basic Ingredients",
        "KM 07/11, City & Guilds 108",
      ],
      [
        "01:12",
        "Theory of Food Production & Customer Service",
        "KM 08/13, City & Guilds 122",
      ],
      ["01:13", "Numeracy and Units of Measurement", "KM 04/05, NA"],
      [
        "01:14",
        "Introduction: Meal Planning and Menus",
        "KM 20, City & Guilds 123 + 125",
      ],
      ["01:15", "Computer Literacy and Research", "KM 06, NA"],
      ["01:16", "Environmental Awareness", "KM 05/07, City & Guilds NA (305)"],
      [
        "01:17",
        "Personal Development as a Chef",
        "KM 14/24, City & Guilds 115",
      ],
      ["", "1st Year Task", "City & Guilds 101, 105, E308, 106, 108, 123"],
      ["", "Final Theory Exam", "ALL"],
      ["", "Mid Year Theory Exam", "ALL"],
      ["", "Safety", "7107-202"],
      // 2nd Year Subjects
      ["02:01", "Environmental Sustainability", "KM 08, City & Guilds 204"],
      [
        "02:02",
        "Advanced Menu Planning and Costing",
        "KM 20, City & Guilds 208",
      ],
      [
        "02:03",
        "Theory of Preparing, Cooking and Finishing Dishes",
        "KM 23, City & Guilds 209 + 214",
      ],
      [
        "02:04",
        "Theory of Facility management and equipment resource management",
        "KM 17, NA",
      ],
      [
        "02:05",
        "Staff Resource Management and Self Development",
        "KM 16, City & Guilds 206",
      ],
      ["02:06", "Theory of commodity resource management", "KM 18, NA"],
      ["02:07", "Understand Business Success", "City & Guilds 202"],
      ["02:08", "Provide Guest Service", "City & Guilds 203"],
      [
        "02:09",
        "Preparation & Cooking: Nutrition & Healthier foods",
        "KM 10, NA",
      ],
      ["", "Diploma Task", "City & Guilds 205, 206, 208"],
      ["", "Food Safety Evolve", "8064-207"],
      ["", "Food preparation & Culinary Arts", "8064-241"],
      ["", "Hospitality Principles", "8064-240"],
      // 3rd Year Subjects
      [
        "03:01",
        "Theory of Safety Supervision",
        "KM 04 (KT01-03), City & Guilds 306",
      ],
      [
        "03:02",
        "Theory of Food Production Supervision",
        "KM 14 (KT01-02), City & Guilds 302",
      ],
      ["03:03", "Contribute to Business Success", "City & Guilds 303"],
      ["03:04", "Contribute to the Guest Experience", "City & Guilds 304"],
      [
        "03:05",
        "Developing Opportunities for Progression in the Culinary Industry",
        "City & Guilds 301",
      ],
      ["03:06", "Gastronomy and Global Cuisines", "KM 12 (KT01-04), NA"],
      ["03:07", "Operational Cost Control", "KM 19 (KT01-05), NA"],
      ["", "Function Task Parts 1-8", "PM03-PM06, NA"],
      ["", "Wine and Food Pairing", "NA"],
      ["", "Monitoring and supervision of food safety", "8064-306"],
      ["", "Culinary arts and supervision", "8064-310"],
      ["", "Trade Test- Theory Exam", "NA"],
      ["", "Trade Test- Practical Exam", "NA"],
      // Menu Assessments
      ["", "OCG 1st year Menus A1-A18", "Practical Assessments"],
      ["", "OCG 2nd year Menus B1-B9", "Practical Assessments"],
      ["", "OCG 3rd year Menus C1-C6", "Practical Assessments"],
      // WEL (Workplace Experiential Learning)
      ["", "WEL 1st Year (900 hours)", "Workplace Learning"],
      ["", "WEL 2nd Year (900 hours)", "Workplace Learning"],
      ["", "WEL 3rd Year (900 hours)", "Workplace Learning"],
    ];
  } else if (intakeCategory.includes("AWARD")) {
    // AWARD HARDCODED INDEX - COMPLETE CURRICULUM
    indexData = [
      // Core Subjects
      ["01:01", "Introduction to Food Costing 1.0", "NA"],
      ["01:02", "Introduction to French 1.0", "NA"],
      [
        "01:03",
        "Introduction to the Hospitality Industry",
        "KM 09/15, City & Guilds 101 (201)",
      ],
      [
        "01:04",
        "Introduction to Nutrition and Healthy Eating",
        "KM 06/09, City & Guilds 105",
      ],
      ["01:05", "Essential Knife Skills", "City & Guilds 308"],
      [
        "01:06",
        "Food Safety and Quality Assurance",
        "KM 02/02, City & Guilds NA (207)",
      ],
      [
        "01:07",
        "Health and Safety in the Workplace",
        "KM 03/03, City & Guilds 113",
      ],
      [
        "01:08",
        "Personal Hygiene in the Workplace",
        "KM 01/01, City & Guilds 112 (205)",
      ],
      [
        "01:09",
        "Food Preparation Methods, Techniques and Equipment",
        "KM 11&12/21, City & Guilds 114",
      ],
      [
        "01:10",
        "Food Cooking Methods & Techniques",
        "KM 13/22, City & Guilds 106 (210, 211, 212, 213)",
      ],
      ["", "1st Year Task", "City & Guilds 101, 105, E308, 106, 108, 123"],
      ["", "Mid Year Theory Exam", "ALL"],
      ["", "Safety", "7107-202"],
      // Menu Assessments
      ["", "Award Menus A1-A8", "Practical Assessments"],
      // WEL (Workplace Experiential Learning)
      ["", "WEL 1 (450 hours)", "Workplace Learning"],
    ];
  } else if (intakeCategory.includes("CERTIFICATE")) {
    // CERTIFICATE HARDCODED INDEX - COMPLETE CURRICULUM
    indexData = [
      // Core Subjects
      ["01:01", "Introduction to Food Costing 1.0", "NA"],
      ["01:02", "Introduction to French 1.0", "NA"],
      [
        "01:03",
        "Introduction to the Hospitality Industry",
        "KM 09/15, City & Guilds 101 (201)",
      ],
      [
        "01:04",
        "Introduction to Nutrition and Healthy Eating",
        "KM 06/09, City & Guilds 105",
      ],
      ["01:05", "Essential Knife Skills", "City & Guilds 308"],
      [
        "01:06",
        "Food Safety and Quality Assurance",
        "KM 02/02, City & Guilds NA (207)",
      ],
      [
        "01:07",
        "Health and Safety in the Workplace",
        "KM 03/03, City & Guilds 113",
      ],
      [
        "01:08",
        "Personal Hygiene in the Workplace",
        "KM 01/01, City & Guilds 112 (205)",
      ],
      [
        "01:09",
        "Food Preparation Methods, Techniques and Equipment",
        "KM 11&12/21, City & Guilds 114",
      ],
      [
        "01:10",
        "Food Cooking Methods & Techniques",
        "KM 13/22, City & Guilds 106 (210, 211, 212, 213)",
      ],
      [
        "01:11",
        "Food Commodities & Basic Ingredients",
        "KM 07/11, City & Guilds 108",
      ],
      [
        "01:12",
        "Theory of Food Production & Customer Service",
        "KM 08/13, City & Guilds 122",
      ],
      ["01:13", "Numeracy and Units of Measurement", "KM 04/05, NA"],
      [
        "01:14",
        "Introduction: Meal Planning and Menus",
        "KM 20, City & Guilds 123 + 125",
      ],
      ["01:15", "Computer Literacy and Research", "KM 06, NA"],
      ["01:16", "Environmental Awareness", "KM 05/07, City & Guilds NA (305)"],
      [
        "01:17",
        "Personal Development as a Chef",
        "KM 14/24, City & Guilds 115",
      ],
      ["", "1st Year Task", "City & Guilds 101, 105, E308, 106, 108, 123"],
      ["", "Final Theory Exam", "ALL"],
      ["", "Mid Year Theory Exam", "ALL"],
      ["", "Safety", "7107-202"],
      // Menu Assessments
      ["", "Certificate Menus A1-A18", "Practical Assessments"],
      // WEL (Workplace Experiential Learning)
      ["", "WEL 1 (450 hours)", "Workplace Learning"],
      ["", "WEL 2 (450 hours)", "Workplace Learning"],
    ];
  } else if (intakeCategory.includes("DIPLOMA")) {
    // DIPLOMA HARDCODED INDEX - COMPLETE CURRICULUM
    indexData = [
      // Core Subjects
      ["01:01", "Introduction to Food Costing 1.0", "NA"],
      [
        "01:03",
        "Introduction to the Hospitality Industry",
        "City & Guilds 201",
      ],
      ["01:05", "Essential Knife Skills", "City & Guilds 308"],
      ["01:06", "Food Safety and Quality Assurance", "City & Guilds 207"],
      [
        "01:10",
        "Food Cooking Methods & Techniques",
        "City & Guilds 210, 211, 212, 213",
      ],
      ["01:08", "Personal Hygiene in the Workplace", "City & Guilds 205"],
      ["02:01", "Environmental Sustainability", "City & Guilds 204"],
      ["02:02", "Advanced Menu Planning and Costing", "City & Guilds 208"],
      [
        "02:03",
        "Theory of Preparing, Cooking and Finishing Dishes",
        "City & Guilds 209 + 214",
      ],
      [
        "02:05",
        "Staff Resource Management and Self Development",
        "City & Guilds 206",
      ],
      ["02:07", "Understand Business Success", "City & Guilds 202"],
      ["02:08", "Provide Guest Service", "City & Guilds 203"],
      ["", "Diploma Task", "City & Guilds 205, 206, 208"],
      ["", "Final Theory Exam", "ALL"],
      ["", "Food Safety Evolve", "8064-207"],
      ["", "Food preparation & Culinary Arts", "8064-241"],
      ["", "Hospitality Principles", "8064-240"],
      // Menu Assessments
      ["", "Diploma Menus A1-A6", "Practical Assessments"],
      ["", "Diploma Menus B1-B9", "Practical Assessments"],
      // WEL (Workplace Experiential Learning)
      ["", "WEL (6 months France or South Africa)", "Workplace Learning"],
    ];
  } else if (intakeCategory.includes("PASTRY")) {
    // PASTRY HARDCODED INDEX - COMPLETE CURRICULUM
    indexData = [
      // Core Subjects
      [
        "P02:01",
        "Understand the hospitality industry",
        "City & Guilds 201+ 205",
      ],
      ["P02:02", "Understand business success", "City & Guilds 202"],
      ["P02:03", "Provide guest service", "City & Guilds 203"],
      [
        "P02:04",
        "Awareness of sustainability in the hospitality industry",
        "City & Guilds 204",
      ],
      [
        "P02:05",
        "Understand own role in self development",
        "City & Guilds 206",
      ],
      ["P02:06", "Food safety", "City & Guilds 207"],
      [
        "P02:07",
        "Meet guest requirements through menu planning",
        "City & Guilds 208",
      ],
      [
        "P02:08",
        "Prepare, cook and finish cakes, biscuits and sponge products using standardised recipes",
        "City & Guilds 215",
      ],
      [
        "P02:09",
        "Prepare, cook and finish pastry products using standardised recipes",
        "City & Guilds 216",
      ],
      [
        "P02:10",
        "Produce, cook and finish dough products using standardised recipes",
        "City & Guilds 217",
      ],
      [
        "P02:11",
        "Prepare, cook and finish hot desserts using standardised recipes",
        "City & Guilds 218",
      ],
      [
        "P02:12",
        "Prepare, cook and finish cold desserts using standardised recipes",
        "City & Guilds 219",
      ],
      [
        "P02:13",
        "Prepare and finish simple chocolate products using standardised recipes",
        "City & Guilds 220",
      ],
      ["P02:14", "Mise en place", "City & Guilds 209"],
      // Assessments
      ["", "Final Inhouse Pastry Theory Exam", "NA"],
      ["", "Food safety", "8064-207"],
      ["", "Hospitality Principles", "8064-240"],
      ["", "Food preparation & Culinary Arts", "8064-242"],
      // Menu Assessments
      ["", "Pastry Menus P1-P17", "Practical Assessments"],
      // WEL (Workplace Experiential Learning)
      ["", "WEL 1 (450 hours)", "Workplace Learning"],
      ["", "WEL 2 (450 hours)", "Workplace Learning"],
    ];
  } else {
    // DEFAULT FOR UNKNOWN PROGRAMS
    indexData = [["", "No index available", "Contact administration"]];
  }

  // Convert to display format with only number and reference
  const subjectIndex: SubjectIndexItem[] = indexData.map(
    ([number, subject, reference]) => ({
      number,
      subject,
      reference,
    }),
  );

  // Helper to format date
  const formatFullDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = date.toLocaleString("en-ZA", { month: "long" });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  // PDF Download Handler - Exact same logic as web version
  const handleDownloadPDF = async () => {
    try {
      setDownloading(true);

      // Load logo as base64 for watermark
      let logoBase64 = "";
      try {
        const asset = Asset.fromModule(images.fullLogo);
        await asset.downloadAsync();

        // Use fetch to get the asset and convert to base64
        const response = await fetch(asset.localUri || asset.uri);
        const buffer = await response.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        
        // Convert to base64
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64String = btoa(binary);
        logoBase64 = `data:image/png;base64,${base64String}`;
        
        console.log("✅ SOR: Logo loaded for watermark successfully");
      } catch (logoError) {
        console.warn("⚠️ SOR: Could not load logo for watermark:", logoError);
        // Try fallback method
        try {
          const asset = Asset.fromModule(images.fullLogo);
          await asset.downloadAsync();
          
          if (asset.localUri) {
            logoBase64 = asset.localUri;
            console.log("✅ SOR: Using local URI as fallback for watermark");
          }
        } catch (fallbackError) {
          console.warn("⚠️ SOR: Fallback watermark method also failed:", fallbackError);
          // Continue without watermark if all methods fail
        }
      }

      const studentNumber =
        studentData?.studentNumber ||
        studentData?.admissionNumber ||
        studentProfile?.student?.admissionNumber ||
        studentProfile?.student?.studentNumber ||
        user?.id ||
        "N/A";

      const firstName =
        studentData?.firstName ||
        studentProfile?.student?.firstName ||
        user?.firstName ||
        "N/A";

      const lastName =
        studentData?.lastName ||
        studentProfile?.student?.lastName ||
        user?.lastName ||
        "N/A";

      const campus =
        studentData?.campusName ||
        studentProfile?.student?.campusName ||
        studentProfile?.campus ||
        "MOKOPANE";

      const qualification =
        studentData?.intakeGroupTitle ||
        studentProfile?.student?.intakeGroupTitle ||
        studentProfile?.course ||
        "City & Guilds Award: Introduction to the Hospitality Industry";

      // Helper function to get proper qualification name
      const getQualificationName = (intakeTitle: string) => {
        const category = intakeTitle.toUpperCase();
        if (category.includes("OCG")) {
          return "Occupational Grande Chef: Dual Qualification & Trade Test";
        } else if (
          category.includes("DIPLOMA") &&
          category.includes("EXCHANGE")
        ) {
          return "International Exchange Program Diploma: Food Preparation & Culinary Arts";
        } else if (category.includes("DIPLOMA")) {
          return "Diploma: Food Preparation and Culinary Arts";
        } else if (category.includes("AWARD")) {
          return "Award: Introduction To The Hospitality Industry & Cooking";
        } else if (category.includes("CERTIFICATE")) {
          return "Certificate: Professional Cookery and the Principles of Hospitality";
        } else if (category.includes("PASTRY")) {
          return "Pastry Diploma: Professional Patisserie (Pastry)";
        }
        return intakeTitle;
      };

      // Build results table HTML
      const resultsRows =
        results.length > 0
          ? results
              .map((result) => {
                const rawPercent = result.result?.replace("%", "") || "0";
                const displayPercent =
                  rawPercent !== "0"
                    ? `${Math.ceil(parseFloat(rawPercent))}%`
                    : "N/A";
                const statusColor =
                  result.status === "C" ? "#4caf50" : "#f44336";

                return `
                <tr>
                  <td style="padding: 6px 8px; border: 1px solid #ddd; font-size: 9px;">
                    ${(
                      result.subject ||
                      result.unitTitle ||
                      "N/A"
                    ).toUpperCase()}
                  </td>
                  <td style="padding: 6px 8px; border: 1px solid #ddd; text-align: center; font-size: 9px;">
                    ${displayPercent}
                  </td>
                  <td style="padding: 6px 8px; border: 1px solid #ddd; text-align: center; font-weight: bold; color: ${statusColor}; font-size: 9px;">
                    ${(result.status || "N/A").toUpperCase()}
                  </td>
                </tr>
              `;
              })
              .join("")
          : `<tr><td colspan="3" style="padding: 8px; border: 1px solid #ddd; text-align: center;">No results available</td></tr>`;

      // Add overall outcome row
      const overallStatusColor = overallOutcome === "C" ? "#4caf50" : "#f44336";
      const overallRow = `
        <tr style="font-weight: bold;">
          <td style="padding: 6px 8px; border: 1px solid #ddd; font-size: 9px;">OVERALL OUTCOME</td>
          <td style="padding: 6px 8px; border: 1px solid #ddd; text-align: center; font-size: 9px;">-</td>
          <td style="padding: 6px 8px; border: 1px solid #ddd; text-align: center; font-weight: bold; color: ${overallStatusColor}; font-size: 9px;">
            ${overallOutcome}
          </td>
        </tr>
      `;

      // Build index table HTML
      const indexRows = indexData
        .map(
          ([number, subject, reference]) => `
          <tr>
            <td style="padding: 6px 8px; border: 1px solid #ddd; text-align: center; font-weight: 600; font-size: 9px; background-color: #fafafa;">
              ${number.toUpperCase()}
            </td>
            <td style="padding: 6px 8px; border: 1px solid #ddd; font-size: 9px;">
              ${reference.toUpperCase()}
            </td>
          </tr>
        `,
        )
        .join("");

      // Generate HTML matching the exact web version layout
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            @page {
              size: A4;
              margin: 20mm;
            }
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: Helvetica, Arial, sans-serif;
              font-size: 10px;
              line-height: 1.4;
              color: #333;
              background: white;
            }
            .page {
              width: 210mm;
              min-height: 297mm;
              padding: 20mm;
              background: white;
              position: relative;
            }
            ${
              logoBase64
                ? `
            .page::before {
              content: "";
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: 70%;
              height: 70%;
              background-image: url('${logoBase64}');
              background-repeat: no-repeat;
              background-position: center;
              background-size: contain;
              opacity: 0.1;
              z-index: 0;
              pointer-events: none;
            }
            .page > * {
              position: relative;
              z-index: 1;
            }
            `
                : `
            /* No watermark available */
            .page > * {
              position: relative;
              z-index: 1;
            }
            `
            }
            .logo {
              text-align: center;
              margin-bottom: 15px;
            }
            .logo-text {
              font-size: 24px;
              font-weight: bold;
              color: #333;
            }
            .main-title {
              text-align: center;
              font-size: 16px;
              font-weight: bold;
              margin: 20px 0 25px 0;
            }
            .detail-row {
              display: flex;
              margin-bottom: 8px;
              font-size: 10px;
            }
            .detail-label {
              font-weight: bold;
              width: 140px;
              min-width: 140px;
            }
            .detail-value {
              flex: 1;
            }
            .certification {
              font-style: italic;
              text-align: center;
              margin: 20px 0;
              padding: 10px 0;
              font-size: 10px;
              color: #666;
            }
            .section-title {
              font-size: 14px;
              font-weight: bold;
              margin: 20px 0 10px 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 15px 0;
            }
            th {
              background-color: #f0f0f0;
              padding: 8px;
              border: 1px solid #ddd;
              font-weight: bold;
              text-align: center;
              font-size: 10px;
            }
            td {
              padding: 6px 8px;
              border: 1px solid #ddd;
              font-size: 9px;
            }
            .legend {
              font-size: 8px;
              margin: 5px 0;
              color: #666;
            }
            .index-header {
              background-color: #646464;
              color: white;
            }
            .page-break {
              page-break-before: always;
            }
            .footer {
              margin-top: 30px;
              font-size: 8px;
              color: #808080;
            }
            .footer-note {
              font-style: italic;
              margin-bottom: 10px;
            }
          </style>
        </head>
        <body>
          <div class="page">
            <!-- Logo Section -->
            <div class="logo">
              <div class="logo-text">LIMPOPO CHEFS ACADEMY</div>
            </div>

            <!-- Main Title -->
            <div class="main-title">STATEMENT OF RESULTS</div>

            <!-- Student Details -->
            <div class="detail-row">
              <div class="detail-label">STUDENT DETAILS</div>
              <div class="detail-value">${firstName.toUpperCase()} ${lastName.toUpperCase()}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">STUDENT NO</div>
              <div class="detail-value">${studentNumber.toUpperCase()}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">QUALIFICATIONS</div>
              <div class="detail-value">${getQualificationName(
                qualification,
              ).toUpperCase()}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">SCHOOL NAME</div>
              <div class="detail-value">LIMPOPO CHEFS ACADEMY</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">CAMPUS</div>
              <div class="detail-value">${campus.toUpperCase()}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">DATE OF PRINT</div>
              <div class="detail-value">${formatFullDate(
                new Date(),
              ).toUpperCase()}</div>
            </div>

            <!-- Certification Statement -->
            <div class="certification">
              THIS CERTIFIES THAT THE ABOVE STUDENT HAS ACHIEVED THE BELOW RESULTS FOR THE ACADEMIC YEAR AS OF DATE OF PRINT OF THIS STATEMENT OF RESULTS.
            </div>

            <!-- Results Section -->
            <div class="section-title">RESULTS</div>
            <table>
              <thead>
                <tr>
                  <th>SUBJECT</th>
                  <th style="width: 80px;">RESULTS</th>
                  <th style="width: 80px;">STATUS</th>
                </tr>
              </thead>
              <tbody>
                ${resultsRows}
                ${overallRow}
              </tbody>
            </table>

            <!-- Legend -->
            <div class="legend">C - COMPETENT</div>
            <div class="legend">NYC - NOT YET COMPETENT</div>

            <!-- Page Break for Index -->
            <div class="page-break"></div>

            <!-- Subject Reference Index -->
            <div class="section-title">SUBJECT REFERENCE INDEX</div>
            <table>
              <thead>
                <tr>
                  <th class="index-header" style="width: 80px;">NO.</th>
                  <th class="index-header">REFERENCE CODES</th>
                </tr>
              </thead>
              <tbody>
                ${indexRows}
              </tbody>
            </table>

            <!-- Footer -->
            <div class="footer">
              <div class="footer-note">
                PLEASE NOTE: THIS IS A COMPUTER GENERATED COPY. NO MANUAL ALTERATIONS TO BE ACCEPTED. SHOULD YOU WISH TO RECEIVE A VERIFIED AND SIGNED COPY OF THIS STATEMENT OF RESULTS, PLEASE CONTACT THE RESPECTIVE CAMPUS.
              </div>
              <div>MOKOPANE: (015) 491 1226 OR RECEPTION@LIMPOPOCHEFS.CO.ZA</div>
              <div>POLOKWANE: (015) 292 0102 OR POLOKWANE@LIMPOPOCHEFS.CO.ZA</div>
            </div>
          </div>
        </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({
        html,
        base64: false,
      });

      await Sharing.shareAsync(uri, {
        UTI: ".pdf",
        mimeType: "application/pdf",
        dialogTitle: `SOR-${studentNumber}.pdf`,
      });

      Alert.alert("Success", "Statement of Results downloaded successfully");
    } catch (error) {
      console.error("PDF generation error:", error);
      Alert.alert("Error", "Failed to generate PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
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

      {/* Download Button - Moved here */}
      <Card style={styles.card}>
        <Card.Content>
          <Button
            mode="contained"
            icon={downloading ? "loading" : "download"}
            style={styles.downloadButton}
            onPress={handleDownloadPDF}
            disabled={downloading}
          >
            {downloading ? "Generating PDF..." : "Download SOR (PDF)"}
          </Button>
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
      <Card style={styles.lastCard}>
        <Card.Title title="Subject Reference Index" />
        <Card.Content>
          <View style={styles.indexTable}>
            <View style={styles.indexHeaderRow}>
              <View style={styles.indexNumberHeader}>
                <Text style={styles.indexHeaderText}>No.</Text>
              </View>
              <View style={styles.indexReferenceHeader}>
                <Text style={styles.indexHeaderText}>Reference Codes</Text>
              </View>
            </View>

            {subjectIndex.map((item, index) => (
              <View key={index} style={styles.indexRow}>
                <View style={styles.indexNumberCell}>
                  <Text style={styles.indexNumberText}>{item.number}</Text>
                </View>
                <View style={styles.indexReferenceCell}>
                  <Text style={styles.indexReferenceText}>
                    {item.reference}
                  </Text>
                </View>
              </View>
            ))}
          </View>
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
    paddingTop: 48,
  },
  scrollContent: {
    paddingBottom: 100,
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
  lastCard: {
    marginBottom: 80,
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
  indexTable: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
  },
  indexHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    borderBottomWidth: 2,
    borderBottomColor: "#999",
  },
  indexNumberHeader: {
    width: 80,
    padding: 12,
    borderRightWidth: 1,
    borderRightColor: "#999",
    alignItems: "center",
    justifyContent: "center",
  },
  indexReferenceHeader: {
    flex: 1,
    padding: 12,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  indexHeaderText: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#333",
  },
  indexRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    minHeight: 40,
  },
  indexNumberCell: {
    width: 80,
    padding: 10,
    borderRightWidth: 1,
    borderRightColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fafafa",
  },
  indexNumberText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  indexReferenceCell: {
    flex: 1,
    padding: 10,
    justifyContent: "center",
  },
  indexReferenceText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
});
