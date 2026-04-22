import { View, Text, Pressable, StyleSheet } from "react-native";
import { router } from "expo-router";
import LogoutButton from "../components/LogoutButton";

export default function Welcome() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Welcome to Study Rats 🐀
      </Text>

      <Text style={styles.subtitle}>
        Create or join a group to start studying together
      </Text>

      <View style={styles.actions}>
        <Pressable
          onPress={() => router.push("/groups")}
          style={styles.primaryButton}
        >
          <Text style={styles.primaryButtonText}>
            Groups
          </Text>
        </Pressable>
      </View>

      <LogoutButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    backgroundColor: "#0f172a",
    padding: 20,
  },

  title: {
    fontSize: 34,
    fontWeight: "700",
    color: "white",
    textAlign: "center",
  },

  subtitle: {
    color: "rgba(255,255,255,0.7)",
    maxWidth: 320,
    textAlign: "center",
    lineHeight: 20,
  },

  actions: {
    marginTop: 10,
  },

  primaryButton: {
    backgroundColor: "#22c55e",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },

  primaryButtonText: {
    color: "white",
    fontWeight: "600",
  },
});