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
  type DimensionValue,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { Camera, Flame, LogOut, Target, TimerReset } from "lucide-react-native";
import { useFocusEffect, useRouter } from "expo-router";
import {
  clearSession,
  defaultAvatarUrl,
  getDashboard,
  getSessionToken,
  getSessionUser,
  logout,
  me,
  resolveStorageUrl,
  setSession,
  type BackendUser,
  type DashboardStats,
  updateMe,
} from "@/lib/api";

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState<BackendUser | null>(getSessionUser());
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarRevision, setAvatarRevision] = useState(Date.now());

  const load = useCallback(async () => {
    if (!getSessionToken()) {
      router.replace("/login" as never);
      return;
    }

    try {
      setLoading(true);
      const [userResponse, dashboardResponse] = await Promise.all([
        me(),
        getDashboard(),
      ]);
      setUser(userResponse);
      const token = getSessionToken();
      if (token) setSession(token, userResponse);
      setStats(dashboardResponse);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Nao foi possivel carregar o perfil.";
      Alert.alert("Perfil", message);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const handleLogout = async () => {
    try {
      setLeaving(true);
      await logout().catch(() => null);
      clearSession();
      router.replace("/login" as never);
    } finally {
      setLeaving(false);
    }
  };

  const handlePickAvatar = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permissao", "Precisamos acessar suas fotos para atualizar o perfil.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    const asset = result.assets?.[0];
    if (result.canceled || !asset?.uri) return;

    try {
      setUploadingAvatar(true);
      const updated = await updateMe({
        avatarUri: asset.uri,
        mimeType: asset.mimeType || "image/jpeg",
        filename: asset.fileName || asset.uri.split("/").pop()?.split("?")[0],
      });
      setUser(updated);
      setAvatarRevision(Date.now());
      const token = getSessionToken();
      if (token) setSession(token, updated);
      Alert.alert("Perfil atualizado", "Foto de perfil salva!");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Nao foi possivel atualizar a foto.";
      Alert.alert("Perfil", message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const avatar =
    resolveStorageUrl(user?.avatar ?? null, user?.updated_at ?? avatarRevision) ||
    defaultAvatarUrl();
  const topTopic = stats?.topic_breakdown[0];

  return (
    <LinearGradient
      colors={["#eff6ff", "#ffffff", "#f0f9ff"]}
      style={styles.gradient}
    >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [
              styles.avatarButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handlePickAvatar}
            disabled={uploadingAvatar}
          >
            <Image key={avatar} source={{ uri: avatar }} style={styles.avatar} />
            <View style={styles.avatarBadge}>
              {uploadingAvatar ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Camera size={17} color="#fff" />
              )}
            </View>
          </Pressable>
          <Text style={styles.name}>{user?.name || "Estudante"}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color="#0ea5e9" />
            <Text style={styles.loadingText}>Carregando perfil...</Text>
          </View>
        ) : (
          <>
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, styles.statOrange]}>
                <Flame size={22} color="#f97316" />
                <Text style={styles.statValue}>{stats?.streak_days ?? 0}</Text>
                <Text style={styles.statLabel}>dias em sequencia</Text>
              </View>
              <View style={[styles.statCard, styles.statGreen]}>
                <TimerReset size={22} color="#22c55e" />
                <Text style={styles.statValue}>
                  {stats?.weekly_check_ins ?? 0}
                </Text>
                <Text style={styles.statLabel}>check-ins na semana</Text>
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Target size={20} color="#0ea5e9" />
                <Text style={styles.cardTitle}>Produtividade</Text>
              </View>
              <Text style={styles.focusLabel}>Assunto mais treinado</Text>
              <Text style={styles.focusValue}>
                {topTopic?.topic || "Nenhum check-in ainda"}
              </Text>
              <View style={styles.topicList}>
                {stats?.topic_breakdown.slice(0, 6).map((item) => {
                  const max = Math.max(
                    ...(stats?.topic_breakdown.map((topic) => topic.check_ins_count) ??
                      [1]),
                    1,
                  );
                  const width =
                    `${Math.max(12, (item.check_ins_count / max) * 100)}%` as DimensionValue;
                  return (
                    <View key={item.topic} style={styles.topicRow}>
                      <View style={styles.topicTop}>
                        <Text style={styles.topicName} numberOfLines={1}>
                          {item.topic}
                        </Text>
                        <Text style={styles.topicCount}>
                          {item.check_ins_count}
                        </Text>
                      </View>
                      <View style={styles.topicTrack}>
                        <View style={[styles.topicBar, { width }]} />
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          </>
        )}

        <Pressable
          style={({ pressed }) => [
            styles.logoutButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleLogout}
          disabled={leaving}
        >
          <LogOut size={18} color="#b91c1c" />
          <Text style={styles.logoutText}>
            {leaving ? "Saindo..." : "Sair da conta"}
          </Text>
        </Pressable>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1, padding: 16 },
  header: { alignItems: "center", paddingVertical: 32 },
  avatarButton: {
    position: "relative",
  },
  avatar: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 4,
    borderColor: "#0ea5e9",
    backgroundColor: "#e0f2fe",
  },
  avatarBadge: {
    position: "absolute",
    right: 2,
    bottom: 2,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#0ea5e9",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  name: {
    fontSize: 28,
    fontWeight: "900",
    color: "#111827",
    marginTop: 14,
    textAlign: "center",
  },
  email: { fontSize: 14, color: "#6b7280", marginTop: 4 },
  loadingBox: { alignItems: "center", gap: 10, paddingVertical: 28 },
  loadingText: { color: "#6b7280", fontSize: 14 },
  statsGrid: { flexDirection: "row", gap: 12, marginBottom: 20 },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  statOrange: { backgroundColor: "#fff7ed", borderColor: "#fed7aa" },
  statGreen: { backgroundColor: "#f0fdf4", borderColor: "#bbf7d0" },
  statValue: {
    fontSize: 30,
    fontWeight: "900",
    color: "#111827",
    marginTop: 10,
  },
  statLabel: { fontSize: 12, color: "#6b7280", marginTop: 4 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 22,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 20,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  cardTitle: { fontSize: 20, fontWeight: "700", color: "#111827" },
  focusLabel: { color: "#6b7280", fontSize: 13, marginTop: 20 },
  focusValue: {
    color: "#0ea5e9",
    fontSize: 20,
    fontWeight: "900",
    marginTop: 4,
  },
  topicList: { gap: 14, marginTop: 20 },
  topicRow: { gap: 8 },
  topicTop: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  topicName: { flex: 1, color: "#111827", fontSize: 14, fontWeight: "700" },
  topicCount: { color: "#6b7280", fontSize: 12, fontWeight: "700" },
  topicTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: "#e0f2fe",
    overflow: "hidden",
  },
  topicBar: { height: "100%", borderRadius: 999, backgroundColor: "#0ea5e9" },
  logoutButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 100,
  },
  logoutText: { color: "#b91c1c", fontSize: 15, fontWeight: "700" },
  buttonPressed: { opacity: 0.95, transform: [{ scale: 0.98 }] },
});
