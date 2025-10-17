# Limpopo Chefs Academy - API Endpoints Implementation Guide

## Current Status: ❌ NOT IMPLEMENTED YET

**All endpoints below need to be created in your backend/Next.js API routes.**

---

## 🔐 **Authentication Endpoints** (Priority 1)

### POST `/app/api/mobile/auth/login`

**Request:**

```json
{
  "email": "student@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "token": "jwt_token_here",
  "refreshToken": "refresh_token_here",
  "user": {
    "id": "student_id",
    "email": "student@example.com",
    "name": "John Doe",
    "studentNumber": "LCA2024001",
    "role": "student"
  }
}
```

### POST `/app/api/mobile/auth/logout`

**Headers:** `Authorization: Bearer {token}`
**Response:** `{ "message": "Logged out successfully" }`

### POST `/app/api/mobile/auth/refresh`

**Request:**

```json
{
  "refreshToken": "refresh_token_here"
}
```

**Response:**

```json
{
  "token": "new_jwt_token",
  "refreshToken": "new_refresh_token"
}
```

### GET `/app/api/mobile/auth/me`

**Headers:** `Authorization: Bearer {token}`
**Response:**

```json
{
  "id": "student_id",
  "email": "student@example.com",
  "name": "John Doe",
  "studentNumber": "LCA2024001",
  "role": "student"
}
```

---

## 📊 **Dashboard Endpoint** (Priority 2)

### GET `/app/api/mobile/students/{studentId}/dashboard`

**Headers:** `Authorization: Bearer {token}`
**Response:**

```json
{
  "student": {
    "id": "student_id",
    "name": "John Doe",
    "email": "john@example.com",
    "studentNumber": "LCA2024001",
    "course": "Culinary Arts",
    "year": 2
  },
  "upcomingEvents": [
    {
      "id": "1",
      "title": "Basic Knife Skills Lecture",
      "startDate": "2025-10-15",
      "startTime": "09:00",
      "endTime": "10:30",
      "lecturer": "Chef Johnson",
      "venue": "Kitchen Lab A",
      "campus": "Main Campus",
      "color": "lecture",
      "assignedToModel": ["2025 Intake"]
    }
  ],
  "recentAttendance": [
    {
      "id": "1",
      "studentId": "student_id",
      "date": "2025-10-06",
      "status": "present",
      "timeIn": "08:00",
      "location": "Main Kitchen"
    }
  ],
  "pendingFees": [
    {
      "id": "1",
      "description": "Course Materials Fee",
      "amount": 500.0,
      "dueDate": "2025-11-01",
      "status": "unpaid"
    }
  ],
  "announcements": [
    {
      "id": "1",
      "title": "Kitchen Renovation Update",
      "content": "The main kitchen will be closed...",
      "date": "2025-10-06",
      "priority": "high",
      "read": false
    }
  ]
}
```

---

## 📅 **Events/Calendar Endpoints** (Priority 3)

### GET `/app/api/mobile/students/{studentId}/events`

**Query Params:** `?startDate=2025-10-01&endDate=2025-10-07`
**Headers:** `Authorization: Bearer {token}`
**Response:**

```json
[
  {
    "id": "1",
    "title": "Basic Knife Skills Lecture",
    "startDate": "2025-10-15",
    "startTime": "09:00",
    "endTime": "10:30",
    "details": "Introduction to knife handling techniques",
    "lecturer": "Chef Johnson",
    "venue": "Kitchen Lab A",
    "campus": "Main Campus",
    "color": "lecture",
    "assignedToModel": ["2025 Intake"]
  }
]
```

---

## ✅ **Attendance Endpoints** (Priority 4)

### GET `/app/api/mobile/students/{studentId}/attendance`

**Query Params:** `?startDate=2025-10-01&endDate=2025-10-07`
**Headers:** `Authorization: Bearer {token}`
**Response:**

```json
[
  {
    "id": "1",
    "studentId": "student_id",
    "date": "2025-10-06",
    "status": "present",
    "timeIn": "08:00",
    "timeOut": "17:00",
    "location": "Main Kitchen"
  }
]
```

### POST `/app/api/mobile/attendance/scan`

**Headers:** `Authorization: Bearer {token}`
**Request:**

```json
{
  "qrData": "encoded_location_data",
  "studentId": "student_id",
  "timestamp": "2025-10-06T08:00:00Z"
}
```

**Response:**

```json
{
  "id": "new_attendance_id",
  "studentId": "student_id",
  "date": "2025-10-06",
  "status": "present",
  "timeIn": "08:00",
  "location": "Main Kitchen"
}
```

---

## 💰 **Fees Endpoints** (Priority 5)

### GET `/app/api/mobile/students/{studentId}/fees/payable`

**Headers:** `Authorization: Bearer {token}`
**Response:**

```json
[
  {
    "id": "1",
    "description": "Course Materials Fee",
    "amount": 500,
    "dueDate": "2025-11-01"
  }
]
```

### GET `/app/api/mobile/students/{studentId}/fees/transactions`

**Headers:** `Authorization: Bearer {token}`
**Response:**

```json
[
  {
    "id": "1",
    "description": "Initial Payment",
    "transactionDate": "2025-09-01",
    "debit": 0,
    "credit": 1000,
    "calculatedBalance": 1000
  }
]
```

### GET `/app/api/mobile/students/{studentId}/fees/balance`

**Headers:** `Authorization: Bearer {token}`
**Response:**

```json
{
  "currentBalance": 500,
  "totalOwed": 1500,
  "totalPaid": 1000
}
```

---

## 👤 **Student Profile Endpoints** (Priority 6)

### GET `/app/api/mobile/students/{studentId}`

**Headers:** `Authorization: Bearer {token}`
**Response:**

```json
{
  "id": "student_id",
  "name": "John Doe",
  "email": "john@example.com",
  "studentNumber": "LCA2024001",
  "course": "Culinary Arts",
  "year": 2,
  "phone": "+1234567890",
  "dateOfBirth": "2000-01-01",
  "address": {
    "street": "123 Main St",
    "city": "Pretoria",
    "state": "Gauteng",
    "zipCode": "0001"
  },
  "guardian": {
    "name": "Jane Doe",
    "phone": "+0987654321",
    "email": "jane@example.com",
    "relationship": "Mother"
  }
}
```

### PUT `/app/api/mobile/students/{studentId}`

**Headers:** `Authorization: Bearer {token}`
**Request:** Same structure as GET response
**Response:** Updated student object

---

## 📋 **Student Records (SOR) Endpoints** (Priority 7)

### GET `/app/api/mobile/students/{studentId}/results`

**Headers:** `Authorization: Bearer {token}`
**Response:**

```json
[
  {
    "subject": "Introduction to the Hospitality Industry",
    "result": "85%",
    "status": "C"
  }
]
```

### GET `/app/api/mobile/students/{studentId}/competencies`

**Headers:** `Authorization: Bearer {token}`
**Response:**

```json
[
  {
    "id": "1",
    "studentId": "student_id",
    "competencyTitle": "Basic Knife Skills",
    "status": "achieved",
    "assessmentDate": "2025-09-15",
    "assessor": "Chef Johnson"
  }
]
```

---

## 💼 **Work Experience (WEL) Endpoints** (Priority 8)

### GET `/app/api/mobile/students/{studentId}/wel/placements`

**Headers:** `Authorization: Bearer {token}`
**Response:**

```json
[
  {
    "id": "1",
    "startDate": "2025-01-01",
    "endDate": "2025-03-01",
    "totalHours": 200,
    "establishmentName": "Fine Dining Restaurant",
    "establishmentContact": "Chef Manager",
    "evaluated": true
  }
]
```

### GET `/app/api/mobile/wel/locations`

**Headers:** `Authorization: Bearer {token}`
**Response:**

```json
[
  {
    "id": "1",
    "name": "Fine Dining Restaurant",
    "address": "123 Restaurant St",
    "contactPerson": "Chef Manager",
    "contactEmail": "chef@restaurant.com",
    "contactPhone": "+1234567890",
    "availableSlots": 5
  }
]
```

---

## 📥 **Downloads Endpoints** (Priority 9)

### GET `/app/api/mobile/students/{studentId}/downloads`

**Headers:** `Authorization: Bearer {token}`
**Response:**

```json
[
  {
    "id": "1",
    "title": "Course Handbook",
    "description": "Student handbook for Culinary Arts",
    "fileUrl": "/downloads/handbook.pdf",
    "fileType": "PDF",
    "uploadDate": "2025-09-01",
    "category": "Documents"
  }
]
```

### GET `/app/api/mobile/downloads/{downloadId}/file`

**Headers:** `Authorization: Bearer {token}`
**Response:**

```json
{
  "downloadUrl": "https://yourdomain.com/files/handbook.pdf"
}
```

---

## 📢 **Announcements Endpoints** (Priority 10)

### GET `/app/api/mobile/students/{studentId}/announcements`

**Headers:** `Authorization: Bearer {token}`
**Response:**

```json
[
  {
    "id": "1",
    "title": "Kitchen Renovation Update",
    "content": "The main kitchen will be closed for renovations...",
    "date": "2025-10-06",
    "priority": "high",
    "read": false
  }
]
```

### PUT `/app/api/mobile/announcements/{announcementId}/read`

**Headers:** `Authorization: Bearer {token}`
**Response:**

```json
{
  "id": "1",
  "read": true
}
```

---

## 🔧 **Implementation Next Steps**

1. **Install AsyncStorage** ✅ (Done)
2. **Set up authentication system** ✅ (Done)
3. **Create API endpoints** ❌ (Need to implement in backend)
4. **Test authentication flow** ❌ (After backend implementation)
5. **Replace mock data with real API calls** ❌ (After backend implementation)

## 🏗️ **Backend Implementation Required**

You need to create these API routes in your Next.js application under:

```
/app/api/mobile/auth/login/route.ts
/app/api/mobile/auth/logout/route.ts
/app/api/mobile/auth/refresh/route.ts
/app/api/mobile/auth/me/route.ts
/app/api/mobile/students/[studentId]/dashboard/route.ts
... and so on for all endpoints
```

## 🔐 **Security Requirements**

- JWT token authentication for all protected endpoints
- Input validation on all requests
- Rate limiting on authentication endpoints
- HTTPS only in production
- Proper error handling and logging
