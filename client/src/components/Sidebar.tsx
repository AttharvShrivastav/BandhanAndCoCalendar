import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { CalendarDays, Building2, BookOpen, ChevronDown, User, Settings, LayoutDashboard, LogOut } from "lucide-react";
import { queryClient } from "@/lib/queryClient";

const navItems = [
  { href: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app", label: "Calendar", icon: CalendarDays },
  { href: "/app/bookings", label: "Bookings", icon: BookOpen },
  { href: "/app/venues", label: "Venues", icon: Building2 },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

const LEGEND = [
  { color: "hsl(120,45%,38%)", label: "Shubh Muhurat" },
  { color: "hsl(38,49%,57%)",  label: "Festival" },
  { color: "hsl(210,69%,16%)", label: "Confirmed" },
  { color: "hsl(200,55%,40%)", label: "Tentative" },
  { color: "hsl(0,55%,65%)",   label: "Inauspicious" },
];

export default function Sidebar() {
  const [location, navigate] = useLocation();
  const [legendOpen, setLegendOpen] = useState(false);
  const { toast } = useToast();

  // ── Fetch global auth state (includes impersonation flag) ──
  const { data: authData } = useQuery({ queryKey: ["/api/auth/me"] });
  const profile = authData?.user;
  const org = authData?.organization;
  const isImpersonating = authData?.isImpersonating;

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    
    // Replace the setQueryData line with this. 
    // This acts as a nuclear bomb for the cache, wiping venues, clients, and auth all at once.
    queryClient.clear(); 
    
    navigate("/auth");
  }

  // ── Escape Hatch Handler ──
  async function handleExitImpersonation() {
    try {
      await fetch("/api/superadmin/stop-impersonation", { method: "POST" });
      queryClient.clear(); // Wipe the client's data from memory
      navigate("/app/superadmin"); // Return Rhythm to HQ
      toast({ title: "Returned to HQ", description: "You are back in SuperAdmin mode." });
    } catch (e) {
      toast({ title: "Error", description: "Could not exit workspace.", variant: "destructive" });
    }
  }

  return (
    <aside className="w-full md:w-52 h-full flex-shrink-0 md:border-r border-border bg-card flex flex-col">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          {/* B-knot monogram mark */}
          <svg aria-label="Bandhan & Co." viewBox="0 0 32 32" fill="none" width="30" height="30">
            <rect width="32" height="32" rx="6" fill="hsl(210,69%,16%)"/>
            <path d="M9 7 L9 25 L18 25 C21.5 25 24 23 24 20 C24 18 22.5 16.5 20.5 16 C22 15.3 23 13.8 23 12 C23 9.2 20.8 7 18 7 Z" fill="none" stroke="#C8A45D" strokeWidth="1.6" strokeLinejoin="round"/>
            <ellipse cx="16" cy="16" rx="4.5" ry="2.2" stroke="#C8A45D" strokeWidth="1.3" fill="none" opacity="0.85"/>
            <ellipse cx="16" cy="16" rx="2.2" ry="4.5" stroke="#C8A45D" strokeWidth="1.3" fill="none" opacity="0.85"/>
            <circle cx="16" cy="16" r="1.2" fill="#C8A45D"/>
          </svg>
          <div>
            <h1 className="font-semibold text-sm text-foreground" style={{ fontFamily: "Playfair Display, serif", letterSpacing: "0.01em" }}>
              Bandhan <span style={{ color: "hsl(38,49%,57%)" }}>&amp; Co.</span>
            </h1>
            <p className="text-[9px] text-muted-foreground leading-tight tracking-widest uppercase">Weddings, Managed Right</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2.5 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = location === href || (href !== "/app" && location.startsWith(href));
          return (
            <Link 
              key={href} 
              href={href}
              data-testid={`nav-${label.toLowerCase()}`}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
                active
                  ? "bg-primary text-primary-foreground font-medium"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <Icon size={15} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-border">
        {/* Collapsible Legend */}
        {/* <button
          onClick={() => setLegendOpen(o => !o)}
          className="w-full flex items-center justify-between px-4 py-2.5 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold hover:bg-muted/40 transition-colors"
        >
          <span>Legend</span>
          <ChevronDown size={12} className={`transition-transform ${legendOpen ? "rotate-180" : ""}`} />
        </button>
        {legendOpen && (
          <div className="px-4 pb-3 space-y-1.5 border-b border-border">
            {LEGEND.map(({ color, label }) => (
              <div key={label} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: color }} />
                <span className="text-[11px] text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        )} */}

        {/* ── UNDERCOVER ESCAPE HATCH ── */}
        {isImpersonating && (
          <div className="mx-4 my-3 p-3 rounded-lg border border-destructive bg-destructive/10 shadow-sm">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
              </span>
              <p className="text-[10px] font-bold text-destructive uppercase tracking-widest">Support Mode</p>
            </div>
            <p className="text-xs text-foreground mb-3 font-medium truncate">
              Viewing: {org?.name}
            </p>
            <Button size="sm" variant="destructive" className="w-full h-7 text-xs" onClick={handleExitImpersonation}>
              Exit Workspace
            </Button>
          </div>
        )}

        {/* Profile link */}
        <Link 
          href="/profile"
          className="flex items-center gap-2.5 px-4 py-3 hover:bg-muted/40 transition-colors group"
        >
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-white text-[10px] font-bold"
            style={{ background: "hsl(210,69%,16%)" }}
          >
            {profile?.name ? profile.name.charAt(0).toUpperCase() : <User size={12} />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-foreground truncate">
              {profile?.name || "Set up profile"}
            </p>
            {org?.name && (
              <p className="text-[10px] text-muted-foreground truncate">{org.name}</p>
            )}
          </div>
        </Link>
        
        {/* Sign Out Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-4 py-3 border-t border-border hover:bg-muted/40 transition-colors text-muted-foreground hover:text-foreground text-sm font-medium"
        >
          <LogOut size={15} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}