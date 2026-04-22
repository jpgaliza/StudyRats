import { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  ActivityIndicator, 
  ScrollView, 
  StyleSheet 
} from "react-native";
import { useLocalSearchParams } from "expo-router";

import { getGroup } from "../../services/groupService";
import BackButton from "../../components/BackButton";

type User = {
  id: number;
  name: string;
};

type Group = {
  id: number;
  name: string;
  invite_code: string;
  users: User[];
};

export default function GroupDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getGroup(Number(id));
        setGroup(data);
      } catch (error) {
        console.error(error);
        setGroup(null);
      } finally {
        setLoading(false);
      }
    }

    if (id) load();
  }, [id]);

  // Tela de Carregamento
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Carregando grupo...</Text>
      </View>
    );
  }

  // Tela de Erro / Grupo não encontrado
  if (!group) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Grupo não encontrado</Text>
        <BackButton label="Voltar para a lista" />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Cabeçalho do Grupo */}
      <View style={styles.header}>
        <Text style={styles.title}>{group.name}</Text>
        
        <View style={styles.codeBadge}>
          <Text style={styles.codeLabel}>CÓDIGO DE CONVITE</Text>
          <Text style={styles.codeValue}>{group.invite_code}</Text>
        </View>
      </View>

      {/* Lista de Membros */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.sectionTitle}>Membros</Text>
          <Text style={styles.memberCount}>
            {group.users?.length || 0} {(group.users?.length === 1) ? 'pessoa' : 'pessoas'}
          </Text>
        </View>

        {(!group.users || group.users.length === 0) ? (
          <Text style={styles.emptyText}>Nenhum membro neste grupo ainda.</Text>
        ) : (
          group.users.map((user, index) => {
            // Pega a primeira letra do nome para fazer um "Avatar" simples
            const initial = user.name ? user.name.charAt(0).toUpperCase() : "?";
            const isLastItem = index === group.users.length - 1;

            return (
              <View 
                key={user.id} 
                style={[styles.memberRow, !isLastItem && styles.memberRowBorder]}
              >
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{initial}</Text>
                </View>
                <Text style={styles.memberName}>{user.name}</Text>
              </View>
            );
          })
        )}
      </View>

      {/* Rodapé com botão voltar */}
      <View style={styles.footer}>
        <BackButton label="Voltar" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // Telas de Feedback (Loading / Erro)
  centerContainer: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "500",
  },
  errorText: {
    fontSize: 18,
    color: "#EF4444",
    fontWeight: "bold",
    marginBottom: 20,
  },

  // Layout Principal
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 40,
  },

  // Cabeçalho
  header: {
    marginTop: 16,
    marginBottom: 32,
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#111827",
    textAlign: "center",
    marginBottom: 16,
  },
  codeBadge: {
    backgroundColor: "#EFF6FF", // Azul muito clarinho
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BFDBFE", // Borda azul clara
    alignItems: "center",
  },
  codeLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#3B82F6",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  codeValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E3A8A", // Azul bem escuro
    letterSpacing: 2,
  },

  // Card de Membros
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },
  memberCount: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  emptyText: {
    color: "#9CA3AF",
    fontSize: 15,
    textAlign: "center",
    paddingVertical: 20,
  },

  // Itens da Lista de Membros
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  memberRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6", // Linha divisória sutil entre membros
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  memberName: {
    fontSize: 16,
    color: "#374151",
    fontWeight: "500",
  },

  // Rodapé
  footer: {
    marginTop: 32,
    alignItems: "center",
  },
});