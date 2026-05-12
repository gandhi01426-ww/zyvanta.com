import { FormEvent, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Banknote, ChevronLeft, ChevronRight, Check, LockKeyhole, MapPin, ShieldCheck, ShoppingBag, Truck } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import { inr, inr2, USD_TO_INR } from "@/lib/currency";
import { openPaymentGateway } from "@/lib/payment-gateway";
import { CheckoutCustomer, createCodOrder, createPaymentOrder, PaymentSummary, verifyPayment } from "@/services/api";
import { toast } from "@/hooks/use-toast";

type Step = "address" | "payment";
type PayMethod = "online" | "cod";

const inputCls = "w-full bg-transparent border border-gold/30 focus:border-gold rounded-xl px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/60";

const initialCustomer: CheckoutCustomer = {
  full_name: "",
  phone: "",
  email: "",
  address: "",
  pincode: "",
  city: "",
  state: "",
};

const Checkout = () => {
  const { items, total, clear, openCart } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("address");
  const [payMethod, setPayMethod] = useState<PayMethod>("online");
  const [customer, setCustomer] = useState<CheckoutCustomer>(initialCustomer);
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [loading, setLoading] = useState(false);

  const localSummary = useMemo(() => {
    const subtotal = Math.round(total * USD_TO_INR);
    const shipping = subtotal >= 2000 ? 0 : 99;
    const tax = Math.round(subtotal * 0.05);
    return { subtotal, shipping, tax, total: subtotal + shipping + tax };
  }, [total]);

  const checkoutItems = items.map((item) => ({ id: item.id, qty: item.qty }));
  const itemCount = items.reduce((sum, item) => sum + item.qty, 0);

  const validate = () => {
    if (!customer.full_name.trim()) return "Full name is required.";
    if (!/^\d{10}$/.test(customer.phone)) return "Enter a valid 10-digit phone number.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) return "Enter a valid email address.";
    if (!customer.address.trim()) return "Address is required.";
    if (!/^\d{6}$/.test(customer.pincode)) return "Enter a valid 6-digit pincode.";
    if (!customer.city.trim()) return "City is required.";
    if (!customer.state.trim()) return "State is required.";
    return "";
  };

  const continueToPayment = async (event: FormEvent) => {
    event.preventDefault();
    const error = validate();
    if (error) {
      toast({ title: "Check your details", description: error });
      return;
    }
    if (items.length === 0) {
      toast({ title: "Your bag is empty", description: "Add a product before checkout." });
      navigate("/");
      return;
    }
    setStep("payment");
  };

  const placeOrder = async () => {
    setLoading(true);
    try {
      if (payMethod === "cod") {
        const order = await createCodOrder(customer, checkoutItems);
        clear();
        navigate(`/checkout/success?order=${order.order_id}`);
        return;
      }

      const paymentOrder = await createPaymentOrder(customer, checkoutItems);
      setSummary(paymentOrder.summary);
      await openPaymentGateway({
        key: paymentOrder.key_id,
        orderId: paymentOrder.payment_order_id,
        amount: paymentOrder.amount,
        name: "Zyvanta",
        description: "Secure order payment",
        prefill: { name: customer.full_name, email: customer.email, contact: customer.phone },
        onSuccess: async (payment) => {
          try {
            const order = await verifyPayment(customer, checkoutItems, payment);
            clear();
            navigate(`/checkout/success?order=${order.order_id}`);
          } catch (err) {
            navigate(`/checkout/failure?reason=${encodeURIComponent(err instanceof Error ? err.message : "Payment verification failed.")}`);
          }
        },
        onDismiss: () => {
          toast({ title: "Payment cancelled", description: "No order was created." });
          setLoading(false);
        },
      });
    } catch (err) {
      toast({ title: "Unable to place order", description: err instanceof Error ? err.message : "Please try again." });
      setLoading(false);
    }
  };

  const display = summary || { ...localSummary, discount: 0, items: [] };

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <section className="relative pt-28 pb-16 overflow-hidden">
        <div className="absolute inset-0 grid-bg pointer-events-none" />
        <div className="absolute -top-32 right-0 w-[520px] h-[520px] bg-radial-gold blur-3xl pointer-events-none" />
        <div className="container relative">
          <button onClick={() => navigate("/")} className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-gold hover:opacity-80 mb-8">
            <ChevronLeft className="w-4 h-4" /> Continue Shopping
          </button>

          <div className="grid lg:grid-cols-[1fr_420px] gap-8 items-start">
            <div className="glass gold-border rounded-3xl p-6 md:p-9 shadow-elite">
              <div className="flex items-center gap-3 mb-8 text-[10px] uppercase tracking-[0.3em]">
                <span className={step === "address" ? "text-gold" : "text-muted-foreground"}>1 Address</span>
                <ChevronRight className="w-3 h-3 text-gold/40" />
                <span className={step === "payment" ? "text-gold" : "text-muted-foreground"}>2 Payment</span>
                <ChevronRight className="w-3 h-3 text-gold/40" />
                <span className="text-muted-foreground">3 Confirm</span>
              </div>

              {step === "address" && (
                <>
                  <h1 className="font-display text-3xl md:text-5xl inline-flex items-center gap-3">
                    <MapPin className="w-7 h-7 text-gold" /> Checkout
                  </h1>
                  <p className="text-sm text-muted-foreground mt-2">Tell us where your royal package should arrive.</p>
                  <form onSubmit={continueToPayment} className="grid sm:grid-cols-2 gap-3 mt-8">
                    <input className={inputCls} placeholder="Full Name" value={customer.full_name} onChange={(e) => setCustomer({ ...customer, full_name: e.target.value })} maxLength={80} />
                    <input className={inputCls} placeholder="Phone Number" value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })} />
                    <input className={`${inputCls} sm:col-span-2`} placeholder="Email" type="email" value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} maxLength={120} />
                    <input className={`${inputCls} sm:col-span-2`} placeholder="Address" value={customer.address} onChange={(e) => setCustomer({ ...customer, address: e.target.value })} maxLength={160} />
                    <input className={inputCls} placeholder="Pincode" value={customer.pincode} onChange={(e) => setCustomer({ ...customer, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })} />
                    <input className={inputCls} placeholder="City" value={customer.city} onChange={(e) => setCustomer({ ...customer, city: e.target.value })} maxLength={60} />
                    <input className={`${inputCls} sm:col-span-2`} placeholder="State" value={customer.state} onChange={(e) => setCustomer({ ...customer, state: e.target.value })} maxLength={60} />
                    <button disabled={loading} className="sm:col-span-2 mt-3 bg-gradient-gold text-noir rounded-full py-3 text-xs uppercase tracking-widest font-bold inline-flex items-center justify-center gap-2 shadow-gold hover:scale-[1.01] transition-transform disabled:opacity-50">
                      {loading ? "Checking..." : "Continue"} <ChevronRight className="w-4 h-4" />
                    </button>
                  </form>
                </>
              )}

              {step === "payment" && (
                <>
                  <h1 className="font-display text-3xl md:text-5xl inline-flex items-center gap-3">
                    <ShieldCheck className="w-7 h-7 text-gold" /> Payment
                  </h1>
                  <p className="text-sm text-muted-foreground mt-2">Choose how you would like to complete this order.</p>

                  <div className="grid md:grid-cols-2 gap-4 mt-8">
                    {[
                      { id: "online" as PayMethod, label: "Pay Now", desc: "UPI, cards, wallets and net banking", icon: LockKeyhole },
                      { id: "cod" as PayMethod, label: "Cash on Delivery", desc: "Pay when the order reaches you", icon: Banknote },
                    ].map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setPayMethod(method.id)}
                        className={`text-left p-5 rounded-2xl border transition-all ${payMethod === method.id ? "border-gold bg-gold/5 shadow-gold" : "border-gold/20 hover:border-gold/50"}`}
                      >
                        <method.icon className="w-5 h-5 text-gold" />
                        <div className="font-display mt-3">{method.label}</div>
                        <div className="text-[11px] text-muted-foreground mt-1">{method.desc}</div>
                      </button>
                    ))}
                  </div>

                  <div className="mt-6 glass gold-border rounded-2xl p-4 text-sm text-muted-foreground inline-flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-gold shrink-0" />
                    {payMethod === "online" ? "Your payment is verified securely before we create a paid order." : `Pay ${inr(display.total / USD_TO_INR)} when your order is delivered.`}
                  </div>

                  <div className="mt-7 flex gap-3">
                    <button onClick={() => setStep("address")} className="px-5 py-3 rounded-full glass gold-border text-gold text-xs uppercase tracking-widest">Back</button>
                    <button disabled={loading} onClick={placeOrder} className="flex-1 bg-gradient-gold text-noir rounded-full py-3 text-xs uppercase tracking-widest font-bold inline-flex items-center justify-center gap-2 shadow-gold hover:scale-[1.01] transition-transform disabled:opacity-50">
                      {loading ? "Processing..." : payMethod === "online" ? "Pay Now" : "Place Order"} <Check className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>

            <aside className="glass gold-border rounded-3xl p-6 shadow-elite sticky top-24">
              <h2 className="font-display text-2xl inline-flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-gold" /> Order Summary
              </h2>
              <div className="mt-5 space-y-4 max-h-[360px] overflow-y-auto pr-1">
                {items.length === 0 && <div className="text-sm text-muted-foreground">Your bag is empty.</div>}
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <img src={item.img} alt={item.name} className="w-16 h-16 rounded-xl object-cover bg-noir-soft" />
                    <div className="flex-1 min-w-0">
                      <div className="font-display text-sm truncate">{item.name}</div>
                      <div className="text-xs text-muted-foreground">Qty {item.qty}</div>
                    </div>
                    <div className="text-sm font-bold text-gold-gradient">{inr2(item.price * item.qty)}</div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-5 border-t border-gold/20 text-sm space-y-2">
                <div className="flex justify-between"><span className="text-muted-foreground">Items ({itemCount})</span><span>₹{display.subtotal.toLocaleString("en-IN")}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground inline-flex items-center gap-1"><Truck className="w-3 h-3" /> Shipping</span><span>{display.shipping === 0 ? "FREE" : `₹${display.shipping}`}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>₹{display.tax.toLocaleString("en-IN")}</span></div>
                <div className="flex justify-between font-bold pt-3 border-t border-gold/20"><span>Total</span><span className="text-gold-gradient text-xl">₹{display.total.toLocaleString("en-IN")}</span></div>
              </div>

              <button onClick={openCart} className="mt-5 w-full glass gold-border text-gold rounded-full py-3 text-xs uppercase tracking-widest">
                Edit Bag
              </button>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Checkout;
