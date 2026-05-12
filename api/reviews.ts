import type { VercelRequest, VercelResponse } from "@vercel/node";
import { allowMethods, json } from "./_lib/http";
import { requireAdmin, supabaseConfigured, supabaseFetch } from "./_lib/supabase";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!allowMethods(req, res, ["GET", "POST", "PUT", "DELETE", "OPTIONS"])) return;
  try {
    if (!supabaseConfigured()) return json(res, 503, { error: "Supabase is not configured." });

    if (req.method === "GET") {
      const productId = req.query.product_id ? `&product_id=eq.${encodeURIComponent(String(req.query.product_id))}` : "";
      const featured = req.query.featured === "true" ? "&is_featured=eq.true" : "";
      const rows = await supabaseFetch(`reviews?select=*&is_active=eq.true${productId}${featured}&order=created_at.desc`);
      return json(res, 200, { reviews: rows });
    }

    await requireAdmin(req);

    if (req.method === "POST") {
      const [review] = await supabaseFetch<unknown[]>("reviews", {
        method: "POST",
        body: req.body,
        prefer: "return=representation",
      });
      return json(res, 201, { review });
    }

    const id = String(req.query.id || req.body?.id || "");
    if (!id) return json(res, 400, { error: "Review id is required." });

    if (req.method === "PUT") {
      const [review] = await supabaseFetch<unknown[]>(`reviews?id=eq.${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: { ...req.body, id: undefined },
        prefer: "return=representation",
      });
      return json(res, 200, { review });
    }

    await supabaseFetch(`reviews?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: { is_active: false },
    });
    return json(res, 200, { ok: true });
  } catch (error) {
    return json(res, 500, { error: error instanceof Error ? error.message : "Review request failed." });
  }
}
