import axios from "axios";
import { API_CONFIG } from "../config";
import AuthService from "./auth";
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
  CompetenciesResponse,
  CompetencyRecord,
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
  async (config) => {
    // Add auth token if available
    const token = await AuthService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If we get a 401 and haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const newToken = await AuthService.refreshToken();

        if (newToken) {
          // Retry the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } else {
          // Refresh failed, redirect to login
          // This should trigger a logout in your auth context
          await AuthService.logout();
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        await AuthService.logout();
      }
    }

    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export class StudentAPI {
  // Dashboard
  static async getDashboardData(studentId: string): Promise<DashboardData> {
    const response = await api.get(`/students/${studentId}/dashboard`);
    return response.data;
  }

  // Events
  static async getEvents(
    studentId: string,
    startDate?: string,
    endDate?: string
  ): Promise<any[]> {
    let url = `/students/${studentId}/events`;
    if (startDate && endDate) {
      url += `?startDate=${startDate}&endDate=${endDate}`;
    }
    const response = await api.get(url);
    return response.data;
  }

  // Assignments
  static async getAssignments(studentId: string): Promise<Assignment[]> {
    const response = await api.get(`/students/${studentId}/assignments`);
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
    studentId: string,
    startDate?: string,
    endDate?: string
  ): Promise<AttendanceRecord[]> {
    let url = `/students/${studentId}/attendance`;
    if (startDate && endDate) {
      url += `?startDate=${startDate}&endDate=${endDate}`;
    }
    const response = await api.get(url);
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
  static async getPayableFees(studentId: string): Promise<Fee[]> {
    const response = await api.get(`/students/${studentId}/fees/payable`);
    return response.data;
  }

  static async getFeeTransactions(studentId: string): Promise<any[]> {
    const response = await api.get(`/students/${studentId}/fees/transactions`);
    return response.data;
  }

  static async getFeeBalance(studentId: string): Promise<any> {
    const response = await api.get(`/students/${studentId}/fees/balance`);
    return response.data;
  }

  static async payFee(
    studentId: string,
    feeId: string,
    paymentMethod: string
  ): Promise<void> {
    await api.post(`/students/${studentId}/fees/payment`, {
      feeId,
      paymentMethod,
    });
  }

  // Downloads
  static async getDownloads(studentId: string): Promise<DownloadItem[]> {
    const response = await api.get(`/students/${studentId}/downloads`);
    return response.data;
  }

  static async downloadFile(downloadId: string): Promise<string> {
    const response = await api.get(`/downloads/${downloadId}/file`);
    return response.data.downloadUrl;
  }

  // Profile
  static async getStudentProfile(studentId: string): Promise<Student> {
    const response = await api.get(`/students/${studentId}`);
    return response.data;
  }

  static async updateStudentProfile(
    studentId: string,
    profileData: Partial<Student>
  ): Promise<Student> {
    const response = await api.put(`/students/${studentId}`, profileData);
    return response.data;
  }

  static async getStudentDocuments(studentId: string): Promise<any[]> {
    const response = await api.get(`/students/${studentId}/documents`);
    return response.data;
  }

  // SOR (Student of Record)
  static async getSORRecords(studentId: string): Promise<SORRecord[]> {
    const response = await api.get(`/students/${studentId}/records`);
    return response.data;
  }

  static async getStudentResults(studentId: string): Promise<any> {
    const response = await api.get(`/api/mobile/students/${studentId}/results`);
    return response.data;
  }

  static async getStudentCompetencies(
    studentId: string
  ): Promise<CompetencyRecord[]> {
    const response = await api.get(`/students/${studentId}/competencies`);
    return response.data;
  }

  // Try to get results directly from the working competencies endpoint but with detailed data
  static async getStudentResultsDetailed(
    studentId: string
  ): Promise<CompetenciesResponse> {
    console.log(
      `🔍 API: Calling competencies endpoint for student ${studentId}`
    );
    console.log(
      `🔍 API: Full URL will be: ${API_CONFIG.BASE_URL}/students/${studentId}/competencies`
    );

    const response = await api.get(`/students/${studentId}/competencies`);

    console.log(`✅ API: Competencies response status:`, response.status);
    console.log(`📊 API: Response data structure:`, {
      success: response.data?.success,
      hasData: !!response.data?.data,
      dataKeys: response.data?.data ? Object.keys(response.data.data) : [],
      resultsCount: response.data?.data?.results?.length || 0,
    });

    return response.data;
  }

  // WEL (Work Experience Learning)
  static async getWELLocations(): Promise<WELLocation[]> {
    const response = await api.get("/wel/locations");
    return response.data;
  }

  static async getWELPlacements(studentId: string): Promise<WELPlacement[]> {
    const response = await api.get(`/students/${studentId}/wel/placements`);
    return response.data;
  }

  static async getWELHours(studentId: string): Promise<any> {
    const response = await api.get(`/students/${studentId}/wel/hours`);
    return response.data;
  }

  static async applyForWELPlacement(
    studentId: string,
    locationId: string,
    startDate: string,
    endDate: string
  ): Promise<WELPlacement> {
    const response = await api.post(`/students/${studentId}/wel/placements`, {
      locationId,
      startDate,
      endDate,
    });
    return response.data;
  }

  // Announcements
  static async getAnnouncements(studentId: string): Promise<Announcement[]> {
    const response = await api.get(`/students/${studentId}/announcements`);
    return response.data;
  }

  static async markAnnouncementAsRead(announcementId: string): Promise<void> {
    await api.put(`/announcements/${announcementId}/read`);
  }
}

export default StudentAPI;
