import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import {
  type ClientWithEvents, type Venue, type BookingEvent,
  type InsertClient, type InsertBookingEvent,
  insertClientSchema,
} from "@shared/schema";
import { z } from "zod";
import {
  Plus, X, Search, Trash2, Edit2, ChevronDown, ChevronUp,
  User, Phone, Mail, MapPin, Users, Calendar, Building2,
  FileText, Clock, CheckCircle2, AlertCircle, XCircle,
  Palette, Tag, TriangleAlert, ShieldAlert
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useHinduCalendar } from "@/hooks/useHinduCalendar";
import {
  EVENT_LABELS, EVENT_COLORS, STATUS_COLORS, CATEGORIES, COLOR_PALETTE, eventDisplayColor,
} from "@/pages/CalendarPage";
import { useLocation, Link } from "wouter";

// ─── Local helpers ────────────────────────────────────────────────────────────
const EVENT_TYPES = ["wedding", "engagement", "reception", "mehendi", "sangeet"] as const;

const STATUS_BG: Record<string, string> = {
  confirmed: "hsla(210,69%,16%,0.1)", tentative: "hsla(200,55%,40%,0.1)", cancelled: "hsla(0,55%,50%,0.08)",
};

function fmtDate(d: string) {
  return new Date(d + "T12:00:00").toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}
function emptyEvent(defaultDate: string = ""): Partial<InsertBookingEvent> {
  return { eventType: "wedding", eventDate: defaultDate, venueName: "", guestCount: undefined, startTime: "", endTime: "", status: "confirmed", notes: "", color: undefined, category: "wedding" };
}

function StatusIcon({ status }: { status: string }) {
  if (status === "confirmed") return <CheckCircle2 size={13} style={{ color: STATUS_COLORS.confirmed }} />;
  if (status === "tentative") return <AlertCircle size={13} style={{ color: STATUS_COLORS.tentative }} />;
  return <XCircle size={13} style={{ color: STATUS_COLORS.cancelled }} />;
}

// ─── Inline color picker ──────────────────────────────────────────────────────
// function ColorPicker({ value, onChange }: { value?: string | null; onChange: (c: string | null) => void }) {
//   return (
//     <div>
//       <label className="text-xs font-medium text-muted-foreground block mb-1.5 flex items-center gap-1">
//         <Palette size={11} /> Event Colour
//         <span className="text-[10px] opacity-60">(overrides default)</span>
//       </label>
//       <div className="flex flex-wrap gap-1.5 items-center">
//         {COLOR_PALETTE.map(hex => (
//           <button
//             key={hex}
//             type="button"
//             title={hex}
//             onClick={() => onChange(value === hex ? null : hex)}
//             className="w-5 h-5 rounded-full border-2 transition-all hover:scale-110 flex-shrink-0"
//             style={{
//               background: hex,
//               borderColor: value === hex ? "#fff" : "transparent",
//               boxShadow: value === hex ? `0 0 0 2px ${hex}` : "none",
//             }}
//           />
//         ))}
//         {value && (
//           <button
//             type="button"
//             onClick={() => onChange(null)}
//             className="text-[10px] text-muted-foreground px-1.5 py-0.5 rounded border border-border hover:bg-muted transition-colors"
//           >Reset</button>
//         )}
//       </div>
//       {value && (
//         <div className="flex items-center gap-1.5 mt-1">
//           <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: value }} />
//           <span className="text-[10px] text-muted-foreground font-mono">{value}</span>
//           <span className="text-[10px] text-muted-foreground">· will appear on calendar</span>
//         </div>
//       )}
//     </div>
//   );
// }

// ─── Main Component ──────────────────────────────────────────────────────────
export default function BookingsPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientWithEvents | null>(null);
  const [showSupportWarning, setShowSupportWarning] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{isOpen: boolean, clientId: number | null}>({ isOpen: false, clientId: null });
  const [enteredPin, setEnteredPin] = useState("");

  const [eventDeleteDialog, setEventDeleteDialog] = useState<{isOpen: boolean, index: number, eventId?: number}>({ isOpen: false, index: -1 });
  const [enteredEventPin, setEnteredEventPin] = useState("");
  const [isDeletingEvent, setIsDeletingEvent] = useState(false);
  

  const {isAuspicious } = useHinduCalendar();



  const [location] = useLocation();

  
  // ── Auto-Open Form from Session Storage ──
  useEffect(() => {
    if (sessionStorage.getItem("openNewBooking") === "true") {
      setShowForm(true);
      // Clean up so it doesn't stay stuck open if they refresh the page later
      sessionStorage.removeItem("openNewBooking");
    }
  }, [location]);

  const { data: clients = [], isLoading } = useQuery<ClientWithEvents[]>({ queryKey: ["/api/clients"] });
  const { data: venues = [] } = useQuery<Venue[]>({ queryKey: ["/api/venues"] });
  const { data: authData } = useQuery<{ user: any, organization: any, isImpersonating?: boolean }>({ queryKey: ["/api/auth/me"] });
  const isImpersonating = authData?.isImpersonating;

  const org = authData?.organization;




  // ── Secure Mutations ──
  const deleteMutation = useMutation({
    mutationFn: async (data: { id: number, pin: string }) => {
      const res = await fetch(`/api/clients/${data.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: data.pin })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete booking.");
      }
    },
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] }); 
      toast({ title: "Deleted", description: "Client and all events securely removed." }); 
      setDeleteDialog({ isOpen: false, clientId: null });
      setEnteredPin("");
    },
    onError: (err: any) => {
      toast({ title: "Access Denied", description: err.message, variant: "destructive" });
    }
  });

  // ── Filter ──
  // ── Filter ──
  const filtered = useMemo(() => {
    // 1. Clean the input: trim edges and compress double spaces to handle messy typing
    const q = search.toLowerCase().trim().replace(/\s+/g, ' '); 
    
    // 2. Setup Natural Language baselines (Local Timezone Safe)
    const getLocalIso = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    };

    const today = new Date();
    const todayIso = getLocalIso(today);
    
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
    const tomorrowIso = getLocalIso(tomorrow);
    
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    const yesterdayIso = getLocalIso(yesterday);

    return clients.filter(c => {
      // Base Status & Category Checks
      const matchStatus = filterStatus === "all" || c.overallStatus === filterStatus;
      const matchCategory = filterCategory === "all" || c.events.some(e => (e.category || "wedding") === filterCategory);

      // If search is empty, just return the filters
      if (!q) return matchStatus && matchCategory;

      // 3. Text Fields Check
      const matchText =
        c.clientName.toLowerCase().includes(q) ||
        (c.brideName || "").toLowerCase().includes(q) ||
        (c.groomName || "").toLowerCase().includes(q) ||
        c.contactPhone.includes(q) ||
        c.contactEmail.toLowerCase().includes(q);

      let matchVenue = false;
      let matchDate = false;

      for (const e of c.events) {
        // 4. Venue Check
        try {
          const p = JSON.parse(e.venueName);
          if (Array.isArray(p) && p.some((v: string) => v.toLowerCase().includes(q))) matchVenue = true;
        } catch {
          if (e.venueName.toLowerCase().includes(q)) matchVenue = true;
        }

        // 5. Omni-Format Date Check
        if (e.eventDate) {
          const [y, m, d] = e.eventDate.split('-');
          const sy = y.slice(2); // Short year: 26
          const sm = parseInt(m, 10).toString(); // Short month: 5
          const sd = parseInt(d, 10).toString(); // Short day: 14

          const dateObj = new Date(e.eventDate + "T12:00:00");
          const monthLong = dateObj.toLocaleDateString('en-US', { month: 'long' }).toLowerCase(); // may
          const monthShort = dateObj.toLocaleDateString('en-US', { month: 'short' }).toLowerCase(); // may

          // Generate every conceivable format combination!
          const tags = [
            e.eventDate, y, m, d, sm, sd,
            `${d}/${m}/${y}`, `${sd}/${sm}/${y}`, `${d}/${m}/${sy}`, `${sd}/${sm}/${sy}`, // UK/IN Slash
            `${m}/${d}/${y}`, `${sm}/${sd}/${y}`, `${m}/${d}/${sy}`, `${sm}/${sd}/${sy}`, // US Slash
            `${d}-${m}-${y}`, `${sd}-${sm}-${y}`, `${d}-${m}-${sy}`, `${sd}-${sm}-${sy}`, // Dash
            `${d}.${m}.${y}`, `${sd}.${sm}.${y}`, `${d}.${m}.${sy}`, `${sd}.${sm}.${sy}`, // Dots
            `${d} ${m} ${y}`, `${sd} ${sm} ${y}`, `${d} ${m} ${sy}`, `${sd} ${sm} ${sy}`, // Spaces
            `${d}/${m}`, `${sd}/${sm}`, `${sm}/${sd}`, `${m}/${d}`, // Partial day/month
            `${monthLong} ${sd}`, `${sd} ${monthLong}`, `${monthLong} ${d}`, // "may 14", "14 may"
            `${monthShort} ${sd}`, `${sd} ${monthShort}`, `${monthShort} ${d}`, // "may 14"
            `${monthLong} ${y}`, `${monthShort} ${y}`, // "may 2026"
            `${m}/${y}`, `${sm}/${y}`, `${sm}/${sy}`, // "05/2026", "5/26"
            e.eventDate === todayIso ? "today" : "",
            e.eventDate === tomorrowIso ? "tomorrow" : "",
            e.eventDate === yesterdayIso ? "yesterday" : ""
          ];

          // If the typed query exists inside ANY of those tags, it's a perfect match
          if (tags.some(tag => tag && tag.includes(q))) {
            matchDate = true;
          }
        }
      }

      return (matchText || matchVenue || matchDate) && matchStatus && matchCategory;
    });
  }, [clients, search, filterStatus, filterCategory]);

  // ── Stats ──
  const totalEvents = clients.reduce((s, c) => s + c.events.length, 0);
  const confirmedCount = clients.filter(c => c.overallStatus === "confirmed").length;

  if (showForm || editingClient) {
    return (
      <BookingForm
        client={editingClient}
        venues={venues}
        allClients={clients}
        onClose={() => { setShowForm(false); setEditingClient(null); }}
        onSaved={() => {
          queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
          queryClient.invalidateQueries({ queryKey: ["/api/booking-events"] });
          setShowForm(false);
          setEditingClient(null);
        }}
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="px-6 py-4 border-b border-border bg-card flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold" style={{ fontFamily: "Playfair Display, serif" }}>Bookings</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {clients.length} client{clients.length !== 1 ? "s" : ""} · {totalEvents} event{totalEvents !== 1 ? "s" : ""} · {confirmedCount} confirmed
          </p>
        </div>
        <Button data-testid="button-new-booking" onClick={() => setShowForm(true)} size="sm">
          <Plus size={14} className="mr-1" /> New Booking
        </Button>
      </header>

      {/* Filters */}
      {/* Filters */}
      <div className="px-6 py-3 border-b border-border bg-card space-y-2">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search clients, dates, venues…"
              className="pl-8 pr-8 h-8 text-sm"
            />
            {search && (
              <button 
                onClick={() => setSearch("")} 
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
              >
                <X size={12} />
              </button>
            )}
          </div>
          {/* Status filter */}
          <div className="flex gap-1">
            {["all", "confirmed", "tentative", "cancelled"].map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className="text-xs px-3 py-1 rounded-full border transition-colors"
                style={{
                  borderColor: s === "all" ? "hsl(var(--border))" : STATUS_COLORS[s] || "hsl(var(--border))",
                  background: filterStatus === s ? (s === "all" ? "hsl(var(--foreground))" : STATUS_COLORS[s]) : "transparent",
                  color: filterStatus === s ? "#fff" : s === "all" ? "hsl(var(--muted-foreground))" : STATUS_COLORS[s],
                }}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
        {/* Category filter */}
        <div className="flex items-center gap-2">
          <Tag size={12} className="text-muted-foreground flex-shrink-0" />
          <span className="text-xs text-muted-foreground">Category:</span>
          <div className="flex gap-1 flex-wrap">
            <button
              onClick={() => setFilterCategory("all")}
              className="text-xs px-2.5 py-0.5 rounded-full border transition-colors"
              style={{
                borderColor: filterCategory === "all" ? "hsl(var(--foreground))" : "hsl(var(--border))",
                background: filterCategory === "all" ? "hsl(var(--foreground))" : "transparent",
                color: filterCategory === "all" ? "hsl(var(--background))" : "hsl(var(--muted-foreground))",
              }}
            >All</button>
            {Object.entries(CATEGORIES).map(([key, { label, color }]) => (
              <button
                key={key}
                onClick={() => setFilterCategory(filterCategory === key ? "all" : key)}
                className="text-xs px-2.5 py-0.5 rounded-full border transition-colors"
                style={{
                  borderColor: color,
                  background: filterCategory === key ? color : "transparent",
                  color: filterCategory === key ? "#fff" : color,
                }}
              >{label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* List */}
        <div className="flex-1 overflow-auto p-6">
          {isLoading ? (
            <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <BookOpen size={40} className="mb-3 opacity-30" />
              <p className="text-sm font-medium">{search || filterStatus !== "all" || filterCategory !== "all" ? "No results found" : "No bookings yet"}</p>
              <p className="text-xs opacity-70 mt-1">Click "New Booking" to create your first client booking</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(client => (
                <ClientCard
                  key={client.id}
                  client={client}
                  venues={venues}
                  expanded={expanded === client.id}
                  onToggle={() => setExpanded(expanded === client.id ? null : client.id)}
                  onEdit={() => setEditingClient(client)}
                  onDelete={() => {
                    if (org && !org.isDeletePinEnabled) {
                      if (confirm(`Are you sure you want to delete ${client.clientName}?`)) {
                        deleteMutation.mutate({ id: client.id, pin: "bypass" });
                      }
                    } else {
                      setDeleteDialog({ isOpen: true, clientId: client.id });
                    }
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {deleteDialog.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-card border border-destructive rounded-xl p-6 max-w-sm w-full shadow-2xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                  <ShieldAlert size={20} className="text-destructive" />
                </div>
                <h3 className="text-lg font-bold text-destructive" style={{ fontFamily: "Playfair Display, serif" }}>
                  Security Authorization
                </h3>
              </div>
              
              <p className="text-sm text-muted-foreground">
                Deleting this client will permanently erase all their associated events. Please enter your 6-digit PIN to authorize.
              </p>

              <Input 
                type="password"
                maxLength={6}
                placeholder="••••••"
                value={enteredPin}
                onChange={(e) => setEnteredPin(e.target.value.replace(/\D/g, ''))}
                className="text-center tracking-[0.5em] font-mono text-lg"
              />

              <div className="flex justify-end gap-3 pt-2">
                <Button 
                  variant="outline" 
                  onClick={() => { setDeleteDialog({ isOpen: false, clientId: null }); setEnteredPin(""); }}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => deleteMutation.mutate({ id: deleteDialog.clientId!, pin: enteredPin })}
                  disabled={enteredPin.length !== 6 || deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? "Verifying..." : "Authorize Deletion"}
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  }

// ─── Client Card ─────────────────────────────────────────────────────────────
function ClientCard({ client, venues, expanded, onToggle, onEdit, onDelete }: {
  client: ClientWithEvents;
  venues: Venue[];
  expanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  // venue name → id lookup

  const {isAuspicious } = useHinduCalendar();
  const venueIdMap = useMemo(() => {
    const m: Record<string, number> = {};
    for (const v of venues) m[v.name.trim().toLowerCase()] = v.id;
    return m;
  }, [venues]);
  const nextEvent = client.events
    .filter(e => e.status !== "cancelled" && e.eventDate >= new Date().toISOString().slice(0, 10))
    .sort((a, b) => a.eventDate.localeCompare(b.eventDate))[0];

  // Dominant category for this client
  const categories = [...new Set(client.events.map(e => e.category || "wedding"))];

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
      {/* Colour bar — first event's display color */}
      {client.events.length > 0 && (
        <div className="h-0.5 w-full" style={{ background: eventDisplayColor(client.events[0]) }} />
      )}
      {/* Top row */}
      <div className="p-4 flex items-start gap-4">
        {/* Avatar initials */}
        <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-bold"
          style={{ background: STATUS_COLORS[client.overallStatus] || STATUS_COLORS.confirmed }}>
          {client.clientName.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <h4 className="font-semibold text-base" style={{ fontFamily: "Playfair Display, serif" }}>
                {client.clientName}
              </h4>
              {(client.brideName || client.groomName) && (
                <p className="text-xs text-muted-foreground">
                  {[client.brideName, client.groomName].filter(Boolean).join(" & ")}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium text-white"
                style={{ background: STATUS_COLORS[client.overallStatus] }}>
                {client.overallStatus}
              </span>
              {/* Category badges */}
              {categories.map(cat => (
                <span key={cat} className="text-[10px] px-2 py-0.5 rounded-full border font-medium"
                  style={{ borderColor: CATEGORIES[cat]?.color, color: CATEGORIES[cat]?.color }}>
                  {CATEGORIES[cat]?.label || cat}
                </span>
              ))}
              <span className="text-[10px] px-2 py-0.5 rounded-full border border-border text-muted-foreground">
                {client.events.length} event{client.events.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Phone size={11} />{client.contactPhone}</span>
            <span className="flex items-center gap-1"><Mail size={11} />{client.contactEmail}</span>
          </div>

          {nextEvent && (
            <div className="mt-1.5 text-xs flex items-center gap-1 text-muted-foreground">
              <Calendar size={10} />
              <span>Next: <span className="font-medium text-foreground">{EVENT_LABELS[nextEvent.eventType]}</span> · {fmtDate(nextEvent.eventDate)} @ {(()=>{ try{const p=JSON.parse(nextEvent.venueName);return Array.isArray(p)?p.join(", "):nextEvent.venueName;}catch{return nextEvent.venueName;}})()}</span>
              {isAuspicious(nextEvent.eventDate) && <span className="text-green-700 font-medium ml-1">✓ Shubh</span>}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={onEdit} className="p-1.5 rounded hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground" title="Edit">
            <Edit2 size={14} />
          </button>
          <button onClick={onDelete} className="p-1.5 rounded hover:bg-secondary transition-colors text-muted-foreground hover:text-destructive" title="Delete">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Events toggle */}
      {client.events.length > 0 && (
        <>
          <button
            onClick={onToggle}
            className="w-full flex items-center justify-between px-4 py-2 border-t border-border bg-muted/30 hover:bg-muted/50 transition-colors text-xs text-muted-foreground font-medium"
          >
            <span className="flex items-center gap-2 flex-wrap">
              {client.events.map(e => (
                <span key={e.id} className="flex items-center gap-1 px-1.5 py-0.5 rounded text-white text-[10px]"
                  style={{ background: eventDisplayColor(e) }}>
                  {EVENT_LABELS[e.eventType]} · {fmtDate(e.eventDate)}
                </span>
              ))}
            </span>
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {expanded && (
            <div className="border-t border-border divide-y divide-border">
              {client.events.sort((a, b) => a.eventDate.localeCompare(b.eventDate)).map(ev => (
                <div key={ev.id} className="px-4 py-3 flex items-start gap-3">
                  <div className="w-1.5 self-stretch rounded-full flex-shrink-0 mt-0.5"
                    style={{ background: eventDisplayColor(ev) }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium">{EVENT_LABELS[ev.eventType]}</span>
                      <StatusIcon status={ev.status} />
                      <span className="text-xs text-muted-foreground" style={{ color: STATUS_COLORS[ev.status] }}>{ev.status}</span>
                      {ev.category && ev.category !== "wedding" && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded border font-medium"
                          style={{ borderColor: CATEGORIES[ev.category]?.color, color: CATEGORIES[ev.category]?.color }}>
                          {CATEGORIES[ev.category]?.label}
                        </span>
                      )}
                      {ev.color && (
                        <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                          <Palette size={9} />
                          <span className="w-2.5 h-2.5 rounded-full" style={{ background: ev.color }} />
                        </span>
                      )}
                      {isAuspicious(ev.eventDate) && (
                        <span className="text-[10px] text-green-700 font-semibold bg-green-50 px-1.5 py-0.5 rounded">Shubh Muhurat</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar size={10} />{fmtDate(ev.eventDate)}</span>
                      {(ev.startTime || ev.endTime) && (
                        <span className="flex items-center gap-1"><Clock size={10} />{ev.startTime}{ev.endTime ? ` – ${ev.endTime}` : ""}</span>
                      )}
                      <span className="flex items-center gap-1">
                        <Building2 size={10} />
                        {(() => { try { const p = JSON.parse(ev.venueName); return Array.isArray(p) ? p.join(", ") : ev.venueName; } catch { return ev.venueName; } })()}
                      </span>
                      {(() => {
                        let names: string[] = [];
                        try { const p = JSON.parse(ev.venueName); names = Array.isArray(p) ? p : [ev.venueName]; }
                        catch { names = [ev.venueName]; }
                        return names.map(vn => venueIdMap[vn.trim().toLowerCase()] ? (
                          <Link key={vn} href={`/app/venues/${venueIdMap[vn.trim().toLowerCase()]}/calendar?date=${ev.eventDate}`}>
                          <a className="flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded border transition-colors hover:bg-muted/60"
                            style={{ borderColor: "hsl(210,69%,16%)", color: "hsl(210,69%,16%)" }}
                            title={`Open calendar for ${vn}`}>
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                              <line x1="16" y1="2" x2="16" y2="6" />
                              <line x1="8" y1="2" x2="8" y2="6" />
                              <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                            {names.length > 1 ? vn : "Venue Calendar"}
                          </a>
                        </Link>
                        ) : null);
                      })()}
                      {ev.guestCount && <span className="flex items-center gap-1"><Users size={10} />{ev.guestCount} guests</span>}
                    </div>
                    {ev.notes && <p className="text-[11px] text-muted-foreground mt-0.5 italic">{ev.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {client.events.length === 0 && (
        <div className="px-4 py-2 border-t border-border bg-muted/20 text-xs text-muted-foreground">No events added yet</div>
      )}
    </div>
  );
}

// ─── Conflict helpers ────────────────────────────────────────────────────────
function parseVenueNames(raw: string): string[] {
  try { const p = JSON.parse(raw); if (Array.isArray(p)) return p; } catch {}
  return raw ? [raw] : [];
}

type ConflictEntry = { date: string; venue: string; existingClient: string; existingEvent: string; status: string; };

function detectConflicts(
  newEvents: Array<Partial<InsertBookingEvent>>,
  allClients: ClientWithEvents[],
  editingClientId: number | undefined,
): ConflictEntry[] {
  const conflicts: ConflictEntry[] = [];
  for (const ev of newEvents) {
    if (!ev.eventDate || !ev.venueName) continue;
    const newVenues = parseVenueNames(ev.venueName);
    for (const client of allClients) {
      if (client.id === editingClientId) continue; // skip self when editing
      for (const existing of client.events) {
        if (existing.status === "cancelled") continue;
        if (existing.eventDate !== ev.eventDate) continue;
        const existingVenues = parseVenueNames(existing.venueName);
        const sharedVenues = newVenues.filter(v => existingVenues.includes(v));
        for (const venue of sharedVenues) {
          conflicts.push({
            date: ev.eventDate,
            venue,
            existingClient: client.clientName,
            existingEvent: existing.eventType,
            status: existing.status,
          });
        }
      }
    }
  }
  return conflicts;
}

// ─── Conflict Dialog ──────────────────────────────────────────────────────────
function ConflictDialog({
  conflicts, onProceed, onCancel,
}: {
  conflicts: ConflictEntry[];
  onProceed: () => void;
  onCancel: () => void;
}) {
  function fmtDate(d: string) {
    return new Date(d + "T12:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(15,42,68,0.45)" }}>
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden border border-border">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border" style={{ background: "hsla(38,49%,57%,0.1)" }}>
          <span className="flex items-center justify-center w-9 h-9 rounded-full" style={{ background: "hsla(38,49%,57%,0.2)" }}>
            <TriangleAlert size={18} style={{ color: "hsl(38,49%,40%)" }} />
          </span>
          <div>
            <p className="font-semibold text-sm" style={{ fontFamily: "Playfair Display, serif", color: "hsl(210,69%,16%)" }}>Venue Already Booked</p>
            <p className="text-xs text-muted-foreground mt-0.5">{conflicts.length} conflict{conflicts.length > 1 ? "s" : ""} detected</p>
          </div>
        </div>
        {/* Body */}
        <div className="px-6 py-4 space-y-3 max-h-64 overflow-y-auto">
          <p className="text-sm text-muted-foreground">The following venue{conflicts.length > 1 ? "s are" : " is"} already booked on the selected date{conflicts.length > 1 ? "s" : ""}:</p>
          {conflicts.map((c, i) => (
            <div key={i} className="flex items-start gap-3 rounded-lg px-3 py-2.5 border border-border" style={{ background: "hsla(210,69%,16%,0.04)" }}>
              <Building2 size={14} className="mt-0.5 shrink-0" style={{ color: "hsl(38,49%,57%)" }} />
              <div className="text-xs leading-relaxed">
                <p className="font-medium" style={{ color: "hsl(210,69%,16%)" }}>{c.venue}</p>
                <p className="text-muted-foreground">{fmtDate(c.date)} · {c.existingEvent} · {c.existingClient}</p>
                <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium"
                  style={{ background: c.status === "confirmed" ? "hsla(210,69%,16%,0.12)" : "hsla(200,55%,40%,0.12)",
                    color: c.status === "confirmed" ? "hsl(210,69%,20%)" : "hsl(200,55%,30%)" }}>
                  {c.status}
                </span>
              </div>
            </div>
          ))}
          <p className="text-xs text-muted-foreground pt-1">You can still proceed if you'd like to double-book the venue.</p>
        </div>
        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border">
          <Button variant="outline" size="sm" onClick={onCancel}>Go Back</Button>
          <Button size="sm" onClick={onProceed} style={{ background: "hsl(210,69%,16%)", color: "hsl(38,49%,57%)" }}>
            Proceed Anyway
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Booking Form (Create / Edit) ────────────────────────────────────────────
function BookingForm({
  client, venues, allClients, onClose, onSaved,
}: {
  client: ClientWithEvents | null;
  venues: Venue[];
  allClients: ClientWithEvents[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const { toast } = useToast();
  const isEdit = !!client;
  const {isAuspicious } = useHinduCalendar();

  const [clientName, setClientName] = useState(client?.clientName || "");
  const [brideName, setBrideName] = useState(client?.brideName || "");
  const [groomName, setGroomName] = useState(client?.groomName || "");
  const [phone, setPhone] = useState(client?.contactPhone || "");
  const [email, setEmail] = useState(client?.contactEmail || "");
  const [altPhone, setAltPhone] = useState(client?.alternatePhone || "");
  const [address, setAddress] = useState(client?.address || "");
  const [overallStatus, setOverallStatus] = useState(client?.overallStatus || "confirmed");
  const [clientNotes, setClientNotes] = useState(client?.notes || "");


  const [eventDeleteDialog, setEventDeleteDialog] = useState<{isOpen: boolean, index: number, eventId?: number}>({ isOpen: false, index: -1 });
  const [enteredEventPin, setEnteredEventPin] = useState("");
  const [isDeletingEvent, setIsDeletingEvent] = useState(false);
  const [showCapacityWarning, setShowCapacityWarning] = useState(false);

  const { data: authData } = useQuery<{ user: any, organization: any, isImpersonating?: boolean }>({ 
    queryKey: ["/api/auth/me"] 
  });
  const isImpersonating = authData?.isImpersonating;

  // Grab the date from the URL (if it exists)
  // Grab the date from storage (if it exists)
  const prefillDate = sessionStorage.getItem("prefillBookingDate") || "";
  
  // Clean it up immediately so it doesn't accidentally pre-fill future manual bookings
  if (prefillDate) sessionStorage.removeItem("prefillBookingDate");

  const [events, setEvents] = useState<Array<Partial<InsertBookingEvent>>>(
    client?.events && client.events.length > 0
      ? client.events.map(e => ({ ...e }))
      : [emptyEvent(prefillDate)] 
  );
  const [venueMode, setVenueMode] = useState<Record<number, "select" | "manual">>({});
  const [saving, setSaving] = useState(false);
  const [conflictDialog, setConflictDialog] = useState<ConflictEntry[] | null>(null);

  function addEvent() { setEvents(prev => [...prev, emptyEvent()]); }
  function removeEvent(i: number) { setEvents(prev => prev.filter((_, idx) => idx !== i)); }
  function handleRemoveEventClick(i: number, ev: any) {
    if (ev.id) {
      if (org && !org.isDeletePinEnabled) {
        if (confirm("Delete this event?")) {
          setEventDeleteDialog({ isOpen: false, index: i, eventId: ev.id });
          setEnteredEventPin("bypass");
          // Trigger the confirm function manually
          setTimeout(confirmEventDelete, 100); 
        }
      } else {
        setEventDeleteDialog({ isOpen: true, index: i, eventId: ev.id });
      }
    } else {
      removeEvent(i);
    }
  }

  async function confirmEventDelete() {
    if (!eventDeleteDialog.eventId || enteredEventPin.length !== 6) return;
    setIsDeletingEvent(true);
    try {
      const res = await fetch(`/api/booking-events/${eventDeleteDialog.eventId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: enteredEventPin })
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete event.");
      }
      
      toast({ title: "Event deleted", description: "Event permanently removed from the database." });
      removeEvent(eventDeleteDialog.index); // Remove from UI
      setEventDeleteDialog({ isOpen: false, index: -1 });
      setEnteredEventPin("");
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] }); 
    } catch (e: any) {
      toast({ title: "Access Denied", description: e.message, variant: "destructive" });
    } finally {
      setIsDeletingEvent(false);
    }
  }


  function updateEvent(i: number, field: string, value: string | number | undefined | null) {
    setEvents(prev => prev.map((e, idx) => idx === i ? { ...e, [field]: value } : e));
  }

  // Change the function definition to accept arguments
  async function performSave(finalPhone: string, finalAltPhone: string) {
    const validEvents = events.filter(e => e.eventDate && e.venueName && e.venueName !== "[]" && e.eventType);
    setSaving(true);
    try {
      const clientPayload: InsertClient = {
        clientName: clientName.trim(),
        brideName: brideName.trim() || undefined,
        groomName: groomName.trim() || undefined,
        contactPhone: finalPhone,         // <--- USE CLEANED PHONE
        contactEmail: email.trim(),
        alternatePhone: finalAltPhone || undefined, // <--- USE CLEANED ALT PHONE
        address: address.trim() || undefined,
        overallStatus,
        notes: clientNotes.trim() || undefined,
      };
      // ... rest of the performSave function remains exactly the same
      let clientId: number;
      if (isEdit && client) {
        const res = await apiRequest("PATCH", `/api/clients/${client.id}`, clientPayload);
        const updated = await res.json();
        clientId = updated.id;
      } else {
        const res = await apiRequest("POST", "/api/clients", clientPayload);
        const created = await res.json();
        clientId = created.id;
      }

      for (const ev of validEvents) {
        const payload = {
          clientId,
          eventType: ev.eventType || "wedding",
          eventDate: ev.eventDate,
          venueName: ev.venueName,
          guestCount: ev.guestCount || undefined,
          startTime: ev.startTime || undefined,
          endTime: ev.endTime || undefined,
          status: ev.status || "confirmed",
          notes: ev.notes || undefined,
          color: ev.color || undefined,
          category: ev.category || "wedding",
        };

        if ((ev as any).id) {
          // If it has an ID, it already exists. We PATCH it!
          await apiRequest("PATCH", `/api/booking-events/${(ev as any).id}`, payload);
        } else {
          // If it has no ID, it's a new row. We POST it!
          await apiRequest("POST", "/api/booking-events", payload);
        }
      }

      toast({ title: isEdit ? "Booking updated" : "Booking created", description: `${clientName} · ${validEvents.length} event${validEvents.length !== 1 ? "s" : ""}` });
      onSaved();
    } catch (err) {
      toast({ title: "Error saving", description: "Please try again", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  function handleSave() {
    if (!clientName.trim()) { toast({ title: "Client name is required", variant: "destructive" }); return; }
    
    // ─── PHONE VALIDATION (Option 1) ───
    if (!phone.trim()) { toast({ title: "Phone is required", variant: "destructive" }); return; }
    const cleanedPhone = phone.replace(/\D/g, "").slice(-10);
    if (cleanedPhone.length !== 10) {
      toast({ title: "Invalid Phone", description: "Please enter a valid 10-digit primary phone number.", variant: "destructive" });
      return;
    }

    let cleanedAltPhone = "";
    if (altPhone.trim()) {
      cleanedAltPhone = altPhone.replace(/\D/g, "").slice(-10);
      if (cleanedAltPhone.length !== 10) {
        toast({ title: "Invalid Alternate Phone", description: "Please enter a valid 10-digit alternate phone number.", variant: "destructive" });
        return;
      }
    }
    // ───────────────────────────────────

    if (!email.trim()) { toast({ title: "Email is required", variant: "destructive" }); return; }
    const validEvents = events.filter(e => e.eventDate && e.venueName && e.venueName !== "[]" && e.eventType);
    if (validEvents.length === 0) { toast({ title: "Add at least one event with a date and venue", variant: "destructive" }); return; }

    if (isImpersonating) {
      const proceed = window.confirm(
        "⚠️ SUPPORT MODE WARNING\n\nYou are currently viewing a client's live workspace. Saving this will permanently alter their data.\n\nAre you sure you want to proceed?"
      );
      if (!proceed) return; // Stop the save if they click Cancel
    }
    // ────────────────────────────

    // ─── DOMAIN B1: VENUE CAPACITY INTERCEPTION ───
    const overCapacityEvents = validEvents.filter(ev => {
      if (!ev.guestCount || !ev.venueName) return false;
      
      // Parse the venues for this specific event
      let names: string[] = [];
      try { const p = JSON.parse(ev.venueName); names = Array.isArray(p) ? p : [ev.venueName]; }
      catch { names = [ev.venueName]; }
      
      // Compare guest count against total capacity
      const evVenues = venues.filter(v => names.includes(v.name));
      const totalCap = evVenues.reduce((sum, v) => sum + (v.capacity || 0), 0);
      
      return totalCap > 0 && ev.guestCount > totalCap;
    });

    if (overCapacityEvents.length > 0) {
      setShowCapacityWarning(true); // 🔥 Opens our custom modal instead of an alert!
      return; // Stops the save process
    }
    // ──────────────────────────────────────────────

    const conflicts = detectConflicts(validEvents, allClients, client?.id);
    if (conflicts.length > 0) {
      setConflictDialog(conflicts);
      return;
    }
    
    performSave(cleanedPhone, cleanedAltPhone);
    
  }

  return (
    <div className="flex flex-col h-full">
      <header className="px-6 py-4 border-b border-border bg-card flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold" style={{ fontFamily: "Playfair Display, serif" }}>
            {isEdit ? "Edit Booking" : "New Booking"}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">Fill in client details and add all their events</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onClose} size="sm"><X size={14} className="mr-1" /> Cancel</Button>
          <Button onClick={handleSave} size="sm" disabled={saving}>
            {saving ? "Saving…" : isEdit ? "Update Booking" : "Save Booking"}
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto p-6 space-y-6">

          {/* ── CLIENT DETAILS ── */}
          <section className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-border bg-muted/30 flex items-center gap-2">
              <User size={14} className="text-muted-foreground" />
              <h3 className="text-sm font-semibold">Client Details</h3>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">Family / Client Name *</label>
                  <Input value={clientName} onChange={e => setClientName(e.target.value)} placeholder="e.g. Sharma Family" data-testid="input-clientName" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">Overall Status</label>
                  <div className="flex gap-1.5">
                    {["confirmed", "tentative", "cancelled"].map(s => (
                      <button key={s} type="button" onClick={() => setOverallStatus(s)}
                        className="flex-1 text-xs py-1.5 rounded border transition-colors font-medium"
                        style={{
                          borderColor: STATUS_COLORS[s],
                          background: overallStatus === s ? STATUS_COLORS[s] : "transparent",
                          color: overallStatus === s ? "#fff" : STATUS_COLORS[s],
                        }}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">Bride's Name</label>
                  <Input value={brideName} onChange={e => setBrideName(e.target.value)} placeholder="e.g. Priya Sharma" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">Groom's Name</label>
                  <Input value={groomName} onChange={e => setGroomName(e.target.value)} placeholder="e.g. Rahul Verma" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">Phone *</label>
                  <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 98765 43210" data-testid="input-phone" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">Alternate Phone</label>
                  <Input value={altPhone} onChange={e => setAltPhone(e.target.value)} placeholder="+91 97..." />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">Email *</label>
                  <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" data-testid="input-email" type="email" />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Address</label>
                <Input value={address} onChange={e => setAddress(e.target.value)} placeholder="City, State" />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Notes</label>
                <Textarea value={clientNotes} onChange={e => setClientNotes(e.target.value)} rows={2} placeholder="Special requests, dietary requirements, etc." />
              </div>
            </div>
          </section>

          {/* ── EVENTS ── */}
          <section className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-muted-foreground" />
                <h3 className="text-sm font-semibold">Events</h3>
                <span className="text-xs text-muted-foreground">({events.length})</span>
              </div>
              <Button type="button" size="sm" variant="outline" onClick={addEvent}>
                <Plus size={12} className="mr-1" /> Add Event
              </Button>
            </div>

            <div className="divide-y divide-border">
              {events.map((ev, i) => (
                <EventRow
                  key={i}
                  index={i}
                  event={ev}
                  venues={venues}
                    venueMode={venueMode[i] || (venues.length > 0 ? "select" : "manual")}
                  onVenueMode={(mode) => setVenueMode(prev => ({ ...prev, [i]: mode }))}
                  onChange={(field, val) => updateEvent(i, field, val)}
                  onRemove={events.length > 1 ? () => handleRemoveEventClick(i, ev) : undefined}
                />
              ))}
            </div>
          </section>

        </div>
      </div>

      {/* Venue Conflict Warning Dialog */}
      {conflictDialog && (
        <ConflictDialog
          conflicts={conflictDialog}
          onCancel={() => setConflictDialog(null)}
          onProceed={() => { 
            setConflictDialog(null); 
            // We must pass the cleaned phone numbers here just like the normal save!
            const cp = phone.replace(/\D/g, "").slice(-10);
            const cap = altPhone.trim() ? altPhone.replace(/\D/g, "").slice(-10) : "";
            performSave(cp, cap); 
          }}
        />
      )}

      {/* ── Event Deletion PIN Modal ── */}
      {eventDeleteDialog.isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-destructive rounded-xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                <ShieldAlert size={20} className="text-destructive" />
              </div>
              <h3 className="text-lg font-bold text-destructive" style={{ fontFamily: "Playfair Display, serif" }}>
                Secure Event Deletion
              </h3>
            </div>
            
            <p className="text-sm text-muted-foreground">
              You are about to permanently delete this specific event from the booking. Please enter your 6-digit PIN.
            </p>

            <Input 
              type="text"           // <-- Changed from "password" so Chrome ignores it
              inputMode="numeric"   // <-- Triggers the number pad on mobile
              autoComplete="off"    // <-- Explicitly tells autofill to back off
              maxLength={6}
              placeholder="••••••"
              value={enteredEventPin}
              onChange={(e) => setEnteredEventPin(e.target.value.replace(/\D/g, ''))}
              className="text-center tracking-[0.5em] font-mono text-lg"
              style={{ WebkitTextSecurity: "disc" }} // <-- CSS trick to keep the dots visually!
            />

            <div className="flex justify-end gap-3 pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={(e) => { 
                  e.preventDefault(); 
                  setEventDeleteDialog({ isOpen: false, index: -1 }); 
                  setEnteredEventPin(""); 
                }}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                variant="destructive" 
                onClick={(e) => {
                  e.preventDefault();
                  confirmEventDelete();
                }} 
                disabled={enteredEventPin.length !== 6 || isDeletingEvent}
              >
                {isDeletingEvent ? "Verifying..." : "Authorize Deletion"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── DOMAIN B1: Capacity Warning Modal ── */}
      {showCapacityWarning && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-orange-500/30 rounded-xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                <TriangleAlert size={20} className="text-orange-600" />
              </div>
              <h3 className="text-lg font-bold text-orange-700" style={{ fontFamily: "Playfair Display, serif" }}>
                Capacity Warning
              </h3>
            </div>
            
            <p className="text-sm text-muted-foreground">
              One or more events exceed the maximum physical capacity of their selected venues.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowCapacityWarning(false)}
              >
                Go Back
              </Button>
              <Button 
                type="button" 
                onClick={() => {
                  setShowCapacityWarning(false);
                  
                  // Resume the save pipeline securely
                  const cp = phone.replace(/\D/g, "").slice(-10);
                  const cap = altPhone.trim() ? altPhone.replace(/\D/g, "").slice(-10) : "";
                  const validEvents = events.filter(e => e.eventDate && e.venueName && e.venueName !== "[]" && e.eventType);
                  
                  const conflicts = detectConflicts(validEvents, allClients, client?.id);
                  if (conflicts.length > 0) {
                    setConflictDialog(conflicts);
                    return;
                  }
                  
                  performSave(cp, cap);
                }} 
                style={{ background: "#ea580c", color: "white" }}
              >
                Proceed Anyway
              </Button>
            </div>
          </div>
        </div>
      )}

      
    </div>
  );
}

// ─── Event Row ────────────────────────────────────────────────────────────────
function EventRow({ index, event, venues, venueMode, onVenueMode, onChange, onRemove }: {
  index: number;
  event: Partial<InsertBookingEvent>;
  venues: Venue[];
  venueMode: "select" | "manual";
  onVenueMode: (mode: "select" | "manual") => void;
  onChange: (field: string, val: string | number | undefined | null) => void;
  onRemove?: () => void;
}) {

  const {isAuspicious } = useHinduCalendar();
  // Parse venueName — may be JSON array or plain string
  const selectedVenueNames: string[] = (() => {
    if (!event.venueName) return [];
    try { const p = JSON.parse(event.venueName); return Array.isArray(p) ? p : [event.venueName]; }
    catch { return event.venueName ? [event.venueName] : []; }
  })();
  const selectedVenues = venues.filter(v => selectedVenueNames.includes(v.name));
  // Keep selectedVenue (first) for backward compat display
  const selectedVenue = selectedVenues[0];
  const auspicious = event.eventDate ? isAuspicious(event.eventDate) : false;
  const displayColor = event.color || EVENT_COLORS[event.eventType || "wedding"];

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 transition-colors"
            style={{ background: displayColor }}>
            {index + 1}
          </span>
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Event {index + 1}</span>
          {auspicious && (
            <span className="text-[10px] text-green-700 font-semibold bg-green-50 border border-green-200 px-1.5 py-0.5 rounded">🕉 Shubh Muhurat</span>
          )}
          {event.color && (
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Palette size={9} />
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: event.color }} />
            </span>
          )}
        </div>
        {onRemove && (
          <button onClick={onRemove} className="p-1 text-muted-foreground hover:text-destructive transition-colors">
            <X size={14} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Event Type */}
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1">Event Type</label>
          <select
            value={event.eventType || "wedding"}
            onChange={e => onChange("eventType", e.target.value)}
            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {EVENT_TYPES.map(t => <option key={t} value={t}>{EVENT_LABELS[t]}</option>)}
          </select>
        </div>

        {/* Category */}
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1 flex items-center gap-1"><Tag size={10} />Category</label>
          <select
            value={event.category || "wedding"}
            onChange={e => onChange("category", e.target.value)}
            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {Object.entries(CATEGORIES).map(([v, { label }]) => <option key={v} value={v}>{label}</option>)}
          </select>
        </div>

        {/* Date */}
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1">Date *</label>
          <Input
            type="date"
            value={event.eventDate || ""}
            onChange={e => onChange("eventDate", e.target.value)}
            className={auspicious ? "border-green-400 focus:ring-green-400" : ""}
          />
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1">Guest Count</label>
          {(() => {
            const totalCapacity = selectedVenues.reduce((sum, v) => sum + (v.capacity || 0), 0);
            const isOverCapacity = totalCapacity > 0 && (event.guestCount || 0) > totalCapacity;
            
            return (
              <>
                <Input
                  type="number"
                  value={event.guestCount ?? ""}
                  onChange={e => onChange("guestCount", e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="e.g. 300"
                  className={isOverCapacity ? "border-orange-400 focus-visible:ring-orange-400" : ""}
                />
                {isOverCapacity && (
                  <p className="flex items-center gap-1 text-[10px] text-orange-600 font-medium mt-1.5 animate-in fade-in">
                    <TriangleAlert size={10} />
                    Exceeds capacity ({totalCapacity.toLocaleString()})
                  </p>
                )}
              </>
            );
          })()}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1">Start Time</label>
          <Input type="time" value={event.startTime || ""} onChange={e => onChange("startTime", e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1">End Time</label>
          <Input type="time" value={event.endTime || ""} onChange={e => onChange("endTime", e.target.value)} />
        </div>
        {/* Status */}
        <div className="col-span-2">
          <label className="text-xs font-medium text-muted-foreground block mb-1">Event Status</label>
          <div className="flex gap-1.5">
            {["confirmed", "tentative", "cancelled"].map(s => (
              <button key={s} type="button" onClick={() => onChange("status", s)}
                className="flex-1 text-[11px] py-1.5 rounded border transition-colors"
                style={{
                  borderColor: STATUS_COLORS[s],
                  background: event.status === s ? STATUS_COLORS[s] : "transparent",
                  color: event.status === s ? "#fff" : STATUS_COLORS[s],
                }}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Venue section */}
      <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <Building2 size={12} /> Venue
          </div>
          {venues.length > 0 && (
            <div className="flex items-center gap-0 text-[10px] bg-background border border-border rounded-full overflow-hidden">
              {(["select", "manual"] as const).map(mode => (
                <button key={mode} type="button" onClick={() => { onVenueMode(mode); onChange("venueName", ""); }}
                  className={`px-2.5 py-0.5 transition-colors ${venueMode === mode ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
                  {mode === "select" ? "From List" : "Manual"}
                </button>
              ))}
            </div>
          )}
        </div>

        {venueMode === "select" && venues.length > 0 ? (
          <>
            {/* Multi-venue pill selector */}
            <div className="flex flex-wrap gap-1.5">
              {venues.map(v => {
                const active = selectedVenueNames.includes(v.name);
                const toggle = () => {
                  const next = active
                    ? selectedVenueNames.filter(n => n !== v.name)
                    : [...selectedVenueNames, v.name];
                  onChange("venueName", next.length === 1 ? next[0] : next.length > 1 ? JSON.stringify(next) : "");
                  
                  // NEW: Automatically grab the color of the selected venue!
                  if (!active) onChange("color", v.color); 
                };
                return (
                  <button key={v.id} type="button" onClick={toggle}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all"
                    style={active ? {
                      background: "hsl(210,69%,16%)", borderColor: "hsl(210,69%,16%)", color: "#fff",
                    } : {
                      background: "transparent", borderColor: "hsl(var(--border))", color: "hsl(var(--muted-foreground))",
                    }}>
                    {active && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                    {v.name}
                    {v.capacity ? <span className="opacity-60 text-[10px]">· {v.capacity.toLocaleString()}</span> : null}
                  </button>
                );
              })}
            </div>
            {selectedVenueNames.length > 0 && (
              <div className="flex items-center justify-between">
                <div className="text-[11px] text-muted-foreground flex flex-wrap gap-3">
                  {selectedVenues.map(sv => sv.location && (
                    <span key={sv.id} className="flex items-center gap-0.5"><MapPin size={9} />{sv.name}: {sv.location}{sv.capacity ? ` · ${sv.capacity.toLocaleString()}` : ""}</span>
                  ))}
                </div>
                <button type="button" onClick={() => onChange("venueName", "")}
                  className="text-[10px] text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors">
                  Clear
                </button>
              </div>
            )}
          </>
        ) : (
          <Input
            value={selectedVenueNames.length > 0 ? selectedVenueNames.join(", ") : (event.venueName || "")}
            onChange={e => onChange("venueName", e.target.value)}
            placeholder="Venue name (type manually)"
            className="bg-background"
          />
        )}
      </div>

      {/* Notes */}
      <div>
        <label className="text-xs font-medium text-muted-foreground block mb-1">Event Notes</label>
        <Input value={event.notes || ""} onChange={e => onChange("notes", e.target.value)} placeholder="Special requirements for this event" />
      </div>

      {/* ── Color Picker ── */}
      
    </div>
  );
}

// fix missing import
function BookOpen(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
    </svg>
  );
}
