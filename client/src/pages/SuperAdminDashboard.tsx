import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ShieldAlert, Building2, User, Mail, Lock, Calendar, 
  LogOut, Phone, Inbox, LayoutGrid, CheckCircle2, AlertCircle,
  CalendarDays, FileJson, Key
} from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";

export default function SuperAdminDashboard() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"provision" | "directory" | "inbox" | "panchang" | "account">("provision");
  
  const [saName, setSaName] = useState("");
  const [saEmail, setSaEmail] = useState("");
  const [saPhone, setSaPhone] = useState("");
  const [saNewPassword, setSaNewPassword] = useState("");

  const queryClient = useQueryClient(); // <-- THIS IS THE MISSING LINK

  const { data: authData } = useQuery<{ user: { name: string; email: string; phone: string | null } }>({ 
    queryKey: ["/api/auth/me"] 
  });

  useEffect(() => {
    if (authData?.user) {
      setSaName(authData.user.name || "");
      setSaEmail(authData.user.email || "");
      setSaPhone(authData.user.phone || "");
    }
  }, [authData?.user]);

  // ── Form State ──
  const [orgName, setOrgName] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPhone, setAdminPhone] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [trialDays, setTrialDays] = useState(14);
  const [deletePin, setDeletePin] = useState(""); 
  const [extendDays, setExtendDays] = useState<Record<number, string>>({});
  const [queryFilter, setQueryFilter] = useState<"open" | "resolved" | "all">("open");
  const [jsonInput, setJsonInput] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [resetModal, setResetModal] = useState<{orgName: string, password: string} | null>(null);
  
  // ── Fetch SuperAdmin Data ──
  const { data: statsData } = useQuery<{ orgs: any[], totalBookings: number }>({ queryKey: ["/api/superadmin/stats"] });
  const { data: queriesData } = useQuery<any[]>({ queryKey: ["/api/superadmin/queries"] });

  const organizations = statsData?.orgs || [];
  const supportQueries = queriesData || [];
  
  // ── NEW: Filtered Queries ──
  const filteredQueries = supportQueries.filter(q => 
    queryFilter === "all" ? true : q.status === queryFilter
  );

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    queryClient.setQueryData(["/api/auth/me"], null);
    navigate("/auth");
  }

  async function handleProvision(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/superadmin/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgName, adminName, adminEmail, adminPassword, adminPhone, trialDays, deletePin }), // <-- ADD deletePin here
      });

      const data = await res.json();

      if (!res.ok) {
        toast({ title: "Provisioning Failed", description: data.error, variant: "destructive" });
        return;
      }

      toast({ title: "Tenant Provisioned!", description: `${orgName} has been created.` });

      setOrgName(""); setAdminName(""); setAdminEmail(""); setAdminPassword(""); setAdminPhone(""); setDeletePin("")
      queryClient.invalidateQueries({ queryKey: ["/api/superadmin/stats"] });
      setActiveTab("directory");
    } catch (err) {
      toast({ title: "Network Error", description: "Could not reach the server.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function handleImpersonate(orgId: number, orgName: string) {
    try {
      const res = await fetch(`/api/superadmin/impersonate/${orgId}`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to enter workspace");
      
      // Wipe the frontend memory clean so it fetches the new organization's data!
      queryClient.clear(); 
      
      toast({ title: "Workspace Active", description: `You are now viewing data for ${orgName}.` });
      navigate("/app"); // Send Rhythm to the main calendar view!
    } catch (e) {
      toast({ title: "Error", description: "Could not enter workspace.", variant: "destructive" });
    }
  }

  async function handleSyncCalendar() {
    if (!jsonInput.trim()) {
      toast({ title: "Empty Input", description: "Please paste the JSON array first.", variant: "destructive" });
      return;
    }

    setIsSyncing(true);
    try {
      // 1. Verify it's actually valid JSON before sending to the server
      const parsedData = JSON.parse(jsonInput);
      
      if (!Array.isArray(parsedData)) {
        throw new Error("The JSON must be an array [ ... ] of events.");
      }

      // 2. Send it to the SuperAdmin bulk route
      const res = await fetch("/api/superadmin/calendar-events/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ events: parsedData })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to sync calendar.");
      }

      toast({ title: "Calendar Synced!", description: "The dates are now live for all tenants." });
      setJsonInput(""); // Clear the box on success
    } catch (e: any) {
      toast({ title: "Invalid Data", description: e.message, variant: "destructive" });
    } finally {
      setIsSyncing(false);
    }
  }

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      <header className="px-4 md:px-6 py-4 border-b border-border bg-card flex flex-col md:flex-row items-start md:items-center justify-between flex-shrink-0 gap-4 md:gap-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-destructive/10">
            <ShieldAlert size={20} className="text-destructive" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-semibold text-destructive" style={{ fontFamily: "Playfair Display, serif" }}>SuperAdmin HQ</h2>
            <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5">Global oversight and tenant management.</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-foreground w-full md:w-auto">
          <LogOut size={14} className="mr-1.5" /> Sign Out
        </Button>
      </header>

      <div className="flex border-b border-border bg-card px-4 md:px-6 gap-1 flex-shrink-0 overflow-x-auto scrollbar-hide">
        {[
          { key: "provision" as const, label: "Provision Tenant", icon: Building2 },
          { key: "directory" as const, label: "Tenant Directory", icon: LayoutGrid },
          { key: "inbox" as const, label: "Support Inbox", icon: Inbox },
          { key: "panchang" as const, label: "Panchang Data", icon: CalendarDays },
          { key: "account" as const, label: "My Account", icon: User }, // <-- ADD THIS
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className="flex items-center gap-2 px-3 md:px-4 py-3 text-sm font-medium transition-colors relative whitespace-nowrap"
            style={{ color: activeTab === key ? "hsl(var(--destructive))" : "hsl(var(--muted-foreground))" }}
          >
            <Icon size={14} />
            {label}
            {key === "inbox" && supportQueries.filter(q => q.status === "open").length > 0 && (
              <span className="ml-1 bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {supportQueries.filter(q => q.status === "open").length}
              </span>
            )}
            {activeTab === key && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full bg-destructive" />
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto p-4 md:p-6">
        
        {/* TAB 1: PROVISIONING */}
        {activeTab === "provision" && (
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleProvision} className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-border bg-muted/30">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Building2 size={16} className="text-muted-foreground" />
                  Create New Tenant Workspace
                </h3>
              </div>
              <div className="p-4 md:p-6 space-y-5">
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Organization / Business Name</label>
                  <div className="relative">
                    <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input required value={orgName} onChange={e => setOrgName(e.target.value)} placeholder="e.g., The Taj Mahal Palace" className="pl-9" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1.5">Admin Contact Name</label>
                    <div className="relative">
                      <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input required value={adminName} onChange={e => setAdminName(e.target.value)} placeholder="e.g., Anjali Desai" className="pl-9" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1.5">Admin Email (Login ID)</label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input required type="email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} placeholder="anjali@taj.com" className="pl-9" />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1.5">Temporary Password</label>
                    <div className="relative">
                      <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input required type="text" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} placeholder="Secure string..." className="pl-9" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1.5">6-Digit Security PIN</label>
                    <div className="relative">
                      <Key size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input 
                        required 
                        type="text" 
                        maxLength={6}
                        pattern="\d{6}"
                        value={deletePin} 
                        onChange={e => setDeletePin(e.target.value.replace(/\D/g, ''))} 
                        placeholder="e.g. 123456" 
                        className="pl-9 font-mono" 
                      />
                    </div>
                  </div>
                  <div className="md:col-span-1">
                    <label className="text-xs font-medium text-muted-foreground block mb-1.5">Admin Phone</label>
                    <div className="relative">
                      <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input type="tel" value={adminPhone} onChange={e => setAdminPhone(e.target.value)} placeholder="+91 98765 43210" className="pl-9" />
                    </div>
                  </div>
                  <div className="md:col-span-3">
                    <label className="text-xs font-medium text-muted-foreground block mb-1.5">Trial Duration (Days)</label>
                    <div className="relative">
                      <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input required type="number" value={trialDays} onChange={e => setTrialDays(parseInt(e.target.value))} className="pl-9" placeholder="0 for immediate expiry" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-4 md:px-6 py-4 border-t border-border bg-muted/20 flex justify-end">
                <Button type="submit" disabled={loading} className="w-full md:w-auto" style={{ background: "hsl(210,69%,16%)", color: "hsl(38,49%,57%)" }}>
                  {loading ? "Provisioning..." : "Provision Tenant Account"}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 2: TENANT DIRECTORY */}
        {activeTab === "directory" && (
          <div className="max-w-5xl mx-auto space-y-4">
            
            {/* Global Stats Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between bg-card p-4 rounded-xl border border-border shadow-sm gap-4 md:gap-0">
              <div>
                <p className="text-sm font-semibold text-foreground">Global Stats</p>
                <p className="text-xs text-muted-foreground">Total platform usage</p>
              </div>
              <div className="flex gap-6 justify-between md:justify-end">
                <div className="text-right">
                  <p className="text-2xl font-bold text-destructive">{organizations.length}</p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Tenants</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold" style={{ color: "hsl(210,69%,16%)" }}>{statsData?.totalBookings || 0}</p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Total Bookings</p>
                </div>
              </div>
            </div>

            {/* 💻 DESKTOP VIEW (TABLE) */}
            <div className="hidden lg:block bg-card border border-border rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto pb-2">
                <table className="w-full text-left text-sm whitespace-nowrap min-w-[900px]">
                <thead className="bg-muted/30 border-b border-border text-xs text-muted-foreground uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 font-medium">Organization</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Expiry / Renews</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                    <th className="text-right py-3 px-4 font-medium">Security PIN</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {organizations.map((org: any) => {
                    const dateStringRaw = org.trialExpires ? org.trialExpires.split('T')[0] : null;
                    let displayDate = "N/A";
                    let isExpired = false;

                    if (dateStringRaw) {
                      const [year, month, day] = dateStringRaw.split('-').map(Number);
                      const exactDate = new Date(year, month - 1, day);
                      displayDate = exactDate.toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' });
                      isExpired = exactDate.getTime() < Date.now() && !org.isPaid;
                    }
                    
                    return (
                      <tr key={org.id} className="hover:bg-muted/10 transition-colors">
                        <td className="px-4 py-3 font-medium text-foreground">{org.name}</td>
                        <td className="px-4 py-3">
                          {org.isPaid ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200">
                              <CheckCircle2 size={10} /> PREMIUM
                            </span>
                          ) : isExpired ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
                              <AlertCircle size={10} /> EXPIRED
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 border border-yellow-200">
                              TRIAL
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs font-medium text-foreground">
                          {displayDate}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-3">
                            {!org.isPaid && (
                              <div className="flex items-center gap-1.5 border-r border-border pr-3">
                                <Input 
                                  type="date" 
                                  className="h-7 text-xs px-2 w-32"
                                  value={extendDays[org.id] || ""}
                                  onChange={e => setExtendDays(prev => ({ ...prev, [org.id]: e.target.value }))}
                                />
                                <Button 
                                  variant="secondary" 
                                  size="sm" 
                                  className="h-7 text-xs"
                                  onClick={async () => {
                                    const targetDate = extendDays[org.id];
                                    if (!targetDate) return;
                                    try {
                                      await apiRequest("PATCH", `/api/superadmin/organizations/${org.id}/trial`, { targetDate });
                                      queryClient.invalidateQueries({ queryKey: ["/api/superadmin/stats"] });
                                      toast({ title: "Expiry Updated", description: `New expiry set to ${targetDate}.` });
                                    } catch (err: any) {
                                      toast({ title: "Update Failed", description: err.message, variant: "destructive" });
                                    }
                                  }}
                                  disabled={!extendDays[org.id]}
                                >
                                  Set Expiry
                                </Button>
                              </div>
                            )}

                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                              onClick={async () => {
                                if (!confirm(`Are you sure you want to reset the password for ${org.name}?`)) return;
                                try {
                                  const res = await apiRequest("POST", `/api/superadmin/organizations/${org.id}/reset-password`);
                                  const data = await res.json();
                                  setResetModal({ orgName: org.name, password: data.temporaryPassword });
                                } catch (err: any) {
                                  toast({ title: "Reset Failed", description: err.message, variant: "destructive" });
                                }
                              }}
                            >
                              Reset Password
                            </Button>
                            
                            <Button variant="outline" size="sm" className="h-7 text-xs" 
                              onClick={() => handleImpersonate(org.id, org.name)}>
                              View Workspace
                            </Button>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-mono bg-muted px-2 py-1 rounded text-xs tracking-widest border border-border">
                            {org.deletePin}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              </div>
            </div>

            {/* 📱 MOBILE VIEW (UI CARDS) */}
            <div className="lg:hidden space-y-4">
              {organizations.map((org: any) => {
                const dateStringRaw = org.trialExpires ? org.trialExpires.split('T')[0] : null;
                let displayDate = "N/A";
                let isExpired = false;

                if (dateStringRaw) {
                  const [year, month, day] = dateStringRaw.split('-').map(Number);
                  const exactDate = new Date(year, month - 1, day);
                  displayDate = exactDate.toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' });
                  isExpired = exactDate.getTime() < Date.now() && !org.isPaid;
                }

                return (
                  <div key={org.id} className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-4">
                    {/* Top Row: Name, Status, PIN */}
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className="font-bold text-foreground text-sm">{org.name}</h4>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">
                          PIN: <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-foreground border border-border">{org.deletePin}</span>
                        </p>
                      </div>
                      <div>
                        {org.isPaid ? (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200">
                            <CheckCircle2 size={10} /> PREMIUM
                          </span>
                        ) : isExpired ? (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
                            <AlertCircle size={10} /> EXPIRED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 border border-yellow-200">
                            TRIAL
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Expiry Details */}
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-medium">Expiry / Renews</p>
                      <p className="text-xs font-medium text-foreground">{displayDate}</p>
                    </div>

                    {/* Controls */}
                    <div className="pt-3 border-t border-border space-y-3">
                      {!org.isPaid && (
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">Adjust Expiry Date</label>
                          <div className="flex items-center gap-2">
                            <Input 
                              type="date" 
                              className="h-9 text-xs flex-1"
                              value={extendDays[org.id] || ""}
                              onChange={e => setExtendDays(prev => ({ ...prev, [org.id]: e.target.value }))}
                            />
                            <Button 
                              variant="secondary" 
                              className="h-9 text-xs px-4 font-semibold"
                              onClick={async () => {
                                const targetDate = extendDays[org.id];
                                if (!targetDate) return;
                                try {
                                  await apiRequest("PATCH", `/api/superadmin/organizations/${org.id}/trial`, { targetDate });
                                  queryClient.invalidateQueries({ queryKey: ["/api/superadmin/stats"] });
                                  toast({ title: "Expiry Updated", description: `New expiry set to ${targetDate}.` });
                                } catch (err: any) {
                                  toast({ title: "Update Failed", description: err.message, variant: "destructive" });
                                }
                              }}
                              disabled={!extendDays[org.id]}
                            >
                              Set Expiry
                            </Button>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-1">
                        <Button 
                          variant="outline" 
                          className="h-9 text-xs flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 font-semibold"
                          onClick={async () => {
                            if (!confirm(`Are you sure you want to reset the password for ${org.name}?`)) return;
                            try {
                              const res = await apiRequest("POST", `/api/superadmin/organizations/${org.id}/reset-password`);
                              const data = await res.json();
                              setResetModal({ orgName: org.name, password: data.temporaryPassword });
                            } catch (err: any) {
                              toast({ title: "Reset Failed", description: err.message, variant: "destructive" });
                            }
                          }}
                        >
                          Reset Password
                        </Button>
                        
                        <Button 
                          className="h-9 text-xs flex-1 shadow-none font-semibold" 
                          style={{ background: "hsl(210,69%,16%)", color: "white" }}
                          onClick={() => handleImpersonate(org.id, org.name)}
                        >
                          View Workspace
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

       {/* TAB 3: SUPPORT INBOX */}
        {activeTab === "inbox" && (
          <div className="max-w-4xl mx-auto space-y-4">
            
            {/* Filter Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between bg-card p-4 rounded-xl border border-border shadow-sm mb-4 gap-4 md:gap-0">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Support Queries</h3>
                <p className="text-xs text-muted-foreground">Manage messages from tenant workspaces</p>
              </div>
              <div className="flex bg-muted/50 p-1 rounded-lg border border-border w-full md:w-auto">
                {(["open", "resolved", "all"] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setQueryFilter(f)}
                    className={`flex-1 md:flex-none px-3 md:px-4 py-1.5 text-xs font-medium rounded-md transition-all capitalize ${
                      queryFilter === f 
                        ? "bg-background shadow-sm text-foreground" 
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {filteredQueries.length === 0 ? (
              <div className="text-center py-12 border border-dashed rounded-xl border-border">
                <CheckCircle2 size={32} className="mx-auto text-muted-foreground mb-3 opacity-50" />
                <p className="text-sm font-medium text-foreground">No {queryFilter !== "all" ? queryFilter : ""} queries found.</p>
                <p className="text-xs text-muted-foreground mt-1">You're all caught up!</p>
              </div>
            ) : (
              filteredQueries.map((query: any) => (
                <div key={query.id} className={`bg-card border rounded-xl p-4 md:p-5 shadow-sm space-y-3 ${query.status === 'resolved' ? 'border-border opacity-70' : 'border-blue-200'}`}>
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 md:gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {query.status === "open" && <span className="inline-block w-2 h-2 rounded-full bg-blue-500" />}
                        <h4 className="text-sm font-bold text-foreground">{query.subject || "No Subject"}</h4>
                      </div>
                      <p className="text-[10px] md:text-xs text-muted-foreground flex flex-wrap gap-x-2 gap-y-1">
                        <span>{query.name}</span>
                        <span className="hidden md:inline">•</span>
                        <a href={`mailto:${query.email}`} className="hover:underline">{query.email}</a>
                        <span className="hidden md:inline">•</span>
                        <span>{new Date(query.createdAt).toLocaleDateString()}</span>
                      </p>
                    </div>
                    {query.status === "open" ? (
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="h-7 text-xs flex-shrink-0 w-full md:w-auto" 
                        onClick={async () => {
                          try {
                            await fetch(`/api/superadmin/queries/${query.id}/resolve`, { method: "PATCH" });
                            queryClient.invalidateQueries({ queryKey: ["/api/superadmin/queries"] });
                            toast({ title: "Query Resolved", description: "The message has been marked as resolved." });
                          } catch (e) {
                            toast({ title: "Error", description: "Could not resolve query.", variant: "destructive" });
                          }
                        }}
                      >
                        Mark Resolved
                      </Button>
                    ) : (
                      <span className="inline-flex items-center justify-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-muted text-muted-foreground w-full md:w-auto">
                        <CheckCircle2 size={12} /> RESOLVED
                      </span>
                    )}
                  </div>
                  <div className="bg-muted/30 p-3 rounded-lg text-xs md:text-sm text-foreground whitespace-pre-wrap border border-border">
                    {query.message}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      
        {/* TAB 4: PANCHANG / CALENDAR SYNC */}
        {activeTab === "panchang" && (
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
              <div className="px-4 md:px-5 py-4 border-b border-border bg-muted/30">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <CalendarDays size={16} className="text-muted-foreground" />
                  Global Calendar Data Sync
                </h3>
                <p className="text-[10px] md:text-xs text-muted-foreground mt-1 ml-0 md:ml-6">
                  Paste the JSON array of festivals and muhurats here. This updates the calendar for all workspaces.
                </p>
              </div>

              <div className="p-4 md:p-6 space-y-4">
                <div className="bg-muted/50 p-3 rounded-lg border border-border text-[10px] md:text-xs text-muted-foreground font-mono overflow-x-auto">
                  <p className="font-semibold text-foreground mb-1">Expected JSON Format Example:</p>
                  <pre>{`[
  { "date": "2026-01-14", "name": "Makar Sankranti", "type": "festival" },
  { "date": "2026-01-23", "name": "Shubh Muhurat", "type": "muhurat", "nakshatra": "Uttara Bhadrapada", "timing": "3:58 PM – 1:46 AM" }
]`}</pre>
                </div>

                <div>
                  <div className="relative">
                    <FileJson size={14} className="absolute left-3 top-3 text-muted-foreground" />
                    <textarea 
                      value={jsonInput}
                      onChange={(e) => setJsonInput(e.target.value)}
                      placeholder="Paste your JSON array here..."
                      className="w-full min-h-[300px] rounded-md border border-input bg-background pl-9 pr-3 py-2.5 text-xs md:text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-y font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="px-4 md:px-6 py-4 border-t border-border bg-muted/20 flex justify-end">
                <Button 
                  onClick={handleSyncCalendar} 
                  disabled={isSyncing || !jsonInput.trim()} 
                  className="w-full md:w-auto"
                  style={{ background: "hsl(210,69%,16%)", color: "hsl(38,49%,57%)" }}
                >
                  {isSyncing ? "Syncing..." : "Sync Calendar to Database"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SUPERADMIN ACCOUNT (TASK A3) */}
        {activeTab === "account" && (
          <div className="max-w-2xl mx-auto space-y-6">
            
            {/* Account Details Card */}
            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
              <div className="px-4 md:px-5 py-4 border-b border-border bg-muted/30">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <User size={16} className="text-muted-foreground" />
                  Master Account Details
                </h3>
              </div>
              <div className="p-4 md:p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1.5">Name</label>
                    <Input value={saName} onChange={e => setSaName(e.target.value)} placeholder="Super Admin" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1.5">Email (Login ID)</label>
                    <Input type="email" value={saEmail} onChange={e => setSaEmail(e.target.value)} placeholder="admin@bandhanandco.com" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Recovery Phone Number</label>
                  <Input type="tel" value={saPhone} onChange={e => setSaPhone(e.target.value)} placeholder="+91 98765 43210" />
                </div>
              </div>
              <div className="px-4 md:px-6 py-4 border-t border-border bg-muted/20 flex justify-end">
                {/* Save Details Button */}
                <Button 
                  onClick={async () => {
                    try {
                      const res = await fetch("/api/auth/profile", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ name: saName, email: saEmail, phone: saPhone })
                      });
                      const data = await res.json();
                      if (!res.ok) throw new Error(data.error || "Failed to save profile");
                      
                      await queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
                      toast({ title: "Profile Updated", description: "Master account details saved." });
                    } catch (err: any) {
                      toast({ title: "Update Failed", description: err.message, variant: "destructive" });
                    }
                  }}
                  className="w-full md:w-auto"
                  style={{ background: "hsl(210,69%,16%)", color: "white" }}
                >
                  Save Details
                </Button>
              </div>
            </div>

            {/* Security Card */}
            <div className="bg-card border border-destructive/30 rounded-xl shadow-sm overflow-hidden">
              <div className="px-4 md:px-5 py-4 border-b border-border bg-red-50/50">
                <h3 className="text-sm font-semibold text-destructive flex items-center gap-2">
                  <Lock size={16} />
                  Master Security
                </h3>
              </div>
              <div className="p-4 md:p-6">
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">Change Master Password</label>
                <Input 
                  type="password" 
                  value={saNewPassword} 
                  onChange={e => setSaNewPassword(e.target.value)} 
                  placeholder="Enter new secure password (min 6 chars)" 
                  className="w-full max-w-md"
                />
              </div>
              <div className="px-4 md:px-6 py-4 border-t border-border bg-muted/20 flex justify-start">
                <Button 
                  variant="destructive"
                  disabled={saNewPassword.length < 6}
                  className="w-full md:w-auto"
                  onClick={async () => {
                    try {
                      // Passing force: true so the SuperAdmin doesn't have to type their old password
                      await apiRequest("POST", "/api/auth/change-password", { newPwd: saNewPassword, force: true });
                      setSaNewPassword("");
                      toast({ title: "Security Updated", description: "Master password has been changed." });
                    } catch (err: any) {
                      toast({ title: "Security Update Failed", description: err.message, variant: "destructive" });
                    }
                  }}
                >
                  Update Master Password
                </Button>
              </div>
            </div>
            
          </div>
        )}

      </div>
      {/* ── PASSWORD RESET MODAL ── */}
      {resetModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-xl p-5 md:p-6 w-[90vw] max-w-sm shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-100 text-green-600 flex-shrink-0">
                <CheckCircle2 size={20} />
              </div>
              <h3 className="text-lg font-bold text-foreground leading-tight">Password Reset!</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              The password for <span className="font-bold text-foreground">{resetModal.orgName}</span> has been successfully reset.
            </p>
            
            <div className="bg-muted p-3 rounded-lg flex items-center justify-between border border-border gap-2 overflow-x-auto">
              <code className="text-lg font-mono font-bold tracking-wider">{resetModal.password}</code>
              <Button 
                size="sm" 
                variant="secondary"
                className="flex-shrink-0"
                onClick={() => {
                  navigator.clipboard.writeText(resetModal.password);
                  toast({ title: "Copied!", description: "Password copied to clipboard." });
                }}
              >
                Copy
              </Button>
            </div>
            
            <p className="text-[11px] text-destructive font-medium">
              Please copy this now. You will not be able to see it again once you close this window.
            </p>
            
            <div className="flex justify-end pt-2">
              <Button className="w-full md:w-auto" onClick={() => setResetModal(null)} style={{ background: "hsl(210,69%,16%)", color: "white" }}>
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </div> // <-- This is the final closing div of the page
  );
}