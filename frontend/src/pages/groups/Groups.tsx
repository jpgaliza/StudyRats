import { useEffect, useState } from "react";
import {
  createGroup,
  listGroups,
  deleteGroup,
  updateGroup,
} from "../../services/groupService";
import { getMe } from "../../services/authService";
import { useNavigate } from "react-router-dom";
import BackButton from "../../components/BackButton";
import JoinByCode from "../../components/JoinByCode";

type Group = {
  id: number;
  name: string;
  invite_code: string;
  owner_id: number;
};

type User = {
  id: number;
  name: string;
  email: string;
};

export default function Groups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [name, setName] = useState("");
  const [user, setUser] = useState<User | null>(null);

  const navigate = useNavigate();

  async function load() {
    try {
      const [groupsData, userData] = await Promise.all([
        listGroups(),
        getMe(),
      ]);

      setGroups(groupsData);
      setUser(userData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async () => {
    if (!name.trim()) {
      alert("Digite um nome");
      return;
    }

    try {
      await createGroup(name);
      setName("");
      load();
    } catch (error) {
      console.error(error);
      alert("Erro ao criar grupo");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir?")) return;

    try {
      await deleteGroup(id);
      load();
    } catch (error) {
      console.error(error);
      alert("Erro ao excluir");
    }
  };

  const handleEdit = async (id: number) => {
    const newName = prompt("Novo nome:");
    if (!newName?.trim()) return;

    try {
      await updateGroup(id, newName);
      load();
    } catch (error) {
      console.error(error);
      alert("Erro ao editar");
    }
  };

  return (
    <div>
      <h1>Grupos</h1>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nome do grupo"
      />
      <button onClick={handleCreate}>Criar</button>

      <JoinByCode />
      <hr />

      {groups.map((g) => {
        const isOwner =
          user && Number(user.id) === Number(g.owner_id);

        return (
          <div key={g.id} style={{ border: "1px solid", margin: 10 }}>
            <p>{g.name}</p>
            <p>Código: {g.invite_code}</p>

            <button onClick={() => navigate(`/groups/${g.id}`)}>
              Entrar
            </button>

            {/* 🔐 Só dono vê */}
            {isOwner && (
              <>
                <button onClick={() => handleEdit(g.id)}>
                  Editar
                </button>
                <button onClick={() => handleDelete(g.id)}>
                  Excluir
                </button>
              </>
            )}
          </div>
        );
      })}

      <BackButton label="Voltar" />
    </div>
  );
}