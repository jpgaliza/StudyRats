import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createGroup } from "../services/groupService";

export default function CreateGroup() {
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleCreate = async () => {
    try {
      const group = await createGroup(name);
      alert("Código: " + group.invite_code);
    } catch (error) {
      console.error(error);
      alert("Erro ao criar grupo");
    }
  };

  return (
    <div>
      <h1>Criar Grupo</h1>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nome do grupo"
      />

      <button onClick={handleCreate}>Criar Grupo</button>

      <div style={{ marginTop: 20 }}>
        <button onClick={() => navigate("/")}>Voltar</button>
      </div>
    </div>
  );
}