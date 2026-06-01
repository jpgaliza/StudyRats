import { useEffect, useState } from "react";
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
import { AlertCircle, CheckCircle2, Zap } from "lucide-react-native";
import { clearSession, login, register, setSession, ApiRequestError } from "@/lib/api";

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
  const [feedback, setFeedback] = useState<{
    type: "error" | "success";
    message: string;
  } | null>(null);

  useEffect(() => {
    clearSession();
  }, []);

  const handleRegister = async () => {
    setFeedback(null);

    if (!formData.email.trim() || !formData.password) {
      setFeedback({ type: "error", message: "E-mail e senha sao obrigatorios." });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setFeedback({ type: "error", message: "As senhas nao conferem." });
      return;
    }

    if (formData.password.length < 6) {
      setFeedback({
        type: "error",
        message: "A senha deve ter pelo menos 6 caracteres.",
      });
      return;
    }

    const name = formData.realName.trim() || formData.username.trim();
    if (!name) {
      setFeedback({
        type: "error",
        message: "Informe seu nome real ou nome de usuario.",
      });
      return;
    }

    try {
      setIsLoading(true);
      const normalizedEmail = formData.email.trim().toLowerCase();
      await register({
        name,
        email: normalizedEmail,
        password: formData.password,
      });

      const loginResponse = await login({
        email: normalizedEmail,
        password: formData.password,
      });

      if (!loginResponse?.token || !loginResponse?.user) {
        setFeedback({
          type: "error",
          message: "Nao foi possivel obter a sessao apos o cadastro.",
        });
        return;
      }

      setSession(loginResponse.token, loginResponse.user);
      setFeedback({ type: "success", message: "Conta criada! Entrando..." });
      queueMicrotask(() => {
        router.replace("/(tabs)" as never);
      });
    } catch (error) {
      const message =
        error instanceof ApiRequestError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Falha ao criar conta.";
      Alert.alert("Erro de cadastro", message);
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
              Study <Text style={styles.titleAccent}>Rats</Text>
            </Text>
            <Text style={styles.subtitle}>Entre no ritmo.</Text>
          </View>

          {/* Register Form */}
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Criar conta</Text>

            {feedback ? (
              <View
                style={[
                  styles.feedback,
                  feedback.type === "error"
                    ? styles.feedbackError
                    : styles.feedbackSuccess,
                ]}
              >
                {feedback.type === "error" ? (
                  <AlertCircle size={18} color="#b91c1c" />
                ) : (
                  <CheckCircle2 size={18} color="#047857" />
                )}
                <Text
                  style={[
                    styles.feedbackText,
                    feedback.type === "error"
                      ? styles.feedbackTextError
                      : styles.feedbackTextSuccess,
                  ]}
                >
                  {feedback.message}
                </Text>
              </View>
            ) : null}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome real</Text>
              <TextInput
                style={styles.input}
                value={formData.realName}
                onChangeText={(value) => handleChange("realName", value)}
                placeholder="Joao Silva"
                placeholderTextColor="#9ca3af"
                autoComplete="name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome de usuario</Text>
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
              <Text style={styles.label}>E-mail</Text>
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
              <Text style={styles.label}>Senha</Text>
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
              <Text style={styles.label}>Confirmar senha</Text>
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
                  {isLoading ? "Criando conta..." : "Criar conta"}
                </Text>
              </LinearGradient>
            </Pressable>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Ja tem conta? </Text>
              <Link href="/login" asChild>
                <Pressable>
                  <Text style={styles.link}>Entrar</Text>
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
  feedback: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  feedbackError: {
    backgroundColor: "#fef2f2",
    borderColor: "#fecaca",
  },
  feedbackSuccess: {
    backgroundColor: "#ecfdf5",
    borderColor: "#a7f3d0",
  },
  feedbackText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
  },
  feedbackTextError: {
    color: "#b91c1c",
  },
  feedbackTextSuccess: {
    color: "#047857",
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
