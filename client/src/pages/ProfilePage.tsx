import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  User, Building2, Phone, Mail, MapPin, ChevronRight, ArrowLeft,
  CheckCircle2, Camera,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

// Profile is stored via the backend API so it persists across devices
export interface PlannerProfile {
  plannerName: string;
  businessName: string;
  phone: string;
  email: string;
  city: string;
  speciality: string;
  bio: string;
  setupComplete: boolean;
}

const EMPTY_PROFILE: PlannerProfile = {
  plannerName: "", businessName: "", phone: "", email: "",
  city: "", speciality: "wedding", bio: "", setupComplete: false,
};

const SPECIALITIES = [
  { value: "wedding", label: "Wedding Planner" },
  { value: "venue", label: "Venue Owner / Manager" },
  { value: "coordinator", label: "Event Coordinator" },
  { value: "decorator", label: "Decorator / Florist" },
  { value: "photographer", label: "Photographer / Videographer" },
  { value: "caterer", label: "Caterer" },
  { value: "other", label: "Other" },
];

// ── Profile API helpers (sample-data mode: in-memory only) ───────────────────
import { getProfile as mockGetProfile, updateProfile as mockUpdateProfile } from "@/lib/mockApi";

export async function loadProfile(): Promise<PlannerProfile> {
  try {
    const data = mockGetProfile() as any;
    return { ...EMPTY_PROFILE, ...data };
  } catch {
    return EMPTY_PROFILE;
  }
}

export async function saveProfile(profile: PlannerProfile): Promise<void> {
  mockUpdateProfile(profile as any);
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [profile, setProfile] = useState<PlannerProfile>(EMPTY_PROFILE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const isSetup = !profile.setupComplete;

  useEffect(() => {
    loadProfile().then(p => { setProfile(p); setLoading(false); });
  }, []);

  function set(field: keyof PlannerProfile, value: string | boolean) {
    setProfile(prev => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    if (!profile.plannerName.trim()) {
      toast({ title: "Your name is required", variant: "destructive" }); return;
    }
    setSaving(true);
    try {
      const updated = { ...profile, setupComplete: true };
      await saveProfile(updated);
      setProfile(updated);
      toast({ title: "Profile saved", description: `Welcome, ${profile.plannerName}!` });
      setTimeout(() => navigate("/app"), 600);
    } catch {
      toast({ title: "Could not save profile", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="px-8 py-4 flex items-center justify-between border-b border-border bg-card sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <svg viewBox="0 0 32 32" fill="none" width="26" height="26">
            <rect width="32" height="32" rx="6" fill="hsl(210,69%,16%)"/>
            <path d="M9 7 L9 25 L18 25 C21.5 25 24 23 24 20 C24 18 22.5 16.5 20.5 16 C22 15.3 23 13.8 23 12 C23 9.2 20.8 7 18 7 Z" fill="none" stroke="#C8A45D" strokeWidth="1.6" strokeLinejoin="round"/>
            <ellipse cx="16" cy="16" rx="4.5" ry="2.2" stroke="#C8A45D" strokeWidth="1.3" fill="none" opacity="0.85"/>
            <ellipse cx="16" cy="16" rx="2.2" ry="4.5" stroke="#C8A45D" strokeWidth="1.3" fill="none" opacity="0.85"/>
            <circle cx="16" cy="16" r="1.2" fill="#C8A45D"/>
          </svg>
          <span className="text-base font-semibold" style={{ fontFamily: "Playfair Display, serif" }}>Bandhan <span style={{ color: "hsl(38,49%,57%)" }}>&amp; Co.</span></span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
            <ArrowLeft size={13} /> Back to Home
          </button>
          {profile.setupComplete && (
            <Button size="sm" variant="outline" onClick={() => navigate("/app")}>
              Open Calendar
            </Button>
          )}
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8 text-center">
          {/* Avatar ring */}
          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center relative"
            style={{ background: "hsl(210,69%,16%)" }}>
            {profile.plannerName ? (
              <span className="text-white text-xl font-semibold" style={{ fontFamily: "Playfair Display, serif" }}>
                {profile.plannerName.charAt(0).toUpperCase()}
              </span>
            ) : (
              <User size={22} className="text-white" />
            )}
          </div>
          <h1 className="text-3xl font-light" style={{ fontFamily: "Playfair Display, serif" }}>
            {isSetup ? "Set up your profile" : "Your Profile"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isSetup
              ? "Tell us a bit about yourself so Bandhan \u0026 Co. can personalise your experience"
              : "Manage your planner details"}
          </p>
        </div>

        {/* Form */}
        <div className="space-y-5">

          {/* Personal */}
          <section className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-border bg-muted/30 flex items-center gap-2">
              <User size={13} className="text-muted-foreground" />
              <span className="text-sm font-semibold">Personal Details</span>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Your Name *</label>
                <Input
                  value={profile.plannerName}
                  onChange={e => set("plannerName", e.target.value)}
                  placeholder="e.g. Priya Mehta"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">Phone</label>
                  <div className="relative">
                    <Phone size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={profile.phone}
                      onChange={e => set("phone", e.target.value)}
                      placeholder="+91 98765 43210"
                      className="pl-8"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">Email</label>
                  <div className="relative">
                    <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={profile.email}
                      onChange={e => set("email", e.target.value)}
                      placeholder="you@example.com"
                      type="email"
                      className="pl-8"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">City</label>
                <div className="relative">
                  <MapPin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={profile.city}
                    onChange={e => set("city", e.target.value)}
                    placeholder="e.g. Mumbai, Jaipur, Delhi"
                    className="pl-8"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Business */}
          <section className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-border bg-muted/30 flex items-center gap-2">
              <Building2 size={13} className="text-muted-foreground" />
              <span className="text-sm font-semibold">Business Details</span>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Business / Company Name</label>
                <Input
                  value={profile.businessName}
                  onChange={e => set("businessName", e.target.value)}
                  placeholder="e.g. Shubh Aarohan Events"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">I am a…</label>
                <div className="grid grid-cols-2 gap-2">
                  {SPECIALITIES.map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => set("speciality", value)}
                      className="text-xs px-3 py-2 rounded-lg border text-left transition-all"
                      style={{
                        borderColor: profile.speciality === value ? "hsl(210,69%,16%)" : "hsl(var(--border))",
                        background: profile.speciality === value ? "hsl(210,69%,16%,0.08)" : "transparent",
                        color: profile.speciality === value ? "hsl(210,69%,16%)" : "hsl(var(--muted-foreground))",
                        fontWeight: profile.speciality === value ? 500 : 400,
                      }}
                    >
                      {profile.speciality === value && <CheckCircle2 size={11} className="inline mr-1.5" />}
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Short Bio / Note <span className="opacity-60">(optional)</span></label>
                <textarea
                  value={profile.bio}
                  onChange={e => set("bio", e.target.value)}
                  placeholder="e.g. Specialising in destination weddings across Rajasthan since 2015"
                  rows={2}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>
          </section>

          {/* Save */}
          <Button
            className="w-full"
            size="lg"
            onClick={handleSave}
            disabled={saving}
            style={{ background: "hsl(210,69%,16%)", color: "#fff" }}
          >
            {saving ? "Saving…" : isSetup ? "Save & Open Calendar" : "Update Profile"}
            {!saving && <ChevronRight size={16} className="ml-2" />}
          </Button>

          {isSetup && (
            <button
              onClick={() => navigate("/app")}
              className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              Skip for now — open calendar directly
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
