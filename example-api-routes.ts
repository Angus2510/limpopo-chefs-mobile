// Example API routes for your Next.js project
// Place these in your limpopochefs-next/pages/api/ directory

// File: pages/api/student/[studentId]/dashboard.ts
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { studentId } = req.query;

  if (req.method === "GET") {
    try {
      // Replace this with your actual database queries
      const dashboardData = {
        student: {
          id: studentId,
          name: "John Doe",
          email: "john.doe@example.com",
          studentNumber: "LCA2024001",
          course: "Culinary Arts",
          year: 2,
          profileImage: null,
        },
        upcomingAssignments: [
          {
            id: "1",
            title: "Basic Knife Skills Assessment",
            description: "Demonstrate proper knife handling techniques",
            dueDate: "2024-01-15T23:59:59Z",
            status: "pending",
          },
          {
            id: "2",
            title: "Food Safety Quiz",
            description: "Complete the HACCP food safety quiz",
            dueDate: "2024-01-20T23:59:59Z",
            status: "pending",
          },
        ],
        recentAttendance: [
          {
            id: "1",
            studentId: studentId as string,
            date: "2024-01-10",
            status: "present",
            timeIn: "08:00",
            location: "Main Kitchen",
          },
          {
            id: "2",
            studentId: studentId as string,
            date: "2024-01-09",
            status: "present",
            timeIn: "08:15",
            location: "Main Kitchen",
          },
        ],
        pendingFees: [
          {
            id: "1",
            description: "Course Materials Fee",
            amount: 500.0,
            dueDate: "2024-02-01",
            status: "unpaid",
          },
        ],
        announcements: [
          {
            id: "1",
            title: "Kitchen Renovation Update",
            content:
              "The main kitchen will be closed for renovations from Jan 15-17",
            date: "2024-01-08",
            priority: "high",
            read: false,
          },
        ],
      };

      res.status(200).json(dashboardData);
    } catch (error) {
      console.error("Dashboard API error:", error);
      res.status(500).json({ error: "Failed to fetch dashboard data" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

// File: pages/api/student/[studentId]/assignments.ts
export async function assignmentsHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { studentId } = req.query;

  if (req.method === "GET") {
    try {
      // Replace with actual database query
      const assignments = [
        {
          id: "1",
          title: "Basic Knife Skills Assessment",
          description:
            "Demonstrate proper knife handling techniques including julienne, brunoise, and chiffonade cuts",
          dueDate: "2024-01-15T23:59:59Z",
          status: "pending",
          attachments: [],
        },
        {
          id: "2",
          title: "Food Safety Quiz",
          description:
            "Complete the comprehensive HACCP food safety quiz covering all critical control points",
          dueDate: "2024-01-20T23:59:59Z",
          status: "pending",
          attachments: [],
        },
        {
          id: "3",
          title: "Menu Planning Exercise",
          description:
            "Create a 3-course menu for 50 guests with dietary restrictions consideration",
          dueDate: "2024-01-10T23:59:59Z",
          status: "graded",
          grade: 85,
          feedback:
            "Good work on the appetizer selection. The main course could use more seasoning variety.",
          attachments: ["menu_plan.pdf"],
        },
      ];

      res.status(200).json(assignments);
    } catch (error) {
      console.error("Assignments API error:", error);
      res.status(500).json({ error: "Failed to fetch assignments" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

// File: pages/api/attendance/scan.ts
export async function attendanceScanHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const { qrData, studentId, timestamp } = req.body;

      // Validate QR code data
      // This would contain location/class info encoded in the QR
      const locationData = JSON.parse(qrData); // Assuming QR contains JSON

      // Create attendance record
      const attendanceRecord = {
        id: Date.now().toString(),
        studentId,
        date: new Date(timestamp).toISOString().split("T")[0],
        status: "present",
        timeIn: new Date(timestamp).toTimeString().slice(0, 5),
        location: locationData.location || "Unknown",
      };

      // Save to database here
      // await saveAttendanceRecord(attendanceRecord);

      res.status(200).json(attendanceRecord);
    } catch (error) {
      console.error("Attendance scan error:", error);
      res
        .status(400)
        .json({ error: "Invalid QR code or failed to record attendance" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

// File: pages/api/student/[studentId]/fees.ts
export async function feesHandler(req: NextApiRequest, res: NextApiResponse) {
  const { studentId } = req.query;

  if (req.method === "GET") {
    try {
      const fees = [
        {
          id: "1",
          description: "Course Materials Fee",
          amount: 500.0,
          dueDate: "2024-02-01",
          status: "unpaid",
        },
        {
          id: "2",
          description: "Uniform Deposit",
          amount: 200.0,
          dueDate: "2024-01-15",
          status: "paid",
          paymentDate: "2024-01-10",
        },
        {
          id: "3",
          description: "Kitchen Equipment Fee",
          amount: 750.0,
          dueDate: "2024-03-01",
          status: "unpaid",
        },
      ];

      res.status(200).json(fees);
    } catch (error) {
      console.error("Fees API error:", error);
      res.status(500).json({ error: "Failed to fetch fees" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
