import type { VercelRequest, VercelResponse } from "@vercel/node";
import { allowMethods, json } from "./_lib/http";
import { requireAdmin, supabaseConfigured, supabaseFetch } from "./_lib/supabase";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!allowMethods(req, res, ["GET", "PUT", "OPTIONS"])) return;
  try {
    if (!supabaseConfigured()) return json(res, 503, { error: "Supabase is not configured." });

    if (req.method === "GET") {
      const sections = await supabaseFetch("homepage_sections?select=*&order=sort_order.asc");
      return json(res, 200, { sections });
    }

    await requireAdmin(req);
    const key = String(req.query.key || req.body?.section_key || "");
    if (!key) return json(res, 400, { error: "Section key is required." });
    const [section] = await supabaseFetch<unknown[]>(`homepage_sections?section_key=eq.${encodeURIComponent(key)}`, {
      method: "PATCH",
      body: { content: req.body.content, updated_at: new Date().toISOString() },
      prefer: "return=representation",
    });
    return json(res, 200, { section });
  } catch (error) {
    return json(res, 500, { error: error instanceof Error ? error.message : "Homepage request failed." });
  }
}
