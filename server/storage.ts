// import { drizzle } from "drizzle-orm/better-sqlite3";
// import Database from "better-sqlite3";
// import {
//   organizations, users, clients, bookingEvents, venues, supportQueries, hinduCalendarEvents,
//   type Organization, type User, type Client, type InsertClient,
//   type BookingEvent, type InsertBookingEvent,
//   type Venue, type InsertVenue, type ClientWithEvents,
// } from "@shared/schema";
// import { eq, and, count, like } from "drizzle-orm";

// const dbPath = process.env.DATABASE_PATH || "wedding_calendar.db";
// const sqlite = new Database(dbPath);
// const db = drizzle(sqlite);

// // Create tables with Multi-Tenancy (org_id)
// sqlite.exec(`
//   CREATE TABLE IF NOT EXISTS organizations (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     name TEXT NOT NULL,
//     trial_expires TEXT,
//     is_paid INTEGER NOT NULL DEFAULT 0,
//     delete_pin TEXT NOT NULL DEFAULT '123456'  -- <-- ADDED THIS LINE
//   );

//   CREATE TABLE IF NOT EXISTS users (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     org_id INTEGER REFERENCES organizations(id),
//     name TEXT NOT NULL,
//     email TEXT NOT NULL UNIQUE,
//     password TEXT NOT NULL,
//     phone TEXT,
//     role TEXT NOT NULL DEFAULT 'admin'
//   );

//   CREATE TABLE IF NOT EXISTS clients (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     org_id INTEGER NOT NULL REFERENCES organizations(id),
//     client_name TEXT NOT NULL,
//     bride_name TEXT,
//     groom_name TEXT,
//     contact_phone TEXT NOT NULL,
//     contact_email TEXT NOT NULL,
//     alternate_phone TEXT,
//     address TEXT,
//     overall_status TEXT NOT NULL DEFAULT 'confirmed',
//     notes TEXT
//   );

//   CREATE TABLE IF NOT EXISTS booking_events (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     org_id INTEGER NOT NULL REFERENCES organizations(id),
//     client_id INTEGER NOT NULL,
//     event_type TEXT NOT NULL,
//     event_date TEXT NOT NULL,
//     venue_name TEXT NOT NULL,
//     guest_count INTEGER,
//     start_time TEXT,
//     end_time TEXT,
//     status TEXT NOT NULL DEFAULT 'confirmed',
//     notes TEXT,
//     color TEXT,
//     category TEXT DEFAULT 'wedding'
//   );

//   CREATE TABLE IF NOT EXISTS venues (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     org_id INTEGER NOT NULL REFERENCES organizations(id),
//     name TEXT NOT NULL,
//     location TEXT NOT NULL,
//     capacity INTEGER,
//     contact_person TEXT,
//     contact_phone TEXT,
//     color TEXT NOT NULL DEFAULT 'hsl(210,69%,16%)' -- <-- ADDED THIS LINE
//   );

//   CREATE TABLE IF NOT EXISTS support_queries (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     org_id INTEGER REFERENCES organizations(id),
//     name TEXT NOT NULL,
//     email TEXT NOT NULL,
//     subject TEXT,
//     message TEXT NOT NULL,
//     status TEXT NOT NULL DEFAULT 'open',
//     created_at TEXT NOT NULL
//   );

//   CREATE TABLE IF NOT EXISTS hindu_calendar_events (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     date TEXT NOT NULL,
//     name TEXT NOT NULL,
//     type TEXT NOT NULL,
//     nakshatra TEXT,
//     timing TEXT
//   );



// `);

// // Idempotent migrations for existing data (if any)
// try { sqlite.exec(`ALTER TABLE booking_events ADD COLUMN color TEXT`); } catch (_) {}
// try { sqlite.exec(`ALTER TABLE booking_events ADD COLUMN category TEXT DEFAULT 'wedding'`); } catch (_) {}

// export interface IStorage {
//   // Auth & Orgs
//   getUserByEmail(email: string): User | undefined;
//   getUserById(id: number): User | undefined;
//   createOrganization(name: string, trialExpires: string, deletePin: string): Organization;
//   createUser(user: Omit<User, "id">): User;
//   getOrganization(id: number): Organization | undefined;
//   getUserByPhone(phone: string): User | undefined;

//   // Clients (Tenant Scoped)
//   getClients(orgId: number): Client[];
//   getClientById(orgId: number, id: number): Client | undefined;
//   getClientWithEvents(orgId: number, id: number): ClientWithEvents | undefined;
//   getAllClientsWithEvents(orgId: number): ClientWithEvents[];
//   createClient(orgId: number, data: InsertClient): Client;
//   updateClient(orgId: number, id: number, data: Partial<InsertClient>): Client | undefined;
//   deleteClient(orgId: number, id: number): boolean;

//   // Booking Events (Tenant Scoped)
//   getBookingEvents(orgId: number): BookingEvent[];
//   getEventsForClient(orgId: number, clientId: number): BookingEvent[];
//   createBookingEvent(orgId: number, data: InsertBookingEvent): BookingEvent;
//   updateBookingEvent(orgId: number, id: number, data: Partial<InsertBookingEvent>): BookingEvent | undefined;
//   deleteBookingEvent(orgId: number, id: number): boolean;
//   deleteEventsForClient(orgId: number, clientId: number): void;

//   // Venues (Tenant Scoped)
//   getVenues(orgId: number): Venue[];
//   createVenue(orgId: number, data: InsertVenue): Venue;
//   deleteVenue(orgId: number, id: number): boolean;

//   // Support Queries
//   createSupportQuery(query: any): any;
//   getAllSupportQueries(): any[];
//   resolveSupportQuery(id: number): any;

//   // Global SuperAdmin Stats
//   getAllOrganizations(): any[];
//   getGlobalBookingCount(): number;
//   updateOrganizationTrial(id: number, trialExpires: string): any;

//   getHinduEvents(year?: string): any[];
//   bulkInsertHinduEvents(events: any[]): void;
  
// }

// export class SQLiteStorage implements IStorage {
//   // ── Auth & Orgs ──
//   getUserByEmail(email: string): User | undefined {
//     return db.select().from(users).where(eq(users.email, email)).get();
//   }
//   getUserByPhone(phone: string): User | undefined {
//     return db.select().from(users).where(eq(users.phone, phone)).get();
//   }
//   getUserById(id: number): User | undefined {
//     return db.select().from(users).where(eq(users.id, id)).get();
//   }
  
//   createUser(user: Omit<User, "id">): User {
//     return db.insert(users).values(user).returning().get();
//   }
//   getOrganization(id: number): Organization | undefined {
//     return db.select().from(organizations).where(eq(organizations.id, id)).get();
//   }
//   createOrganization(name: string, trialExpires: string, deletePin: string): Organization {
//     return db.insert(organizations)
//       .values({ name, trialExpires, deletePin })
//       .returning().get();
//   }

//   // ── Clients ──
//   getClients(orgId: number): Client[] {
//     return db.select().from(clients).where(eq(clients.orgId, orgId)).all();
//   }
//   getClientById(orgId: number, id: number): Client | undefined {
//     return db.select().from(clients).where(and(eq(clients.id, id), eq(clients.orgId, orgId))).get();
//   }
//   getClientWithEvents(orgId: number, id: number): ClientWithEvents | undefined {
//     const client = this.getClientById(orgId, id);
//     if (!client) return undefined;
//     return { ...client, events: this.getEventsForClient(orgId, id) };
//   }
//   getAllClientsWithEvents(orgId: number): ClientWithEvents[] {
//     const orgClients = this.getClients(orgId);
//     const orgEvents = this.getBookingEvents(orgId);
//     return orgClients.map(c => ({ ...c, events: orgEvents.filter(e => e.clientId === c.id) }));
//   }
//   createClient(orgId: number, data: InsertClient): Client {
//     return db.insert(clients).values({ ...data, orgId }).returning().get();
//   }
//   updateClient(orgId: number, id: number, data: Partial<InsertClient>): Client | undefined {
//     return db.update(clients).set(data).where(and(eq(clients.id, id), eq(clients.orgId, orgId))).returning().get();
//   }
//   deleteClient(orgId: number, id: number): boolean {
//     this.deleteEventsForClient(orgId, id);
//     return db.delete(clients).where(and(eq(clients.id, id), eq(clients.orgId, orgId))).run().changes > 0;
//   }

//   // ── Booking Events ──
//   getBookingEvents(orgId: number): BookingEvent[] {
//     return db.select().from(bookingEvents).where(eq(bookingEvents.orgId, orgId)).all();
//   }
//   getEventsForClient(orgId: number, clientId: number): BookingEvent[] {
//     return db.select().from(bookingEvents).where(and(eq(bookingEvents.clientId, clientId), eq(bookingEvents.orgId, orgId))).all();
//   }
//   createBookingEvent(orgId: number, data: InsertBookingEvent): BookingEvent {
//     return db.insert(bookingEvents).values({ ...data, orgId }).returning().get();
//   }
//   updateBookingEvent(orgId: number, id: number, data: Partial<InsertBookingEvent>): BookingEvent | undefined {
//     return db.update(bookingEvents).set(data).where(and(eq(bookingEvents.id, id), eq(bookingEvents.orgId, orgId))).returning().get();
//   }
//   deleteBookingEvent(orgId: number, id: number): boolean {
//     return db.delete(bookingEvents).where(and(eq(bookingEvents.id, id), eq(bookingEvents.orgId, orgId))).run().changes > 0;
//   }
//   deleteEventsForClient(orgId: number, clientId: number): void {
//     db.delete(bookingEvents).where(and(eq(bookingEvents.clientId, clientId), eq(bookingEvents.orgId, orgId))).run();
//   }

//   // ── Venues ──
//   getVenues(orgId: number): Venue[] {
//     return db.select().from(venues).where(eq(venues.orgId, orgId)).all();
//   }
//   createVenue(orgId: number, data: InsertVenue): Venue {
//     return db.insert(venues).values({ ...data, orgId }).returning().get();
//   }
//   deleteVenue(orgId: number, id: number): boolean {
//     return db.delete(venues).where(and(eq(venues.id, id), eq(venues.orgId, orgId))).run().changes > 0;
//   }

//   // ── SUPPORT QUERIES ──
//   createSupportQuery(query: any) {
//     // Assuming you imported supportQueries from @shared/schema
//     return db.insert(supportQueries).values(query).returning().get();
//   }

//   getAllSupportQueries() {
//     return db.select().from(supportQueries).all();
//   }

//   resolveSupportQuery(id: number) {
//     return db.update(supportQueries)
//       .set({ status: "resolved" })
//       .where(eq(supportQueries.id, id))
//       .returning().get();
//   }

//   // ── SUPERADMIN GLOBAL STATS ──
//   getAllOrganizations() {
//     return db.select().from(organizations).all();
//   }

//   getGlobalBookingCount() {
//     // Uses drizzle's count() feature. Ensure you import { count } from "drizzle-orm" at the top!
//     const result = db.select({ value: count() }).from(bookingEvents).get();
//     return result?.value || 0;
//   }


//   async updateOrganizationTrial(id: number, trialExpires: string) {
//     return await db.update(organizations)
//       .set({ trialExpires: trialExpires }) 
//       .where(eq(organizations.id, id))
//       .returning().get();
//   }


//   // ── HINDU CALENDAR ──
//   getHinduEvents(year?: string) {
//     if (year) {
//       // Fetch only events that start with the requested year (e.g., "2026%")
//       return db.select().from(hinduCalendarEvents).where(like(hinduCalendarEvents.date, `${year}-%`)).all();
//     }
//     return db.select().from(hinduCalendarEvents).all();
//   }

//   bulkInsertHinduEvents(events: any[]) {
//     // Drizzle allows inserting an array of objects all at once!
//     if (events.length > 0) {
//       db.insert(hinduCalendarEvents).values(events).run();
//     }
//   }
// }

// export const storage = new SQLiteStorage();


import { starredDates } from "@shared/schema";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { eq, and, count, like } from "drizzle-orm";
import {
  organizations, users, clients, bookingEvents, venues, supportQueries, hinduCalendarEvents,
  type Organization, type User, type Client, type InsertClient,
  type BookingEvent, type InsertBookingEvent,
  type Venue, type InsertVenue, type ClientWithEvents, tutorials
} from "@shared/schema";



// ─── Remote MySQL Connection ───
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required for MySQL connection.");
}

const poolConnection = mysql.createPool({
  uri: process.env.DATABASE_URL,
});

const db = drizzle(poolConnection);

export interface IStorage {

  // Security
  updateOrgSecurity(orgId: number, isEnabled: boolean, newPin?: string): Promise<void>;
  // Starred Dates
  getStarredDates(orgId: number): Promise<string[]>;
  toggleStarredDate(orgId: number, date: string): Promise<boolean>;

  // Auth & Orgs
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserById(id: number): Promise<User | undefined>;
  createOrganization(name: string, trialExpires: string, deletePin: string): Promise<Organization>;
  deleteOrganization(orgId: number): Promise<boolean>;
  createUser(user: Omit<User, "id">): Promise<User>;
  getOrganization(id: number): Promise<Organization | undefined>;
  getUserByPhone(phone: string): Promise<User | undefined>;

  // Clients (Tenant Scoped)
  getClients(orgId: number): Promise<Client[]>;
  getClientById(orgId: number, id: number): Promise<Client | undefined>;
  getClientWithEvents(orgId: number, id: number): Promise<ClientWithEvents | undefined>;
  getAllClientsWithEvents(orgId: number): Promise<ClientWithEvents[]>;
  createClient(orgId: number, data: InsertClient): Promise<Client>;
  updateClient(orgId: number, id: number, data: Partial<InsertClient>): Promise<Client | undefined>;
  deleteClient(orgId: number, id: number): Promise<boolean>;

  // Booking Events (Tenant Scoped)
  getBookingEvents(orgId: number): Promise<BookingEvent[]>;
  getEventsForClient(orgId: number, clientId: number): Promise<BookingEvent[]>;
  createBookingEvent(orgId: number, data: InsertBookingEvent): Promise<BookingEvent>;
  updateBookingEvent(orgId: number, id: number, data: Partial<InsertBookingEvent>): Promise<BookingEvent | undefined>;
  deleteBookingEvent(orgId: number, id: number): Promise<boolean>;
  deleteEventsForClient(orgId: number, clientId: number): Promise<void>;

  // Venues (Tenant Scoped)
  getVenues(orgId: number): Promise<Venue[]>;
  createVenue(orgId: number, data: InsertVenue): Promise<Venue>;
  deleteVenue(orgId: number, id: number): Promise<boolean>;

  // Support Queries
  createSupportQuery(query: any): Promise<any>;
  getAllSupportQueries(): Promise<any[]>;
  resolveSupportQuery(id: number): Promise<any>;

  // Global SuperAdmin Stats
  getAllOrganizations(): Promise<any[]>;
  getGlobalBookingCount(): Promise<number>;
  updateOrganizationTrial(orgId: number, newExpiry: string): Promise<void>; 
  updateUserPassword(userId: number, hashedPassword: string): Promise<void>;
  updateUserProfile(userId: number, profileData: { name: string; email: string; phone?: string }): Promise<void>;
  getAdminUserByOrgId(orgId: number): Promise<User | undefined>; 

  // Tutorials
  getTutorials(): Promise<any[]>;
  createTutorial(title: string, videoUrl: string): Promise<void>;
  deleteTutorial(id: number): Promise<boolean>;


  // Hindu Calendar
  getHinduEvents(year?: string): Promise<any[]>;
  bulkInsertHinduEvents(events: any[]): Promise<void>;
}

export class MySQLStorage implements IStorage {
  // ─── Auth & Orgs ───
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return user;
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.phone, phone)).limit(1);
    return user;
  }

  async getUserById(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return user;
  }

  async createUser(user: Omit<User, "id">): Promise<User> {
    const [result] = await db.insert(users).values(user);
    const [newUser] = await db.select().from(users).where(eq(users.id, result.insertId)).limit(1);
    return newUser;
  }

  async getOrganization(id: number): Promise<Organization | undefined> {
    const [org] = await db.select().from(organizations).where(eq(organizations.id, id)).limit(1);
    return org;
  }

  async createOrganization(name: string, trialExpires: string, deletePin: string): Promise<Organization> {
    const [result] = await db.insert(organizations).values({ name, trialExpires, deletePin });
    const [newOrg] = await db.select().from(organizations).where(eq(organizations.id, result.insertId)).limit(1);
    return newOrg;
  }

  // ─── Clients ───
  async getClients(orgId: number): Promise<Client[]> {
    return await db.select().from(clients).where(eq(clients.orgId, orgId));
  }

  async getClientById(orgId: number, id: number): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(and(eq(clients.id, id), eq(clients.orgId, orgId))).limit(1);
    return client;
  }

  async getClientWithEvents(orgId: number, id: number): Promise<ClientWithEvents | undefined> {
    const client = await this.getClientById(orgId, id);
    if (!client) return undefined;
    const events = await this.getEventsForClient(orgId, id);
    return { ...client, events };
  }

  async getAllClientsWithEvents(orgId: number): Promise<ClientWithEvents[]> {
    const orgClients = await this.getClients(orgId);
    const orgEvents = await this.getBookingEvents(orgId);
    return orgClients.map(c => ({
      ...c,
      events: orgEvents.filter(e => e.clientId === c.id)
    }));
  }

  async createClient(orgId: number, data: InsertClient): Promise<Client> {
    const [result] = await db.insert(clients).values({ ...data, orgId });
    const [newClient] = await db.select().from(clients).where(eq(clients.id, result.insertId)).limit(1);
    return newClient;
  }

  async updateClient(orgId: number, id: number, data: Partial<InsertClient>): Promise<Client | undefined> {
    await db.update(clients).set(data).where(and(eq(clients.id, id), eq(clients.orgId, orgId)));
    return await this.getClientById(orgId, id);
  }

  async deleteClient(orgId: number, id: number): Promise<boolean> {
    await this.deleteEventsForClient(orgId, id);
    const [result] = await db.delete(clients).where(and(eq(clients.id, id), eq(clients.orgId, orgId)));
    return result.affectedRows > 0;
  }

  // ─── Booking Events ───
  async getBookingEvents(orgId: number): Promise<BookingEvent[]> {
    return await db.select().from(bookingEvents).where(eq(bookingEvents.orgId, orgId));
  }

  async getEventsForClient(orgId: number, clientId: number): Promise<BookingEvent[]> {
    return await db.select().from(bookingEvents).where(and(eq(bookingEvents.clientId, clientId), eq(bookingEvents.orgId, orgId)));
  }

  async createBookingEvent(orgId: number, data: InsertBookingEvent): Promise<BookingEvent> {
    const [result] = await db.insert(bookingEvents).values({ ...data, orgId });
    const [newEvent] = await db.select().from(bookingEvents).where(eq(bookingEvents.id, result.insertId)).limit(1);
    return newEvent;
  }

  async updateBookingEvent(orgId: number, id: number, data: Partial<InsertBookingEvent>): Promise<BookingEvent | undefined> {
    await db.update(bookingEvents).set(data).where(and(eq(bookingEvents.id, id), eq(bookingEvents.orgId, orgId)));
    const [updatedEvent] = await db.select().from(bookingEvents).where(and(eq(bookingEvents.id, id), eq(bookingEvents.orgId, orgId))).limit(1);
    return updatedEvent;
  }

  async deleteBookingEvent(orgId: number, id: number): Promise<boolean> {
    const [result] = await db.delete(bookingEvents).where(and(eq(bookingEvents.id, id), eq(bookingEvents.orgId, orgId)));
    return result.affectedRows > 0;
  }

  async deleteEventsForClient(orgId: number, clientId: number): Promise<void> {
    await db.delete(bookingEvents).where(and(eq(bookingEvents.clientId, clientId), eq(bookingEvents.orgId, orgId)));
  }

  // ─── Venues ───
  async getVenues(orgId: number): Promise<Venue[]> {
    return await db.select().from(venues).where(eq(venues.orgId, orgId));
  }

  async createVenue(orgId: number, data: InsertVenue): Promise<Venue> {
    const [result] = await db.insert(venues).values({ ...data, orgId });
    const [newVenue] = await db.select().from(venues).where(eq(venues.id, result.insertId)).limit(1);
    return newVenue;
  }

  async deleteVenue(orgId: number, id: number): Promise<boolean> {
    const [result] = await db.delete(venues).where(and(eq(venues.id, id), eq(venues.orgId, orgId)));
    return result.affectedRows > 0;
  }

  // ─── Support Queries ───
  async createSupportQuery(query: any): Promise<any> {
    const [result] = await db.insert(supportQueries).values(query);
    const [newQuery] = await db.select().from(supportQueries).where(eq(supportQueries.id, result.insertId)).limit(1);
    return newQuery;
  }

  async getAllSupportQueries(): Promise<any[]> {
    return await db.select().from(supportQueries);
  }

  async resolveSupportQuery(id: number): Promise<any> {
    await db.update(supportQueries).set({ status: "resolved" }).where(eq(supportQueries.id, id));
    const [query] = await db.select().from(supportQueries).where(eq(supportQueries.id, id)).limit(1);
    return query;
  }

  // ─── SuperAdmin Global Stats ───
  async getAllOrganizations(): Promise<any[]> {
    return await db.select().from(organizations);
  }

  async getGlobalBookingCount(): Promise<number> {
    const [result] = await db.select({ value: count() }).from(bookingEvents);
    return result?.value || 0;
  }

  async updateOrganizationTrial(orgId: number, newExpiry: string): Promise<void> { // <-- Changed to string
    await db.update(organizations)
      .set({ trialExpires: newExpiry })
      .where(eq(organizations.id, orgId));
  }

  async getAdminUserByOrgId(orgId: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.orgId, orgId)).limit(1);
    return user;
  }

  async updateUserPassword(userId: number, hashedPassword: string): Promise<void> {
    await db.update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, userId));
  }

  async updateOrgSecurity(orgId: number, isEnabled: boolean, newPin?: string): Promise<void> {
    const data: any = { isDeletePinEnabled: isEnabled };
    if (newPin) data.deletePin = newPin;
    await db.update(organizations).set(data).where(eq(organizations.id, orgId));
  }

  async getStarredDates(orgId: number): Promise<string[]> {
    const results = await db.select().from(starredDates).where(eq(starredDates.orgId, orgId));
    return results.map(r => r.date);
  }

  async toggleStarredDate(orgId: number, date: string): Promise<boolean> {
    const existing = await db.select().from(starredDates).where(and(eq(starredDates.orgId, orgId), eq(starredDates.date, date))).limit(1);
    if (existing.length > 0) {
      await db.delete(starredDates).where(eq(starredDates.id, existing[0].id));
      return false; // unstarred
    } else {
      await db.insert(starredDates).values({ orgId, date });
      return true; // starred
    }
  }

  async updateUserProfile(userId: number, profileData: { name: string; email: string; phone?: string }): Promise<void> {
    await db.update(users)
      .set({ 
        name: profileData.name, 
        email: profileData.email, 
        phone: profileData.phone 
      })
      .where(eq(users.id, userId));
  }

  // ─── Tutorials (Global) ───
  async getTutorials(): Promise<any[]> {
    return await db.select().from(tutorials);
  }

  async createTutorial(title: string, videoUrl: string): Promise<void> {
    await db.insert(tutorials).values({ title, videoUrl });
  }

  async deleteTutorial(id: number): Promise<boolean> {
    const [result] = await db.delete(tutorials).where(eq(tutorials.id, id));
    return result.affectedRows > 0;
  }

  // ─── Hindu Calendar ───
  async getHinduEvents(year?: string): Promise<any[]> {
    if (year) {
      return await db.select().from(hinduCalendarEvents).where(like(hinduCalendarEvents.date, `${year}-%`));
    }
    return await db.select().from(hinduCalendarEvents);
  }

  async bulkInsertHinduEvents(events: any[]): Promise<void> {
    if (events.length > 0) {
      await db.insert(hinduCalendarEvents).values(events);
    }
  }


  // ─── Workspace Teardown ───
  async deleteOrganization(orgId: number): Promise<boolean> {
    // Manually cascade deletes to prevent MySQL constraint errors
    await db.delete(bookingEvents).where(eq(bookingEvents.orgId, orgId));
    await db.delete(clients).where(eq(clients.orgId, orgId));
    await db.delete(venues).where(eq(venues.orgId, orgId));
    await db.delete(supportQueries).where(eq(supportQueries.orgId, orgId));
    await db.delete(starredDates).where(eq(starredDates.orgId, orgId));
    await db.delete(users).where(eq(users.orgId, orgId));
    
    // Finally, drop the organization
    const [result] = await db.delete(organizations).where(eq(organizations.id, orgId));
    return result.affectedRows > 0;
  }
}

export const storage = new MySQLStorage();