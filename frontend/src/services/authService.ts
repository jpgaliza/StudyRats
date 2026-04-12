import api from "./api";

export async function login(email: string, password: string) {
  const res = await api.post("/login", { email, password });
  localStorage.setItem("token", res.data.token);
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
    localStorage.removeItem("token");
    return null;
  }
}

export async function logout() {
  await api.post("/logout");
  localStorage.removeItem("token");
}