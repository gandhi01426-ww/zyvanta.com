import type { VercelRequest, VercelResponse } from "@vercel/node";
import { allowMethods, json } from "./_lib/http";
import { priceCheckout, validateCustomer } from "./_lib/pricing";
import { requireAdmin, supabaseConfigured, supabaseFetch } from "./_lib/supabase";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!allowMethods(req, res, ["GET", "POST", "OPTIONS"])) return;
  try {
    if (!supabaseConfigured()) return json(res, 503, { error: "Supabase is not configured." });

    if (req.method === "GET") {
      await requireAdmin(req);
      const orders = await supabaseFetch("orders?select=*,order_items(*)&order=created_at.desc");
      return json(res, 200, { orders });
    }

    const { customer, items } = req.body || {};
    const errors = validateCustomer(customer || {});
    if (errors.length) return json(res, 400, { error: errors[0], errors });
    const priced = await priceCheckout(items);
    const [savedCustomer] = await supabaseFetch<{ id: string }[]>("customers", {
      method: "POST",
      body: {
        full_name: customer.full_name.trim(),
        phone: customer.phone,
        email: customer.email.trim().toLowerCase(),
        address: customer.address.trim(),
        pincode: customer.pincode,
        city: customer.city.trim(),
        state: customer.state.trim(),
      },
      prefer: "return=representation",
    });

    const [order] = await supabaseFetch<{ id: string }[]>("orders", {
      method: "POST",
      body: {
        customer_id: savedCustomer.id,
        customer_name: customer.full_name.trim(),
        customer_phone: customer.phone,
        customer_email: customer.email.trim().toLowerCase(),
        address: customer.address.trim(),
        pincode: customer.pincode,
        city: customer.city.trim(),
        state: customer.state.trim(),
        subtotal: priced.subtotal,
        shipping: priced.shipping,
        tax: priced.tax,
        discount: priced.discount,
        total: priced.total,
        payment_method: "cod",
        payment_status: "cod_pending",
        order_status: "confirmed",
      },
      prefer: "return=representation",
    });

    await supabaseFetch("order_items", {
      method: "POST",
      body: priced.items.map((item) => ({ ...item, order_id: order.id })),
    });

    return json(res, 201, { order_id: order.id, total: priced.total });
  } catch (error) {
    return json(res, 500, { error: error instanceof Error ? error.message : "Order request failed." });
  }
}
