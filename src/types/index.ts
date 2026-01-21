export interface Student {
  id: string;
  name: string;
  email: string;
  studentNumber: string;
  course: string;
  year: number;
  profileImage?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  guardian?: {
    name: string;
    phone: string;
    email: string;
    relationship: string;
  };
  intakeGroupTitle?: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: "pending" | "submitted" | "graded";
  grade?: number;
  feedback?: string;
  attachments?: string[];
}

export interface AttendanceRecord {
  id: string;
  date: string;
  status: "full" | "absent" | "absent with reason" | "W.E.L" | "sick";
  timeCheckedIn?: string;
  outcome?: {
    id?: string;
    title?: string;
  };
  outcomeTitle?: string; // Fallback if outcome is string
}

export interface Fee {
  id: string;
  description: string;
  amount: number;
  dueDate: string;
  status: "paid" | "unpaid" | "overdue";
  paymentDate?: string;
}

export interface DownloadItem {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  fileType: string;
  uploadDate: string;
  category: string;
  fileKey?: string; // S3 file key for generating signed URLs
}

export interface SORRecord {
  id: string;
  studentId: string;
  competencyTitle: string;
  status: "achieved" | "not-achieved" | "in-progress";
  assessmentDate?: string;
  assessor?: string;
  evidence?: string[];
}

export interface SORResult {
  subject: string;
  result: string;
  status: string;
  unitTitle?: string;
  id?: string;
  dateCreated?: string;
  competency?: boolean | string;
  rawData?: any;
}

export interface ProcessedResult {
  // Subject information with full names
  subjectId: string | null;
  subjectTitle: string;
  subjectType: string;
  subjectYear: number;

  // Result information
  hasResult: boolean;
  resultId: string | null;
  dateTaken: string | null;
  dateAssessed: string | null;

  // Score fields
  percent: number | null;
  rawPercent: number | null;
  scores: any;
  mark: number | null;
  average: number | null;
  testScore: number | null;
  taskScore: number | null;

  // Competency information
  competencyStatus: string;
  competency: "competent" | "not_competent";

  // Additional metadata
  status: string | null;
  assignment: any;
  outcome: any;
  fullResult: any;
}

export interface CompetencyRecord {
  id: string;
  outcome?: string;
  competency?: "competent" | "not_competent" | boolean;
  dateAssessed?: Date | string;
  dateTaken?: Date | string;
  percent?: number;
  scores?: number;
  mark?: number;
  average?: number;
  testScore?: number;
  taskScore?: number;
  assignments?: {
    title?: string;
    [key: string]: any;
  };
  title?: string;
  unitTitle?: string;
  status?: string;
  [key: string]: any;
}

export interface StudentProfile {
  student?: {
    id: string;
    admissionNumber: string;
    studentNumber: string;
    email: string;
    active: boolean;
    campus: string;
    campusName: string;
    campusId: string;
    intakeGroup: string;
    intakeGroupTitle: string;
    firstName: string;
    lastName: string;
    fullName: string;
    intakeCategory: string;
    profile: {
      firstName: string;
      lastName: string;
      middleName?: string;
      idNumber: string;
      dateOfBirth: string;
      gender: string;
      mobileNumber: string;
      homeLanguage: string;
      cityAndGuildNumber?: string;
      admissionDate: string;
      address?: any;
      postalAddress?: any;
    };
    importantInformation: string;
  };

  // Processed results with subject names and competency calculations
  results: ProcessedResult[];

  // Summary information
  summary: {
    totalSubjects: number;
    subjectsWithResults: number;
    subjectsWithoutResults: number;
    overallOutcome: string;
    competentCount: number;
    nycCount: number;
    pendingCount: number;
  };

  // All subjects for reference
  allSubjects: Array<{
    id: string | null;
    title: string;
    type: string;
    year: number;
  }>;

  // Original data for compatibility
  guardians: any[];
  attendance: any[];
  documents: any;
  finances: any;
  events: any[];
  learningMaterials: any[];
  rawResults: any[];
}

export interface CompetenciesResponse {
  success: boolean;
  data?: StudentProfile;
  error?: string;
}

export interface ResultsData {
  results: SORResult[];
}

export interface WELLocation {
  id: string;
  name: string;
  address: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  availableSlots: number;
  requirements?: string[];
}

export interface WELPlacement {
  id: string;
  studentId: string;
  locationId: string;
  startDate: string;
  endDate: string;
  status: "pending" | "approved" | "rejected" | "completed";
  supervisor?: string;
  logbook?: string[];
}

export interface WELRecord {
  id: string;
  startDate: string;
  endDate: string;
  totalHours: number;
  establishmentName: string;
  establishmentContact: string;
  evaluated: boolean;
}

export interface AttendanceResponse {
  success: boolean;
  data?: {
    attendance: AttendanceRecord[];
    welRecords?: WELRecord[];
    year: number;
    totalRecords: number;
  };
  error?: string;
}

export interface DashboardData {
  student: Student;
  upcomingEvents: Event[];
  recentAttendance: AttendanceRecord[];
  pendingFees: Fee[];
  announcements: Announcement[];
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  priority: "low" | "medium" | "high";
  read: boolean;
}

export interface Event {
  id: string;
  title: string;
  startDate: string;
  startTime?: string;
  endTime?: string;
  details?: string;
  lecturer?: string;
  venue?: string;
  campus?: string;
  color: "lecture" | "practical" | "assessment" | "meeting";
  assignedToModel: string[];
}
