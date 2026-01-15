import { Alert } from "react-native";

export interface AttendanceMessageConfig {
  title: string;
  message: string;
  type: "success" | "info" | "error";
}

export const showAttendanceMessage = (
  config: AttendanceMessageConfig,
  onClose?: () => void
) => {
  const { title, message, type } = config;

  // For now using Alert, but this can be enhanced with custom toast/modal
  Alert.alert(
    title,
    message,
    [
      {
        text: "OK",
        onPress: onClose,
      },
    ],
    { cancelable: false }
  );

  // Log with appropriate emoji based on type
  const emoji = type === "success" ? "✅" : type === "info" ? "ℹ️" : "❌";
  console.log(`${emoji} ${title}: ${message}`);
};

export const createAttendanceMessage = (
  response: any
): AttendanceMessageConfig => {
  if (!response.success) {
    return {
      title: "Scan Failed",
      message: response.error || "Failed to mark attendance. Please try again.",
      type: "error",
    };
  }

  const { message, alreadyMarked } = response.data || {};

  if (alreadyMarked) {
    return {
      title: "Already Present",
      message:
        message || "You have already marked attendance for this session.",
      type: "info",
    };
  }

  return {
    title: "Attendance Marked",
    message: message || "Your attendance has been successfully recorded.",
    type: "success",
  };
};

// Future enhancement: Custom toast implementation
export const showAttendanceToast = (config: AttendanceMessageConfig) => {
  // This could be implemented with libraries like react-native-toast-message
  // or a custom toast component for better UX

  const colors = {
    success: { background: "#4CAF50", icon: "✓" },
    info: { background: "#D1ffbd", icon: "ℹ" },
    error: { background: "#F44336", icon: "✗" },
  };

  // For now, fall back to Alert
  showAttendanceMessage(config);
};
