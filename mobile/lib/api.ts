import { Platform } from "react-native";

export interface BackendUser {
  id: number;
  name: string;
  email: string;
  username?: string | null;
  avatar?: string | null;
  updated_at?: string | null;
}

export interface BackendGroup {
  id: number;
  name: string;
  description?: string | null;
  ends_at?: string | null;
  owner_id: number;
  invite_code: string;
  users_count?: number;
  users?: BackendUser[];
}

export interface LeaderboardPreviewMember {
  user_id: string;
  name: string;
  avatar: string;
  check_in_count: number;
}

export interface LeaderboardMember {
  user_id: number;
  name: string;
  username: string;
  avatar: string;
  rank: number;
  check_in_count: number;
}

export interface LeaderboardPayload {
  group: { id: number; name: string };
  period: string;
  members: LeaderboardMember[];
  top_members: LeaderboardMember[];
}

export interface DashboardStats {
  streak_days: number;
  weekly_check_ins: number;
  topic_breakdown: { topic: string; check_ins_count: number }[];
}

export interface PublicProfilePayload {
  user: {
    id: number;
    name: string;
    username: string;
    avatar: string;
  };
  group: { id: number; name: string };
  streak_days: number;
  weekly_check_ins: number;
  monthly_check_ins: number;
  top_topic: { topic: string; check_ins_count: number } | null;
  ranking_position: number | null;
}

export interface FeedItem {
  id: number;
  topic: string;
  note: string | null;
  image_url: string | null;
  created_at: string;
  user: {
    id: number;
    name: string;
    username: string;
    avatar: string;
  };
  group: { id: number; name: string } | null;
}

export type CreatedCheckIn = FeedItem;

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

function webDefaultApiUrl() {
  const location = (
    globalThis as {
      location?: { protocol?: string; hostname?: string };
    }
  ).location;
  const protocol = location?.protocol === "https:" ? "https:" : "http:";
  const hostname = location?.hostname || "127.0.0.1";
  return `${protocol}//${hostname}:8088/api`;
}

export const API_BASE_URL = envApiUrl
  ? envApiUrl.replace(/\/$/, "")
  : Platform.OS === "web"
    ? webDefaultApiUrl()
    : Platform.OS === "android"
    ? "http://10.0.2.2:8088/api"
    : "http://127.0.0.1:8088/api";

/** Base HTTP origin for static files (e.g. /storage/...), without the /api suffix. */
export function apiOrigin(): string {
  return API_BASE_URL.replace(/\/?api\/?$/, "");
}

export function defaultAvatarUrl(): string {
  return `${apiOrigin()}/default-avatar.png`;
}

export function resolveStorageUrl(
  path: string | null,
  cacheKey?: string | number | null,
): string | null {
  if (!path) return null;
  const url = path.startsWith("http") ? path : apiOrigin() + path;
  if (!cacheKey) return url;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}v=${encodeURIComponent(String(cacheKey))}`;
}

const SESSION_STORAGE_KEY = "studyrats.session";
const ACTIVE_SESSION_KEY = "studyrats.activeSession";

function getWebStorage() {
  return (
    globalThis as {
      localStorage?: {
        getItem(key: string): string | null;
        setItem(key: string, value: string): void;
        removeItem(key: string): void;
      };
    }
  ).localStorage;
}

function getWebSessionStorage() {
  return (
    globalThis as {
      sessionStorage?: {
        getItem(key: string): string | null;
        setItem(key: string, value: string): void;
        removeItem(key: string): void;
      };
    }
  ).sessionStorage;
}

function readStoredSession(): { token: string; user: BackendUser } | null {
  const storage = getWebStorage();
  const sessionStorage = getWebSessionStorage();
  if (!storage) return null;
  if (sessionStorage && sessionStorage.getItem(ACTIVE_SESSION_KEY) !== "1") {
    storage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }

  try {
    const raw = storage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      token?: string;
      user?: BackendUser;
    };
    if (!parsed.token || !parsed.user) return null;
    return { token: parsed.token, user: parsed.user };
  } catch {
    storage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }
}

const storedSession = readStoredSession();
let authToken: string | null = storedSession?.token ?? null;
let authUser: BackendUser | null = storedSession?.user ?? null;

export function setSession(token: string, user: BackendUser) {
  authToken = token;
  authUser = user;
  getWebSessionStorage()?.setItem(ACTIVE_SESSION_KEY, "1");
  getWebStorage()?.setItem(SESSION_STORAGE_KEY, JSON.stringify({ token, user }));
}

export function clearSession() {
  authToken = null;
  authUser = null;
  getWebSessionStorage()?.removeItem(ACTIVE_SESSION_KEY);
  getWebStorage()?.removeItem(SESSION_STORAGE_KEY);
}

export function getSessionToken() {
  if (getWebSessionStorage() && getWebSessionStorage()?.getItem(ACTIVE_SESSION_KEY) !== "1") {
    clearSession();
    return null;
  }
  return authToken;
}

export function getSessionUser() {
  if (getWebSessionStorage() && getWebSessionStorage()?.getItem(ACTIVE_SESSION_KEY) !== "1") {
    clearSession();
    return null;
  }
  return authUser;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { auth = true, ...init } = options;
  const headers = new Headers(init.headers);
  const controller = !init.signal ? new AbortController() : null;
  const timeout = controller
    ? setTimeout(() => controller.abort(), 15000)
    : null;
  const skipJsonContentType = typeof FormData !== "undefined" && init.body instanceof FormData;

  if (!skipJsonContentType && !headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }

  headers.set("Accept", "application/json");

  if (auth && authToken) {
    headers.set("Authorization", `Bearer ${authToken}`);
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers,
      signal: init.signal ?? controller?.signal,
    });
  } catch (e) {
    const isNetwork =
      e instanceof TypeError ||
      (e instanceof Error &&
        (e.name === "AbortError" ||
          e.message === "Failed to fetch" ||
          e.message === "Network request failed"));
    if (isNetwork) {
      throw new ApiRequestError(
        "Sem conexao com a API. Verifique se o Docker esta rodando e se a porta 8088 esta acessivel.",
        0,
      );
    }
    throw e;
  } finally {
    if (timeout) clearTimeout(timeout);
  }

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
    const body = data as {
      message?: string;
      error?: string;
      errors?: Record<string, string[]>;
    } | null;
    const fieldErrors = body?.errors;
    let message =
      body?.message ||
      body?.error ||
      "Falha na requisicao";
    if (fieldErrors && typeof fieldErrors === "object") {
      const lines = Object.values(fieldErrors)
        .flat()
        .filter((s): s is string => Boolean(s));
      if (lines.length) {
        message = lines.join("\n");
      }
    }
    throw new ApiRequestError(message, response.status, fieldErrors);
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

export async function updateMe(payload: {
  name?: string;
  avatar?: string | null;
  avatarUri?: string;
  mimeType?: string;
  filename?: string;
}) {
  const form = new FormData();
  if (payload.name !== undefined) form.append("name", payload.name);
  if (payload.avatar !== undefined) form.append("avatar", payload.avatar ?? "");

  if (payload.avatarUri) {
    const filename =
      payload.filename ||
      payload.avatarUri.split("/").pop()?.split("?")[0] ||
      "avatar.jpg";
    const mimeType = payload.mimeType || "image/jpeg";

    if (Platform.OS === "web") {
      const imageResponse = await fetch(payload.avatarUri);
      const imageBlob = await imageResponse.blob();
      form.append("avatar_file", imageBlob, filename);
    } else {
      form.append(
        "avatar_file",
        {
          uri: payload.avatarUri,
          name: filename,
          type: mimeType,
        } as unknown as Blob,
      );
    }
  }

  return request<BackendUser>("/me", {
    method: "POST",
    body: form,
  });
}

export async function logout() {
  return request<{ message: string }>("/logout", { method: "POST" });
}

export async function getGroups() {
  return request<BackendGroup[]>("/groups", { method: "GET" });
}

export async function getGroup(groupId: string | number) {
  return request<BackendGroup>(`/groups/${encodeURIComponent(String(groupId))}`, {
    method: "GET",
  });
}

export async function createGroup(payload: {
  name: string;
  description?: string | null;
  ends_at?: string | null;
}) {
  return request<BackendGroup>("/groups", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function joinGroup(payload: { code: string }) {
  return request<{ message: string }>("/groups/join", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function removeGroupMember(groupId: string | number, userId: string | number) {
  return request<{ message: string }>(
    `/groups/${encodeURIComponent(String(groupId))}/members/${encodeURIComponent(String(userId))}`,
    { method: "DELETE" },
  );
}

export async function transferGroupOwnership(groupId: string | number, userId: string | number) {
  return request<{ message: string; group: BackendGroup }>(
    `/groups/${encodeURIComponent(String(groupId))}/members/${encodeURIComponent(String(userId))}/transfer-owner`,
    { method: "POST" },
  );
}

export async function getDashboard() {
  return request<DashboardStats>("/me/dashboard", { method: "GET" });
}

export async function getPublicProfile(groupId: string | number, userId: string | number) {
  return request<PublicProfilePayload>(
    `/groups/${encodeURIComponent(String(groupId))}/members/${encodeURIComponent(String(userId))}/profile`,
    { method: "GET" },
  );
}

export async function getFeedCheckIns(limit = 30) {
  const qs = limit ? `?limit=${encodeURIComponent(String(limit))}` : "";
  return request<FeedItem[]>(`/feed/check-ins${qs}`, { method: "GET" });
}

export async function getLeaderboard(
  groupId: string | number,
  period: "daily" | "weekly" | "monthly" = "monthly",
) {
  const qs = `?period=${encodeURIComponent(period)}`;
  return request<LeaderboardPayload>(
    `/groups/${encodeURIComponent(String(groupId))}/leaderboard${qs}`,
    { method: "GET" },
  );
}

export async function getLeaderboardPreview(
  groupId: string | number,
  period: "daily" | "weekly" | "monthly" = "monthly",
) {
  const qs = `?period=${encodeURIComponent(period)}`;
  return request<{
    group_id: number;
    period: string;
    top_members: LeaderboardPreviewMember[];
  }>(
    `/groups/${encodeURIComponent(String(groupId))}/leaderboard/preview${qs}`,
    { method: "GET" },
  );
}

export async function createCheckIn(
  groupId: string | number,
  params: {
    topic: string;
    note?: string;
    imageUri: string;
    mimeType?: string;
    filename?: string;
  },
) {
  const form = new FormData();
  form.append("topic", params.topic);
  if (params.note) form.append("note", params.note);
  const filename =
    params.filename ||
    params.imageUri.split("/").pop()?.split("?")[0] ||
    "checkin.jpg";
  const mimeType = params.mimeType || "image/jpeg";

  if (Platform.OS === "web") {
    const imageResponse = await fetch(params.imageUri);
    const imageBlob = await imageResponse.blob();
    form.append("image", imageBlob, filename);
  } else {
    form.append(
      "image",
      {
        uri: params.imageUri,
        name: filename,
        type: mimeType,
      } as unknown as Blob,
    );
  }

  return request<{ message: string; check_in?: CreatedCheckIn }>(
    `/groups/${encodeURIComponent(String(groupId))}/check-ins`,
    {
      method: "POST",
      body: form,
    },
  );
}
