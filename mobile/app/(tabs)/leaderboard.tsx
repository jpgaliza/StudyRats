import { useCallback, useEffect, useRef, useState } from "react";
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
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  AlertCircle,
  Zap,
  Crown,
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
  resolveStorageUrl,
  type LeaderboardMember,
} from "@/lib/api";

type Period = "daily" | "weekly" | "monthly";

const periodLabel: Record<Period, string> = {
  daily: "dia",
  weekly: "semana",
  monthly: "mes",
};

function getInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || "?";
}

function formatRank(rank: number) {
  return `${rank}º`;
}

function InitialAvatar({
  uri,
  name,
  style,
  textStyle,
}: {
  uri?: string | null;
  name: string;
  style: object;
  textStyle: object;
}) {
  const [failed, setFailed] = useState(false);
  const resolvedUri = resolveStorageUrl(uri ?? null) || uri;

  if (resolvedUri && !failed) {
    return (
      <Image
        source={{ uri: resolvedUri }}
        style={style}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <View style={[style, styles.initialAvatar]}>
      <Text style={textStyle}>{getInitial(name)}</Text>
    </View>
  );
}

function AnimatedCheckInCount({
  value,
  isCurrentUser,
}: {
  value: number | string;
  isCurrentUser: boolean;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scale, {
        toValue: 1.14,
        friction: 5,
        tension: 120,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 6,
        tension: 90,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scale, value]);

  return (
    <Animated.Text
      style={[
        styles.score,
        isCurrentUser && styles.currentUserText,
        { transform: [{ scale }] },
      ]}
    >
      {value}
    </Animated.Text>
  );
}

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
  const [showFullRanking, setShowFullRanking] = useState(false);

  const currentUserId = getSessionUser()?.id;
  const currentMember = members.find((member) => member.user_id === currentUserId);

  useEffect(() => {
    setShowFullRanking(false);
  }, [groupId, period]);

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
            <Zap size={26} color="#fff" />
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
            <View style={styles.rankingContent}>
              {currentMember ? (
                <Pressable
                  style={styles.profileRankCard}
                  onPress={() => {
                    router.push({
                      pathname: "/profile/public",
                      params: { groupId: String(groupId), userId: String(currentMember.user_id) },
                    } as never);
                  }}
                >
                  <View style={styles.profileAccent} />
                  <InitialAvatar
                    uri={currentMember.avatar}
                    name={currentMember.name}
                    style={styles.profileAvatar}
                    textStyle={styles.profileAvatarInitial}
                  />
                  <View style={styles.profileInfo}>
                    <Text style={styles.profileName} numberOfLines={1}>
                      {currentMember.name}
                    </Text>
                  </View>
                  <View style={styles.profileScoreBox}>
                    <AnimatedCheckInCount
                      value={formatRank(currentMember.rank)}
                      isCurrentUser
                    />
                    <Text style={styles.scoreLabel}>ranking</Text>
                  </View>
                </Pressable>
              ) : (
                <View style={styles.profileRankCard}>
                  <View style={styles.profileAccent} />
                  <Text style={styles.emptyText}>
                    Voce ainda nao tem check-ins neste periodo.
                  </Text>
                </View>
              )}

              {!showFullRanking && members.length ? (
                <Pressable
                  style={({ pressed }) => [
                    styles.secondaryButton,
                    pressed && styles.secondaryButtonPressed,
                  ]}
                  onPress={() => setShowFullRanking(true)}
                >
                  <Text style={styles.secondaryButtonText}>
                    Ver todas as classificacoes
                  </Text>
                </Pressable>
              ) : null}

              {showFullRanking ? (
                <>
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
                    {isCurrentUser ? <View style={styles.currentUserAccent} /> : null}
                    <InitialAvatar
                      uri={member.avatar}
                      name={member.name}
                      style={styles.avatar}
                      textStyle={styles.avatarInitial}
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
                    </View>
                    <View style={styles.scoreContainer}>
                      <AnimatedCheckInCount
                        value={formatRank(member.rank)}
                        isCurrentUser={isCurrentUser}
                      />
                      <Text style={styles.scoreLabel}>ranking</Text>
                    </View>
                  </Pressable>
                );
                    })}
                  </View>
                  <Pressable
                    style={({ pressed }) => [
                      styles.secondaryButton,
                      pressed && styles.secondaryButtonPressed,
                    ]}
                    onPress={() => setShowFullRanking(false)}
                  >
                    <Text style={styles.secondaryButtonText}>
                      Remover ranking
                    </Text>
                  </Pressable>
                </>
              ) : null}
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
                  <InitialAvatar
                    uri={topThree[1].avatar}
                    name={topThree[1].name}
                    style={styles.podiumAvatar2}
                    textStyle={styles.podiumInitial2}
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
                  <Crown
                    size={28}
                    color="#d97706"
                    fill="#facc15"
                    style={styles.crownIcon}
                  />
                  <InitialAvatar
                    uri={topThree[0].avatar}
                    name={topThree[0].name}
                    style={styles.podiumAvatar1}
                    textStyle={styles.podiumInitial1}
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
                  <InitialAvatar
                    uri={topThree[2].avatar}
                    name={topThree[2].name}
                    style={styles.podiumAvatar3}
                    textStyle={styles.podiumInitial3}
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
    borderRadius: 18,
    overflow: "hidden",
    alignSelf: "center",
    width: "100%",
    maxWidth: 420,
    marginBottom: 24,
    shadowColor: "#0ea5e9",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 3,
  },
  buttonPressed: { opacity: 0.95, transform: [{ scale: 0.98 }] },
  checkInGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    gap: 12,
  },
  checkInText: { color: "#fff", fontSize: 17, fontWeight: "800" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.07,
    shadowRadius: 18,
    elevation: 3,
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
  rankingContent: { gap: 16 },
  profileRankCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "#f8fbff",
    borderWidth: 1,
    borderColor: "#7dd3fc",
    borderRadius: 14,
    padding: 16,
    overflow: "hidden",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },
  profileAccent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
    backgroundColor: "#0ea5e9",
  },
  profileRankPill: {
    width: 48,
    alignItems: "center",
    gap: 5,
  },
  profileRankText: {
    color: "#0ea5e9",
    fontSize: 13,
    fontWeight: "900",
  },
  profileAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: "#bae6fd",
  },
  profileAvatarInitial: {
    color: "#0369a1",
    fontSize: 22,
    fontWeight: "900",
  },
  profileInfo: { flex: 1, minWidth: 0 },
  profileName: {
    color: "#111827",
    fontSize: 17,
    fontWeight: "900",
  },
  profileUsername: {
    color: "#64748b",
    fontSize: 13,
    marginTop: 3,
  },
  profileScoreBox: { alignItems: "flex-end" },
  secondaryButton: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#bae6fd",
    backgroundColor: "#f0f9ff",
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  secondaryButtonPressed: {
    backgroundColor: "#e0f2fe",
    transform: [{ scale: 0.99 }],
  },
  secondaryButtonText: {
    color: "#0284c7",
    fontSize: 14,
    fontWeight: "800",
  },
  leaderboardList: { gap: 16 },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  currentUserRow: { backgroundColor: "#f8fbff", borderColor: "#7dd3fc" },
  rank1Row: { backgroundColor: "#fffbeb", borderColor: "#fbbf24" },
  rank2Row: { backgroundColor: "#f8fafc", borderColor: "#cbd5e1" },
  rank3Row: { backgroundColor: "#fff7ed", borderColor: "#fdba74" },
  normalRow: { backgroundColor: "#fff", borderColor: "#e5e7eb" },
  currentUserAccent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
    backgroundColor: "#0ea5e9",
  },
  rankContainer: { width: 50, alignItems: "center", gap: 4 },
  rankNumber: { fontSize: 13, fontWeight: "900", color: "#475569" },
  medalBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  rankText: { fontSize: 18, fontWeight: "900", color: "#9ca3af" },
  currentUserText: { color: "#0ea5e9" },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  initialAvatar: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e0f2fe",
  },
  avatarInitial: { color: "#0369a1", fontSize: 18, fontWeight: "900" },
  memberInfo: { flex: 1 },
  memberName: { fontSize: 16, fontWeight: "700", color: "#111827" },
  username: { fontSize: 14, color: "#6b7280" },
  scoreContainer: { alignItems: "flex-end" },
  score: { fontSize: 30, fontWeight: "900", color: "#111827", lineHeight: 34 },
  scoreLabel: { fontSize: 12, color: "#6b7280" },
  podium: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    gap: 16,
    height: 300,
    paddingTop: 10,
  },
  podiumPlace: { alignItems: "center", width: 90 },
  place1: { marginBottom: 0 },
  place2: { marginBottom: 18 },
  place3: { marginBottom: 42 },
  crownIcon: { marginBottom: 4 },
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
  podiumInitial1: { color: "#92400e", fontSize: 24, fontWeight: "900" },
  podiumInitial2: { color: "#475569", fontSize: 21, fontWeight: "900" },
  podiumInitial3: { color: "#9a3412", fontSize: 18, fontWeight: "900" },
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
  podiumBase1: { backgroundColor: "#fbbf24", height: 150, paddingTop: 20 },
  podiumBase2: { backgroundColor: "#cbd5e1", height: 112, paddingTop: 16 },
  podiumBase3: { backgroundColor: "#d97706", height: 82, paddingTop: 12 },
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
