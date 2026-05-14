import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import {
  User, Lock, Trash2, Bell, Megaphone, ChevronRight, KeyRound,
  Eye, EyeOff, AlertTriangle, CheckCircle2, Save,
  Shield, Mail, Phone, HelpCircle, MessageSquare,
  ChevronDown, ChevronUp, MapPin, Clock, Send, ExternalLink,
  CreditCard, Sparkles, Crown, Zap, Check, Calendar,
  RefreshCw, XCircle, ArrowUpRight, Receipt, BadgeCheck, ShieldAlert,
  Headphones, FlaskConical, Building2, PlaySquare
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

// ─── Toggle Switch ────────────────────────────────────────────────────────────
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none"
      style={{ background: checked ? "hsl(210,69%,16%)" : "hsl(var(--muted))" }}
    >
      <span
        className="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200"
        style={{ transform: checked ? "translateX(16px)" : "translateX(0)" }}
      />
    </button>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ icon: Icon, title, subtitle, children }: {
  icon: React.ElementType; title: string; subtitle?: string; children: React.ReactNode;
}) {
  return (
    <section className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-4 md:px-5 py-3 md:py-4 border-b border-border flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: "hsl(210,69%,16%,0.08)" }}>
          <Icon size={15} style={{ color: "hsl(210,69%,16%)" }} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {subtitle && <p className="text-[10px] md:text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="divide-y divide-border">{children}</div>
    </section>
  );
}

// ─── Row inside a section ─────────────────────────────────────────────────────
function Row({ children, danger }: { children: React.ReactNode; danger?: boolean }) {
  return (
    <div className={`px-4 md:px-5 py-3 md:py-4 ${danger ? "bg-red-50/50" : ""}`}>
      {children}
    </div>
  );
}

// ─── Main Settings Page ───────────────────────────────────────────────────────
export default function SettingsPage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  const { data: authData } = useQuery<{ user: any; organization: any; isImpersonating?: boolean }>({ queryKey: ["/api/auth/me"] });
  const user = authData?.user;
  const org = authData?.organization;
  const isImpersonating = authData?.isImpersonating;  
  const { data: tutorials = [] } = useQuery<any[]>({ queryKey: ["/api/tutorials"] });

  function getYTId(url: string) {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:.*v=|.*\/|.*embed\/))([^&?\s]+)/);
    return match ? match[1] : null;
  }

  // ── Manage Account state ──
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Sync real database values into the form fields once loaded
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
    }
    if (org) {
      setIsDeletePinEnabled(org.isDeletePinEnabled);
    }
  }, [user, org]);

  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Security Settings State
  const [isDeletePinEnabled, setIsDeletePinEnabled] = useState(true);
  const [currentDeletePin, setCurrentDeletePin] = useState(""); // <-- ADD THIS
  const [newDeletePin, setNewDeletePin] = useState("");

  const [securityPwd, setSecurityPwd] = useState("");
  const [showSecurityPwd, setShowSecurityPwd] = useState(false);

  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [showDeleteSection, setShowDeleteSection] = useState(false);

  // ── Notifications state ──
  const [eventAlertsEnabled, setEventAlertsEnabled] = useState(true);
  const [eventAlertDays, setEventAlertDays] = useState<number>(3);
  const [platformUpdatesEnabled, setPlatformUpdatesEnabled] = useState(true);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const [activeTab, setActiveTab] = useState<"account" | "notifications" | "subscription" | "faq" | "contact" | "tutorials">("account"); 

  // ── Subscription state ──
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelConfirmText, setCancelConfirmText] = useState("");

  const isPaid = org?.isPaid;
  const trialExpires = org?.trialExpires ? new Date(org.trialExpires) : null;
  const daysLeft = trialExpires ? Math.max(0, Math.ceil((trialExpires.getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 0;
  
  const daysPercent = trialExpires ? Math.min(100, Math.round((daysLeft / 14) * 100)) : 100; 
  const planName = isPaid ? "Premium" : "Free Trial";
  const renewDate = trialExpires ? trialExpires.toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' }) : "N/A";

  const ALL_FEATURES = [
    "Hindu Panchang calendar with 55+ Shubh Muhurats",
    "Unlimited client & booking management",
    "Multi-venue directory with individual calendars",
    "Custom colour grading for events",
    "Category sorting & filtering",
    "Event & calendar notifications",
    "Multi-device sync across all platforms",
    "Full dashboard & analytics overview",
  ];

  const PREMIUM_FEATURES = [
    { icon: Headphones, label: "Priority support response (within 4 hours)" },
    { icon: Zap,        label: "Early access to new features & updates" },
    { icon: FlaskConical, label: "Access to beta versions" },
  ];

  const planCards = [
    { key: "monthly",  name: "Monthly",  price: 2000,  priceLabel: "₹2,000/mo",  billed: "Billed monthly",              highlight: false },
    { key: "halfyear", name: "6 Months", price: 9600,  priceLabel: "₹1,600/mo",  billed: "Billed as ₹9,600 / 6 months",  highlight: true  },
    { key: "yearly",   name: "Yearly",   price: 16800, priceLabel: "₹1,400/mo",  billed: "Billed as ₹16,800/year",       highlight: false },
  ];

  function handleChangePlan(key: string) {
    toast({ title: "Payment Gateway Coming Soon", description: "Rhythm is currently setting up the payment provider for upgrades." });
  }

  function handleCancelSubscription() {
    if (cancelConfirmText !== "CANCEL") {
      toast({ title: "Type CANCEL to confirm", variant: "destructive" }); return;
    }
    setShowCancelConfirm(false);
    setCancelConfirmText("");
    toast({ title: "Subscription cancellation requested", description: "Your plan will remain active until the end of your trial." });
  }

  // ── FAQ state ──
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // ── Contact state ──
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactSubject, setContactSubject] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactSent, setContactSent] = useState(false);

  const faqs = [
    {
      q: "What is Bandhan & Co.?",
      a: "Bandhan & Co. is a wedding management platform built for Indian wedding planners and venue owners. It helps you manage bookings, track clients, organise events with Hindu Panchang dates, and coordinate multiple venues — all in one place.",
    },
    {
      q: "How does the Hindu Panchang calendar work?",
      a: "The calendar integrates 55+ Shubh Muhurats and 30+ Hindu festivals automatically. Auspicious dates are highlighted so you can plan bookings around the most favourable times for your clients.",
    },
    {
      q: "Can I manage multiple venues?",
      a: "Yes. You can add as many venues as you need. Each venue gets its own dedicated calendar page so you can track availability independently. Events can also be assigned to multiple venues simultaneously.",
    },
    {
      q: "How do I add a new booking?",
      a: "Go to the Bookings tab and click 'New Booking'. Fill in the client details, then add one or more events with dates, venues, guest count, and any additional notes. Everything syncs automatically to the main calendar and the respective venue calendars.",
    },
    {
      q: "Can I use Bandhan & Co. on mobile?",
      a: "Yes. The app is fully responsive and works on mobile browsers. A dedicated mobile app is on the roadmap for a future release.",
    },
    {
      q: "How do I change my account details?",
      a: "Go to Settings → Manage Account. From there you can update your name, email address, and phone number, change your password, or permanently delete your account.",
    },
    {
      q: "Is there a free plan?",
      a: "Bandhan & Co. provides a robust trial period for new workspaces. Pricing details and permanent plans can be managed directly through the platform.",
    },
  ];


  async function handleDeleteAccount() {
    if (!deletePassword) return toast({ title: "Password required", variant: "destructive" });
    setIsDeleting(true);
    try {
      await apiRequest("DELETE", "/api/auth/account", { password: deletePassword });
      queryClient.clear();
      window.location.href = "/"; // Force a hard reload to clear all React state and route to landing
    } catch (err: any) {
      toast({ title: "Deletion Failed", description: err.message, variant: "destructive" });
      setIsDeleting(false);
    }
  }

  async function submitContact() {
    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) {
      toast({ title: "Please fill in all required fields", variant: "destructive" }); 
      return;
    }

    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: contactName.trim(),
          email: contactEmail.trim(),
          subject: contactSubject.trim(),
          message: contactMessage.trim()
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to send message");
      }

      setContactSent(true);
      setContactName(""); setContactEmail(""); setContactSubject(""); setContactMessage("");
      toast({ title: "Message sent!", description: "We'll get back to you within 24–48 hours." });
    } catch (error: any) {
      toast({ title: "Delivery Failed", description: error.message, variant: "destructive" });
    }
  }

  // 🔥 DOMAIN C1: REAL DATABASE PROFILE UPDATE
  async function saveAccountDetails() {
    if (!name.trim()) { toast({ title: "Name is required", variant: "destructive" }); return; }
    if (!email.trim()) { toast({ title: "Email is required", variant: "destructive" }); return; }
    
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to update profile");

      await queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({ title: "Profile Updated", description: "Your account details have been saved securely." });
    } catch (err: any) {
      toast({ title: "Update Failed", description: err.message, variant: "destructive" });
    }
  }

  // 🔥 DOMAIN C1: REAL DATABASE PASSWORD CHANGE
  async function changePassword() {
    if (!currentPwd) { toast({ title: "Enter your current password", variant: "destructive" }); return; }
    if (newPwd.length < 6) { toast({ title: "New password must be at least 6 characters", variant: "destructive" }); return; }
    if (newPwd !== confirmPwd) { toast({ title: "Passwords do not match", variant: "destructive" }); return; }
    
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Important: We do NOT pass "force: true" here. Tenants must verify their old password.
        body: JSON.stringify({ currentPwd, newPwd }) 
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to change password");

      setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
      toast({ title: "Security Updated", description: "Your password has been changed successfully." });
    } catch (err: any) {
      toast({ title: "Security Update Failed", description: err.message, variant: "destructive" });
    }
  }

  async function updateSecuritySettings() {
    if (!securityPwd) { toast({ title: "Password required to change security settings", variant: "destructive" }); return; }
    if (newDeletePin && newDeletePin.length !== 6) { toast({ title: "New PIN must be exactly 6 digits", variant: "destructive" }); return; }
    if (newDeletePin && !currentDeletePin) { toast({ title: "Current PIN is required to change it", variant: "destructive" }); return; }
    
    try {
      const res = await fetch("/api/auth/security", { 
        method: "PATCH", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ 
          currentPwd: securityPwd, 
          isDeletePinEnabled, 
          newPin: newDeletePin || undefined,
          currentPin: currentDeletePin || undefined 
        }) 
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setSecurityPwd(""); setNewDeletePin(""); setCurrentDeletePin("");
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({ title: "Security settings updated" });
    } catch (err: any) { 
      toast({ title: "Update Failed", description: err.message, variant: "destructive" }); 
    }
  }

  function deleteAccount() {
    if (deleteConfirmText !== "DELETE") {
      toast({ title: "Type DELETE to confirm", variant: "destructive" }); return;
    }
    toast({ title: "Deletion Safety Lock", description: "Account deletion is restricted during the beta." });
    setDeleteConfirmText("");
    setShowDeleteSection(false);
  }

  // 🔥 DOMAIN C: REAL FIREBASE NOTIFICATION SYNC
  async function saveNotifications() {
    
     alert("Feature Coming Soon");
    
  }

  const tabs = [
    { key: "account" as const, label: "Manage Account", icon: User },
    { key: "notifications" as const, label: "Notifications", icon: Bell },
    { key: "subscription" as const, label: "Subscription", icon: CreditCard },
    { key: "faq" as const, label: "FAQs", icon: HelpCircle },
    { key: "contact" as const, label: "Contact Us", icon: MessageSquare },
    { key: "tutorials" as const, label: "Tutorials", icon: PlaySquare },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="px-4 md:px-6 py-4 border-b border-border bg-card flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h2 className="text-xl md:text-2xl font-semibold" style={{ fontFamily: "Playfair Display, serif" }}>Settings</h2>
          <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5">Manage your account and preferences</p>
        </div>
      </header>

      {/* Tab bar */}
      <div className="flex border-b border-border bg-card px-4 md:px-6 gap-1 overflow-x-auto custom-scrollbar whitespace-nowrap">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className="flex items-center gap-2 px-3 md:px-4 py-3 text-sm font-medium transition-colors relative"
            style={{
              color: activeTab === key ? "hsl(210,69%,16%)" : "hsl(var(--muted-foreground))",
            }}
          >
            <Icon size={14} />
            {label}
            {activeTab === key && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full"
                style={{ background: "hsl(210,69%,16%)" }} />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 md:p-6">
        <div className="max-w-2xl mx-auto space-y-5">

{/* ── MANAGE ACCOUNT ── */}
          {activeTab === "account" && (
            <>
              {isImpersonating ? (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-8 flex flex-col items-center justify-center text-center space-y-3 mb-6">
                  <ShieldAlert size={36} className="text-amber-600" />
                  <div>
                    <h3 className="text-base font-semibold text-amber-700" style={{ fontFamily: "Playfair Display, serif" }}>Restricted in Support Mode</h3>
                    <p className="text-xs text-amber-600/80 mt-1 max-w-md mx-auto leading-relaxed">
                      Personal account details and passwords cannot be viewed or modified while impersonating a client workspace to protect user privacy.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <Section icon={User} title="Account Details" subtitle="Update your name, email and phone number">
                    <Row>
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-medium text-muted-foreground block mb-1.5">Full Name</label>
                          <div className="relative">
                            <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <Input value={name} onChange={e => setName(e.target.value)} className="pl-8" placeholder="Your name" />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                          <div>
                            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Email Address</label>
                            <div className="relative">
                              <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} className="pl-8" />
                            </div>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Phone Number</label>
                            <div className="relative">
                              <Phone size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                              <Input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="pl-8" />
                            </div>
                          </div>
                        </div>
                        <Button size="sm" onClick={saveAccountDetails} className="w-full md:w-auto" style={{ background: "hsl(210,69%,16%)", color: "#fff" }}>
                          <Save size={13} className="mr-1.5" /> Save Changes
                        </Button>
                      </div>
                    </Row>
                  </Section>

                  <div className="mt-5">
                    <Section icon={Lock} title="Change Password" subtitle="Update your account password">
                      <Row>
                        <div className="space-y-4">
                          <div>
                            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Current Password</label>
                            <div className="relative">
                              <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                              <Input type={showCurrent ? "text" : "password"} value={currentPwd} onChange={e => setCurrentPwd(e.target.value)} className="pl-8 pr-9" />
                              <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                {showCurrent ? <EyeOff size={13} /> : <Eye size={13} />}
                              </button>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                            <div>
                              <label className="text-xs font-medium text-muted-foreground block mb-1.5">New Password</label>
                              <div className="relative">
                                <Input type={showNew ? "text" : "password"} value={newPwd} onChange={e => setNewPwd(e.target.value)} className="pr-9" />
                                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                  {showNew ? <EyeOff size={13} /> : <Eye size={13} />}
                                </button>
                              </div>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Confirm New Password</label>
                              <div className="relative">
                                <Input type={showConfirm ? "text" : "password"} value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} className="pr-9" />
                                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                  {showConfirm ? <EyeOff size={13} /> : <Eye size={13} />}
                                </button>
                              </div>
                            </div>
                          </div>
                          <Button size="sm" onClick={updateSecuritySettings} className="w-full md:w-auto" style={{ background: "hsl(210,69%,16%)", color: "#fff" }}>
                          <Save size={13} className="mr-1.5" /> Save Security Settings
                        </Button>
                      </div>

                  </Row>
                </Section>
              </div>

              {!isImpersonating && (
                <div className="mt-8 pt-6 border-t border-destructive/20">
                  <Section icon={AlertTriangle} title="Danger Zone" subtitle="Permanently delete your account and all data">
                    <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
                      <div>
                        <h4 className="text-sm font-semibold text-destructive">Delete Workspace</h4>
                        <p className="text-xs text-muted-foreground mt-1 max-w-md leading-relaxed">
                          Once you delete your workspace, there is no going back. All clients, events, and venues will be permanently erased.
                        </p>
                      </div>
                      <Button variant="destructive" onClick={() => setShowDeleteDialog(true)} className="w-full md:w-auto flex-shrink-0">
                        Delete Account
                      </Button>
                    </div>
                  </Section>
                </div>
              )}

            </>
          )}

              {/* ── WORKSPACE SECURITY (Accessible to Impersonator) ── */}
              <div className="mt-5">
                <Section icon={KeyRound} title="Workspace Security" subtitle="Manage your Delete PIN and Data Safety features">
                  <Row>
                    <div className="space-y-5">
                      
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">Require PIN for Deletions</p>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                            Force staff to enter a 6-digit PIN before permanently deleting clients or events from the workspace.
                          </p>
                        </div>
                        <Toggle checked={isDeletePinEnabled} onChange={setIsDeletePinEnabled} />
                      </div>

                      {isDeletePinEnabled && (
                        <div className="pt-4 border-t border-border space-y-4">
                          <div>
                            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Current 6-digit Delete PIN (Required to change PIN)</label>
                            <Input 
                              type="text" 
                              maxLength={6} 
                              value={currentDeletePin} 
                              onChange={e => setCurrentDeletePin(e.target.value.replace(/\D/g, ''))} 
                              placeholder="Enter current PIN" 
                              className="font-mono tracking-widest"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-muted-foreground block mb-1.5">New 6-digit Delete PIN (Optional)</label>
                            <Input 
                              type="text" 
                              maxLength={6} 
                              value={newDeletePin} 
                              onChange={e => setNewDeletePin(e.target.value.replace(/\D/g, ''))} 
                              placeholder="Leave blank to keep current PIN" 
                              className="font-mono tracking-widest"
                            />
                          </div>
                        </div>
                      )}

                      <div className="pt-2 border-t border-border bg-muted/20 -mx-4 md:-mx-5 px-4 md:px-5 pb-1 mt-2">
                        <label className="text-xs font-medium text-muted-foreground block mb-1.5 mt-3">
                          {isImpersonating ? "Confirm SuperAdmin Password to Override PIN *" : "Confirm Current Password to Save Changes *"}
                        </label>
                        <div className="relative mb-3">
                          <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <Input type={showSecurityPwd ? "text" : "password"} value={securityPwd} onChange={e => setSecurityPwd(e.target.value)} className="pl-8 pr-9 bg-background" placeholder="Enter account password" />
                          <button type="button" onClick={() => setShowSecurityPwd(!showSecurityPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                            {showSecurityPwd ? <EyeOff size={13} /> : <Eye size={13} />}
                          </button>
                        </div>
                        <Button size="sm" onClick={updateSecuritySettings} className="w-full md:w-auto" style={{ background: "hsl(210,69%,16%)", color: "#fff" }}>
                          <Save size={13} className="mr-1.5" /> Save Security Settings
                        </Button>
                      </div>

                    </div>
                  </Row>
                </Section>
              </div>
            </>
          )}
          

          {/* ── SUBSCRIPTION ── */}
          {activeTab === "subscription" && (
            <>
              {/* Dynamic Current plan hero card */}
              <div className="rounded-xl overflow-hidden border-2"
                style={{ borderColor: "hsl(38,49%,57%)", background: "hsl(210,69%,16%)" }}>
                <div className="p-4 md:px-6 md:pt-6 md:pb-5">
                  <div className="flex items-start justify-between gap-2 md:gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: "rgba(200,164,93,0.18)" }}>
                        <Building2 size={20} style={{ color: "#C8A45D" }} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-white font-semibold text-sm md:text-base" style={{ fontFamily: "Playfair Display, serif" }}>
                            {org?.name || "Your Workspace"}
                          </p>
                          <span className="flex items-center gap-1 text-[9px] md:text-[10px] font-semibold px-2 py-0.5 rounded-full"
                            style={{ background: "rgba(200,164,93,0.2)", color: "#C8A45D", border: "1px solid rgba(200,164,93,0.3)" }}>
                            <BadgeCheck size={9} /> Active
                          </span>
                        </div>
                        <p className="text-[10px] md:text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>{planName}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xl md:text-2xl font-light" style={{ color: "#C8A45D", fontFamily: "Playfair Display, serif" }}>
                        {isPaid ? "Premium" : "Free"}
                      </p>
                    </div>
                  </div>

                  {/* Renewal/Trial progress */}
                  <div className="mt-5">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] md:text-[11px] flex items-center gap-1.5" style={{ color: "rgba(255,255,255,0.6)" }}>
                        <Calendar size={11} /> {isPaid ? "Lifetime Access" : `Expires on ${renewDate}`}
                      </span>
                      <span className="text-[10px] md:text-[11px] font-medium" style={{ color: "#C8A45D" }}>
                        {isPaid ? "Unlimited" : `${daysLeft} days left`}
                      </span>
                    </div>
                    {!isPaid && (
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${daysPercent}%`, background: "linear-gradient(90deg, #C8A45D, #e8cc8a)" }} />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* All included features */}
              <Section icon={Check} title="What's included" subtitle="All features available in your current plan">
                <Row>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-2">
                    {ALL_FEATURES.map(f => (
                      <div key={f} className="flex items-start md:items-center gap-2 text-xs text-foreground leading-tight">
                        <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 md:mt-0"
                          style={{ background: "hsl(210,69%,16%,0.08)" }}>
                          <Check size={9} style={{ color: "hsl(210,69%,16%)" }} />
                        </div>
                        {f}
                      </div>
                    ))}
                    {PREMIUM_FEATURES.map(({ label }) => (
                      <div key={label} className="flex items-start md:items-center gap-2 text-xs font-medium leading-tight"
                        style={{ color: "hsl(38,49%,57%)" }}>
                        <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 md:mt-0"
                          style={{ background: "hsl(38,49%,57%,0.12)" }}>
                          <Check size={9} style={{ color: "hsl(38,49%,57%)" }} />
                        </div>
                        {label}
                      </div>
                    ))}
                  </div>
                </Row>
              </Section>

              {/* Change plan */}
              {/* <Section icon={RefreshCw} title="Upgrade Workspace" subtitle="Subscribe to a premium tier when your trial ends">
                <Row>
                  <div className="space-y-3">
                    {planCards.map(p => (
                      <div key={p.key}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border transition-all"
                        style={{
                          borderColor: p.highlight ? "hsl(38,49%,57%)" : "hsl(var(--border))",
                          background: p.highlight ? "hsl(210,69%,16%,0.04)" : "transparent",
                        }}>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-sm font-semibold text-foreground">{p.name}</p>
                            {p.highlight && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                                style={{ background: "hsl(38,49%,57%)", color: "#fff" }}>POPULAR</span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{p.billed}</p>
                        </div>
                        
                        <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto mt-2 sm:mt-0">
                          <div className="text-left sm:text-right flex-shrink-0 sm:mr-3">
                            <p className="text-sm font-semibold text-foreground">{p.priceLabel}</p>
                          </div>
                          <Button size="sm" onClick={() => handleChangePlan(p.key)}
                            className="w-auto flex-shrink-0"
                            style={{ background: p.highlight ? "hsl(38,49%,57%)" : "hsl(210,69%,16%)", color: "#fff" }}
                            data-testid={`button-switch-${p.key}`}>
                            Select <ArrowUpRight size={12} className="ml-1" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <p className="text-[11px] text-muted-foreground text-center sm:text-left mt-3">
                      Payments will be processed securely via Stripe. Available shortly after the beta phase.
                    </p>
                  </div>
                </Row>
              </Section> */}
            </>
          )}

          {/* ── FAQ ── */}
          {activeTab === "faq" && (
            <>
              <div className="mb-3 md:mb-2">
                <h3 className="text-base font-semibold" style={{ fontFamily: "Playfair Display, serif" }}>Frequently Asked Questions</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Everything you need to know about Bandhan &amp; Co.</p>
              </div>
              <section className="bg-card border border-border rounded-xl overflow-hidden divide-y divide-border">
                {faqs.map((faq, i) => (
                  <div key={i}>
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full px-4 md:px-5 py-4 flex items-center justify-between gap-3 md:gap-4 text-left hover:bg-muted/30 transition-colors"
                      data-testid={`faq-toggle-${i}`}
                    >
                      <span className="text-sm font-medium text-foreground">{faq.q}</span>
                      <span className="flex-shrink-0 text-muted-foreground">
                        {openFaq === i
                          ? <ChevronUp size={15} />
                          : <ChevronDown size={15} />}
                      </span>
                    </button>
                    {openFaq === i && (
                      <div className="px-4 md:px-5 pb-4">
                        <p className="text-xs md:text-sm text-muted-foreground leading-relaxed border-l-2 pl-3 md:pl-4"
                          style={{ borderColor: "hsl(38,49%,57%)" }}>
                          {faq.a}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </section>

              <div className="rounded-xl border border-border bg-card px-4 md:px-5 py-4 flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: "hsl(210,69%,16%,0.08)" }}>
                    <MessageSquare size={15} style={{ color: "hsl(210,69%,16%)" }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Still have questions?</p>
                    <p className="text-[11px] md:text-xs text-muted-foreground mt-0.5">Our team is happy to help with anything not covered above.</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab("contact")}
                  className="flex items-center justify-center gap-1.5 text-xs font-medium px-4 py-2 rounded-lg transition-colors w-full sm:w-auto flex-shrink-0"
                  style={{ background: "hsl(210,69%,16%)", color: "#fff" }}
                  data-testid="button-goto-contact"
                >
                  Contact Us <ChevronRight size={12} />
                </button>
              </div>
            </>
          )}

          {/* ── CONTACT US ── */}
          {activeTab === "contact" && (
            <>
              <div className="mb-3 md:mb-2">
                <h3 className="text-base font-semibold" style={{ fontFamily: "Playfair Display, serif" }}>Contact Us</h3>
                <p className="text-xs text-muted-foreground mt-0.5">We'd love to hear from you. Send us a message and we'll respond promptly.</p>
              </div>

              {/* Contact info cards - Updated Layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { icon: Mail, label: "Email", value: "support@bandhanandco.com", sub: "Response within 24 hrs", span: "sm:col-span-2" },
                  { icon: Clock, label: "Support Hours", value: "Mon – Sat", sub: "9:00 AM – 7:00 PM IST", span: "sm:col-span-1" },
                  { icon: MapPin, label: "Based In", value: "India", sub: "Serving pan-India clients", span: "sm:col-span-1" },
                ].map(({ icon: Icon, label, value, sub, span }) => (
                  <div key={label} className={`bg-card border border-border rounded-xl px-4 py-3.5 flex items-start gap-3 ${span}`}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: "hsl(210,69%,16%,0.08)" }}>
                      <Icon size={13} style={{ color: "hsl(210,69%,16%)" }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
                      <p className="text-sm font-semibold text-foreground mt-0.5 break-all sm:break-normal">{value}</p>
                      <p className="text-[11px] text-muted-foreground">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Contact form */}
              {contactSent ? (
                <div className="bg-card border border-border rounded-xl px-4 md:px-5 py-8 flex flex-col items-center text-center gap-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ background: "hsl(210,69%,16%,0.08)" }}>
                    <CheckCircle2 size={24} style={{ color: "hsl(210,69%,16%)" }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Message sent successfully</p>
                    <p className="text-xs text-muted-foreground mt-1">We'll get back to you at your email within 24–48 hours.</p>
                  </div>
                  <button
                    onClick={() => setContactSent(false)}
                    className="text-xs underline underline-offset-2 text-muted-foreground hover:text-foreground transition-colors mt-1"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <Section icon={Send} title="Send a Message" subtitle="Fill in the form and we'll get back to you shortly">
                  <Row>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                        <div>
                          <label className="text-xs font-medium text-muted-foreground block mb-1.5">Your Name <span className="text-red-500">*</span></label>
                          <div className="relative">
                            <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              value={contactName}
                              onChange={e => setContactName(e.target.value)}
                              className="pl-8"
                              placeholder="Full name"
                              data-testid="input-contact-name"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground block mb-1.5">Email Address <span className="text-red-500">*</span></label>
                          <div className="relative">
                            <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              type="email"
                              value={contactEmail}
                              onChange={e => setContactEmail(e.target.value)}
                              className="pl-8"
                              placeholder="you@example.com"
                              data-testid="input-contact-email"
                            />
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground block mb-1.5">Subject</label>
                        <Input
                          value={contactSubject}
                          onChange={e => setContactSubject(e.target.value)}
                          placeholder="e.g. Booking issue, Feature request…"
                          data-testid="input-contact-subject"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground block mb-1.5">Message <span className="text-red-500">*</span></label>
                        <textarea
                          value={contactMessage}
                          onChange={e => setContactMessage(e.target.value)}
                          rows={5}
                          placeholder="Describe your question or issue in detail…"
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                          data-testid="textarea-contact-message"
                        />
                        <p className="text-[11px] text-muted-foreground mt-1">{contactMessage.length} / 1000 characters</p>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                        <p className="text-[11px] text-muted-foreground w-full sm:w-auto text-center sm:text-left">Fields marked <span className="text-red-500">*</span> are required.</p>
                        <Button
                          onClick={submitContact}
                          data-testid="button-send-contact"
                          className="w-full sm:w-auto"
                          style={{ background: "hsl(210,69%,16%)", color: "#fff" }}
                        >
                          <Send size={13} className="mr-1.5" /> Send Message
                        </Button>
                      </div>
                    </div>
                  </Row>
                </Section>
              )}

              {/* Social / other links */}
              <div className="bg-card border border-border rounded-xl px-4 md:px-5 py-4">
                <p className="text-xs font-semibold text-foreground mb-3">Other ways to reach us</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "Instagram", handle: "@bandhanandco" },
                    { label: "WhatsApp", handle: "+91 98000 00000" },
                    { label: "Email", handle: "support@bandhanandco.com" },
                  ].map(({ label, handle }) => (
                    <span key={label}
                      className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-full border font-medium w-auto"
                      style={{
                        borderColor: "hsl(var(--border))",
                        color: "hsl(var(--muted-foreground))",
                      }}
                    >
                      <ExternalLink size={9} />
                      <span className="text-foreground font-semibold">{label}:</span> {handle}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── NOTIFICATIONS ── */}
          {activeTab === "notifications" && (
            <>
              {/* Event Alerts */}
              <Section icon={Bell} title="Event Alerts" subtitle="Get notified before upcoming events on your calendar">
                <Row>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">Upcoming Event Reminders</p>
                      <p className="text-[11px] md:text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        Receive alerts before bookings are scheduled — so you're always prepared ahead of time.
                      </p>
                    </div>
                    <Toggle checked={eventAlertsEnabled} onChange={setEventAlertsEnabled} />
                  </div>
                </Row>

                {eventAlertsEnabled && (
                  <Row>
                    <div>
                      <p className="text-xs font-semibold text-foreground mb-3">Remind me before the event</p>
                      <div className="flex flex-wrap gap-2">
                        {[1, 2, 3, 5, 7].map(d => (
                          <button
                            key={d}
                            onClick={() => setEventAlertDays(d)}
                            className="px-3 py-1.5 rounded-lg border text-[11px] md:text-xs font-medium transition-all"
                            style={{
                              borderColor: eventAlertDays === d ? "hsl(210,69%,16%)" : "hsl(var(--border))",
                              background: eventAlertDays === d ? "hsl(210,69%,16%)" : "transparent",
                              color: eventAlertDays === d ? "#fff" : "hsl(var(--muted-foreground))",
                            }}
                          >
                            {d} day{d !== 1 ? "s" : ""}
                          </button>
                        ))}
                      </div>
                      <p className="text-[10px] md:text-[11px] text-muted-foreground mt-3">
                        You'll be notified <span className="font-medium text-foreground">{eventAlertDays} day{eventAlertDays !== 1 ? "s" : ""}</span> before each scheduled event.
                      </p>
                    </div>
                  </Row>
                )}

                <Row>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: "In-app notifications", enabled: true },
                      { label: "Email notifications", enabled: eventAlertsEnabled },
                      { label: "Push notifications", enabled: false },
                    ].map(({ label, enabled }) => (
                      <span key={label}
                        className="flex items-center gap-1.5 text-[10px] md:text-[11px] px-2.5 py-1.5 rounded-full border font-medium flex-grow sm:flex-grow-0 justify-center sm:justify-start"
                        style={{
                          borderColor: enabled ? "hsl(210,69%,16%)" : "hsl(var(--border))",
                          color: enabled ? "hsl(210,69%,16%)" : "hsl(var(--muted-foreground))",
                          background: enabled ? "hsl(210,69%,16%,0.06)" : "transparent",
                        }}>
                        {enabled ? <CheckCircle2 size={10} /> : null}
                        {label}
                        {!enabled && eventAlertsEnabled && (
                          <span className="text-[9px] opacity-60 ml-0.5">— coming soon</span>
                        )}
                      </span>
                    ))}
                  </div>
                </Row>
              </Section>

              {/* Platform Updates */}
              <Section icon={Megaphone} title="Platform Updates" subtitle="Stay informed about new features and improvements">
                <Row>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">Feature Announcements & Updates</p>
                      <p className="text-[11px] md:text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        Be the first to know about new features, improvements, and releases on Bandhan &amp; Co.
                      </p>
                    </div>
                    <Toggle checked={platformUpdatesEnabled} onChange={setPlatformUpdatesEnabled} />
                  </div>
                </Row>

                {platformUpdatesEnabled && (
                  <Row>
                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-foreground">What you'll receive</p>
                      {[
                        { title: "New feature releases", desc: "When major new features are launched on the platform." },
                        { title: "Product improvements", desc: "Bug fixes, performance updates, and UI improvements." },
                        { title: "Upcoming Hindu calendar updates", desc: "New Shubh Muhurats and festival data added for future years." },
                      ].map(({ title, desc }) => (
                        <div key={title} className="flex items-start gap-2.5">
                          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5"
                            style={{ background: "hsl(38,49%,57%)" }} />
                          <div>
                            <p className="text-[11px] md:text-xs font-medium text-foreground leading-tight">{title}</p>
                            <p className="text-[10px] md:text-[11px] text-muted-foreground mt-0.5 leading-tight">{desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Row>
                )}

                <Row>
                  <div className="flex items-start md:items-center gap-2 text-[11px] md:text-xs text-muted-foreground">
                    <Mail size={12} className="flex-shrink-0 mt-0.5 md:mt-0" />
                    <span className="leading-tight">Updates will be sent to <span className="font-medium text-foreground whitespace-break-spaces">{email || "your registered email"}</span></span>
                  </div>
                </Row>
              </Section>

              {/* Save */}
              <div className="flex justify-end pt-2">
                <Button onClick={saveNotifications} data-testid="button-save-notifications" className="w-full sm:w-auto"
                  style={{ background: "hsl(210,69%,16%)", color: "#fff" }}>
                  <Save size={13} className="mr-1.5" /> Save Preferences
                </Button>
              </div>
            </>
          )}

          {/* ── TUTORIALS (Read-Only for Org Users) ── */}
          {activeTab === "tutorials" && (
            <div className="space-y-5">
              <Section icon={PlaySquare} title="Platform Tutorials" subtitle="Learn how to get the most out of Bandhan & Co.">
                {tutorials.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground bg-muted/20 rounded-xl border border-border">
                    <p className="text-sm">No tutorials available right now. Check back later!</p>
                  </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 mt-4 max-w-4xl mx-auto">
                    {tutorials.map(tut => {
                      const ytId = getYTId(tut.videoUrl);
                      return (
                          <div key={tut.id} className="bg-card border border-border rounded-xl p-5 flex flex-col hover:shadow-md transition-shadow">
                          {/* Inner wrapper for the video to give it rounded corners inside the padded card */}
                          <div className="rounded-lg overflow-hidden border border-border/50 bg-muted mb-3">
                            {ytId ? (
                              <iframe 
                                className="w-full aspect-video" 
                                src={`https://www.youtube.com/embed/${ytId}?rel=0`} 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowFullScreen 
                              />
                            ) : (
                              <div className="w-full aspect-video flex items-center justify-center text-xs text-muted-foreground">Invalid Link</div>
                            )}
                          </div>
                          {/* Title area with a little breathing room */}
                          <div className="px-1 pb-1">
                            <p className="text-sm font-semibold text-foreground leading-tight">{tut.title}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Section>
            </div>
          )}
          
        </div>
      </div>
    {showDeleteDialog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-destructive rounded-xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={20} className="text-destructive" />
              </div>
              <h3 className="text-lg font-bold text-destructive" style={{ fontFamily: "Playfair Display, serif" }}>
                Final Confirmation
              </h3>
            </div>
            
            <p className="text-sm text-muted-foreground">
              This action is irreversible. To authorize the permanent deletion of your workspace, please type <strong>DELETE</strong> and enter your account password.
            </p>

            <div className="space-y-3 mt-4">
              <div>
                <label className="text-xs font-medium text-foreground block mb-1.5">Type DELETE to confirm</label>
                <Input 
                  type="text"
                  placeholder="DELETE"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground block mb-1.5">Account Password</label>
                <Input 
                  type="password"
                  placeholder="Enter your password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button 
                variant="outline" 
                onClick={() => { 
                  setShowDeleteDialog(false); 
                  setDeletePassword(""); 
                  setDeleteConfirmation(""); 
                }}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteAccount}
                disabled={deleteConfirmation !== "DELETE" || !deletePassword || isDeleting}
              >
                {isDeleting ? "Deleting..." : "Permanently Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* ── END DIALOG ── */}

    </div>
  );
}
