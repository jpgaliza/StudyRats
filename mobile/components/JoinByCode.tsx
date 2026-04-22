import { useState } from "react";
import { View, Text, TextInput, Pressable, Alert } from "react-native";
import { joinGroup } from "../services/groupService";

export default function JoinByCode() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    if (!code.trim()) {
      Alert.alert("Erro", "Digite um código");
      return;
    }

    try {
      setLoading(true);

      await joinGroup(code);

      Alert.alert("Sucesso", "Entrou no grupo!");
      setCode("");
    } catch (error: any) {
      console.error(error);

      const status = error?.response?.status;

      if (status === 404) {
        Alert.alert("Erro", "Grupo não encontrado");
      } else if (status === 409) {
        Alert.alert("Aviso", "Você já está nesse grupo");
      } else {
        Alert.alert("Erro", "Erro ao entrar no grupo");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 16,
        marginBottom: 20,
        borderRadius: 8,
        gap: 10,
      }}
    >
      <Text style={{ fontSize: 18, fontWeight: "bold" }}>
        Entrar por código
      </Text>

      <TextInput
        placeholder="Digite o código do grupo"
        value={code}
        onChangeText={setCode}
        style={{
          borderWidth: 1,
          borderColor: "#aaa",
          padding: 10,
          borderRadius: 6,
        }}
      />

      <Pressable
        onPress={handleJoin}
        disabled={loading}
        style={{
          backgroundColor: loading ? "#999" : "#000",
          padding: 12,
          borderRadius: 6,
        }}
      >
        <Text style={{ color: "#fff", textAlign: "center" }}>
          {loading ? "Entrando..." : "Entrar"}
        </Text>
      </Pressable>
    </View>
  );
}