import { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  AlertCircle,
  Zap,
  Trophy,
  Medal,
} from "lucide-react-native";
import {
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import { CheckInModal } from "@/components/CheckInModal";
import {
  getLeaderboard,
  getSessionToken,
  getSessionUser,
  type LeaderboardMember,
} from "@/lib/api";

type Period = "daily" | "weekly" | "monthly";

const periodLabel: Record<Period, string> = {
  daily: "dia",
  weekly: "semana",
  monthly: "mes",
};

export default function Leaderboard() {
  const params = useLocalSearchParams<{ groupId?: string }>();
  const router = useRouter();
  const groupId = params.groupId;
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [period, setPeriod] = useState<Period>("monthly");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);
  const [groupName, setGroupName] = useState("");
  const [members, setMembers] = useState<LeaderboardMember[]>([]);
  const [topThree, setTopThree] = useState<LeaderboardMember[]>([]);

  const currentUserId = getSessionUser()?.id;

  const load = useCallback(async (silent = false) => {
    if (!groupId || !getSessionToken()) {
      if (!getSessionToken()) router.replace("/login" as never);
      setLoading(false);
      return;
    }

    try {
      if (!silent) setLoading(true);
      const data = await getLeaderboard(groupId, period);
      setGroupName(data.group.name);
      setMembers(data.members);
      setTopThree(
        data.top_members.length ? data.top_members : data.members.slice(0, 3),
      );
      setLastUpdatedAt(new Date());
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Nao foi possivel carregar o ranking.";
      Alert.alert("Ranking", message);
      setMembers([]);
      setTopThree([]);
    } finally {
      if (!silent) setLoading(false);
      setRefreshing(false);
    }
  }, [groupId, router, period]);

  useFocusEffect(
    useCallback(() => {
      void load();
      const interval = setInterval(() => {
        void load(true);
      }, 20000);
      return () => clearInterval(interval);
    }, [load]),
  );

  if (!groupId) {
    return (
      <LinearGradient
        colors={["#eff6ff", "#ffffff", "#f0f9ff"]}
        style={styles.gradient}
      >
        <View style={styles.errorContainer}>
          <AlertCircle size={64} color="#9ca3af" />
          <Text style={styles.errorText}>Nenhum grupo selecionado</Text>
          <Text style={styles.errorSubtext}>
            Abra o ranking pela aba Inicio ou Grupos.
          </Text>
        </View>
      </LinearGradient>
    );
  }

  const getRankStyle = (rank: number, isCurrentUser: boolean) => {
    if (isCurrentUser) return styles.currentUserRow;
    if (rank === 1) return styles.rank1Row;
    if (rank === 2) return styles.rank2Row;
    if (rank === 3) return styles.rank3Row;
    return styles.normalRow;
  };

  const periodChip = (value: Period, label: string) => (
    <Pressable
      key={value}
      onPress={() => setPeriod(value)}
      style={[styles.periodChip, period === value && styles.periodChipActive]}
    >
      <Text
        style={[
          styles.periodChipText,
          period === value && styles.periodChipTextActive,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );

  const onRefresh = () => {
    setRefreshing(true);
    void load(true);
  };

  return (
    <LinearGradient
      colors={["#eff6ff", "#ffffff", "#f0f9ff"]}
      style={styles.gradient}
    >
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#0ea5e9"
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {groupName || "Carregando..."}
          </Text>
          <Text style={styles.headerSubtitle}>Ranking neste periodo</Text>
          {lastUpdatedAt ? (
            <Text style={styles.liveText}>
              Atualizado{" "}
              {lastUpdatedAt.toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          ) : null}

          <View style={styles.periodRow}>
            {periodChip("daily", "Dia")}
            {periodChip("weekly", "Semana")}
            {periodChip("monthly", "Mes")}
          </View>
        </View>

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
            <Zap size={20} color="#fff" />
            <Text style={styles.checkInText}>
              Check-in para {groupName || "este grupo"}
            </Text>
          </LinearGradient>
        </Pressable>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Ranking</Text>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.cardSubtitle}>
                Check-ins do {periodLabel[period]}
              </Text>
            </View>
          </View>
          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator color="#0ea5e9" />
              <Text style={styles.loadingText}>Carregando ranking...</Text>
            </View>
          ) : (
            <View style={styles.leaderboardList}>
              {members.map((member) => {
                const isCurrentUser = member.user_id === currentUserId;
                return (
                  <Pressable
                    key={`${member.user_id}-${member.rank}`}
                    onPress={() => {
                      router.push({
                        pathname: "/profile/public",
                        params: { groupId: String(groupId), userId: String(member.user_id) },
                      } as never);
                    }}
                    style={[
                      styles.memberRow,
                      getRankStyle(member.rank, isCurrentUser),
                    ]}
                  >
                    <View style={styles.rankContainer}>
                      {member.rank <= 3 ? (
                        member.rank === 1 ? (
                          <Trophy size={20} color="#fbbf24" />
                        ) : (
                          <Medal
                            size={20}
                            color={
                              member.rank === 2 ? "#d1d5db" : "#d97706"
                            }
                          />
                        )
                      ) : (
                        <Text
                          style={[
                            styles.rankText,
                            isCurrentUser && styles.currentUserText,
                          ]}
                        >
                          #{member.rank}
                        </Text>
                      )}
                    </View>
                    <Image
                      source={{ uri: member.avatar }}
                      style={styles.avatar}
                    />
                    <View style={styles.memberInfo}>
                      <Text
                        style={[
                          styles.memberName,
                          isCurrentUser && styles.currentUserText,
                        ]}
                      >
                        {member.name}
                        {isCurrentUser ? " (Voce)" : ""}
                      </Text>
                      <Text style={styles.username}>@{member.username}</Text>
                    </View>
                    <View style={styles.scoreContainer}>
                      <Text
                        style={[
                          styles.score,
                          isCurrentUser && styles.currentUserText,
                        ]}
                      >
                        {member.check_in_count}
                      </Text>
                      <Text style={styles.scoreLabel}>check-ins</Text>
                    </View>
                  </Pressable>
                );
              })}
              {!members.length && !loading ? (
                <Text style={styles.emptyText}>Nenhum check-in neste periodo.</Text>
              ) : null}
            </View>
          )}
        </View>

        <View style={[styles.card, { marginBottom: 100 }]}>
          <Text style={styles.cardTitle}>Podio Top 3</Text>
          {loading ? null : (
            <View style={styles.podium}>
              {topThree[1] && (
                <View style={[styles.podiumPlace, styles.place2]}>
                  <Image
                    source={{ uri: topThree[1].avatar }}
                    style={styles.podiumAvatar2}
                  />
                  <Text style={styles.podiumName} numberOfLines={1}>
                    {topThree[1].name}
                  </Text>
                  <Text style={styles.podiumScore2}>
                    {topThree[1].check_in_count}
                  </Text>
                  <View style={[styles.podiumBase, styles.podiumBase2]}>
                    <Text style={styles.podiumRank2}>2</Text>
                  </View>
                </View>
              )}
              {topThree[0] && (
                <View style={[styles.podiumPlace, styles.place1]}>
                  <Trophy
                    size={24}
                    color="#fbbf24"
                    style={{ marginBottom: 4 }}
                  />
                  <Image
                    source={{ uri: topThree[0].avatar }}
                    style={styles.podiumAvatar1}
                  />
                  <Text style={styles.podiumName} numberOfLines={1}>
                    {topThree[0].name}
                  </Text>
                  <Text style={styles.podiumScore1}>
                    {topThree[0].check_in_count}
                  </Text>
                  <View style={[styles.podiumBase, styles.podiumBase1]}>
                    <Text style={styles.podiumRank1}>1</Text>
                  </View>
                </View>
              )}
              {topThree[2] && (
                <View style={[styles.podiumPlace, styles.place3]}>
                  <Image
                    source={{ uri: topThree[2].avatar }}
                    style={styles.podiumAvatar3}
                  />
                  <Text style={styles.podiumName} numberOfLines={1}>
                    {topThree[2].name}
                  </Text>
                  <Text style={styles.podiumScore3}>
                    {topThree[2].check_in_count}
                  </Text>
                  <View style={[styles.podiumBase, styles.podiumBase3]}>
                    <Text style={styles.podiumRank3}>3</Text>
                  </View>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      <CheckInModal
        isOpen={isCheckInOpen}
        onClose={() => setIsCheckInOpen(false)}
        groupId={groupId}
        groupName={groupName}
        onSubmitted={() => void load()}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1, padding: 16 },
  loadingBox: {
    alignItems: "center",
    paddingVertical: 24,
    gap: 10,
  },
  loadingText: { color: "#6b7280", fontSize: 14 },
  emptyText: { color: "#6b7280", textAlign: "center", paddingVertical: 12 },
  periodRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
    flexWrap: "wrap",
  },
  periodChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
  },
  periodChipActive: {
    backgroundColor: "#0ea5e9",
    borderColor: "#0ea5e9",
  },
  periodChipText: { fontSize: 13, fontWeight: "600", color: "#374151" },
  periodChipTextActive: { color: "#ffffff" },
  header: { paddingVertical: 24, alignItems: "center" },
  headerTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#111827",
    letterSpacing: -1,
    textAlign: "center",
  },
  headerSubtitle: { fontSize: 14, color: "#6b7280", marginTop: 8 },
  liveText: {
    fontSize: 12,
    color: "#0ea5e9",
    marginTop: 6,
    fontWeight: "600",
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
  liveBadge: { flexDirection: "row", alignItems: "center", gap: 6 },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#22c55e",
  },
  leaderboardList: { gap: 12 },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  currentUserRow: { backgroundColor: "#dbeafe", borderColor: "#0ea5e9" },
  rank1Row: { backgroundColor: "#fef3c7", borderColor: "#fbbf24" },
  rank2Row: { backgroundColor: "#f3f4f6", borderColor: "#d1d5db" },
  rank3Row: { backgroundColor: "#fed7aa", borderColor: "#d97706" },
  normalRow: { backgroundColor: "#fff", borderColor: "#e5e7eb" },
  rankContainer: { width: 48, alignItems: "center" },
  rankText: { fontSize: 18, fontWeight: "900", color: "#9ca3af" },
  currentUserText: { color: "#0ea5e9" },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  memberInfo: { flex: 1 },
  memberName: { fontSize: 16, fontWeight: "700", color: "#111827" },
  username: { fontSize: 14, color: "#6b7280" },
  scoreContainer: { alignItems: "flex-end" },
  score: { fontSize: 24, fontWeight: "900", color: "#111827" },
  scoreLabel: { fontSize: 12, color: "#6b7280" },
  podium: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    gap: 16,
    height: 280,
  },
  podiumPlace: { alignItems: "center", width: 90 },
  place1: { marginBottom: 0 },
  place2: { marginBottom: 60 },
  place3: { marginBottom: 100 },
  podiumAvatar1: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 4,
    borderColor: "#fbbf24",
    marginBottom: 8,
  },
  podiumAvatar2: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 4,
    borderColor: "#d1d5db",
    marginBottom: 8,
  },
  podiumAvatar3: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
  },
  podiumScore1: {
    fontSize: 20,
    fontWeight: "900",
    color: "#fbbf24",
    marginBottom: 8,
  },
  podiumScore2: {
    fontSize: 18,
    fontWeight: "900",
    color: "#d1d5db",
    marginBottom: 8,
  },
  podiumScore3: {
    fontSize: 16,
    fontWeight: "900",
    color: "#d97706",
    marginBottom: 8,
  },
  podiumBase: {
    width: 90,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  podiumBase1: { backgroundColor: "#fbbf24", height: 140, paddingTop: 20 },
  podiumBase2: { backgroundColor: "#d1d5db", height: 100, paddingTop: 16 },
  podiumBase3: { backgroundColor: "#d97706", height: 70, paddingTop: 12 },
  podiumRank1: { fontSize: 36, fontWeight: "900", color: "#92400e" },
  podiumRank2: { fontSize: 32, fontWeight: "900", color: "#4b5563" },
  podiumRank3: { fontSize: 28, fontWeight: "900", color: "#fff" },
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
