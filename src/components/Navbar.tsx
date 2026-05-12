import { ZyvantaLogo } from "./ZyvantaLogo";
import { GraduationCap, Menu, ShoppingBag, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import CoursesDialog from "./CoursesDialog";

const links = [
  { label: "Shop", href: "#shop" },
  { label: "Why Us", href: "#whyus" },
  { label: "Reviews", href: "#reviews" },
  { label: "Contact", href: "#contact" },
];

const Navbar = () => {
  const { count, openCart } = useCart();
  const [open, setOpen] = useState(false);
  const [coursesOpen, setCoursesOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 glass">
        <nav className="container flex items-center justify-between h-16 md:h-20 gap-4">
          <a href="#hero" aria-label="Zyvanta home" className="shrink-0">
            <ZyvantaLogo className="text-xl md:text-2xl" />
          </a>

          <ul className="hidden md:flex items-center gap-8 text-sm uppercase tracking-widest text-muted-foreground">
            {links.map((l) => (
              <li key={l.label}>
                <a href={l.href} className="hover:text-gold transition-colors">{l.label}</a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={() => setCoursesOpen(true)}
              className="hidden sm:inline-flex items-center gap-2 px-3 md:px-4 py-2 rounded-full bg-gradient-gold text-noir text-[11px] uppercase tracking-[0.25em] font-bold shadow-gold hover:scale-105 transition-transform"
            >
              <GraduationCap className="w-4 h-4" /> Courses
            </button>
            <button onClick={openCart} className="relative p-2 rounded-full glass hover:shadow-gold transition-all" aria-label="Open cart">
              <ShoppingBag className="w-5 h-5 text-gold" />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 text-[10px] bg-gradient-gold text-noir rounded-full grid place-items-center font-bold animate-glow-pulse">
                  {count}
                </span>
              )}
            </button>
            <button onClick={() => setOpen((o) => !o)} className="md:hidden p-2 text-gold" aria-label="Menu">
              {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>
        {open && (
          <div className="md:hidden border-t border-gold/20 glass">
            <ul className="container py-4 flex flex-col gap-3 text-sm uppercase tracking-widest">
              {links.map((l) => (
                <li key={l.label}>
                  <a href={l.href} onClick={() => setOpen(false)} className="block py-2 text-muted-foreground hover:text-gold">
                    {l.label}
                  </a>
                </li>
              ))}
              <li>
                <button
                  onClick={() => { setOpen(false); setCoursesOpen(true); }}
                  className="w-full text-left py-2 text-gold inline-flex items-center gap-2"
                >
                  <GraduationCap className="w-4 h-4" /> Courses
                </button>
              </li>
            </ul>
          </div>
        )}
      </header>
      <CoursesDialog open={coursesOpen} onClose={() => setCoursesOpen(false)} />
    </>
  );
};
export default Navbar;
