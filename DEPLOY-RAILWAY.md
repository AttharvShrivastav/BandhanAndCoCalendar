# Vivah Wedding Calendar — Railway Deployment Guide

Deploy your Vivah wedding calendar to Railway so it syncs across all your devices (phone, laptop, tablet). Once deployed, anyone with the URL can access the same calendar and bookings in real time.

---

## Prerequisites

- A **GitHub account** (free) — [github.com](https://github.com)
- A **Railway account** (free tier available) — [railway.com](https://railway.com)

---

## Step 1: Push Code to GitHub

1. Go to [github.com/new](https://github.com/new) and create a new repository
   - Name: `vivah-wedding-calendar` (or whatever you prefer)
   - Set it to **Private** (recommended since it contains your business tool)
   - Do NOT add a README or .gitignore (we already have one)

2. Open a terminal in the project folder and run:

```bash
git init
git add .
git commit -m "Vivah wedding calendar - initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/vivah-wedding-calendar.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

---

## Step 2: Create a Railway Project

1. Go to [railway.com](https://railway.com) and sign in with GitHub
2. Click **"New Project"** → **"Deploy from GitHub Repo"**
3. Select your `vivah-wedding-calendar` repository
4. Railway will detect the Dockerfile and begin building automatically

---

## Step 3: Add a Persistent Volume (Important!)

Your calendar data is stored in an SQLite database file. Without a volume, data resets on every deployment. To make it persistent:

1. In your Railway project dashboard, click on your service (the deployed app)
2. Go to the **"Volumes"** tab (or click **"+ New"** → **"Volume"**)
3. Add a volume with these settings:
   - **Mount Path**: `/data`
   - **Name**: `vivah-data` (or anything you like)
4. Click **"Add"**

---

## Step 4: Set Environment Variables

1. In your Railway service, go to the **"Variables"** tab
2. Add the following variable:

| Variable        | Value                          |
|-----------------|--------------------------------|
| `DATABASE_PATH` | `/data/wedding_calendar.db`    |

This tells the app to store the SQLite database inside the persistent volume so your data survives redeployments.

> Railway automatically sets the `PORT` variable, so you don't need to add it.

---

## Step 5: Deploy

1. Railway should auto-deploy after you set the variables. If not, click **"Deploy"** or push a new commit.
2. Once the build finishes (usually 1–2 minutes), go to the **"Settings"** tab
3. Under **"Networking"**, click **"Generate Domain"** to get a public URL like:
   `https://vivah-wedding-calendar-production.up.railway.app`

---

## Step 6: Access from Any Device

Open the Railway URL on any device — phone, laptop, tablet — and all your calendar data, bookings, venues, and client information will be synced in real time. Any changes made on one device appear immediately on all others.

**Tip:** Add the URL to your phone's home screen for quick access:
- **iPhone**: Open in Safari → Share → "Add to Home Screen"
- **Android**: Open in Chrome → Menu (⋮) → "Add to Home screen"

---

## Updating the App

When you make changes to the code:

```bash
git add .
git commit -m "your update message"
git push
```

Railway will automatically rebuild and redeploy. Your data stays safe in the persistent volume.

---

## Costs

Railway's free tier includes:
- **$5 of credit per month** (no credit card needed to start)
- This is more than enough for a personal/small business tool like Vivah

If you need more, Railway's Hobby plan is **$5/month** with generous limits.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Data disappears after redeployment | Make sure the volume is attached and `DATABASE_PATH` is set to `/data/wedding_calendar.db` |
| App doesn't start | Check Railway build logs for errors. Make sure all files are committed and pushed. |
| Can't access from phone | Make sure you generated a public domain under Settings → Networking |
| Build fails | Try clicking "Redeploy" — sometimes transient issues cause failures |

---

## File Structure Reference

```
wedding-calendar/
├── Dockerfile              ← Railway build instructions
├── package.json            ← Has "start" script for production
├── server/
│   ├── index.ts            ← Express server (reads PORT env)
│   ├── routes.ts           ← API endpoints
│   └── storage.ts          ← SQLite (reads DATABASE_PATH env)
├── client/src/             ← React frontend
│   ├── pages/
│   │   ├── CalendarPage    ← Hindu dates + event calendar
│   │   ├── BookingsPage    ← Client & event management
│   │   └── VenuesPage      ← Venue directory
│   └── lib/hinduDates.ts   ← 55+ muhurats, 30+ festivals
└── shared/schema.ts        ← Database schema
```
