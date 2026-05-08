import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ScrollView,
  Image,
  Modal,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Plus, ArrowRight, Users, X } from "lucide-react-native";
import { useRouter } from "expo-router";
import { studyGroups } from "@/data/mockData";
import {
  ApiRequestError,
  createGroup,
  getGroups,
  getSessionToken,
  joinGroup,
  type BackendGroup,
} from "@/lib/api";

type GroupItem = {
  id: string;
  name: string;
  code: string;
  memberCount: number;
  description?: string;
  ownerId?: string;
  challengeDurationDays?: number;
  challengeEndsAt?: string;
  topMembers: (typeof studyGroups)[number]["topMembers"];
};

export default function StudyGroups() {
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [newChallengeDurationDays, setNewChallengeDurationDays] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mapGroups = (apiGroups: BackendGroup[]): GroupItem[] => {
    return apiGroups.map((group) => {
      const mockMatch = studyGroups.find(
        (mockGroup) =>
          mockGroup.code === group.invite_code || mockGroup.name === group.name,
      );

      return {
        id: String(group.id),
        name: group.name,
        code: group.invite_code,
        description: group.description ?? undefined,
        ownerId: group.owner_id ? String(group.owner_id) : undefined,
        challengeDurationDays: group.challenge_duration_days ?? undefined,
        challengeEndsAt: group.challenge_ends_at ?? undefined,
        memberCount: group.users_count ?? 0,
        topMembers: mockMatch?.topMembers ?? [],
      };
    });
  };

  const loadGroups = useCallback(async () => {
    if (!getSessionToken()) {
      router.replace("/(auth)/login");
      return;
    }

    try {
      setIsLoadingGroups(true);
      const apiGroups = await getGroups();
      setGroups(mapGroups(apiGroups));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Falha ao carregar grupos.";
      Alert.alert("Erro nos grupos", message);
    } finally {
      setIsLoadingGroups(false);
    }
  }, [router]);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      Alert.alert("Dados ausentes", "Forneça um nome para o grupo.");
      return;
    }

    const challengeDurationDays = Number.parseInt(
      newChallengeDurationDays.trim(),
      10,
    );

    if (
      !Number.isInteger(challengeDurationDays) ||
      challengeDurationDays <= 0
    ) {
      Alert.alert(
        "Dados ausentes",
        "Forneça um tempo de desafio válido em dias.",
      );
      return;
    }

    try {
      setIsSubmitting(true);
      const createdGroup = await createGroup({
        name: newGroupName.trim(),
        description: newGroupDescription.trim() || undefined,
        challengeDurationDays,
      });

      setGroups((current) => [
        {
          id: String(createdGroup.id),
          name: createdGroup.name,
          code: createdGroup.invite_code,
          description: newGroupDescription.trim() || undefined,
          ownerId: String(createdGroup.owner_id),
          challengeDurationDays,
          challengeEndsAt: createdGroup.challenge_ends_at ?? undefined,
          memberCount: 1,
          topMembers: [],
        },
        ...current,
      ]);

      Alert.alert("Sucesso", `Grupo "${newGroupName.trim()}" criado!`);
      setNewGroupName("");
      setNewGroupDescription("");
      setNewChallengeDurationDays("");
      setShowCreateModal(false);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível criar o grupo.";
      Alert.alert("Erro ao criar grupo", message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoinGroup = async () => {
    if (!joinCode.trim()) {
      Alert.alert("Dados ausentes", "Forneça um código de grupo.");
      return;
    }

    try {
      setIsSubmitting(true);
      await joinGroup({ code: joinCode.trim().toUpperCase() });
      Alert.alert(
        "Sucesso",
        `Entrou no grupo com o código: ${joinCode.trim()}`,
      );
      setJoinCode("");
      setShowJoinModal(false);
      await loadGroups();
    } catch (error) {
      const message =
        error instanceof ApiRequestError && error.status === 404
          ? "Código de grupo inválido."
          : error instanceof Error
            ? error.message
            : "Não foi possível entrar no grupo.";
      Alert.alert("Erro ao entrar no grupo", message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LinearGradient
      colors={["#eff6ff", "#ffffff", "#f0f9ff"]}
      style={styles.gradient}
    >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            Grupos de <Text style={styles.headerAccent}>Estudo</Text>
          </Text>
          <Text style={styles.headerSubtitle}>Estude com seu esquadrão</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Pressable
            style={({ pressed }) => [
              styles.createButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => setShowCreateModal(true)}
          >
            <LinearGradient
              colors={["#0ea5e9", "#0284c7"]}
              style={styles.gradientButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Plus size={20} color="#fff" />
              <Text style={styles.createButtonText}>Criar Grupo</Text>
            </LinearGradient>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.joinButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => setShowJoinModal(true)}
          >
            <View style={styles.joinButtonContent}>
              <ArrowRight size={20} color="#111827" />
              <Text style={styles.joinButtonText} numberOfLines={1}>
                Entrar
              </Text>
            </View>
          </Pressable>
        </View>

        {/* Groups List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Seus Grupos</Text>
          {isLoadingGroups ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator color="#0ea5e9" />
              <Text style={styles.loadingText}>Carregando grupos...</Text>
            </View>
          ) : (
            <View style={styles.groupsGrid}>
              {groups.map((group) => (
                <Pressable
                  key={group.id}
                  style={styles.groupCard}
                  onPress={() => {
                    if (group.topMembers.length === 0) {
                      Alert.alert(
                        "Leaderboard simulado",
                        "Este grupo ainda não tem dados de classificação do backend.",
                      );
                      return;
                    }

                    router.push({
                      pathname: "/(tabs)/leaderboard",
                      params: { groupId: group.id },
                    });
                  }}
                >
                  <View style={styles.groupHeader}>
                    <View style={styles.groupInfo}>
                      <Text style={styles.groupName}>{group.name}</Text>
                      <View style={styles.groupMeta}>
                        <Users size={16} color="#6b7280" />
                        <Text style={styles.groupMembers}>
                          {group.memberCount} members
                        </Text>
                      </View>
                      {group.description ? (
                        <Text style={styles.groupDescription} numberOfLines={2}>
                          {group.description}
                        </Text>
                      ) : null}
                      {group.challengeDurationDays ? (
                        <View style={styles.challengePill}>
                          <Text style={styles.challengePillText}>
                            {group.challengeDurationDays} day challenge
                          </Text>
                        </View>
                      ) : null}
                    </View>
                    <View style={styles.groupCode}>
                      <Text style={styles.codeLabel}>Code</Text>
                      <Text style={styles.codeValue}>{group.code}</Text>
                    </View>
                  </View>

                  <View style={styles.leaderboardPreview}>
                    <View style={styles.previewHeader}>
                      <Text style={styles.previewTitle}>
                        🏆 Top 3 Leaderboard
                      </Text>
                    </View>
                    {group.topMembers.length > 0 ? (
                      <View style={styles.topMembers}>
                        {group.topMembers.map((member, idx) => (
                          <View key={member.userId} style={styles.memberRow}>
                            <Text
                              style={[
                                styles.rank,
                                idx === 0 && styles.rank1,
                                idx === 1 && styles.rank2,
                                idx === 2 && styles.rank3,
                              ]}
                            >
                              #{idx + 1}
                            </Text>
                            <Image
                              source={{ uri: member.avatar }}
                              style={styles.memberAvatar}
                            />
                            <Text style={styles.memberName} numberOfLines={1}>
                              {member.name}
                            </Text>
                            <Text style={styles.checkInCount}>
                              {member.checkInCount}
                            </Text>
                          </View>
                        ))}
                      </View>
                    ) : (
                      <Text style={styles.mockNotice}>
                        Ranking still mocked for groups without check-in
                        endpoints.
                      </Text>
                    )}
                  </View>
                </Pressable>
              ))}

              {!groups.length && (
                <View style={styles.emptyBox}>
                  <Text style={styles.emptyText}>
                    Você ainda não está em nenhum grupo. Crie um ou entre com um
                    código.
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Create Group Modal */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowCreateModal(false)}
        >
          <Pressable
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Criar Grupo</Text>
              <Pressable onPress={() => setShowCreateModal(false)}>
                <X size={24} color="#9ca3af" />
              </Pressable>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Nome do grupo</Text>
              <TextInput
                style={styles.input}
                value={newGroupName}
                onChangeText={setNewGroupName}
                placeholder="ex: Esquadrão de Matemática"
                placeholderTextColor="#9ca3af"
              />
              <Text style={styles.inputLabel}>Descrição (opcional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={newGroupDescription}
                onChangeText={setNewGroupDescription}
                placeholder="ex: Estudamos juntos todas as noites"
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
              <Text style={styles.inputLabel}>
                Tempo de desafio (dias) <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={newChallengeDurationDays}
                onChangeText={setNewChallengeDurationDays}
                placeholder="ex: 7"
                placeholderTextColor="#9ca3af"
                keyboardType="number-pad"
              />
              <Text style={styles.helperText}>
                O tempo é obrigatório e define o ciclo do desafio atual.
              </Text>
              <Pressable
                style={({ pressed }) => [
                  styles.modalButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={handleCreateGroup}
                disabled={isSubmitting}
              >
                <LinearGradient
                  colors={["#0ea5e9", "#0284c7"]}
                  style={styles.modalButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.modalButtonText}>
                    {isSubmitting ? "Criando..." : "Criar Grupo"}
                  </Text>
                </LinearGradient>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Join Group Modal */}
      <Modal
        visible={showJoinModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowJoinModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowJoinModal(false)}
        >
          <Pressable
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Entrar no Grupo</Text>
              <Pressable onPress={() => setShowJoinModal(false)}>
                <X size={24} color="#9ca3af" />
              </Pressable>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Código do grupo</Text>
              <TextInput
                style={[styles.input, styles.codeInput]}
                value={joinCode}
                onChangeText={(text) => setJoinCode(text.toUpperCase())}
                placeholder="ex: CS2024"
                placeholderTextColor="#9ca3af"
                autoCapitalize="characters"
              />
              <Pressable
                style={({ pressed }) => [
                  styles.modalButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={handleJoinGroup}
                disabled={isSubmitting}
              >
                <LinearGradient
                  colors={["#0ea5e9", "#0284c7"]}
                  style={styles.modalButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.modalButtonText}>
                    {isSubmitting ? "Entrando..." : "Entrar"}
                  </Text>
                </LinearGradient>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
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
    padding: 16,
  },
  header: {
    paddingVertical: 32,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "900",
    color: "#111827",
    letterSpacing: -1,
  },
  headerAccent: {
    color: "#0ea5e9",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#6b7280",
    marginTop: 8,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  createButton: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: "#0284c7",
    overflow: "hidden",
    shadowColor: "#0ea5e9",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  gradientButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
    borderRadius: 12,
    overflow: "hidden",
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  joinButton: {
    flex: 1,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  joinButtonContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    gap: 8,
    minWidth: 0,
  },
  joinButtonText: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "700",
    flexShrink: 1,
    minWidth: 0,
    textAlign: "center",
  },
  buttonPressed: {
    opacity: 0.95,
    transform: [{ scale: 0.98 }],
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },
  groupsGrid: {
    gap: 16,
  },
  groupCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  groupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  groupMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  groupMembers: {
    fontSize: 14,
    color: "#6b7280",
  },
  groupDescription: {
    fontSize: 13,
    color: "#374151",
    marginTop: 10,
    lineHeight: 18,
  },
  challengePill: {
    alignSelf: "flex-start",
    marginTop: 10,
    backgroundColor: "#eff6ff",
    borderColor: "#bfdbfe",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  challengePillText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0369a1",
  },
  groupCode: {
    backgroundColor: "#eff6ff",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#bfdbfe",
    alignItems: "center",
  },
  codeLabel: {
    fontSize: 10,
    color: "#6b7280",
  },
  codeValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0ea5e9",
  },
  leaderboardPreview: {
    backgroundColor: "#eff6ff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  previewHeader: {
    marginBottom: 12,
  },
  previewTitle: {
    fontSize: 12,
    color: "#6b7280",
  },
  topMembers: {
    gap: 8,
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rank: {
    fontSize: 14,
    fontWeight: "700",
    width: 24,
  },
  rank1: {
    color: "#fbbf24",
  },
  rank2: {
    color: "#d1d5db",
  },
  rank3: {
    color: "#d97706",
  },
  memberAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  memberName: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
  },
  checkInCount: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0ea5e9",
  },
  mockNotice: {
    fontSize: 13,
    color: "#6b7280",
  },
  loadingBox: {
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 14,
    color: "#6b7280",
  },
  emptyBox: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 16,
    backgroundColor: "#ffffff",
  },
  emptyText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  modalBody: {
    gap: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#111827",
  },
  textArea: {
    minHeight: 88,
    paddingTop: 12,
  },
  required: {
    color: "#0ea5e9",
  },
  helperText: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: -8,
  },
  codeInput: {
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    letterSpacing: 2,
  },
  modalButton: {
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#0ea5e9",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  modalButtonGradient: {
    paddingVertical: 14,
    alignItems: "center",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
