import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft, BookOpen, CheckCircle2, Flame, Trophy } from "lucide-react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import {
  getPublicProfile,
  getSessionToken,
  resolveStorageUrl,
  type PublicProfilePayload,
} from "@/lib/api";

export default function PublicProfile() {
  const router = useRouter();
  const params = useLocalSearchParams<{ groupId?: string; userId?: string }>();
  const [profile, setProfile] = useState<PublicProfilePayload | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!getSessionToken()) {
      router.replace("/login" as never);
      return;
    }

    if (!params.groupId || !params.userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await getPublicProfile(params.groupId, params.userId);
      setProfile(data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Nao foi possivel carregar o perfil.";
      Alert.alert("Perfil publico", message);
    } finally {
      setLoading(false);
    }
  }, [params.groupId, params.userId, router]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const avatar = profile
    ? resolveStorageUrl(profile.user.avatar) || profile.user.avatar
    : null;

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    if (params.groupId) {
      router.replace({
        pathname: "/leaderboard",
        params: { groupId: params.groupId },
      } as never);
      return;
    }

    router.replace("/groups" as never);
  };

  return (
    <LinearGradient
      colors={["#eff6ff", "#ffffff", "#f0f9ff"]}
      style={styles.gradient}
    >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Pressable
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={goBack}
        >
          <ArrowLeft size={20} color="#111827" />
          <Text style={styles.backText}>Voltar</Text>
        </Pressable>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color="#0ea5e9" />
            <Text style={styles.loadingText}>Carregando perfil...</Text>
          </View>
        ) : profile ? (
          <>
            <View style={styles.header}>
              {avatar ? <Image source={{ uri: avatar }} style={styles.avatar} /> : null}
              <Text style={styles.name}>{profile.user.name}</Text>
              <Text style={styles.username}>@{profile.user.username}</Text>
              <Text style={styles.groupName}>{profile.group.name}</Text>
            </View>

            <View style={styles.statsGrid}>
              <View style={[styles.statCard, styles.statOrange]}>
                <Flame size={22} color="#f97316" />
                <Text style={styles.statValue}>{profile.streak_days}</Text>
                <Text style={styles.statLabel}>dias em sequencia</Text>
              </View>
              <View style={[styles.statCard, styles.statGreen]}>
                <CheckCircle2 size={22} color="#22c55e" />
                <Text style={styles.statValue}>{profile.weekly_check_ins}</Text>
                <Text style={styles.statLabel}>check-ins na semana</Text>
              </View>
              <View style={[styles.statCard, styles.statBlue]}>
                <CheckCircle2 size={22} color="#0ea5e9" />
                <Text style={styles.statValue}>{profile.monthly_check_ins}</Text>
                <Text style={styles.statLabel}>check-ins no mes</Text>
              </View>
              <View style={[styles.statCard, styles.statYellow]}>
                <Trophy size={22} color="#f59e0b" />
                <Text style={styles.statValue}>
                  {profile.ranking_position ? `#${profile.ranking_position}` : "-"}
                </Text>
                <Text style={styles.statLabel}>ranking do grupo</Text>
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <BookOpen size={20} color="#0ea5e9" />
                <Text style={styles.cardTitle}>Assunto mais estudado</Text>
              </View>
              <Text style={styles.topicName}>
                {profile.top_topic?.topic || "Nenhum check-in ainda"}
              </Text>
              {profile.top_topic ? (
                <Text style={styles.topicCount}>
                  {profile.top_topic.check_ins_count} check-ins recentes
                </Text>
              ) : null}
            </View>
          </>
        ) : (
          <View style={styles.loadingBox}>
            <Text style={styles.loadingText}>Perfil nao encontrado.</Text>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1, padding: 16 },
  backButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  backText: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "800",
  },
  buttonPressed: { opacity: 0.95, transform: [{ scale: 0.98 }] },
  loadingBox: { alignItems: "center", gap: 10, paddingVertical: 40 },
  loadingText: { color: "#6b7280", fontSize: 14 },
  header: { alignItems: "center", paddingVertical: 32 },
  avatar: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 4,
    borderColor: "#0ea5e9",
    backgroundColor: "#e0f2fe",
  },
  name: {
    color: "#111827",
    fontSize: 28,
    fontWeight: "900",
    marginTop: 14,
    textAlign: "center",
  },
  username: { color: "#6b7280", fontSize: 14, marginTop: 4 },
  groupName: {
    color: "#0ea5e9",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 10,
  },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 20 },
  statCard: {
    width: "48%",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    minHeight: 132,
  },
  statOrange: { backgroundColor: "#fff7ed", borderColor: "#fed7aa" },
  statGreen: { backgroundColor: "#f0fdf4", borderColor: "#bbf7d0" },
  statBlue: { backgroundColor: "#eff6ff", borderColor: "#bfdbfe" },
  statYellow: { backgroundColor: "#fffbeb", borderColor: "#fde68a" },
  statValue: {
    color: "#111827",
    fontSize: 30,
    fontWeight: "900",
    marginTop: 10,
  },
  statLabel: { color: "#6b7280", fontSize: 12, marginTop: 4 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 22,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 100,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  cardTitle: { color: "#111827", fontSize: 20, fontWeight: "700" },
  topicName: {
    color: "#0ea5e9",
    fontSize: 22,
    fontWeight: "900",
    marginTop: 18,
  },
  topicCount: { color: "#6b7280", fontSize: 13, marginTop: 6 },
});
