import type { VercelRequest, VercelResponse } from "@vercel/node";

export function json(res: VercelResponse, status: number, body: unknown) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  return res.status(status).json(body);
}

export function allowMethods(req: VercelRequest, res: VercelResponse, methods: string[]) {
  res.setHeader("Allow", methods.join(", "));
  if (req.method === "OPTIONS") return json(res, 200, { ok: true });
  if (!req.method || !methods.includes(req.method)) {
    json(res, 405, { error: "Method not allowed" });
    return false;
  }
  return true;
}

export function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

export function getBearerToken(req: VercelRequest) {
  const header = req.headers.authorization || "";
  const [type, token] = header.split(" ");
  return type?.toLowerCase() === "bearer" ? token : "";
}
