import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  Modal,
  Alert,
  TextInput,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  AlertCircle,
  Plus,
  Trophy,
  Edit2,
  RefreshCw,
  X,
} from "lucide-react-native";
import { useLocalSearchParams } from "expo-router";
import { studyGroups, currentUser, type StudyGroup } from "@/data/mockData";
import { CheckInModal } from "@/components/CheckInModal";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function cloneGroup(group?: StudyGroup) {
  if (!group) return null;

  return {
    ...group,
    topMembers: group.topMembers.map((member) => ({ ...member })),
    allMembers: group.allMembers.map((member) => ({ ...member })),
  };
}

function resetGroupMembers(group: StudyGroup): StudyGroup {
  const members = [...group.allMembers]
    .sort((left, right) => left.rank - right.rank)
    .map((member, index) => ({
      ...member,
      checkInCount: 0,
      rank: index + 1,
    }));

  return {
    ...group,
    allMembers: members,
    topMembers: members.slice(0, 3),
  };
}

export default function Leaderboard() {
  const params = useLocalSearchParams<{ id?: string }>();
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(10);
  const groupId = Array.isArray(params.id)
    ? params.id[0]
    : params.id || studyGroups[0]?.id;
  const [group, setGroup] = useState<StudyGroup | null>(() => {
    return cloneGroup(
      studyGroups.find((item) => item.id === groupId) ?? studyGroups[0],
    );
  });
  const [editedTitle, setEditedTitle] = useState(group?.name ?? "");
  const [editedDescription, setEditedDescription] = useState(
    group?.description ?? "",
  );

  const selectedGroup = group ?? cloneGroup(studyGroups[0]);

  useEffect(() => {
    const nextGroup = cloneGroup(
      studyGroups.find((item) => item.id === groupId) ?? studyGroups[0],
    );

    if (nextGroup) {
      setGroup(nextGroup);
      setEditedTitle(nextGroup.name);
      setEditedDescription(nextGroup.description ?? "");
    }
  }, [groupId]);

  if (!selectedGroup) {
    return (
      <LinearGradient
        colors={["#eff6ff", "#ffffff", "#f0f9ff"]}
        style={styles.gradient}
      >
        <View style={styles.errorContainer}>
          <AlertCircle size={64} color="#9ca3af" />
          <Text style={styles.errorText}>Nenhum grupo encontrado</Text>
          <Text style={styles.errorSubtext}>
            Junte-se a um grupo para ver o placar
          </Text>
        </View>
      </LinearGradient>
    );
  }

  const isOwner = selectedGroup.ownerId === currentUser.id;
  const challengeEndsAt = new Date(selectedGroup.challengeEndsAt);
  const isChallengeExpired = challengeEndsAt.getTime() <= Date.now();
  const remainingDays = Math.max(
    0,
    Math.ceil((challengeEndsAt.getTime() - Date.now()) / MS_PER_DAY),
  );

  const getRankStyle = (rank: number, isCurrentUser: boolean) => {
    if (isCurrentUser) return styles.currentUserRow;
    return styles.normalRow;
  };

  const handleSaveGroup = () => {
    if (!editedTitle.trim()) {
      Alert.alert("Dados ausentes", "Forneça um título para o grupo.");
      return;
    }

    setGroup((current) =>
      current
        ? {
            ...current,
            name: editedTitle.trim(),
            description: editedDescription.trim() || undefined,
          }
        : current,
    );
    setIsEditOpen(false);
    Alert.alert("Sucesso", "Grupo atualizado localmente.");
  };

  const handleStartNewChallenge = () => {
    if (!isChallengeExpired) {
      Alert.alert(
        "Desafio ativo",
        "O novo desafio só pode ser iniciado quando o ciclo atual terminar.",
      );
      return;
    }

    Alert.alert(
      "Novo desafio",
      "Isso zerará os check-ins de todos os membros e iniciará um novo ciclo.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Iniciar",
          style: "destructive",
          onPress: () => {
            setGroup((current) => {
              if (!current) return current;

              return {
                ...resetGroupMembers(current),
                challengeEndsAt: new Date(
                  Date.now() + current.challengeDurationDays * MS_PER_DAY,
                ).toISOString(),
              };
            });
            Alert.alert(
              "Sucesso",
              "Novo desafio iniciado com reset de check-ins.",
            );
          },
        },
      ],
    );
  };

  return (
    <LinearGradient
      colors={["#eff6ff", "#ffffff", "#f0f9ff"]}
      style={styles.gradient}
    >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{selectedGroup.name}</Text>
          {selectedGroup.description ? (
            <Text style={styles.headerDescription}>
              {selectedGroup.description}
            </Text>
          ) : null}
          <Text style={styles.headerSubtitle}>
            Classificações • {selectedGroup.memberCount} membros
          </Text>
        </View>

        <View style={styles.challengeCard}>
          <View style={styles.challengeCardRow}>
            <View style={styles.challengeInfo}>
              <Text style={styles.challengeLabel}>Desafio atual</Text>
              <Text style={styles.challengeValue}>
                {selectedGroup.challengeDurationDays} dias
              </Text>
              <Text style={styles.challengeMeta}>
                {isChallengeExpired
                  ? "Ciclo encerrado"
                  : `${remainingDays} dia(s) restantes`}
              </Text>
            </View>
            {isOwner ? (
              <View style={styles.ownerBadge}>
                <Text style={styles.ownerBadgeText}>Dono do grupo</Text>
              </View>
            ) : null}
          </View>

          {isOwner ? (
            <View style={styles.ownerActions}>
              <Pressable
                style={({ pressed }) => [
                  styles.secondaryActionButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={() => {
                  setEditedTitle(selectedGroup.name);
                  setEditedDescription(selectedGroup.description ?? "");
                  setIsEditOpen(true);
                }}
              >
                <Edit2 size={16} color="#0f172a" />
                <Text style={styles.secondaryActionText}>Editar grupo</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.primaryActionButton,
                  pressed && styles.buttonPressed,
                  !isChallengeExpired && styles.primaryActionButtonDisabled,
                ]}
                onPress={handleStartNewChallenge}
              >
                <RefreshCw size={16} color="#fff" />
                <Text style={styles.primaryActionText}>Novo desafio</Text>
              </Pressable>
            </View>
          ) : null}
        </View>

        {/* Check-In Button */}
        <Pressable
          style={({ pressed }) => [
            styles.checkInButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => setIsCheckInOpen(true)}
        >
          <LinearGradient
            colors={["#0ea5e9", "#0284c7"]}
            style={styles.checkInGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Plus size={20} color="#fff" />
            <Text style={styles.checkInText}>Novo Check-in</Text>
          </LinearGradient>
        </Pressable>

        {/* Leaderboard */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Placar de Líderes</Text>
            <Text style={styles.cardSubtitle}>Check-ins este mês</Text>
          </View>
          <View style={styles.leaderboardList}>
            {/* Mostrar informações do usuário atual acima do ranking */}
            {(() => {
              const currentMember = selectedGroup.allMembers.find(
                (m) => m.userId === currentUser.id,
              );
              if (currentMember) {
                return (
                  <View style={styles.userInfoCard}>
                    <Text style={styles.userInfoText}>
                      Sua posição: #{currentMember.rank} •{" "}
                      {currentMember.checkInCount} check-ins
                    </Text>
                  </View>
                );
              }
              return null;
            })()}

            {selectedGroup.allMembers.slice(0, visibleCount).map((member) => {
              const isCurrentUser = member.userId === currentUser.id;
              return (
                <View
                  key={member.userId}
                  style={[
                    styles.memberRow,
                    getRankStyle(member.rank, isCurrentUser),
                  ]}
                >
                  <View style={styles.rankContainer}>
                    <Text
                      style={[
                        styles.rankText,
                        isCurrentUser && styles.currentUserText,
                      ]}
                    >
                      #{member.rank}
                    </Text>
                  </View>
                  <Image
                    source={{ uri: member.avatar }}
                    style={styles.avatar}
                  />
                  <View style={[styles.memberInfo, styles.memberInfoCentered]}>
                    <Text
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      style={[
                        styles.memberName,
                        isCurrentUser && styles.currentUserText,
                      ]}
                    >
                      {member.name}
                    </Text>
                    <Text
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      style={styles.username}
                    >
                      @{member.username}
                    </Text>
                  </View>
                  <View style={styles.scoreContainer}>
                    <Text
                      style={[
                        styles.score,
                        isCurrentUser && styles.currentUserText,
                      ]}
                    >
                      {member.checkInCount}
                    </Text>
                    <Text style={styles.scoreLabel}>check-ins</Text>
                  </View>
                </View>
              );
            })}

            {/* Botão Ver mais */}
            {visibleCount < selectedGroup.allMembers.length && (
              <View style={{ alignItems: "center", marginTop: 8 }}>
                <Pressable
                  onPress={() =>
                    setVisibleCount((v) =>
                      Math.min(selectedGroup.allMembers.length, v + 10),
                    )
                  }
                  style={({ pressed }) => [
                    styles.verMaisButton,
                    pressed && styles.buttonPressed,
                  ]}
                >
                  <Text style={styles.verMaisText}>Ver mais</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>

        {/* Podium */}
        <View style={[styles.card, { marginBottom: 100 }]}>
          <Text style={styles.cardTitle}>Pódio Top 3</Text>
          <View style={styles.podium}>
            {selectedGroup.topMembers[1] && (
              <View style={styles.podiumPlace}>
                <View style={styles.podiumTopSection}>
                  <Image
                    source={{ uri: selectedGroup.topMembers[1].avatar }}
                    style={styles.podiumAvatar2}
                  />
                  <Text style={styles.podiumName} numberOfLines={1}>
                    {selectedGroup.topMembers[1].name}
                  </Text>
                  <Text style={styles.podiumScore2}>
                    {selectedGroup.topMembers[1].checkInCount}
                  </Text>
                </View>
                <View style={[styles.podiumBase, styles.podiumBase2]}>
                  <Text style={styles.podiumRank2}>2</Text>
                </View>
              </View>
            )}
            {selectedGroup.topMembers[0] && (
              <View style={[styles.podiumPlace, styles.place1]}>
                <View style={styles.podiumTopSection}>
                  <View style={styles.podiumCrownWrap}>
                    <Trophy size={24} color="#fbbf24" />
                  </View>
                  <Image
                    source={{ uri: selectedGroup.topMembers[0].avatar }}
                    style={styles.podiumAvatar1}
                  />
                  <Text style={styles.podiumName} numberOfLines={1}>
                    {selectedGroup.topMembers[0].name}
                  </Text>
                  <Text style={styles.podiumScore1}>
                    {selectedGroup.topMembers[0].checkInCount}
                  </Text>
                </View>
                <View style={[styles.podiumBase, styles.podiumBase1]}>
                  <Text style={styles.podiumRank1}>1</Text>
                </View>
              </View>
            )}
            {selectedGroup.topMembers[2] && (
              <View style={styles.podiumPlace}>
                <View style={styles.podiumTopSection}>
                  <Image
                    source={{ uri: selectedGroup.topMembers[2].avatar }}
                    style={styles.podiumAvatar3}
                  />
                  <Text style={styles.podiumName} numberOfLines={1}>
                    {selectedGroup.topMembers[2].name}
                  </Text>
                  <Text style={styles.podiumScore3}>
                    {selectedGroup.topMembers[2].checkInCount}
                  </Text>
                </View>
                <View style={[styles.podiumBase, styles.podiumBase3]}>
                  <Text style={styles.podiumRank3}>3</Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={isEditOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsEditOpen(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setIsEditOpen(false)}
        >
          <Pressable
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar grupo</Text>
              <Pressable onPress={() => setIsEditOpen(false)}>
                <X size={24} color="#9ca3af" />
              </Pressable>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Título do grupo</Text>
              <TextInput
                style={styles.input}
                value={editedTitle}
                onChangeText={setEditedTitle}
                placeholder="Nome do grupo"
                placeholderTextColor="#9ca3af"
              />
              <Text style={styles.inputLabel}>Descrição (opcional)</Text>
              <TextInput
                style={[styles.input, styles.editTextArea]}
                value={editedDescription}
                onChangeText={setEditedDescription}
                placeholder="Descrição do grupo"
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              <View style={styles.lockedChallengeBox}>
                <Text style={styles.lockedChallengeLabel}>
                  Tempo do desafio
                </Text>
                <Text style={styles.lockedChallengeValue}>
                  {selectedGroup.challengeDurationDays} dias
                </Text>
                <Text style={styles.lockedChallengeHint}>
                  Esse tempo não pode ser alterado por edição. Um novo desafio é
                  iniciado apenas quando o ciclo atual termina.
                </Text>
              </View>
              <Pressable
                style={({ pressed }) => [
                  styles.modalButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={handleSaveGroup}
              >
                <LinearGradient
                  colors={["#0ea5e9", "#0284c7"]}
                  style={styles.modalButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.modalButtonText}>Salvar alterações</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Check-In Modal */}
      <CheckInModal
        isOpen={isCheckInOpen}
        onClose={() => setIsCheckInOpen(false)}
        groupName={selectedGroup.name}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1, padding: 16 },
  header: { paddingVertical: 32, alignItems: "center" },
  headerTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#111827",
    letterSpacing: -1,
    textAlign: "center",
  },
  headerSubtitle: { fontSize: 14, color: "#6b7280", marginTop: 8 },
  headerDescription: {
    fontSize: 15,
    color: "#374151",
    marginTop: 10,
    textAlign: "center",
    lineHeight: 21,
  },
  challengeCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#dbeafe",
    shadowColor: "#0ea5e9",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  challengeCardRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0ea5e9",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  challengeValue: {
    fontSize: 20,
    fontWeight: "900",
    color: "#111827",
    marginTop: 4,
  },
  challengeMeta: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 4,
  },
  ownerBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#ecfeff",
    borderColor: "#22d3ee",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  ownerBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#155e75",
  },
  ownerActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  secondaryActionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    paddingVertical: 14,
  },
  secondaryActionText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
  },
  primaryActionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#0ea5e9",
    borderRadius: 12,
    paddingVertical: 14,
  },
  primaryActionButtonDisabled: {
    opacity: 0.5,
  },
  primaryActionText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },
  checkInButton: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 24,
    shadowColor: "#0ea5e9",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonPressed: { opacity: 0.95, transform: [{ scale: 0.98 }] },
  checkInGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 12,
  },
  checkInText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  cardTitle: { fontSize: 20, fontWeight: "700", color: "#111827" },
  cardSubtitle: { fontSize: 12, color: "#6b7280" },
  leaderboardList: { gap: 12 },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    height: 64,
    overflow: "hidden",
    borderRadius: 12,
    borderWidth: 1,
  },
  currentUserRow: { backgroundColor: "#dbeafe", borderColor: "#0ea5e9" },
  rank1Row: { backgroundColor: "#fef3c7", borderColor: "#fbbf24" },
  rank2Row: { backgroundColor: "#f3f4f6", borderColor: "#d1d5db" },
  rank3Row: { backgroundColor: "#fed7aa", borderColor: "#d97706" },
  normalRow: { backgroundColor: "#fff", borderColor: "#e5e7eb" },
  rankContainer: { width: 40, alignItems: "center" },
  rankText: { fontSize: 16, fontWeight: "700", color: "#9ca3af" },
  currentUserText: { color: "#0ea5e9" },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  memberInfo: { flex: 1 },
  memberInfoCentered: { justifyContent: "center" },
  memberName: { fontSize: 16, fontWeight: "700", color: "#111827" },
  username: { fontSize: 14, color: "#6b7280" },
  scoreContainer: { alignItems: "flex-end" },
  score: { fontSize: 20, fontWeight: "900", color: "#111827" },
  scoreLabel: { fontSize: 12, color: "#6b7280" },
  userInfoCard: {
    alignSelf: "center",
    width: "100%",
    backgroundColor: "#eff6ff",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: "#60a5fa",
    marginBottom: 12,
    shadowColor: "#0ea5e9",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 3,
  },
  userInfoText: {
    fontSize: 15,
    color: "#0f172a",
    fontWeight: "800",
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
  editTextArea: {
    minHeight: 96,
    paddingTop: 12,
  },
  lockedChallengeBox: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 14,
    padding: 16,
    gap: 6,
  },
  lockedChallengeLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  lockedChallengeValue: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0f172a",
  },
  lockedChallengeHint: {
    fontSize: 12,
    color: "#64748b",
    lineHeight: 18,
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
  verMaisButton: {
    backgroundColor: "#eef2ff",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#c7d2fe",
  },
  verMaisText: { color: "#3730a3", fontWeight: "700" },
  podium: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: 8,
    height: 320,
    paddingTop: 10,
    paddingHorizontal: 4,
  },
  podiumPlace: {
    alignItems: "center",
    justifyContent: "flex-end",
    flex: 1,
    maxWidth: 108,
  },
  place1: {},
  place2: {},
  place3: {},
  podiumTopSection: {
    alignItems: "center",
    justifyContent: "flex-end",
    minHeight: 132,
    width: "100%",
  },
  podiumCrownWrap: {
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  podiumAvatar1: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 4,
    borderColor: "#fbbf24",
    marginBottom: 8,
  },
  podiumAvatar2: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 4,
    borderColor: "#d1d5db",
    marginBottom: 8,
  },
  podiumAvatar3: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 4,
    borderColor: "#d97706",
    marginBottom: 8,
  },
  podiumName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
    textAlign: "center",
    minHeight: 32,
  },
  podiumScore1: {
    fontSize: 20,
    fontWeight: "900",
    color: "#fbbf24",
    marginBottom: 8,
    minHeight: 28,
  },
  podiumScore2: {
    fontSize: 18,
    fontWeight: "900",
    color: "#d1d5db",
    marginBottom: 8,
    minHeight: 28,
  },
  podiumScore3: {
    fontSize: 16,
    fontWeight: "900",
    color: "#d97706",
    marginBottom: 8,
    minHeight: 28,
  },
  podiumBase: {
    width: "100%",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  podiumBase1: { backgroundColor: "#fbbf24", height: 140, paddingTop: 18 },
  podiumBase2: { backgroundColor: "#d1d5db", height: 110, paddingTop: 16 },
  podiumBase3: { backgroundColor: "#d97706", height: 92, paddingTop: 12 },
  podiumRank1: { fontSize: 36, fontWeight: "900", color: "#92400e" },
  podiumRank2: { fontSize: 32, fontWeight: "900", color: "#4b5563" },
  podiumRank3: { fontSize: 30, fontWeight: "900", color: "#fff" },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  errorText: {
    color: "#111827",
    fontSize: 20,
    fontWeight: "700",
    marginTop: 16,
  },
  errorSubtext: { color: "#6b7280", fontSize: 14, marginTop: 8 },
});
