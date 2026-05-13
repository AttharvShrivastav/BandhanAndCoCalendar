import { useEffect } from "react";
import { useLocation } from "wouter";
import { CalendarDays, Building2, BookOpen, Star, Palette, Tag, ChevronRight, Sparkles, Check, Crown, Zap, Headphones, GitBranch, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Wedding images (high quality, landscape + portrait mix) ──────────────────
const IMG_CEREMONY = "https://media0.wedsociety.com/wp-content/uploads/2024/11/d503e6f5cf9a60766c4469d44e2e4014672d416d06602.jpg";
const IMG_PORTRAIT = "https://media0.wedsociety.com/wp-content/uploads/2024/11/45e8ba2a2011dc8e1eeaf7874d6f8003672d41718391c.jpg";
const IMG_VENUE    = "https://images.squarespace-cdn.com/content/v1/6744250b81521d675423a80c/c8f9b5e2-4b08-4f7d-a123-735dc9706a87/1_wedding-at-canto-mumbai-35-of-89.jpeg";
const IMG_DECOR    = "https://www.niralidecor.com/_next/image?url=https%3A%2F%2Fniralidecor.nyc3.digitaloceanspaces.com%2Fblog-uploads%2Fblog-1768922478863-516016448.jpg&w=3840&q=75";

// ─── Features ─────────────────────────────────────────────────────────────────
const features = [
  { icon: CalendarDays, title: "Hindu Panchang Calendar", desc: "55+ Shubh Muhurats and 30+ festivals for 2026 integrated directly into your calendar view.", color: "#0F2A44" },
  { icon: BookOpen, title: "Full Booking Management", desc: "Manage clients with complete details — bride, groom, and multiple events per family.", color: "#6b3a7d" },
  { icon: Building2, title: "Venue Directory", desc: "Register venues, track capacity, and see all bookings assigned to each venue at a glance.", color: "#1e5f7b" },
  { icon: Palette, title: "Custom Colour Grading", desc: "Assign any colour to any event. Events appear exactly as you colour them on the calendar.", color: "#b85a10" },
  { icon: Tag, title: "Category Sorting", desc: "Filter by Wedding, Corporate, Social, Religious, or Other. Find exactly what you need instantly.", color: "#2d6e35" },
  { icon: Star, title: "Multi-Device Sync", desc: "Deployed on Railway with a persistent database — all devices see the same live data.", color: "#b07c2a" },
];

// ─── Scroll-reveal hook ───────────────────────────────────────────────────────
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll("[data-reveal]");
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).style.opacity = "1";
            (entry.target as HTMLElement).style.transform = "translateY(0) scale(1)";
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

// ─── Reveal wrapper styles (applied inline so no Tailwind purge issues) ───────
const revealBase: React.CSSProperties = {
  opacity: 0,
  transform: "translateY(28px) scale(0.98)",
  transition: "opacity 0.65s ease, transform 0.65s ease",
};
function delayStyle(ms: number): React.CSSProperties {
  return { ...revealBase, transitionDelay: `${ms}ms` };
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [, navigate] = useLocation();
  useReveal();

  return (
    <div className="min-h-screen bg-background flex flex-col" style={{ fontFamily: "Inter, sans-serif" }}>

      {/* Global CSS for float animation */}
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50%       { transform: translateY(-10px) rotate(1deg); }
        }
        @keyframes float-slower {
          0%, 100% { transform: translateY(0px) rotate(-1deg); }
          50%       { transform: translateY(-14px) rotate(0.5deg); }
        }
        @keyframes drift {
          0%, 100% { transform: translateY(0) translateX(0); }
          33%       { transform: translateY(-8px) translateX(4px); }
          66%       { transform: translateY(4px) translateX(-3px); }
        }
        .float-slow   { animation: float-slow   6s ease-in-out infinite; }
        .float-slower { animation: float-slower 9s ease-in-out infinite; }
        .drift        { animation: drift        12s ease-in-out infinite; }
        .img-overlay::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, transparent 55%, hsl(210,69%,16%,0.35) 100%);
          border-radius: inherit;
        }
      `}</style>

      {/* ── Nav ── */}
      <nav className="px-8 py-4 flex items-center justify-between border-b border-border bg-card/80 backdrop-blur sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <svg aria-label="Bandhan & Co." viewBox="0 0 32 32" fill="none" width="28" height="28">
            <rect width="32" height="32" rx="6" fill="hsl(210,69%,16%)"/>
            <path d="M9 7 L9 25 L18 25 C21.5 25 24 23 24 20 C24 18 22.5 16.5 20.5 16 C22 15.3 23 13.8 23 12 C23 9.2 20.8 7 18 7 Z" fill="none" stroke="#C8A45D" strokeWidth="1.6" strokeLinejoin="round"/>
            <ellipse cx="16" cy="16" rx="4.5" ry="2.2" stroke="#C8A45D" strokeWidth="1.3" fill="none" opacity="0.85"/>
            <ellipse cx="16" cy="16" rx="2.2" ry="4.5" stroke="#C8A45D" strokeWidth="1.3" fill="none" opacity="0.85"/>
            <circle cx="16" cy="16" r="1.2" fill="#C8A45D"/>
          </svg>
          <span className="text-lg font-semibold" style={{ fontFamily: "Playfair Display, serif" }}>
            Bandhan <span style={{ color: "hsl(38,49%,57%)" }}>&amp; Co.</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/auth")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Sign In
          </button>
          <button
            onClick={() => document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Pricing
          </button>
          <Button size="sm" onClick={() => navigate("/app")}>
            Open Calendar <ChevronRight size={14} className="ml-1" />
          </Button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative flex flex-col lg:flex-row items-center justify-between gap-12 px-8 md:px-16 py-20 overflow-hidden" style={{ minHeight: "88vh" }}>

        {/* Background decorative rings */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <svg viewBox="0 0 900 700" className="absolute -top-24 -right-32 w-[550px] h-[550px] opacity-[0.04]" fill="none">
            <circle cx="450" cy="350" r="320" stroke="hsl(210,69%,16%)" strokeWidth="1.5"/>
            <circle cx="450" cy="350" r="230" stroke="hsl(38,49%,57%)" strokeWidth="1"/>
            <circle cx="450" cy="350" r="140" stroke="hsl(210,69%,16%)" strokeWidth="0.7"/>
          </svg>
          <svg viewBox="0 0 500 500" className="absolute -bottom-24 -left-24 w-80 h-80 opacity-[0.05]" fill="none">
            <circle cx="250" cy="250" r="220" stroke="hsl(38,49%,57%)" strokeWidth="1"/>
            <path d="M250 80 C190 80, 160 160, 250 280 C340 160, 310 80, 250 80Z" fill="hsl(38,49%,57%)"/>
            <path d="M250 420 C190 420, 160 340, 250 280 C340 340, 310 420, 250 420Z" fill="hsl(210,69%,16%)"/>
          </svg>
          {/* Subtle dot pattern */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.025]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.2" fill="hsl(210,69%,16%)"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)"/>
          </svg>
        </div>

        {/* Left — text */}
        <div className="flex-1 flex flex-col items-start z-10 max-w-xl">
          {/* Badge */}
          <div data-reveal style={delayStyle(0)}
            className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border mb-6"
            style={{ borderColor: "hsl(38,49%,57%)", color: "hsl(38,49%,57%)", background: "hsl(38,49%,57%,0.08)" }}>
            <Sparkles size={11} />
            Hindu Panchang · Shubh Muhurats · Multi-Device Sync
          </div>

          <h1 data-reveal style={delayStyle(80)}
            className="text-5xl md:text-6xl font-light mb-5 text-foreground leading-tight"
            style={{ fontFamily: "Playfair Display, serif", letterSpacing: "-0.02em" }}>
            Weddings,<br/>
            <span style={{ color: "hsl(38,49%,57%)" }}>Managed Right.</span>
          </h1>

          <p data-reveal style={delayStyle(160)}
            className="text-base text-muted-foreground mb-9 leading-relaxed">
            Bandhan &amp; Co. is the modern infrastructure for wedding planners and venue owners.
            Manage bookings, track Hindu auspicious dates, and stay organised — all in one place.
          </p>

          <div data-reveal style={delayStyle(240)} className="flex items-center gap-3 flex-wrap">
            <Button size="lg" onClick={() => navigate("/auth")} className="gap-2 px-8"
              style={{ background: "hsl(210,69%,16%)", color: "#fff" }}>
              Get Started <ChevronRight size={16} />
            </Button>
            <button onClick={() => navigate("/app")}
              className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors">
              Skip — open calendar directly
            </button>
          </div>

          {/* Mini stats */}
          <div data-reveal style={delayStyle(320)}
            className="flex items-center gap-8 mt-12 text-center flex-wrap">
            {[
              { num: "55+", label: "Shubh Muhurats" },
              { num: "30+", label: "Hindu Festivals" },
              { num: "5", label: "Event Categories" },
              { num: "∞", label: "Clients & Venues" },
            ].map(({ num, label }) => (
              <div key={label}>
                <div className="text-2xl font-semibold" style={{ fontFamily: "Playfair Display, serif", color: "hsl(210,69%,16%)" }}>{num}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — image collage */}
        <div className="flex-1 relative hidden lg:flex items-center justify-center z-10" style={{ minHeight: 480, maxWidth: 480 }}>
          {/* Main large image */}
          <div className="float-slow img-overlay relative rounded-2xl overflow-hidden shadow-2xl"
            style={{ width: 280, height: 380, flexShrink: 0 }}>
            <img src={IMG_PORTRAIT} alt="Indian wedding ceremony" className="w-full h-full object-cover" loading="lazy" />
          </div>
          {/* Secondary image — top right */}
          <div className="float-slower img-overlay absolute rounded-xl overflow-hidden shadow-xl border-2 border-background"
            style={{ width: 170, height: 130, top: 20, right: 10 }}>
            <img src={IMG_CEREMONY} alt="Wedding ceremony" className="w-full h-full object-cover" loading="lazy" />
          </div>
          {/* Tertiary image — bottom left */}
          <div className="drift img-overlay absolute rounded-xl overflow-hidden shadow-xl border-2 border-background"
            style={{ width: 155, height: 120, bottom: 30, left: 10 }}>
            <img src={IMG_VENUE} alt="Wedding venue" className="w-full h-full object-cover" loading="lazy" />
          </div>
          {/* Gold ring accent */}
          <svg className="absolute -bottom-8 -right-8 opacity-20 pointer-events-none" width="160" height="160" viewBox="0 0 160 160" fill="none">
            <circle cx="80" cy="80" r="70" stroke="hsl(38,49%,57%)" strokeWidth="1.5"/>
            <circle cx="80" cy="80" r="50" stroke="hsl(38,49%,57%)" strokeWidth="0.8"/>
          </svg>
          {/* Dot cluster accent */}
          <svg className="absolute -top-6 -left-6 opacity-15 pointer-events-none" width="80" height="80" viewBox="0 0 80 80" fill="none">
            {[0,1,2,3].map(row => [0,1,2,3].map(col => (
              <circle key={`${row}-${col}`} cx={col*20+10} cy={row*20+10} r="2.5" fill="hsl(210,69%,16%)"/>
            )))}
          </svg>
        </div>
      </section>

      {/* ── Photo strip ── */}
      <section className="py-10 border-t border-border overflow-hidden bg-card">
        <div className="flex gap-4 px-8 md:px-16">
          {[IMG_CEREMONY, IMG_DECOR, IMG_VENUE, IMG_PORTRAIT].map((src, i) => (
            <div key={i} data-reveal style={{ ...delayStyle(i * 80), flex: "1 1 0", minWidth: 0 }}>
              <div className="img-overlay relative rounded-xl overflow-hidden" style={{ height: 160 }}>
                <img src={src} alt="Wedding" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" loading="lazy" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="px-8 md:px-16 py-20 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <div data-reveal style={revealBase} className="text-center mb-12">
            <h2 className="text-3xl font-light mb-2" style={{ fontFamily: "Playfair Display, serif" }}>
              Everything a wedding planner needs
            </h2>
            <p className="text-sm text-muted-foreground">Built specifically for the Indian wedding industry</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map(({ icon: Icon, title, desc, color }, i) => (
              <div key={title} data-reveal style={delayStyle(i * 60)}
                className="bg-card rounded-xl p-5 border border-border hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                  style={{ background: `${color}18` }}>
                  <Icon size={18} style={{ color }} />
                </div>
                <h3 className="text-sm font-semibold mb-1">{title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Image + quote band ── */}
      <section className="relative border-t border-border overflow-hidden" style={{ height: 320 }}>
        <img src={IMG_DECOR} alt="Wedding decoration" className="w-full h-full object-cover" loading="lazy" />
        {/* Dark gradient overlay */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, hsl(210,69%,16%,0.88) 0%, hsl(210,69%,16%,0.4) 60%, transparent 100%)" }} />
        <div className="absolute inset-0 flex flex-col items-start justify-center px-12 md:px-20">
          <div data-reveal style={revealBase}>
            <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "hsl(38,49%,57%)" }}>Crafted for planners</p>
            <h3 className="text-3xl font-light text-white max-w-md leading-snug" style={{ fontFamily: "Playfair Display, serif" }}>
              "Every detail, every date,<br/>every memory — in one place."
            </h3>
          </div>
        </div>
      </section>

      {/* ── Pricing Section ── */}
      {/* <section id="pricing-section" className="px-8 md:px-16 py-20 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <div data-reveal style={revealBase} className="text-center mb-12">
            <div className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border mb-4"
              style={{ borderColor: "hsl(38,49%,57%)", color: "hsl(38,49%,57%)", background: "hsl(38,49%,57%,0.08)" }}>
              <Crown size={11} /> Simple, transparent pricing
            </div>
            <h2 className="text-3xl font-light mb-2" style={{ fontFamily: "Playfair Display, serif" }}>
              No free tier — just full access
            </h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Every plan includes everything. Pick the commitment that suits you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {[
              {
                icon: Sparkles, name: "Monthly", tagline: "Try it out",
                price: 2000, badge: "15-day free trial", badgeColor: "#2d6e35",
                billed: "Billed monthly", saving: null, highlight: false, premiumFeatures: false,
              },
              {
                icon: Crown, name: "6 Months", tagline: "Most popular",
                price: 1600, badge: "1 month free", badgeColor: "#b07c2a",
                billed: "Billed as ₹9,600 every 6 months", saving: "Save ₹2,400/year vs monthly",
                highlight: true, premiumFeatures: true,
              },
              {
                icon: Zap, name: "Yearly", tagline: "Best value",
                price: 1400, badge: "1 month free", badgeColor: "#1e5f7b",
                billed: "Billed as ₹16,800/year", saving: "Save ₹7,200/year vs monthly",
                highlight: false, premiumFeatures: true,
              },
            ].map(({ icon: Icon, name, tagline, price, badge, badgeColor, billed, saving, highlight, premiumFeatures }, i) => (
              <div key={name} data-reveal style={delayStyle(i * 90)}
                className="rounded-2xl border flex flex-col overflow-hidden transition-transform duration-300 hover:-translate-y-1"
                style={{
                  borderColor: highlight ? "hsl(38,49%,57%)" : "hsl(var(--border))",
                  background: highlight ? "hsl(210,69%,16%)" : "hsl(var(--card))",
                  borderWidth: highlight ? "2px" : "1px",
                  boxShadow: highlight ? "0 8px 32px rgba(15,42,68,0.18)" : undefined,
                }}>
                {highlight && (
                  <div className="text-center py-1.5 text-[10px] font-semibold tracking-wide"
                    style={{ background: "hsl(38,49%,57%)", color: "#fff" }}>MOST POPULAR</div>
                )}
                <div className="px-6 pt-6 pb-4">
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: highlight ? "rgba(200,164,93,0.18)" : "hsl(210,69%,16%,0.08)" }}>
                      <Icon size={16} style={{ color: highlight ? "#C8A45D" : "hsl(210,69%,16%)" }} />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest"
                        style={{ color: highlight ? "rgba(255,255,255,0.5)" : "hsl(var(--muted-foreground))" }}>{tagline}</p>
                      <h3 className="text-sm font-semibold"
                        style={{ color: highlight ? "#fff" : "hsl(var(--foreground))" }}>{name}</h3>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-xs" style={{ color: highlight ? "rgba(255,255,255,0.5)" : "hsl(var(--muted-foreground))" }}>₹</span>
                    <span className="text-4xl font-light" style={{ fontFamily: "Playfair Display, serif", color: highlight ? "#C8A45D" : "hsl(var(--foreground))" }}>
                      {price.toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs" style={{ color: highlight ? "rgba(255,255,255,0.45)" : "hsl(var(--muted-foreground))" }}>/mo</span>
                  </div>
                  <p className="text-[10px] mb-2" style={{ color: highlight ? "rgba(255,255,255,0.4)" : "hsl(var(--muted-foreground))" }}>{billed}</p>
                  <div className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full"
                    style={{ background: `${badgeColor}18`, color: badgeColor, border: `1px solid ${badgeColor}33` }}>
                    <Sparkles size={8} /> {badge}
                  </div>
                  {saving && <p className="text-[10px] mt-1.5 font-medium" style={{ color: highlight ? "rgba(200,164,93,0.85)" : "hsl(38,49%,57%)" }}>{saving}</p>}
                </div>
                <div className="mx-6 border-t" style={{ borderColor: highlight ? "rgba(255,255,255,0.1)" : "hsl(var(--border))" }} />
                <div className="px-6 py-4 flex-1">
                  <ul className="space-y-2">
                    {[
                      "Full platform access",
                      "Hindu Panchang calendar",
                      "Unlimited bookings & clients",
                      "Multi-venue management",
                      "Colour grading & categories",
                      "Multi-device sync",
                    ].map(f => (
                      <li key={f} className="flex items-center gap-2 text-xs"
                        style={{ color: highlight ? "rgba(255,255,255,0.75)" : "hsl(var(--foreground))" }}>
                        <Check size={11} style={{ color: highlight ? "#C8A45D" : "hsl(210,69%,16%)" }} className="flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                    {premiumFeatures && [
                      "Priority support",
                      "Early feature access",
                      "Beta version access",
                    ].map(f => (
                      <li key={f} className="flex items-center gap-2 text-xs font-medium"
                        style={{ color: highlight ? "#C8A45D" : "hsl(38,49%,57%)" }}>
                        <Check size={11} className="flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="px-6 pb-6">
                  <button
                    onClick={() => navigate("/auth")}
                    className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 active:scale-95"
                    style={
                      highlight
                        ? { background: "hsl(38,49%,57%)", color: "#fff" }
                        : { background: "hsl(210,69%,16%)", color: "#fff" }
                    }>
                    Get Started <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* ── CTA Banner ── */}
      <section className="px-8 md:px-16 py-16 text-center border-t border-border relative overflow-hidden"
        style={{ background: "hsl(210,69%,16%)" }}>
        {/* Subtle concentric ring bg */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.06]" viewBox="0 0 800 300" fill="none" preserveAspectRatio="xMidYMid slice">
          <circle cx="400" cy="150" r="200" stroke="#C8A45D" strokeWidth="1"/>
          <circle cx="400" cy="150" r="280" stroke="#C8A45D" strokeWidth="0.7"/>
          <circle cx="400" cy="150" r="360" stroke="#C8A45D" strokeWidth="0.5"/>
        </svg>
        <div data-reveal style={revealBase} className="relative z-10">
          <h2 className="text-3xl font-light text-white mb-3" style={{ fontFamily: "Playfair Display, serif" }}>
            Ready to start planning?
          </h2>
          <p className="text-sm mb-7" style={{ color: "rgba(255,255,255,0.7)" }}>
            Set up your planner profile and open your calendar in seconds.
          </p>
          <Button size="lg" onClick={() => navigate("/auth")} className="gap-2"
            style={{ background: "hsl(38,49%,57%)", color: "#fff", border: "none" }}>
            Create Account <ChevronRight size={16} />
          </Button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="px-8 py-5 border-t border-border flex items-center justify-between bg-card text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <svg viewBox="0 0 32 32" fill="none" width="18" height="18">
            <rect width="32" height="32" rx="5" fill="hsl(210,69%,16%)"/>
            <path d="M9 7 L9 25 L18 25 C21.5 25 24 23 24 20 C24 18 22.5 16.5 20.5 16 C22 15.3 23 13.8 23 12 C23 9.2 20.8 7 18 7 Z" fill="none" stroke="#C8A45D" strokeWidth="1.6" strokeLinejoin="round"/>
            <circle cx="16" cy="16" r="1.2" fill="#C8A45D"/>
          </svg>
          Bandhan &amp; Co. — Weddings, Managed Right
        </div>
        <span>Hindu Panchang integrated · 2026</span>
      </footer>
    </div>
  );
}
