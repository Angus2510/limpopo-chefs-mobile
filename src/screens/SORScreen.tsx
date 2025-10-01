import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Card, Title, Paragraph, DataTable, Button } from "react-native-paper";
import { Student, SORResult } from "../types";

export default function SORScreen() {
  // Mock student data
  const student: Student = {
    id: "current-student-id",
    name: "John Doe",
    email: "john.doe@example.com",
    studentNumber: "LCA2024001",
    course:
      "Certificate: Professional Cookery and the Principles of Hospitality",
    year: 1,
    intakeGroupTitle: "Certificate Cook",
  };

  // Mock results data
  const results: SORResult[] = [
    {
      subject: "Introduction to the Hospitality Industry",
      result: "85%",
      status: "C",
    },
    {
      subject: "Introduction to Nutrition and Healthy Eating",
      result: "78%",
      status: "C",
    },
    { subject: "Essential Knife Skills", result: "92%", status: "C" },
    {
      subject: "Food Safety and Quality Assurance",
      result: "88%",
      status: "C",
    },
    {
      subject: "Health and Safety in the Workplace",
      result: "75%",
      status: "NYC",
    },
    {
      subject: "Personal Hygiene in the Workplace",
      result: "90%",
      status: "C",
    },
    { subject: "Food Preparation Methods", result: "82%", status: "C" },
    {
      subject: "Food Cooking Methods & Techniques",
      result: "79%",
      status: "C",
    },
  ];

  // Calculate overall outcome
  const hasNYC = results.some((result) => result.status === "NYC");
  const overallOutcome = hasNYC ? "NYC" : "C";

  // Mock subject index
  const subjectIndex = [
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
    <ScrollView style={styles.container}>
      <Title style={styles.mainTitle}>Statement of Results</Title>

      {/* Student Details */}
      <Card style={styles.card}>
        <Card.Title title="Student Details" />
        <Card.Content>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>{student.name.toUpperCase()}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Student No:</Text>
            <Text style={styles.value}>
              {student.studentNumber.toUpperCase()}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Qualification:</Text>
            <Text style={styles.value}>{student.course.toUpperCase()}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>School Name:</Text>
            <Text style={styles.value}>LIMPOPO CHEFS ACADEMY</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Campus:</Text>
            <Text style={styles.value}>MOKOPANE</Text>
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

            {results.map((result, index) => (
              <DataTable.Row key={index}>
                <DataTable.Cell>{result.subject}</DataTable.Cell>
                <DataTable.Cell numeric>{result.result}</DataTable.Cell>
                <DataTable.Cell numeric>{result.status}</DataTable.Cell>
              </DataTable.Row>
            ))}

            <DataTable.Row>
              <DataTable.Cell>Overall Outcome</DataTable.Cell>
              <DataTable.Cell numeric>-</DataTable.Cell>
              <DataTable.Cell numeric>{overallOutcome}</DataTable.Cell>
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
  overallCell: {
    fontWeight: "bold",
  },
  overallOutcome: {
    fontWeight: "bold",
    color: "#2196F3",
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
});
