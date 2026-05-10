import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import {
  Check, ChevronRight, ArrowLeft, Sparkles, Zap, Crown, Star,
  CalendarDays, Building2, BookOpen, Palette, Tag, Bell, Shield,
  Headphones, GitBranch, FlaskConical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

// ─── Scroll-reveal ─────────────────────────────────────────────────────────
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll("[data-reveal]");
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).style.opacity = "1";
            (e.target as HTMLElement).style.transform = "translateY(0) scale(1)";
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.08 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}
const revealBase: React.CSSProperties = {
  opacity: 0,
  transform: "translateY(24px) scale(0.98)",
  transition: "opacity 0.6s ease, transform 0.6s ease",
};
function delay(ms: number): React.CSSProperties {
  return { ...revealBase, transitionDelay: `${ms}ms` };
}

// ─── Logo ──────────────────────────────────────────────────────────────────
function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg aria-label="Bandhan & Co." viewBox="0 0 32 32" fill="none" width={size} height={size}>
      <rect width="32" height="32" rx="6" fill="hsl(210,69%,16%)" />
      <path d="M9 7 L9 25 L18 25 C21.5 25 24 23 24 20 C24 18 22.5 16.5 20.5 16 C22 15.3 23 13.8 23 12 C23 9.2 20.8 7 18 7 Z"
        fill="none" stroke="#C8A45D" strokeWidth="1.6" strokeLinejoin="round" />
      <ellipse cx="16" cy="16" rx="4.5" ry="2.2" stroke="#C8A45D" strokeWidth="1.3" fill="none" opacity="0.85" />
      <ellipse cx="16" cy="16" rx="2.2" ry="4.5" stroke="#C8A45D" strokeWidth="1.3" fill="none" opacity="0.85" />
      <circle cx="16" cy="16" r="1.2" fill="#C8A45D" />
    </svg>
  );
}

// ─── Features list ─────────────────────────────────────────────────────────
const ALL_FEATURES = [
  { icon: CalendarDays, label: "Hindu Panchang calendar with 55+ Shubh Muhurats" },
  { icon: BookOpen,     label: "Unlimited client & booking management" },
  { icon: Building2,    label: "Multi-venue directory with individual calendars" },
  { icon: Palette,      label: "Custom colour grading for events" },
  { icon: Tag,          label: "Category sorting & filtering" },
  { icon: Bell,         label: "Event & calendar notifications" },
  { icon: Shield,       label: "Multi-device sync across all platforms" },
  { icon: Star,         label: "Full dashboard & analytics overview" },
];

const PREMIUM_FEATURES = [
  { icon: Headphones, label: "Priority support response (within 4 hours)", premium: true },
  { icon: Zap,        label: "Early access to new features & updates",        premium: true },
  { icon: FlaskConical, label: "Access to beta versions",                      premium: true },
];

// ─── Plans ─────────────────────────────────────────────────────────────────
const plans = [
  {
    key: "trial",
    icon: Sparkles,
    name: "Monthly",
    tagline: "Try it out",
    badge: "15-day free trial",
    badgeColor: "#2d6e35",
    priceMonthly: 2000,
    billedAs: "Billed monthly",
    trial: "15 days free, then ₹2,000/month",
    saving: null,
    highlight: false,
    accentColor: "hsl(210,69%,16%)",
    premiumFeatures: false,
  },
  {
    key: "halfyear",
    icon: Crown,
    name: "6 Months",
    tagline: "Most popular",
    badge: "1 month free",
    badgeColor: "#b07c2a",
    priceMonthly: 1600,
    billedAs: "Billed as ₹9,600 every 6 months",
    trial: "First month free, then ₹9,600",
    saving: "Save ₹2,400/year vs monthly",
    highlight: true,
    accentColor: "hsl(38,49%,57%)",
    premiumFeatures: true,
  },
  {
    key: "yearly",
    icon: Zap,
    name: "Yearly",
    tagline: "Best value",
    badge: "1 month free",
    badgeColor: "#1e5f7b",
    priceMonthly: 1400,
    billedAs: "Billed as ₹16,800/year",
    trial: "First month free, then ₹16,800",
    saving: "Save ₹7,200/year vs monthly",
    highlight: false,
    accentColor: "hsl(210,69%,16%)",
    premiumFeatures: true,
  },
];

// ─── Main ──────────────────────────────────────────────────────────────────
export default function PricingPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [selected, setSelected] = useState<string | null>(null);
  useReveal();

  function handleChoose(planKey: string) {
    setSelected(planKey);
    toast({
      title: "Plan selected",
      description: "Payment integration coming soon. You're being taken to your calendar.",
    });
    setTimeout(() => navigate("/profile"), 1200);
  }

  return (
    <div className="min-h-screen bg-background flex flex-col" style={{ fontFamily: "Inter, sans-serif" }}>

      <style>{`
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .gold-shimmer {
          background: linear-gradient(90deg, #C8A45D 0%, #e8cc8a 40%, #C8A45D 60%, #a07830 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s linear infinite;
        }
        .plan-card { transition: transform 0.25s ease, box-shadow 0.25s ease; }
        .plan-card:hover { transform: translateY(-4px); }
      `}</style>

      {/* Nav */}
      <nav className="px-8 py-4 flex items-center justify-between border-b border-border bg-card/80 backdrop-blur sticky top-0 z-40">
        <button onClick={() => navigate("/")} className="flex items-center gap-2.5 group">
          <Logo size={28} />
          <span className="text-lg font-semibold group-hover:opacity-80 transition-opacity"
            style={{ fontFamily: "Playfair Display, serif" }}>
            Bandhan <span style={{ color: "hsl(38,49%,57%)" }}>&amp; Co.</span>
          </span>
        </button>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/auth")}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={14} /> Back
          </button>
          <button onClick={() => navigate("/app")}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2">
            Skip to calendar
          </button>
        </div>
      </nav>

      {/* Header */}
      <section className="px-8 md:px-16 pt-16 pb-10 text-center relative overflow-hidden">
        {/* Subtle bg rings */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.03]" viewBox="0 0 800 400" fill="none" preserveAspectRatio="xMidYMid slice">
          <circle cx="400" cy="200" r="300" stroke="hsl(210,69%,16%)" strokeWidth="1.5" />
          <circle cx="400" cy="200" r="220" stroke="hsl(38,49%,57%)" strokeWidth="1" />
          <circle cx="400" cy="200" r="140" stroke="hsl(210,69%,16%)" strokeWidth="0.7" />
        </svg>
        <div data-reveal style={delay(0)} className="relative z-10">
          <div className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border mb-5"
            style={{ borderColor: "hsl(38,49%,57%)", color: "hsl(38,49%,57%)", background: "hsl(38,49%,57%,0.08)" }}>
            <Crown size={11} /> Choose your plan
          </div>
          <h1 className="text-4xl md:text-5xl font-light mb-4 leading-tight"
            style={{ fontFamily: "Playfair Display, serif" }}>
            Simple, transparent <span className="gold-shimmer">pricing</span>
          </h1>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
            No free tier. Every plan includes the full platform — choose the commitment that works for you.
            All plans start with a free trial so you can experience Bandhan &amp; Co. before you pay.
          </p>
        </div>
      </section>

      {/* Pricing cards */}
      <section className="px-6 md:px-16 pb-16">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan, i) => {
            const Icon = plan.icon;
            const isHighlight = plan.highlight;
            return (
              <div
                key={plan.key}
                data-reveal
                style={delay(i * 100)}
                className={`plan-card relative rounded-2xl border flex flex-col overflow-hidden ${isHighlight ? "shadow-2xl" : "shadow-sm"}`}
                style={{
                  borderColor: isHighlight ? "hsl(38,49%,57%)" : "hsl(var(--border))",
                  background: isHighlight ? "hsl(210,69%,16%)" : "hsl(var(--card))",
                  borderWidth: isHighlight ? "2px" : "1px",
                }}
              >
                {/* Popular ribbon */}
                {isHighlight && (
                  <div className="absolute top-4 right-4 text-[10px] font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: "hsl(38,49%,57%)", color: "#fff" }}>
                    Most Popular
                  </div>
                )}

                {/* Card top */}
                <div className="px-6 pt-7 pb-5">
                  {/* Icon + name */}
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: isHighlight ? "rgba(200,164,93,0.2)" : `${plan.accentColor}14`,
                      }}>
                      <Icon size={18} style={{ color: isHighlight ? "#C8A45D" : plan.accentColor }} />
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-widest"
                        style={{ color: isHighlight ? "rgba(255,255,255,0.55)" : "hsl(var(--muted-foreground))" }}>
                        {plan.tagline}
                      </p>
                      <h3 className="text-base font-semibold"
                        style={{ color: isHighlight ? "#fff" : "hsl(var(--foreground))" }}>
                        {plan.name}
                      </h3>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-1">
                    <div className="flex items-baseline gap-1">
                      <span className="text-xs font-medium"
                        style={{ color: isHighlight ? "rgba(255,255,255,0.6)" : "hsl(var(--muted-foreground))" }}>
                        ₹
                      </span>
                      <span className="text-5xl font-light"
                        style={{
                          fontFamily: "Playfair Display, serif",
                          color: isHighlight ? "#C8A45D" : "hsl(var(--foreground))",
                        }}>
                        {plan.priceMonthly.toLocaleString("en-IN")}
                      </span>
                      <span className="text-sm"
                        style={{ color: isHighlight ? "rgba(255,255,255,0.5)" : "hsl(var(--muted-foreground))" }}>
                        /mo
                      </span>
                    </div>
                    <p className="text-[11px] mt-1"
                      style={{ color: isHighlight ? "rgba(255,255,255,0.5)" : "hsl(var(--muted-foreground))" }}>
                      {plan.billedAs}
                    </p>
                  </div>

                  {/* Trial badge */}
                  <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full"
                    style={{
                      background: isHighlight ? "rgba(200,164,93,0.15)" : `${plan.badgeColor}14`,
                      color: isHighlight ? "#C8A45D" : plan.badgeColor,
                      border: `1px solid ${isHighlight ? "rgba(200,164,93,0.3)" : `${plan.badgeColor}33`}`,
                    }}>
                    <Sparkles size={9} />
                    {plan.badge}
                  </div>

                  {/* Saving */}
                  {plan.saving && (
                    <p className="text-[11px] mt-2 font-medium"
                      style={{ color: isHighlight ? "rgba(200,164,93,0.9)" : plan.accentColor }}>
                      {plan.saving}
                    </p>
                  )}
                </div>

                {/* Divider */}
                <div className="mx-6 border-t" style={{ borderColor: isHighlight ? "rgba(255,255,255,0.12)" : "hsl(var(--border))" }} />

                {/* Features */}
                <div className="px-6 py-5 flex-1">
                  <p className="text-[10px] uppercase tracking-widest font-semibold mb-3"
                    style={{ color: isHighlight ? "rgba(255,255,255,0.45)" : "hsl(var(--muted-foreground))" }}>
                    Everything included
                  </p>
                  <ul className="space-y-2.5">
                    {ALL_FEATURES.map(({ icon: FIcon, label }) => (
                      <li key={label} className="flex items-start gap-2.5">
                        <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ background: isHighlight ? "rgba(200,164,93,0.18)" : "hsl(210,69%,16%,0.08)" }}>
                          <Check size={9} style={{ color: isHighlight ? "#C8A45D" : "hsl(210,69%,16%)" }} />
                        </div>
                        <span className="text-xs leading-snug"
                          style={{ color: isHighlight ? "rgba(255,255,255,0.8)" : "hsl(var(--foreground))" }}>
                          {label}
                        </span>
                      </li>
                    ))}
                    {/* Premium extras for 6mo + yearly */}
                    {plan.premiumFeatures && PREMIUM_FEATURES.map(({ icon: PIcon, label }) => (
                      <li key={label} className="flex items-start gap-2.5">
                        <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ background: isHighlight ? "rgba(200,164,93,0.25)" : "hsl(38,49%,57%,0.15)" }}>
                          <Check size={9} style={{ color: isHighlight ? "#C8A45D" : "hsl(38,49%,57%)" }} />
                        </div>
                        <span className="text-xs font-medium leading-snug"
                          style={{ color: isHighlight ? "#C8A45D" : "hsl(38,49%,57%)" }}>
                          {label}
                        </span>
                      </li>
                    ))}
                    {/* Monthly — show premium features as locked */}
                    {!plan.premiumFeatures && PREMIUM_FEATURES.map(({ label }) => (
                      <li key={label} className="flex items-start gap-2.5 opacity-40">
                        <div className="w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ borderColor: "hsl(var(--border))" }}>
                          <span className="w-1 h-1 rounded-full bg-muted-foreground block" />
                        </div>
                        <span className="text-xs leading-snug text-muted-foreground line-through">
                          {label}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA */}
                <div className="px-6 pb-6 mt-2">
                  <button
                    onClick={() => handleChoose(plan.key)}
                    data-testid={`button-choose-${plan.key}`}
                    className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 active:scale-95"
                    style={
                      isHighlight
                        ? { background: "hsl(38,49%,57%)", color: "#fff", boxShadow: "0 4px 16px rgba(200,164,93,0.35)" }
                        : { background: "hsl(210,69%,16%)", color: "#fff" }
                    }
                  >
                    Start {plan.badge} <ChevronRight size={15} />
                  </button>
                  <p className="text-[10px] text-center mt-2.5"
                    style={{ color: isHighlight ? "rgba(255,255,255,0.4)" : "hsl(var(--muted-foreground))" }}>
                    {plan.trial}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Feature comparison note */}
      <section className="px-8 md:px-16 pb-16">
        <div className="max-w-3xl mx-auto" data-reveal style={delay(0)}>
          <div className="rounded-2xl border border-border bg-card px-8 py-7">
            <h3 className="text-base font-semibold mb-1" style={{ fontFamily: "Playfair Display, serif" }}>
              What's different between plans?
            </h3>
            <p className="text-xs text-muted-foreground mb-5 leading-relaxed">
              Every plan gives you the full Bandhan &amp; Co. platform. The only difference is commitment — and the extra perks that come with longer plans.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-foreground mb-2.5 flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: "hsl(210,69%,16%)" }} />
                  All plans include
                </p>
                <ul className="space-y-1.5">
                  {ALL_FEATURES.map(({ label }) => (
                    <li key={label} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Check size={11} style={{ color: "hsl(210,69%,16%)" }} className="flex-shrink-0" />
                      {label}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold mb-2.5 flex items-center gap-1.5"
                  style={{ color: "hsl(38,49%,57%)" }}>
                  <div className="w-2 h-2 rounded-full" style={{ background: "hsl(38,49%,57%)" }} />
                  6-month &amp; yearly only
                </p>
                <ul className="space-y-1.5">
                  {PREMIUM_FEATURES.map(({ icon: Icon, label }) => (
                    <li key={label} className="flex items-center gap-2 text-xs"
                      style={{ color: "hsl(38,49%,57%)" }}>
                      <Icon size={11} className="flex-shrink-0" />
                      {label}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 p-3 rounded-xl text-xs text-muted-foreground leading-relaxed"
                  style={{ background: "hsl(38,49%,57%,0.07)", border: "1px solid hsl(38,49%,57%,0.2)" }}>
                  These perks reward planners who commit to Bandhan &amp; Co. for the long run.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ strip */}
      <section className="px-8 md:px-16 pb-16">
        <div className="max-w-3xl mx-auto space-y-3" data-reveal style={delay(0)}>
          <h3 className="text-base font-semibold mb-4" style={{ fontFamily: "Playfair Display, serif" }}>
            Common questions
          </h3>
          {[
            { q: "Can I cancel anytime?", a: "Yes. Monthly plans can be cancelled before the next billing cycle. 6-month and yearly plans are billed upfront but you can stop renewal at any time." },
            { q: "What happens after my free trial?", a: "After your trial period, you'll be charged at the plan rate. Monthly: ₹2,000/month. 6-month: ₹9,600 every 6 months. Yearly: ₹16,800/year." },
            { q: "Is payment secure?", a: "Payments are processed via a secure payment gateway. We do not store your card details. GST invoice provided for every transaction." },
            { q: "Can I switch plans later?", a: "Yes, you can upgrade from monthly to 6-month or yearly at any time. Unused days are prorated toward your new plan." },
          ].map(({ q, a }) => (
            <div key={q} className="bg-card border border-border rounded-xl px-5 py-4">
              <p className="text-sm font-medium text-foreground">{q}</p>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 py-5 border-t border-border flex items-center justify-between bg-card text-xs text-muted-foreground mt-auto">
        <div className="flex items-center gap-2">
          <Logo size={18} />
          Bandhan &amp; Co. — Weddings, Managed Right
        </div>
        <div className="flex items-center gap-4">
          <button className="hover:text-foreground transition-colors underline underline-offset-2">Terms</button>
          <button className="hover:text-foreground transition-colors underline underline-offset-2">Privacy</button>
          <span>© 2026</span>
        </div>
      </footer>
    </div>
  );
}
