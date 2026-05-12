import { supabaseConfigured, supabaseFetch } from "./supabase";

export type CheckoutItem = { id: string; qty: number };
export type CheckoutCustomer = {
  full_name: string;
  phone: string;
  email: string;
  address: string;
  pincode: string;
  city: string;
  state: string;
};

export type PricedItem = {
  product_id: string;
  name: string;
  qty: number;
  unit_price: number;
  line_total: number;
};

const fallbackPrices = [
  { id: "aurum-buds-pro", name: "Aurum Buds Pro", price: 189 },
  { id: "noir-cardholder", name: "Noir Cardholder", price: 129 },
  { id: "solis-aviators", name: "Solis Aviators", price: 219 },
  { id: "royal-essence-no-7", name: "Royal Essence No.7", price: 245 },
  { id: "aurum-studio-over-ear", name: "Aurum Studio Over-Ear", price: 349 },
  { id: "aurum-sport-beats", name: "Aurum Sport Beats", price: 129 },
  { id: "noir-bifold-wallet", name: "Noir Bifold Wallet", price: 179 },
  { id: "noir-money-clip", name: "Noir Money Clip", price: 89 },
  { id: "solis-wayfarer-noir", name: "Solis Wayfarer Noir", price: 199 },
  { id: "solis-round-eclipse", name: "Solis Round Eclipse", price: 239 },
  { id: "royal-essence-noir", name: "Royal Essence Noir", price: 215 },
  { id: "royal-essence-aurum", name: "Royal Essence Aurum", price: 199 },
];

export const USD_TO_INR = 83;

export function validateCustomer(customer: CheckoutCustomer) {
  const errors: string[] = [];
  if (!customer.full_name || customer.full_name.trim().length < 2) errors.push("Full name is required.");
  if (!/^\d{10}$/.test(customer.phone)) errors.push("Enter a valid 10-digit phone number.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) errors.push("Enter a valid email address.");
  if (!customer.address || customer.address.trim().length < 8) errors.push("Address is required.");
  if (!/^\d{6}$/.test(customer.pincode)) errors.push("Enter a valid 6-digit pincode.");
  if (!customer.city || customer.city.trim().length < 2) errors.push("City is required.");
  if (!customer.state || customer.state.trim().length < 2) errors.push("State is required.");
  return errors;
}

export function sanitizeItems(items: CheckoutItem[]) {
  if (!Array.isArray(items) || items.length === 0) throw new Error("Your bag is empty.");
  return items.map((item) => ({
    id: String(item.id || "").trim(),
    qty: Math.max(1, Math.min(20, Number(item.qty) || 1)),
  }));
}

export async function getServerProducts(ids: string[]) {
  if (supabaseConfigured()) {
    const filter = ids.map((id) => `"${id.replace(/"/g, "")}"`).join(",");
    return supabaseFetch<{ id: string; name: string; price: number; stock: number }[]>(
      `products?select=id,name,price,stock&id=in.(${filter})&is_active=eq.true`,
    );
  }
  return fallbackPrices.filter((product) => ids.includes(product.id)).map((product) => ({ ...product, stock: 99 }));
}

export async function priceCheckout(items: CheckoutItem[]) {
  const safeItems = sanitizeItems(items);
  const products = await getServerProducts([...new Set(safeItems.map((item) => item.id))]);
  const byId = new Map(products.map((product) => [product.id, product]));
  const pricedItems: PricedItem[] = safeItems.map((item) => {
    const product = byId.get(item.id);
    if (!product) throw new Error("One or more products are no longer available.");
    if (product.stock < item.qty) throw new Error(`${product.name} has only ${product.stock} in stock.`);
    const unit = Math.round(Number(product.price) * USD_TO_INR);
    return {
      product_id: product.id,
      name: product.name,
      qty: item.qty,
      unit_price: unit,
      line_total: unit * item.qty,
    };
  });
  const subtotal = pricedItems.reduce((sum, item) => sum + item.line_total, 0);
  const shipping = subtotal >= 2000 ? 0 : 99;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + shipping + tax;
  return { items: pricedItems, subtotal, shipping, tax, discount: 0, total };
}
