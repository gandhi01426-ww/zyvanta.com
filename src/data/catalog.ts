import p1 from "@/assets/product-1.webp";
import p2 from "@/assets/product-2.webp";
import p3 from "@/assets/product-3.webp";
import p4 from "@/assets/product-4.webp";

export type ProductCategory = "Audio" | "Wallets" | "Eyewear" | "Fragrance" | "Watches";

export type ProductReview = {
  id?: string;
  product_id?: string;
  name: string;
  role?: string;
  avatar?: string;
  rating: number;
  comment: string;
  photo?: string;
  is_featured?: boolean;
};

export type Product = {
  id: string;
  name: string;
  price: number;
  tag: string;
  category: ProductCategory;
  image: string;
  tagline: string;
  description: string;
  features: string[];
  rating: number;
  review_count: number;
  stock: number;
  is_featured?: boolean;
  reviews?: ProductReview[];
};

export const fallbackProducts: Product[] = [
  {
    id: "aurum-buds-pro",
    name: "Aurum Buds Pro",
    price: 189,
    tag: "Bestseller",
    category: "Audio",
    image: p1,
    tagline: "Audio, gilded.",
    description: "Studio-grade wireless earbuds wrapped in obsidian resin and 24K-inspired plating. Adaptive ANC tunes itself to your environment in real time.",
    features: ["Adaptive Active Noise Cancellation", "40h total battery with wireless charge case", "Hi-Res LDAC + spatial audio", "IP54 sweat & rain resistant"],
    rating: 4.9,
    review_count: 1284,
    stock: 34,
    is_featured: true,
  },
  {
    id: "noir-cardholder",
    name: "Noir Cardholder",
    price: 129,
    tag: "New",
    category: "Wallets",
    image: p2,
    tagline: "Carry like royalty.",
    description: "Hand-finished full-grain leather cardholder with a brushed gold spine and RFID shielding.",
    features: ["Full-grain Italian leather", "RFID-blocking inner layer", "Holds 8 cards + folded notes", "Lifetime craftsmanship warranty"],
    rating: 4.8,
    review_count: 612,
    stock: 42,
    is_featured: true,
  },
  {
    id: "solis-aviators",
    name: "Solis Aviators",
    price: 219,
    tag: "Limited",
    category: "Eyewear",
    image: p3,
    tagline: "Built for skylines.",
    description: "Titanium-frame aviators with polarized obsidian lenses and gold-mirror coating.",
    features: ["Aerospace-grade titanium frame", "Polarized UV400 lenses", "Anti-glare gold mirror coating", "Includes leather case + cloth"],
    rating: 4.9,
    review_count: 873,
    stock: 25,
    is_featured: true,
  },
  {
    id: "royal-essence-no-7",
    name: "Royal Essence No.7",
    price: 245,
    tag: "Exclusive",
    category: "Fragrance",
    image: p4,
    tagline: "A signature in scent.",
    description: "An eau de parfum of oud, saffron and amber sealed in a faceted obsidian flacon.",
    features: ["100ml EDP (24% concentration)", "Top: saffron, bergamot", "Heart: oud, rose absolute", "Base: amber, vanilla, musk"],
    rating: 5,
    review_count: 521,
    stock: 18,
    is_featured: true,
  },
  {
    id: "aurum-studio-over-ear",
    name: "Aurum Studio Over-Ear",
    price: 349,
    tag: "New",
    category: "Audio",
    image: p1,
    tagline: "Concert hall, on you.",
    description: "Reference over-ear cans with planar magnetic drivers and gold-stitched leather earpads.",
    features: ["Planar magnetic drivers", "60h battery", "Active Noise Cancellation Pro", "Memory-foam leather pads"],
    rating: 4.8,
    review_count: 642,
    stock: 16,
    is_featured: true,
  },
  {
    id: "aurum-sport-beats",
    name: "Aurum Sport Beats",
    price: 129,
    tag: "Limited",
    category: "Audio",
    image: p1,
    tagline: "Workout royalty.",
    description: "Sweat-proof open-fit earbuds with secure ear-hooks for runs, lifts and rides.",
    features: ["IP67 sweat & water proof", "Open-ear bone conduction mode", "16h battery + fast charge", "Featherweight 6g per bud"],
    rating: 4.7,
    review_count: 298,
    stock: 29,
  },
  {
    id: "noir-bifold-wallet",
    name: "Noir Bifold Wallet",
    price: 179,
    tag: "Classic",
    category: "Wallets",
    image: p2,
    tagline: "Heritage, refined.",
    description: "Classic bifold in obsidian leather with hand-burnished edges and gold thread.",
    features: ["12 card slots + 2 hidden", "Italian veg-tan leather", "Hand-burnished edges", "RFID protection"],
    rating: 4.8,
    review_count: 401,
    stock: 31,
  },
  {
    id: "noir-money-clip",
    name: "Noir Money Clip",
    price: 89,
    tag: "Minimal",
    category: "Wallets",
    image: p2,
    tagline: "Less, finely cut.",
    description: "Solid brass money clip plated in 18K gold tone with a leather card sleeve.",
    features: ["Solid brass body", "18K gold plating", "Magnetic card sleeve", "Pocket-flat 4mm profile"],
    rating: 4.7,
    review_count: 187,
    stock: 48,
  },
  {
    id: "solis-wayfarer-noir",
    name: "Solis Wayfarer Noir",
    price: 199,
    tag: "Iconic",
    category: "Eyewear",
    image: p3,
    tagline: "An icon, regilded.",
    description: "Acetate wayfarer in deep obsidian with gold-leaf temples and polarized smoked lenses.",
    features: ["Italian Mazzucchelli acetate", "Gold-leaf hinges", "Polarized smoked lenses", "Hand-finished temples"],
    rating: 4.8,
    review_count: 512,
    stock: 20,
  },
  {
    id: "solis-round-eclipse",
    name: "Solis Round Eclipse",
    price: 239,
    tag: "New",
    category: "Eyewear",
    image: p3,
    tagline: "Editorial, reimagined.",
    description: "Perfectly round titanium frames with a brushed gold finish and obsidian flat lenses.",
    features: ["Lightweight titanium", "Flat anti-reflective lenses", "Brushed gold finish", "UV400 protection"],
    rating: 4.7,
    review_count: 234,
    stock: 14,
  },
  {
    id: "royal-essence-noir",
    name: "Royal Essence Noir",
    price: 215,
    tag: "Bestseller",
    category: "Fragrance",
    image: p4,
    tagline: "Smoke and gold.",
    description: "Smoky leather, dark vanilla and incense, sealed in a sculpted obsidian flacon.",
    features: ["100ml EDP", "Top: incense, black pepper", "Heart: leather, iris", "Base: vanilla, tonka, oud"],
    rating: 4.9,
    review_count: 388,
    stock: 22,
    is_featured: true,
  },
  {
    id: "royal-essence-aurum",
    name: "Royal Essence Aurum",
    price: 199,
    tag: "Fresh",
    category: "Fragrance",
    image: p4,
    tagline: "Sunlit gold.",
    description: "Bergamot, neroli and white amber for daylight luxury.",
    features: ["100ml EDP", "Top: bergamot, neroli", "Heart: jasmine, orange blossom", "Base: white amber, musk"],
    rating: 4.8,
    review_count: 256,
    stock: 26,
  },
];

export const fallbackReviews: ProductReview[] = [
  { name: "Alexandra Vance", role: "Creative Director, NYC", rating: 5, comment: "Zyvanta's unboxing made me feel like royalty. The watch is a conversation starter at every meeting.", avatar: "https://i.pravatar.cc/150?img=47", is_featured: true },
  { name: "Marcus Reign", role: "Entrepreneur, London", rating: 5, comment: "I've owned every premium brand. Zyvanta blends them all into something more futuristic and refined.", avatar: "https://i.pravatar.cc/150?img=12", is_featured: true },
  { name: "Sofia Lehmann", role: "Architect, Berlin", rating: 5, comment: "The detail. The weight. The gold. Absolutely museum-grade craftsmanship at this price point.", avatar: "https://i.pravatar.cc/150?img=32", is_featured: true },
  { name: "Kenji Aoki", role: "Designer, Tokyo", rating: 5, comment: "Shipped in 2 days. Packaging alone deserves an award. Already ordered the sunglasses.", avatar: "https://i.pravatar.cc/150?img=68", is_featured: true },
];

export const fallbackCrownWants = [
  "Aurum Buds Pro",
  "Solis Aviators",
  "Royal Essence No.7",
  "Noir Cardholder",
  "Sport Beats",
  "Wayfarer Noir",
  "Money Clip",
  "Studio Over-Ear",
  "Bifold Wallet",
  "Round Eclipse",
  "Royal Essence Noir",
  "Royal Essence Aurum",
];
