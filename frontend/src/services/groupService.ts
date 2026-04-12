import api from "./api";

export async function createGroup(name: string) {
  const response = await api.post("/groups", { name });
  return response.data;
}

export async function joinGroup(code: string) {
  const response = await api.post("/groups/join", { code });
  return response.data;
}

export async function listGroups() {
  const response = await api.get("/groups");
  return response.data;
}