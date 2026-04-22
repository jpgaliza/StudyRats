import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { login } from "../services/authService";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();

  const handleLogin = async () => {
    try {
      await login(email, password);
      Alert.alert("Sucesso", "Logado com sucesso!");
      router.replace("/welcome"); // ou sua home
    } catch (err) {
      Alert.alert("Erro", "Erro no login");
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: "center" }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>
        Login
      </Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        style={{
          borderWidth: 1,
          padding: 10,
          marginBottom: 10,
          borderRadius: 8,
        }}
      />

      <TextInput
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{
          borderWidth: 1,
          padding: 10,
          marginBottom: 20,
          borderRadius: 8,
        }}
      />

      <TouchableOpacity
        onPress={handleLogin}
        style={{
          backgroundColor: "#007bff",
          padding: 12,
          borderRadius: 8,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "bold" }}>
          Entrar
        </Text>
      </TouchableOpacity>

      {/* LINK REGISTER */}
      <TouchableOpacity
        onPress={() => router.push("/register")}
        style={{ marginTop: 15, alignItems: "center" }}
      >
        <Text style={{ color: "#007bff" }}>
          Criar conta
        </Text>
      </TouchableOpacity>
    </View>
  );
}