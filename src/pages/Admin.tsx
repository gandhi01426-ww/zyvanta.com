import { FormEvent, useEffect, useState } from "react";
import { Database, LogOut, Package, Plus, Save, ShieldAlert, ShoppingBag, Sparkles, Star, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Product, ProductReview, fallbackCrownWants } from "@/data/catalog";
import { Policy, adminRequest, fallbackPolicies, getHomepageSections, getPolicies, getProducts } from "@/services/api";
import { supabase, supabaseEnabled } from "@/services/supabase";
import type { Session } from "@supabase/supabase-js";

type Tab = "products" | "orders" | "reviews" | "homepage" | "policies";
type Order = {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  total: number;
  payment_method: string;
  payment_status: string;
  order_status: string;
  razorpay_payment_id?: string;
  order_items?: { name: string; qty: number; unit_price: number }[];
};

const productEmpty: Product = {
  id: "",
  name: "",
  price: 0,
  category: "Audio",
  tag: "New",
  image: "",
  tagline: "",
  description: "",
  features: [],
  rating: 5,
  review_count: 0,
  stock: 0,
  is_featured: false,
};

const reviewEmpty: ProductReview = { name: "", role: "", avatar: "", rating: 5, comment: "", photo: "", is_featured: true };

const inputCls = "w-full bg-transparent border border-gold/30 rounded-xl px-3 py-2 text-sm outline-none focus:border-gold";
const tabs: { id: Tab; Icon: typeof Package; label: string }[] = [
  { id: "products", Icon: Package, label: "Products" },
  { id: "orders", Icon: ShoppingBag, label: "Orders" },
  { id: "reviews", Icon: Star, label: "Reviews" },
  { id: "homepage", Icon: Sparkles, label: "Homepage" },
  { id: "policies", Icon: ShieldAlert, label: "Policies" },
];

const Admin = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<Tab>("products");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [policies, setPolicies] = useState<Policy[]>(fallbackPolicies);
  const [crownWants, setCrownWants] = useState(fallbackCrownWants.join("\n"));
  const [productDraft, setProductDraft] = useState<Product>(productEmpty);
  const [reviewDraft, setReviewDraft] = useState<ProductReview>(reviewEmpty);

  const token = session?.access_token || "";

  useEffect(() => {
    if (!supabaseEnabled || !supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    return () => data.subscription.unsubscribe();
  }, []);

  const refresh = async () => {
    setLoading(true);
    try {
      const [nextProducts, nextPolicies, homepage] = await Promise.all([getProducts(), getPolicies(), getHomepageSections()]);
      setProducts(nextProducts);
      setPolicies(nextPolicies);
      setCrownWants(homepage.crownWants.join("\n"));
      if (token) {
        const orderData = await adminRequest<{ orders: Order[] }>("/api/orders", token);
        const reviewData = await adminRequest<{ reviews: ProductReview[] }>("/api/reviews", token);
        setOrders(orderData.orders || []);
        setReviews(reviewData.reviews || []);
      }
    } catch (error) {
      toast({ title: "Load failed", description: error instanceof Error ? error.message : "Check Supabase admin access." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) refresh();
  }, [session]);

  const signIn = async (event: FormEvent) => {
    event.preventDefault();
    if (!supabase) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) toast({ title: "Sign in failed", description: error.message });
  };

  const signOut = async () => {
    if (supabase) await supabase.auth.signOut();
  };

  const saveProduct = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const slug = productDraft.id || productDraft.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const body = {
        ...productDraft,
        features: productDraft.features.map((feature) => feature.trim()).filter(Boolean),
        id: slug,
      };
      if (productDraft.id) {
        await adminRequest(`/api/products?id=${encodeURIComponent(productDraft.id)}`, token, { method: "PUT", body: JSON.stringify(body) });
      } else {
        await adminRequest("/api/products", token, { method: "POST", body: JSON.stringify(body) });
      }
      setProductDraft(productEmpty);
      toast({ title: "Product saved" });
      refresh();
    } catch (error) {
      toast({ title: "Save failed", description: error instanceof Error ? error.message : "Unable to save product." });
    }
  };

  const saveReview = async (event: FormEvent) => {
    event.preventDefault();
    try {
      if (reviewDraft.id) {
        await adminRequest(`/api/reviews?id=${encodeURIComponent(reviewDraft.id)}`, token, { method: "PUT", body: JSON.stringify(reviewDraft) });
      } else {
        await adminRequest("/api/reviews", token, { method: "POST", body: JSON.stringify(reviewDraft) });
      }
      setReviewDraft(reviewEmpty);
      toast({ title: "Review saved" });
      refresh();
    } catch (error) {
      toast({ title: "Save failed", description: error instanceof Error ? error.message : "Unable to save review." });
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    await adminRequest(`/api/products?id=${encodeURIComponent(id)}`, token, { method: "DELETE" });
    refresh();
  };

  const deleteReview = async (id?: string) => {
    if (!id || !confirm("Delete this review?")) return;
    await adminRequest(`/api/reviews?id=${encodeURIComponent(id)}`, token, { method: "DELETE" });
    refresh();
  };

  const saveHomepage = async () => {
    await adminRequest("/api/homepage?key=crown_wants", token, {
      method: "PUT",
      body: JSON.stringify({ content: { items: crownWants.split("\n").map((item) => item.trim()).filter(Boolean) } }),
    });
    toast({ title: "Homepage updated" });
  };

  const savePolicy = async (policy: Policy) => {
    await adminRequest(`/api/policies?slug=${encodeURIComponent(policy.slug)}`, token, {
      method: "PUT",
      body: JSON.stringify(policy),
    });
    toast({ title: "Policy updated" });
    refresh();
  };

  if (!supabaseEnabled) {
    return (
      <div className="min-h-screen grid place-items-center bg-background p-6">
        <div className="glass gold-border rounded-3xl p-8 w-full max-w-md text-center space-y-3">
          <ShieldAlert className="w-10 h-10 text-gold mx-auto" />
          <h1 className="font-display text-2xl">Admin Disabled</h1>
          <p className="text-sm text-muted-foreground">Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable Supabase admin sign-in.</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen grid place-items-center bg-background p-6">
        <form onSubmit={signIn} className="glass gold-border rounded-3xl p-8 w-full max-w-sm space-y-4">
          <h1 className="font-display text-3xl text-center">Zyvanta Admin</h1>
          <p className="text-xs text-muted-foreground text-center">Sign in with your Supabase admin account.</p>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className={inputCls} />
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className={inputCls} />
          <button disabled={loading} className="w-full bg-gradient-gold text-noir rounded-full py-3 text-xs uppercase tracking-widest font-bold disabled:opacity-50">
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-gold/20 px-6 py-4 flex items-center justify-between">
        <h1 className="font-display text-2xl">Zyvanta Admin</h1>
        <div className="inline-flex items-center gap-3">
          <span className="text-[10px] uppercase tracking-[0.3em] inline-flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-gold" /> Supabase · {session.user.email}
          </span>
          <button onClick={signOut} className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-gold">
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      </header>

      <div className="container py-8">
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map(({ id, Icon, label }) => (
            <button key={id} onClick={() => setTab(id)} className={`px-4 py-2 rounded-full text-[11px] uppercase tracking-[0.25em] border ${tab === id ? "bg-gradient-gold text-noir border-gold" : "border-gold/30 text-muted-foreground"}`}>
              <Icon className="w-3.5 h-3.5 inline mr-1" /> {label}{id === "products" ? ` (${products.length})` : id === "orders" ? ` (${orders.length})` : id === "reviews" ? ` (${reviews.length})` : ""}
            </button>
          ))}
        </div>

        {tab === "products" && (
          <div className="grid lg:grid-cols-[1fr_1.5fr] gap-8">
            <form onSubmit={saveProduct} className="glass gold-border rounded-2xl p-6 space-y-3 h-fit sticky top-4">
              <h2 className="font-display text-xl flex items-center gap-2">{productDraft.id ? <Save className="w-4 h-4 text-gold" /> : <Plus className="w-4 h-4 text-gold" />} {productDraft.id ? "Edit Product" : "Add Product"}</h2>
              <input className={inputCls} placeholder="Slug / ID" value={productDraft.id} onChange={(e) => setProductDraft({ ...productDraft, id: e.target.value })} disabled={Boolean(productDraft.id)} />
              <input className={inputCls} placeholder="Name" value={productDraft.name} onChange={(e) => setProductDraft({ ...productDraft, name: e.target.value })} />
              <textarea className={inputCls} rows={3} placeholder="Description" value={productDraft.description} onChange={(e) => setProductDraft({ ...productDraft, description: e.target.value })} />
              <textarea className={inputCls} rows={3} placeholder="Features, one per line" value={productDraft.features.join("\n")} onChange={(e) => setProductDraft({ ...productDraft, features: e.target.value.split("\n") })} />
              <div className="grid grid-cols-2 gap-3">
                <input type="number" className={inputCls} placeholder="Price USD" value={productDraft.price || ""} onChange={(e) => setProductDraft({ ...productDraft, price: +e.target.value })} />
                <input type="number" className={inputCls} placeholder="Stock" value={productDraft.stock || ""} onChange={(e) => setProductDraft({ ...productDraft, stock: +e.target.value })} />
              </div>
              <input className={inputCls} placeholder="Image URL" value={productDraft.image} onChange={(e) => setProductDraft({ ...productDraft, image: e.target.value })} />
              <input className={inputCls} placeholder="Tagline" value={productDraft.tagline} onChange={(e) => setProductDraft({ ...productDraft, tagline: e.target.value })} />
              <input className={inputCls} placeholder="Tag" value={productDraft.tag} onChange={(e) => setProductDraft({ ...productDraft, tag: e.target.value })} />
              <button className="w-full bg-gradient-gold text-noir rounded-full py-2.5 text-xs uppercase tracking-widest font-bold">{productDraft.id ? "Save" : "Add"}</button>
            </form>

            <div className="space-y-3">
              {loading && <div className="text-sm text-muted-foreground">Loading...</div>}
              {products.map((p) => (
                <div key={p.id} className="glass gold-border rounded-2xl p-4 flex gap-4">
                  <img src={p.image} alt={p.name} className="w-20 h-20 rounded-xl object-cover bg-noir-soft" />
                  <div className="flex-1 min-w-0">
                    <div className="font-display text-lg">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.category} · Stock {p.stock}</div>
                    <div className="text-gold-gradient font-bold mt-1">${p.price}</div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button onClick={() => setProductDraft(p)} className="text-xs uppercase tracking-widest text-gold border border-gold/30 rounded-full px-3 py-1">Edit</button>
                    <button onClick={() => deleteProduct(p.id)} className="text-xs uppercase tracking-widest text-red-600 border border-red-300 rounded-full px-3 py-1 inline-flex items-center gap-1"><Trash2 className="w-3 h-3" /> Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "orders" && (
          <div className="space-y-3">
            {orders.map((o) => (
              <details key={o.id} className="glass gold-border rounded-2xl p-4">
                <summary className="cursor-pointer flex items-center justify-between gap-3">
                  <div><div className="font-display text-base">{o.customer_name} · {o.customer_phone}</div><div className="text-xs text-muted-foreground">{o.address}, {o.city}, {o.state} {o.pincode}</div></div>
                  <div className="text-right"><div className="text-gold-gradient font-bold">₹{o.total.toLocaleString("en-IN")}</div><div className="text-[10px] uppercase tracking-widest text-muted-foreground">{o.payment_method} · {o.payment_status}</div></div>
                </summary>
                <div className="mt-3 pt-3 border-t border-gold/20 text-sm space-y-1">
                  <div>Email: {o.customer_email}</div>
                  {o.razorpay_payment_id && <div>Payment ID: <span className="font-mono">{o.razorpay_payment_id}</span></div>}
                  <div className="mt-2 font-bold">Items:</div>
                  <ul className="text-xs text-muted-foreground space-y-0.5">{o.order_items?.map((i, k) => <li key={k}>• {i.name} x {i.qty} - ₹{i.unit_price}</li>)}</ul>
                </div>
              </details>
            ))}
          </div>
        )}

        {tab === "reviews" && (
          <div className="grid lg:grid-cols-[1fr_1.5fr] gap-8">
            <form onSubmit={saveReview} className="glass gold-border rounded-2xl p-6 space-y-3 h-fit">
              <h2 className="font-display text-xl">Review</h2>
              <input className={inputCls} placeholder="Product ID (optional)" value={reviewDraft.product_id || ""} onChange={(e) => setReviewDraft({ ...reviewDraft, product_id: e.target.value })} />
              <input className={inputCls} placeholder="Name" value={reviewDraft.name} onChange={(e) => setReviewDraft({ ...reviewDraft, name: e.target.value })} />
              <input className={inputCls} placeholder="Role" value={reviewDraft.role || ""} onChange={(e) => setReviewDraft({ ...reviewDraft, role: e.target.value })} />
              <input type="number" min={1} max={5} className={inputCls} placeholder="Rating" value={reviewDraft.rating} onChange={(e) => setReviewDraft({ ...reviewDraft, rating: +e.target.value })} />
              <textarea className={inputCls} rows={4} placeholder="Comment" value={reviewDraft.comment} onChange={(e) => setReviewDraft({ ...reviewDraft, comment: e.target.value })} />
              <input className={inputCls} placeholder="Avatar URL" value={reviewDraft.avatar || ""} onChange={(e) => setReviewDraft({ ...reviewDraft, avatar: e.target.value })} />
              <button className="w-full bg-gradient-gold text-noir rounded-full py-2.5 text-xs uppercase tracking-widest font-bold">Save Review</button>
            </form>
            <div className="space-y-3">{reviews.map((r) => <div key={r.id || r.name} className="glass gold-border rounded-2xl p-4 flex justify-between gap-4"><div><div className="font-display text-lg">{r.name}</div><div className="text-xs text-muted-foreground">{r.rating} stars · {r.comment}</div></div><button onClick={() => deleteReview(r.id)} className="text-red-600"><Trash2 className="w-4 h-4" /></button></div>)}</div>
          </div>
        )}

        {tab === "homepage" && (
          <div className="glass gold-border rounded-2xl p-6 max-w-2xl space-y-4">
            <h2 className="font-display text-2xl">What The Crown Wants</h2>
            <textarea className={inputCls} rows={12} value={crownWants} onChange={(e) => setCrownWants(e.target.value)} />
            <button onClick={saveHomepage} className="bg-gradient-gold text-noir rounded-full px-6 py-3 text-xs uppercase tracking-widest font-bold">Save Homepage</button>
          </div>
        )}

        {tab === "policies" && (
          <div className="grid md:grid-cols-2 gap-4">
            {policies.map((p, index) => (
              <PolicyEditor key={p.slug} policy={p} onChange={(next) => setPolicies((prev) => prev.map((item, i) => (i === index ? next : item)))} onSave={savePolicy} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const PolicyEditor = ({ policy, onChange, onSave }: { policy: Policy; onChange: (policy: Policy) => void; onSave: (policy: Policy) => void }) => (
  <div className="glass gold-border rounded-2xl p-5 space-y-3">
    <input className={inputCls} value={policy.title} onChange={(e) => onChange({ ...policy, title: e.target.value })} />
    <input className={inputCls} value={policy.summary} onChange={(e) => onChange({ ...policy, summary: e.target.value })} />
    <textarea className={inputCls} rows={6} value={policy.body} onChange={(e) => onChange({ ...policy, body: e.target.value })} />
    <button onClick={() => onSave(policy)} className="bg-gradient-gold text-noir rounded-full px-5 py-2.5 text-xs uppercase tracking-widest font-bold">Save</button>
  </div>
);

export default Admin;
