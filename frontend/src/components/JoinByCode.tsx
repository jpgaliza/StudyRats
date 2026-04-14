import { useState } from "react";
import { joinGroup } from "../services/groupService";

export default function JoinByCode() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    if (!code.trim()) {
      alert("Digite um código");
      return;
    }

    try {
      setLoading(true);
      await joinGroup(code);
      alert("Entrou no grupo!");
      setCode("");
    } catch (error: any) {
      console.error(error);

      if (error.response?.status === 404) {
        alert("Grupo não encontrado");
      } else if (error.response?.status === 409) {
        alert("Você já está nesse grupo");
      } else {
        alert("Erro ao entrar no grupo");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: 16,
        marginBottom: 20,
      }}
    >
      <h3>Entrar por código</h3>

      <input
        placeholder="Digite o código do grupo"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        style={{ marginRight: 10 }}
      />

      <button onClick={handleJoin} disabled={loading}>
        {loading ? "Entrando..." : "Entrar"}
      </button>
    </div>
  );
}