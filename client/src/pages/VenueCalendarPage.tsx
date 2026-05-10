// import { useState, useMemo } from "react";
// import { useQuery } from "@tanstack/react-query";
// import { useParams, useLocation, useSearch } from "wouter";
// import { type ClientWithEvents, type BookingEvent, type Venue } from "@shared/schema";
// // import { getEventsForDate, isAuspicious, isFestival, isInauspicious } from "@/lib/hinduDates";
// import {
//   ChevronLeft, ChevronRight, X, Calendar, Users, Phone,
//   Mail, Building2, Clock, ArrowLeft, MapPin,
// } from "lucide-react";
// import {
//   EVENT_LABELS, EVENT_COLORS, STATUS_COLORS, CATEGORIES, eventDisplayColor,
// } from "@/pages/CalendarPage";
// import { useHinduCalendar } from "@/hooks/useHinduCalendar";

// const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
// const MONTHS_FULL = [
//   "January", "February", "March", "April", "May", "June",
//   "July", "August", "September", "October", "November", "December",
// ];

// function toDateStr(y: number, m: number, d: number) {
//   return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
// }

// // Blend multiple hex colors into one for cell background
// function blendColors(colors: string[]): string {
//   if (colors.length === 0) return "";
//   if (colors.length === 1) return colors[0];
//   // Average RGB of all event colors
//   let r = 0, g = 0, b = 0;
//   for (const hex of colors) {
//     const n = parseInt(hex.replace("#", ""), 16);
//     r += (n >> 16) & 255;
//     g += (n >> 8) & 255;
//     b += n & 255;
//   }
//   r = Math.round(r / colors.length);
//   g = Math.round(g / colors.length);
//   b = Math.round(b / colors.length);
//   return `rgb(${r},${g},${b})`;
// }

// // ─── Event Detail Side Panel ──────────────────────────────────────────────────
// function EventDetailCard({
//   item,
//   onClose,
// }: {
//   item: { event: BookingEvent; client: ClientWithEvents };
//   onClose: () => void;
// }) {
//   const { event: ev, client: c } = item;
//   const color = eventDisplayColor(ev);

//   return (
//     <div
//       className="absolute right-0 top-0 h-full w-80 bg-card border-l border-border shadow-2xl z-30 flex flex-col overflow-y-auto"
//       style={{ borderTop: `4px solid ${color}` }}
//     >
//       {/* Header */}
//       <div className="flex items-start justify-between p-5 border-b border-border">
//         <div className="flex-1 min-w-0 pr-2">
//           <h3
//             className="text-lg font-semibold leading-tight"
//             style={{ fontFamily: "Playfair Display, serif" }}
//           >
//             {c.clientName}
//           </h3>
//           {(c.brideName || c.groomName) && (
//             <p className="text-xs text-muted-foreground mt-0.5">
//               {[c.brideName, c.groomName].filter(Boolean).join(" & ")}
//             </p>
//           )}
//           <div className="flex items-center gap-1.5 mt-2 flex-wrap">
//             <span
//               className="text-[11px] font-semibold px-2 py-0.5 rounded text-white"
//               style={{ background: color }}
//             >
//               {EVENT_LABELS[ev.eventType]}
//             </span>
//             <span
//               className="text-[11px] font-semibold px-2 py-0.5 rounded-full text-white"
//               style={{ background: STATUS_COLORS[ev.status] }}
//             >
//               {ev.status}
//             </span>
//             {ev.category && ev.category !== "wedding" && (
//               <span
//                 className="text-[10px] px-1.5 py-0.5 rounded border font-medium"
//                 style={{
//                   borderColor: CATEGORIES[ev.category]?.color,
//                   color: CATEGORIES[ev.category]?.color,
//                 }}
//               >
//                 {CATEGORIES[ev.category]?.label}
//               </span>
//             )}
//           </div>
//         </div>
//         <button
//           onClick={onClose}
//           className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground flex-shrink-0"
//         >
//           <X size={16} />
//         </button>
//       </div>

//       {/* Details */}
//       <div className="p-5 space-y-3 flex-1">
//         {/* Date */}
//         <div className="flex items-start gap-3">
//           <Calendar size={15} className="text-muted-foreground mt-0.5 flex-shrink-0" />
//           <div>
//             <p className="text-sm font-medium">
//               {new Date(ev.eventDate + "T12:00:00").toLocaleDateString("en-US", {
//                 weekday: "long", day: "numeric", month: "long", year: "numeric",
//               })}
//             </p>
//             {isAuspicious(ev.eventDate) && (
//               <p className="text-xs text-green-700 font-medium mt-0.5">✓ Shubh Muhurat</p>
//             )}
//           </div>
//         </div>

//         {/* Time */}
//         {(ev.startTime || ev.endTime) && (
//           <div className="flex items-center gap-3">
//             <Clock size={15} className="text-muted-foreground flex-shrink-0" />
//             <p className="text-sm">
//               {ev.startTime}{ev.endTime ? ` – ${ev.endTime}` : ""}
//             </p>
//           </div>
//         )}

//         {/* Venue */}
//         <div className="flex items-center gap-3">
//           <Building2 size={15} className="text-muted-foreground flex-shrink-0" />
//           <p className="text-sm">{(()=>{ try{const p=JSON.parse(ev.venueName);return Array.isArray(p)?p.join(", "):ev.venueName;}catch{return ev.venueName;}})()}</p>
//         </div>

//         {/* Guest count */}
//         {ev.guestCount && (
//           <div className="flex items-center gap-3">
//             <Users size={15} className="text-muted-foreground flex-shrink-0" />
//             <p className="text-sm">{ev.guestCount.toLocaleString()} guests</p>
//           </div>
//         )}

//         {/* Divider */}
//         <div className="border-t border-border pt-3 space-y-3">
//           <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Client Contact</p>

//           {c.contactPhone && (
//             <div className="flex items-center gap-3">
//               <Phone size={15} className="text-muted-foreground flex-shrink-0" />
//               <p className="text-sm">{c.contactPhone}</p>
//             </div>
//           )}
//           {c.contactEmail && (
//             <div className="flex items-center gap-3">
//               <Mail size={15} className="text-muted-foreground flex-shrink-0" />
//               <p className="text-sm break-all">{c.contactEmail}</p>
//             </div>
//           )}
//           {c.address && (
//             <div className="flex items-center gap-3">
//               <MapPin size={15} className="text-muted-foreground flex-shrink-0" />
//               <p className="text-sm">{c.address}</p>
//             </div>
//           )}
//         </div>

//         {/* Budget */}
//         {(c.totalBudget || c.advancePaid) && (
//           <div className="border-t border-border pt-3 space-y-1.5">
//             <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Budget</p>
//             {c.totalBudget && (
//               <p className="text-sm">Total: <span className="font-semibold">₹{Number(c.totalBudget).toLocaleString()}</span></p>
//             )}
//             {c.advancePaid && (
//               <p className="text-sm">Advance: <span className="font-semibold">₹{Number(c.advancePaid).toLocaleString()}</span></p>
//             )}
//           </div>
//         )}

//         {/* Notes */}
//         {ev.notes && (
//           <div className="border-t border-border pt-3">
//             <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-1">Notes</p>
//             <p className="text-sm text-muted-foreground italic">{ev.notes}</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// // ─── Venue Calendar Page ──────────────────────────────────────────────────────
// export default function VenueCalendarPage() {
//   const { id } = useParams<{ id: string }>();
//   const [, navigate] = useLocation();
//   const search = useSearch();
//   const today = new Date();
//   const { getEventsForDate, isAuspicious, isFestival, isInauspicious } = useHinduCalendar();

//   // If a ?date=YYYY-MM-DD param is present, open to that month
//   const initialDate = useMemo(() => {
//     const params = new URLSearchParams(search);
//     const d = params.get("date");
//     if (d) {
//       const parsed = new Date(d + "T12:00:00");
//       if (!isNaN(parsed.getTime())) return parsed;
//     }
//     return today;
//   }, [search]);

//   const [year, setYear] = useState(initialDate.getFullYear());
//   const [month, setMonth] = useState(initialDate.getMonth());

//   // The date to highlight/auto-select on load
//   const highlightDate = useMemo(() => {
//     const params = new URLSearchParams(search);
//     return params.get("date") || null;
//   }, [search]);
//   const [selectedItem, setSelectedItem] = useState<{ event: BookingEvent; client: ClientWithEvents } | null>(null);
//   const [autoOpened, setAutoOpened] = useState(false);

//   const { data: venues = [] } = useQuery<Venue[]>({ queryKey: ["/api/venues"] });
//   const { data: clients = [] } = useQuery<ClientWithEvents[]>({ queryKey: ["/api/clients"] });

//   const venue = venues.find(v => String(v.id) === id);

//   // All events for this venue
//   const venueItems = useMemo(() => {
//     if (!venue) return [];
//     const key = venue.name.trim().toLowerCase();
//     const list: Array<{ event: BookingEvent; client: ClientWithEvents }> = [];
//     for (const c of clients) {
//       for (const e of c.events) {
//         const venueNames: string[] = (() => { try { const p = JSON.parse(e.venueName); return Array.isArray(p) ? p.map((v:string)=>v.trim().toLowerCase()) : [e.venueName.trim().toLowerCase()]; } catch { return [e.venueName.trim().toLowerCase()]; } })();
//         if (venueNames.includes(key)) {
//           list.push({ event: e, client: c });
//         }
//       }
//     }
//     return list;
//   }, [venue, clients]);

//   // Map: dateStr → items
//   const eventsByDate = useMemo(() => {
//     const map: Record<string, Array<{ event: BookingEvent; client: ClientWithEvents }>> = {};
//     for (const item of venueItems) {
//       const d = item.event.eventDate;
//       if (!map[d]) map[d] = [];
//       map[d].push(item);
//     }
//     return map;
//   }, [venueItems]);

//   // Calendar grid
//   const firstDay = new Date(year, month, 1).getDay();
//   const daysInMonth = new Date(year, month + 1, 0).getDate();
//   const cells: Array<number | null> = [
//     ...Array(firstDay).fill(null),
//     ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
//   ];
//   while (cells.length % 7 !== 0) cells.push(null);

//   const prevMonth = () => {
//     if (month === 0) { setMonth(11); setYear(y => y - 1); }
//     else setMonth(m => m - 1);
//     setSelectedItem(null);
//   };
//   const nextMonth = () => {
//     if (month === 11) { setMonth(0); setYear(y => y + 1); }
//     else setMonth(m => m + 1);
//     setSelectedItem(null);
//   };

//   const todayStr = toDateStr(today.getFullYear(), today.getMonth(), today.getDate());

//   // Auto-open detail panel for the highlighted date once data is ready
//   if (highlightDate && !autoOpened && venueItems.length > 0) {
//     const items = eventsByDate[highlightDate];
//     if (items && items.length > 0) {
//       setSelectedItem(items[0]);
//       setAutoOpened(true);
//     } else if (Object.keys(eventsByDate).length > 0) {
//       // Data loaded but no event on that date — still mark as opened so we don't retry
//       setAutoOpened(true);
//     }
//   }

//   // Stats
//   const monthItems = venueItems.filter(({ event: e }) => {
//     const d = new Date(e.eventDate);
//     return d.getFullYear() === year && d.getMonth() === month;
//   });
//   const confirmedCount = venueItems.filter(x => x.event.status === "confirmed").length;

//   if (!venue && venues.length > 0) {
//     return (
//       <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
//         <Building2 size={40} className="opacity-30" />
//         <p className="text-sm">Venue not found.</p>
//         <button
//           onClick={() => navigate("/app/venues")}
//           className="text-xs px-3 py-1.5 rounded border border-border hover:bg-muted transition-colors"
//         >
//           Back to Venues
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col h-full relative">
//       {/* Header */}
//       <header className="px-6 py-3 border-b border-border bg-card flex items-center gap-4">
//         <button
//           onClick={() => navigate("/app/venues")}
//           className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground flex-shrink-0"
//           title="Back to venues"
//         >
//           <ArrowLeft size={16} />
//         </button>

//         <div className="flex-1 min-w-0">
//           <div className="flex items-center gap-2">
//             <div
//               className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0"
//               style={{ background: "hsla(210,69%,16%,0.12)" }}
//             >
//               <Building2 size={13} style={{ color: "hsl(210,69%,16%)" }} />
//             </div>
//             <h2
//               className="text-xl font-semibold truncate"
//               style={{ fontFamily: "Playfair Display, serif" }}
//             >
//               {venue?.name || "Loading…"}
//             </h2>
//             {venue?.location && (
//               <span className="text-xs text-muted-foreground flex items-center gap-0.5 flex-shrink-0">
//                 <MapPin size={10} />{venue.location}
//               </span>
//             )}
//           </div>
//           <p className="text-[11px] text-muted-foreground mt-0.5">
//             {monthItems.length} event{monthItems.length !== 1 ? "s" : ""} this month
//             · {confirmedCount} confirmed total
//             {venue?.capacity ? ` · ${venue.capacity.toLocaleString()} guests max` : ""}
//           </p>
//         </div>

//         {/* Month nav */}
//         <div className="flex items-center gap-2 flex-shrink-0">
//           <button onClick={prevMonth} className="p-1.5 rounded hover:bg-secondary transition-colors">
//             <ChevronLeft size={15} />
//           </button>
//           <h3
//             className="text-base font-medium text-center"
//             style={{ fontFamily: "Playfair Display, serif", minWidth: 160 }}
//           >
//             {MONTHS_FULL[month]} {year}
//           </h3>
//           <button onClick={nextMonth} className="p-1.5 rounded hover:bg-secondary transition-colors">
//             <ChevronRight size={15} />
//           </button>
//           <button
//             onClick={() => { setYear(today.getFullYear()); setMonth(today.getMonth()); setSelectedItem(null); }}
//             className="text-xs px-2.5 py-1 rounded border border-border hover:bg-secondary transition-colors text-muted-foreground"
//           >
//             Today
//           </button>
//         </div>
//       </header>

//       {/* Main area — calendar + optional detail panel side-by-side */}
//       <div className="flex flex-1 overflow-hidden relative">
//         {/* Calendar */}
//         <div className={`flex-1 overflow-auto flex flex-col transition-all duration-200 ${selectedItem ? "pr-80" : ""}`}>
//           {/* Day headers */}
//           <div className="calendar-grid px-4 pt-3 pb-1">
//             {DAYS.map(d => (
//               <div key={d} className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground py-2">
//                 {d}
//               </div>
//             ))}
//           </div>

//           {/* Day cells */}
//           <div className="calendar-grid px-4 pb-4 flex-1">
//             {cells.map((day, idx) => {
//               if (!day) return <div key={`e-${idx}`} className="day-cell bg-muted/10 rounded" />;

//               const dateStr = toDateStr(year, month, day);
//               const dayItems = eventsByDate[dateStr] || [];
//               const hinduEvents = getEventsForDate(dateStr);
//               const auspicious = isAuspicious(dateStr);
//               const festival = isFestival(dateStr);
//               const inauspicious = isInauspicious(dateStr);
//               const isToday = dateStr === todayStr;
//               const hasBookings = dayItems.length > 0;

//               // Compute the cell background
//               let cellBg = "";
//               let cellTextColor = "";
//               if (hasBookings) {
//                 const colors = dayItems.map(item => eventDisplayColor(item.event));
//                 cellBg = blendColors(colors);
//                 cellTextColor = "#fff";
//               } else if (inauspicious) {
//                 cellBg = "rgba(254,226,226,0.7)";
//               } else if (auspicious) {
//                 cellBg = "rgba(220,252,231,0.6)";
//               }

//               const isHighlighted = dateStr === highlightDate;
//               const isSelected = selectedItem && dayItems.some(i => i.event.id === selectedItem.event.id);

//               return (
//                 <div
//                   key={dateStr}
//                   data-testid={`day-${dateStr}`}
//                   className={[
//                     "day-cell rounded flex flex-col p-1.5 transition-all cursor-default",
//                     isToday && !isHighlighted ? "ring-2 ring-accent" : "",
//                     isHighlighted ? "ring-[2.5px] ring-offset-1" : "",
//                     isSelected && !isHighlighted ? "ring-2 ring-white ring-offset-1" : "",
//                     hasBookings ? "cursor-pointer hover:brightness-90" : "",
//                   ].join(" ")}
//                   style={{
//                     background: cellBg || "transparent",
//                     border: hasBookings ? "none" : "1px solid hsl(var(--border))",
//                     ringColor: isHighlighted ? "hsl(210,69%,16%)" : undefined,
//                     outline: isHighlighted ? "2.5px solid hsl(210,69%,16%)" : undefined,
//                     outlineOffset: isHighlighted ? "2px" : undefined,
//                   }}
//                   onClick={() => {
//                     if (dayItems.length > 0) {
//                       // If clicking same day that's already selected, toggle through events or close
//                       if (selectedItem && dayItems.some(i => i.event.id === selectedItem.event.id)) {
//                         const currentIdx = dayItems.findIndex(i => i.event.id === selectedItem.event.id);
//                         const nextIdx = (currentIdx + 1) % dayItems.length;
//                         if (nextIdx === 0 && dayItems.length === 1) {
//                           setSelectedItem(null);
//                         } else {
//                           setSelectedItem(dayItems[nextIdx]);
//                         }
//                       } else {
//                         setSelectedItem(dayItems[0]);
//                       }
//                     }
//                   }}
//                 >
//                   {/* Date number + indicators */}
//                   <div className="flex items-center justify-between mb-0.5">
//                     <span
//                       className="text-xs font-bold"
//                       style={{ color: hasBookings ? cellTextColor : isToday ? "hsl(var(--accent))" : "hsl(var(--foreground))" }}
//                     >
//                       {day}
//                     </span>
//                     <div className="flex gap-0.5 items-center">
//                       {auspicious && (
//                         <span
//                           className="w-1.5 h-1.5 rounded-full flex-shrink-0"
//                           style={{ background: hasBookings ? "rgba(255,255,255,0.8)" : "#16a34a" }}
//                           title="Shubh Muhurat"
//                         />
//                       )}
//                       {festival && (
//                         <span
//                           className="w-1.5 h-1.5 rounded-full flex-shrink-0"
//                           style={{ background: hasBookings ? "rgba(255,255,255,0.8)" : "#f59e0b" }}
//                           title="Festival"
//                         />
//                       )}
//                       {dayItems.length > 1 && (
//                         <span
//                           className="text-[8px] font-bold px-0.5 rounded"
//                           style={{ color: cellTextColor || "hsl(var(--muted-foreground))", background: "rgba(0,0,0,0.15)" }}
//                         >
//                           {dayItems.length}
//                         </span>
//                       )}
//                     </div>
//                   </div>

//                   {/* Hindu event name */}
//                   {hinduEvents.slice(0, 1).map((he, i) => (
//                     <div
//                       key={i}
//                       className="text-[9px] truncate rounded px-0.5 font-medium leading-tight mb-0.5"
//                       style={{
//                         color: hasBookings ? "rgba(255,255,255,0.85)" : he.type === "auspicious" ? "#166534" : he.type === "inauspicious" ? "#991b1b" : "#854d0e",
//                         background: hasBookings ? "rgba(0,0,0,0.15)" : "transparent",
//                       }}
//                       title={he.name}
//                     >
//                       {he.name}
//                     </div>
//                   ))}

//                   {/* Event pills — client name + event type */}
//                   {dayItems.slice(0, 2).map(({ event: e, client: c }, i) => (
//                     <div
//                       key={e.id}
//                       className="text-[9px] truncate font-semibold leading-tight rounded px-0.5"
//                       style={{
//                         color: "#fff",
//                         background: dayItems.length > 1 ? eventDisplayColor(e) + "99" : "rgba(0,0,0,0.18)",
//                       }}
//                       onClick={ev => {
//                         ev.stopPropagation();
//                         setSelectedItem({ event: e, client: c });
//                       }}
//                     >
//                       {c.clientName} · {EVENT_LABELS[e.eventType]}
//                     </div>
//                   ))}
//                   {dayItems.length > 2 && (
//                     <span
//                       className="text-[8px] font-medium"
//                       style={{ color: "rgba(255,255,255,0.8)" }}
//                     >
//                       +{dayItems.length - 2} more
//                     </span>
//                   )}
//                 </div>
//               );
//             })}
//           </div>

//           {/* Legend footer */}
//           <div className="px-6 py-2 border-t border-border bg-card flex items-center gap-4 flex-wrap">
//             {Object.entries(EVENT_LABELS).map(([key, label]) => (
//               <span key={key} className="flex items-center gap-1 text-[10px] text-muted-foreground">
//                 <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: EVENT_COLORS[key] }} />
//                 {label}
//               </span>
//             ))}
//             <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
//               <span className="w-2.5 h-2.5 rounded-full bg-green-600 flex-shrink-0" />Shubh
//             </span>
//             <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
//               <span className="w-2.5 h-2.5 rounded-full bg-amber-500 flex-shrink-0" />Festival
//             </span>
//             <span className="text-[10px] text-muted-foreground italic ml-auto">
//               Click a booked date to view details
//             </span>
//           </div>
//         </div>

//         {/* Detail side panel */}
//         {selectedItem && (
//           <EventDetailCard
//             item={selectedItem}
//             onClose={() => setSelectedItem(null)}
//           />
//         )}
//       </div>
//     </div>
//   );
// }

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation, useSearch } from "wouter";
import { type ClientWithEvents, type BookingEvent, type Venue } from "@shared/schema";
import {
  ChevronLeft, ChevronRight, X, Calendar, Users, Phone,
  Mail, Building2, Clock, ArrowLeft, MapPin, CheckCircle, AlertCircle
} from "lucide-react";
import {
  EVENT_LABELS, EVENT_COLORS, STATUS_COLORS, CATEGORIES, eventDisplayColor,
} from "@/pages/CalendarPage";
import { useHinduCalendar } from "@/hooks/useHinduCalendar";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS_FULL = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function toDateStr(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

// Blend multiple hex colors into one for cell background
function blendColors(colors: string[]): string {
  if (colors.length === 0) return "";
  if (colors.length === 1) return colors[0];
  let r = 0, g = 0, b = 0;
  for (const hex of colors) {
    const n = parseInt(hex.replace("#", ""), 16);
    r += (n >> 16) & 255;
    g += (n >> 8) & 255;
    b += n & 255;
  }
  r = Math.round(r / colors.length);
  g = Math.round(g / colors.length);
  b = Math.round(b / colors.length);
  return `rgb(${r},${g},${b})`;
}

// ─── Event Detail Side Panel / Mobile Bottom Sheet ────────────────────────────
function EventDetailCard({
  item,
  onClose,
}: {
  item: { event: BookingEvent; client: ClientWithEvents };
  onClose: () => void;
}) {
  const { event: ev, client: c } = item;
  const color = eventDisplayColor(ev);

  return (
    <>
      {/* Mobile Backdrop (Click to close) */}
      <div 
        className="md:hidden absolute inset-0 z-30 bg-background/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Responsive Panel: Bottom Sheet on Mobile, Side Panel on Desktop */}
      <div
        className="absolute bottom-0 md:bottom-auto md:top-0 right-0 w-full md:w-80 h-[85%] md:h-full bg-card md:border-l border-border shadow-[0_-10px_40px_rgba(0,0,0,0.15)] md:shadow-2xl z-40 md:z-30 flex flex-col overflow-y-auto rounded-t-3xl md:rounded-none transition-transform"
        style={{ borderTop: `4px solid ${color}` }}
      >
        {/* Mobile Drag Indicator (Visual Only) */}
        <div className="md:hidden w-full flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1.5 bg-muted rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between px-5 pb-5 pt-2 md:pt-5 border-b border-border">
          <div className="flex-1 min-w-0 pr-2">
            <h3
              className="text-lg font-semibold leading-tight"
              style={{ fontFamily: "Playfair Display, serif" }}
            >
              {c.clientName}
            </h3>
            {(c.brideName || c.groomName) && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {[c.brideName, c.groomName].filter(Boolean).join(" & ")}
              </p>
            )}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <span
                className="text-[11px] font-semibold px-2 py-0.5 rounded text-white"
                style={{ background: color }}
              >
                {EVENT_LABELS[ev.eventType]}
              </span>
              <span
                className="text-[11px] font-semibold px-2 py-0.5 rounded-full text-white"
                style={{ background: STATUS_COLORS[ev.status] }}
              >
                {ev.status}
            </span>
              {ev.category && ev.category !== "wedding" && (
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded border font-medium"
                  style={{
                    borderColor: CATEGORIES[ev.category]?.color,
                    color: CATEGORIES[ev.category]?.color,
                  }}
                >
                  {CATEGORIES[ev.category]?.label}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md bg-muted/50 hover:bg-muted transition-colors text-muted-foreground flex-shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {/* Details */}
        <div className="p-5 space-y-3 flex-1 pb-10 md:pb-5">
          {/* Date */}
          <div className="flex items-start gap-3">
            <Calendar size={15} className="text-muted-foreground mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">
                {new Date(ev.eventDate + "T12:00:00").toLocaleDateString("en-US", {
                  weekday: "long", day: "numeric", month: "long", year: "numeric",
                })}
              </p>
              <p className="text-xs text-green-700 font-medium mt-0.5">✓ Selected Date</p>
            </div>
          </div>

          {/* Time */}
          {(ev.startTime || ev.endTime) && (
            <div className="flex items-center gap-3">
              <Clock size={15} className="text-muted-foreground flex-shrink-0" />
              <p className="text-sm">
                {ev.startTime}{ev.endTime ? ` – ${ev.endTime}` : ""}
              </p>
            </div>
          )}

          {/* Venue */}
          <div className="flex items-center gap-3">
            <Building2 size={15} className="text-muted-foreground flex-shrink-0" />
            <p className="text-sm">{(()=>{ try{const p=JSON.parse(ev.venueName);return Array.isArray(p)?p.join(", "):ev.venueName;}catch{return ev.venueName;}})()}</p>
          </div>

          {/* Guest count */}
          {ev.guestCount && (
            <div className="flex items-center gap-3">
              <Users size={15} className="text-muted-foreground flex-shrink-0" />
              <p className="text-sm">{ev.guestCount.toLocaleString()} guests</p>
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-border pt-3 space-y-3">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Client Contact</p>

            {c.contactPhone && (
              <div className="flex items-center gap-3">
                <Phone size={15} className="text-muted-foreground flex-shrink-0" />
                <p className="text-sm">{c.contactPhone}</p>
              </div>
            )}
            {c.contactEmail && (
              <div className="flex items-center gap-3">
                <Mail size={15} className="text-muted-foreground flex-shrink-0" />
                <p className="text-sm break-all">{c.contactEmail}</p>
              </div>
            )}
            {c.address && (
              <div className="flex items-center gap-3">
                <MapPin size={15} className="text-muted-foreground flex-shrink-0" />
                <p className="text-sm">{c.address}</p>
              </div>
            )}
          </div>

          {/* Budget */}
          {(c.totalBudget || c.advancePaid) && (
            <div className="border-t border-border pt-3 space-y-1.5">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Budget</p>
              {c.totalBudget && (
                <p className="text-sm">Total: <span className="font-semibold">₹{Number(c.totalBudget).toLocaleString()}</span></p>
              )}
              {c.advancePaid && (
                <p className="text-sm">Advance: <span className="font-semibold">₹{Number(c.advancePaid).toLocaleString()}</span></p>
              )}
            </div>
          )}

          {/* Notes */}
          {ev.notes && (
            <div className="border-t border-border pt-3">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-1">Notes</p>
              <p className="text-sm text-muted-foreground italic">{ev.notes}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Venue Calendar Page ──────────────────────────────────────────────────────
export default function VenueCalendarPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const search = useSearch();
  const today = new Date();
  const { getEventsForDate, isAuspicious, isFestival, isInauspicious } = useHinduCalendar();

  // If a ?date=YYYY-MM-DD param is present, open to that month
  const initialDate = useMemo(() => {
    const params = new URLSearchParams(search);
    const d = params.get("date");
    if (d) {
      const parsed = new Date(d + "T12:00:00");
      if (!isNaN(parsed.getTime())) return parsed;
    }
    return today;
  }, [search]);

  const [year, setYear] = useState(initialDate.getFullYear());
  const [month, setMonth] = useState(initialDate.getMonth());

  // The date to highlight/auto-select on load
  const highlightDate = useMemo(() => {
    const params = new URLSearchParams(search);
    return params.get("date") || null;
  }, [search]);
  const [selectedItem, setSelectedItem] = useState<{ event: BookingEvent; client: ClientWithEvents } | null>(null);
  const [autoOpened, setAutoOpened] = useState(false);

  const { data: venues = [] } = useQuery<Venue[]>({ queryKey: ["/api/venues"] });
  const { data: clients = [] } = useQuery<ClientWithEvents[]>({ queryKey: ["/api/clients"] });

  const venue = venues.find(v => String(v.id) === id);

  // All events for this venue
  const venueItems = useMemo(() => {
    if (!venue) return [];
    const key = venue.name.trim().toLowerCase();
    const list: Array<{ event: BookingEvent; client: ClientWithEvents }> = [];
    for (const c of clients) {
      for (const e of c.events) {
        const venueNames: string[] = (() => { try { const p = JSON.parse(e.venueName); return Array.isArray(p) ? p.map((v:string)=>v.trim().toLowerCase()) : [e.venueName.trim().toLowerCase()]; } catch { return [e.venueName.trim().toLowerCase()]; } })();
        if (venueNames.includes(key)) {
          list.push({ event: e, client: c });
        }
      }
    }
    return list;
  }, [venue, clients]);

  // Map: dateStr → items
  const eventsByDate = useMemo(() => {
    const map: Record<string, Array<{ event: BookingEvent; client: ClientWithEvents }>> = {};
    for (const item of venueItems) {
      const d = item.event.eventDate;
      if (!map[d]) map[d] = [];
      map[d].push(item);
    }
    return map;
  }, [venueItems]);

  // Calendar grid
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Array<number | null> = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
    setSelectedItem(null);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
    setSelectedItem(null);
  };

  const todayStr = toDateStr(today.getFullYear(), today.getMonth(), today.getDate());

  // Auto-open detail panel for the highlighted date once data is ready
  if (highlightDate && !autoOpened && venueItems.length > 0) {
    const items = eventsByDate[highlightDate];
    if (items && items.length > 0) {
      setSelectedItem(items[0]);
      setAutoOpened(true);
    } else if (Object.keys(eventsByDate).length > 0) {
      setAutoOpened(true);
    }
  }

  // Stats
  const monthItems = venueItems.filter(({ event: e }) => {
    const d = new Date(e.eventDate);
    return d.getFullYear() === year && d.getMonth() === month;
  });
  const confirmedCount = venueItems.filter(x => x.event.status === "confirmed").length;

  if (!venue && venues.length > 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
        <Building2 size={40} className="opacity-30" />
        <p className="text-sm">Venue not found.</p>
        <button
          onClick={() => navigate("/app/venues")}
          className="text-xs px-3 py-1.5 rounded border border-border hover:bg-muted transition-colors"
        >
          Back to Venues
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative">
      {/* Header */}
      <header className="px-4 md:px-6 py-3 md:py-4 border-b border-border bg-card flex flex-col md:flex-row md:items-center justify-between gap-4 flex-shrink-0">
        
        {/* Left Side: Back Button & Venue Details */}
        <div className="flex items-start md:items-center gap-3 md:gap-4 min-w-0">
          <button
            onClick={() => navigate("/app/venues")}
            className="p-1.5 md:p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground border border-transparent hover:border-border flex-shrink-0 mt-0.5 md:mt-0"
            title="Back to venues"
          >
            <ArrowLeft size={16} />
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap md:flex-nowrap">
              <div
                className="w-7 h-7 md:w-8 md:h-8 rounded-md flex items-center justify-center flex-shrink-0"
                style={{ background: "hsla(210,69%,16%,0.12)" }}
              >
                <Building2 size={14} style={{ color: "hsl(210,69%,16%)" }} />
              </div>
              <h2
                className="text-lg md:text-xl font-semibold truncate leading-none"
                style={{ fontFamily: "Playfair Display, serif" }}
              >
                {venue?.name || "Loading…"}
              </h2>
              {venue?.location && (
                <span className="text-[10px] md:text-[11px] text-muted-foreground flex items-center gap-1 flex-shrink-0 bg-muted/50 px-2 py-0.5 rounded-full border border-border font-medium">
                  <MapPin size={10} />{venue.location}
                </span>
              )}
            </div>
            <p className="text-[10px] md:text-xs text-muted-foreground mt-1.5 md:mt-1 leading-tight">
              {monthItems.length} event{monthItems.length !== 1 ? "s" : ""} this month
              · {confirmedCount} confirmed
              {venue?.capacity ? ` · Max ${venue.capacity.toLocaleString()} guests` : ""}
            </p>
          </div>
        </div>

        {/* Right Side: Month Nav */}
        <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto flex-shrink-0 border-t md:border-t-0 border-border pt-3 md:pt-0">
          <div className="flex items-center gap-1">
            <button onClick={prevMonth} className="p-1.5 rounded-md hover:bg-secondary transition-colors border border-transparent hover:border-border">
              <ChevronLeft size={16} />
            </button>
            <h3
              className="text-sm md:text-base font-medium text-center px-1"
              style={{ fontFamily: "Playfair Display, serif", minWidth: "140px" }}
            >
              {MONTHS_FULL[month]} {year}
            </h3>
            <button onClick={nextMonth} className="p-1.5 rounded-md hover:bg-secondary transition-colors border border-transparent hover:border-border">
              <ChevronRight size={16} />
            </button>
          </div>
          <button
            onClick={() => { setYear(today.getFullYear()); setMonth(today.getMonth()); setSelectedItem(null); }}
            className="text-[11px] md:text-xs px-3 py-1.5 rounded-md border border-border hover:bg-secondary transition-colors text-foreground font-medium shadow-sm"
          >
            Today
          </button>
        </div>
      </header>

      {/* Main area — calendar + optional detail panel side-by-side */}
      <div className="flex flex-1 overflow-hidden relative bg-background">
        
        {/* Calendar Wrapper. Note: md:pr-80 ensures it only shifts on desktop when panel is open */}
        <div className={`flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar flex flex-col transition-all duration-200 ${selectedItem ? "md:pr-80" : ""}`}>
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
                  if (!day) return <div key={`empty-${idx}`} className="border-r border-b border-border bg-muted/5 pointer-events-none" />;

                  const dateStr = toDateStr(year, month, day);
                  const dayItems = eventsByDate[dateStr] || [];
                  const hinduEvents = getEventsForDate(dateStr);
                  const auspicious = isAuspicious(dateStr);
                  const festival = isFestival(dateStr);
                  const inauspicious = isInauspicious(dateStr);
                  const isToday = dateStr === todayStr;
                  const hasBookings = dayItems.length > 0;

                  // Compute the cell background based on bookings and Hindu dates
                  let cellBg = "transparent";
                  let cellTextColor = "hsl(var(--foreground))";
                  if (hasBookings) {
                    const colors = dayItems.map(item => eventDisplayColor(item.event));
                    cellBg = blendColors(colors);
                    cellTextColor = "#fff";
                  } else if (inauspicious) {
                    cellBg = "rgba(254,226,226,0.7)";
                  } else if (auspicious) {
                    cellBg = "rgba(220,252,231,0.6)";
                  }

                  const isHighlighted = dateStr === highlightDate;
                  const isSelected = selectedItem && dayItems.some(i => i.event.id === selectedItem.event.id);

                  return (
                    <div
                      key={dateStr}
                      data-testid={`day-${dateStr}`}
                      className={[
                        "relative border-r border-b border-border p-1 md:p-1.5 flex flex-col gap-0.5 transition-colors overflow-hidden",
                        isToday && !isHighlighted && !isSelected ? "ring-2 ring-inset ring-accent z-10" : "",
                        isHighlighted ? "ring-[2.5px] ring-inset ring-offset-1 z-10" : "",
                        isSelected && !isHighlighted ? "ring-2 ring-inset ring-white ring-offset-1 z-10" : "",
                        hasBookings ? "cursor-pointer hover:brightness-90" : "cursor-default hover:bg-muted/20"
                      ].join(" ")}
                      style={{
                        background: cellBg,
                        ringColor: isHighlighted ? "hsl(210,69%,16%)" : undefined,
                        outline: isHighlighted ? "2.5px solid hsl(210,69%,16%)" : undefined,
                        outlineOffset: isHighlighted ? "2px" : undefined,
                      }}
                      onClick={() => {
                        if (dayItems.length > 0) {
                          // Toggle logic
                          if (selectedItem && dayItems.some(i => i.event.id === selectedItem.event.id)) {
                            const currentIdx = dayItems.findIndex(i => i.event.id === selectedItem.event.id);
                            const nextIdx = (currentIdx + 1) % dayItems.length;
                            if (nextIdx === 0 && dayItems.length === 1) {
                              setSelectedItem(null);
                            } else {
                              setSelectedItem(dayItems[nextIdx]);
                            }
                          } else {
                            setSelectedItem(dayItems[0]);
                          }
                        }
                      }}
                    >
                      {/* Date number + indicators */}
                      <div className="flex items-start justify-between mb-0.5">
                        <div className="flex flex-wrap items-center gap-1 mt-0.5 ml-0.5 max-w-[60%]">
                          {auspicious && (
                            <span
                              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                              style={{ background: hasBookings ? "rgba(255,255,255,0.8)" : "#16a34a" }}
                              title="Shubh Muhurat"
                            />
                          )}
                          {festival && (
                            <span
                              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                              style={{ background: hasBookings ? "rgba(255,255,255,0.8)" : "#f59e0b" }}
                              title="Festival"
                            />
                          )}
                          {dayItems.length > 1 && (
                            <span
                              className="text-[8px] font-bold px-0.5 rounded flex-shrink-0"
                              style={{ color: cellTextColor, background: "rgba(0,0,0,0.15)" }}
                            >
                              {dayItems.length}
                            </span>
                          )}
                        </div>
                        
                        <span
                          className="text-[11px] sm:text-xs font-bold pr-1 pt-0.5"
                          style={{ color: hasBookings ? cellTextColor : isToday ? "hsl(var(--accent))" : "hsl(var(--foreground))" }}
                        >
                          {day}
                        </span>
                      </div>

                      {/* Hindu event name */}
                      {hinduEvents.slice(0, 1).map((he, i) => (
                        <div
                          key={i}
                          className="text-[9px] truncate rounded px-0.5 font-medium leading-tight mb-0.5"
                          style={{
                            color: hasBookings ? "rgba(255,255,255,0.85)" : he.type === "auspicious" ? "#166534" : he.type === "inauspicious" ? "#991b1b" : "#854d0e",
                            background: hasBookings ? "rgba(0,0,0,0.15)" : "transparent",
                          }}
                          title={he.name}
                        >
                          {he.name}
                        </div>
                      ))}

                      {/* Event pills — client name + event type */}
                      <div className="flex-1 overflow-y-auto custom-scrollbar px-0.5 flex flex-col gap-0.5 mt-0.5">
                        {dayItems.slice(0, 2).map(({ event: e, client: c }) => (
                          <div
                            key={e.id}
                            className="text-[9px] sm:text-[10px] truncate font-semibold leading-tight rounded px-1 py-0.5 shadow-sm transition-transform hover:brightness-110"
                            style={{
                              color: "#fff",
                              background: dayItems.length > 1 ? eventDisplayColor(e) + "99" : "rgba(0,0,0,0.18)",
                            }}
                            onClick={ev => {
                              ev.stopPropagation();
                              setSelectedItem({ event: e, client: c });
                            }}
                          >
                            {c.clientName} · {EVENT_LABELS[e.eventType]}
                          </div>
                        ))}
                        {dayItems.length > 2 && (
                          <span
                            className="text-[8px] font-medium px-0.5"
                            style={{ color: hasBookings ? "rgba(255,255,255,0.8)" : "hsl(var(--muted-foreground))" }}
                          >
                            +{dayItems.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Legend footer */}
          <div className="px-6 py-2 border-t border-border bg-card flex items-center gap-4 flex-wrap mt-auto flex-shrink-0">
            {Object.entries(EVENT_LABELS).map(([key, label]) => (
              <span key={key} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: EVENT_COLORS[key] }} />
                {label}
              </span>
            ))}
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <span className="w-2.5 h-2.5 rounded-full bg-green-600 flex-shrink-0" />Shubh
            </span>
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 flex-shrink-0" />Festival
            </span>
            <span className="text-[10px] text-muted-foreground italic ml-auto">
              Click a booked date to view details
            </span>
          </div>
        </div>

        {/* Detail side panel */}
        {selectedItem && (
          <EventDetailCard
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
          />
        )}
      </div>
    </div>
  );
}