import { Product, ProductReview, fallbackCrownWants, fallbackProducts, fallbackReviews } from "@/data/catalog";

export type CheckoutCustomer = {
  full_name: string;
  phone: string;
  email: string;
  address: string;
  pincode: string;
  city: string;
  state: string;
};

export type CheckoutLine = { id: string; qty: number };

export type PaymentSummary = {
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  items: { product_id: string; name: string; qty: number; unit_price: number; line_total: number }[];
};

export type Policy = {
  slug: string;
  title: string;
  summary: string;
  body: string;
};

export const fallbackPolicies: Policy[] = [
  {
    slug: "delivery-policy",
    title: "Delivery Policy",
    summary: "Express dispatch with careful packaging and tracking.",
    body: "Orders are packed within 24 hours and dispatched through tracked courier partners. Delivery timelines depend on the destination pincode and courier availability.",
  },
  {
    slug: "returns",
    title: "7 Days Return",
    summary: "Simple returns for unused products in original packaging.",
    body: "Return requests are accepted within 7 days of delivery when the product is unused, undamaged, and returned with all original accessories and packaging.",
  },
  {
    slug: "warranty",
    title: "1 Year Warranty",
    summary: "Coverage for manufacturing defects.",
    body: "Eligible Zyvanta products include a 1 year limited warranty against manufacturing defects. Damage caused by misuse, accidents, or unauthorized repair is excluded.",
  },
  {
    slug: "secure-payments",
    title: "Secure Payments",
    summary: "Encrypted checkout with verified payment confirmation.",
    body: "Online payments are processed through a certified payment gateway and verified server-side before any paid order is created.",
  },
];

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Request failed.");
  return data as T;
}

export async function getProducts() {
  try {
    const data = await request<{ products: Product[] }>("/api/products");
    return data.products?.length ? data.products : fallbackProducts;
  } catch {
    return fallbackProducts;
  }
}

export async function getFeaturedReviews() {
  try {
    const data = await request<{ reviews: ProductReview[] }>("/api/reviews?featured=true");
    return data.reviews?.length ? data.reviews : fallbackReviews;
  } catch {
    return fallbackReviews;
  }
}

export async function getHomepageSections() {
  try {
    const data = await request<{ sections: { section_key: string; content: unknown }[] }>("/api/homepage");
    const crown = data.sections.find((section) => section.section_key === "crown_wants")?.content as { items?: string[] } | undefined;
    return { crownWants: crown?.items?.length ? crown.items : fallbackCrownWants };
  } catch {
    return { crownWants: fallbackCrownWants };
  }
}

export async function getPolicies() {
  try {
    const data = await request<{ policies: Policy[] }>("/api/policies");
    return data.policies?.length ? data.policies : fallbackPolicies;
  } catch {
    return fallbackPolicies;
  }
}

export async function createPaymentOrder(customer: CheckoutCustomer, items: CheckoutLine[]) {
  return request<{ key_id: string; payment_order_id: string; amount: number; currency: string; summary: PaymentSummary }>("/api/payments/create", {
    method: "POST",
    body: JSON.stringify({ customer, items }),
  });
}

export async function verifyPayment(customer: CheckoutCustomer, items: CheckoutLine[], payment: unknown) {
  return request<{ order_id: string; total: number }>("/api/payments/verify", {
    method: "POST",
    body: JSON.stringify({ customer, items, payment }),
  });
}

export async function createCodOrder(customer: CheckoutCustomer, items: CheckoutLine[]) {
  return request<{ order_id: string; total: number }>("/api/orders", {
    method: "POST",
    body: JSON.stringify({ customer, items }),
  });
}

export async function adminRequest<T>(url: string, token: string, init?: RequestInit) {
  return request<T>(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init?.headers || {}),
    },
  });
}
