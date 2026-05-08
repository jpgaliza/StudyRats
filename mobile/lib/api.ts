import Constants from "expo-constants";
import { Platform } from "react-native";

export interface BackendUser {
  id: number;
  name: string;
  email: string;
  username?: string;
}

export interface BackendGroup {
  id: number;
  name: string;
  owner_id: number;
  invite_code: string;
  description?: string | null;
  challenge_duration_days?: number | null;
  challenge_started_at?: string | null;
  challenge_ends_at?: string | null;
  users_count?: number;
}

type RequestOptions = RequestInit & {
  auth?: boolean;
};

export class ApiRequestError extends Error {
  status: number;
  details?: Record<string, string[]>;

  constructor(
    message: string,
    status: number,
    details?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.details = details;
  }
}

const envApiUrl = (
  globalThis as {
    process?: { env?: Record<string, string | undefined> };
  }
).process?.env?.EXPO_PUBLIC_API_URL?.trim();

function getLocalNetworkApiUrl() {
  const hostUri = Constants.expoConfig?.hostUri?.trim();

  if (!hostUri) {
    return Platform.OS === "android"
      ? "http://10.0.2.2:8000/api"
      : "http://localhost:8000/api";
  }

  let host = hostUri;

  try {
    host = new URL(hostUri).hostname;
  } catch {
    host = hostUri.replace(/^.*?:\/\//, "").split(":")[0];
  }

  return `http://${host}:8000/api`;
}

export const API_BASE_URL = envApiUrl
  ? envApiUrl.replace(/\/$/, "")
  : getLocalNetworkApiUrl();

let authToken: string | null = null;
let authUser: BackendUser | null = null;

export function setSession(token: string, user: BackendUser) {
  authToken = token;
  authUser = user;
}

export function clearSession() {
  authToken = null;
  authUser = null;
}

export function getSessionToken() {
  return authToken;
}

export function getSessionUser() {
  return authUser;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { auth = true, ...init } = options;
  const headers = new Headers(init.headers);

  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }

  headers.set("Accept", "application/json");

  if (auth && authToken) {
    headers.set("Authorization", `Bearer ${authToken}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  const text = await response.text();
  let data: unknown = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    throw new ApiRequestError(
      (data as { message?: string; error?: string } | null)?.message ||
        (data as { message?: string; error?: string } | null)?.error ||
        "Request failed",
      response.status,
      (data as { errors?: Record<string, string[]> } | null)?.errors,
    );
  }

  return data as T;
}

export async function register(payload: {
  name: string;
  email: string;
  password: string;
}) {
  return request<{ message: string; user: BackendUser }>("/register", {
    method: "POST",
    body: JSON.stringify(payload),
    auth: false,
  });
}

export async function login(payload: { email: string; password: string }) {
  return request<{ user: BackendUser; token: string }>("/login", {
    method: "POST",
    body: JSON.stringify(payload),
    auth: false,
  });
}

export async function me() {
  return request<BackendUser>("/me", { method: "GET" });
}

export async function logout() {
  return request<{ message: string }>("/logout", { method: "POST" });
}

export async function getGroups() {
  return request<BackendGroup[]>("/groups", { method: "GET" });
}

export async function createGroup(payload: {
  name: string;
  description?: string;
  challengeDurationDays: number;
}) {
  return request<BackendGroup>("/groups", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateGroup(
  id: number,
  payload: { name: string; description?: string },
) {
  return request<BackendGroup>(`/groups/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function joinGroup(payload: { code: string }) {
  return request<{ message: string }>("/groups/join", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateUserProfile(payload: { name?: string; email?: string }) {
  return request<BackendUser>("/profile", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function getGroupsUserStats() {
  return request<{
    activeGroups: number;
    totalGroups: number;
    studyChallengeWins: number;
  }>("/user/stats", { method: "GET" });
}
