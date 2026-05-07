import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Image,
  Modal,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Zap, Flame, Clock } from "lucide-react-native";
import { Link, useRouter } from "expo-router";
import {
  currentUser,
  currentStreak,
  recentActivity,
  studyGroups,
} from "@/data/mockData";
import { CheckInModal } from "@/components/CheckInModal";
import { getGroups, getSessionToken, getSessionUser, me } from "@/lib/api";

type GroupPreview = {
  id: string;
  name: string;
  memberCount: number;
  code: string;
  topMembers: (typeof studyGroups)[number]["topMembers"];
};

export default function Dashboard() {
  const router = useRouter();
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [showGroupSelector, setShowGroupSelector] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [userName, setUserName] = useState(currentUser.name);
  const [groups, setGroups] = useState<GroupPreview[]>([]);

  const loadHomeData = useCallback(async () => {
    if (!getSessionToken()) {
      router.replace("/(auth)/login");
      return;
    }

    const cachedUser = getSessionUser();
    if (cachedUser?.name) {
      setUserName(cachedUser.name);
    }

    try {
      const [meResponse, groupsResponse] = await Promise.all([
        me(),
        getGroups(),
      ]);

      setUserName(meResponse.name);
      setGroups(
        groupsResponse.map((group) => {
          const mockMatch = studyGroups.find(
            (mockGroup) =>
              mockGroup.code === group.invite_code ||
              mockGroup.name === group.name,
          );

          return {
            id: String(group.id),
            name: group.name,
            memberCount: group.users_count ?? 0,
            code: group.invite_code,
            topMembers: mockMatch?.topMembers ?? [],
          };
        }),
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível carregar os dados do painel.";
      Alert.alert("Erro no painel", message);
    }
  }, [router]);

  useEffect(() => {
    loadHomeData();
  }, [loadHomeData]);

  const formatTimeAgo = (date: Date) => {
    const hours = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
    if (hours < 1) return "Agora mesmo";
    if (hours === 1) return "1h atrás";
    if (hours < 24) return `${hours}h atrás`;
    const days = Math.floor(hours / 24);
    return days === 1 ? "1 dia atrás" : `${days} dias atrás`;
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
            Olá, <Text style={styles.headerName}>{userName}</Text>
          </Text>
          <Text style={styles.headerSubtitle}>
            Pronto para dominar a atividade de hoje?
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
            <Text style={styles.checkInText}>Check-in de Estudo</Text>
          </LinearGradient>
        </Pressable>

        {/* Quick Stats */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Desempenho Atual</Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statBox, styles.statBoxOrange]}>
              <View style={styles.statHeader}>
                <Flame size={20} color="#f97316" />
                <Text style={styles.statLabel} numberOfLines={2}>
                  Sequência Atual
                </Text>
              </View>
              <Text style={styles.statValue}>{currentStreak}</Text>
              <Text style={styles.statUnit}>dias</Text>
            </View>
            <View style={[styles.statBox, styles.statBoxGreen]}>
              <View style={styles.statHeader}>
                <Clock size={20} color="#22c55e" />
                <Text style={styles.statLabel} numberOfLines={2}>
                  Esta Semana
                </Text>
              </View>
              <Text style={styles.statValue}>24</Text>
              <Text style={styles.statUnit}>check-ins</Text>
            </View>
          </View>
        </View>

        {/* My Groups Preview */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Meus Grupos</Text>
            <Link href="/(tabs)/groups" asChild>
              <Pressable>
                <Text style={styles.viewAllLink}>Ver Todos</Text>
              </Pressable>
            </Link>
          </View>
          <View style={styles.groupsList}>
            {groups.slice(0, 3).map((group) => (
              <Pressable
                key={group.id}
                style={styles.groupItem}
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
                      <Text style={styles.groupCodeLabel}>Code</Text>
                      <Text style={styles.groupCodeValue}>{group.code}</Text>
                    </View>
                  )}
                </View>
              </Pressable>
            ))}
            {!groups.length && (
              <Text style={styles.emptyGroupsText}>
                Ainda não existem grupos. Crie um ou participe de um na aba
                Grupos.
              </Text>
            )}
          </View>
        </View>

        {/* Recent Activity Feed */}
        <View style={[styles.card, { marginBottom: 100 }]}>
          <Text style={styles.cardTitle}>Recent Activity</Text>
          <View style={styles.activityList}>
            {recentActivity.map((activity) => (
              <View key={activity.id} style={styles.activityItem}>
                <Image
                  source={{ uri: activity.userAvatar }}
                  style={styles.activityAvatar}
                />
                <View style={styles.activityContent}>
                  <Text style={styles.activityText}>
                    <Text style={styles.activityName}>{activity.userName}</Text>{" "}
                    checked in:{" "}
                    <Text style={styles.activityDuration}>
                      {activity.duration} of {activity.subject}
                    </Text>
                  </Text>
                  {activity.note && (
                    <Text style={styles.activityNote}>"{activity.note}"</Text>
                  )}
                  <Text style={styles.activityTime}>
                    {formatTimeAgo(activity.timestamp)}
                  </Text>
                </View>
              </View>
            ))}
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
            <Text style={styles.modalTitle}>Select a Group</Text>
            <Text style={styles.modalSubtitle}>
              Choose which group to check in for
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
        groupName={selectedGroup?.name}
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
    flexShrink: 1,
    minWidth: 0,
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    flexShrink: 1,
    minWidth: 0,
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
