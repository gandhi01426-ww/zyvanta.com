import { Eye, ShoppingBag, Check, Sparkles, X, Star, Plus, Minus, Truck, RotateCcw, ShieldCheck, BadgePercent, MapPin, CreditCard, Package, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useCart } from "@/context/CartContext";
import { toast } from "@/hooks/use-toast";
import { inr } from "@/lib/currency";
import { Product, ProductCategory, ProductReview, fallbackReviews } from "@/data/catalog";
import { getPolicies, getProducts, Policy } from "@/services/api";

const Stars = ({ value, size = 14 }: { value: number; size?: number }) => (
  <div className="inline-flex items-center gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} style={{ width: size, height: size }} className={i < Math.round(value) ? "fill-gold text-gold" : "text-gold/30"} />
    ))}
  </div>
);

const getHighlights = (p: Product): string[] => {
  const base: Record<ProductCategory, string[]> = {
    Audio: ["Wireless Bluetooth 5.3", "Premium acoustic drivers", "In-built mic for calls", "Type-C fast charging", "Voice assistant ready"],
    Wallets: ["Genuine full-grain leather", "Slim, pocket-friendly profile", "RFID-protected interior", "Hand-finished stitching", "Gift-ready luxury packaging"],
    Eyewear: ["100% UV400 protection", "Polarized lenses", "Lightweight premium frame", "Anti-glare coating", "Includes case and cleaning cloth"],
    Fragrance: ["Eau de Parfum 100ml", "Long-lasting 8-12 hours", "Unisex luxury composition", "Cruelty-free, IFRA compliant", "Sealed obsidian flacon"],
    Watches: ["Sapphire crystal glass", "Swiss movement", "Water resistant 5 ATM", "Premium leather strap", "2-year international warranty"],
  };
  return p.features?.length ? p.features : base[p.category];
};

const ratingBreakdown = (rating: number, count: number) => {
  const fives = Math.round(count * (rating >= 4.8 ? 0.78 : rating >= 4.6 ? 0.66 : 0.55));
  const fours = Math.round(count * 0.2);
  const threes = Math.round(count * 0.06);
  const twos = Math.round(count * 0.03);
  const ones = Math.max(0, count - fives - fours - threes - twos);
  return [{ star: 5, n: fives }, { star: 4, n: fours }, { star: 3, n: threes }, { star: 2, n: twos }, { star: 1, n: ones }];
};

const ProductCard = ({ p, onOpen, onAdd }: { p: Product; onOpen: (p: Product) => void; onAdd: (p: Product) => void }) => {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(1000px) rotateX(${-y * 10}deg) rotateY(${x * 12}deg) translateY(-8px)`;
  };
  const onLeave = () => {
    if (ref.current) ref.current.style.transform = "";
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onClick={() => onOpen(p)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(p);
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${p.name}`}
      className="group relative rounded-3xl overflow-hidden glass gold-border tilt-card p-5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-gold/60"
      style={{ transition: "transform 0.4s cubic-bezier(0.22,1,0.36,1)" }}
    >
      <div className="absolute top-4 left-4 z-10 text-[10px] uppercase tracking-[0.25em] bg-gradient-gold text-noir px-3 py-1 rounded-full font-bold">{p.tag}</div>
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-noir-soft mb-5">
        <div className="absolute inset-0 bg-radial-gold opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <img src={p.image} alt={p.name} loading="lazy" width={800} height={800} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        <div className="absolute inset-x-4 bottom-4 flex gap-2 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
          <button type="button" onClick={(e) => { e.stopPropagation(); onOpen(p); }} className="flex-1 glass gold-border rounded-full py-2 text-xs uppercase tracking-widest text-gold inline-flex items-center justify-center gap-1.5">
            <Eye className="w-3.5 h-3.5" /> View
          </button>
          <button type="button" onClick={(e) => { e.stopPropagation(); onAdd(p); }} className="flex-1 bg-gradient-gold text-noir rounded-full py-2 text-xs uppercase tracking-widest font-bold inline-flex items-center justify-center gap-1.5">
            <ShoppingBag className="w-3.5 h-3.5" /> Add
          </button>
        </div>
      </div>
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-lg truncate">{p.name}</h3>
          <div className="mt-1 inline-flex items-center gap-1.5">
            <Stars value={p.rating} size={12} />
            <span className="text-[11px] text-muted-foreground">{p.rating} ({p.review_count})</span>
          </div>
        </div>
        <span className="text-gold-gradient font-bold text-xl shrink-0">{inr(p.price)}</span>
      </div>
    </div>
  );
};

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [active, setActive] = useState<Product | null>(null);
  const [qty, setQty] = useState(1);
  const [filter, setFilter] = useState<"All" | ProductCategory>("All");
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [policy, setPolicy] = useState<Policy | null>(null);
  const { add, openCart } = useCart();

  useEffect(() => {
    getProducts().then(setProducts);
    getPolicies().then(setPolicies);
  }, []);

  const categories = useMemo(() => ["All", ...Array.from(new Set(products.map((p) => p.category)))] as ("All" | ProductCategory)[], [products]);
  const visible = filter === "All" ? products : products.filter((p) => p.category === filter);
  const related = active ? products.filter((p) => p.category === active.category && p.id !== active.id).slice(0, 3) : [];

  const handleAdd = (p: Product, q = 1) => {
    add({ id: p.id, name: p.name, price: p.price, img: p.image }, q);
    toast({ title: "Added to bag", description: `${p.name} x ${q}` });
  };

  const openProduct = (p: Product) => {
    setActive(p);
    setQty(1);
  };

  return (
    <section id="shop" className="relative py-32">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-4">
          <span className="text-xs uppercase tracking-[0.4em] text-gold">The Collection</span>
          <h2 className="font-display text-4xl md:text-6xl"><span className="text-gold-gradient">Crafted</span> for the Elite</h2>
          <p className="text-muted-foreground">Tap any piece to reveal its story. Add to bag and check out in seconds.</p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {categories.map((c) => (
            <button key={c} onClick={() => setFilter(c)} className={`px-4 py-2 rounded-full text-[11px] uppercase tracking-[0.25em] border transition-all ${filter === c ? "bg-gradient-gold text-noir border-gold shadow-gold" : "border-gold/30 text-muted-foreground hover:text-gold hover:border-gold/60"}`}>
              {c}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {visible.map((p) => <ProductCard key={p.id} p={p} onOpen={openProduct} onAdd={(product) => handleAdd(product)} />)}
        </div>
      </div>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-none w-screen h-screen p-0 overflow-hidden bg-background border-0 sm:rounded-none [&>button]:hidden overflow-y-auto">
          {active && (
            <ProductFullView
              active={active}
              qty={qty}
              setQty={setQty}
              onClose={() => setActive(null)}
              onAdd={handleAdd}
              openCart={openCart}
              related={related}
              openProduct={openProduct}
              policies={policies}
              onPolicy={setPolicy}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!policy} onOpenChange={(o) => !o && setPolicy(null)}>
        <DialogContent className="glass gold-border border-0 sm:rounded-3xl shadow-elite">
          {policy && (
            <div className="p-2">
              <DialogTitle className="font-display text-3xl text-gold-gradient">{policy.title}</DialogTitle>
              <DialogDescription className="mt-2 text-muted-foreground">{policy.summary}</DialogDescription>
              <p className="mt-5 text-sm leading-relaxed">{policy.body}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

const ProductFullView = ({
  active,
  qty,
  setQty,
  onClose,
  onAdd,
  openCart,
  related,
  openProduct,
  policies,
  onPolicy,
}: {
  active: Product;
  qty: number;
  setQty: (n: number | ((q: number) => number)) => void;
  onClose: () => void;
  onAdd: (p: Product, q?: number) => void;
  openCart: () => void;
  related: Product[];
  openProduct: (p: Product) => void;
  policies: Policy[];
  onPolicy: (policy: Policy) => void;
}) => {
  const gallery = [active.image, active.image, active.image, active.image];
  const [slide, setSlide] = useState(0);
  useEffect(() => {
    setSlide(0);
    const t = setInterval(() => setSlide((s) => (s + 1) % gallery.length), 3500);
    return () => clearInterval(t);
  }, [active.id, gallery.length]);

  const reviewCards: ProductReview[] = active.reviews?.length ? active.reviews : fallbackReviews.map((r) => ({ ...r, photo: active.image }));
  const policyBySlug = new Map(policies.map((p) => [p.slug, p]));
  const policyTiles = [
    { icon: <Truck className="w-4 h-4" />, title: "Delivery Policy", slug: "delivery-policy", summary: "Express tracked delivery" },
    { icon: <RotateCcw className="w-4 h-4" />, title: "7 Days Return", slug: "returns", summary: "Easy replacement and refund" },
    { icon: <ShieldCheck className="w-4 h-4" />, title: "1 Year Warranty", slug: "warranty", summary: "Brand authorised" },
    { icon: <CreditCard className="w-4 h-4" />, title: "Secure Payments", slug: "secure-payments", summary: "UPI, cards and COD" },
  ];

  return (
    <div className="animate-fade-up min-h-screen">
      <div className="sticky top-0 z-20 bg-background/90 backdrop-blur border-b border-gold/20 px-5 md:px-9 py-3 flex items-center justify-between">
        <button onClick={onClose} className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-gold hover:opacity-80">
          <ChevronLeft className="w-4 h-4" /> Back to Shop
        </button>
        <div className="font-display text-sm md:text-base truncate max-w-[60vw]">{active.name}</div>
        <button onClick={onClose} aria-label="Close" className="w-9 h-9 rounded-full glass gold-border grid place-items-center text-gold">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid md:grid-cols-2 max-w-7xl mx-auto">
        <div className="relative aspect-square md:aspect-auto md:min-h-[560px] bg-noir-soft overflow-hidden">
          <div className="absolute inset-0 bg-radial-gold opacity-70" />
          {gallery.map((src, i) => (
            <img key={i} src={src} alt={`${active.name} ${i + 1}`} className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${i === slide ? "opacity-100" : "opacity-0"}`} />
          ))}
          <div className="absolute top-4 left-4 text-[10px] uppercase tracking-[0.25em] bg-gradient-gold text-noir px-3 py-1 rounded-full font-bold">{active.tag}</div>
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {gallery.map((_, i) => (
              <button key={i} onClick={() => setSlide(i)} aria-label={`Go to slide ${i + 1}`} className={`w-2.5 h-2.5 rounded-full transition-all ${i === slide ? "bg-gold w-7" : "bg-gold/30"}`} />
            ))}
          </div>
          <button onClick={() => setSlide((s) => (s - 1 + gallery.length) % gallery.length)} aria-label="Previous" className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full glass gold-border grid place-items-center text-gold z-10">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={() => setSlide((s) => (s + 1) % gallery.length)} aria-label="Next" className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full glass gold-border grid place-items-center text-gold z-10">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="p-7 md:p-9 flex flex-col">
          <span className="text-[10px] uppercase tracking-[0.4em] text-gold inline-flex items-center gap-1.5"><Sparkles className="w-3 h-3" /> {active.tagline}</span>
          <DialogTitle className="font-display text-3xl md:text-4xl mt-2">{active.name}</DialogTitle>
          <div className="mt-2 inline-flex items-center gap-2">
            <Stars value={active.rating} />
            <span className="text-sm text-muted-foreground">{active.rating} · {active.review_count.toLocaleString()} reviews</span>
          </div>
          <div className="mt-3 flex items-baseline flex-wrap gap-x-3 gap-y-1">
            <span className="text-3xl font-bold text-gold-gradient">{inr(active.price)}</span>
            <span className="text-sm text-muted-foreground line-through">{inr(Math.round(active.price * 1.45))}</span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">31% off</span>
          </div>
          <div className="mt-1 text-[11px] text-muted-foreground">Inclusive of all taxes · Free shipping above ₹2,000</div>
          <DialogDescription className="mt-4 text-sm leading-relaxed text-muted-foreground">{active.description}</DialogDescription>
          <ul className="mt-5 space-y-2.5">
            {getHighlights(active).map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm">
                <span className="mt-0.5 w-5 h-5 shrink-0 rounded-full bg-gradient-gold grid place-items-center"><Check className="w-3 h-3 text-noir" strokeWidth={3} /></span>
                <span>{f}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex items-center gap-3">
            <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Quantity</span>
            <div className="inline-flex items-center gap-2 glass gold-border rounded-full px-1 py-0.5">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease" className="w-7 h-7 grid place-items-center text-gold hover:bg-gold/10 rounded-full"><Minus className="w-3.5 h-3.5" /></button>
              <span className="text-sm w-7 text-center">{qty}</span>
              <button onClick={() => setQty((q) => Math.min(20, q + 1))} aria-label="Increase" className="w-7 h-7 grid place-items-center text-gold hover:bg-gold/10 rounded-full"><Plus className="w-3.5 h-3.5" /></button>
            </div>
          </div>

          <div className="mt-5 flex gap-3">
            <button onClick={() => onAdd(active, qty)} className="flex-1 glass gold-border text-gold rounded-full py-3 text-xs uppercase tracking-widest font-bold inline-flex items-center justify-center gap-2 hover:shadow-gold transition-all">
              <ShoppingBag className="w-4 h-4" /> Add to Cart
            </button>
            <button onClick={() => { onAdd(active, qty); onClose(); window.location.assign("/checkout"); }} className="flex-1 bg-gradient-gold text-noir rounded-full py-3 text-xs uppercase tracking-widest font-bold inline-flex items-center justify-center gap-2 shadow-gold hover:scale-[1.02] transition-transform">
              Buy Now
            </button>
          </div>

          <div className="mt-6 rounded-2xl glass gold-border p-4">
            <div className="text-[10px] uppercase tracking-[0.3em] text-gold inline-flex items-center gap-2"><BadgePercent className="w-3.5 h-3.5" /> Available Offers</div>
            <ul className="mt-2 space-y-1.5 text-xs text-foreground/85">
              <li>• <b>Bank Offer</b> 10% off on selected credit cards</li>
              <li>• <b>No Cost EMI</b> on orders above ₹3,000</li>
              <li>• <b>Partner Offer</b> Extra ₹200 off with code <span className="font-mono text-gold">ZYV200</span></li>
              <li>• <b>Royal Coins</b> Earn {Math.round(active.price * 8.3)} reward coins</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="px-7 md:px-9 pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {policyTiles.map((tile) => {
              const linked = policyBySlug.get(tile.slug) || { slug: tile.slug, title: tile.title, summary: tile.summary, body: tile.summary };
              return (
                <button key={tile.slug} onClick={() => onPolicy(linked)} className="glass gold-border rounded-2xl p-3 flex items-start gap-2.5 text-left hover:shadow-gold transition-all">
                  <span className="w-8 h-8 grid place-items-center rounded-full bg-gradient-gold text-noir shrink-0">{tile.icon}</span>
                  <span>
                    <span className="block text-xs font-bold">{tile.title}</span>
                    <span className="block text-[11px] text-muted-foreground leading-snug">{linked.summary || tile.summary}</span>
                  </span>
                </button>
              );
            })}
          </div>
          <div className="mt-3 inline-flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="w-3.5 h-3.5 text-gold" /> Deliver to <b className="text-foreground">Mumbai 400001</b> · In stock
          </div>
        </div>

        <div className="px-7 md:px-9 pt-6">
          <h3 className="font-display text-xl mb-3 inline-flex items-center gap-2"><Package className="w-4 h-4 text-gold" /> Highlights</h3>
          <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
            {getHighlights(active).map((h) => <li key={h} className="flex items-start gap-2"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-gold shrink-0" />{h}</li>)}
          </ul>
        </div>

        <div className="px-7 md:px-9 pt-8">
          <h3 className="font-display text-2xl mb-4">Ratings & Reviews</h3>
          <div className="grid md:grid-cols-3 gap-6 items-center">
            <div className="glass gold-border rounded-2xl p-5 text-center">
              <div className="text-5xl font-display text-gold-gradient">{active.rating.toFixed(1)}</div>
              <Stars value={active.rating} size={16} />
              <div className="text-xs text-muted-foreground mt-1">{active.review_count.toLocaleString()} ratings</div>
            </div>
            <div className="md:col-span-2 space-y-2">
              {ratingBreakdown(active.rating, active.review_count).map((b) => {
                const pct = Math.round((b.n / active.review_count) * 100);
                return (
                  <div key={b.star} className="flex items-center gap-3 text-xs">
                    <span className="w-8 inline-flex items-center gap-0.5 text-muted-foreground">{b.star}<Star className="w-3 h-3 fill-gold text-gold" /></span>
                    <div className="flex-1 h-2 rounded-full bg-gold/10 overflow-hidden"><div className="h-full bg-gradient-gold" style={{ width: `${pct}%` }} /></div>
                    <span className="w-14 text-right text-muted-foreground">{b.n.toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="px-7 md:px-9 pb-8 pt-8">
          <div className="grid md:grid-cols-3 gap-4">
            {reviewCards.slice(0, 3).map((r, i) => (
              <div key={`${r.name}-${i}`} className="glass gold-border rounded-2xl p-4 flex flex-col">
                <div className="flex items-center gap-3">
                  {r.avatar && <img src={r.avatar} alt={r.name} loading="lazy" className="w-10 h-10 rounded-full border border-gold/40 object-cover" />}
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-gold-gradient truncate">{r.name}</div>
                    <Stars value={r.rating} size={11} />
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground mt-3">"{r.comment}"</p>
                <div className="mt-3 relative aspect-video rounded-xl overflow-hidden bg-noir-soft">
                  <img src={r.photo || active.image} alt={`Review by ${r.name}`} loading="lazy" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {related.length > 0 && (
          <div className="px-7 md:px-9 pb-12">
            <div className="mb-5">
              <span className="text-[10px] uppercase tracking-[0.4em] text-gold">More {active.category}</span>
              <h3 className="font-display text-2xl mt-1">You may also love</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {related.map((rp) => (
                <button key={rp.id} type="button" onClick={() => openProduct(rp)} className="group text-left glass gold-border rounded-2xl overflow-hidden focus:outline-none focus:ring-2 focus:ring-gold/60">
                  <div className="relative aspect-square bg-noir-soft overflow-hidden"><img src={rp.image} alt={rp.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" /></div>
                  <div className="p-3 flex items-center justify-between gap-2">
                    <div className="min-w-0"><div className="text-sm font-display truncate">{rp.name}</div><Stars value={rp.rating} size={10} /></div>
                    <span className="text-gold-gradient font-bold text-sm shrink-0">{inr(rp.price)}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
