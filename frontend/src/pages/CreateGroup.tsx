import { useState } from "react";
import { createGroup } from "../services/groupService";

export default function CreateGroup() {
  const [name, setName] = useState("");

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
      <input onChange={(e) => setName(e.target.value)} />
      <button onClick={handleCreate}>Criar Grupo</button>
    </div>
  );
}