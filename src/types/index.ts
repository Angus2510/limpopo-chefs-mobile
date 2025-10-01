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
  studentId: string;
  date: string;
  status: "present" | "absent" | "late";
  timeIn?: string;
  timeOut?: string;
  location?: string;
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

export interface DashboardData {
  student: Student;
  upcomingAssignments: Assignment[];
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
