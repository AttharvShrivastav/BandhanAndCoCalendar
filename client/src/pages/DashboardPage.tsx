import { useMemo, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import {
  Users, CalendarDays, Building2,
  TrendingUp, Clock,
  ArrowRight, MapPin, Phone, Sparkles, ChevronRight // <-- Added ChevronRight
} from "lucide-react";
import type { ClientWithEvents, Venue, BookingEvent } from "@shared/schema"; // <-- Added BookingEvent
import { DateDetailPanel } from "@/pages/CalendarPage"; // <-- Import our Panel!
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
// ─── Time-based greeting ─────────────────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Good night";
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function parseVenueNames(raw: string | null): string {
  if (!raw) return "—";
  try {
    const p = JSON.parse(raw);
    return Array.isArray(p) ? p.join(", ") : raw;
  } catch {
    return raw;
  }
}

function daysFromNow(dateStr: string) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr + "T00:00:00");
  return Math.round((d.getTime() - today.getTime()) / 86_400_000);
}

const STATUS_DOT: Record<string, string> = {
  confirmed: "#27ae60",
  tentative: "#f39c12",
  cancelled: "#e74c3c",
  completed: "#7f8c8d",
};

const EVENT_LABEL: Record<string, string> = {
  mehendi: "Mehendi", sangeet: "Sangeet", wedding: "Wedding",
  reception: "Reception", engagement: "Engagement", haldi: "Haldi",
  corporate: "Corporate", birthday: "Birthday", other: "Other",
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
// ─── Stat Card ────────────────────────────────────────────────────────────────
// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  icon: Icon, label, value, sub, accent, href, onClick
}: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; accent?: string; href?: string; onClick?: () => void;
}) {
  const [, navigate] = useLocation();
  
  return (
    <div 
      onClick={() => {
        if (onClick) onClick();
        else if (href) navigate(href);
      }}
      className={`bg-card border border-border rounded-xl p-4 flex items-start gap-3 ${(href || onClick) ? 'cursor-pointer hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group' : ''}`}
    >
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform ${(href || onClick) ? 'group-hover:scale-110 duration-300' : ''}`}
        style={{ background: accent ? `${accent}18` : "hsl(var(--muted))" }}
      >
        <Icon size={16} style={{ color: accent || "hsl(var(--muted-foreground))" }} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-medium">{label}</p>
        <p className="text-xl font-bold text-foreground mt-0.5" style={{ fontFamily: "Playfair Display, serif" }}>{value}</p>
        {sub && <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>}
      </div>
      {(href || onClick) && <ChevronRight size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-2" />}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [upcomingFilter, setUpcomingFilter] = useState<number>(30); // 30 days default
  const [selectedDate, setSelectedDate] = useState<string | null>(null); // For the Side Panel
  const { toast } = useToast();
  const [, navigate] = useLocation(); 

  const { data: clients = [] } = useQuery<ClientWithEvents[]>({ queryKey: ["/api/clients"] });
  const { data: venues = [] } = useQuery<Venue[]>({ queryKey: ["/api/venues"] });
  const { data: profile } = useQuery<Record<string, unknown>>({ queryKey: ["/api/profile"] });

  const userName = (profile?.plannerName || profile?.ownerName || profile?.businessName || "there") as string;
  const greeting = getGreeting();

  // ── Mutation for the Side Panel to use ──
  const updateEventMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<BookingEvent> }) =>
      apiRequest("PATCH", `/api/booking-events/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      toast({ title: "Event updated" });
    },
  });

  const allEvents = useMemo(() =>
    clients.flatMap(c => c.events.map(e => ({ ...e, clientName: c.clientName }))),
    [clients]
  );

  // ── Compute eventsByDate so the panel knows what to render ──
  const eventsByDate = useMemo(() => {
    const map: Record<string, Array<{ event: BookingEvent; client: ClientWithEvents }>> = {};
    for (const c of clients) {
      for (const e of c.events) {
        if (!map[e.eventDate]) map[e.eventDate] = [];
        map[e.eventDate].push({ event: e, client: c });
      }
    }
    return map;
  }, [clients]);

  const today = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }, []);

  // ── Updated Upcoming filter to use our state! ──
  const upcoming = useMemo(() =>
    allEvents
      .filter(e => { const days = daysFromNow(e.eventDate); return days >= 0 && days <= upcomingFilter; })
      .sort((a, b) => a.eventDate.localeCompare(b.eventDate))
      .slice(0, 8), // Increased to 8 so the 365d filter shows more data
    [allEvents, upcomingFilter]
  );

  const todayEvents = useMemo(() =>
    allEvents.filter(e => daysFromNow(e.eventDate) === 0),
    [allEvents]
  );

  const stats = useMemo(() => {
    const confirmed = clients.filter(c => c.overallStatus === "confirmed").length;
    const tentative  = clients.filter(c => c.overallStatus === "tentative").length;
    const totalEvents = allEvents.length;
    return { confirmed, tentative, totalEvents };
  }, [clients, allEvents]);

  const recentClients = useMemo(() =>
    [...clients].sort((a, b) => b.id - a.id).slice(0, 4),
    [clients]
  );

  return (
    <div className="flex flex-col h-full relative overflow-hidden">
      {/* Header */}
      <header className="px-6 py-4 border-b border-border bg-card flex items-center justify-between flex-shrink-0">
        <div>
          <h2 className="text-xl font-semibold" style={{ fontFamily: "Playfair Display, serif" }}>Dashboard</h2>
        </div>
        {todayEvents.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium"
            style={{ borderColor: "hsl(210,69%,16%)", color: "hsl(210,69%,16%)", background: "hsl(210,69%,16%,0.06)" }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "hsl(210,69%,16%)" }} />
            {todayEvents.length} event{todayEvents.length !== 1 ? "s" : ""} today
          </div>
        )}
      </header>

      {/* Scrollable body */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-5xl mx-auto space-y-6">

          {/* ── Welcome Banner ── */}
          <div
            onClick={() => {
              if (todayEvents.length > 0) {
                const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
                setSelectedDate(todayStr);
              } else {
                navigate("/app");
              }
            }}
            className="rounded-2xl px-6 py-5 flex items-center justify-between gap-4 cursor-pointer hover:shadow-lg hover:scale-[1.01] transition-all duration-300 group"
            style={{
              background: "linear-gradient(120deg, hsl(210,69%,16%) 0%, hsl(210,55%,24%) 100%)",
            }}
          >
            <div>
              <p className="text-xs font-medium tracking-widest uppercase mb-1" style={{ color: "hsl(38,49%,57%)" }}>
                {today.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </p>
              <h3 className="text-2xl font-bold text-white" style={{ fontFamily: "Playfair Display, serif" }}>
                {greeting}, {userName.split(" ")[0]}.
              </h3>
              <p className="text-sm mt-1" style={{ color: "hsl(210,30%,75%)" }}>
                {todayEvents.length > 0
                  ? `You have ${todayEvents.length} event${todayEvents.length !== 1 ? "s" : ""} scheduled today.`
                  : upcoming.length > 0
                  ? `Next up: ${upcoming[0] ? `${EVENT_LABEL[upcoming[0].eventType] || upcoming[0].eventType} in ${daysFromNow(upcoming[0].eventDate)}d` : "—"}.`
                  : "No events coming up in the next 30 days. Enjoy the calm!"}
              </p>
            </div>
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "hsl(38,49%,57%,0.2)" }}
            >
              <Sparkles size={22} style={{ color: "hsl(38,49%,57%)" }} />
            </div>
          </div>

          {/* ── Stat Cards ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <StatCard
              icon={Users} label="Total Clients" value={clients.length}
              sub={`${stats.confirmed} confirmed · ${stats.tentative} tentative`}
              accent="hsl(210,69%,16%)"
              onClick={() => document.getElementById("clients-section")?.scrollIntoView({ behavior: "smooth" })}
            />
            <StatCard
              icon={CalendarDays} label="Total Events" value={stats.totalEvents}
              sub={`${upcoming.length} in next 30 days`}
              accent="hsl(38,49%,57%)"
              href="/app"
            />
            <StatCard
              icon={Building2} label="Venues" value={venues.length}
              sub="active venues"
              accent="#6b3a7d"
              href="/app/venues"
            />
          </div>

          {/* ── Main two-column grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* Upcoming Events — wider column */}
            <div className="lg:col-span-2 bg-card border border-border rounded-xl overflow-hidden flex flex-col">
              <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock size={14} style={{ color: "hsl(210,69%,16%)" }} />
                  <span className="text-sm font-semibold text-foreground">Upcoming Events</span>
                  {/* 👇 THE NEW FILTER DROPDOWN 👇 */}
                  <select
                    value={upcomingFilter}
                    onChange={(e) => setUpcomingFilter(Number(e.target.value))}
                    className="ml-2 text-[10px] bg-muted/40 border border-border rounded px-1.5 py-0.5 outline-none text-muted-foreground cursor-pointer hover:bg-muted/70 transition-colors"
                  >
                    <option value={30}>Next 30 Days</option>
                    <option value={60}>Next 60 Days</option>
                    <option value={90}>Next 90 Days</option>
                    <option value={365}>Next 1 Year</option>
                  </select>
                </div>
                <Link href="/app">
                  <a className="flex items-center gap-1 text-[11px] font-medium" style={{ color: "hsl(38,49%,57%)" }}>
                    Calendar <ArrowRight size={11} />
                  </a>
                </Link>
              </div>

              {upcoming.length === 0 ? (
                <div className="px-5 py-10 text-center text-sm text-muted-foreground">
                  No events found in this timeframe.
                </div>
              ) : (
                <div className="divide-y divide-border overflow-y-auto">
                  {upcoming.map(ev => {
                    const days = daysFromNow(ev.eventDate);
                    const isToday = days === 0;
                    const isTomorrow = days === 1;
                    return (
                      <div 
                        key={ev.id} 
                        onClick={() => setSelectedDate(ev.eventDate)} // <-- Triggers Side Panel
                        className="px-5 py-3 flex items-center gap-3 hover:bg-muted/50 transition-colors cursor-pointer group"
                      >
                        <div className="w-10 flex-shrink-0 text-center">
                          <p className="text-[10px] text-muted-foreground uppercase">
                            {new Date(ev.eventDate + "T00:00:00").toLocaleDateString("en-IN", { month: "short" })}
                          </p>
                          <p className="text-lg font-bold leading-tight" style={{ fontFamily: "Playfair Display, serif", color: "hsl(210,69%,16%)" }}>
                            {new Date(ev.eventDate + "T00:00:00").getDate()}
                          </p>
                        </div>
                        <div className="w-0.5 h-8 rounded-full flex-shrink-0" style={{ background: STATUS_DOT[ev.status] || "#ccc" }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                            {EVENT_LABEL[ev.eventType] || ev.eventType} — {ev.clientName}
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {parseVenueNames(ev.venueName)}
                            {ev.startTime && ` · ${ev.startTime}`}
                            {ev.guestCount && ` · ${ev.guestCount} guests`}
                          </p>
                        </div>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                          style={{
                            background: isToday ? "hsl(210,69%,16%)" : isTomorrow ? "hsl(38,49%,57%,0.15)" : "hsl(var(--muted))",
                            color: isToday ? "#fff" : isTomorrow ? "hsl(38,40%,40%)" : "hsl(var(--muted-foreground))",
                          }}>
                          {isToday ? "Today" : isTomorrow ? "Tomorrow" : `${days}d`}
                        </span>
                        <ChevronRight size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right column — Client Status + Venues */}
            <div className="space-y-5">

              {/* Client Status breakdown */}
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="px-5 py-3.5 border-b border-border flex items-center gap-2">
                  <TrendingUp size={14} style={{ color: "hsl(210,69%,16%)" }} />
                  <span className="text-sm font-semibold text-foreground">Client Status</span>
                </div>
                <div className="px-5 py-4 space-y-3">
                  {(["confirmed", "tentative", "cancelled"] as const).map(status => {
                    const count = clients.filter(c => c.overallStatus === status).length;
                    const pct = clients.length ? Math.round((count / clients.length) * 100) : 0;
                    return (
                      <div key={status}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs capitalize text-foreground font-medium">{status}</span>
                          <span className="text-xs text-muted-foreground">{count} · {pct}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full transition-all"
                            style={{ width: `${pct}%`, background: STATUS_DOT[status] }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Venues quick list */}
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 size={14} style={{ color: "hsl(210,69%,16%)" }} />
                    <span className="text-sm font-semibold text-foreground">Venues</span>
                  </div>
                  <Link href="/app/venues">
                    <a className="text-[11px] font-medium" style={{ color: "hsl(38,49%,57%)" }}>All <ArrowRight size={10} className="inline" /></a>
                  </Link>
                </div>
                <div className="divide-y divide-border">
                  {venues.slice(0, 4).map(v => (
                    <div key={v.id} onClick={() => navigate(`/app/venues/${v.id}/calendar`)} className="px-5 py-2.5 flex items-start justify-between gap-2 cursor-pointer hover:bg-muted/50 transition-colors group">
                      <div className="flex items-start gap-2 min-w-0">
                        <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform"
                          style={{ background: "hsl(210,69%,16%,0.08)" }}>
                          <Building2 size={11} style={{ color: "hsl(210,69%,16%)" }} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-foreground truncate group-hover:text-primary transition-colors">{v.name}</p>
                          <p className="text-[10px] text-muted-foreground flex items-center gap-1 truncate">
                            <MapPin size={9} /> {v.location}
                          </p>
                        </div>
                      </div>
                      <ChevronRight size={13} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1.5 flex-shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Clients list ── */}
          <div id="clients-section" className="bg-card border border-border rounded-xl overflow-hidden scroll-mt-6">
            <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users size={14} style={{ color: "hsl(210,69%,16%)" }} />
                <span className="text-sm font-semibold text-foreground">Clients</span>
              </div>
              <Link href="/app/bookings">
                <a className="text-[11px] font-medium" style={{ color: "hsl(38,49%,57%)" }}>All <ArrowRight size={10} className="inline" /></a>
              </Link>
            </div>
            <div className="divide-y divide-border">
              {recentClients.map(c => (
                <div key={c.id} onClick={() => navigate("/app/bookings")} className="px-5 py-3 flex items-center gap-3 cursor-pointer hover:bg-muted/40 transition-colors group">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-white text-[11px] font-bold group-hover:scale-110 transition-transform"
                    style={{ background: "hsl(210,69%,16%)" }}>
                    {c.clientName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">{c.clientName}</p>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1 truncate">
                      <Phone size={9} /> {c.contactPhone}
                      <span className="mx-1">·</span>
                      {c.events.length} event{c.events.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 capitalize"
                      style={{
                        background: `${STATUS_DOT[c.overallStatus] || "#ccc"}18`,
                        color: STATUS_DOT[c.overallStatus] || "#888",
                      }}
                    >
                      {c.overallStatus}
                    </span>
                    <ChevronRight size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ── Side Panel Popup ── */}
      {selectedDate && (
        <>
          <div 
            className="absolute inset-0 bg-background/20 backdrop-blur-[1px] z-20" 
            onClick={() => setSelectedDate(null)}
          />
          <DateDetailPanel
            dateStr={selectedDate}
            dayItems={eventsByDate[selectedDate] || []}
            venues={venues}
            onClose={() => setSelectedDate(null)}
            updateEventMutation={updateEventMutation}
          />
        </>
      )}
    </div>
  );
}
