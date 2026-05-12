import type { VercelRequest, VercelResponse } from "@vercel/node";
import { allowMethods, json } from "./_lib/http";
import { requireAdmin, supabaseConfigured, supabaseFetch } from "./_lib/supabase";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!allowMethods(req, res, ["GET", "POST", "PUT", "DELETE", "OPTIONS"])) return;
  try {
    if (!supabaseConfigured()) return json(res, 503, { error: "Supabase is not configured." });

    if (req.method === "GET") {
      const rows = await supabaseFetch("products?select=*&is_active=eq.true&order=sort_order.asc,name.asc");
      return json(res, 200, { products: rows });
    }

    await requireAdmin(req);

    if (req.method === "POST") {
      const [product] = await supabaseFetch<unknown[]>("products", {
        method: "POST",
        body: { ...req.body, updated_at: new Date().toISOString() },
        prefer: "return=representation",
      });
      return json(res, 201, { product });
    }

    const id = String(req.query.id || req.body?.id || "");
    if (!id) return json(res, 400, { error: "Product id is required." });

    if (req.method === "PUT") {
      const [product] = await supabaseFetch<unknown[]>(`products?id=eq.${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: { ...req.body, id: undefined, updated_at: new Date().toISOString() },
        prefer: "return=representation",
      });
      return json(res, 200, { product });
    }

    await supabaseFetch(`products?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: { is_active: false, updated_at: new Date().toISOString() },
    });
    return json(res, 200, { ok: true });
  } catch (error) {
    return json(res, 500, { error: error instanceof Error ? error.message : "Product request failed." });
  }
}
