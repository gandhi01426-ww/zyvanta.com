import type { VercelRequest, VercelResponse } from "@vercel/node";
import { allowMethods, json, requireEnv } from "../_lib/http";
import { priceCheckout, validateCustomer } from "../_lib/pricing";

function razorpayAuth() {
  const keyId = requireEnv("RAZORPAY_KEY_ID");
  const keySecret = requireEnv("RAZORPAY_KEY_SECRET");
  return {
    keyId,
    authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!allowMethods(req, res, ["POST", "OPTIONS"])) return;
  try {
    const { customer, items } = req.body || {};
    const errors = validateCustomer(customer || {});
    if (errors.length) return json(res, 400, { error: errors[0], errors });
    const priced = await priceCheckout(items);
    const { keyId, authorization } = razorpayAuth();

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: authorization,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: priced.total * 100,
        currency: "INR",
        receipt: `zyv_${Date.now()}`,
        notes: {
          customer_phone: customer.phone,
          item_count: String(priced.items.reduce((sum, item) => sum + item.qty, 0)),
        },
      }),
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || "Payment gateway order creation failed.");
    }

    const order = await response.json();
    return json(res, 200, {
      key_id: keyId,
      payment_order_id: order.id,
      amount: priced.total,
      currency: "INR",
      summary: priced,
    });
  } catch (error) {
    return json(res, 500, { error: error instanceof Error ? error.message : "Payment could not be started." });
  }
}
