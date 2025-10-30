const axios = require("axios");

async function testDownloads() {
  try {
    console.log("🧪 Testing downloads endpoint...");

    const primaryUrl = "http://192.168.101.148:3000";
    console.log("📡 Testing primary server:", primaryUrl);

    // Use current user from Expo logs
    const studentId = "67b35b4e718c05163a247165";

    // First try to login to get a fresh token
    console.log("🔑 Getting fresh token...");
    const loginResponse = await axios.post(
      `${primaryUrl}/api/mobile/auth/login`,
      {
        identifier: "ANG123",
        password: "Gooseman12!",
      }
    );

    console.log("📊 Login response:", {
      status: loginResponse.status,
      fullResponse: loginResponse.data,
    });

    const token =
      loginResponse.data.token ||
      loginResponse.data.accessToken ||
      loginResponse.data.authToken;
    const actualStudentId = loginResponse.data.user?.id || studentId;
    console.log("✅ Got token:", !!token, "for user:", actualStudentId);

    if (!token) {
      console.error("❌ No token found in login response!");
      return;
    }

    console.log("📡 Testing primary server:", primaryUrl);

    const downloadUrl = `${primaryUrl}/api/mobile/students/${actualStudentId}/downloads`;
    console.log("🔗 Full URL:", downloadUrl);

    const response = await axios.get(downloadUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      timeout: 10000,
    });

    console.log("✅ Response Status:", response.status);
    console.log("📊 Response Data Structure:");
    console.log("- Type:", typeof response.data);
    console.log("- Is Array:", Array.isArray(response.data));

    if (response.data) {
      console.log("- Keys:", Object.keys(response.data));
    }

    let downloads = [];
    if (Array.isArray(response.data)) {
      downloads = response.data;
      console.log("📄 Format: Direct array");
    } else if (response.data && Array.isArray(response.data.data)) {
      downloads = response.data.data;
      console.log("📄 Format: Wrapped in data property");
    } else if (response.data && Array.isArray(response.data.downloads)) {
      downloads = response.data.downloads;
      console.log("📄 Format: Wrapped in downloads property");
    } else {
      console.log("📄 Unknown format, showing full response:");
      console.log(JSON.stringify(response.data, null, 2));
      return;
    }

    console.log("📁 Downloads found:", downloads.length);

    if (downloads.length > 0) {
      console.log("\n📄 First item structure:", Object.keys(downloads[0]));
      console.log("\n📄 First item sample:");
      console.log(JSON.stringify(downloads[0], null, 2));

      // Check what fields are available for download URLs
      const firstItem = downloads[0];
      console.log("\n🔍 Available fields for download URLs:");
      console.log("- id:", firstItem.id || "N/A");
      console.log("- fileKey:", firstItem.fileKey || "N/A");
      console.log("- documentUrl:", firstItem.documentUrl || "N/A");
      console.log("- fileUrl:", firstItem.fileUrl || "N/A");
      console.log("- filePath:", firstItem.filePath || "N/A");

      // Test generating download URLs
      console.log("\n🔗 Testing download URL generation:");

      if (firstItem.fileKey) {
        const directDownloadUrl = `${primaryUrl}/api/mobile/downloads/file?fileKey=${encodeURIComponent(
          firstItem.fileKey
        )}&fileName=${encodeURIComponent(
          firstItem.title || "download"
        )}&download=true`;
        console.log("✅ Direct download URL:", directDownloadUrl);
      }

      if (firstItem.id) {
        const idBasedUrl = `${primaryUrl}/api/mobile/downloads/${firstItem.id}/download`;
        console.log("✅ ID-based download URL:", idBasedUrl);
      }
    }
  } catch (error) {
    console.error("❌ Error testing downloads:", error.message);
    if (error.response) {
      console.error("📤 Response status:", error.response.status);
      console.error("📤 Response data:", error.response.data);
    }
  }
}

testDownloads();
