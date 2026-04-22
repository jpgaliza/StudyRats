import { Stack } from "expo-router";

export default function LeaderboardLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: true,
          headerTitle: "Leaderboard",
          headerBackTitle: "Back",
        }}
      />
    </Stack>
  );
}
