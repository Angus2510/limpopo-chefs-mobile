import React, { useState } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Image,
  ImageBackground,
} from "react-native";
import {
  Card,
  TextInput,
  Button,
  ActivityIndicator,
  Text,
  Title,
} from "react-native-paper";
import { useAuth } from "../contexts/AuthContext";
import images from "../assets/images";

export default function LoginScreen() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();

  const handleLogin = async () => {
    if (!identifier || !password) {
      Alert.alert("Error", "Please enter both email/username and password");
      return;
    }

    try {
      setIsLoading(true);
      await login({ identifier, password });
      // Navigation will be handled by the auth state change
    } catch (error: any) {
      Alert.alert(
        "Login Failed",
        error.message || "An error occurred during login",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      "Forgot Password",
      "Please contact the administration office to reset your password.",
      [{ text: "OK" }],
    );
  };

  return (
    <ImageBackground
      source={require("../../assets/mobile-background.jpeg")}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.logoContainer}>
            <View style={styles.logoBackground}>
              <Image
                source={require("../assets/images/logo.png")}
                style={styles.fullLogo}
                resizeMode="contain"
              />
            </View>
          </View>

          <Card style={styles.loginCard}>
            <Card.Content>
              <Title style={styles.loginTitle}>Welcome Back</Title>
              <TextInput
                label="Email or Username"
                value={identifier}
                onChangeText={setIdentifier}
                mode="outlined"
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                left={<TextInput.Icon icon="account" />}
                disabled={isLoading}
              />

              <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                mode="outlined"
                style={styles.input}
                secureTextEntry={!showPassword}
                left={<TextInput.Icon icon="lock" />}
                right={
                  <TextInput.Icon
                    icon={showPassword ? "eye-off" : "eye"}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
                disabled={isLoading}
              />

              <Button
                mode="contained"
                onPress={handleLogin}
                style={styles.loginButton}
                contentStyle={styles.loginButtonContent}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  "Sign In"
                )}
              </Button>

              <Button
                mode="text"
                onPress={handleForgotPassword}
                style={styles.forgotButton}
                disabled={isLoading}
              >
                Forgot Password?
              </Button>
            </Card.Content>
          </Card>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Need help? Contact the administration office
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 10,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 0,
    height: 180,
    justifyContent: "center",
  },
  logoBackground: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
  },
  fullLogo: {
    width: "100%",
    height: "100%",
  },
  loginCard: {
    elevation: 8,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    marginTop: 0,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
  },
  loginTitle: {
    textAlign: "center",
    marginBottom: 4,
    color: "#333",
    fontSize: 20,
  },
  input: {
    marginBottom: 10,
  },
  loginButton: {
    marginTop: 4,
    marginBottom: 10,
    borderRadius: 8,
  },
  loginButtonContent: {
    paddingVertical: 8,
  },
  forgotButton: {
    marginTop: 8,
  },
  footer: {
    marginTop: 10,
    alignItems: "center",
  },
  footerText: {
    color: "#fff",
    fontSize: 12,
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
