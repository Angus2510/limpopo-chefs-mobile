import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Image,
  ScrollView,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Portrait card — CR80 ratio inverted (width < height)
const CARD_WIDTH = SCREEN_WIDTH - 64;
const CARD_HEIGHT = CARD_WIDTH * 1.586;

export default function StudentCardScreen() {
  const [isFlipped, setIsFlipped] = useState(false);
  const flipAnim = useRef(new Animated.Value(0)).current;

  const { user, studentProfile } = useAuth();

  // ---------------------------------------------------------------------------
  // Extract student data from the layered AuthContext shape
  // ---------------------------------------------------------------------------
  const rawProfile = studentProfile;
  const studentData =
    rawProfile?.data?.student || rawProfile?.student || rawProfile;

  // Schema: students.profile.firstName / lastName
  const firstName =
    studentData?.profile?.firstName ||
    studentData?.firstName ||
    user?.firstName ||
    "";
  const lastName =
    studentData?.profile?.lastName ||
    studentData?.lastName ||
    user?.lastName ||
    "";
  const fullName = `${firstName} ${lastName}`.trim() || "Student";

  // Schema: students.admissionNumber
  const studentNumber =
    studentData?.admissionNumber ||
    studentData?.username ||
    user?.studentNumber ||
    "";

  const campus = studentData?.campusTitle || studentData?.campus || "";
  const intakeGroup =
    studentData?.intakeGroupTitle || studentData?.intakeGroup || "";

  // Schema: students.avatarUrl (top-level) or students.profile.avatar
  const profileImage =
    studentData?.avatarUrl || studentData?.profile?.avatar || null;

  // Schema: students.profile.idNumber
  const idNumber = studentData?.profile?.idNumber || "";

  // Schema: students.profile.cityAndGuildNumber
  const cityAndGuildNumber = studentData?.profile?.cityAndGuildNumber || "";

  // Schema: students.profile.admissionDate — derive "Valid Until" as 1 year after admission
  const deriveValidUntil = (admissionDateStr: string): string => {
    if (!admissionDateStr) return "";
    try {
      const admission = new Date(admissionDateStr);
      if (isNaN(admission.getTime())) return "";
      const validUntil = new Date(admission);
      validUntil.setFullYear(validUntil.getFullYear() + 1);
      return validUntil.toLocaleDateString("en-ZA", {
        month: "long",
        year: "numeric",
      });
    } catch {
      return "";
    }
  };

  const validUntilFormatted = deriveValidUntil(
    studentData?.profile?.admissionDate || "",
  );

  const PHOTO_SIZE = CARD_WIDTH * 0.38;

  // ---------------------------------------------------------------------------
  // Flip animation
  // ---------------------------------------------------------------------------
  const handleFlip = () => {
    Animated.spring(flipAnim, {
      toValue: isFlipped ? 0 : 1,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
    setIsFlipped((prev) => !prev);
  };

  const frontRotation = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const backRotation = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["180deg", "360deg"],
  });

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={styles.pageTitle}>Digital Student Card</Text>
      <Text style={styles.pageSubtitle}>Tap the card to flip it over</Text>

      {/* Card wrapper – positions front and back on top of each other */}
      <TouchableOpacity
        onPress={handleFlip}
        activeOpacity={0.95}
        style={[styles.cardWrapper, { width: CARD_WIDTH, height: CARD_HEIGHT }]}
      >
        {/* ================================================================
            FRONT
        ================================================================ */}
        <Animated.View
          style={[
            styles.card,
            styles.cardFront,
            { width: CARD_WIDTH, height: CARD_HEIGHT },
            { transform: [{ rotateY: frontRotation }] },
          ]}
        >
          {/* Top stripe bar */}
          <View style={styles.topStripeBar}>
            <View style={styles.topStripeLeft} />
            <View style={styles.topStripeGap} />
            <View style={styles.topStripeRight} />
          </View>

          {/* School branding */}
          <View style={styles.brandingRow}>
            <Image
              source={require("../assets/images/logo.png")}
              style={styles.schoolLogo}
              resizeMode="contain"
            />
            <Text style={styles.schoolNameText}>Limpopo Chefs Academy</Text>
          </View>

          {/* Photo */}
          <View
            style={[
              styles.photoWrapper,
              {
                width: PHOTO_SIZE,
                height: PHOTO_SIZE,
                borderRadius: PHOTO_SIZE / 2,
              },
            ]}
          >
            {profileImage ? (
              <Image
                source={{ uri: profileImage }}
                style={styles.photo}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Ionicons name="person" size={PHOTO_SIZE * 0.45} color="#bbb" />
              </View>
            )}
          </View>

          {/* Student name */}
          <Text style={styles.studentName} numberOfLines={2}>
            {fullName}
          </Text>

          {/* Divider */}
          <View style={styles.nameDivider} />

          {/* Detail rows */}
          <View style={styles.detailsGrid}>
            {idNumber ? <DetailRow label="ID Number" value={idNumber} /> : null}
            <DetailRow label="Student Number" value={studentNumber} />
            {cityAndGuildNumber ? (
              <DetailRow label="City & Guilds No." value={cityAndGuildNumber} />
            ) : null}
            {validUntilFormatted ? (
              <DetailRow label="Valid Until" value={validUntilFormatted} />
            ) : null}
            {campus ? <DetailRow label="Campus" value={campus} /> : null}
            {intakeGroup ? (
              <DetailRow label="Intake" value={intakeGroup} />
            ) : null}
          </View>

          {/* Bottom stripe bar */}
          <View style={styles.bottomStripeBar}>
            <View style={styles.topStripeLeft} />
            <View style={styles.topStripeGap} />
            <View style={styles.topStripeRight} />
          </View>
        </Animated.View>

        {/* ================================================================
            BACK
        ================================================================ */}
        <Animated.View
          style={[
            styles.card,
            styles.cardBack,
            { width: CARD_WIDTH, height: CARD_HEIGHT },
            { transform: [{ rotateY: backRotation }] },
          ]}
        >
          {/* Top bar */}
          <View style={styles.backTopBar}>
            <Text style={styles.backTopBarText}>STUDENT CARD</Text>
          </View>

          {/* Back centre content */}
          <View style={styles.backContent}>
            <Image
              source={require("../assets/images/logo.png")}
              style={styles.backLogo}
              resizeMode="contain"
            />
            <Text style={styles.backSchoolNameLarge}>
              Limpopo Chefs Academy
            </Text>
            <View style={styles.backDivider} />
            <View style={styles.backContactBlock}>
              <Ionicons name="globe-outline" size={14} color="#555" />
              <Text style={styles.backContactLine}>www.limpopochefs.co.za</Text>
            </View>
            <View style={styles.backContactBlock}>
              <Ionicons name="mail-outline" size={14} color="#555" />
              <Text style={styles.backContactLine}>
                info@limpopochefs.co.za
              </Text>
            </View>
            <View style={styles.backContactBlock}>
              <Ionicons name="call-outline" size={14} color="#555" />
              <Text style={styles.backContactLine}>
                015 491 1226 / 015 292 0102
              </Text>
            </View>
            <View style={styles.backDivider} />
            <Image
              source={require("../../assets/sponsors-new3.png")}
              style={styles.accredLogos}
              resizeMode="contain"
            />
          </View>

          {/* Bottom accent bar */}
          <View style={styles.backBottomBar} />
        </Animated.View>
      </TouchableOpacity>

      <Text style={styles.flipHint}>
        {isFlipped ? "← Tap to see front" : "Tap to see back →"}
      </Text>

      {/* Info notice */}
      <View style={styles.infoBox}>
        <Ionicons name="information-circle-outline" size={20} color="#014b01" />
        <Text style={styles.infoText}>
          This is your official digital student card. Keep it accessible for
          identification purposes on campus.
        </Text>
      </View>
    </ScrollView>
  );
}

// ---------------------------------------------------------------------------
// Small helper component
// ---------------------------------------------------------------------------
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailBadge}>
        <Text style={styles.detailBadgeText}>{label}</Text>
      </View>
      <Text style={styles.detailValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f2f5",
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 60,
    alignItems: "center",
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 13,
    color: "#777",
    marginBottom: 28,
  },

  // ---- Card wrapper (stacks front + back) ----
  cardWrapper: {
    // width & height set inline via dynamic values
  },
  card: {
    borderRadius: 18,
    overflow: "hidden",
    position: "absolute",
    backfaceVisibility: "hidden",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
  },

  // ================================================================
  // FRONT
  // ================================================================
  cardFront: {
    backgroundColor: "#ffffff",
    alignItems: "center",
  },

  // Top stripe
  topStripeBar: {
    width: "100%",
    height: 12,
    flexDirection: "row",
  },
  topStripeLeft: {
    flex: 1,
    backgroundColor: "#6B2F8A",
  },
  topStripeGap: {
    width: 4,
    backgroundColor: "#ffffff",
  },
  topStripeRight: {
    flex: 1,
    backgroundColor: "#3DAA35",
  },

  // Branding row
  brandingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 18,
    paddingHorizontal: 20,
    gap: 10,
  },
  schoolLogo: {
    width: 46,
    height: 46,
  },
  schoolNameText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#014b01",
    flex: 1,
    flexWrap: "wrap",
  },

  // Photo
  photoWrapper: {
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
    borderWidth: 3,
    borderColor: "#6B2F8A",
    marginBottom: 14,
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  photoPlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },

  studentName: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#1a1a1a",
    textAlign: "center",
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  nameDivider: {
    width: "70%",
    height: 1.5,
    backgroundColor: "#e0e0e0",
    marginBottom: 14,
  },

  detailsGrid: {
    width: "100%",
    paddingHorizontal: 20,
    gap: 9,
    flex: 1,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  detailBadge: {
    backgroundColor: "#1a1a1a",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    minWidth: 118,
    alignItems: "center",
  },
  detailBadgeText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  detailValue: {
    fontSize: 12,
    color: "#1a1a1a",
    fontWeight: "500",
    flex: 1,
  },

  // Bottom stripe (mirrors top)
  bottomStripeBar: {
    width: "100%",
    height: 12,
    flexDirection: "row",
    marginTop: "auto",
  },

  // ================================================================
  // BACK
  // ================================================================
  cardBack: {
    backgroundColor: "#f8f8f8",
    alignItems: "center",
  },
  backTopBar: {
    width: "100%",
    backgroundColor: "#1a1a1a",
    paddingVertical: 16,
    alignItems: "center",
  },
  backTopBarText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 5,
  },
  backContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 20,
    gap: 8,
  },
  backLogo: {
    width: CARD_WIDTH * 0.5,
    height: CARD_WIDTH * 0.5,
    marginBottom: 10,
  },
  backSchoolNameLarge: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#014b01",
    textAlign: "center",
  },
  backDivider: {
    width: "55%",
    height: 1,
    backgroundColor: "#ddd",
    marginVertical: 6,
  },
  backContactBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  backContactLine: {
    fontSize: 12,
    color: "#555",
  },
  accredLogos: {
    width: CARD_WIDTH - 40,
    height: 60,
  },
  backBottomBar: {
    width: "100%",
    height: 12,
    backgroundColor: "#3DAA35",
  },

  // ---- Below card ----
  flipHint: {
    marginTop: 20,
    fontSize: 13,
    color: "#888",
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#e8f5e9",
    borderRadius: 10,
    padding: 14,
    marginTop: 24,
    gap: 10,
    width: "100%",
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#2e6b2e",
    lineHeight: 19,
  },
});
