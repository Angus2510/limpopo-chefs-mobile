/**
 * Test Push Notification Script
 *
 * This script sends a test push notification to a specific Expo push token.
 * Use this to verify that your phone can receive push notifications.
 *
 * Usage:
 *   node scripts/test-push-notification.js "ExponentPushToken[your-token-here]"
 *
 * Or with custom message:
 *   node scripts/test-push-notification.js "ExponentPushToken[...]" "Custom Title" "Custom Message"
 */

const https = require("https");

// Get push token from command line argument
const pushToken = process.argv[2];
const title = process.argv[3] || "🧪 Test Notification";
const message =
  process.argv[4] ||
  "This is a test push notification from your Limpopo Chefs app!";

if (!pushToken) {
  console.error("❌ Error: No push token provided");
  console.log("\n📖 Usage:");
  console.log(
    '  node scripts/test-push-notification.js "ExponentPushToken[your-token-here]"'
  );
  console.log("\nOr with custom message:");
  console.log(
    '  node scripts/test-push-notification.js "ExponentPushToken[...]" "Title" "Message"'
  );
  console.log(
    "\n💡 Tip: Get your push token from the app logs after logging in."
  );
  console.log('  Look for: "✅ Got push token: ExponentPushToken[...]"');
  process.exit(1);
}

if (!pushToken.startsWith("ExponentPushToken[")) {
  console.error("❌ Error: Invalid push token format");
  console.log('  Push token must start with "ExponentPushToken["');
  console.log("  Example: ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]");
  process.exit(1);
}

console.log("📱 Sending test push notification...");
console.log("  Token:", pushToken);
console.log("  Title:", title);
console.log("  Message:", message);
console.log("");

// Prepare notification payload
const payload = JSON.stringify({
  to: pushToken,
  sound: "default",
  title: title,
  body: message,
  data: {
    testNotification: true,
    timestamp: new Date().toISOString(),
  },
  priority: "high",
  channelId: "default",
});

// Send to Expo's Push API
const options = {
  hostname: "exp.host",
  port: 443,
  path: "/--/api/v2/push/send",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": payload.length,
  },
};

const req = https.request(options, (res) => {
  let responseData = "";

  res.on("data", (chunk) => {
    responseData += chunk;
  });

  res.on("end", () => {
    console.log("📤 Response from Expo Push API:");
    console.log("  Status:", res.statusCode);

    try {
      const response = JSON.parse(responseData);
      console.log("  Response:", JSON.stringify(response, null, 2));

      if (response.data && response.data[0]) {
        const result = response.data[0];
        if (result.status === "ok") {
          console.log("\n✅ SUCCESS! Notification sent successfully!");
          console.log("  Ticket ID:", result.id);
          console.log(
            "\n📱 Check your phone - you should see the notification!"
          );
          console.log('  - Look for a notification from "Limpopo Chefs"');
          console.log("  - It should have the title:", title);
          console.log("  - Swipe down to see it in your notification tray");
        } else {
          console.log("\n❌ FAILED! Notification was not sent");
          console.log("  Status:", result.status);
          console.log("  Message:", result.message);
          console.log("  Details:", JSON.stringify(result.details, null, 2));
        }
      }
    } catch (error) {
      console.error("❌ Error parsing response:", error.message);
      console.log("Raw response:", responseData);
    }
  });
});

req.on("error", (error) => {
  console.error("❌ Error sending notification:", error.message);
  console.log("\nPossible causes:");
  console.log("  1. No internet connection");
  console.log("  2. Invalid push token");
  console.log("  3. Expo Push API is down");
});

req.write(payload);
req.end();

// Show troubleshooting tips
console.log("\n💡 Troubleshooting Tips:");
console.log("  1. Make sure your phone has internet connection");
console.log("  2. Check that the app is installed (not Expo Go)");
console.log("  3. Verify notification permissions are granted");
console.log("  4. Make sure Do Not Disturb mode is off");
console.log("  5. Check notification settings for the app");
console.log("");
console.log("⏳ Waiting for response...\n");
