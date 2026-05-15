import { starredDates } from "@shared/schema";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { eq, and, count, like,sql } from "drizzle-orm";
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
  getUpcomingBookingEvents(orgId: number): Promise<BookingEvent[]>;


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

 getAllUsers(): Promise<any[]>;



  getGlobalBookingCount(): Promise<number>;
  updateOrganizationTrial(orgId: number, newExpiry: string): Promise<void>; 
  updateUserPassword(userId: number, hashedPassword: string): Promise<void>;
  updateUserProfile(userId: number, profileData: { name: string; email: string; phone?: string }): Promise<void>;
  getAdminUserByOrgId(orgId: number): Promise<User | undefined>; 

  // Tutorials
  getTutorials(): Promise<any[]>;
  createTutorial(title: string, videoUrl: string): Promise<void>;
  deleteTutorial(id: number): Promise<boolean>;


  updateUserFcmToken(userId: number, token: string | null): Promise<void>;

  

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
  // Inside interface:

  // Inside MySQLStorage class (Auth & Orgs section):
  async updateUserFcmToken(userId: number, token: string | null): Promise<void> {
    await db.update(users).set({ fcmToken: token }).where(eq(users.id, userId));
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


  

 async getUpcomingBookingEvents(orgId: number): Promise<BookingEvent[]> {
   const now = new Date();

  const today = now.toISOString().split("T")[0]; // YYYY-MM-DD
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM

  return await db
    .select()
    .from(bookingEvents)
    .where(
      and(
        eq(bookingEvents.orgId, orgId),

        sql`(
          ${bookingEvents.eventDate} > ${today}
          OR (
            ${bookingEvents.eventDate} = ${today}
            AND ${bookingEvents.startTime} >= ${currentTime}
          )
        )`
      )
    );
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


  


   async getAllUsers(): Promise<any[]> {
    return await db.select().from(users);
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