import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  Modal,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AlertCircle, Plus, Trophy, Medal } from "lucide-react-native";
import { useLocalSearchParams } from "expo-router";
import { studyGroups, currentUser } from "@/data/mockData";
import { CheckInModal } from "@/components/CheckInModal";

export default function Leaderboard() {
  const params = useLocalSearchParams<{ groupId?: string }>();
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(10);

  // Get groupId from params, or default to first group
  const groupId = params.groupId || studyGroups[0]?.id;
  const group = studyGroups.find((g) => g.id === groupId);

  if (!group) {
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

  const getRankStyle = (rank: number, isCurrentUser: boolean) => {
    if (isCurrentUser) return styles.currentUserRow;
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
            Classificações • {group.memberCount} membros
          </Text>
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
              const currentMember = group.allMembers.find(
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

            {group.allMembers.slice(0, visibleCount).map((member) => {
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
            {visibleCount < group.allMembers.length && (
              <View style={{ alignItems: "center", marginTop: 8 }}>
                <Pressable
                  onPress={() =>
                    setVisibleCount((v) =>
                      Math.min(group.allMembers.length, v + 10),
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
            {group.topMembers[1] && (
              <View style={styles.podiumPlace}>
                <View style={styles.podiumTopSection}>
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
                </View>
                <View style={[styles.podiumBase, styles.podiumBase2]}>
                  <Text style={styles.podiumRank2}>2</Text>
                </View>
              </View>
            )}
            {group.topMembers[0] && (
              <View style={[styles.podiumPlace, styles.place1]}>
                <View style={styles.podiumTopSection}>
                  <View style={styles.podiumCrownWrap}>
                    <Trophy size={24} color="#fbbf24" />
                  </View>
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
                </View>
                <View style={[styles.podiumBase, styles.podiumBase1]}>
                  <Text style={styles.podiumRank1}>1</Text>
                </View>
              </View>
            )}
            {group.topMembers[2] && (
              <View style={styles.podiumPlace}>
                <View style={styles.podiumTopSection}>
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
                </View>
                <View style={[styles.podiumBase, styles.podiumBase3]}>
                  <Text style={styles.podiumRank3}>3</Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Check-In Modal */}
      <CheckInModal
        isOpen={isCheckInOpen}
        onClose={() => setIsCheckInOpen(false)}
        groupName={group.name}
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
