/**
 * Mock API — in-memory CRUD that mirrors the real backend.
 * Replaces all apiRequest / useQuery calls while DB is disconnected.
 * Data resets on page refresh.
 */

import {
  sampleClients,
  sampleVenues,
  getNextClientId,
  getNextEventId,
  getNextVenueId,
} from "@/lib/sampleData";
import type { ClientWithEvents, Venue, BookingEvent } from "@shared/schema";

// Mutable in-memory stores (seeded from sample data via deep-copy)
export const clients: ClientWithEvents[] = JSON.parse(JSON.stringify(sampleClients));
export const venues: Venue[] = JSON.parse(JSON.stringify(sampleVenues));

// ─── Clients ──────────────────────────────────────────────────────────────────
/** Always returns a deep-copy so React Query detects a change and re-renders. */
export function getClients(): ClientWithEvents[] {
  return JSON.parse(JSON.stringify(clients));
}

export function getClient(id: number): ClientWithEvents | undefined {
  return clients.find(c => c.id === id);
}

export function createClient(data: Omit<ClientWithEvents, "id" | "events">): ClientWithEvents {
  const newClient: ClientWithEvents = { ...data, id: getNextClientId(), events: [] };
  clients.push(newClient);
  return newClient;
}

export function updateClient(id: number, patch: Partial<ClientWithEvents>): ClientWithEvents | null {
  const idx = clients.findIndex(c => c.id === id);
  if (idx === -1) return null;
  clients[idx] = { ...clients[idx], ...patch };
  return clients[idx];
}

export function deleteClient(id: number): boolean {
  const idx = clients.findIndex(c => c.id === id);
  if (idx === -1) return false;
  clients.splice(idx, 1);
  return true;
}

// ─── Booking Events ───────────────────────────────────────────────────────────
export function createEvent(data: Omit<BookingEvent, "id">): BookingEvent | null {
  const client = clients.find(c => c.id === data.clientId);
  if (!client) return null;
  const newEvent: BookingEvent = { ...data, id: getNextEventId() };
  client.events.push(newEvent);
  return newEvent;
}

export function updateEvent(id: number, patch: Partial<BookingEvent>): BookingEvent | null {
  for (const c of clients) {
    const idx = c.events.findIndex(e => e.id === id);
    if (idx !== -1) {
      c.events[idx] = { ...c.events[idx], ...patch };
      return c.events[idx];
    }
  }
  return null;
}

export function deleteEvent(id: number): boolean {
  for (const c of clients) {
    const idx = c.events.findIndex(e => e.id === id);
    if (idx !== -1) {
      c.events.splice(idx, 1);
      return true;
    }
  }
  return false;
}

// ─── Venues ───────────────────────────────────────────────────────────────────
export function getVenues(): Venue[] {
  return JSON.parse(JSON.stringify(venues));
}

export function createVenue(data: Omit<Venue, "id">): Venue {
  const newVenue: Venue = { ...data, id: getNextVenueId() };
  venues.push(newVenue);
  return newVenue;
}

export function deleteVenue(id: number): boolean {
  const idx = venues.findIndex(v => v.id === id);
  if (idx === -1) return false;
  venues.splice(idx, 1);
  return true;
}

// ─── Profile (no-op for sample mode) ─────────────────────────────────────────
let _profile: Record<string, unknown> = {
  businessName: "Bandhan & Co.",
  ownerName: "Sample User",
  phone: "+91 98000 00000",
  email: "sample@bandhanandco.com",
  city: "New Delhi",
  yearsExperience: "5",
  specializations: ["wedding", "reception"],
  bio: "Crafting timeless wedding memories across India.",
};
export function getProfile() { return _profile; }
export function updateProfile(data: Record<string, unknown>) { _profile = { ..._profile, ...data }; return _profile; }
