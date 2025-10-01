import axios from "axios";
import { API_CONFIG } from "../config";
import {
  Student,
  Assignment,
  AttendanceRecord,
  Fee,
  DownloadItem,
  SORRecord,
  WELLocation,
  WELPlacement,
  DashboardData,
  Announcement,
} from "../types";

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor for authentication token
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = ""; // You'll need to implement token storage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export class StudentAPI {
  // Dashboard
  static async getDashboardData(studentId: string): Promise<DashboardData> {
    const response = await api.get(`/student/${studentId}/dashboard`);
    return response.data;
  }

  // Assignments
  static async getAssignments(studentId: string): Promise<Assignment[]> {
    const response = await api.get(`/student/${studentId}/assignments`);
    return response.data;
  }

  static async getAssignment(assignmentId: string): Promise<Assignment> {
    const response = await api.get(`/assignments/${assignmentId}`);
    return response.data;
  }

  static async submitAssignment(
    assignmentId: string,
    formData: FormData
  ): Promise<void> {
    await api.post(`/assignments/${assignmentId}/submit`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }

  // Attendance
  static async getAttendanceRecords(
    studentId: string
  ): Promise<AttendanceRecord[]> {
    const response = await api.get(`/student/${studentId}/attendance`);
    return response.data;
  }

  static async scanAttendance(
    qrData: string,
    studentId: string
  ): Promise<AttendanceRecord> {
    const response = await api.post("/attendance/scan", {
      qrData,
      studentId,
      timestamp: new Date().toISOString(),
    });
    return response.data;
  }

  // Fees
  static async getFees(studentId: string): Promise<Fee[]> {
    const response = await api.get(`/student/${studentId}/fees`);
    return response.data;
  }

  static async payFee(feeId: string, paymentMethod: string): Promise<void> {
    await api.post(`/fees/${feeId}/pay`, { paymentMethod });
  }

  // Downloads
  static async getDownloads(): Promise<DownloadItem[]> {
    const response = await api.get("/downloads");
    return response.data;
  }

  static async downloadFile(fileId: string): Promise<string> {
    const response = await api.get(`/downloads/${fileId}/download`);
    return response.data.downloadUrl;
  }

  // Profile
  static async getStudentProfile(studentId: string): Promise<Student> {
    const response = await api.get(`/student/${studentId}/profile`);
    return response.data;
  }

  static async updateStudentProfile(
    studentId: string,
    profileData: Partial<Student>
  ): Promise<Student> {
    const response = await api.put(
      `/student/${studentId}/profile`,
      profileData
    );
    return response.data;
  }

  // SOR (Student of Record)
  static async getSORRecords(studentId: string): Promise<SORRecord[]> {
    const response = await api.get(`/student/${studentId}/sor`);
    return response.data;
  }

  // WEL (Work Experience Learning)
  static async getWELLocations(): Promise<WELLocation[]> {
    const response = await api.get("/wel/locations");
    return response.data;
  }

  static async getWELPlacements(studentId: string): Promise<WELPlacement[]> {
    const response = await api.get(`/student/${studentId}/wel/placements`);
    return response.data;
  }

  static async applyForWELPlacement(
    studentId: string,
    locationId: string,
    startDate: string,
    endDate: string
  ): Promise<WELPlacement> {
    const response = await api.post("/wel/apply", {
      studentId,
      locationId,
      startDate,
      endDate,
    });
    return response.data;
  }

  // Announcements
  static async getAnnouncements(studentId: string): Promise<Announcement[]> {
    const response = await api.get(`/student/${studentId}/announcements`);
    return response.data;
  }

  static async markAnnouncementAsRead(announcementId: string): Promise<void> {
    await api.post(`/announcements/${announcementId}/read`);
  }
}

export default StudentAPI;
