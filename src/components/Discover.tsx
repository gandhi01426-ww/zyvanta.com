import { Flame, Search, Sparkles, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import p1 from "@/assets/product-1.webp";
import p2 from "@/assets/product-2.webp";
import p3 from "@/assets/product-3.webp";
import p4 from "@/assets/product-4.webp";
import { fallbackCrownWants } from "@/data/catalog";
import { getHomepageSections } from "@/services/api";

const topStories = [
  { title: "Inside Zyvanta's Royal Edition 2026", tag: "Editorial", img: p4 },
  { title: "How Aurum Buds Pro became a cult classic", tag: "Audio", img: p1 },
  { title: "Solis Aviators on the Milan runway", tag: "Eyewear", img: p3 },
  { title: "Crafting the Noir Cardholder — a 12-step ritual", tag: "Wallets", img: p2 },
];

const featuredSlides: { name: string; tag: string; img: string; price: string }[] = [
  { name: "Aurum Buds Pro", tag: "Bestseller Audio", img: p1, price: "₹15,687" },
  { name: "Noir Cardholder", tag: "New Arrival", img: p2, price: "₹10,707" },
  { name: "Solis Aviators", tag: "Limited Edition", img: p3, price: "₹18,177" },
  { name: "Royal Essence No.7", tag: "Exclusive Fragrance", img: p4, price: "₹20,335" },
  { name: "Aurum Studio Over-Ear", tag: "New", img: p1, price: "₹28,967" },
  { name: "Royal Essence Noir", tag: "Bestseller", img: p4, price: "₹17,845" },
];

const categories = [
  { name: "Earbuds", img: p1, models: ["Aurum Buds Pro", "Aurum Studio Over-Ear", "Aurum Sport Beats"] },
  { name: "Wallets", img: p2, models: ["Noir Cardholder", "Noir Bifold Wallet", "Noir Money Clip"] },
  { name: "Sunglasses", img: p3, models: ["Solis Aviators", "Solis Wayfarer Noir", "Solis Round Eclipse"] },
  { name: "Fragrances", img: p4, models: ["Royal Essence No.7", "Royal Essence Noir", "Royal Essence Aurum"] },
];

const FeaturedSlideshow = () => {
  const [i, setI] = useState(0);
  // show 3 cards at a time on md+, 1 on mobile
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % featuredSlides.length), 3000);
    return () => clearInterval(t);
  }, []);
  const visible = [0, 1, 2].map((k) => featuredSlides[(i + k) % featuredSlides.length]);
  return (
    <div>
      <div className="flex items-end justify-between flex-wrap gap-3 mb-6">
        <div>
          <span className="text-[10px] uppercase tracking-[0.4em] text-gold inline-flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" /> Featured Now
          </span>
          <h2 className="font-display text-3xl md:text-5xl mt-2">
            Royal <span className="text-gold-gradient">picks</span>, on rotation
          </h2>
        </div>
        <div className="inline-flex gap-2">
          <button onClick={() => setI((x) => (x - 1 + featuredSlides.length) % featuredSlides.length)} className="w-10 h-10 rounded-full glass gold-border grid place-items-center text-gold">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={() => setI((x) => (x + 1) % featuredSlides.length)} className="w-10 h-10 rounded-full glass gold-border grid place-items-center text-gold">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {visible.map((s, k) => (
          <a key={`${s.name}-${k}-${i}`} href="#shop" className="glass gold-border rounded-3xl overflow-hidden block animate-fade-in">
            <div className="relative aspect-[4/3] bg-noir-soft overflow-hidden">
              <img src={s.img} alt={s.name} className="w-full h-full object-cover" />
              <span className="absolute top-3 left-3 text-[10px] uppercase tracking-[0.25em] bg-gradient-gold text-noir px-2.5 py-1 rounded-full font-bold">{s.tag}</span>
            </div>
            <div className="p-4 flex items-center justify-between">
              <h3 className="font-display text-base">{s.name}</h3>
              <span className="text-gold-gradient font-bold text-sm">{s.price}</span>
            </div>
          </a>
        ))}
      </div>
      <div className="mt-4 flex justify-center gap-1.5">
        {featuredSlides.map((_, k) => (
          <button key={k} onClick={() => setI(k)}
            className={`h-1.5 rounded-full transition-all ${k === i ? "bg-gold w-6" : "bg-gold/30 w-2"}`} aria-label={`Slide ${k + 1}`} />
        ))}
      </div>
    </div>
  );
};

const Discover = () => {
  const [mostSearched, setMostSearched] = useState(fallbackCrownWants);

  useEffect(() => {
    getHomepageSections().then((sections) => setMostSearched(sections.crownWants));
  }, []);

  return (
  <section id="discover" className="relative py-24">
    <div className="container space-y-20">
      <FeaturedSlideshow />

      <div>
        <div className="flex items-end justify-between flex-wrap gap-3 mb-8">
          <div>
            <span className="text-[10px] uppercase tracking-[0.4em] text-gold inline-flex items-center gap-2">
              <Flame className="w-3.5 h-3.5" /> Top Stories
            </span>
            <h2 className="font-display text-3xl md:text-5xl mt-2">
              <span className="text-gold-gradient">Trending</span> on Zyvanta
            </h2>
          </div>
          <a href="#shop" className="text-xs uppercase tracking-[0.3em] text-gold inline-flex items-center gap-1 hover:gap-2 transition-all">
            View all <ArrowRight className="w-3 h-3" />
          </a>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {topStories.map((s) => (
            <a key={s.title} href="#shop" className="group glass gold-border rounded-3xl overflow-hidden block">
              <div className="relative aspect-[4/3] bg-noir-soft overflow-hidden">
                <img src={s.img} alt={s.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <span className="absolute top-3 left-3 text-[10px] uppercase tracking-[0.25em] bg-gradient-gold text-noir px-2.5 py-1 rounded-full font-bold">{s.tag}</span>
              </div>
              <div className="p-4">
                <h3 className="font-display text-base leading-snug group-hover:text-gold transition-colors">{s.title}</h3>
                <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground mt-2 inline-flex items-center gap-1">
                  Read story <ArrowRight className="w-3 h-3" />
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-6">
          <span className="text-[10px] uppercase tracking-[0.4em] text-gold inline-flex items-center gap-2">
            <Search className="w-3.5 h-3.5" /> Most Searched on Zyvanta
          </span>
          <h2 className="font-display text-3xl md:text-5xl mt-2">
            What the <span className="text-gold-gradient">crown</span> wants
          </h2>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {mostSearched.map((q) => (
            <a key={q} href="#shop" className="glass gold-border rounded-full px-4 py-2 text-xs text-muted-foreground hover:text-gold hover:shadow-gold transition-all">
              {q}
            </a>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-8">
          <span className="text-[10px] uppercase tracking-[0.4em] text-gold inline-flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" /> All Categories
          </span>
          <h2 className="font-display text-3xl md:text-5xl mt-2">
            Explore every <span className="text-gold-gradient">model</span>
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {categories.map((c) => (
            <div key={c.name} className="glass gold-border rounded-3xl p-5">
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-noir-soft mb-4">
                <img src={c.img} alt={c.name} loading="lazy" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <h3 className="absolute bottom-3 left-4 font-display text-xl text-white">{c.name}</h3>
              </div>
              <ul className="space-y-1.5">
                {c.models.map((m) => (
                  <li key={m}>
                    <a href="#shop" className="text-sm text-muted-foreground hover:text-gold transition-colors flex items-center justify-between gap-2">
                      <span>{m}</span>
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
  );
};
export default Discover;
