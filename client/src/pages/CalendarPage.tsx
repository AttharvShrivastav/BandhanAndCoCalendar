import { useState, useMemo, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type ClientWithEvents, type BookingEvent, type Venue } from "@shared/schema";
// import { getEventsForDate, isAuspicious, isFestival, isInauspicious } from "@/lib/hinduDates";
import { useHinduCalendar } from "@/hooks/useHinduCalendar";
import {
  ChevronLeft, ChevronRight, X, Calendar, Users, Phone,
  Mail, MapPin, FileText, Star, Building2, Clock, Edit2, BookOpen,
  Palette, Tag, Filter, ChevronDown, CheckCircle, AlertCircle, XCircle,
  LayoutGrid, Table2, List,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];

// ─── Event type defaults ──────────────────────────────────────────────────────
export const EVENT_LABELS: Record<string, string> = {
  wedding: "Wedding", engagement: "Engagement",
  reception: "Reception", mehendi: "Mehendi", sangeet: "Sangeet",
};
export const EVENT_COLORS: Record<string, string> = {
  wedding: "#0F2A44", engagement: "#6b3a7d",
  reception: "#1e5f7b", mehendi: "#2d6e35", sangeet: "#b85a10",
};
export const STATUS_COLORS: Record<string, string> = {
  confirmed: "#0F2A44", tentative: "#2563a8", cancelled: "#c0392b",
};

// ─── Categories ───────────────────────────────────────────────────────────────
export const CATEGORIES: Record<string, { label: string; color: string }> = {
  wedding:   { label: "Wedding",   color: "#0F2A44" },
  corporate: { label: "Corporate", color: "#1e4d8c" },
  social:    { label: "Social",    color: "#5b8c2a" },
  religious: { label: "Religious", color: "#b07c2a" },
  other:     { label: "Other",     color: "#6b6b6b" },
};

// ─── Color Palette ────────────────────────────────────────────────────────────
export const COLOR_PALETTE = [
  "#0F2A44", "#a83240", "#c0392b", "#e74c3c",
  "#6b3a7d", "#8e44ad", "#6c3483", "#a569bd",
  "#1e4d8c", "#2563a8", "#1a6e8a", "#2980b9",
  "#2d6e35", "#27ae60", "#1e8449", "#58d68d",
  "#b85a10", "#d68910", "#ca6f1e", "#f39c12",
  "#0e6655", "#148f77", "#117a65", "#1abc9c",
  "#6b5b3e", "#935116", "#7d6608", "#9b7e3b",
  "#2c3e50", "#34495e", "#5d6d7e", "#717d7e",
];

/** Returns the effective display color for an event — custom color takes priority */
export function eventDisplayColor(event: BookingEvent): string {
  return event.color || EVENT_COLORS[event.eventType] || EVENT_COLORS.wedding;
}

function toDateStr(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function parseVenue(v: string): string {
  try { const p = JSON.parse(v); return Array.isArray(p) ? p.join(", ") : v; } catch { return v; }
}

// ─── Compact Color Picker ─────────────────────────────────────────────────────
function ColorPicker({ value, onChange, label = "Event Colour" }: {
  value?: string | null; onChange: (color: string | null) => void; label?: string;
}) {
  return (
    <div>
      <label className="text-xs text-muted-foreground block mb-1.5 flex items-center gap-1">
        <Palette size={11} /> {label}
      </label>
      <div className="flex flex-wrap gap-1.5">
        {COLOR_PALETTE.map(hex => (
          <button key={hex} type="button" title={hex}
            onClick={() => onChange(value === hex ? null : hex)}
            className="w-5 h-5 rounded-full border-2 transition-transform hover:scale-110 flex-shrink-0"
            style={{
              background: hex, borderColor: value === hex ? "#fff" : hex,
              boxShadow: value === hex ? `0 0 0 2px ${hex}` : "none",
              transform: value === hex ? "scale(1.18)" : undefined,
            }} />
        ))}
        {value && (
          <button type="button" onClick={() => onChange(null)}
            className="text-[10px] text-muted-foreground px-1.5 py-0.5 rounded border border-border hover:bg-muted transition-colors ml-1">
            Reset
          </button>
        )}
      </div>
      {value && (
        <div className="flex items-center gap-1.5 mt-1.5">
          <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: value }} />
          <span className="text-[10px] text-muted-foreground font-mono">{value}</span>
        </div>
      )}
    </div>
  );
}

// ─── Filter Dropdown ─────────────────────────────────────────────────────────
function FilterDropdown({ filterCategory, setFilterCategory, filterEventType, setFilterEventType, onClear, hasFilters }: {
  filterCategory: string; setFilterCategory: (v: string) => void;
  filterEventType: string; setFilterEventType: (v: string) => void;
  onClear: () => void; hasFilters: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border transition-colors ${
          hasFilters ? "border-primary bg-primary/10 text-primary font-medium" : "border-border text-muted-foreground hover:bg-secondary"
        }`}>
        <Filter size={12} /> Filters
        {hasFilters && <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />}
        <ChevronDown size={11} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-72 bg-card border border-border rounded-xl shadow-xl z-50 p-4 space-y-4">
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Tag size={11} className="text-muted-foreground" />
              <span className="text-xs font-semibold text-foreground">Category</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button onClick={() => setFilterCategory("all")} className="text-[11px] px-2.5 py-1 rounded-full border transition-colors"
                style={{ borderColor: filterCategory === "all" ? "hsl(var(--foreground))" : "hsl(var(--border))", background: filterCategory === "all" ? "hsl(var(--foreground))" : "transparent", color: filterCategory === "all" ? "hsl(var(--background))" : "hsl(var(--muted-foreground))" }}>All</button>
              {Object.entries(CATEGORIES).map(([key, { label, color }]) => (
                <button key={key} onClick={() => setFilterCategory(filterCategory === key ? "all" : key)}
                  className="text-[11px] px-2.5 py-1 rounded-full border transition-colors"
                  style={{ borderColor: color, background: filterCategory === key ? color : "transparent", color: filterCategory === key ? "#fff" : color }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          
          {hasFilters && (
            <button onClick={() => { onClear(); setOpen(false); }}
              className="w-full text-xs text-center py-1.5 rounded-md border border-dashed border-border text-muted-foreground hover:bg-muted transition-colors">
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Date Detail Side Panel ───────────────────────────────────────────────────
export function DateDetailPanel({
  dateStr, dayItems, venues, onClose, updateEventMutation,
}: {
  dateStr: string;
  dayItems: Array<{ event: BookingEvent; client: ClientWithEvents }>;
  venues: Venue[];
  onClose: () => void;
  updateEventMutation: ReturnType<typeof useMutation<any, any, any>>;
}) {

  const { getEventsForDate, isAuspicious, isFestival, isInauspicious } = useHinduCalendar();
  const [editingEventId, setEditingEventId] = useState<number | null>(null);
  const [editFields, setEditFields] = useState<Partial<BookingEvent>>({});
  const [, navigate] = useLocation();

  const date = new Date(dateStr + "T12:00:00");
  const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "long" });
  const formattedDate = date.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
  const hinduEvents = getEventsForDate(dateStr);
  const auspicious = isAuspicious(dateStr);
  const festival = isFestival(dateStr);
  const inauspicious = isInauspicious(dateStr);

  // Accent color — use first booking's color or Midnight Blue
  const accentColor = dayItems.length > 0 ? eventDisplayColor(dayItems[0].event) : "hsl(210,69%,16%)";

  function startEdit(ev: BookingEvent) {
    setEditingEventId(ev.id);
    setEditFields({ ...ev });
  }

  function cancelEdit() {
    setEditingEventId(null);
    setEditFields({});
  }

  const statusIcon = { confirmed: CheckCircle, tentative: AlertCircle, cancelled: XCircle };

  return (
    <div className="absolute right-0 top-0 h-full w-96 bg-card border-l border-border shadow-2xl z-30 flex flex-col overflow-hidden"
      style={{ borderTop: `3px solid ${accentColor}` }}>

      {/* Panel header */}
      <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-border flex-shrink-0">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">{dayOfWeek}</p>
          <h3 className="text-2xl font-light leading-tight" style={{ fontFamily: "Playfair Display, serif" }}>
            {formattedDate}
          </h3>

          {/* Hindu calendar tags */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {auspicious && (
              <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full"
                style={{ background: "rgba(22,163,74,0.1)", color: "#166534" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-green-600 flex-shrink-0" /> Shubh Muhurat
              </span>
            )}
            {festival && (
              <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full"
                style={{ background: "rgba(245,158,11,0.1)", color: "#92400e" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" /> Festival
              </span>
            )}
            {inauspicious && (
              <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full"
                style={{ background: "rgba(239,68,68,0.08)", color: "#991b1b" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" /> Inauspicious
              </span>
            )}
          </div>

          {/* Hindu event names */}
          {hinduEvents.length > 0 && (
            <div className="mt-2 space-y-0.5">
              {hinduEvents.map((he, i) => (
                <p key={i} className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Star size={9} className="flex-shrink-0 text-amber-500" /> {he.name}
                </p>
              ))}
            </div>
          )}
        </div>

        <button onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground flex-shrink-0 mt-0.5">
          <X size={16} />
        </button>
      </div>

      {/* Booking count summary */}
      <div className="px-5 py-3 border-b border-border flex items-center justify-between flex-shrink-0"
        style={{ background: dayItems.length > 0 ? `${accentColor}08` : undefined }}>
        <span className="text-xs font-semibold text-foreground">
          {dayItems.length === 0 ? "No bookings" : `${dayItems.length} booking${dayItems.length !== 1 ? "s" : ""}`}
        </span>
        {dayItems.length > 0 && (
          <div className="flex gap-1">
            {["confirmed", "tentative", "cancelled"].map(s => {
              const count = dayItems.filter(i => i.event.status === s).length;
              if (!count) return null;
              return (
                <span key={s} className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full text-white"
                  style={{ background: STATUS_COLORS[s] }}>
                  {count} {s}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Bookings list */}
      <div className="flex-1 overflow-y-auto">
        {dayItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
            <Calendar size={32} className="mb-2 opacity-20" />
            <p className="text-sm">No bookings on this day</p>
            <button 
              onClick={() => {
                sessionStorage.setItem("openNewBooking", "true");
                sessionStorage.setItem("prefillBookingDate", dateStr);
                navigate("/app/bookings");
              }}
              className="mt-3 text-xs px-3 py-1.5 rounded-md border border-border hover:bg-muted transition-colors"
            >
              + Add Booking for {formattedDate.split(',')[0]}
            </button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {dayItems.map(({ event: ev, client: c }) => {
              const color = eventDisplayColor(ev);
              const isEditing = editingEventId === ev.id;
              const StatusIcon = statusIcon[ev.status as keyof typeof statusIcon] || CheckCircle;

              return (
                <div key={ev.id} className="p-5">
                  {isEditing ? (
                    /* ── Inline Edit Form ── */
                    <div className="space-y-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold" style={{ fontFamily: "Playfair Display, serif" }}>{c.clientName}</span>
                        <button onClick={cancelEdit} className="p-1 hover:bg-muted rounded text-muted-foreground"><X size={14} /></button>
                      </div>

                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Date</label>
                        <Input type="date" value={editFields.eventDate || ""} onChange={e => setEditFields(f => ({ ...f, eventDate: e.target.value }))} />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs text-muted-foreground block mb-1">Event Type</label>
                          <select value={editFields.eventType || "wedding"} onChange={e => setEditFields(f => ({ ...f, eventType: e.target.value }))}
                            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                            {Object.entries(EVENT_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground block mb-1 flex items-center gap-1"><Tag size={10} />Category</label>
                          <select value={editFields.category || "wedding"} onChange={e => setEditFields(f => ({ ...f, category: e.target.value }))}
                            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                            {Object.entries(CATEGORIES).map(([v, { label }]) => <option key={v} value={v}>{label}</option>)}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Venue</label>
                        <select value={editFields.venueName || ""} onChange={e => setEditFields(f => ({ ...f, venueName: e.target.value }))}
                          className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                          <option value={editFields.venueName || ""}>{parseVenue(editFields.venueName || "") || "Current venue"}</option>
                          {venues.map(v => <option key={v.id} value={v.name}>{v.name}</option>)}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs text-muted-foreground block mb-1">Start Time</label>
                          <Input type="time" value={editFields.startTime || ""} onChange={e => setEditFields(f => ({ ...f, startTime: e.target.value }))} />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground block mb-1">End Time</label>
                          <Input type="time" value={editFields.endTime || ""} onChange={e => setEditFields(f => ({ ...f, endTime: e.target.value }))} />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Guest Count</label>
                        <Input type="number" value={editFields.guestCount ?? ""} onChange={e => setEditFields(f => ({ ...f, guestCount: e.target.value ? parseInt(e.target.value) : undefined }))} />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Status</label>
                        <div className="flex gap-1.5">
                          {["confirmed", "tentative", "cancelled"].map(s => (
                            <button key={s} type="button" onClick={() => setEditFields(f => ({ ...f, status: s }))}
                              className="flex-1 text-xs py-1.5 rounded border transition-colors"
                              style={{ borderColor: STATUS_COLORS[s], background: editFields.status === s ? STATUS_COLORS[s] : "transparent", color: editFields.status === s ? "#fff" : STATUS_COLORS[s] }}>
                              {s.charAt(0).toUpperCase() + s.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>
                      <ColorPicker value={editFields.color} onChange={c => setEditFields(f => ({ ...f, color: c ?? undefined }))} />
                      <div className="flex gap-2 pt-1">
                        <Button className="flex-1" size="sm"
                          onClick={() => updateEventMutation.mutate({ id: ev.id, data: editFields })}
                          disabled={updateEventMutation.isPending}>
                          {updateEventMutation.isPending ? "Saving…" : "Save Changes"}
                        </Button>
                        <Button variant="outline" size="sm" onClick={cancelEdit}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    /* ── View Mode ── */
                    <div>
                      {/* Colored left bar + client name */}
                      <div className="flex items-start gap-3">
                        <div className="w-1 self-stretch rounded-full flex-shrink-0 mt-0.5" style={{ background: color, minHeight: 40 }} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="text-sm font-semibold leading-tight" style={{ fontFamily: "Playfair Display, serif" }}>
                                {c.clientName}
                              </h4>
                              {(c.brideName || c.groomName) && (
                                <p className="text-[11px] text-muted-foreground mt-0.5">
                                  {[c.brideName, c.groomName].filter(Boolean).join(" & ")}
                                </p>
                              )}
                            </div>
                            <button onClick={() => startEdit(ev)}
                              className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                              title="Edit event">
                              <Edit2 size={13} />
                            </button>
                          </div>

                          {/* Event type + status badges */}
                          <div className="flex flex-wrap items-center gap-1.5 mt-2">
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded text-white"
                              style={{ background: color }}>
                              {EVENT_LABELS[ev.eventType]}
                            </span>
                            <span className="flex items-center gap-0.5 text-[11px] font-semibold px-2 py-0.5 rounded-full text-white"
                              style={{ background: STATUS_COLORS[ev.status] }}>
                              <StatusIcon size={10} className="flex-shrink-0" />
                              {ev.status}
                            </span>
                            {ev.category && ev.category !== "wedding" && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded border font-medium"
                                style={{ borderColor: CATEGORIES[ev.category]?.color, color: CATEGORIES[ev.category]?.color }}>
                                {CATEGORIES[ev.category]?.label}
                              </span>
                            )}
                          </div>

                          {/* Details */}
                          <div className="mt-3 space-y-1.5">
                            {(ev.startTime || ev.endTime) && (
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Clock size={12} className="flex-shrink-0" />
                                <span>{ev.startTime}{ev.endTime ? ` – ${ev.endTime}` : ""}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Building2 size={12} className="flex-shrink-0" />
                              <span className="truncate">{parseVenue(ev.venueName)}</span>
                            </div>
                            {ev.guestCount && (
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Users size={12} className="flex-shrink-0" />
                                <span>{ev.guestCount.toLocaleString()} guests</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Phone size={12} className="flex-shrink-0" />
                              <span>{c.contactPhone}</span>
                            </div>
                            {c.contactEmail && (
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Mail size={12} className="flex-shrink-0" />
                                <span className="truncate">{c.contactEmail}</span>
                              </div>
                            )}
                            {ev.notes && (
                              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                                <FileText size={12} className="flex-shrink-0 mt-0.5" />
                                <p className="italic leading-relaxed">{ev.notes}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-border flex-shrink-0 grid grid-cols-2 gap-2">
        <Button variant="outline" size="sm" onClick={() => navigate("/app/bookings")}>
          <BookOpen size={13} className="mr-1.5" /> All Bookings
        </Button>
        <Button 
          size="sm" 
          onClick={() => {
            sessionStorage.setItem("openNewBooking", "true");
            sessionStorage.setItem("prefillBookingDate", dateStr);
            navigate("/app/bookings");
          }}
        >
          + Add on {formattedDate.split(' ')[1]} {formattedDate.split(' ')[0]}
        </Button>
      </div>
    </div>
  );
}

// ─── Table View ───────────────────────────────────────────────────────────────
function TableView({
  year, month, daysInMonth, eventsByDate, venues, onCellClick,
}: {
  year: number;
  month: number;
  daysInMonth: number;
  eventsByDate: Record<string, Array<{ event: BookingEvent; client: ClientWithEvents }>>;
  venues: Venue[];
  onCellClick: (dateStr: string) => void;
}) {

  const { getEventsForDate, isAuspicious, isFestival, isInauspicious } = useHinduCalendar();
  const today = new Date();
  const todayStr = toDateStr(today.getFullYear(), today.getMonth(), today.getDate());

  // All unique venue names that appear in events this month + all registered venues
  const venueNamesFromEvents = new Set<string>();
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = toDateStr(year, month, d);
    for (const { event: e } of (eventsByDate[dateStr] || [])) {
      try {
        const p = JSON.parse(e.venueName);
        if (Array.isArray(p)) p.forEach((v: string) => venueNamesFromEvents.add(v));
        else venueNamesFromEvents.add(e.venueName);
      } catch { venueNamesFromEvents.add(e.venueName); }
    }
  }
  // Merge: registered venues first, then any extras from events
  const allVenueNames: string[] = [
    ...venues.map(v => v.name),
    ...[...venueNamesFromEvents].filter(n => !venues.find(v => v.name === n)),
  ];
  // If no venues at all, show a placeholder column
  const cols = allVenueNames.length > 0 ? allVenueNames : ["No Venues Yet"];

  const DAYS_SHORT = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  return (
    <div className="flex-1 overflow-auto">
      <div className="inline-block min-w-full p-4">
        <table className="border-collapse" style={{ tableLayout: "fixed", minWidth: 120 + cols.length * 160 }}>
          <thead>
            <tr>
              <th className="sticky left-0 z-20 bg-card border border-border px-3 py-2 text-left"
                style={{ width: 120, minWidth: 120 }}>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</span>
              </th>
              {cols.map(vname => (
                <th key={vname}
                  className="border border-border px-3 py-2 text-left bg-card"
                  style={{ width: 160, minWidth: 160 }}>
                  <div className="flex items-center gap-1.5">
                    <Building2 size={11} style={{ color: "hsl(38,49%,57%)" }} className="flex-shrink-0" />
                    <span className="text-xs font-semibold text-foreground truncate">{vname}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
              const dateStr = toDateStr(year, month, day);
              const dayItems = eventsByDate[dateStr] || [];
              const date = new Date(year, month, day);
              const dow = DAYS_SHORT[date.getDay()];
              const auspicious = isAuspicious(dateStr);
              const festival = isFestival(dateStr);
              const inauspicious = isInauspicious(dateStr);
              const isToday = dateStr === todayStr;
              const hasAny = dayItems.length > 0;

              let rowBg = "";
              if (inauspicious) rowBg = "#fef2f2";
              else if (auspicious) rowBg = "#f0fdf4";

              return (
                <tr key={dateStr} style={{ background: rowBg || undefined }}
                  className="hover:bg-muted/20 transition-colors">
                  {/* Date cell */}
                  <td className="sticky left-0 z-10 border border-border px-3 py-2 cursor-pointer"
                    style={{ background: rowBg || "hsl(var(--card))", minWidth: 120 }}
                    onClick={() => onCellClick(dateStr)}>
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-lg flex flex-col items-center justify-center flex-shrink-0 ${
                        isToday ? "text-white" : "bg-muted/50 text-foreground"
                      }`} style={isToday ? { background: "hsl(210,69%,16%)" } : undefined}>
                        <span className="text-[9px] font-medium leading-none" style={{ color: isToday ? "rgba(255,255,255,0.7)" : "hsl(var(--muted-foreground))" }}>{dow}</span>
                        <span className="text-xs font-bold leading-none mt-0.5">{day}</span>
                      </div>
                      <div className="flex flex-col gap-0.5 flex-shrink-0">
                        {auspicious && <span className="w-1.5 h-1.5 rounded-full bg-green-500" title="Shubh Muhurat" />}
                        {festival && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Festival" />}
                        {inauspicious && <span className="w-1.5 h-1.5 rounded-full bg-red-400" title="Inauspicious" />}
                      </div>
                      {hasAny && (
                        <span className="text-[9px] font-bold px-1 py-0.5 rounded-full text-white flex-shrink-0"
                          style={{ background: "hsl(210,69%,16%)" }}>
                          {dayItems.length}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Venue cells */}
                  {cols.map(vname => {
                    // Find events at this venue on this date
                    const cellItems = dayItems.filter(({ event: e }) => {
                      try {
                        const p = JSON.parse(e.venueName);
                        return Array.isArray(p) ? p.includes(vname) : e.venueName === vname;
                      } catch { return e.venueName === vname; }
                    });

                    return (
                      <td key={vname}
                        className="border border-border px-2 py-1.5 align-top cursor-pointer"
                        style={{ minWidth: 160, verticalAlign: "top" }}
                        onClick={() => onCellClick(dateStr)}>
                        {cellItems.length === 0 ? (
                          <div className="h-7" />
                        ) : (
                          <div className="flex flex-col gap-1">
                            {cellItems.map(({ event: e, client: c }) => {
                              const color = eventDisplayColor(e);
                              return (
                                <div key={e.id}
                                  className="flex items-center gap-1.5 px-2 py-1 rounded text-white text-[11px] font-medium truncate"
                                  style={{ background: color }}>
                                  <span className="truncate">{c.clientName}</span>
                                  <span className="opacity-70 flex-shrink-0 text-[9px]">{EVENT_LABELS[e.eventType]}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── List View ────────────────────────────────────────────────────────────────
function ListView({
  year, month, daysInMonth, eventsByDate, onDayClick,
}: {
  year: number;
  month: number;
  daysInMonth: number;
  eventsByDate: Record<string, Array<{ event: BookingEvent; client: ClientWithEvents }>>;
  onDayClick: (dateStr: string) => void;
}) {
  const today = new Date();
  const { getEventsForDate, isAuspicious, isFestival, isInauspicious } = useHinduCalendar();
  const todayStr = toDateStr(today.getFullYear(), today.getMonth(), today.getDate());

  const rows: Array<{ dateStr: string; day: number; items: Array<{ event: BookingEvent; client: ClientWithEvents }> }> = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = toDateStr(year, month, d);
    const items = eventsByDate[dateStr] || [];
    if (items.length > 0) rows.push({ dateStr, day: d, items });
  }

  if (rows.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-2 p-8">
        <List size={36} className="opacity-20" />
        <p className="text-sm">No bookings this month</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-4 space-y-2 max-w-4xl mx-auto">
        {rows.map(({ dateStr, day, items }) => {
          const date = new Date(year, month, day);
          const dow = date.toLocaleDateString("en-US", { weekday: "short" });
          const isToday = dateStr === todayStr;
          const auspicious = isAuspicious(dateStr);
          const festival = isFestival(dateStr);
          return (
            <div key={dateStr}
              className="flex gap-4 cursor-pointer group"
              onClick={() => onDayClick(dateStr)}>
              {/* Date badge */}
              <div className="flex-shrink-0 w-14 text-center">
                <div className={`rounded-xl py-1.5 px-1 ${
                  isToday ? "text-white" : "bg-muted/50 text-foreground"
                }`} style={isToday ? { background: "hsl(210,69%,16%)" } : undefined}>
                  <p className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: isToday ? "rgba(255,255,255,0.65)" : "hsl(var(--muted-foreground))" }}>{dow}</p>
                  <p className="text-lg font-light leading-none mt-0.5">{day}</p>
                </div>
                <div className="flex justify-center gap-0.5 mt-1">
                  {auspicious && <span className="w-1.5 h-1.5 rounded-full bg-green-500" title="Shubh" />}
                  {festival && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Festival" />}
                </div>
              </div>
              {/* Events */}
              <div className="flex-1 space-y-1.5 pb-2 border-b border-border group-hover:border-primary/30 transition-colors">
                {items.map(({ event: e, client: c }) => {
                  const color = eventDisplayColor(e);
                  return (
                    <div key={e.id}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg border border-border hover:shadow-sm transition-all"
                      style={{ borderLeft: `3px solid ${color}` }}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-foreground" style={{ fontFamily: "Playfair Display, serif" }}>{c.clientName}</span>
                          <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded text-white" style={{ background: color }}>
                            {EVENT_LABELS[e.eventType]}
                          </span>
                          <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-full text-white"
                            style={{ background: STATUS_COLORS[e.status] }}>
                            {e.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            <Building2 size={10} />{parseVenue(e.venueName)}
                          </span>
                          {(e.startTime || e.endTime) && (
                            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                              <Clock size={10} />{e.startTime}{e.endTime ? `–${e.endTime}` : ""}
                            </span>
                          )}
                          {e.guestCount && (
                            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                              <Users size={10} />{e.guestCount.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Calendar Component ──────────────────────────────────────────────────
export default function CalendarPage() {

  const { getEventsForDate, isAuspicious, isFestival, isInauspicious } = useHinduCalendar();
  const today = new Date();
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // ── Filters ──
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterEventType, setFilterEventType] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"calendar" | "table" | "list">("table");

  const { data: clients = [] } = useQuery<ClientWithEvents[]>({ queryKey: ["/api/clients"] });
  const { data: venues = [] } = useQuery<Venue[]>({ queryKey: ["/api/venues"] });

  // Flatten all events, attach client info
  const allEvents = useMemo(() => {
    const list: Array<{ event: BookingEvent; client: ClientWithEvents }> = [];
    for (const c of clients) {
      for (const e of c.events) list.push({ event: e, client: c });
    }
    return list;
  }, [clients]);

  // Apply filters
  const filteredEvents = useMemo(() => allEvents.filter(({ event: e }) => {
    if (filterCategory !== "all" && e.category !== filterCategory) return false;
    if (filterEventType !== "all" && e.eventType !== filterEventType) return false;
    return true;
  }), [allEvents, filterCategory, filterEventType]);

  const eventsByDate = useMemo(() => {
    const map: Record<string, Array<{ event: BookingEvent; client: ClientWithEvents }>> = {};
    for (const item of filteredEvents) {
      const d = item.event.eventDate;
      if (!map[d]) map[d] = [];
      map[d].push(item);
    }
    return map;
  }, [filteredEvents]);

  const updateEventMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<BookingEvent> }) =>
      apiRequest("PATCH", `/api/booking-events/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      toast({ title: "Event updated" });
    },
  });

  // Calendar grid
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Array<number | null> = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); setSelectedDate(null); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); setSelectedDate(null); };

  // Stats
  const thisMonthEvents = filteredEvents.filter(({ event: e }) => {
    const d = new Date(e.eventDate);
    return d.getFullYear() === year && d.getMonth() === month;
  }).length;
  const confirmedClients = clients.filter(c => c.overallStatus === "confirmed").length;
  const hasFilters = filterCategory !== "all" || filterEventType !== "all";

  const todayStr = toDateStr(today.getFullYear(), today.getMonth(), today.getDate());

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="px-6 py-3 border-b border-border bg-card flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold" style={{ fontFamily: "Playfair Display, serif" }}>Wedding Calendar</h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {thisMonthEvents} event{thisMonthEvents !== 1 ? "s" : ""} this month · {confirmedClients} confirmed · {clients.length} client{clients.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button 
          size="sm" 
          onClick={() => {
            sessionStorage.setItem("openNewBooking", "true");
            navigate("/app/bookings");
          }}
        >
          <BookOpen size={13} className="mr-1" /> New Booking
        </Button>
      </header>

      {/* Toolbar */}
      {/* <div className="px-6 py-2.5 flex items-center gap-3 border-b border-border bg-card"> */}
      {/* Toolbar */}
      <div className="px-4 md:px-6 py-3 flex flex-wrap items-center gap-3 border-b border-border bg-card">
        <button data-testid="prev-month" onClick={prevMonth} className="p-1.5 rounded hover:bg-secondary transition-colors"><ChevronLeft size={15} /></button>
        <h3 className="text-base font-medium" style={{ fontFamily: "Playfair Display, serif", minWidth: 180 }}>{MONTHS[month]} {year}</h3>
        <button data-testid="next-month" onClick={nextMonth} className="p-1.5 rounded hover:bg-secondary transition-colors"><ChevronRight size={15} /></button>
        <button onClick={() => { setYear(today.getFullYear()); setMonth(today.getMonth()); setSelectedDate(null); }}
          className="text-xs px-2.5 py-1 rounded border border-border hover:bg-secondary transition-colors text-muted-foreground">
          Today
        </button>
        <div className="flex-1" />
        {hasFilters && (
          <div className="flex items-center gap-1">
            {filterCategory !== "all" && (
              <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full text-white"
                style={{ background: CATEGORIES[filterCategory]?.color }}>
                <Tag size={9} />{CATEGORIES[filterCategory]?.label}
                <button onClick={() => setFilterCategory("all")} className="ml-0.5 opacity-70 hover:opacity-100"><X size={9} /></button>
              </span>
            )}
            {filterEventType !== "all" && (
              <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full text-white"
                style={{ background: EVENT_COLORS[filterEventType] }}>
                {EVENT_LABELS[filterEventType]}
                <button onClick={() => setFilterEventType("all")} className="ml-0.5 opacity-70 hover:opacity-100"><X size={9} /></button>
              </span>
            )}
          </div>
        )}

        {/* View switcher */}
        <div className="flex items-center rounded-md border border-border overflow-hidden" style={{ height: 30 }}>
          {([
            { key: "calendar" as const, icon: LayoutGrid, title: "Calendar view" },
            { key: "table"    as const, icon: Table2,     title: "Table view" },
            { key: "list"     as const, icon: List,       title: "List view" },
          ] as const).map(({ key, icon: Icon, title }) => (
            <button
              key={key}
              title={title}
              onClick={() => { setViewMode(key); setSelectedDate(null); }}
              className="flex items-center justify-center px-2.5 transition-colors"
              style={{
                height: "100%",
                background: viewMode === key ? "hsl(210,69%,16%)" : "transparent",
                color: viewMode === key ? "#fff" : "hsl(var(--muted-foreground))",
                borderRight: key !== "list" ? "1px solid hsl(var(--border))" : undefined,
              }}>
              <Icon size={13} />
            </button>
          ))}
        </div>

        <FilterDropdown
          filterCategory={filterCategory} setFilterCategory={setFilterCategory}
          filterEventType={filterEventType} setFilterEventType={setFilterEventType}
          hasFilters={hasFilters} onClear={() => { setFilterCategory("all"); setFilterEventType("all"); }}
        />
      </div>

      {/* Main view area + side panel wrapper */}
      <div className="flex-1 overflow-hidden relative flex flex-col">


        {/* ── Calendar grid view alternate ── */}
        {/* {viewMode === "calendar" && (
          <div className={`flex-1 overflow-auto custom-scrollbar transition-all duration-200 bg-background ${selectedDate ? "pr-96" : ""}`}>
            <div className="min-w-[800px] min-h-full flex flex-col p-4 md:p-6">
              
              <div className="flex-1 flex flex-col border-l border-t border-border bg-card rounded-sm shadow-sm overflow-hidden">
                <div className="grid grid-cols-7 flex-shrink-0 bg-muted/10">
                  {DAYS.map(d => (
                    <div key={d} className="text-right text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-muted-foreground py-2.5 pr-3 border-r border-b border-border">
                      {d}
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-7 flex-1 auto-rows-[minmax(130px,1fr)]">
                  {cells.map((day, idx) => {
                    if (!day) {
                      return (
                        <div key={`empty-${idx}`} className="border-r border-b border-border bg-muted/5 pointer-events-none" />
                      );
                    }
                    
                    const dateStr = toDateStr(year, month, day);
                    const dayItems = eventsByDate[dateStr] || [];
                    const hinduEvents = getEventsForDate(dateStr);
                    const auspicious = isAuspicious(dateStr);
                    const festival = isFestival(dateStr);
                    const inauspicious = isInauspicious(dateStr);
                    const isToday = dateStr === todayStr;
                    const isSelected = dateStr === selectedDate;
                    
                    let cellBg = isSelected ? "bg-primary/5" : "bg-transparent";
                    if (!isSelected) {
                      if (inauspicious) cellBg = "bg-red-50/40 hover:bg-red-50/70";
                      else if (auspicious) cellBg = "bg-green-50/30 hover:bg-green-50/50";
                      else cellBg = "hover:bg-muted/20";
                    }

                    return (
                      <div key={dateStr} data-testid={`day-${dateStr}`}
                        onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                        className={`relative border-r border-b border-border p-1.5 flex flex-col gap-1 cursor-pointer transition-colors ${cellBg} ${isSelected ? 'ring-2 ring-inset ring-primary z-10' : ''}`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex gap-1 mt-1.5 ml-1">
                            {auspicious && <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-sm" title="Shubh Muhurat" />}
                            {festival && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-sm" title="Festival" />}
                            {inauspicious && <span className="w-1.5 h-1.5 rounded-full bg-red-400 shadow-sm" title="Inauspicious" />}
                          </div>
                          
                          <div className={`w-7 h-7 flex items-center justify-center rounded-full text-xs transition-colors ${
                            isToday 
                              ? "bg-primary text-primary-foreground font-bold shadow-md" 
                              : isSelected 
                                ? "text-primary font-bold" 
                                : "text-foreground font-medium"
                          }`}>
                            {day}
                          </div>
                        </div>

                        <div className="px-1 flex flex-col gap-0.5">
                          {hinduEvents.slice(0, 1).map((he, i) => (
                            <div key={i} className="text-[9px] text-muted-foreground truncate font-medium tracking-wide" title={he.name}>
                              {he.name}
                            </div>
                          ))}
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar px-0.5 flex flex-col gap-1 mt-1">
                          {dayItems.map(({ event: e, client: c }) => {
                            const displayColor = eventDisplayColor(e);
                            return (
                              <div key={e.id} data-testid={`event-pill-${e.id}`}
                                className="w-full text-white px-2 py-1 rounded-[4px] text-[10px] font-medium leading-none truncate shadow-sm transition-transform hover:brightness-110"
                                style={{ background: displayColor }}>
                                {e.startTime && <span className="opacity-80 mr-1.5">{e.startTime}</span>}
                                {c.clientName}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )} */}


        {/* ── Calendar grid view ── */}
        {viewMode === "calendar" && (
          <div className={`flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar transition-all duration-200 bg-background ${selectedDate ? "pr-96" : ""}`}>
            <div className="h-full flex flex-col p-3 md:p-5">
              
              {/* Edge-to-edge continuous grid container */}
              <div className="flex-1 flex flex-col border-l border-t border-border bg-card rounded-md shadow-sm">
                
                {/* Day headers */}
                <div className="grid grid-cols-7 flex-shrink-0 bg-muted/10">
                  {DAYS.map(d => (
                    <div key={d} className="text-right text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-muted-foreground py-2 pr-2 sm:pr-3 border-r border-b border-border truncate">
                      {d}
                    </div>
                  ))}
                </div>
                
                {/* Day cells */}
                <div className="grid grid-cols-7 flex-1 auto-rows-[minmax(100px,1fr)]">
                  {cells.map((day, idx) => {
                    // Empty offset cells
                    if (!day) {
                      return (
                        <div key={`empty-${idx}`} className="border-r border-b border-border bg-muted/5 pointer-events-none" />
                      );
                    }
                    
                    const dateStr = toDateStr(year, month, day);
                    const dayItems = eventsByDate[dateStr] || [];
                    const hinduEvents = getEventsForDate(dateStr);
                    const auspicious = isAuspicious(dateStr);
                    const festival = isFestival(dateStr);
                    const inauspicious = isInauspicious(dateStr);
                    const isToday = dateStr === todayStr;
                    const isSelected = dateStr === selectedDate;
                    
                    // Background logic 
                    let cellBg = isSelected ? "bg-primary/5" : "bg-transparent";
                    if (!isSelected) {
                      if (inauspicious) cellBg = "bg-red-50/40 hover:bg-red-50/70";
                      else if (auspicious) cellBg = "bg-green-50/30 hover:bg-green-50/50";
                      else cellBg = "hover:bg-muted/20";
                    }

                    return (
                      <div key={dateStr} data-testid={`day-${dateStr}`}
                        onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                        className={`relative border-r border-b border-border p-1 md:p-1.5 flex flex-col gap-0.5 cursor-pointer transition-colors overflow-hidden ${cellBg} ${isSelected ? 'ring-2 ring-inset ring-primary z-10' : ''}`}
                      >
                        {/* Top row: markers (left) + Date Number (right) */}
                        <div className="flex justify-between items-start mb-0.5">
                          <div className="flex flex-wrap gap-1 mt-1 ml-1 max-w-[60%]">
                            {auspicious && <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-sm flex-shrink-0" title="Shubh Muhurat" />}
                            {festival && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-sm flex-shrink-0" title="Festival" />}
                            {inauspicious && <span className="w-1.5 h-1.5 rounded-full bg-red-400 shadow-sm flex-shrink-0" title="Inauspicious" />}
                          </div>
                          
                          <div className={`w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full text-[11px] sm:text-xs transition-colors flex-shrink-0 ${
                            isToday 
                              ? "bg-primary text-primary-foreground font-bold shadow-md" 
                              : isSelected 
                                ? "text-primary font-bold" 
                                : "text-foreground font-medium"
                          }`}>
                            {day}
                          </div>
                        </div>

                        {/* Hindu Events (Subtle text) */}
                        <div className="px-0.5 flex flex-col gap-0.5">
                          {hinduEvents.slice(0, 1).map((he, i) => (
                            <div key={i} className="text-[9px] text-muted-foreground truncate font-medium tracking-wide" title={he.name}>
                              {he.name}
                            </div>
                          ))}
                        </div>

                        {/* Booking Events Stack */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar px-0.5 flex flex-col gap-1 mt-0.5">
                          {dayItems.map(({ event: e, client: c }) => {
                            const displayColor = eventDisplayColor(e);
                            return (
                              <div key={e.id} data-testid={`event-pill-${e.id}`}
                                className="w-full text-white px-1.5 py-0.5 sm:py-1 rounded-[4px] text-[9px] sm:text-[10px] font-medium leading-tight truncate shadow-sm transition-transform hover:brightness-110"
                                style={{ background: displayColor }}>
                                {e.startTime && <span className="opacity-80 mr-1">{e.startTime}</span>}
                                {c.clientName}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Table view ── */}
        {viewMode === "table" && (
          <div className={`flex-1 overflow-hidden flex flex-col transition-all duration-200 ${selectedDate ? "pr-96" : ""}`}>
            <TableView
              year={year}
              month={month}
              daysInMonth={daysInMonth}
              eventsByDate={eventsByDate}
              venues={venues}
              onCellClick={(dateStr) => setSelectedDate(selectedDate === dateStr ? null : dateStr)}
            />
          </div>
        )}

        {/* ── List view ── */}
        {viewMode === "list" && (
          <div className={`flex-1 overflow-hidden flex flex-col transition-all duration-200 ${selectedDate ? "pr-96" : ""}`}>
            <ListView
              year={year}
              month={month}
              daysInMonth={daysInMonth}
              eventsByDate={eventsByDate}
              onDayClick={(dateStr) => setSelectedDate(selectedDate === dateStr ? null : dateStr)}
            />
          </div>
        )}

        {/* Date detail side panel — shared across all views */}
        {selectedDate && (
          <DateDetailPanel
            dateStr={selectedDate}
            dayItems={eventsByDate[selectedDate] || []}
            venues={venues}
            onClose={() => setSelectedDate(null)}
            updateEventMutation={updateEventMutation}
          />
        )}
      </div>

      {/* Legend footer */}
      <div className="px-6 py-2 border-t border-border bg-card flex items-center gap-3 flex-wrap">
        {Object.entries(EVENT_LABELS).map(([key, label]) => (
          <span key={key} className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: EVENT_COLORS[key] }} />
            {label}
          </span>
        ))}
        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-green-600 flex-shrink-0" />Shubh
        </span>
        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />Festival
        </span>
        <span className="text-[10px] text-muted-foreground italic ml-auto">Click any date to see details</span>
      </div>
    </div>
  );
}
