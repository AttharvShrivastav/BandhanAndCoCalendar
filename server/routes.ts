import type { Express, Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { 
  insertClientSchema, 
  insertBookingEventSchema, 
  insertVenueSchema,
  insertSupportQuerySchema,
  insertHinduEventSchema
} from "@shared/schema";
import session from "express-session";
import connectSqlite3 from "connect-sqlite3";
import bcrypt from "bcryptjs";

const SQLiteStore = connectSqlite3(session);

// ─── Types ────────────────────────────────────────────────────────────────────
declare module "express-session" {
  interface SessionData {
    userId: number;
    orgId: number;
    role: string;
    originalOrgId?: number;
  }
}

// ─── Middleware ───────────────────────────────────────────────────────────────
function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session || !req.session.userId || !req.session.orgId) {
    return res.status(401).json({ error: "Unauthorized. Please log in." });
  }
  next();
}

function requireSuperAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session || req.session.role !== "superadmin") {
    return res.status(403).json({ error: "Forbidden: SuperAdmin access required." });
  }
  next();
}

// ⚠️ NOW ASYNC: We have to wait for the network to fetch the Org status
async function checkSubscription(req: Request, res: Response, next: NextFunction) {
  if (req.session.role === "superadmin") return next();
  try {
    const org = await storage.getOrganization(req.session.orgId!);
    if (!org) return res.status(401).json({ error: "Organization not found." });

    if (!org.isPaid && org.trialExpires) {
      const expires = new Date(org.trialExpires).getTime();
      if (Date.now() > expires) {
        return res.status(403).json({ 
          error: "SUBSCRIPTION_EXPIRED", 
          message: "Your trial has expired. Please contact support to upgrade." 
        });
      }
    }
    next();
  } catch (error) {
    res.status(500).json({ error: "Database connection error" });
  }
}

function normalizePhone(phone: string | undefined | null) {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  return digits.slice(-10);
}

export function registerRoutes(httpServer: ReturnType<typeof createServer>, app: Express) {
  
  // ─── Session Setup ───
  app.use(session({
    store: new SQLiteStore({ dir: './', db: 'sessions.db', concurrentDB: true }),
    secret: process.env.SESSION_SECRET || 'bandhan_super_secret_dev_key_change_in_prod',
    resave: false,
    saveUninitialized: false,
    cookie: { 
      maxAge: 30 * 24 * 60 * 60 * 1000, 
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    }
  }));

  // ─── Authentication Routes ───
  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Missing email or password" });

    const user = await storage.getUserByEmail(email.toLowerCase().trim());
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ error: "Invalid credentials" });

    req.session.userId = user.id;
    req.session.orgId = user.orgId!;
    req.session.role = user.role;

    res.json({ message: "Logged in successfully", user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  });

  app.post("/api/auth/send-otp", async (req, res) => {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: "Phone number required" });
    const cleanPhone = normalizePhone(phone);
    
    const user = await storage.getUserByPhone(cleanPhone!);
    if (!user) return res.status(404).json({ error: "No account found with this phone number." });

    res.json({ message: "OTP Sent successfully. (Use 123456 for testing)" });
  });

  app.post("/api/auth/verify-otp", async (req, res) => {
    const { phone, otp } = req.body;
    if (!phone || !otp) return res.status(400).json({ error: "Phone and OTP required" });
    const cleanPhone = normalizePhone(phone);

    const user = await storage.getUserByPhone(cleanPhone!);
    if (!user) return res.status(404).json({ error: "Account not found." });
    if (otp !== "123456") return res.status(401).json({ error: "Invalid OTP code." });

    req.session.userId = user.id;
    req.session.orgId = user.orgId!;
    req.session.role = user.role;

    res.json({ message: "Logged in via Phone", user: { id: user.id, name: user.name, role: user.role } });
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", requireAuth, async (req, res) => {
    const user = await storage.getUserById(req.session.userId!);
    const org = await storage.getOrganization(req.session.orgId!);

    if (!user || !org) return res.status(404).json({ error: "Not found" });
    
    const { password, ...safeUser } = user;
    res.json({ 
      user: safeUser, 
      organization: org,
      isImpersonating: !!req.session.originalOrgId
    });
  });

  // ─── SuperAdmin Dashboard Routes ───
  app.post("/api/superadmin/organizations", requireAuth, requireSuperAdmin, async (req, res) => {
    const { orgName, adminName, adminEmail, adminPassword, adminPhone, trialDays = 14, deletePin } = req.body;

    if (!orgName || !adminName || !adminEmail || !adminPassword || !deletePin) {
      return res.status(400).json({ error: "Missing required fields, including Delete PIN." });
    }
    if (deletePin.length !== 6) {
      return res.status(400).json({ error: "Delete PIN must be exactly 6 digits." });
    }

    const safeEmail = adminEmail.toLowerCase().trim();
    const safePhone = normalizePhone(adminPhone);

    const existingEmail = await storage.getUserByEmail(safeEmail);
    if (existingEmail) {
      return res.status(400).json({ error: "Email already in use." });
    }
    
    if (safePhone) {
      const existingPhone = await storage.getUserByPhone(safePhone);
      if (existingPhone) return res.status(400).json({ error: "Phone number already linked." });
    }

    try {
      const trialDate = new Date();
      trialDate.setDate(trialDate.getDate() + trialDays);
      
      const newOrg = await storage.createOrganization(orgName, trialDate.toISOString(), deletePin);
      
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);
      
      const newAdmin = await storage.createUser({
        orgId: newOrg.id,
        name: adminName,
        email: safeEmail,
        password: hashedPassword,
        phone: safePhone, 
        role: "admin" 
 
      });

      res.status(201).json({ 
        message: "Organization provisioned successfully.", 
        organization: newOrg,
        adminUser: { id: newAdmin.id, email: newAdmin.email }
      });
    } catch (err) {
      res.status(500).json({ error: "Failed to provision tenant." });
    }
  });

  // DOMAIN A: EXACT EXPIRY DATE UPDATE (TIMEZONE FIXED)
  app.patch("/api/superadmin/organizations/:id/trial", requireAuth, requireSuperAdmin, async (req: Request, res: Response) => {
    const orgId = parseInt(req.params.id as string);
    const { targetDate } = req.body;

    if (!targetDate) return res.status(400).json({ error: "Target date is required" });

    try {
      // 12:00 PM UTC prevents the timezone shift in IST
      const newExpiry = new Date(targetDate + "T12:00:00.000Z").toISOString();
      await storage.updateOrganizationTrial(orgId, newExpiry);
      res.json({ success: true, newExpiry });
    } catch (error) {
      res.status(500).json({ error: "Failed to update expiry date" });
    }
  });

  // DOMAIN A: TENANT PASSWORD RESET (RE-ADDED)
  app.post("/api/superadmin/organizations/:id/reset-password", requireAuth, requireSuperAdmin, async (req: Request, res: Response) => {
    const orgId = parseInt(req.params.id as string);

    try {
      const adminUser = await storage.getAdminUserByOrgId(orgId);
      
      if (!adminUser) {
        return res.status(404).json({ error: "No users found for this organization" });
      }

      const tempPassword = Math.random().toString(36).slice(-8);
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(tempPassword, salt);

      await storage.updateUserPassword(adminUser.id, hashedPassword);
      res.json({ success: true, temporaryPassword: tempPassword });
    } catch (error) {
      console.error("Password reset error:", error);
      res.status(500).json({ error: "Failed to reset password" });
    }
  });
  
  // DOMAIN A3 & C2: UPDATE PROFILE
  app.patch("/api/auth/profile", requireAuth, async (req: Request, res: Response) => {
    const { name, email, phone } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required" });
    }

    // Use the exact same standard normalizer used for Login
    const cleanPhone = normalizePhone(phone);

    try {
      await storage.updateUserProfile(req.session.userId!, { 
        name, 
        email, 
        phone: cleanPhone || undefined 
      });
      res.json({ success: true, phone: cleanPhone });
    } catch (error) {
      console.error("Profile update error:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  // DOMAIN A3 & C2: CHANGE PASSWORD
  app.post("/api/auth/change-password", requireAuth, async (req: Request, res: Response) => {
    const { currentPwd, newPwd, force } = req.body;
    
    const safeNewPwd = newPwd ? newPwd.trim() : "";

    if (!safeNewPwd || safeNewPwd.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters" });
    }

    try {
      const user = await storage.getUserById(req.session.userId!);
      if (!user) return res.status(404).json({ error: "User not found" });

      if (!force) {
        if (!currentPwd) return res.status(400).json({ error: "Current password is required" });
        const isValid = await bcrypt.compare(currentPwd, user.password);
        if (!isValid) return res.status(400).json({ error: "Incorrect current password" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(safeNewPwd, salt);

      await storage.updateUserPassword(user.id, hashedPassword);
      res.json({ success: true });
    } catch (error) {
      console.error("Password change error:", error);
      res.status(500).json({ error: "Failed to change password" });
    }
  });


  // ─── Protected Data Routes (The Vault) ───
  app.use("/api/clients", requireAuth, checkSubscription);
  app.use("/api/booking-events", requireAuth, checkSubscription);
  app.use("/api/venues", requireAuth, checkSubscription);

  // ─── Clients ───
  app.get("/api/clients", async (req, res) => {
    res.json(await storage.getAllClientsWithEvents(req.session.orgId!));
  });

  app.get("/api/clients/:id", async (req, res) => {
    const client = await storage.getClientWithEvents(req.session.orgId!, parseInt(req.params.id));
    if (!client) return res.status(404).json({ error: "Not found" });
    res.json(client);
  });

  app.post("/api/clients", async (req, res) => {
    const parsed = insertClientSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const client = await storage.createClient(req.session.orgId!, parsed.data);
    res.status(201).json(client);
  });

  app.patch("/api/clients/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const parsed = insertClientSchema.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    
    const client = await storage.updateClient(req.session.orgId!, id, parsed.data);
    if (!client) return res.status(404).json({ error: "Not found" });
    res.json(client);
  });

  app.delete("/api/clients/:id", async (req, res) => {
    const { pin } = req.body; 
    const org = await storage.getOrganization(req.session.orgId!);
    if (!org) return res.status(404).json({ error: "Organization not found" });

    if (org.deletePin !== pin) {
      return res.status(403).json({ error: "Invalid Security PIN. Deletion blocked." });
    }

    const ok = await storage.deleteClient(req.session.orgId!, parseInt(req.params.id));
    if (!ok) return res.status(404).json({ error: "Not found" });
    res.status(204).send();
  });


  // ─── Booking Events ───
  app.get("/api/booking-events", async (req, res) => {
    res.json(await storage.getBookingEvents(req.session.orgId!));
  });

  // DOMAIN B2: CONCURRENCY LOCK FOR BOOKINGS
  app.post("/api/booking-events", async (req: Request, res: Response) => {
    const parsed = insertBookingEventSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    
    const eventData = parsed.data;
    const orgId = req.session.orgId!;

    try {
      // 1. Fetch all existing events for this tenant
      const existingEvents = await storage.getBookingEvents(orgId);
      
      // 2. Check for a strict conflict (Same Venue + Same Date)
      const isConflict = existingEvents.some(
        (existing) => 
          existing.venueName === eventData.venueName && 
          existing.eventDate === eventData.eventDate
      );

      // 3. Block the transaction if a conflict exists
      if (isConflict) {
        return res.status(409).json({ 
          error: "DOUBLE_BOOKING_PREVENTED", 
          message: `${eventData.venueName} is already booked on this date.` 
        });
      }

      // 4. Save safely if the coast is clear
      const newEvent = await storage.createBookingEvent(orgId, eventData);
      res.status(201).json(newEvent);
    } catch (error) {
      console.error("Booking Error:", error);
      res.status(500).json({ error: "Failed to create booking event" });
    }
  });

  app.patch("/api/booking-events/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const parsed = insertBookingEventSchema.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    
    const event = await storage.updateBookingEvent(req.session.orgId!, id, parsed.data);
    if (!event) return res.status(404).json({ error: "Not found" });
    res.json(event);
  });

  app.delete("/api/booking-events/:id", async (req, res) => {
    const { pin } = req.body; 
    const org = await storage.getOrganization(req.session.orgId!);
    if (!org) return res.status(404).json({ error: "Organization not found" });

    if (org.deletePin !== pin) {
      return res.status(403).json({ error: "Invalid Security PIN. Deletion blocked." });
    }

    const ok = await storage.deleteBookingEvent(req.session.orgId!, parseInt(req.params.id));
    if (!ok) return res.status(404).json({ error: "Not found" });
    res.status(204).send();
  });


  // ─── Venues ───
  app.get("/api/venues", async (req, res) => {
    res.json(await storage.getVenues(req.session.orgId!));
  });

  app.post("/api/venues", async (req, res) => {
    const parsed = insertVenueSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    
    const venue = await storage.createVenue(req.session.orgId!, parsed.data);
    res.status(201).json(venue);
  });

  app.delete("/api/venues/:id", async (req, res) => {
    const ok = await storage.deleteVenue(req.session.orgId!, parseInt(req.params.id));
    if (!ok) return res.status(404).json({ error: "Not found" });
    res.status(204).send();
  });


  // ─── Profile ───
  app.get("/api/profile", requireAuth, async (req, res) => {
    const user = await storage.getUserById(req.session.userId!);
    const org = await storage.getOrganization(req.session.orgId!);
    res.json({ 
      plannerName: user?.name, 
      businessName: org?.name, 
      email: user?.email,
      setupComplete: true 
    });
  });

  // ─── Support ───
  app.post("/api/support", requireAuth, async (req, res) => {
    const { name, email, subject, message } = req.body;
    const query = await storage.createSupportQuery({
      orgId: req.session.orgId,
      name, email, subject, message,
      createdAt: new Date().toISOString()
    });
    res.status(201).json(query);
  });

  // ─── SuperAdmin Oversight Routes ───
  app.get("/api/superadmin/queries", requireAuth, requireSuperAdmin, async (req, res) => {
    res.json(await storage.getAllSupportQueries());
  });

  app.get("/api/superadmin/stats", requireAuth, requireSuperAdmin, async (req, res) => {
    const orgs = await storage.getAllOrganizations();
    const totalBookings = await storage.getGlobalBookingCount(); 
    res.json({ orgs, totalBookings });
  });

  app.patch("/api/superadmin/queries/:id/resolve", requireAuth, requireSuperAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    const query = await storage.resolveSupportQuery(id);
    if (!query) return res.status(404).json({ error: "Query not found" });
    res.json(query);
  });

  app.post("/api/superadmin/impersonate/:id", requireAuth, requireSuperAdmin, async (req, res) => {
    const targetOrgId = parseInt(req.params.id);
    const org = await storage.getOrganization(targetOrgId);
    
    if (!org) return res.status(404).json({ error: "Organization not found" });

    if (!req.session.originalOrgId) {
      req.session.originalOrgId = req.session.orgId;
    }
    
    req.session.orgId = targetOrgId; 
    res.json({ message: `Viewing workspace: ${org.name}` });
  });

  app.post("/api/superadmin/stop-impersonation", requireAuth, requireSuperAdmin, (req, res) => {
    if (req.session.originalOrgId) {
      req.session.orgId = req.session.originalOrgId; 
      req.session.originalOrgId = undefined; 
    }
    res.json({ message: "Returned to SuperAdmin HQ" });
  });

  // ─── Hindu Calendar Routes ───
  app.get("/api/calendar-events", requireAuth, async (req, res) => {
    const year = req.query.year as string | undefined;
    res.json(await storage.getHinduEvents(year));
  });

  app.post("/api/superadmin/calendar-events/bulk", requireAuth, requireSuperAdmin, async (req, res) => {
    const { events } = req.body;
    if (!Array.isArray(events)) {
      return res.status(400).json({ error: "Events must be an array" });
    }

    const validEvents = [];
    for (const ev of events) {
      const parsed = insertHinduEventSchema.safeParse(ev);
      if (parsed.success) validEvents.push(parsed.data);
    }

    await storage.bulkInsertHinduEvents(validEvents);
    res.json({ message: `Successfully synced ${validEvents.length} calendar events.` });
  });
}

// import type { Express, Request, Response, NextFunction } from "express";
// import { createServer } from "http";
// import { storage } from "./storage";
// import { 
//   insertClientSchema, 
//   insertBookingEventSchema, 
//   insertVenueSchema,
//   insertSupportQuerySchema,
//   insertHinduEventSchema
// } from "@shared/schema";
// import session from "express-session";
// import connectSqlite3 from "connect-sqlite3";
// import bcrypt from "bcryptjs";

// const SQLiteStore = connectSqlite3(session);

// // ─── Types ────────────────────────────────────────────────────────────────────
// declare module "express-session" {
//   interface SessionData {
//     userId: number;
//     orgId: number;
//     role: string;
//     originalOrgId?: number;
//   }
// }

// // ─── Middleware ───────────────────────────────────────────────────────────────
// function requireAuth(req: Request, res: Response, next: NextFunction) {
//   if (!req.session || !req.session.userId || !req.session.orgId) {
//     return res.status(401).json({ error: "Unauthorized. Please log in." });
//   }
//   next();
// }

// function requireSuperAdmin(req: Request, res: Response, next: NextFunction) {
//   if (!req.session || req.session.role !== "superadmin") {
//     return res.status(403).json({ error: "Forbidden: SuperAdmin access required." });
//   }
//   next();
// }

// // ⚠️ NOW ASYNC: We have to wait for the network to fetch the Org status
// async function checkSubscription(req: Request, res: Response, next: NextFunction) {
//   if (req.session.role === "superadmin") return next();
//   try {
//     const org = await storage.getOrganization(req.session.orgId!);
//     if (!org) return res.status(401).json({ error: "Organization not found." });

//     if (!org.isPaid && org.trialExpires) {
//       const expires = new Date(org.trialExpires).getTime();
//       if (Date.now() > expires) {
//         return res.status(403).json({ 
//           error: "SUBSCRIPTION_EXPIRED", 
//           message: "Your trial has expired. Please contact support to upgrade." 
//         });
//       }
//     }
//     next();
//   } catch (error) {
//     res.status(500).json({ error: "Database connection error" });
//   }
// }

// function normalizePhone(phone: string | undefined | null) {
//   if (!phone) return null;
//   const digits = phone.replace(/\D/g, "");
//   return digits.slice(-10);
// }

// export function registerRoutes(httpServer: ReturnType<typeof createServer>, app: Express) {
  
//   // ─── Session Setup ───
//   // Note: For a multi-server production environment, you may want to swap SQLiteStore 
//   // for a MySQL session store or Redis later!
//   app.use(session({
//     store: new SQLiteStore({ dir: './', db: 'sessions.db', concurrentDB: true }),
//     secret: process.env.SESSION_SECRET || 'bandhan_super_secret_dev_key_change_in_prod',
//     resave: false,
//     saveUninitialized: false,
//     cookie: { 
//       maxAge: 30 * 24 * 60 * 60 * 1000, 
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production'
//     }
//   }));

//   // ─── Authentication Routes ───
//   app.post("/api/auth/login", async (req, res) => {
//     const { email, password } = req.body;
//     if (!email || !password) return res.status(400).json({ error: "Missing email or password" });

//     const user = await storage.getUserByEmail(email.toLowerCase().trim());
//     if (!user) return res.status(401).json({ error: "Invalid credentials" });

//     const isValid = await bcrypt.compare(password, user.password);
//     if (!isValid) return res.status(401).json({ error: "Invalid credentials" });

//     req.session.userId = user.id;
//     req.session.orgId = user.orgId!;
//     req.session.role = user.role;

//     res.json({ message: "Logged in successfully", user: { id: user.id, name: user.name, email: user.email, role: user.role } });
//   });

//   app.post("/api/auth/send-otp", async (req, res) => {
//     const { phone } = req.body;
//     if (!phone) return res.status(400).json({ error: "Phone number required" });
//     const cleanPhone = normalizePhone(phone);
    
//     const user = await storage.getUserByPhone(cleanPhone!);
//     if (!user) return res.status(404).json({ error: "No account found with this phone number." });

//     res.json({ message: "OTP Sent successfully. (Use 123456 for testing)" });
//   });

//   app.post("/api/auth/verify-otp", async (req, res) => {
//     const { phone, otp } = req.body;
//     if (!phone || !otp) return res.status(400).json({ error: "Phone and OTP required" });
//     const cleanPhone = normalizePhone(phone);

//     const user = await storage.getUserByPhone(cleanPhone!);
//     if (!user) return res.status(404).json({ error: "Account not found." });
//     if (otp !== "123456") return res.status(401).json({ error: "Invalid OTP code." });

//     req.session.userId = user.id;
//     req.session.orgId = user.orgId!;
//     req.session.role = user.role;

//     res.json({ message: "Logged in via Phone", user: { id: user.id, name: user.name, role: user.role } });
//   });

//   app.post("/api/auth/logout", (req, res) => {
//     req.session.destroy(() => {
//       res.json({ message: "Logged out successfully" });
//     });
//   });

//   app.get("/api/auth/me", requireAuth, async (req, res) => {
//     const user = await storage.getUserById(req.session.userId!);
//     const org = await storage.getOrganization(req.session.orgId!);

//     if (!user || !org) return res.status(404).json({ error: "Not found" });
    
//     const { password, ...safeUser } = user;
//     res.json({ 
//       user: safeUser, 
//       organization: org,
//       isImpersonating: !!req.session.originalOrgId
//     });
//   });

//   // ─── SuperAdmin Dashboard Routes ───
//   app.post("/api/superadmin/organizations", requireAuth, requireSuperAdmin, async (req, res) => {
//     const { orgName, adminName, adminEmail, adminPassword, adminPhone, trialDays = 14, deletePin } = req.body;

//     if (!orgName || !adminName || !adminEmail || !adminPassword || !deletePin) {
//       return res.status(400).json({ error: "Missing required fields, including Delete PIN." });
//     }
//     if (deletePin.length !== 6) {
//       return res.status(400).json({ error: "Delete PIN must be exactly 6 digits." });
//     }

//     const safeEmail = adminEmail.toLowerCase().trim();
//     const safePhone = normalizePhone(adminPhone);

//     const existingEmail = await storage.getUserByEmail(safeEmail);
//     if (existingEmail) {
//       return res.status(400).json({ error: "Email already in use." });
//     }
    
//     if (safePhone) {
//       const existingPhone = await storage.getUserByPhone(safePhone);
//       if (existingPhone) return res.status(400).json({ error: "Phone number already linked." });
//     }

//     try {
//       const trialDate = new Date();
//       trialDate.setDate(trialDate.getDate() + trialDays);
      
//       const newOrg = await storage.createOrganization(orgName, trialDate.toISOString(), deletePin);
      
//       const salt = await bcrypt.genSalt(10);
//       const hashedPassword = await bcrypt.hash(adminPassword, salt);
      
//       const newAdmin = await storage.createUser({
//         orgId: newOrg.id,
//         name: adminName,
//         email: safeEmail,
//         password: hashedPassword,
//         phone: safePhone, 
//         role: "admin" 
//       });

//       res.status(201).json({ 
//         message: "Organization provisioned successfully.", 
//         organization: newOrg,
//         adminUser: { id: newAdmin.id, email: newAdmin.email }
//       });
//     } catch (err) {
//       res.status(500).json({ error: "Failed to provision tenant." });
//     }
//   });
  
//   // DOMAIN A3 & C2: UPDATE PROFILE
//   app.patch("/api/auth/profile", requireAuth, async (req: Request, res: Response) => {
//     const { name, email, phone } = req.body;
    
//     if (!name || !email) {
//       return res.status(400).json({ error: "Name and email are required" });
//     }

//     // FIX 1: Clean the phone number BEFORE saving it to the DB
//     // This ensures it exactly matches the 10-digit format the login route searches for.
//     let cleanPhone = null;
//     if (phone) {
//       cleanPhone = phone.replace(/\D/g, "").slice(-10);
//     }

//     try {
//       const targetUserId = Number(req.session.userId);
//       await storage.updateUserProfile(targetUserId, { name, email, phone: cleanPhone });
//       res.json({ success: true, phone: cleanPhone });
//     } catch (error) {
//       console.error("Profile update error:", error);
//       res.status(500).json({ error: "Failed to update profile" });
//     }
//   });

//   // DOMAIN A3 & C2: CHANGE PASSWORD
//   app.post("/api/auth/change-password", requireAuth, async (req: Request, res: Response) => {
//     const { currentPwd, newPwd, force } = req.body;
    
//     // FIX 2: Strip accidental trailing/leading spaces from the password
//     const safeNewPwd = newPwd ? newPwd.trim() : "";

//     if (!safeNewPwd || safeNewPwd.length < 6) {
//       return res.status(400).json({ error: "New password must be at least 6 characters" });
//     }

//     try {
//       // FIX 3: Force the session ID to be a strict Number to guarantee a MySQL match
//       const targetUserId = Number(req.session.userId);
//       const user = await storage.getUserById(targetUserId);
      
//       if (!user) return res.status(404).json({ error: "User not found" });

//       if (!force) {
//         if (!currentPwd) return res.status(400).json({ error: "Current password is required" });
//         const isValid = await bcrypt.compare(currentPwd, user.password);
//         if (!isValid) return res.status(400).json({ error: "Incorrect current password" });
//       }

//       const salt = await bcrypt.genSalt(10);
//       const hashedPassword = await bcrypt.hash(safeNewPwd, salt);

//       // Save the new hashed password
//       await storage.updateUserPassword(targetUserId, hashedPassword);
      
//       res.json({ success: true });
//     } catch (error) {
//       console.error("Password change error:", error);
//       res.status(500).json({ error: "Failed to change password" });
//     }
//   });


//   // ─── Protected Data Routes (The Vault) ───
//   app.use("/api/clients", requireAuth, checkSubscription);
//   app.use("/api/booking-events", requireAuth, checkSubscription);
//   app.use("/api/venues", requireAuth, checkSubscription);

//   // ─── Clients ───
//   app.get("/api/clients", async (req, res) => {
//     res.json(await storage.getAllClientsWithEvents(req.session.orgId!));
//   });

//   app.get("/api/clients/:id", async (req, res) => {
//     const client = await storage.getClientWithEvents(req.session.orgId!, parseInt(req.params.id));
//     if (!client) return res.status(404).json({ error: "Not found" });
//     res.json(client);
//   });

//   app.post("/api/clients", async (req, res) => {
//     const parsed = insertClientSchema.safeParse(req.body);
//     if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
//     const client = await storage.createClient(req.session.orgId!, parsed.data);
//     res.status(201).json(client);
//   });

//   app.patch("/api/clients/:id", async (req, res) => {
//     const id = parseInt(req.params.id);
//     const parsed = insertClientSchema.partial().safeParse(req.body);
//     if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    
//     const client = await storage.updateClient(req.session.orgId!, id, parsed.data);
//     if (!client) return res.status(404).json({ error: "Not found" });
//     res.json(client);
//   });

//   app.delete("/api/clients/:id", async (req, res) => {
//     const { pin } = req.body; 
//     const org = await storage.getOrganization(req.session.orgId!);
//     if (!org) return res.status(404).json({ error: "Organization not found" });

//     if (org.deletePin !== pin) {
//       return res.status(403).json({ error: "Invalid Security PIN. Deletion blocked." });
//     }

//     const ok = await storage.deleteClient(req.session.orgId!, parseInt(req.params.id));
//     if (!ok) return res.status(404).json({ error: "Not found" });
//     res.status(204).send();
//   });


//   // ─── Booking Events ───
//   app.get("/api/booking-events", async (req, res) => {
//     res.json(await storage.getBookingEvents(req.session.orgId!));
//   });

//   app.post("/api/booking-events", async (req, res) => {
//     const parsed = insertBookingEventSchema.safeParse(req.body);
//     if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    
//     const event = await storage.createBookingEvent(req.session.orgId!, parsed.data);
//     res.status(201).json(event);
//   });

//   app.patch("/api/booking-events/:id", async (req, res) => {
//     const id = parseInt(req.params.id);
//     const parsed = insertBookingEventSchema.partial().safeParse(req.body);
//     if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    
//     const event = await storage.updateBookingEvent(req.session.orgId!, id, parsed.data);
//     if (!event) return res.status(404).json({ error: "Not found" });
//     res.json(event);
//   });

//   app.delete("/api/booking-events/:id", async (req, res) => {
//     const { pin } = req.body; 
//     const org = await storage.getOrganization(req.session.orgId!);
//     if (!org) return res.status(404).json({ error: "Organization not found" });

//     if (org.deletePin !== pin) {
//       return res.status(403).json({ error: "Invalid Security PIN. Deletion blocked." });
//     }

//     const ok = await storage.deleteBookingEvent(req.session.orgId!, parseInt(req.params.id));
//     if (!ok) return res.status(404).json({ error: "Not found" });
//     res.status(204).send();
//   });


//   // ─── Venues ───
//   app.get("/api/venues", async (req, res) => {
//     res.json(await storage.getVenues(req.session.orgId!));
//   });

//   app.post("/api/venues", async (req, res) => {
//     const parsed = insertVenueSchema.safeParse(req.body);
//     if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    
//     const venue = await storage.createVenue(req.session.orgId!, parsed.data);
//     res.status(201).json(venue);
//   });

//   app.delete("/api/venues/:id", async (req, res) => {
//     const ok = await storage.deleteVenue(req.session.orgId!, parseInt(req.params.id));
//     if (!ok) return res.status(404).json({ error: "Not found" });
//     res.status(204).send();
//   });


//   // ─── Profile ───
//   app.get("/api/profile", requireAuth, async (req, res) => {
//     const user = await storage.getUserById(req.session.userId!);
//     const org = await storage.getOrganization(req.session.orgId!);
//     res.json({ 
//       plannerName: user?.name, 
//       businessName: org?.name, 
//       email: user?.email,
//       setupComplete: true 
//     });
//   });

//   // ─── Support ───
//   app.post("/api/support", requireAuth, async (req, res) => {
//     const { name, email, subject, message } = req.body;
//     const query = await storage.createSupportQuery({
//       orgId: req.session.orgId,
//       name, email, subject, message,
//       createdAt: new Date().toISOString()
//     });
//     res.status(201).json(query);
//   });

//   // ─── SuperAdmin Oversight Routes ───
//   app.get("/api/superadmin/queries", requireAuth, requireSuperAdmin, async (req, res) => {
//     res.json(await storage.getAllSupportQueries());
//   });

//   app.get("/api/superadmin/stats", requireAuth, requireSuperAdmin, async (req, res) => {
//     const orgs = await storage.getAllOrganizations();
//     const totalBookings = await storage.getGlobalBookingCount(); 
//     res.json({ orgs, totalBookings });
//   });

//   app.patch("/api/superadmin/queries/:id/resolve", requireAuth, requireSuperAdmin, async (req, res) => {
//     const id = parseInt(req.params.id);
//     const query = await storage.resolveSupportQuery(id);
//     if (!query) return res.status(404).json({ error: "Query not found" });
//     res.json(query);
//   });

//   app.patch("/api/superadmin/organizations/:id/trial", requireAuth, requireSuperAdmin, async (req, res) => {
//     const orgId = parseInt(req.params.id);
//     const { daysToAdd } = req.body;

//     const org = await storage.getOrganization(orgId);
//     if (!org) return res.status(404).json({ error: "Organization not found" });

//     const currentExpiry = org.trialExpires ? new Date(org.trialExpires) : new Date();
//     currentExpiry.setDate(currentExpiry.getDate() + daysToAdd);

//     await storage.updateOrganizationTrial(orgId, currentExpiry.toISOString());
    
//     res.json({ message: `Trial adjusted by ${daysToAdd} days` });
//   });

//   app.post("/api/superadmin/impersonate/:id", requireAuth, requireSuperAdmin, async (req, res) => {
//     const targetOrgId = parseInt(req.params.id);
//     const org = await storage.getOrganization(targetOrgId);
    
//     if (!org) return res.status(404).json({ error: "Organization not found" });

//     if (!req.session.originalOrgId) {
//       req.session.originalOrgId = req.session.orgId;
//     }
    
//     req.session.orgId = targetOrgId; 
//     res.json({ message: `Viewing workspace: ${org.name}` });
//   });

//   app.post("/api/superadmin/stop-impersonation", requireAuth, requireSuperAdmin, (req, res) => {
//     if (req.session.originalOrgId) {
//       req.session.orgId = req.session.originalOrgId; 
//       req.session.originalOrgId = undefined; 
//     }
//     res.json({ message: "Returned to SuperAdmin HQ" });
//   });

//   // ─── Hindu Calendar Routes ───
//   app.get("/api/calendar-events", requireAuth, async (req, res) => {
//     const year = req.query.year as string | undefined;
//     res.json(await storage.getHinduEvents(year));
//   });

//   app.post("/api/superadmin/calendar-events/bulk", requireAuth, requireSuperAdmin, async (req, res) => {
//     const { events } = req.body;
//     if (!Array.isArray(events)) {
//       return res.status(400).json({ error: "Events must be an array" });
//     }

//     const validEvents = [];
//     for (const ev of events) {
//       const parsed = insertHinduEventSchema.safeParse(ev);
//       if (parsed.success) validEvents.push(parsed.data);
//     }

//     await storage.bulkInsertHinduEvents(validEvents);
//     res.json({ message: `Successfully synced ${validEvents.length} calendar events.` });
//   });
// }
