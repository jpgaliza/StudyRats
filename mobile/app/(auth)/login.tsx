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
import { clearSession, login, setSession } from "@/lib/api";

type LoginProps = {
  onLoggedIn?: () => void;
};

export default function Login({ onLoggedIn }: LoginProps = {}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "error" | "success";
    message: string;
  } | null>(null);

  useEffect(() => {
    clearSession();
  }, []);

  const handleLogin = async () => {
    setFeedback(null);

    if (!email.trim() || !password) {
      setFeedback({ type: "error", message: "Preencha e-mail e senha." });
      return;
    }

    try {
      setIsLoading(true);
      const normalizedEmail = email.trim().toLowerCase();
      const response = await login({
        email: normalizedEmail,
        password,
      });

      if (!response?.token || !response?.user) {
        setFeedback({
          type: "error",
          message: "Resposta invalida do servidor.",
        });
        return;
      }

      setSession(response.token, response.user);
      setFeedback({ type: "success", message: "Login realizado!" });
      queueMicrotask(() => {
        if (onLoggedIn) {
          onLoggedIn();
        } else {
          router.replace("/" as never);
        }
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Falha ao entrar.";
      setFeedback({ type: "error", message });
      Alert.alert("Erro de login", message);
    } finally {
      setIsLoading(false);
    }
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
        >
          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logoBox}>
              <Zap size={32} color="#fff" />
            </View>
            <Text style={styles.title}>
              Study <Text style={styles.titleAccent}>Rats</Text>
            </Text>
            <Text style={styles.subtitle}>Estudem juntos. Vencam juntos.</Text>
          </View>

          {/* Login Form */}
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Bem-vindo de volta</Text>

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
              <Text style={styles.label}>E-mail</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
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
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="#9ca3af"
                secureTextEntry
                autoComplete="password"
              />
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <LinearGradient
                colors={["#0ea5e9", "#0284c7"]}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.buttonText}>
                  {isLoading ? "Entrando..." : "Entrar"}
                </Text>
              </LinearGradient>
            </Pressable>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Nao tem conta? </Text>
              <Link href="/register" asChild>
                <Pressable>
                  <Text style={styles.link}>Criar conta</Text>
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
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
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
