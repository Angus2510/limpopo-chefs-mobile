import React, { useState } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Image,
} from "react-native";
import {
  Card,
  Title,
  TextInput,
  Button,
  Text,
  ActivityIndicator,
} from "react-native-paper";
import { useAuth } from "../contexts/AuthContext";
import { images } from "../assets/images";

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
        error.message || "An error occurred during login"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      "Forgot Password",
      "Please contact the administration office to reset your password.",
      [{ text: "OK" }]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.logoContainer}>
          <Image
            source={images.logo}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Card style={styles.loginCard}>
          <Card.Content>
            <Title style={styles.loginTitle}>Welcome Back</Title>
            <Text style={styles.loginSubtitle}>
              Sign in to access your student portal
            </Text>

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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 200,
    height: 120,
    marginBottom: 20,
  },
  loginCard: {
    elevation: 8,
    borderRadius: 12,
  },
  loginTitle: {
    textAlign: "center",
    marginBottom: 8,
    color: "#333",
  },
  loginSubtitle: {
    textAlign: "center",
    marginBottom: 24,
    color: "#666",
    fontSize: 14,
  },
  input: {
    marginBottom: 16,
  },
  loginButton: {
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 8,
  },
  loginButtonContent: {
    paddingVertical: 8,
  },
  forgotButton: {
    marginTop: 8,
  },
  footer: {
    marginTop: 40,
    alignItems: "center",
  },
  footerText: {
    color: "#666",
    fontSize: 12,
    textAlign: "center",
  },
});
