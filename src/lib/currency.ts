// USD-priced product data is converted to INR for display.
// Approximate FX (kept as a constant; update if needed).
export const USD_TO_INR = 83;

const fmt = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const fmt2 = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

export const inr = (usd: number) => fmt.format(Math.round(usd * USD_TO_INR));
export const inr2 = (usd: number) => fmt2.format(usd * USD_TO_INR);
