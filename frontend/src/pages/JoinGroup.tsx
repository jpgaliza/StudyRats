import { useState } from "react";
import { joinGroup } from "../services/groupService";

export default function JoinGroup() {
  const [code, setCode] = useState("");

  const handleJoin = async () => {
    try {
      await joinGroup(code);
      alert("Entrou!");
    } catch (error) {
      console.error(error);
      alert("Código inválido");
    }
  };

  return (
    <div>
      <h1>Entrar no Grupo</h1>
      <input onChange={(e) => setCode(e.target.value)} />
      <button onClick={handleJoin}>Entrar</button>
    </div>
  );
}