import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";
import { allowMethods, json, requireEnv } from "../_lib/http";
import { priceCheckout, validateCustomer } from "../_lib/pricing";
import { supabaseConfigured, supabaseFetch } from "../_lib/supabase";

function authorizationHeader() {
  const keyId = requireEnv("RAZORPAY_KEY_ID");
  const keySecret = requireEnv("RAZORPAY_KEY_SECRET");
  return `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;
}

async function razorpayGet<T>(path: string): Promise<T> {
  const response = await fetch(`https://api.razorpay.com/v1/${path}`, {
    headers: { Authorization: authorizationHeader() },
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Payment verification lookup failed.");
  }
  return response.json() as Promise<T>;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!allowMethods(req, res, ["POST", "OPTIONS"])) return;
  try {
    if (!supabaseConfigured()) return json(res, 503, { error: "Supabase is not configured." });

    const { customer, items, payment } = req.body || {};
    const errors = validateCustomer(customer || {});
    if (errors.length) return json(res, 400, { error: errors[0], errors });
    if (!payment?.razorpay_order_id || !payment?.razorpay_payment_id || !payment?.razorpay_signature) {
      return json(res, 400, { error: "Payment verification details are missing." });
    }

    const expected = crypto
      .createHmac("sha256", requireEnv("RAZORPAY_KEY_SECRET"))
      .update(`${payment.razorpay_order_id}|${payment.razorpay_payment_id}`)
      .digest("hex");

    if (expected !== payment.razorpay_signature) {
      return json(res, 400, { error: "Payment signature verification failed." });
    }

    const priced = await priceCheckout(items);
    const paymentRecord = await razorpayGet<{ amount: number; status: string; order_id: string; currency: string }>(
      `payments/${encodeURIComponent(payment.razorpay_payment_id)}`,
    );
    const gatewayOrder = await razorpayGet<{ amount: number; status: string; id: string }>(
      `orders/${encodeURIComponent(payment.razorpay_order_id)}`,
    );

    if (paymentRecord.order_id !== payment.razorpay_order_id || gatewayOrder.id !== payment.razorpay_order_id) {
      return json(res, 400, { error: "Payment order mismatch." });
    }
    if (paymentRecord.currency !== "INR" || paymentRecord.amount !== priced.total * 100 || gatewayOrder.amount !== priced.total * 100) {
      return json(res, 400, { error: "Payment amount verification failed." });
    }
    if (!["captured", "authorized"].includes(paymentRecord.status)) {
      return json(res, 402, { error: "Payment was not completed." });
    }

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
        payment_method: "online",
        payment_status: "paid",
        order_status: "confirmed",
        razorpay_order_id: payment.razorpay_order_id,
        razorpay_payment_id: payment.razorpay_payment_id,
      },
      prefer: "return=representation",
    });

    await supabaseFetch("order_items", {
      method: "POST",
      body: priced.items.map((item) => ({ ...item, order_id: order.id })),
    });

    return json(res, 200, { order_id: order.id, total: priced.total });
  } catch (error) {
    return json(res, 500, { error: error instanceof Error ? error.message : "Payment verification failed." });
  }
}
