# Limpopo Chefs Academy Mobile App

A React Native mobile application for Limpopo Chefs Academy students, built with Expo and TypeScript.

## Features

The mobile app includes all the same features as your web student portal:

### 📱 Main Features

- **Dashboard** - Overview of assignments, attendance, and announcements
- **Assignments** - View, filter, and submit assignments
- **Attendance** - QR code scanning and attendance history
- **Fees** - View and pay outstanding fees
- **Downloads** - Access course materials and documents
- **Profile** - Manage student profile information
- **SOR (Student of Record)** - View competency records
- **WEL (Work Experience Learning)** - Browse and apply for placements

### 🛠 Technical Features

- Cross-platform (iOS & Android)
- Offline-ready architecture
- QR code scanning for attendance
- File download and management
- Push notifications (ready to implement)
- Modern UI with Material Design components

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- Expo CLI: `npm install -g expo-cli`
- For iOS: Xcode (Mac only)
- For Android: Android Studio

### Installation

1. **Install dependencies:**

   ```bash
   cd "c:\Users\angus\Desktop\Limpopo Chefs Acadamy\limpopo-chefs-mobile"
   npm install
   ```

2. **Configure API endpoint:**

   - Open `src/config/index.ts`
   - Update `BASE_URL` to point to your API server

   ```typescript
   export const API_CONFIG = {
     BASE_URL: "https://your-domain.com/api", // Change this
     TIMEOUT: 10000,
   };
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

## API Integration

### Setting up your Next.js API routes

Your mobile app will make the same API calls as your web app. You'll need to create or modify API routes in your Next.js project:

#### Required API Endpoints

```
GET /api/student/[studentId]/dashboard
GET /api/student/[studentId]/assignments
GET /api/assignments/[assignmentId]
POST /api/assignments/[assignmentId]/submit
GET /api/student/[studentId]/attendance
POST /api/attendance/scan
GET /api/student/[studentId]/fees
POST /api/fees/[feeId]/pay
GET /api/downloads
GET /api/downloads/[fileId]/download
GET /api/student/[studentId]/profile
PUT /api/student/[studentId]/profile
GET /api/student/[studentId]/sor
GET /api/wel/locations
GET /api/student/[studentId]/wel/placements
POST /api/wel/apply
GET /api/student/[studentId]/announcements
POST /api/announcements/[announcementId]/read
```

### Example API Route (Next.js)

Create these files in your Next.js project:

```typescript
// pages/api/student/[studentId]/dashboard.ts
import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { studentId } = req.query;

  if (req.method === "GET") {
    // Fetch dashboard data from your database
    const dashboardData = {
      student: {
        id: studentId,
        name: "Student Name",
        email: "student@example.com",
        studentNumber: "12345",
        course: "Culinary Arts",
        year: 2,
      },
      upcomingAssignments: [],
      recentAttendance: [],
      pendingFees: [],
      announcements: [],
    };

    res.status(200).json(dashboardData);
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
```

## Running the App

### Development

```bash
# Start Expo development server
npm start

# Run on iOS simulator (Mac only)
npm run ios

# Run on Android emulator
npm run android

# Run in web browser
npm run web
```

### Testing on Device

1. Install Expo Go app on your phone
2. Scan the QR code from the development server
3. The app will load on your device

## Building for Production

### iOS

```bash
# Build iOS app
expo build:ios
```

### Android

```bash
# Build Android APK
expo build:android
```

## Project Structure

```
src/
├── components/          # Reusable UI components
├── screens/            # Screen components
│   ├── DashboardScreen.tsx
│   ├── AssignmentsScreen.tsx
│   ├── AttendanceScreen.tsx
│   └── ...
├── navigation/         # Navigation configuration
├── services/           # API services and utilities
│   └── api.ts         # Main API service
├── types/             # TypeScript type definitions
│   └── index.ts       # All interface definitions
└── config/            # App configuration
    └── index.ts       # API URLs and app settings
```

## Key Components

### API Service (`src/services/api.ts`)

- Handles all HTTP requests to your backend
- Includes authentication token management
- Error handling and retry logic

### Type Definitions (`src/types/index.ts`)

- TypeScript interfaces for all data models
- Ensures type safety across the app

### Configuration (`src/config/index.ts`)

- Centralized app configuration
- Easy to change API endpoints
- Feature flags for enabling/disabling features

## Authentication

Currently, the app uses a placeholder student ID. To implement proper authentication:

1. Add authentication screens (Login/Register)
2. Implement secure token storage
3. Add authentication context/provider
4. Update API service to use real tokens

## Next Steps

1. **Set up your API endpoints** in your Next.js project
2. **Test the app** with real data from your database
3. **Customize the styling** to match your brand
4. **Add authentication** for security
5. **Implement push notifications** for announcements
6. **Add offline functionality** for better user experience
7. **Test on real devices** before deployment

## Troubleshooting

### Common Issues

1. **Metro bundler errors**: Clear cache with `expo start -c`
2. **API connection issues**: Check BASE_URL in config
3. **Permission errors**: Ensure camera permissions for QR scanning
4. **Build errors**: Check Expo SDK compatibility

### Support

For technical support with the mobile app:

- Check Expo documentation: https://docs.expo.dev/
- React Navigation docs: https://reactnavigation.org/
- React Native Paper: https://callstack.github.io/react-native-paper/

## License

This project is proprietary to Limpopo Chefs Academy.
