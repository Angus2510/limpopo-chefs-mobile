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

// Create multiple API instances for failover
const createApiInstance = (baseURL: string) => {
  return axios.create({
    baseURL,
    timeout: API_CONFIG.TIMEOUT,
    headers: {
      "Content-Type": "application/json",
    },
  });
};

// Primary API instance (Portal server)
const primaryApi = createApiInstance(API_CONFIG.BASE_URL);
// Fallback API instance (Vercel server)
const fallbackApi = createApiInstance(API_CONFIG.FALLBACK_URL);

// Enhanced API call with automatic failover
const apiCallWithFailover = async (apiCall: (api: any) => Promise<any>) => {
  let lastError: any;

  // Try primary API first
  try {
    console.log("🌐 Trying primary API (Portal):", API_CONFIG.BASE_URL);
    return await apiCall(primaryApi);
  } catch (error: any) {
    console.warn(
      "⚠️ Primary API failed, trying fallback...",
      error?.message || "Unknown error"
    );
    lastError = error;
  }

  // Try fallback API
  try {
    console.log("🔄 Trying fallback API (Vercel):", API_CONFIG.FALLBACK_URL);
    return await apiCall(fallbackApi);
  } catch (error: any) {
    console.error("❌ Both APIs failed!", error?.message || "Unknown error");
    // Throw the original error from primary API
    throw lastError;
  }
};

// Add interceptors to both API instances
const setupInterceptors = (api: any) => {
  // Request interceptor
  api.interceptors.request.use(
    async (config: any) => {
      const token = await AuthService.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error: any) => Promise.reject(error)
  );

  // Response interceptor
  api.interceptors.response.use(
    (response: any) => response,
    async (error: any) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const newToken = await AuthService.refreshToken();
          if (newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          } else {
            await AuthService.logout();
          }
        } catch (refreshError) {
          await AuthService.logout();
        }
      }

      console.error("API Error:", error.response?.data || error.message);
      return Promise.reject(error);
    }
  );
};

// Setup interceptors for both instances
setupInterceptors(primaryApi);
setupInterceptors(fallbackApi);

export class StudentAPI {
  // Dashboard
  static async getDashboardData(studentId: string): Promise<DashboardData> {
    return apiCallWithFailover(async (api) => {
      const response = await api.get(`/students/${studentId}/dashboard`);
      return response.data;
    });
  }

  // Events
  static async getEvents(
    studentId: string,
    startDate?: string,
    endDate?: string
  ): Promise<any[]> {
    return apiCallWithFailover(async (api) => {
      let url = `/students/${studentId}/events`;
      if (startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`;
      }
      const response = await api.get(url);
      return response.data;
    });
  }

  // Assignments
  static async getAssignments(studentId: string): Promise<Assignment[]> {
    return apiCallWithFailover(async (api) => {
      const response = await api.get(`/students/${studentId}/assignments`);
      return response.data;
    });
  }

  static async getAssignment(assignmentId: string): Promise<Assignment> {
    return apiCallWithFailover(async (api) => {
      const response = await api.get(`/assignments/${assignmentId}`);
      return response.data;
    });
  }

  static async submitAssignment(
    assignmentId: string,
    formData: FormData
  ): Promise<void> {
    return apiCallWithFailover(async (api) => {
      await api.post(`/assignments/${assignmentId}/submit`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    });
  }

  // Attendance
  static async getAttendanceRecords(
    studentId: string,
    startDate?: string,
    endDate?: string
  ): Promise<AttendanceRecord[]> {
    return apiCallWithFailover(async (api) => {
      let url = `/students/${studentId}/attendance`;
      if (startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`;
      }
      const response = await api.get(url);
      return response.data;
    });
  }

  static async scanAttendance(
    qrData: string,
    studentId: string
  ): Promise<AttendanceRecord> {
    return apiCallWithFailover(async (api) => {
      const response = await api.post("/attendance/scan", {
        qrData,
        studentId,
        timestamp: new Date().toISOString(),
      });
      return response.data;
    });
  }

  // Fees
  static async getPayableFees(studentId: string): Promise<Fee[]> {
    return apiCallWithFailover(async (api) => {
      const response = await api.get(`/students/${studentId}/fees/payable`);
      return response.data;
    });
  }

  static async getFeeTransactions(studentId: string): Promise<any[]> {
    return apiCallWithFailover(async (api) => {
      const response = await api.get(
        `/students/${studentId}/fees/transactions`
      );
      return response.data;
    });
  }

  static async getFeeBalance(studentId: string): Promise<any> {
    return apiCallWithFailover(async (api) => {
      const response = await api.get(`/students/${studentId}/fees/balance`);
      return response.data;
    });
  }

  static async payFee(
    studentId: string,
    feeId: string,
    paymentMethod: string
  ): Promise<void> {
    return apiCallWithFailover(async (api) => {
      await api.post(`/students/${studentId}/fees/payment`, {
        feeId,
        paymentMethod,
      });
    });
  }

  // Downloads
  static async getDownloads(studentId: string): Promise<DownloadItem[]> {
    return apiCallWithFailover(async (api) => {
      const response = await api.get(`/students/${studentId}/downloads`);
      return response.data;
    });
  }

  static async downloadFile(downloadId: string): Promise<string> {
    return apiCallWithFailover(async (api) => {
      const response = await api.get(`/downloads/${downloadId}/file`);
      return response.data.downloadUrl;
    });
  }

  // Profile
  static async getStudentProfile(studentId: string): Promise<Student> {
    return apiCallWithFailover(async (api) => {
      const response = await api.get(`/students/${studentId}`);
      return response.data;
    });
  }

  static async updateStudentProfile(
    studentId: string,
    profileData: Partial<Student>
  ): Promise<Student> {
    return apiCallWithFailover(async (api) => {
      const response = await api.put(`/students/${studentId}`, profileData);
      return response.data;
    });
  }

  static async getStudentDocuments(studentId: string): Promise<any[]> {
    return apiCallWithFailover(async (api) => {
      const response = await api.get(`/students/${studentId}/documents`);
      return response.data;
    });
  }

  // SOR (Student of Record)
  static async getSORRecords(studentId: string): Promise<SORRecord[]> {
    return apiCallWithFailover(async (api) => {
      const response = await api.get(`/students/${studentId}/records`);
      return response.data;
    });
  }

  static async getStudentResults(studentId: string): Promise<any> {
    return apiCallWithFailover(async (api) => {
      const response = await api.get(
        `/api/mobile/students/${studentId}/results`
      );
      return response.data;
    });
  }

  static async getStudentCompetencies(
    studentId: string
  ): Promise<CompetencyRecord[]> {
    return apiCallWithFailover(async (api) => {
      const response = await api.get(`/students/${studentId}/competencies`);
      return response.data;
    });
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

    return apiCallWithFailover(async (api) => {
      const response = await api.get(`/students/${studentId}/competencies`);

      console.log(`✅ API: Competencies response status:`, response.status);
      console.log(`📊 API: Response data structure:`, {
        success: response.data?.success,
        hasData: !!response.data?.data,
        dataKeys: response.data?.data ? Object.keys(response.data.data) : [],
        resultsCount: response.data?.data?.results?.length || 0,
      });

      return response.data;
    });
  }

  // WEL (Work Experience Learning)
  static async getWELLocations(): Promise<WELLocation[]> {
    return apiCallWithFailover(async (api) => {
      const response = await api.get("/wel/locations");
      return response.data;
    });
  }

  static async getWELPlacements(studentId: string): Promise<WELPlacement[]> {
    return apiCallWithFailover(async (api) => {
      const response = await api.get(`/students/${studentId}/wel/placements`);
      return response.data;
    });
  }

  static async getWELHours(studentId: string): Promise<any> {
    return apiCallWithFailover(async (api) => {
      const response = await api.get(`/students/${studentId}/wel/hours`);
      return response.data;
    });
  }

  static async applyForWELPlacement(
    studentId: string,
    locationId: string,
    startDate: string,
    endDate: string
  ): Promise<WELPlacement> {
    return apiCallWithFailover(async (api) => {
      const response = await api.post(`/students/${studentId}/wel/placements`, {
        locationId,
        startDate,
        endDate,
      });
      return response.data;
    });
  }

  // Announcements
  static async getAnnouncements(studentId: string): Promise<Announcement[]> {
    return apiCallWithFailover(async (api) => {
      const response = await api.get(`/students/${studentId}/announcements`);
      return response.data;
    });
  }

  static async markAnnouncementAsRead(announcementId: string): Promise<void> {
    return apiCallWithFailover(async (api) => {
      await api.put(`/announcements/${announcementId}/read`);
    });
  }
}

export default StudentAPI;
