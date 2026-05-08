import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  User,
  LogOut,
  Edit2,
  Camera,
  Trophy,
  Users,
  Award,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import {
  clearSession,
  getGroupsUserStats,
  getSessionToken,
  getSessionUser,
  logout,
  me,
  updateUserProfile,
  type BackendUser,
} from "@/lib/api";

interface UserStats {
  activeGroups: number;
  totalGroups: number;
  studyChallengeWins: number;
}

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<BackendUser | null>(null);
  const [stats, setStats] = useState<UserStats>({
    activeGroups: 0,
    totalGroups: 0,
    studyChallengeWins: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);

  const loadProfileData = useCallback(async () => {
    if (!getSessionToken()) {
      router.replace("/(auth)/login");
      return;
    }

    try {
      setIsLoading(true);
      const cachedUser = getSessionUser();
      if (cachedUser) {
        setUser(cachedUser);
        setEditedName(cachedUser.name);
      }

      const [userResponse, userStats] = await Promise.all([
        me(),
        getGroupsUserStats(),
      ]);

      setUser(userResponse);
      setEditedName(userResponse.name);
      setStats(userStats);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível carregar dados do perfil.";
      Alert.alert("Erro ao carregar perfil", message);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  const handleSaveName = async () => {
    if (!editedName.trim()) {
      Alert.alert("Nome vazio", "Por favor, insira um nome válido.");
      return;
    }

    if (!user) return;

    try {
      setIsSavingName(true);
      await updateUserProfile({ name: editedName.trim() });
      setUser({ ...user, name: editedName.trim() });
      setIsEditing(false);
      Alert.alert("Sucesso", "Nome atualizado com sucesso!");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar o nome.";
      Alert.alert("Erro ao atualizar", message);
    } finally {
      setIsSavingName(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Sair da conta", "Tem certeza que deseja sair?", [
      {
        text: "Cancelar",
        onPress: () => {},
        style: "cancel",
      },
      {
        text: "Sair",
        onPress: async () => {
          try {
            await logout();
            clearSession();
            router.replace("/(auth)/login");
          } catch (error) {
            const message =
              error instanceof Error
                ? error.message
                : "Não foi possível sair da conta.";
            Alert.alert("Erro ao sair", message);
          }
        },
        style: "destructive",
      },
    ]);
  };

  if (isLoading) {
    return (
      <LinearGradient
        colors={["#eff6ff", "#ffffff", "#f0f9ff"]}
        style={styles.gradient}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0ea5e9" />
          <Text style={styles.loadingText}>Carregando perfil...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={["#eff6ff", "#ffffff", "#f0f9ff"]}
      style={styles.gradient}
    >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            Meu <Text style={styles.headerAccent}>Perfil</Text>
          </Text>
          <Text style={styles.headerSubtitle}>Gerencie sua conta</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          {/* Avatar Section */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatarPlaceholder}>
              <User size={48} color="#0ea5e9" />
              <Pressable style={styles.cameraButton}>
                <Camera size={16} color="#fff" />
              </Pressable>
            </View>
          </View>

          {/* User Info */}
          <View style={styles.userInfoContainer}>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>{user?.name || "Usuário"}</Text>
              <Pressable
                onPress={() => setIsEditing(true)}
                style={({ pressed }) => [
                  styles.editButton,
                  pressed && styles.editButtonPressed,
                ]}
              >
                <Edit2 size={18} color="#0ea5e9" />
              </Pressable>
            </View>
            <Text style={styles.userEmail}>{user?.username || "anônimo"}</Text>
          </View>
        </View>

        {/* Statistics Section */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Estatísticas</Text>

          <View style={styles.statsGrid}>
            {/* Active Groups */}
            <LinearGradient
              colors={["#e0f2fe", "#ffffff"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statCard}
            >
              <View style={styles.statIconContainer}>
                <Users size={24} color="#0ea5e9" />
              </View>
              <Text style={styles.statValue}>{stats.activeGroups}</Text>
              <Text style={styles.statLabel}>Grupos Ativos</Text>
            </LinearGradient>

            {/* Total Groups */}
            <LinearGradient
              colors={["#e0f2fe", "#ffffff"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statCard}
            >
              <View style={styles.statIconContainer}>
                <Award size={24} color="#0ea5e9" />
              </View>
              <Text style={styles.statValue}>{stats.totalGroups}</Text>
              <Text style={styles.statLabel}>Total de Grupos</Text>
            </LinearGradient>

            {/* Study Challenge Wins */}
            <LinearGradient
              colors={["#fef3c7", "#ffffff"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statCard}
            >
              <View style={styles.statIconContainer}>
                <Trophy size={24} color="#f59e0b" />
              </View>
              <Text style={styles.statValue}>{stats.studyChallengeWins}</Text>
              <Text style={styles.statLabel}>Vitórias de Estudo</Text>
            </LinearGradient>
          </View>
        </View>

        {/* Actions Section */}
        <View style={styles.actionsSection}>
          <Pressable
            onPress={handleLogout}
            style={({ pressed }) => [
              styles.logoutButton,
              pressed && styles.logoutButtonPressed,
            ]}
          >
            <LinearGradient
              colors={["#fee2e2", "#fecaca"]}
              style={styles.logoutGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <LogOut size={20} color="#dc2626" />
              <Text style={styles.logoutText}>Sair da Conta</Text>
            </LinearGradient>
          </Pressable>
        </View>

        <View style={styles.footer} />
      </ScrollView>

      {/* Edit Name Modal */}
      <Modal
        visible={isEditing}
        transparent
        animationType="fade"
        onRequestClose={() => setIsEditing(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Nome</Text>

            <TextInput
              style={styles.nameInput}
              placeholder="Digite seu novo nome"
              value={editedName}
              onChangeText={setEditedName}
              placeholderTextColor="#d1d5db"
            />

            <View style={styles.modalButtons}>
              <Pressable
                onPress={() => setIsEditing(false)}
                style={({ pressed }) => [
                  styles.cancelButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </Pressable>

              <Pressable
                onPress={handleSaveName}
                disabled={isSavingName}
                style={({ pressed }) => [
                  styles.saveButton,
                  pressed && styles.buttonPressed,
                  isSavingName && styles.saveButtonDisabled,
                ]}
              >
                {isSavingName ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Salvar</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6b7280",
  },
  header: {
    marginTop: 48,
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
    letterSpacing: -1,
  },
  headerAccent: {
    color: "#0ea5e9",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
  },

  // Profile Card Styles
  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 16,
    position: "relative",
  },
  avatarPlaceholder: {
    position: "relative",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#e0f2fe",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#0ea5e9",
  },
  cameraButton: {
    position: "absolute",
    bottom: -2,
    right: -10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#0ea5e9",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  userInfoContainer: {
    alignItems: "center",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  userName: {
    fontSize: 24,
    fontWeight: "600",
    color: "#111827",
    marginRight: 12,
  },
  editButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
  },
  editButtonPressed: {
    backgroundColor: "#e5e7eb",
  },
  userEmail: {
    fontSize: 14,
    color: "#6b7280",
  },

  // Stats Section Styles
  statsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  statCard: {
    width: "31%",
    aspectRatio: 1,
    borderRadius: 12,
    padding: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  statIconContainer: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: "#6b7280",
    textAlign: "center",
    marginTop: 4,
  },

  // Actions Section Styles
  actionsSection: {
    marginBottom: 32,
  },
  logoutButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  logoutButtonPressed: {
    opacity: 0.8,
  },
  logoutGradient: {
    flexDirection: "row",
    paddingVertical: 16,
    paddingHorizontal: 24,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#dc2626",
  },
  footer: {
    height: 20,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "85%",
    maxWidth: 350,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
  },
  nameInput: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: "#111827",
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280",
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#0ea5e9",
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonPressed: {
    backgroundColor: "#0284c7",
  },
  saveButtonDisabled: {
    backgroundColor: "#93c5fd",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  buttonPressed: {
    opacity: 0.8,
  },
});
