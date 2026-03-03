// Utility to get a consistent qualification name
export function getQualificationName(intakeTitle?: string): string {
  if (!intakeTitle) return "Not enrolled";
  const category = intakeTitle.toUpperCase();
  if (category.includes("OCG")) {
    return "Occupational Grande Chef: Dual Qualification & Trade Test";
  } else if (category.includes("DIPLOMA") && category.includes("EXCHANGE")) {
    return "International Exchange Program Diploma: Food Preparation & Culinary Arts";
  } else if (category.includes("DIPLOMA")) {
    return "Diploma: Food Preparation and Culinary Arts";
  } else if (category.includes("CITY & GUILDS")) {
    return "City & Guilds Award: Introduction to the Hospitality Industry";
  }
  return intakeTitle;
}
