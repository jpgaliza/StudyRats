import { createElement, useCallback, useState } from "react";
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
import { Plus, ArrowRight, Users, X, UserMinus, CalendarDays, Copy, Check, Trash2, ChartNoAxesColumn } from "lucide-react-native";
import { useFocusEffect, useRouter } from "expo-router";
import {
  ApiRequestError,
  createGroup,
  deleteGroup,
  defaultAvatarUrl,
  getGroup,
  getGroups,
  getLeaderboardPreview,
  getSessionToken,
  getSessionUser,
  joinGroup,
  removeGroupMember,
  resolveStorageUrl,
  type BackendGroup,
  type BackendUser,
} from "@/lib/api";

type GroupItem = {
  id: string;
  name: string;
  description: string | null;
  startsAt: string | null;
  endsAt: string | null;
  ownerId: number;
  code: string;
  memberCount: number;
  topMembers: {
    userId: string;
    name: string;
    avatar: string;
    checkInCount: number;
  }[];
};

type DateTimeFieldProps = {
  value: string;
  onChangeText: (value: string) => void;
};

const webDateInputStyle = {
  backgroundColor: "#f9fafb",
  borderWidth: 1,
  borderStyle: "solid",
  borderColor: "#e5e7eb",
  borderRadius: 12,
  boxSizing: "border-box",
  color: "#111827",
  fontFamily: "inherit",
  fontSize: 16,
  height: 48,
  outline: "none",
  padding: "12px 16px",
  width: "100%",
};

function todayDateMin() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

function parseCalendarDate(value: string) {
  const datePart = value.trim().split("T")[0];
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(datePart);

  if (match) {
    const [, year, month, day] = match;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function isBeforeToday(value: string) {
  if (!value.trim()) return false;
  const date = parseCalendarDate(value);
  if (!date) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

function DateTimeField({ value, onChangeText }: DateTimeFieldProps) {
  if (Platform.OS === "web") {
    return createElement("input", {
      type: "date",
      value,
      min: todayDateMin(),
      onChange: (event: { target: { value: string } }) =>
        onChangeText(event.target.value),
      style: webDateInputStyle as any,
    });
  }

  return (
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      placeholderTextColor="#9ca3af"
      keyboardType="numbers-and-punctuation"
    />
  );
}

export default function StudyGroups() {
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [newGroupStartsAt, setNewGroupStartsAt] = useState("");
  const [newGroupEndsAt, setNewGroupEndsAt] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [joinCodeError, setJoinCodeError] = useState("");
  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [managingGroup, setManagingGroup] = useState<BackendGroup | null>(null);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<BackendUser | null>(null);
  const [groupToDelete, setGroupToDelete] = useState<GroupItem | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const currentUserId = getSessionUser()?.id;

  const copyInviteCode = async (code: string) => {
    try {
      if (Platform.OS === "web" && navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(code);
      } else {
        await Promise.resolve();
      }
      setCopiedCode(code);
      setTimeout(() => setCopiedCode((current) => (current === code ? null : current)), 1400);
    } catch {
      Alert.alert("Codigo", "Nao foi possivel copiar o codigo automaticamente.");
    }
  };

  const mapGroups = (apiGroups: BackendGroup[]): GroupItem[] =>
    apiGroups.map((group) => ({
      id: String(group.id),
      name: group.name,
      description: group.description ?? null,
      startsAt: group.starts_at ?? null,
      endsAt: group.ends_at ?? null,
      ownerId: group.owner_id,
      code: group.invite_code,
      memberCount: group.users_count ?? 0,
      topMembers: [],
    }));

  const loadLeaderboardPreviews = async (apiGroups: BackendGroup[]) => {
    const previewRows = await Promise.all(
      apiGroups.map(async (group) => {
        try {
          const preview = await getLeaderboardPreview(group.id);
          return {
            id: String(group.id),
            topMembers:
              preview.top_members.slice(0, 3)?.map((m) => ({
                userId: m.user_id,
                name: m.name,
                avatar: m.avatar,
                checkInCount: m.check_in_count,
              })) ?? [],
          };
        } catch {
          return { id: String(group.id), topMembers: [] };
        }
      }),
    );

    const previewsByGroup = Object.fromEntries(
      previewRows.map((row) => [row.id, row.topMembers]),
    );

    setGroups((current) =>
      current.map((group) => ({
        ...group,
        topMembers: previewsByGroup[group.id] ?? group.topMembers,
      })),
    );
  };

  const loadGroups = useCallback(async () => {
    if (!getSessionToken()) {
      router.replace("/login" as never);
      return;
    }

    try {
      setIsLoadingGroups(true);
      const apiGroups = await getGroups();
      setGroups(mapGroups(apiGroups));
      void loadLeaderboardPreviews(apiGroups);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Falha ao carregar grupos.";
      Alert.alert("Erro de grupos", message);
    } finally {
      setIsLoadingGroups(false);
    }
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      void loadGroups();
    }, [loadGroups]),
  );

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      Alert.alert("Dados faltando", "Informe um nome para o grupo.");
      return;
    }

    if (!newGroupStartsAt.trim()) {
      Alert.alert("Dados faltando", "Informe a data de inicio do grupo.");
      return;
    }

    if (!newGroupEndsAt.trim()) {
      Alert.alert("Dados faltando", "Informe a data final do grupo.");
      return;
    }

    if (isBeforeToday(newGroupStartsAt)) {
      Alert.alert("Data invalida", "A data de inicio nao pode ser anterior a hoje.");
      return;
    }

    if (isBeforeToday(newGroupEndsAt)) {
      Alert.alert("Data invalida", "A data final nao pode ser anterior a hoje.");
      return;
    }

    if (
      newGroupStartsAt.trim() &&
      newGroupEndsAt.trim() &&
      (parseCalendarDate(newGroupEndsAt)?.getTime() ?? 0) <
        (parseCalendarDate(newGroupStartsAt)?.getTime() ?? 0)
    ) {
      Alert.alert("Data invalida", "A data final precisa ser depois da data de inicio.");
      return;
    }

    try {
      setIsSubmitting(true);
      await createGroup({
        name: newGroupName.trim(),
        description: newGroupDescription.trim() || null,
        starts_at: newGroupStartsAt.trim(),
        ends_at: newGroupEndsAt.trim(),
      });
      Alert.alert("Grupo criado!", `Grupo "${newGroupName.trim()}" criado!`);
      setNewGroupName("");
      setNewGroupDescription("");
      setNewGroupStartsAt("");
      setNewGroupEndsAt("");
      setShowCreateModal(false);
      await loadGroups();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Nao foi possivel criar o grupo.";
      Alert.alert("Erro ao criar grupo", message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoinGroup = async () => {
    const normalizedCode = joinCode.trim().toUpperCase();
    setJoinCodeError("");

    if (!normalizedCode) {
      setJoinCodeError("Informe o codigo do grupo.");
      return;
    }

    if (normalizedCode.length !== 6) {
      setJoinCodeError("O codigo precisa ter exatamente 6 caracteres.");
      return;
    }

    try {
      setIsSubmitting(true);
      await joinGroup({ code: normalizedCode });
      Alert.alert("Voce entrou no grupo!", `Codigo: ${normalizedCode}`);
      setJoinCode("");
      setJoinCodeError("");
      setShowJoinModal(false);
      await loadGroups();
    } catch (error) {
      const message =
        error instanceof ApiRequestError && error.status === 404
          ? "Grupo nao encontrado"
          : error instanceof ApiRequestError && error.status === 403
            ? error.message
          : error instanceof Error
            ? error.message
            : "Nao foi possivel entrar no grupo.";
      setJoinCodeError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatGroupDate = (iso: string | null) => {
    if (!iso) return null;
    const date = parseCalendarDate(iso);
    if (!date) return null;

    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  const renderGroupPeriod = (startsAt: string | null, endsAt: string | null) => {
    const start = formatGroupDate(startsAt);
    const end = formatGroupDate(endsAt);

    return (
      <View style={styles.groupPeriodBox}>
        <CalendarDays size={15} color="#0ea5e9" />
        <Text style={styles.groupPeriodLine}>
          {start ?? "nao definido"} <Text style={styles.groupPeriodArrow}>→</Text>{" "}
          {end ?? "nao definido"}
        </Text>
      </View>
    );
  };

  const openManageGroup = async (groupId: string) => {
    try {
      setIsLoadingMembers(true);
      const group = await getGroup(groupId);
      setManagingGroup(group);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Nao foi possivel carregar membros.";
      Alert.alert("Membros", message);
    } finally {
      setIsLoadingMembers(false);
    }
  };

  const refreshManagingGroup = async () => {
    if (!managingGroup) return;
    const group = await getGroup(managingGroup.id);
    setManagingGroup(group);
    await loadGroups();
  };

  const handleRemoveMember = (member: BackendUser) => {
    if (!managingGroup) return;
    setMemberToRemove(member);
  };

  const confirmRemoveMember = async () => {
    if (!managingGroup || !memberToRemove) return;

    try {
      setIsSubmitting(true);
      await removeGroupMember(managingGroup.id, memberToRemove.id);
      const removedName = memberToRemove.name;
      setMemberToRemove(null);
      Alert.alert("Membro removido", `${removedName} saiu do grupo.`);
      await refreshManagingGroup();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Nao foi possivel remover.";
      Alert.alert("Membros", message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteGroupForEveryone = async (group: GroupItem) => {
    try {
      setIsSubmitting(true);
      await deleteGroup(group.id);
      Alert.alert("Grupo excluído", `"${group.name}" foi apagado para todos.`);
      setGroupToDelete(null);
      await loadGroups();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Não foi possível excluir o grupo.";
      Alert.alert("Excluir grupo", message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteGroup = (group: GroupItem) => {
    setGroupToDelete(group);
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
            <Text style={styles.headerAccent}>Grupos</Text> de estudo
          </Text>
          <Text style={styles.headerSubtitle}>Estude com sua turma</Text>
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
              <Text style={styles.createButtonText}>Criar grupo</Text>
            </LinearGradient>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.joinButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => setShowJoinModal(true)}
          >
            <ArrowRight size={20} color="#111827" />
            <Text style={styles.joinButtonText}>Entrar com codigo</Text>
          </Pressable>
        </View>

        {/* Groups List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Seus grupos</Text>
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
                    router.push({
                      pathname: "/leaderboard",
                      params: { groupId: group.id },
                    } as never);
                  }}
                >
                  <View style={styles.groupHeader}>
                    <View style={styles.groupInfo}>
                      <Text style={styles.groupName}>
                        {group.name.charAt(0).toUpperCase() + group.name.slice(1)}
                      </Text>
                      {group.description ? (
                        <Text style={styles.groupDescription} numberOfLines={2}>
                          {group.description}
                        </Text>
                      ) : null}
                      <View style={styles.groupMeta}>
                        <Users size={16} color="#6b7280" />
                        <Text style={styles.groupMembers}>
                          {group.memberCount} {group.memberCount === 1 ? "membro" : "membros"}
                        </Text>
                      </View>
                      {renderGroupPeriod(group.startsAt, group.endsAt)}
                    </View>
                    <Pressable
                      style={({ pressed }) => [
                        styles.groupCode,
                        pressed && styles.groupCodePressed,
                      ]}
                      onPress={(event) => {
                        event.stopPropagation();
                        void copyInviteCode(group.code);
                      }}
                    >
                      <Text style={styles.codeLabel}>Código</Text>
                      <View style={styles.codeValueRow}>
                        <Text style={styles.codeValue}>{group.code}</Text>
                        {copiedCode === group.code ? (
                          <Check size={14} color="#16a34a" />
                        ) : (
                          <Copy size={14} color="#0ea5e9" />
                        )}
                      </View>
                    </Pressable>
                  </View>

                  <View style={styles.groupActions}>
                    <Pressable
                      style={styles.manageButton}
                      onPress={(event) => {
                        event.stopPropagation();
                        void openManageGroup(group.id);
                      }}
                      disabled={isLoadingMembers}
                    >
                        <Users size={16} color="#0f766e" />
                      <Text style={styles.manageButtonText}>
                        {group.ownerId === currentUserId
                          ? "Gerenciar membros"
                          : "Ver membros"}
                      </Text>
                    </Pressable>
                    {group.ownerId === currentUserId ? (
                      <Pressable
                        style={({ pressed }) => [
                          styles.deleteGroupButton,
                          pressed && styles.deleteGroupButtonPressed,
                        ]}
                        onPress={(event) => {
                          event.stopPropagation();
                          handleDeleteGroup(group);
                        }}
                        disabled={isSubmitting}
                      >
                        <Trash2 size={16} color="#b91c1c" />
                        <Text style={styles.deleteGroupButtonText}>
                          Excluir
                        </Text>
                      </Pressable>
                    ) : null}
                  </View>

                  <View style={styles.leaderboardPreview}>
                    <View style={styles.previewHeader}>
                      <ChartNoAxesColumn size={16} color="#64748b" />
                      <Text style={styles.previewTitle}>Top 3 do ranking</Text>
                    </View>
                    {group.topMembers.length > 0 ? (
                      <View style={styles.topMembers}>
                        {group.topMembers.map((member, idx) => (
                          <Pressable
                            key={member.userId}
                            style={styles.memberRow}
                            onPress={(event) => {
                              event.stopPropagation();
                              router.push({
                                pathname: "/profile/public",
                                params: { groupId: group.id, userId: member.userId },
                              } as never);
                            }}
                          >
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
                          </Pressable>
                        ))}
                      </View>
                    ) : (
                      <View style={styles.emptyRanking}>
                        <ChartNoAxesColumn size={18} color="#94a3b8" />
                        <Text style={styles.mockNotice}>
                          Ainda não há dados de ranking para este grupo.
                        </Text>
                      </View>
                    )}
                  </View>
                </Pressable>
              ))}

              {!groups.length && (
                <View style={styles.emptyBox}>
                  <Text style={styles.emptyText}>
                    Voce ainda nao participa de nenhum grupo. Crie um ou entre com codigo.
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
              <Text style={styles.modalTitle}>Criar grupo</Text>
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
                placeholder="ex.: Grupo de estudo de Matematica"
                placeholderTextColor="#9ca3af"
              />
              <Text style={styles.inputLabel}>Descricao</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={newGroupDescription}
                onChangeText={setNewGroupDescription}
                placeholder="ex.: Foco em exercicios e simulados"
                placeholderTextColor="#9ca3af"
                multiline
                textAlignVertical="top"
              />
              <Text style={styles.inputLabel}>Data de inicio</Text>
              <DateTimeField
                value={newGroupStartsAt}
                onChangeText={setNewGroupStartsAt}
              />
              <Text style={styles.inputLabel}>Data final</Text>
              <DateTimeField
                value={newGroupEndsAt}
                onChangeText={setNewGroupEndsAt}
              />
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
                    {isSubmitting ? "Criando..." : "Criar grupo"}
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
              <Text style={styles.modalTitle}>Entrar no grupo</Text>
              <Pressable onPress={() => setShowJoinModal(false)}>
                <X size={24} color="#9ca3af" />
              </Pressable>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Codigo do grupo</Text>
              <TextInput
                style={[
                  styles.input,
                  styles.codeInput,
                  joinCodeError ? styles.inputError : null,
                ]}
                value={joinCode}
                onChangeText={(text) => {
                  const value = text.replace(/\s/g, "").toUpperCase().slice(0, 6);
                  setJoinCode(value);
                  if (joinCodeError) setJoinCodeError("");
                }}
                placeholder="ex.: CS2024"
                placeholderTextColor="#9ca3af"
                autoCapitalize="characters"
                maxLength={6}
              />
              {joinCodeError ? (
                <Text style={styles.errorText}>{joinCodeError}</Text>
              ) : null}
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
                    {isSubmitting ? "Entrando..." : "Entrar no grupo"}
                  </Text>
                </LinearGradient>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={Boolean(managingGroup)}
        transparent
        animationType="fade"
        onRequestClose={() => setManagingGroup(null)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setManagingGroup(null)}
        >
          <Pressable
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Membros</Text>
                <Text style={styles.modalSubtitle}>{managingGroup?.name}</Text>
              </View>
              <Pressable onPress={() => setManagingGroup(null)}>
                <X size={24} color="#9ca3af" />
              </Pressable>
            </View>
            <View style={styles.memberList}>
              {managingGroup?.users?.map((member) => {
                const isOwner = member.id === managingGroup.owner_id;
                const isCurrentUser = member.id === currentUserId;
                const canManageMembers = managingGroup.owner_id === currentUserId;
                const avatar =
                  resolveStorageUrl(member.avatar ?? null) ||
                  defaultAvatarUrl();
                return (
                  <View key={member.id} style={styles.manageMemberRow}>
                    <Pressable
                      style={styles.manageMemberInfo}
                      onPress={() => {
                        setManagingGroup(null);
                        router.push({
                          pathname: "/profile/public",
                          params: { groupId: String(managingGroup.id), userId: String(member.id) },
                        } as never);
                      }}
                    >
                      <Image source={{ uri: avatar }} style={styles.manageAvatar} />
                      <View style={styles.manageMemberText}>
                        <Text style={styles.manageName} numberOfLines={1}>
                          {member.name}{isCurrentUser ? " (Voce)" : ""}
                        </Text>
                      </View>
                    </Pressable>
                    {isOwner ? (
                      <View style={styles.adminBadge}>
                        <Text style={styles.adminBadgeText}>adm</Text>
                      </View>
                    ) : canManageMembers ? (
                      <View style={styles.memberActions}>
                        <Pressable
                          style={[styles.iconButton, styles.removeButton]}
                          hitSlop={8}
                          onPress={(event) => {
                            event.stopPropagation();
                            handleRemoveMember(member);
                          }}
                          disabled={isSubmitting}
                        >
                          <UserMinus size={18} color="#b91c1c" />
                        </Pressable>
                      </View>
                    ) : null}
                  </View>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={Boolean(memberToRemove)}
        transparent
        animationType="fade"
        onRequestClose={() => setMemberToRemove(null)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => !isSubmitting && setMemberToRemove(null)}
        >
          <Pressable
            style={styles.confirmContent}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={styles.confirmTitle}>Expulsar membro?</Text>
            <Text style={styles.confirmText}>
              {memberToRemove
                ? `${memberToRemove.name} sera removido deste grupo.`
                : ""}
            </Text>
            <View style={styles.confirmActions}>
              <Pressable
                style={[styles.confirmButton, styles.cancelButton]}
                onPress={() => setMemberToRemove(null)}
                disabled={isSubmitting}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[styles.confirmButton, styles.dangerButton]}
                onPress={() => void confirmRemoveMember()}
                disabled={isSubmitting}
              >
                <Text style={styles.dangerButtonText}>
                  {isSubmitting ? "Removendo..." : "Expulsar"}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={Boolean(groupToDelete)}
        transparent
        animationType="fade"
        onRequestClose={() => setGroupToDelete(null)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => !isSubmitting && setGroupToDelete(null)}
        >
          <Pressable
            style={styles.confirmContent}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={styles.confirmTitle}>Excluir grupo?</Text>
            <Text style={styles.confirmText}>
              {groupToDelete
                ? `${groupToDelete.name} será apagado para todos os membros.`
                : ""}
            </Text>
            <View style={styles.confirmActions}>
              <Pressable
                style={[styles.confirmButton, styles.cancelButton]}
                onPress={() => setGroupToDelete(null)}
                disabled={isSubmitting}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[styles.confirmButton, styles.dangerButton]}
                onPress={() => {
                  if (!groupToDelete) return;
                  const target = groupToDelete;
                  void deleteGroupForEveryone(target);
                }}
                disabled={isSubmitting}
              >
                <Text style={styles.dangerButtonText}>
                  {isSubmitting ? "Excluindo..." : "Excluir"}
                </Text>
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
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  joinButton: {
    flex: 1,
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
  joinButtonText: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "700",
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
    alignItems: "flex-start",
    marginBottom: 16,
    gap: 14,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 22,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 6,
  },
  groupDescription: {
    fontSize: 12,
    color: "#64748b",
    lineHeight: 17,
    marginBottom: 10,
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
  groupPeriodBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
    alignSelf: "flex-start",
  },
  groupPeriodLine: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "700",
  },
  groupPeriodArrow: {
    color: "#94a3b8",
    fontWeight: "900",
  },
  groupCode: {
    backgroundColor: "#f8fbff",
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#dbeafe",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
    minWidth: 0,
    gap: 2,
  },
  groupCodePressed: {
    backgroundColor: "#dbeafe",
    transform: [{ scale: 0.98 }],
  },
  groupActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  manageButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#f0fdfa",
    borderWidth: 1,
    borderColor: "#99f6e4",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  manageButtonText: {
    color: "#0f766e",
    fontSize: 13,
    fontWeight: "700",
  },
  deleteGroupButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(0, 0, 0, 0)",
    borderWidth: 1,
    borderColor: "#fca5a5",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    minWidth: 96,
  },
  deleteGroupButtonPressed: {
    backgroundColor: "#fef2f2",
  },
  deleteGroupButtonText: {
    color: "#b91c1c",
    fontSize: 13,
    fontWeight: "800",
  },
  codeLabel: {
    fontSize: 10,
    color: "#94a3b8",
  },
  codeValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  codeValue: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0ea5e9",
  },
  leaderboardPreview: {
    backgroundColor: "#f8fbff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#dbeafe",
  },
  previewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  previewTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#475569",
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
    color: "#94a3b8",
    lineHeight: 18,
    flex: 1,
  },
  emptyRanking: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
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
  modalSubtitle: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 4,
  },
  modalBody: {
    gap: 16,
  },
  memberList: {
    gap: 10,
  },
  manageMemberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  manageMemberInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  manageAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#e0f2fe",
  },
  manageMemberText: {
    flex: 1,
  },
  manageName: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "700",
  },
  adminBadge: {
    borderWidth: 1,
    borderColor: "#bae6fd",
    backgroundColor: "#f0f9ff",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  adminBadgeText: {
    color: "#0284c7",
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  memberActions: {
    flexDirection: "row",
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  removeButton: {
    backgroundColor: "#fef2f2",
    borderColor: "#fecaca",
  },
  confirmContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 22,
    width: "100%",
    maxWidth: 360,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  confirmTitle: {
    color: "#111827",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 8,
  },
  confirmText: {
    color: "#6b7280",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  confirmActions: {
    flexDirection: "row",
    gap: 10,
  },
  confirmButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  cancelButtonText: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "800",
  },
  dangerButton: {
    backgroundColor: "#dc2626",
  },
  dangerButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
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
  inputError: {
    borderColor: "#ef4444",
    backgroundColor: "#fef2f2",
  },
  textArea: {
    minHeight: 92,
    lineHeight: 22,
  },
  errorText: {
    color: "#b91c1c",
    fontSize: 12,
    fontWeight: "700",
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
