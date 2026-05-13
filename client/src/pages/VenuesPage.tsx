import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  insertVenueSchema,
  type Venue, type InsertVenue,
  type ClientWithEvents, type BookingEvent,
} from "@shared/schema";
import {
  Plus, Trash2, Building2, MapPin, Users,
  ChevronDown, ChevronUp, Phone, ExternalLink, Palette
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useState, useMemo } from "react";
import { Link } from "wouter";
import { X } from "lucide-react";
import { isAuspicious } from "@/lib/hinduDates";
import { COLOR_PALETTE, EVENT_LABELS, STATUS_COLORS, eventDisplayColor } from "@/pages/CalendarPage";

function fmtDate(d: string) {
  return new Date(d + "T12:00:00").toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

// ─── Inline color picker ──────────────────────────────────────────────────────
function ColorPicker({ value, onChange, usedColors }: { value?: string | null; onChange: (c: string | null) => void; usedColors: string[] }) {
  return (
    <div className="w-full">
      <label className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-3">
        <Palette size={13} className="text-muted-foreground" /> 
        Venue Tag Colour
        <span className="text-[10px] text-muted-foreground font-normal ml-1 hidden sm:inline">
          (color-codes events at this venue)
        </span>
      </label>
      
      <div className="flex flex-wrap gap-2 items-center">
        {COLOR_PALETTE.map(hex => {
          const isTaken = usedColors.includes(hex) && value !== hex;
          
          return (
            <button
              key={hex}
              type="button"
              title={isTaken ? "Color already in use" : hex}
              disabled={isTaken}
              onClick={() => onChange(value === hex ? null : hex)}
              className="w-6 h-6 rounded-full border-2 transition-transform flex-shrink-0 shadow-sm"
              style={{
                background: hex,
                borderColor: value === hex ? "#fff" : "transparent",
                boxShadow: value === hex ? `0 0 0 2px ${hex}, 0 2px 4px rgba(0,0,0,0.1)` : "none",
                opacity: isTaken ? 0.2 : 1,
                cursor: isTaken ? "not-allowed" : "pointer",
                transform: value === hex ? "scale(1.15)" : "scale(1)",
              }}
            />
          );
        })}
      </div>
      
      {value && (
        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-border/50">
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Selected:</span>
          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-sm" style={{ background: value }} />
          <span className="text-[10px] text-foreground font-mono">{value}</span>
        </div>
      )}
    </div>
  );
}

// ─── Main Venues Page ─────────────────────────────────────────────────────────
export default function VenuesPage() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [expandedVenue, setExpandedVenue] = useState<number | null>(null);

  const { data: venues = [], isLoading } = useQuery<Venue[]>({ queryKey: ["/api/venues"] });
  const { data: clients = [] } = useQuery<ClientWithEvents[]>({ queryKey: ["/api/clients"] });

  const { data: authData } = useQuery<{ isImpersonating?: boolean }>({ queryKey: ["/api/auth/me"] });
  const isImpersonating = authData?.isImpersonating;

  // Calculate globally used colors so we can pass them to the picker
  const usedColors = useMemo(() => venues.map(v => v.color).filter(Boolean) as string[], [venues]);

  const eventsByVenue = useMemo(() => {
    const map: Record<string, Array<{ event: BookingEvent; client: ClientWithEvents }>> = {};
    for (const c of clients) {
      for (const e of c.events) {
        let keys: string[];
        try { const p = JSON.parse(e.venueName); keys = Array.isArray(p) ? p.map((v:string)=>v.trim().toLowerCase()) : [e.venueName.trim().toLowerCase()]; }
        catch { keys = [e.venueName.trim().toLowerCase()]; }
        for (const key of keys) {
          if (!map[key]) map[key] = [];
          map[key].push({ event: e, client: c });
        }
      }
    }
    return map;
  }, [clients]);

  const createMutation = useMutation({
    mutationFn: (data: InsertVenue) => apiRequest("POST", "/api/venues", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/venues"] });
      setShowForm(false);
      form.reset();
      toast({ title: "Venue added" });
    },
    onError: (err: any) => {
      toast({ title: "Failed to add venue", description: err.message, variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/venues/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/venues"] });
      toast({ title: "Venue removed" });
    },
  });

  const form = useForm<InsertVenue>({
    resolver: zodResolver(insertVenueSchema),
    defaultValues: { name: "", location: "", capacity: undefined, contactPerson: "", contactPhone: "", color:"hsl(210,69%,16%)" },
  });

  const openAddModal = () => {
    // Smart Default: Find the first color in the palette that isn't currently used
    const firstAvailableColor = COLOR_PALETTE.find(c => !usedColors.includes(c)) || "hsl(210,69%,16%)";
    
    form.reset({ 
      name: "", location: "", capacity: undefined, contactPerson: "", contactPhone: "", 
      color: firstAvailableColor 
    });
    setShowForm(true);
  };

  const totalEvents = Object.values(eventsByVenue).reduce((s, a) => s + a.length, 0);

  return (
    <div className="flex flex-col h-full">
      <header className="px-6 py-4 border-b border-border bg-card flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold" style={{ fontFamily: "Playfair Display, serif" }}>Venue Directory</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {venues.length} venue{venues.length !== 1 ? "s" : ""} · {totalEvents} event{totalEvents !== 1 ? "s" : ""} assigned
          </p>
        </div>
        <Button data-testid="button-add-venue" onClick={openAddModal} size="sm">
          <Plus size={14} className="mr-1" /> Add Venue
        </Button>
      </header>

      <div className="flex-1 overflow-auto p-6">
        {isLoading ? (
          <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />)}</div>
        ) : venues.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <Building2 size={40} className="mb-3 opacity-30" />
            <p className="text-sm font-medium">No venues registered yet</p>
            <p className="text-xs mt-1 opacity-70">Add venues and assign them when creating bookings</p>
          </div>
        ) : (
          <div className="space-y-4">
            {venues.map(venue => {
              const venueItems = eventsByVenue[venue.name.trim().toLowerCase()] || [];
              const confirmed = venueItems.filter(x => x.event.status === "confirmed").length;
              const tentative = venueItems.filter(x => x.event.status === "tentative").length;
              const isExpanded = expandedVenue === venue.id;

              const nextItem = venueItems
                .filter(x => x.event.status !== "cancelled" && x.event.eventDate >= new Date().toISOString().slice(0, 10))
                .sort((a, b) => a.event.eventDate.localeCompare(b.event.eventDate))[0];

              return (
                <div key={venue.id} data-testid={`venue-card-${venue.id}`}
                  className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow">

                  {/* Venue header */}
                  <div className="p-5 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${venue.color || "hsl(210,69%,16%)"}22` }}>
                      <Building2 size={18} style={{ color: venue.color || "hsl(210,69%,16%)" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-base" style={{ fontFamily: "Playfair Display, serif" }}>{venue.name}</h4>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {confirmed > 0 && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full text-white" style={{ background: STATUS_COLORS.confirmed }}>{confirmed} confirmed</span>}
                          {tentative > 0 && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full text-white" style={{ background: STATUS_COLORS.tentative }}>{tentative} tentative</span>}
                          <button data-testid={`delete-venue-${venue.id}`} 
                            onClick={() => {
                              if (isImpersonating) {
                                if (!window.confirm("⚠️ SUPPORT MODE WARNING\n\nYou are about to delete a venue in a client's live workspace. This will affect their calendar.\n\nProceed?")) return;
                              }
                              deleteMutation.mutate(venue.id);
                            }}
                            className="p-1 text-muted-foreground hover:text-destructive transition-colors ml-1">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 mt-1.5">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin size={11} />{venue.location}</span>
                        {venue.capacity && <span className="flex items-center gap-1 text-xs text-muted-foreground"><Users size={11} />{venue.capacity.toLocaleString()} guests max</span>}
                        {venue.contactPerson && <span className="flex items-center gap-1 text-xs text-muted-foreground"><Phone size={11} />{venue.contactPerson}{venue.contactPhone ? ` · ${venue.contactPhone}` : ""}</span>}
                      </div>
                      {nextItem && (
                        <div className="mt-1.5 text-xs text-muted-foreground flex items-center gap-1 flex-wrap">
                          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: eventDisplayColor(nextItem.event, venues) }} />
                          Next: <span className="font-medium text-foreground ml-0.5">{nextItem.client.clientName}</span>
                          <span className="ml-0.5">({EVENT_LABELS[nextItem.event.eventType]})</span>
                          <span className="ml-0.5">on {fmtDate(nextItem.event.eventDate)}</span>
                          {isAuspicious(nextItem.event.eventDate) && <span className="text-green-700 font-medium ml-1">✓ Shubh</span>}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action buttons row */}
                  <div className="flex border-t border-border divide-x divide-border">
                    <Link 
                      href={`/app/venues/${venue.id}/calendar`}
                      data-testid={`open-calendar-${venue.id}`}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      Venue Calendar
                      <ExternalLink size={10} className="opacity-50" />
                    </Link>

                    {venueItems.length > 0 && (
                      <button data-testid={`toggle-events-${venue.id}`}
                        onClick={() => setExpandedVenue(isExpanded ? null : venue.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-muted-foreground hover:bg-muted/50 transition-colors">
                        {venueItems.length} event{venueItems.length !== 1 ? "s" : ""}
                        {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      </button>
                    )}
                  </div>

                  {/* Events list */}
                  {isExpanded && venueItems.length > 0 && (
                    <div className="border-t border-border divide-y divide-border">
                      {venueItems
                        .sort((a, b) => a.event.eventDate.localeCompare(b.event.eventDate))
                        .map(({ event: ev, client: c }) => (
                          <div key={ev.id} data-testid={`venue-event-${ev.id}`} className="px-5 py-3 flex items-start gap-3">
                            <div className="w-1.5 self-stretch rounded-full flex-shrink-0" style={{ background: eventDisplayColor(ev, venues) }} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-medium">{c.clientName}</span>
                                {(c.brideName || c.groomName) && <span className="text-xs text-muted-foreground">({[c.brideName, c.groomName].filter(Boolean).join(" & ")})</span>}
                                <span className="text-[10px] font-semibold px-1.5 py-0 rounded" style={{ background: eventDisplayColor(ev, venues) + "22", color: eventDisplayColor(ev, venues) }}>
                                  {EVENT_LABELS[ev.eventType]}
                                </span>
                                <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium text-white" style={{ background: STATUS_COLORS[ev.status] }}>{ev.status}</span>
                              </div>
                              <div className="flex flex-wrap gap-3 mt-0.5 text-xs text-muted-foreground">
                                <span>{fmtDate(ev.eventDate)}</span>
                                {ev.guestCount && <span className="flex items-center gap-1"><Users size={10} />{ev.guestCount} guests</span>}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Venue Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="bg-card rounded-xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="text-xl font-semibold" style={{ fontFamily: "Playfair Display, serif" }}>Add Venue</h3>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-muted rounded"><X size={18} /></button>
            </div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(d => {
                if (isImpersonating) {
                  if (!window.confirm("⚠️ SUPPORT MODE WARNING\n\nYou are adding a venue directly to a client's live workspace.\n\nProceed?")) return;
                }

                if (d.contactPhone) {
                  const cleaned = d.contactPhone.replace(/\D/g, "");
                  const corePhone = cleaned.slice(-10);
                  if (corePhone.length !== 10) {
                    toast({ title: "Invalid Phone Number", description: "Please enter a valid 10-digit contact number.", variant: "destructive" });
                    return;
                  }
                  d.contactPhone = corePhone; 
                }
                createMutation.mutate(d);
              })} className="p-5 space-y-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel className="text-xs">Venue Name</FormLabel>
                    <FormControl><Input {...field} data-testid="input-venueName" placeholder="e.g. Grand Palace Banquet" /></FormControl>
                    <FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="location" render={({ field }) => (
                  <FormItem><FormLabel className="text-xs">Location</FormLabel>
                    <FormControl><Input {...field} data-testid="input-location" placeholder="City, Area" /></FormControl>
                    <FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="capacity" render={({ field }) => (
                  <FormItem><FormLabel className="text-xs">Capacity</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" data-testid="input-capacity" placeholder="Max guests"
                        value={field.value ?? ""}
                        onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)} />
                    </FormControl><FormMessage /></FormItem>
                )} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="contactPerson" render={({ field }) => (
                    <FormItem><FormLabel className="text-xs">Contact Person</FormLabel>
                      <FormControl><Input {...field} placeholder="Name" value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="contactPhone" render={({ field }) => (
                    <FormItem><FormLabel className="text-xs">Contact Phone</FormLabel>
                      <FormControl><Input {...field} placeholder="+91..." value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>

                <div className="pt-2">
                  <FormField control={form.control} name="color" render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="rounded-xl border border-border bg-muted/20 p-4">
                          <ColorPicker
                            value={field.value}
                            onChange={(c) => field.onChange(c || "hsl(210,69%,16%)")}
                            usedColors={usedColors} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="flex gap-2 pt-4 border-t border-border mt-2">
                  <Button type="submit" className="flex-1" disabled={createMutation.isPending}>{createMutation.isPending ? "Saving..." : "Add Venue"}</Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      )}
    </div>
  );
}