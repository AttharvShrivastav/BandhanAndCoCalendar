// import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
// import { createInsertSchema } from "drizzle-zod";
// import { z } from "zod";

// export const organizations = sqliteTable("organizations", {
//   id: integer("id").primaryKey({ autoIncrement: true }),
//   name: text("name").notNull(),
//   trialExpires: text("trial_expires"),
//   isPaid: integer("is_paid", { mode: "boolean" }).default(false).notNull(),
//   deletePin: text("delete_pin").notNull().default("123456"),
// });

// export const users = sqliteTable("users", {
//   id: integer("id").primaryKey({ autoIncrement: true }),
//   orgId: integer("org_id").references(() => organizations.id),
//   name: text("name").notNull(),
//   email: text("email").notNull().unique(),
//   password: text("password").notNull(), // Hashed using bcrypt
//   phone: text("phone"),
//   role: text("role").default("admin").notNull(), // 'superadmin' | 'admin' | 'viewer'
// });

// // ─── Clients ─────────────────────────────────────────────────────────────────
// export const clients = sqliteTable("clients", {
//   id: integer("id").primaryKey({ autoIncrement: true }),
//   orgId: integer("org_id").notNull().references(() => organizations.id),
//   clientName: text("client_name").notNull(),
//   brideName: text("bride_name"),
//   groomName: text("groom_name"),
//   contactPhone: text("contact_phone").notNull(),
//   contactEmail: text("contact_email").notNull(),
//   alternatePhone: text("alternate_phone"),
//   address: text("address"),
//   overallStatus: text("overall_status").notNull().default("confirmed"),
//   notes: text("notes"),
// });

// // ─── Booking Events ───────────────────────────────────────────────────────────
// export const bookingEvents = sqliteTable("booking_events", {
//   id: integer("id").primaryKey({ autoIncrement: true }),
//   orgId: integer("org_id").notNull().references(() => organizations.id),
//   clientId: integer("client_id").notNull(),
//   eventType: text("event_type").notNull(),
//   eventDate: text("event_date").notNull(),
//   venueName: text("venue_name").notNull(),
//   guestCount: integer("guest_count"),
//   startTime: text("start_time"),
//   endTime: text("end_time"),
//   status: text("status").notNull().default("confirmed"),
//   notes: text("notes"),
//   color: text("color"),
//   category: text("category").default("wedding"),
// });

// // ─── Venues ───────────────────────────────────────────────────────────────────
// export const venues = sqliteTable("venues", {
//   id: integer("id").primaryKey({ autoIncrement: true }),
//   orgId: integer("org_id").notNull().references(() => organizations.id),
//   name: text("name").notNull(),
//   location: text("location").notNull(),
//   capacity: integer("capacity"),
//   contactPerson: text("contact_person"),
//   contactPhone: text("contact_phone"),
//   color: text("color").notNull().default("hsl(210,69%,16%)"),
// });


// //------ Support Queries ---------------------------------------------------------
// export const supportQueries = sqliteTable("support_queries", {
//   id: integer("id").primaryKey({ autoIncrement: true }),
//   orgId: integer("org_id").references(() => organizations.id),
//   name: text("name").notNull(),
//   email: text("email").notNull(),
//   subject: text("subject"),
//   message: text("message").notNull(),
//   status: text("status").default("open").notNull(), // 'open' | 'resolved'
//   createdAt: text("created_at").notNull(),
// });

// // ── HINDU CALENDAR EVENTS (GLOBAL TABLE) ──
// export const hinduCalendarEvents = sqliteTable("hindu_calendar_events", {
//   id: integer("id").primaryKey({ autoIncrement: true }),
//   date: text("date").notNull(), // Format: YYYY-MM-DD
//   name: text("name").notNull(),
//   type: text("type").notNull(), // 'muhurat', 'festival', 'inauspicious'
//   nakshatra: text("nakshatra"),
//   timing: text("timing"),
// });


// // Update exports

// // ─── Insert Schemas ───────────────────────────────────────────────────────────
// // We omit id and orgId because the client should NEVER dictate these.
// export const insertClientSchema = createInsertSchema(clients).omit({ id: true, orgId: true });
// export const insertBookingEventSchema = createInsertSchema(bookingEvents).omit({ id: true, orgId: true });
// export const insertVenueSchema = createInsertSchema(venues).omit({ id: true, orgId: true });
// export const insertSupportQuerySchema = createInsertSchema(supportQueries).omit({ id: true });
// export const insertHinduEventSchema = createInsertSchema(hinduCalendarEvents).omit({ id: true });

// // ─── Types ────────────────────────────────────────────────────────────────────
// export type Organization = typeof organizations.$inferSelect;
// export type User = typeof users.$inferSelect;
// export type Client = typeof clients.$inferSelect;
// export type InsertClient = z.infer<typeof insertClientSchema>;
// export type BookingEvent = typeof bookingEvents.$inferSelect;
// export type InsertBookingEvent = z.infer<typeof insertBookingEventSchema>;
// export type Venue = typeof venues.$inferSelect;
// export type InsertVenue = z.infer<typeof insertVenueSchema>;
// export type SupportQuery = typeof supportQueries.$inferSelect;
// export type HinduCalendarEvent = typeof hinduCalendarEvents.$inferSelect;
// export type InsertHinduEvent = z.infer<typeof insertHinduEventSchema>;

// // ─── Composite types ──────────────────────────────────────────────────────────
// export interface ClientWithEvents extends Client {
//   events: BookingEvent[];
// }


import { mysqlTable, varchar, text, int, boolean } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const organizations = mysqlTable("organizations", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  trialExpires: varchar("trial_expires", { length: 255 }),
  isPaid: boolean("is_paid").default(false).notNull(),
  deletePin: varchar("delete_pin", { length: 10 }).notNull().default("123456"),
});

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  orgId: int("org_id").references(() => organizations.id),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(), // Hashed using bcrypt
  phone: varchar("phone", { length: 50 }),
  role: varchar("role", { length: 50 }).default("admin").notNull(), // 'superadmin' | 'admin' | 'viewer'


  fcmToken: varchar("fcm_token", { length: 255 }),
  eventAlertsEnabled: boolean("event_alerts_enabled").default(true).notNull(),
  eventAlertDays: int("event_alert_days").default(3).notNull(),
  platformUpdatesEnabled: boolean("platform_updates_enabled").default(true).notNull(),
});

// ─── Clients ─────────────────────────────────────────────────────────────────
export const clients = mysqlTable("clients", {
  id: int("id").autoincrement().primaryKey(),
  orgId: int("org_id").notNull().references(() => organizations.id),
  clientName: varchar("client_name", { length: 255 }).notNull(),
  brideName: varchar("bride_name", { length: 255 }),
  groomName: varchar("groom_name", { length: 255 }),
  contactPhone: varchar("contact_phone", { length: 50 }).notNull(),
  contactEmail: varchar("contact_email", { length: 255 }).notNull(),
  alternatePhone: varchar("alternate_phone", { length: 50 }),
  address: text("address"),
  overallStatus: varchar("overall_status", { length: 50 }).notNull().default("confirmed"),
  notes: text("notes"),
});

// ─── Booking Events ───────────────────────────────────────────────────────────
export const bookingEvents = mysqlTable("booking_events", {
  id: int("id").autoincrement().primaryKey(),
  orgId: int("org_id").notNull().references(() => organizations.id),
  clientId: int("client_id").notNull(),
  eventType: varchar("event_type", { length: 100 }).notNull(),
  eventDate: varchar("event_date", { length: 50 }).notNull(),
  venueName: varchar("venue_name", { length: 255 }).notNull(),
  guestCount: int("guest_count"),
  startTime: varchar("start_time", { length: 50 }),
  endTime: varchar("end_time", { length: 50 }),
  status: varchar("status", { length: 50 }).notNull().default("confirmed"),
  notes: text("notes"),
  color: varchar("color", { length: 50 }),
  category: varchar("category", { length: 100 }).default("wedding"),
});

// ─── Venues ───────────────────────────────────────────────────────────────────
export const venues = mysqlTable("venues", {
  id: int("id").autoincrement().primaryKey(),
  orgId: int("org_id").notNull().references(() => organizations.id),
  name: varchar("name", { length: 255 }).notNull(),
  location: text("location").notNull(),
  capacity: int("capacity"),
  contactPerson: varchar("contact_person", { length: 255 }),
  contactPhone: varchar("contact_phone", { length: 50 }),
  color: varchar("color", { length: 50 }).notNull().default("hsl(210,69%,16%)"),
});

//------ Support Queries ---------------------------------------------------------
export const supportQueries = mysqlTable("support_queries", {
  id: int("id").autoincrement().primaryKey(),
  orgId: int("org_id").references(() => organizations.id),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 255 }),
  message: text("message").notNull(),
  status: varchar("status", { length: 50 }).default("open").notNull(), // 'open' | 'resolved'
  createdAt: varchar("created_at", { length: 100 }).notNull(),
});

// ── HINDU CALENDAR EVENTS (GLOBAL TABLE) ──
export const hinduCalendarEvents = mysqlTable("hindu_calendar_events", {
  id: int("id").autoincrement().primaryKey(),
  date: varchar("date", { length: 50 }).notNull(), // Format: YYYY-MM-DD
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 100 }).notNull(), // 'muhurat', 'festival', 'inauspicious'
  nakshatra: varchar("nakshatra", { length: 255 }),
  timing: varchar("timing", { length: 255 }),
});

// ─── Insert Schemas ───────────────────────────────────────────────────────────
export const insertClientSchema = createInsertSchema(clients).omit({ id: true, orgId: true });
export const insertBookingEventSchema = createInsertSchema(bookingEvents).omit({ id: true, orgId: true });
export const insertVenueSchema = createInsertSchema(venues).omit({ id: true, orgId: true });
export const insertSupportQuerySchema = createInsertSchema(supportQueries).omit({ id: true });
export const insertHinduEventSchema = createInsertSchema(hinduCalendarEvents).omit({ id: true });

// ─── Types ────────────────────────────────────────────────────────────────────
export type Organization = typeof organizations.$inferSelect;
export type User = typeof users.$inferSelect;
export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;
export type BookingEvent = typeof bookingEvents.$inferSelect;
export type InsertBookingEvent = z.infer<typeof insertBookingEventSchema>;
export type Venue = typeof venues.$inferSelect;
export type InsertVenue = z.infer<typeof insertVenueSchema>;
export type SupportQuery = typeof supportQueries.$inferSelect;
export type HinduCalendarEvent = typeof hinduCalendarEvents.$inferSelect;
export type InsertHinduEvent = z.infer<typeof insertHinduEventSchema>;

export interface ClientWithEvents extends Client {
  events: BookingEvent[];
}