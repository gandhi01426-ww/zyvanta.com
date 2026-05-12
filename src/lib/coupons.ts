export type Coupon = { code: string; type: "flat" | "percent"; value: number; minOrder?: number; label: string };

export const COUPONS: Coupon[] = [
  { code: "ZYV200", type: "flat", value: 200, minOrder: 999, label: "₹200 off above ₹999" },
  { code: "ROYAL10", type: "percent", value: 10, minOrder: 1999, label: "10% off above ₹1,999" },
  { code: "WELCOME15", type: "percent", value: 15, minOrder: 2999, label: "15% off above ₹2,999" },
  { code: "FREESHIP", type: "flat", value: 99, label: "Free shipping" },
];

export const applyCoupon = (code: string, subtotal: number): { coupon?: Coupon; discount: number; error?: string } => {
  const c = COUPONS.find((x) => x.code.toUpperCase() === code.trim().toUpperCase());
  if (!c) return { discount: 0, error: "Invalid coupon code" };
  if (c.minOrder && subtotal < c.minOrder) return { discount: 0, error: `Minimum order ₹${c.minOrder} required` };
  const discount = c.type === "flat" ? c.value : Math.round((subtotal * c.value) / 100);
  return { coupon: c, discount };
};
