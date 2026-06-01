import { Redirect } from "expo-router";
import { getSessionToken } from "@/lib/api";

export default function Index() {
  return <Redirect href={getSessionToken() ? "/(tabs)" : "/login"} />;
}
