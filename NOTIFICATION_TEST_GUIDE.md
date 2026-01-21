# 🔔 Push Notification Test Guide

## Step 1: Check Your Logs

After opening the app and logging in, check for these specific logs:

### ✅ What You SHOULD See:

```
📱 Current notification permission status: granted
✅ Notification permissions granted
✅ Android notification channel created successfully
📱 Setting up push notifications for student: [YOUR_ID]
✅ Got push token: ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]
📤 Sending push token to backend for student: [YOUR_ID]
✅ Push token registered successfully
✅ Push notifications setup complete
```

### ❌ What Indicates a Problem:

```
❌ Failed to get push token - permission not granted!
❌ Must use physical device for Push Notifications
❌ Error creating notification channel: ...
❌ Error getting push token: ...
```

---

## Step 2: Test Notification Manually

### Option A: Use Expo's Notification Tool (Recommended)

1. **Get your push token from the logs** - Look for:

   ```
   ✅ Got push token: ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]
   ```

   Copy the ENTIRE token including `ExponentPushToken[...]`

2. **Visit Expo's Test Tool:**
   https://expo.dev/notifications

3. **Enter Details:**

   - Paste your token in the "Expo Push Token" field
   - Title: "Test Notification"
   - Message: "Testing notifications for Limpopo Chefs"
   - Click "Send a Notification"

4. **Expected Result:**
   - You should see notification banner on your phone immediately
   - Phone should vibrate
   - Sound should play
   - App icon should show badge

### Option B: Use the Test Script

1. Get your push token from logs (see above)

2. Run the test script:

   ```bash
   node scripts/test-push-notification.js "ExponentPushToken[your-token-here]"
   ```

3. Check your phone for the notification

---

## Step 3: Check Phone Settings

If you got a push token but still no notifications appear:

### Android Settings:

1. Go to **Settings** > **Apps** > **LCA Portal**
2. Tap **Notifications**
3. Verify:
   - [ ] Notifications are ENABLED
   - [ ] "Limpopo Chefs Academy" channel is enabled
   - [ ] Show on lock screen is enabled
   - [ ] Sound is enabled
   - [ ] Vibration is enabled
   - [ ] Badge is enabled

### Also Check:

- [ ] Phone is not in Do Not Disturb mode
- [ ] Notification volume is not muted
- [ ] Battery optimization is not blocking notifications

---

## Step 4: Verify Badge Count

Even if system notifications don't show, the badge should still work:

1. Open the app
2. Go to Notifications screen
3. Check if there are any unread notifications
4. Close the app completely
5. Look at the app icon - should have a red badge with a number

---

## Common Issues & Solutions

### Issue: "Permission not granted" in logs

**Solution:**

1. Uninstall the app completely
2. Reinstall the APK
3. When prompted for notification permission, tap "Allow"

### Issue: Got push token but no notifications appear

**Solution:**

1. Check phone notification settings (see Step 3)
2. Make sure app is not in background restriction mode
3. Test with Expo's tool to isolate if it's an app or backend issue

### Issue: No push token in logs

**Solution:**

1. Make sure you're using a physical device (not emulator)
2. Check internet connection
3. Check logs for specific error messages

### Issue: Badge count not showing

**Solution:**

1. Check if your launcher supports badges (some launchers don't)
2. Long-press app icon > App info > Notifications > Enable "Badge"

---

## What to Report Back

Please tell me:

1. ✅ or ❌ Did you see "✅ Got push token: ExponentPushToken[...]" in logs?
2. If yes, copy that token
3. ✅ or ❌ Did Expo's test tool work when you sent a test notification?
4. ✅ or ❌ Are notifications enabled in phone settings for the app?
5. Any specific error messages from the logs?

This will help me identify exactly where the problem is!
