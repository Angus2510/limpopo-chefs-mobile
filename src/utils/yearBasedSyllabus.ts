// Year-based syllabus utilities matching the web version

import { Subject, GROUP_SUBJECTS_CONFIG } from "./resultsSetup";

export function getAllSubjectsForSOR(
  allSubjects: Subject[],
  intakeGroup: string,
): Subject[] {
  // Return all subjects for the intake group - no filtering for SOR
  console.log("📚 Getting all subjects for SOR:", {
    intakeGroup,
    totalSubjects: allSubjects?.length || 0,
  });

  return allSubjects || [];
}
