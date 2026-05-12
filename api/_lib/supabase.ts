import type { VercelRequest } from "@vercel/node";
import { getBearerToken, requireEnv } from "./http";

type QueryOptions = {
  method?: string;
  body?: unknown;
  token?: string;
  prefer?: string;
  select?: string;
};

const publicTables = new Set(["products", "reviews", "homepage_sections", "delivery_policies"]);

export function supabaseConfigured() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export async function supabaseFetch<T>(path: string, options: QueryOptions = {}): Promise<T> {
  const baseUrl = requireEnv("SUPABASE_URL").replace(/\/$/, "");
  const serviceKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  const url = `${baseUrl}/rest/v1/${path}`;
  const headers: Record<string, string> = {
    apikey: serviceKey,
    Authorization: `Bearer ${options.token || serviceKey}`,
    "Content-Type": "application/json",
  };
  if (options.prefer) headers.Prefer = options.prefer;
  if (options.select) headers.Select = options.select;

  const response = await fetch(url, {
    method: options.method || "GET",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Supabase request failed with ${response.status}`);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export async function getSupabaseUser(req: VercelRequest) {
  const token = getBearerToken(req);
  if (!token) return null;
  const baseUrl = requireEnv("SUPABASE_URL").replace(/\/$/, "");
  const anonKey = process.env.SUPABASE_ANON_KEY || requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  const response = await fetch(`${baseUrl}/auth/v1/user`, {
    headers: { apikey: anonKey, Authorization: `Bearer ${token}` },
  });
  if (!response.ok) return null;
  return response.json() as Promise<{ email?: string; app_metadata?: Record<string, unknown>; user_metadata?: Record<string, unknown> }>;
}

export async function requireAdmin(req: VercelRequest) {
  const user = await getSupabaseUser(req);
  const admins = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  const email = user?.email?.toLowerCase();
  const role = user?.app_metadata?.role || user?.user_metadata?.role;
  if (!user || !email || (!admins.includes(email) && role !== "admin")) {
    throw new Error("Admin access required");
  }
  return user;
}

export function isPublicTable(table: string) {
  return publicTables.has(table);
}
