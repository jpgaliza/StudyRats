import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Zap, Trophy, Medal } from "lucide-react-native";
import { useLocalSearchParams } from "expo-router";
import { studyGroups, currentUser } from "@/data/mockData";

export default function Leaderboard() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const group = studyGroups.find((g) => g.id === id);

  if (!group) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Grupo nao encontrado</Text>
      </View>
    );
  }

  const getRankStyle = (rank: number, isCurrentUser: boolean) => {
    if (isCurrentUser) return styles.currentUserRow;
    if (rank === 1) return styles.rank1Row;
    if (rank === 2) return styles.rank2Row;
    if (rank === 3) return styles.rank3Row;
    return styles.normalRow;
  };

  return (
    <LinearGradient
      colors={["#eff6ff", "#ffffff", "#f0f9ff"]}
      style={styles.gradient}
    >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{group.name}</Text>
          <Text style={styles.headerSubtitle}>
            Ranking • {group.memberCount} membros
          </Text>
        </View>

        {/* Check-In Button */}
        <Pressable
          style={({ pressed }) => [
            styles.checkInButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <LinearGradient
            colors={["#0ea5e9", "#0284c7"]}
            style={styles.checkInGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Zap size={20} color="#fff" />
            <Text style={styles.checkInText}>Check-in para {group.name}</Text>
          </LinearGradient>
        </Pressable>

        {/* Leaderboard */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Ranking</Text>
            <Text style={styles.cardSubtitle}>Check-ins deste mes</Text>
          </View>
          <View style={styles.leaderboardList}>
            {group.allMembers.map((member, index) => {
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
                    {member.rank <= 3 ? (
                      member.rank === 1 ? (
                        <Trophy size={20} color="#fbbf24" />
                      ) : (
                        <Medal size={20} color={member.rank === 2 ? "#d1d5db" : "#d97706"} />
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
                      {isCurrentUser && " (Voce)"}
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
                      {member.checkInCount}
                    </Text>
                    <Text style={styles.scoreLabel}>check-ins</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Podium */}
        <View style={[styles.card, { marginBottom: 100 }]}>
          <Text style={styles.cardTitle}>Podio Top 3</Text>
          <View style={styles.podium}>
            {group.topMembers[1] && (
              <View style={[styles.podiumPlace, styles.place2]}>
                <Image
                  source={{ uri: group.topMembers[1].avatar }}
                  style={styles.podiumAvatar2}
                />
                <Text style={styles.podiumName} numberOfLines={1}>
                  {group.topMembers[1].name}
                </Text>
                <Text style={styles.podiumScore2}>
                  {group.topMembers[1].checkInCount}
                </Text>
                <View style={[styles.podiumBase, styles.podiumBase2]}>
                  <Text style={styles.podiumRank2}>2</Text>
                </View>
              </View>
            )}
            {group.topMembers[0] && (
              <View style={[styles.podiumPlace, styles.place1]}>
                <Trophy
                  size={24}
                  color="#fbbf24"
                  style={{ marginBottom: 4 }}
                />
                <Image
                  source={{ uri: group.topMembers[0].avatar }}
                  style={styles.podiumAvatar1}
                />
                <Text style={styles.podiumName} numberOfLines={1}>
                  {group.topMembers[0].name}
                </Text>
                <Text style={styles.podiumScore1}>
                  {group.topMembers[0].checkInCount}
                </Text>
                <View style={[styles.podiumBase, styles.podiumBase1]}>
                  <Text style={styles.podiumRank1}>1</Text>
                </View>
              </View>
            )}
            {group.topMembers[2] && (
              <View style={[styles.podiumPlace, styles.place3]}>
                <Image
                  source={{ uri: group.topMembers[2].avatar }}
                  style={styles.podiumAvatar3}
                />
                <Text style={styles.podiumName} numberOfLines={1}>
                  {group.topMembers[2].name}
                </Text>
                <Text style={styles.podiumScore3}>
                  {group.topMembers[2].checkInCount}
                </Text>
                <View style={[styles.podiumBase, styles.podiumBase3]}>
                  <Text style={styles.podiumRank3}>3</Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
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
  },
  headerSubtitle: { fontSize: 14, color: "#6b7280", marginTop: 8 },
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
    backgroundColor: "#111827",
  },
  errorText: { color: "#9ca3af", fontSize: 16 },
});
