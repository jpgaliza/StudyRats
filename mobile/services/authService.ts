import api from "./api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export async function login(email: string, password: string) {
  const res = await api.post("/login", { email, password });

  await AsyncStorage.setItem("token", res.data.token);

  return res.data;
}

export async function register(name: string, email: string, password: string) {
  const res = await api.post("/register", { name, email, password });
  return res.data;
}

export async function getMe() {
  try {
    const res = await api.get("/me");
    return res.data;
  } catch {
    await AsyncStorage.removeItem("token");
    return null;
  }
}

export async function logout() {
  try {
    await api.post("/logout");
  } finally {
    await AsyncStorage.removeItem("token");
  }
}