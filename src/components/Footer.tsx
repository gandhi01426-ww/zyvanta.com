import { Instagram, Twitter, Facebook, Youtube, Mail, MapPin, Phone, Gift, LifeBuoy, Globe } from "lucide-react";
import { ZyvantaLogo } from "./ZyvantaLogo";

const ADDRESS = "4-4-92, Pujaripeta, Srikakulam, Andhra Pradesh";
const EMAIL = "hello@zyvanta.com";
const PHONE = "+91 70130 14863";
const MAP_QUERY = encodeURIComponent("4-4-92, Pujaripeta, Srikakulam, Andhra Pradesh, India");

const cols: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "About",
    links: [
      { label: "Contact Us", href: "#contact" },
      { label: "About Us", href: "#whyus" },
      { label: "Careers", href: "#" },
      { label: "Zyvanta Stories", href: "#discover" },
      { label: "Press", href: "#" },
      { label: "Information", href: "#" },
    ],
  },
  {
    title: "Group Companies",
    links: [
      { label: "Aurum Audio Labs", href: "#" },
      { label: "Noir Atelier", href: "#" },
      { label: "Solis Eyewear Co.", href: "#" },
      { label: "Royal Essence Parfums", href: "#" },
      { label: "Zyvanta Ventures", href: "#" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Payments", href: "#" },
      { label: "Shipping", href: "#" },
      { label: "Cancellation & Returns", href: "#" },
      { label: "FAQ", href: "#" },
    ],
  },
  {
    title: "Consumer Policy",
    links: [
      { label: "Cancellation & Returns", href: "#" },
      { label: "Terms of Use", href: "#" },
      { label: "Security", href: "#" },
      { label: "Privacy", href: "#" },
    ],
  },
];

const socials = [
  { Icon: Instagram, href: "https://instagram.com/_justin._ox", label: "Instagram" },
  { Icon: Facebook, href: "https://facebook.com", label: "Facebook" },
  { Icon: Youtube, href: "https://youtube.com", label: "YouTube" },
  { Icon: Twitter, href: "https://twitter.com", label: "Twitter / X" },
];

const Footer = () => (
  <footer id="contact" className="border-t border-gold/20 mt-16">
    {/* Main grid */}
    <div className="container py-16 grid gap-10 md:grid-cols-3 lg:grid-cols-6">
      {/* Brand */}
      <div className="md:col-span-3 lg:col-span-2 space-y-4">
        <ZyvantaLogo className="text-2xl" />
        <p className="text-sm text-muted-foreground max-w-sm">
          Royal essentials engineered for the future. Crafted in obsidian, finished in gold.
        </p>
        <div className="flex gap-3 pt-2">
          {socials.map(({ Icon, href, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="w-10 h-10 rounded-full glass grid place-items-center text-gold hover:shadow-gold hover:scale-110 transition-all"
            >
              <Icon className="w-4 h-4" />
            </a>
          ))}
        </div>
      </div>

      {cols.map((c) => (
        <div key={c.title}>
          <h4 className="font-display text-gold mb-4 uppercase tracking-widest text-xs">{c.title}</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {c.links.map((l) => (
              <li key={l.label}>
                <a href={l.href} className="hover:text-gold transition-colors">{l.label}</a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>

    {/* Mail Us + Office Address */}
    <div className="container pb-12 grid md:grid-cols-2 gap-8">
      <div className="glass gold-border rounded-2xl p-6 space-y-3">
        <h4 className="font-display text-gold uppercase tracking-widest text-xs inline-flex items-center gap-2">
          <Mail className="w-4 h-4" /> Mail Us
        </h4>
        <a href={`mailto:${EMAIL}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-gold transition-colors">
          <Mail className="w-4 h-4 text-gold" /> {EMAIL}
        </a>
        <a href={`tel:${PHONE.replace(/\s/g, "")}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-gold transition-colors">
          <Phone className="w-4 h-4 text-gold" /> {PHONE}
        </a>
        <a href="https://instagram.com/_justin._ox" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-gold transition-colors">
          <Instagram className="w-4 h-4 text-gold" /> @_justin._ox
        </a>
      </div>

      <div className="glass gold-border rounded-2xl p-6 space-y-3">
        <h4 className="font-display text-gold uppercase tracking-widest text-xs inline-flex items-center gap-2">
          <MapPin className="w-4 h-4" /> Registered Office Address
        </h4>
        <p className="text-sm text-muted-foreground">Zyvanta Luxe Pvt. Ltd.</p>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${MAP_QUERY}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start gap-2 text-sm text-muted-foreground hover:text-gold transition-colors"
        >
          <MapPin className="w-4 h-4 text-gold mt-0.5 shrink-0" />
          <span>{ADDRESS}</span>
        </a>
      </div>
    </div>

    {/* Map */}
    <div className="container">
      <div className="rounded-2xl overflow-hidden glass gold-border shadow-elite">
        <iframe
          title="Zyvanta location map"
          src={`https://www.google.com/maps?q=${MAP_QUERY}&output=embed`}
          width="100%"
          height="280"
          style={{ border: 0, pointerEvents: "none" }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>
    </div>

    {/* Bottom strip */}
    <div className="border-t border-gold/10 mt-10">
      <div className="container py-5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-5 text-muted-foreground">
          <a href="#" className="inline-flex items-center gap-2 hover:text-gold transition-colors">
            <Gift className="w-4 h-4 text-gold" /> Gift Cards
          </a>
          <a href="#contact" className="inline-flex items-center gap-2 hover:text-gold transition-colors">
            <LifeBuoy className="w-4 h-4 text-gold" /> Help Center
          </a>
          <span className="inline-flex items-center gap-2">
            <Globe className="w-4 h-4 text-gold" /> © {new Date().getFullYear()} Zyvanta
          </span>
          <a href="https://zyvanta.com" className="hover:text-gold transition-colors">zyvanta.com</a>
        </div>
        <span className="uppercase tracking-widest text-muted-foreground">Crafted with obsession.</span>
      </div>
    </div>
  </footer>
);
export default Footer;
