// import { Switch, Route, Router } from "wouter";
// import { useHashLocation } from "wouter/use-hash-location";
// import { QueryClientProvider } from "@tanstack/react-query";
// import { queryClient } from "./lib/queryClient";
// import { Toaster } from "@/components/ui/toaster";
// import CalendarPage from "./pages/CalendarPage";
// import BookingsPage from "./pages/BookingsPage";
// import VenuesPage from "./pages/VenuesPage";
// import VenueCalendarPage from "./pages/VenueCalendarPage";
// import LandingPage from "./pages/LandingPage";
// import ProfilePage from "./pages/ProfilePage";
// import AuthPage from "./pages/AuthPage";
// import PricingPage from "./pages/PricingPage";
// import SettingsPage from "./pages/SettingsPage";
// import DashboardPage from "./pages/DashboardPage";
// import NotFound from "./pages/not-found";
// import Sidebar from "./components/Sidebar";

// // Pages that show inside the main app shell (sidebar + content area)
// function AppShell() {
//   return (
//     <div className="flex h-screen overflow-hidden bg-background">
//       <Sidebar />
//       <main className="flex-1 overflow-auto">
//         <Switch>
//           <Route path="/app/dashboard" component={DashboardPage} />
//           <Route path="/app/bookings" component={BookingsPage} />
//           <Route path="/app/venues/:id/calendar" component={VenueCalendarPage} />
//           <Route path="/app/venues" component={VenuesPage} />
//           <Route path="/app/settings" component={SettingsPage} />
//           <Route path="/app" component={CalendarPage} />
//           <Route component={NotFound} />
//         </Switch>
//       </main>
//     </div>
//   );
// }

// function App() {
//   return (
//     <QueryClientProvider client={queryClient}>
//       <Router hook={useHashLocation}>
//         <Switch>
//           {/* Full-page routes — no sidebar */}
//           <Route path="/" component={LandingPage} />
//           <Route path="/auth" component={AuthPage} />
//           <Route path="/pricing" component={PricingPage} />
//           <Route path="/profile" component={ProfilePage} />
//           {/* App shell — must match all /app/* variants */}
//           <Route path="/app/venues/:id/calendar" component={AppShell} />
//           <Route path="/app" component={AppShell} />
//           <Route path="/app/:rest*" component={AppShell} />
//           <Route component={NotFound} />
//         </Switch>
//         <Toaster />
//       </Router>
//     </QueryClientProvider>
//   );
// }

// export default App;


import { useEffect } from "react";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import SubscriptionExpired from "./pages/SubscriptionExpired";
import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { queryClient, apiRequest } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import CalendarPage from "./pages/CalendarPage";
import BookingsPage from "./pages/BookingsPage";
import VenuesPage from "./pages/VenuesPage";
import VenueCalendarPage from "./pages/VenueCalendarPage";
import LandingPage from "./pages/LandingPage";
import ProfilePage from "./pages/ProfilePage";
import AuthPage from "./pages/AuthPage";
import PricingPage from "./pages/PricingPage";
import SettingsPage from "./pages/SettingsPage";
import DashboardPage from "./pages/DashboardPage";
import NotFound from "./pages/not-found";
import Sidebar from "./components/Sidebar";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

// ── Auth Guard Wrapper ───────────────────────────────────────────────────────
// ── Auth Guard Wrapper ───────────────────────────────────────────────────────
function ProtectedRoute({ component: Component }: { component: React.ComponentType<any> }) {
  const [, navigate] = useHashLocation();

  // ── SESSION LOCK BOUNCER ──
  useEffect(() => {
    const requiresLock = localStorage.getItem("requires_session_lock") === "true";
    const isSessionActive = sessionStorage.getItem("session_active") === "true";

    // If the browser restored the tab, sessionStorage will be empty but localStorage will still have the lock.
    if (requiresLock && !isSessionActive) {
      // Fire the kill-switch to the backend, clear the cache, and kick them out.
      apiRequest("POST", "/api/auth/logout").catch(() => {}).finally(() => {
        queryClient.clear();
        localStorage.removeItem("requires_session_lock");
        navigate("/auth");
      });
    }
  }, [navigate]);
  
  const { isLoading, error, data } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/auth/me");
          
      const payload = await res.json();

      const isSuperAdmin = payload.user?.role === "superadmin";
      const org = payload.organization;
      
      if (!isSuperAdmin && org && !org.isPaid && org.trialExpires) {
        // Force local timezone extraction to prevent premature UTC lockouts
        const today = new Date();
        const localToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
        
        const exp = new Date(org.trialExpires);
        const localExp = `${exp.getFullYear()}-${String(exp.getMonth() + 1).padStart(2, "0")}-${String(exp.getDate()).padStart(2, "0")}`;

        // String comparison perfectly evaluates YYYY-MM-DD dates
        if (localToday > localExp) {
          navigate("/expired");
          throw new Error("EXPIRED");
        }
      }

      return payload;
    },
    retry: false,
  });

  useEffect(() => {
    if (error && error.message !== "EXPIRED") {
      navigate("/auth");
    }
  }, [error, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div 
          className="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin" 
          style={{ borderColor: "hsl(210,69%,16%, 0.2)", borderTopColor: "hsl(210,69%,16%)" }} 
        />
      </div>
    );
  }

  if (error || !data) return null;

  return <Component />;
}

// ── App Shell ────────────────────────────────────────────────────────────────
// Pages that show inside the main app shell (sidebar + content area)
// ── App Shell ────────────────────────────────────────────────────────────────
function AppShell() {
  return (
    <div className="flex h-screen overflow-hidden bg-background md:flex-row flex-col">
      
      {/* 📱 MOBILE HEADER (Hidden on Desktop) */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-card flex-shrink-0 z-10">
        <div className="flex items-center gap-2">
          <svg aria-label="Bandhan & Co." viewBox="0 0 32 32" fill="none" width="24" height="24">
            <rect width="32" height="32" rx="6" fill="hsl(210,69%,16%)"/>
            <path d="M9 7 L9 25 L18 25 C21.5 25 24 23 24 20 C24 18 22.5 16.5 20.5 16 C22 15.3 23 13.8 23 12 C23 9.2 20.8 7 18 7 Z" fill="none" stroke="#C8A45D" strokeWidth="1.6" strokeLinejoin="round"/>
            <ellipse cx="16" cy="16" rx="4.5" ry="2.2" stroke="#C8A45D" strokeWidth="1.3" fill="none" opacity="0.85"/>
            <ellipse cx="16" cy="16" rx="2.2" ry="4.5" stroke="#C8A45D" strokeWidth="1.3" fill="none" opacity="0.85"/>
            <circle cx="16" cy="16" r="1.2" fill="#C8A45D"/>
          </svg>
          <h1 className="font-semibold text-sm text-foreground" style={{ fontFamily: "Playfair Display, serif" }}>
            Bandhan <span style={{ color: "hsl(38,49%,57%)" }}>& Co.</span>
          </h1>
        </div>
        
        {/* Mobile Hamburger Drawer */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="-mr-2">
              <Menu size={22} className="text-foreground" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-52 border-r-0">
            <Sidebar />
          </SheetContent>
        </Sheet>
      </div>

      {/* 💻 DESKTOP SIDEBAR (Hidden on Mobile) */}
      <div className="hidden md:block h-full flex-shrink-0">
        <Sidebar />
      </div>

      {/* ── Main Content Area ── */}
      <main className="flex-1 overflow-auto w-full">
        <Switch>
          <Route path="/app/dashboard" component={DashboardPage} />
          <Route path="/app/bookings" component={BookingsPage} />
          <Route path="/app/venues/:id/calendar" component={VenueCalendarPage} />
          <Route path="/app/venues" component={VenuesPage} />
          <Route path="/app/settings" component={SettingsPage} />
          <Route path="/app" component={CalendarPage} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

// ── Main App Component ───────────────────────────────────────────────────────
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router hook={useHashLocation}>
        <Switch>
          {/* Public Routes */}
          <Route path="/" component={LandingPage} />
          <Route path="/auth" component={AuthPage} />
          <Route path="/pricing" component={PricingPage} />
          <Route path="/expired" component={SubscriptionExpired} />
          
          {/* Protected Routes (Wrapped in our Auth Guard) */}
          <Route path="/profile">
            {() => <ProtectedRoute component={ProfilePage} />}
          </Route>

          <Route path="/app/superadmin">
            {() => <ProtectedRoute component={SuperAdminDashboard} />}
          </Route>
          
          {/* Protected App Shell — matches all /app/* variants */}
          <Route path="/app/venues/:id/calendar">
            {() => <ProtectedRoute component={AppShell} />}
          </Route>
          <Route path="/app">
            {() => <ProtectedRoute component={AppShell} />}
          </Route>
          <Route path="/app/:rest*">
            {() => <ProtectedRoute component={AppShell} />}
          </Route>
          
          {/* 404 */}
          <Route component={NotFound} />
        </Switch>
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
}

export default App;