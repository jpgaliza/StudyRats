import { useState } from "react";
import { View, Text, TextInput, Pressable, Alert } from "react-native";
import { useRouter } from "expo-router";
import { register } from "../services/authService";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();

  const handleRegister = async () => {
    try {
      await register(name, email, password);
      Alert.alert("Sucesso", "Conta criada com sucesso!");
      router.push("/login");
    } catch (err) {
      console.error(err);
      Alert.alert("Erro", "Erro ao criar conta");
    }
  };

  return (
    <View style={{ padding: 20, gap: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold" }}>
        Criar Conta
      </Text>

      <TextInput
        placeholder="Nome"
        value={name}
        onChangeText={setName}
        style={{ borderWidth: 1, padding: 10, borderRadius: 6 }}
      />

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={{ borderWidth: 1, padding: 10, borderRadius: 6 }}
      />

      <TextInput
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ borderWidth: 1, padding: 10, borderRadius: 6 }}
      />

      <Pressable
        onPress={handleRegister}
        style={{
          backgroundColor: "#000",
          padding: 12,
          borderRadius: 6,
        }}
      >
        <Text style={{ color: "#fff", textAlign: "center" }}>
          Criar conta
        </Text>
      </Pressable>

      <Pressable onPress={() => router.push("/login")}>
        <Text style={{ marginTop: 10, textAlign: "center" }}>
          Já tenho conta
        </Text>
      </Pressable>
    </View>
  );
}
