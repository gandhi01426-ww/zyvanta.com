import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { GraduationCap, TrendingUp, Globe, Wallet, Megaphone, Sparkles, Bot, Coins } from "lucide-react";

const courses = [
  { icon: TrendingUp, title: "Dropshipping Mastery", desc: "Build a profitable store from zero — supplier sourcing, ads, scaling." },
  { icon: Globe, title: "How to Make Money Online", desc: "10 proven income streams: freelancing, affiliate, content, SaaS." },
  { icon: Megaphone, title: "Instagram Growth Engine", desc: "Reels, hooks, brand deals — go from 0 → 100K followers." },
  { icon: Wallet, title: "Personal Finance & Investing", desc: "Stocks, mutual funds, crypto basics for Indian investors." },
  { icon: Bot, title: "AI for Solo Entrepreneurs", desc: "Use ChatGPT, Midjourney & automations to run a one-person empire." },
  { icon: Coins, title: "Crypto & Web3 Foundations", desc: "Wallets, DeFi, NFTs — what's hype and what's worth it." },
];

interface Props { open: boolean; onClose: () => void }

const CoursesDialog = ({ open, onClose }: Props) => (
  <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
    <DialogContent className="max-w-3xl p-0 overflow-hidden glass gold-border border-0 sm:rounded-3xl shadow-elite max-h-[90vh] overflow-y-auto">
      <div className="p-7 md:p-9">
        <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.4em] text-gold">
          <Sparkles className="w-3 h-3" /> Zyvanta Academy
        </div>
        <DialogTitle className="font-display text-3xl md:text-4xl mt-2 inline-flex items-center gap-3">
          <GraduationCap className="w-7 h-7 text-gold" /> Courses
        </DialogTitle>
        <DialogDescription className="mt-2 text-sm text-muted-foreground max-w-xl">
          Learn the skills of modern entrepreneurs. Tap a course — full curriculum drops soon.
        </DialogDescription>

        <div className="grid sm:grid-cols-2 gap-4 mt-6">
          {courses.map((c) => (
            <button
              key={c.title}
              type="button"
              onClick={() => alert(`${c.title} — Coming Soon!`)}
              className="text-left glass gold-border rounded-2xl p-5 group hover:shadow-gold transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-gold grid place-items-center shrink-0">
                  <c.icon className="w-5 h-5 text-noir" />
                </div>
                <span className="text-[10px] uppercase tracking-[0.3em] text-gold/80 border border-gold/40 rounded-full px-2 py-0.5">
                  Soon
                </span>
              </div>
              <div className="font-display text-lg mt-3">{c.title}</div>
              <p className="text-sm text-muted-foreground mt-1">{c.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </DialogContent>
  </Dialog>
);
export default CoursesDialog;
