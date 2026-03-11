// Results setup utilities matching the web version

export interface Subject {
  title: string;
  type: "Theory" | "Practical" | "Exams/Well";
  category?: string;
}

export const GROUP_SUBJECTS_CONFIG: Record<string, { subjects: Subject[] }> = {
  OCG: {
    subjects: [
      // 1st Year Theory Subjects
      { title: "Introduction to Food Costing 1.0", type: "Theory" },
      { title: "Introduction to French 1.0", type: "Theory" },
      { title: "Introduction to the Hospitality Industry", type: "Theory" },
      { title: "Introduction to Nutrition and Healthy Eating", type: "Theory" },
      { title: "Essential Knife Skills", type: "Practical" },
      { title: "Food Safety and Quality Assurance", type: "Theory" },
      { title: "Health and Safety in the Workplace", type: "Theory" },
      { title: "Personal Hygiene in the Workplace", type: "Theory" },
      {
        title: "Food Preparation Methods, Techniques and Equipment",
        type: "Theory",
      },
      { title: "Food Cooking Methods & Techniques", type: "Theory" },
      { title: "Food Commodities & Basic Ingredients", type: "Theory" },
      { title: "Theory of Food Production & Customer Service", type: "Theory" },
      { title: "Numeracy and Units of Measurement", type: "Theory" },
      { title: "Introduction: Meal Planning and Menus", type: "Theory" },
      { title: "Computer Literacy and Research", type: "Theory" },
      { title: "Environmental Awareness", type: "Theory" },
      { title: "Personal Development as a Chef", type: "Theory" },
      // 1st Year Practical Assessments
      { title: "1st Year Task", type: "Practical" },
      { title: "Final Theory Exam", type: "Exams/Well" },
      { title: "Mid Year Theory Exam", type: "Exams/Well" },
      { title: "Safety", type: "Theory" },
      // 2nd Year Subjects
      { title: "Environmental Sustainability", type: "Theory" },
      { title: "Advanced Menu Planning and Costing", type: "Theory" },
      {
        title: "Theory of Preparing, Cooking and Finishing Dishes",
        type: "Theory",
      },
      {
        title:
          "Theory of Facility management and equipment resource management",
        type: "Theory",
      },
      {
        title: "Staff Resource Management and Self Development",
        type: "Theory",
      },
      { title: "Theory of commodity resource management", type: "Theory" },
      { title: "Understand Business Success", type: "Theory" },
      { title: "Provide Guest Service", type: "Theory" },
      {
        title: "Preparation & Cooking: Nutrition & Healthier foods",
        type: "Theory",
      },
      { title: "Diploma Task", type: "Practical" },
      { title: "Food Safety Evolve", type: "Theory" },
      { title: "Food preparation & Culinary Arts", type: "Theory" },
      { title: "Hospitality Principles", type: "Theory" },
      // 3rd Year Subjects
      { title: "Theory of Safety Supervision", type: "Theory" },
      { title: "Theory of Food Production Supervision", type: "Theory" },
      { title: "Contribute to Business Success", type: "Theory" },
      { title: "Contribute to the Guest Experience", type: "Theory" },
      {
        title:
          "Developing Opportunities for Progression in the Culinary Industry",
        type: "Theory",
      },
      { title: "Gastronomy and Global Cuisines", type: "Theory" },
      { title: "Operational Cost Control", type: "Theory" },
      { title: "Function Task Parts 1-8", type: "Practical" },
      { title: "Wine and Food Pairing", type: "Theory" },
      { title: "Monitoring and supervision of food safety", type: "Theory" },
      { title: "Culinary arts and supervision", type: "Theory" },
      { title: "Trade Test- Theory Exam", type: "Exams/Well" },
      { title: "Trade Test- Practical Exam", type: "Exams/Well" },
      // Menu Assessments
      { title: "OCG 1st year Menus A1-A18", type: "Practical" },
      { title: "OCG 2nd year Menus B1-B9", type: "Practical" },
      { title: "OCG 3rd year Menus C1-C6", type: "Practical" },
    ],
  },
  AWARD: {
    subjects: [
      { title: "Introduction to Food Costing 1.0", type: "Theory" },
      { title: "Introduction to French 1.0", type: "Theory" },
      { title: "Introduction to the Hospitality Industry", type: "Theory" },
      { title: "Introduction to Nutrition and Healthy Eating", type: "Theory" },
      { title: "Essential Knife Skills", type: "Practical" },
      { title: "Food Safety and Quality Assurance", type: "Theory" },
      { title: "Health and Safety in the Workplace", type: "Theory" },
      { title: "Personal Hygiene in the Workplace", type: "Theory" },
      {
        title: "Food Preparation Methods, Techniques and Equipment",
        type: "Theory",
      },
      { title: "Food Cooking Methods & Techniques", type: "Theory" },
      { title: "1st Year Task", type: "Practical" },
      { title: "Mid Year Theory Exam", type: "Exams/Well" },
      { title: "Safety", type: "Theory" },
      { title: "Award Menus A1-A8", type: "Practical" },
    ],
  },
  CERTIFICATE: {
    subjects: [
      { title: "Introduction to Food Costing 1.0", type: "Theory" },
      { title: "Introduction to French 1.0", type: "Theory" },
      { title: "Introduction to the Hospitality Industry", type: "Theory" },
      { title: "Introduction to Nutrition and Healthy Eating", type: "Theory" },
      { title: "Essential Knife Skills", type: "Practical" },
      { title: "Food Safety and Quality Assurance", type: "Theory" },
      { title: "Health and Safety in the Workplace", type: "Theory" },
      { title: "Personal Hygiene in the Workplace", type: "Theory" },
      {
        title: "Food Preparation Methods, Techniques and Equipment",
        type: "Theory",
      },
      { title: "Food Cooking Methods & Techniques", type: "Theory" },
      { title: "Food Commodities & Basic Ingredients", type: "Theory" },
      { title: "Theory of Food Production & Customer Service", type: "Theory" },
      { title: "Numeracy and Units of Measurement", type: "Theory" },
      { title: "Introduction: Meal Planning and Menus", type: "Theory" },
      { title: "Computer Literacy and Research", type: "Theory" },
      { title: "Environmental Awareness", type: "Theory" },
      { title: "Personal Development as a Chef", type: "Theory" },
      { title: "1st Year Task", type: "Practical" },
      { title: "Final Theory Exam", type: "Exams/Well" },
      { title: "Mid Year Theory Exam", type: "Exams/Well" },
      { title: "Safety", type: "Theory" },
      { title: "Certificate Menus A1-A18", type: "Practical" },
    ],
  },
  DIPLOMA: {
    subjects: [
      { title: "Introduction to Food Costing 1.0", type: "Theory" },
      { title: "Introduction to the Hospitality Industry", type: "Theory" },
      { title: "Essential Knife Skills", type: "Practical" },
      { title: "Food Safety and Quality Assurance", type: "Theory" },
      { title: "Food Cooking Methods & Techniques", type: "Theory" },
      { title: "Personal Hygiene in the Workplace", type: "Theory" },
      { title: "Environmental Sustainability", type: "Theory" },
      { title: "Advanced Menu Planning and Costing", type: "Theory" },
      {
        title: "Theory of Preparing, Cooking and Finishing Dishes",
        type: "Theory",
      },
      {
        title: "Staff Resource Management and Self Development",
        type: "Theory",
      },
      { title: "Understand Business Success", type: "Theory" },
      { title: "Provide Guest Service", type: "Theory" },
      { title: "Diploma Task", type: "Practical" },
      { title: "Final Theory Exam", type: "Exams/Well" },
      { title: "Food Safety Evolve", type: "Theory" },
      { title: "Food preparation & Culinary Arts", type: "Theory" },
      { title: "Hospitality Principles", type: "Theory" },
      { title: "Diploma Menus A1-A6", type: "Practical" },
      { title: "Diploma Menus B1-B9", type: "Practical" },
    ],
  },
  PASTRY: {
    subjects: [
      { title: "Understand the hospitality industry", type: "Theory" },
      { title: "Understand business success", type: "Theory" },
      { title: "Provide guest service", type: "Theory" },
      {
        title: "Awareness of sustainability in the hospitality industry",
        type: "Theory",
      },
      { title: "Understand own role in self development", type: "Theory" },
      { title: "Food safety", type: "Theory" },
      {
        title: "Meet guest requirements through menu planning",
        type: "Theory",
      },
      {
        title:
          "Prepare, cook and finish cakes, biscuits and sponge products using standardised recipes",
        type: "Practical",
      },
      {
        title:
          "Prepare, cook and finish pastry products using standardised recipes",
        type: "Practical",
      },
      {
        title:
          "Produce, cook and finish dough products using standardised recipes",
        type: "Practical",
      },
      {
        title:
          "Prepare, cook and finish hot desserts using standardised recipes",
        type: "Practical",
      },
      {
        title:
          "Prepare, cook and finish cold desserts using standardised recipes",
        type: "Practical",
      },
      {
        title:
          "Prepare and finish simple chocolate products using standardised recipes",
        type: "Practical",
      },
      { title: "Mise en place", type: "Practical" },
      { title: "Final Inhouse Pastry Theory Exam", type: "Exams/Well" },
      { title: "Food safety", type: "Theory" },
      { title: "Hospitality Principles", type: "Theory" },
      { title: "Food preparation & Culinary Arts", type: "Theory" },
      { title: "Pastry Menus P1-P17", type: "Practical" },
    ],
  },
};

export function getIntakeCategory(intakeGroup: string): string {
  const upper = intakeGroup?.toUpperCase() || "";

  if (upper.includes("OCG")) {
    if (upper.includes("2023")) return "OCG_2023";
    if (upper.includes("JULY_2022")) return "OCG_JULY_2022";
    return "OCG";
  }
  if (upper.includes("DIPLOMA") && upper.includes("EXCHANGE"))
    return "DIPLOMA_EXCHANGE";
  if (upper.includes("DIPLOMA")) return "DIPLOMA";
  if (upper.includes("AWARD")) return "AWARD";
  if (upper.includes("CERTIFICATE")) return "CERTIFICATE";
  if (upper.includes("PASTRY")) return "PASTRY";

  return "OCG"; // default
}

export function filterAndSortResults(
  results: any[],
  intakeGroup: string,
): any[] {
  if (!results || !Array.isArray(results)) return [];

  return results
    .filter((result) => result && (result.percent || result.scores))
    .sort(
      (a, b) =>
        new Date(b.dateTaken).getTime() - new Date(a.dateTaken).getTime(),
    );
}

export function findMatchingSubject(
  subjectTitle: string,
  intakeCategory: string,
): Subject | null {
  const config = GROUP_SUBJECTS_CONFIG[intakeCategory];
  if (!config) return null;

  return (
    config.subjects.find(
      (subject) => subject.title.toLowerCase() === subjectTitle.toLowerCase(),
    ) || null
  );
}
