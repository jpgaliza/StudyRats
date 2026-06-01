import { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Image,
  Modal,
  Alert,
  type DimensionValue,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Zap, Flame, Clock } from "lucide-react-native";
import { Link, Redirect, useFocusEffect, useRouter } from "expo-router";
import { CheckInModal } from "@/components/CheckInModal";
import {
  getDashboard,
  getFeedCheckIns,
  getGroups,
  getLeaderboardPreview,
  getSessionToken,
  getSessionUser,
  me,
  resolveStorageUrl,
  setSession,
} from "@/lib/api";

type GroupPreviewTop = {
  userId: string;
  name: string;
  avatar: string;
  checkInCount: number;
};

type GroupPreview = {
  id: string;
  name: string;
  memberCount: number;
  code: string;
  topMembers: GroupPreviewTop[];
};

export default function Dashboard() {
  const router = useRouter();
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [showGroupSelector, setShowGroupSelector] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [userName, setUserName] = useState("Estudante");
  const [groups, setGroups] = useState<GroupPreview[]>([]);
  const [streakDays, setStreakDays] = useState(0);
  const [weeklyCheckIns, setWeeklyCheckIns] = useState(0);
  const [topicBreakdown, setTopicBreakdown] = useState<
    { topic: string; check_ins_count: number }[]
  >([]);
  const [feedActivities, setFeedActivities] =
    useState<Awaited<ReturnType<typeof getFeedCheckIns>>>([]);
  const [hasSession, setHasSession] = useState(Boolean(getSessionToken()));

  const loadHomeData = useCallback(async () => {
    const token = getSessionToken();
    if (!token) {
      setHasSession(false);
      return;
    }

    const cachedUser = getSessionUser();
    if (cachedUser?.name) {
      setUserName(cachedUser.name);
    }

    try {
      const [meResponse, groupsResponse, dashboard, feedItems] =
        await Promise.all([
          me(),
          getGroups(),
          getDashboard().catch(() => null),
          getFeedCheckIns().catch(() => []),
      ]);

      setUserName(meResponse.name);
      setSession(token, meResponse);
      if (dashboard) {
        setStreakDays(dashboard.streak_days);
        setWeeklyCheckIns(dashboard.weekly_check_ins);
        setTopicBreakdown(dashboard.topic_breakdown);
      }

      const previewRows = await Promise.all(
        groupsResponse.map(async (group) => {
          try {
            const preview = await getLeaderboardPreview(group.id);
            return {
              id: group.id,
              members: preview.top_members,
            };
          } catch {
            return { id: group.id, members: [] };
          }
        }),
      );

      const previewMap = Object.fromEntries(
        previewRows.map((row) => [String(row.id), row.members]),
      );

      setGroups(
        groupsResponse.map((group) => {
          const raw = previewMap[String(group.id)] ?? [];
          const topMembers: GroupPreviewTop[] = raw.slice(0, 3).map((m) => ({
            userId: m.user_id,
            name: m.name,
            avatar: m.avatar,
            checkInCount: m.check_in_count,
          }));

          return {
            id: String(group.id),
            name: group.name,
            memberCount: group.users_count ?? 0,
            code: group.invite_code,
            topMembers,
          };
        }),
      );

      setFeedActivities(feedItems);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Nao foi possivel carregar os dados da tela inicial.";
      Alert.alert("Erro no inicio", message);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (hasSession) {
        void loadHomeData();
      }
    }, [hasSession, loadHomeData]),
  );

  if (!hasSession) {
    return <Redirect href="/login" />;
  }

  const formatTimeAgo = (iso: string | Date) => {
    const date = typeof iso === "string" ? new Date(iso) : iso;
    const hours = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
    if (hours < 1) return "Agora mesmo";
    if (hours === 1) return "Ha 1h";
    if (hours < 24) return `Ha ${hours}h`;
    const days = Math.floor(hours / 24);
    return days === 1 ? "Ha 1 dia" : `Ha ${days} dias`;
  };

  const formatCheckInTime = (iso: string | Date) => {
    const date = typeof iso === "string" ? new Date(iso) : iso;
    if (Number.isNaN(date.getTime())) return "";

    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const handleCheckInClick = () => {
    setShowGroupSelector(true);
  };

  const handleGroupSelect = (groupId: string) => {
    setSelectedGroupId(groupId);
    setShowGroupSelector(false);
    setIsCheckInOpen(true);
  };

  const selectedGroup = groups.find((g) => g.id === selectedGroupId);

  return (
    <LinearGradient
      colors={["#eff6ff", "#ffffff", "#f0f9ff"]}
      style={styles.gradient}
    >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            Ola, <Text style={styles.headerName}>{userName}</Text>
          </Text>
          <Text style={styles.headerSubtitle}>
            Pronto para dominar os estudos de hoje?
          </Text>
        </View>

        {/* Check-In Button */}
        <Pressable
          style={({ pressed }) => [
            styles.checkInButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleCheckInClick}
        >
          <LinearGradient
            colors={["#0ea5e9", "#0284c7"]}
            style={styles.checkInGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Zap size={24} color="#fff" />
            <Text style={styles.checkInText}>Check-in de estudo</Text>
          </LinearGradient>
        </Pressable>

        {/* Quick Stats */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Resumo rapido</Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statBox, styles.statBoxOrange]}>
              <View style={styles.statHeader}>
                <Flame size={20} color="#f97316" />
                <Text style={styles.statLabel}>Sequencia atual</Text>
              </View>
              <Text style={styles.statValue}>{streakDays}</Text>
              <Text style={styles.statUnit}>dias</Text>
            </View>
            <View style={[styles.statBox, styles.statBoxGreen]}>
              <View style={styles.statHeader}>
                <Clock size={20} color="#22c55e" />
                <Text style={styles.statLabel}>Nesta semana</Text>
              </View>
              <Text style={styles.statValue}>{weeklyCheckIns}</Text>
              <Text style={styles.statUnit}>check-ins</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Assuntos em foco</Text>
          {topicBreakdown.length ? (
            <View style={styles.topicList}>
              {topicBreakdown.slice(0, 5).map((item) => {
                const max = Math.max(
                  ...topicBreakdown.map((topic) => topic.check_ins_count),
                  1,
                );
                const width =
                  `${Math.max(14, (item.check_ins_count / max) * 100)}%` as DimensionValue;
                return (
                  <View key={item.topic} style={styles.topicRow}>
                    <View style={styles.topicHeader}>
                      <Text style={styles.topicName} numberOfLines={1}>
                        {item.topic}
                      </Text>
                      <Text style={styles.topicCount}>
                        {item.check_ins_count} check-ins
                      </Text>
                    </View>
                    <View style={styles.topicTrack}>
                      <View style={[styles.topicBar, { width }]} />
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <Text style={styles.emptyGroupsText}>
              Seus assuntos aparecem aqui depois dos primeiros check-ins.
            </Text>
          )}
        </View>

        {/* My Groups Preview */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Meus grupos</Text>
            <Link href="/(tabs)/groups" asChild>
              <Pressable>
                <Text style={styles.viewAllLink}>Ver todos</Text>
              </Pressable>
            </Link>
          </View>
          <View style={styles.groupsList}>
            {groups.slice(0, 3).map((group) => (
              <Pressable
                key={group.id}
                style={styles.groupItem}
                onPress={() => {
                  router.push({
                    pathname: "/leaderboard",
                    params: { groupId: group.id },
                  } as never);
                }}
              >
                <View style={styles.groupItemContent}>
                  <View>
                    <Text style={styles.groupName}>{group.name}</Text>
                    <Text style={styles.groupMembers}>
                      {group.memberCount} membros
                    </Text>
                  </View>
                  {group.topMembers.length > 0 ? (
                    <View style={styles.groupAvatars}>
                      {group.topMembers.slice(0, 3).map((member) => (
                        <Image
                          key={member.userId}
                          source={{ uri: member.avatar }}
                          style={styles.avatar}
                        />
                      ))}
                    </View>
                  ) : (
                    <View style={styles.groupCodeBadge}>
                      <Text style={styles.groupCodeLabel}>Codigo</Text>
                      <Text style={styles.groupCodeValue}>{group.code}</Text>
                    </View>
                  )}
                </View>
              </Pressable>
            ))}
            {!groups.length && (
              <Text style={styles.emptyGroupsText}>
                Nenhum grupo ainda. Crie ou entre em um na aba Grupos.
              </Text>
            )}
          </View>
        </View>

        {/* Recent Activity Feed */}
        <View style={[styles.card, { marginBottom: 100 }]}>
          <Text style={styles.cardTitle}>Atividade recente</Text>
          <View style={styles.activityList}>
            {feedActivities.map((activity) => (
              <View key={activity.id} style={styles.activityItem}>
                <Image
                  source={{
                    uri: resolveStorageUrl(activity.user.avatar) || activity.user.avatar,
                  }}
                  style={styles.activityAvatar}
                />
                <View style={styles.activityContent}>
                  <Text style={styles.activityText}>
                    <Text style={styles.activityName}>{activity.user.name}</Text>{" "}
                    fez check-in em{" "}
                    <Text style={styles.activityDuration}>{activity.topic}</Text>
                  </Text>
                  {activity.note ? (
                    <Text style={styles.activityNote}>{`"${activity.note}"`}</Text>
                  ) : null}
                  <Text style={styles.activityTime}>
                    {formatTimeAgo(activity.created_at)} - {formatCheckInTime(activity.created_at)}
                  </Text>
                </View>
              </View>
            ))}
            {!feedActivities.length ? (
              <Text style={styles.emptyGroupsText}>
                Nenhuma atividade nos seus grupos ainda.
              </Text>
            ) : null}
          </View>
        </View>
      </ScrollView>

      {/* Group Selector Modal */}
      <Modal
        visible={showGroupSelector}
        transparent
        animationType="fade"
        onRequestClose={() => setShowGroupSelector(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowGroupSelector(false)}
        >
          <Pressable
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={styles.modalTitle}>Selecione um grupo</Text>
            <Text style={styles.modalSubtitle}>
              Escolha em qual grupo voce vai registrar o check-in
            </Text>
            <View style={styles.modalButtons}>
              {groups.map((group) => (
                <Pressable
                  key={group.id}
                  style={({ pressed }) => [
                    styles.modalButton,
                    pressed && styles.modalButtonPressed,
                  ]}
                  onPress={() => handleGroupSelect(group.id)}
                >
                  <Text style={styles.modalButtonText}>{group.name}</Text>
                </Pressable>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Check-In Modal */}
      <CheckInModal
        isOpen={isCheckInOpen}
        onClose={() => setIsCheckInOpen(false)}
        groupId={selectedGroupId}
        groupName={selectedGroup?.name}
        onSubmitted={loadHomeData}
      />
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
    textAlign: "center",
  },
  headerName: {
    color: "#0ea5e9",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#6b7280",
    marginTop: 8,
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
  buttonPressed: {
    opacity: 0.95,
    transform: [{ scale: 0.98 }],
  },
  checkInGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    gap: 12,
  },
  checkInText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
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
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  viewAllLink: {
    color: "#0ea5e9",
    fontSize: 14,
    fontWeight: "600",
  },
  statsGrid: {
    flexDirection: "row",
    gap: 16,
  },
  topicList: {
    gap: 14,
  },
  topicRow: {
    gap: 8,
  },
  topicHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  topicName: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  topicCount: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "600",
  },
  topicTrack: {
    height: 10,
    backgroundColor: "#e0f2fe",
    borderRadius: 999,
    overflow: "hidden",
  },
  topicBar: {
    height: "100%",
    backgroundColor: "#0ea5e9",
    borderRadius: 999,
  },
  statBox: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  statBoxOrange: {
    backgroundColor: "#fff7ed",
    borderColor: "#fed7aa",
  },
  statBoxGreen: {
    backgroundColor: "#f0fdf4",
    borderColor: "#bbf7d0",
  },
  statHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
  },
  statValue: {
    fontSize: 28,
    fontWeight: "900",
    color: "#0ea5e9",
  },
  statUnit: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  groupsList: {
    gap: 12,
  },
  groupItem: {
    backgroundColor: "#eff6ff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  groupItemContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  groupName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  groupMembers: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
  },
  groupCodeBadge: {
    backgroundColor: "#eff6ff",
    borderColor: "#bfdbfe",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: "center",
  },
  groupCodeLabel: {
    fontSize: 10,
    color: "#6b7280",
  },
  groupCodeValue: {
    fontSize: 12,
    color: "#0ea5e9",
    fontWeight: "700",
  },
  groupAvatars: {
    flexDirection: "row",
    marginLeft: -8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#fff",
    marginLeft: -8,
  },
  activityList: {
    gap: 16,
  },
  activityItem: {
    flexDirection: "row",
    gap: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  activityAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: "#111827",
  },
  activityName: {
    fontWeight: "600",
  },
  activityDuration: {
    color: "#0ea5e9",
    fontWeight: "600",
  },
  activityNote: {
    fontSize: 14,
    color: "#6b7280",
    fontStyle: "italic",
    marginTop: 4,
  },
  activityTime: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 4,
  },
  emptyGroupsText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginVertical: 8,
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
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 24,
  },
  modalButtons: {
    gap: 12,
  },
  modalButton: {
    backgroundColor: "#eff6ff",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  modalButtonPressed: {
    backgroundColor: "#0ea5e9",
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    textAlign: "center",
  },
});
