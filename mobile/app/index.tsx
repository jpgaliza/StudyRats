import { Redirect } from "expo-router";

export default function Index() {
  // Start at the login screen
  return <Redirect href="/(auth)/login" />;
}
