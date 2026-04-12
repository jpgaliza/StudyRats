import { useEffect, useState } from "react";
import { joinGroup, listGroups } from "../services/groupService";
import { useNavigate } from "react-router-dom";

type Group = {
  id: number;
  name: string;
  invite_code: string;
};

export default function JoinGroup() {
  const [code, setCode] = useState("");
  const [groups, setGroups] = useState<Group[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadGroups() {
      try {
        const data = await listGroups();
        setGroups(data);
      } catch (err) {
        console.error("Erro ao carregar grupos", err);
      }
    }

    loadGroups();
  }, []);

  const handleJoin = async (inviteCode: string) => {
    try {
      await joinGroup(inviteCode);
      alert("Entrou!");
    } catch (error) {
      console.error(error);
      alert("Erro ao entrar no grupo");
    }
  };

  return (
    <div>
      <h1>Entrar no Grupo</h1>

      {/* INPUT MANUAL */}
      <input
        placeholder="Digite o código"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      <button onClick={() => handleJoin(code)}>Entrar</button>

      <hr />

      {/* LISTA DE GRUPOS */}
      <h2>Grupos disponíveis</h2>

      {groups.length === 0 ? (
        <p>Nenhum grupo encontrado</p>
      ) : (
        groups.map((group) => (
          <div
            key={group.id}
            style={{
              border: "1px solid #ccc",
              padding: 10,
              marginBottom: 10,
            }}
          >
            <p><strong>{group.name}</strong></p>
            <p>Código: {group.invite_code}</p>

            <button onClick={() => handleJoin(group.invite_code)}>
              Entrar nesse grupo
            </button>
          </div>
        ))
      )}

      <div style={{ marginTop: 20 }}>
        <button onClick={() => navigate("/")}>Voltar</button>
      </div>
    </div>
  );
}