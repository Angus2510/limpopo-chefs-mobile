// Competency calculation utilities matching the web version

interface CompetencyCalculationInput {
  testScore?: number | null;
  taskScore?: number | null;
  overallPercent?: number | null;
  type: "Theory" | "Practical" | "Exams/Well";
}

export function calculateCompetencyStatus(
  input: CompetencyCalculationInput,
): string {
  const { testScore, taskScore, overallPercent, type } = input;

  console.log("🔍 Calculating competency:", {
    testScore,
    taskScore,
    overallPercent,
    type,
  });

  // If we have an overall percentage, use that first
  if (
    overallPercent !== null &&
    overallPercent !== undefined &&
    overallPercent > 0
  ) {
    return overallPercent >= 50 ? "C" : "NYC";
  }

  // Type-specific logic
  switch (type) {
    case "Theory":
      // Theory subjects: Must pass both test (50%) and task (50%)
      if (testScore !== null && testScore !== undefined && testScore > 0) {
        if (taskScore !== null && taskScore !== undefined && taskScore > 0) {
          // Both scores available
          return testScore >= 50 && taskScore >= 50 ? "C" : "NYC";
        } else {
          // Only test score available
          return testScore >= 50 ? "C" : "NYC";
        }
      } else if (
        taskScore !== null &&
        taskScore !== undefined &&
        taskScore > 0
      ) {
        // Only task score available
        return taskScore >= 50 ? "C" : "NYC";
      }
      break;

    case "Practical":
      // Practical subjects: Usually based on task score or overall
      if (taskScore !== null && taskScore !== undefined && taskScore > 0) {
        return taskScore >= 50 ? "C" : "NYC";
      } else if (
        testScore !== null &&
        testScore !== undefined &&
        testScore > 0
      ) {
        return testScore >= 50 ? "C" : "NYC";
      }
      break;

    case "Exams/Well":
      // Exams/WEL: Usually based on test score or overall
      if (testScore !== null && testScore !== undefined && testScore > 0) {
        return testScore >= 50 ? "C" : "NYC";
      } else if (
        taskScore !== null &&
        taskScore !== undefined &&
        taskScore > 0
      ) {
        return taskScore >= 50 ? "C" : "NYC";
      }
      break;
  }

  // No valid scores found
  return "Pending";
}
