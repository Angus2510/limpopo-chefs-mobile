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
    endDate?: string,
    year?: number
  ): Promise<AttendanceRecord[]> {
    return apiCallWithFailover(async (api) => {
      let url = `/students/${studentId}/attendance`;
      const params = new URLSearchParams();

      if (startDate && endDate) {
        params.append("startDate", startDate);
        params.append("endDate", endDate);
      }

      if (year) {
        params.append("year", year.toString());
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      console.log("📅 Fetching attendance records from:", url);
      const response = await api.get(url);

      // Handle the server response format
      if (response.data.success && response.data.data) {
        console.log("✅ Attendance data received:", {
          totalRecords: response.data.data.totalRecords,
          year: response.data.data.year,
          hasWelRecords: response.data.data.welRecords?.length > 0,
        });
        return response.data.data.attendance;
      } else {
        throw new Error(
          response.data.error || "Failed to fetch attendance records"
        );
      }
    });
  }

  // New method to get detailed attendance data with WEL records
  static async getAttendanceWithWEL(
    studentId: string,
    year?: number
  ): Promise<{
    attendance: AttendanceRecord[];
    welRecords: any[];
    totalRecords: number;
    year: number;
  }> {
    return apiCallWithFailover(async (api) => {
      let url = `/students/${studentId}/attendance`;
      if (year) {
        url += `?year=${year}`;
      }

      console.log("📅 API: Starting attendance fetch", {
        studentId,
        year,
        fullUrl: url,
        baseURL: api.defaults.baseURL,
      });

      try {
        const response = await api.get(url);

        console.log("🔍 API: Raw response received", {
          status: response.status,
          statusText: response.statusText,
          responseData: response.data,
          headers: response.headers,
        });

        if (response.data.success && response.data.data) {
          console.log("✅ API: Attendance fetch successful", {
            attendanceCount: response.data.data.attendance?.length,
            welCount: response.data.data.welRecords?.length,
            totalRecords: response.data.data.totalRecords,
            year: response.data.data.year,
          });

          return {
            attendance: response.data.data.attendance,
            welRecords: response.data.data.welRecords || [],
            totalRecords: response.data.data.totalRecords,
            year: response.data.data.year,
          };
        } else {
          console.error("❌ API: Server returned success=false", {
            responseData: response.data,
            success: response.data.success,
            data: response.data.data,
            error: response.data.error,
          });
          throw new Error(
            response.data.error || "Failed to fetch attendance records"
          );
        }
      } catch (error: any) {
        console.error("💥 API: Attendance fetch failed", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          statusText: error.response?.statusText,
          url: url,
        });
        throw error;
      }
    });
  }

  static async scanAttendance(
    qrCodeData: string,
    studentId: string
  ): Promise<any> {
    return apiCallWithFailover(async (api) => {
      // Parse the QR code data (assuming it's JSON string)
      let parsedQrData;
      try {
        parsedQrData =
          typeof qrCodeData === "string" ? JSON.parse(qrCodeData) : qrCodeData;
      } catch (error) {
        throw new Error("Invalid QR code format");
      }

      // Format the request to match server expectations
      const requestData = {
        qrData: {
          campusId: parsedQrData.campusId,
          campusTitle: parsedQrData.campusTitle,
          intakeGroups: parsedQrData.intakeGroups || [],
          outcome: {
            id: parsedQrData.outcome?.id || parsedQrData.outcomeId,
            title: parsedQrData.outcome?.title || parsedQrData.outcomeTitle,
          },
          date: parsedQrData.date,
          timestamp: parsedQrData.timestamp,
        },
        studentId,
        timestamp: new Date().toISOString(),
        location: parsedQrData.location || undefined,
      };

      console.log("📤 Sending attendance scan request:", requestData);
      const response = await api.post("/attendance/scan", requestData);

      // Enhanced response handling for new API format
      console.log("📥 Attendance scan response:", response.data);

      if (response.data.success && response.data.data) {
        const { message, alreadyMarked, campus, outcome, date } =
          response.data.data;

        console.log("✅ Attendance scan successful:", {
          message,
          alreadyMarked: alreadyMarked || false,
          campus,
          outcome,
          date,
        });

        // Return enhanced response with attendance status
        return {
          success: true,
          data: {
            message,
            alreadyMarked: alreadyMarked || false,
            campus,
            outcome,
            date,
            isNewAttendance: !alreadyMarked,
          },
        };
      }

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

      console.log("📁 Downloads API response:", {
        status: response.status,
        hasData: !!response.data,
        dataType: typeof response.data,
        isArray: Array.isArray(response.data),
        dataKeys: response.data ? Object.keys(response.data) : [],
      });

      let rawDownloads: any[] = [];

      // Handle different response formats
      if (Array.isArray(response.data)) {
        rawDownloads = response.data;
      } else if (response.data && Array.isArray(response.data.downloads)) {
        rawDownloads = response.data.downloads;
      } else if (response.data && Array.isArray(response.data.data)) {
        rawDownloads = response.data.data;
      } else {
        console.warn(
          "⚠️ Unexpected downloads response format, returning empty array"
        );
        return [];
      }

      // Transform server data to match mobile app format
      const transformedDownloads: DownloadItem[] = rawDownloads.map(
        (item: any) => {
          // Extract file type from title or documentUrl
          const fileName = item.title || item.documentUrl || "";
          const fileExtension =
            fileName.split(".").pop()?.toLowerCase() || "unknown";

          return {
            id: item.id || "",
            title: item.title || "Untitled Document",
            description: item.description || "",
            fileUrl: item.downloadUrl || item.documentUrl || item.fileUrl || "", // Use server's downloadUrl first
            fileType: fileExtension,
            uploadDate:
              item.uploadDate || item.createdAt || new Date().toISOString(),
            category: item.category || "Learning Materials",
            fileKey: item.fileKey || item.filePath || item.documentUrl || "",
          };
        }
      );

      console.log("📁 Transformed downloads:", {
        count: transformedDownloads.length,
        sampleItem: transformedDownloads[0]
          ? Object.keys(transformedDownloads[0])
          : null,
      });

      return transformedDownloads;
    });
  }

  // Direct download method using /download endpoint
  static async downloadFile(
    downloadId: string,
    fileName?: string
  ): Promise<string> {
    return apiCallWithFailover(async (api) => {
      console.log(
        "📁 Generating direct download URL for:",
        downloadId,
        fileName
      );

      // Try to get a signed download URL first
      try {
        const response = await api.get(
          `/downloads/${downloadId}/url?download=true`
        );
        if (response.data.signedUrl) {
          console.log("✅ Got signed download URL from server");
          return response.data.signedUrl;
        }
      } catch (error) {
        console.log(
          "⚠️ Signed download URL not available, using direct download URL"
        );
      }

      // Fallback: Return direct download URL with download parameter
      const downloadUrl = `${api.defaults.baseURL}/downloads/${downloadId}/download`;
      console.log("✅ Generated direct download URL:", downloadUrl);
      return downloadUrl;
    });
  }

  // New download method using /file endpoint with fileKey and fileName for direct downloads
  static async downloadFileWithKey(
    fileKey: string,
    fileName?: string
  ): Promise<string> {
    return apiCallWithFailover(async (api) => {
      console.log("� Creating direct download with fileKey:", {
        fileKey,
        fileName,
      });

      // Return direct URL with fileKey and download parameter to force download instead of view
      const downloadUrl = `${
        api.defaults.baseURL
      }/downloads/file?fileKey=${encodeURIComponent(
        fileKey
      )}&fileName=${encodeURIComponent(fileName || "download")}&download=true`;
      console.log("✅ Generated direct download URL:", downloadUrl);
      return downloadUrl;
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
      const response = await api.get(`/students/${studentId}/results`);
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
