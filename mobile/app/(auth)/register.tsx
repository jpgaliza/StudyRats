import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Zap } from "lucide-react-native";
import { login, register, setSession } from "@/lib/api";

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    realName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!formData.email.trim() || !formData.password) {
      Alert.alert("Error", "Email and password are required.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert("Error", "Passwords don't match!");
      return;
    }

    const name = formData.realName.trim() || formData.username.trim();
    if (!name) {
      Alert.alert("Error", "Please enter your real name or username.");
      return;
    }

    try {
      setIsLoading(true);
      await register({
        name,
        email: formData.email.trim(),
        password: formData.password,
      });

      const loginResponse = await login({
        email: formData.email.trim(),
        password: formData.password,
      });

      setSession(loginResponse.token, loginResponse.user);
      router.replace("/(tabs)");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create account.";
      Alert.alert("Registration error", message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <LinearGradient
      colors={["#eff6ff", "#ffffff", "#f0f9ff"]}
      style={styles.gradient}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logoBox}>
              <Zap size={32} color="#fff" />
            </View>
            <Text style={styles.title}>
              Study<Text style={styles.titleAccent}>Rats</Text>
            </Text>
            <Text style={styles.subtitle}>Join the grind.</Text>
          </View>

          {/* Register Form */}
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Create Account</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Real Name</Text>
              <TextInput
                style={styles.input}
                value={formData.realName}
                onChangeText={(value) => handleChange("realName", value)}
                placeholder="John Doe"
                placeholderTextColor="#9ca3af"
                autoComplete="name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                style={styles.input}
                value={formData.username}
                onChangeText={(value) => handleChange("username", value)}
                placeholder="johndoe"
                placeholderTextColor="#9ca3af"
                autoCapitalize="none"
                autoComplete="username"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(value) => handleChange("email", value)}
                placeholder="you@example.com"
                placeholderTextColor="#9ca3af"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                value={formData.password}
                onChangeText={(value) => handleChange("password", value)}
                placeholder="••••••••"
                placeholderTextColor="#9ca3af"
                secureTextEntry
                autoComplete="password-new"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                value={formData.confirmPassword}
                onChangeText={(value) => handleChange("confirmPassword", value)}
                placeholder="••••••••"
                placeholderTextColor="#9ca3af"
                secureTextEntry
                autoComplete="password-new"
              />
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              <LinearGradient
                colors={["#0ea5e9", "#0284c7"]}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.buttonText}>
                  {isLoading ? "Creating account..." : "Create Account"}
                </Text>
              </LinearGradient>
            </Pressable>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <Link href="/(auth)/login" asChild>
                <Pressable>
                  <Text style={styles.link}>Log In</Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoBox: {
    width: 64,
    height: 64,
    backgroundColor: "#0ea5e9",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#0ea5e9",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: "900",
    color: "#111827",
    letterSpacing: -1,
  },
  titleAccent: {
    color: "#0ea5e9",
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    marginTop: 8,
  },
  formContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#111827",
  },
  button: {
    marginTop: 24,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#0ea5e9",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonPressed: {
    opacity: 0.95,
    transform: [{ scale: 0.98 }],
  },
  buttonGradient: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  footerText: {
    color: "#6b7280",
    fontSize: 14,
  },
  link: {
    color: "#0ea5e9",
    fontSize: 14,
    fontWeight: "600",
  },
});
