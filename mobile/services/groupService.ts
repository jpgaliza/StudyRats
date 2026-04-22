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

export async function updateGroup(id: number, name: string) {
  const res = await api.put(`/groups/${id}`, { name });
  return res.data;
}

export async function deleteGroup(id: number) {
  const res = await api.delete(`/groups/${id}`);
  return res.data;
}

export async function getGroup(id: number) {
  const res = await api.get(`/groups/${id}`);
  return res.data;
}