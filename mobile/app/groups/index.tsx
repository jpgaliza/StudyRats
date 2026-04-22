// groups/index.tsx
import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";
import {
  createGroup,
  listGroups,
  deleteGroup,
  updateGroup,
} from "../../services/groupService";
import { getMe } from "../../services/authService";
import { router } from "expo-router";
import JoinByCode from "../../components/JoinByCode";
import BackButton from "../../components/BackButton";

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
  const [isLoading, setIsLoading] = useState(true);

  // Estados para o Modal de Edição
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [groupToEdit, setGroupToEdit] = useState<Group | null>(null);
  const [editName, setEditName] = useState("");

  async function load() {
    setIsLoading(true);
    try {
      const [groupsData, userData] = await Promise.all([
        listGroups(),
        getMe(),
      ]);
      setGroups(groupsData);
      setUser(userData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert("Aviso", "Digite um nome para o grupo");
      return;
    }

    try {
      await createGroup(name);
      setName("");
      load();
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Erro ao criar grupo");
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert(
      "Excluir Grupo",
      "Tem certeza que deseja excluir este grupo?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Excluir", 
          style: "destructive", // Fica vermelho no iOS
          onPress: async () => {
            try {
              await deleteGroup(id);
              load();
            } catch (error) {
              console.error(error);
              Alert.alert("Erro", "Erro ao excluir o grupo");
            }
          }
        }
      ]
    );
  };

  const openEditModal = (group: Group) => {
    setGroupToEdit(group);
    setEditName(group.name);
    setEditModalVisible(true);
  };

  const handleEditSave = async () => {
    if (!editName.trim() || !groupToEdit) return;

    try {
      await updateGroup(groupToEdit.id, editName);
      setEditModalVisible(false);
      load();
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Erro ao editar grupo");
    }
  };

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Grupos</Text>
      </View>

      {/* Criar Grupo */}
      <View style={styles.card}>
        <Text style={styles.label}>Criar novo grupo</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Nome do grupo"
          placeholderTextColor="#9CA3AF"
          style={styles.input}
        />
        <Pressable 
          onPress={handleCreate}
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        >
          <Text style={styles.buttonText}>Criar Grupo</Text>
        </Pressable>
      </View>

      {/* Entrar por Código */}
      <View style={styles.card}>
        <JoinByCode />
      </View>

      {/* Lista de Grupos */}
      <View style={styles.listContainer}>
        <Text style={styles.label}>Meus Grupos</Text>

        {isLoading ? (
          <ActivityIndicator size="large" color="#3B82F6" style={styles.loader} />
        ) : groups.length === 0 ? (
          <Text style={styles.emptyText}>Nenhum grupo encontrado.</Text>
        ) : (
          groups.map((g) => {
            const isOwner = user && Number(user.id) === Number(g.owner_id);

            return (
              <View key={g.id} style={styles.groupCard}>
                <View style={styles.groupInfo}>
                  <Text style={styles.groupName}>{g.name}</Text>
                  <Text style={styles.groupCode}>Código: {g.invite_code}</Text>
                </View>

                {/* Botões de Ação */}
                <View style={styles.actionRow}>
                  {!isOwner ? (
                    <Pressable 
                      onPress={() => router.push(`/groups/${g.id}`)} 
                      style={[styles.actionBtn, styles.btnEnter]}
                    >
                      <Text style={styles.btnTextWhite}>Entrar</Text>
                    </Pressable>
                  ) : (
                    <>
                      <Pressable 
                        onPress={() => router.push(`/groups/${g.id}`)} 
                        style={[styles.actionBtn, styles.btnAccess]}
                      >
                        <Text style={styles.btnTextWhite}>Acessar</Text>
                      </Pressable>
                      <Pressable 
                        onPress={() => openEditModal(g)} 
                        style={[styles.actionBtn, styles.btnEdit]}
                      >
                        <Text style={styles.btnTextWhite}>Editar</Text>
                      </Pressable>
                      <Pressable 
                        onPress={() => handleDelete(g.id)} 
                        style={[styles.actionBtn, styles.btnDelete]}
                      >
                        <Text style={styles.btnTextWhite}>Excluir</Text>
                      </Pressable>
                    </>
                  )}
                </View>
              </View>
            );
          })
        )}
      </View>

      <View style={styles.footer}>
        <BackButton label="Voltar" />
      </View>

      {/* Modal de Edição (Substitui o prompt da web) */}
      <Modal
        visible={editModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Grupo</Text>
            <TextInput
              value={editName}
              onChangeText={setEditName}
              placeholder="Novo nome"
              style={styles.input}
              autoFocus
            />
            <View style={styles.modalActions}>
              <Pressable 
                onPress={() => setEditModalVisible(false)} 
                style={[styles.modalBtn, styles.modalBtnCancel]}
              >
                <Text style={styles.modalBtnTextDark}>Cancelar</Text>
              </Pressable>
              <Pressable 
                onPress={handleEditSave} 
                style={[styles.modalBtn, styles.modalBtnSave]}
              >
                <Text style={styles.btnTextWhite}>Salvar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 60,
  },
  header: {
    marginTop: 20,
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#111827",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4B5563",
    marginBottom: 12,
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#1F2937",
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#3B82F6",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  buttonPressed: {
    backgroundColor: "#2563EB",
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  listContainer: {
    flex: 1,
    marginTop: 8,
  },
  loader: {
    marginTop: 32,
  },
  emptyText: {
    textAlign: "center",
    color: "#9CA3AF",
    fontSize: 15,
    marginTop: 24,
  },
  groupCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  groupInfo: {
    marginBottom: 16,
  },
  groupName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  groupCode: {
    fontSize: 14,
    color: "#6B7280",
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  btnEnter: {
    backgroundColor: "#10B981", // Verde para entrar
  },
  btnAccess: {
    backgroundColor: "#3B82F6", // Azul para dono acessar
  },
  btnEdit: {
    backgroundColor: "#F59E0B", // Laranja/Amarelo para editar
  },
  btnDelete: {
    backgroundColor: "#EF4444", // Vermelho para excluir
  },
  btnTextWhite: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  footer: {
    marginTop: 20,
    alignItems: "center",
  },
  // Estilos do Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Fundo escuro semi-transparente
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  modalBtnCancel: {
    backgroundColor: "#E5E7EB",
  },
  modalBtnSave: {
    backgroundColor: "#3B82F6",
  },
  modalBtnTextDark: {
    color: "#374151",
    fontWeight: "600",
    fontSize: 15,
  },
});