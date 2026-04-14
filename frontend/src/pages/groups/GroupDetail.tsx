import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getGroup } from "../../services/groupService";
import BackButton from "../../components/BackButton";

export default function GroupDetail() {
  const { id } = useParams();
  const [group, setGroup] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const data = await getGroup(Number(id));
      setGroup(data);
    }
    load();
  }, [id]);

  if (!group) return <p>Carregando...</p>;

  return (
    <div>
      <h1>{group.name}</h1>
      <p>Código: {group.invite_code}</p>

      <h2>Membros</h2>

      {group.users.map((user: any) => (
        <p key={user.id}>{user.name}</p>
      ))}

        <BackButton label="Voltar para lista" />
    </div>
  );
}