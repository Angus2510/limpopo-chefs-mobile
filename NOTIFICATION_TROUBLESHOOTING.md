# 🔔 Push Notification Troubleshooting Guide

## Issue: Notifications Not Showing Up

### Understanding The System

Your app has **TWO DIFFERENT notification systems**:

1. **📱 Push Notifications** - Real-time notifications from the backend (what you're asking about)
2. **🔔 In-App Notification Badge** - Shows unread count in the app (this is working)

### Current Status

✅ **What's Working:**

- App stays logged in after closing
- Notification badge system is configured
- Push token registration is set up
- Push notification permissions are requested

❌ **What's NOT Working:**

- No actual push notifications appearing on phone
- No notification sound/vibration
- No notification banner on device

---

## 🔍 Root Cause Analysis

### Problem 1: Backend Needs to Send Notifications

**The app is ready to receive notifications, but the backend needs to actually send them!**

Your app successfully:

1. ✅ Registers push token with backend: `POST /students/{studentId}/push-token`
2. ✅ Stores the token on the backend
3. ❌ **BUT** Backend needs to actually SEND push notifications using Expo's service

### Problem 2: Backend Endpoint May Not Be Implemented

Check if this endpoint exists and actually sends push notifications:

```
POST /students/{studentId}/push-token
```

The backend needs to:

1. Store the push token
2. Use Expo's Push Notification API to send notifications
3. Send to the stored token when events happen (new announcement, fee due, etc.)

---

## 🧪 How To Test Push Notifications

### Step 1: Verify Push Token Registration

1. Login to the app
2. Check logs for:
   ```
   ✅ Got push token: ExponentPushToken[...]
   ✅ Push token registered: ExponentPushToken[...]
   ```
3. **Copy this token** - you'll need it for testing

### Step 2: Test With Expo's Push Notification Tool

Visit: https://expo.dev/notifications

1. Paste your `ExponentPushToken[...]`
2. Set Title: "Test Notification"
3. Set Message: "Testing push notifications"
4. Click "Send a Notification"
5. ✅ **Expected:** Notification appears on your phone immediately

**If this works:** Your app is correctly configured, backend just needs to send notifications

**If this doesn't work:** There's a configuration issue

### Step 3: Check Backend Implementation

The backend needs code like this to send notifications:

```javascript
// Backend example (Node.js)
const { Expo } = require("expo-server-sdk");
const expo = new Expo();

async function sendPushNotification(pushToken, title, message) {
  const messages = [
    {
      to: pushToken,
      sound: "default",
      title: title,
      body: message,
      data: {
        notificationId: "some-id",
        type: "announcement",
      },
    },
  ];

  const chunks = expo.chunkPushNotifications(messages);
  for (let chunk of chunks) {
    await expo.sendPushNotificationsAsync(chunk);
  }
}
```

---

## 🛠️ Testing Checklist

### On Your Phone (Android)

- [ ] App has notification permission granted
  - Go to: Settings > Apps > Limpopo Chefs > Notifications > Enabled
- [ ] Phone is not in Do Not Disturb mode
- [ ] Notification volume is not muted
- [ ] App is installed from EAS build (not Expo Go)

### In The App

- [ ] You're logged in with valid credentials
- [ ] Console shows: "✅ Push token registered: ExponentPushToken[...]"
- [ ] Console shows: "📱 Setting up push notifications for student: [ID]"
- [ ] No errors in console about push notifications

### Backend Requirements

- [ ] Endpoint `/students/{studentId}/push-token` exists
- [ ] Backend stores push token in database
- [ ] Backend has `expo-server-sdk` installed
- [ ] Backend sends notifications when events occur

---

## 🚀 Quick Fix: Manual Notification Test

I'll create a test script that you can run to send yourself a test notification:

### Test Script Location

See: `scripts/test-push-notification.js`

### How To Use It:

1. Get your push token from app logs
2. Run: `node scripts/test-push-notification.js "ExponentPushToken[your-token-here]"`
3. Check if notification appears on phone

---

## 📊 Expected Console Logs

### When App Starts:

```
👤 User logged in, setting up push notifications for: [student-id]
📱 Setting up push notifications for student: [student-id]
✅ Got push token: ExponentPushToken[xxxxxx]
📤 Sending push token to backend for student: [student-id]
✅ Push token registered successfully
✅ Push notifications setup complete
```

### When Notification Received:

```
🔔 Notification received while app active: {notification details}
🔢 Refreshing unread notification count...
🔢 Unread notifications count: 1
```

### When Notification Tapped:

```
🔔 Notification tapped: {response details}
```

---

## 🔧 Common Issues & Solutions

### Issue: "Must use physical device for Push Notifications"

**Solution:** You're using Expo Go or emulator. Install the EAS build APK on a real phone.

### Issue: "Failed to get push token"

**Solution:** Check notification permissions in phone settings.

### Issue: "❌ No project ID found"

**Solution:** Check `app.json` has correct `extra.eas.projectId`.

### Issue: Token registered but no notifications arrive

**Solution:** Backend is not sending notifications. Use Expo's web tool to test.

### Issue: "Push token registration endpoint not available yet"

**Solution:** Backend endpoint doesn't exist or returns 404.

---

## 🎯 Next Steps

1. **Verify push token is being registered** (check logs)
2. **Test with Expo's notification tool** (https://expo.dev/notifications)
3. **If Expo tool works:** Backend needs to implement notification sending
4. **If Expo tool fails:** Check permissions and app configuration

---

## 📞 Backend Requirements Summary

For push notifications to work, your backend must:

1. ✅ Accept push tokens via `POST /students/{studentId}/push-token`
2. ❌ **MISSING:** Install `expo-server-sdk` package
3. ❌ **MISSING:** Send push notifications when events occur:
   - New announcements
   - Fee deadlines approaching
   - Attendance marked
   - WEL placement updates
   - etc.

### Backend Package Installation:

```bash
npm install expo-server-sdk
```

### Events That Should Trigger Notifications:

- 📢 New announcement posted
- 💰 Fee payment due soon
- ✅ Attendance marked successfully
- 📋 New grade available
- 💼 WEL placement assigned
- 📥 New download available

---

## ✅ Summary

**Your App:** ✅ Ready to receive notifications
**Your Backend:** ❌ Not sending notifications yet

The app is correctly configured. The issue is that the backend needs to actively send push notifications to your registered token.
