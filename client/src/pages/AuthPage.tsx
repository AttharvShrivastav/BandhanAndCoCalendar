import { useState } from "react";
import { useLocation } from "wouter";
import {
  Mail, Lock, Phone, Eye, EyeOff, ChevronRight,
  ArrowLeft, CheckCircle2, User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

// ── Types ─────────────────────────────────────────────────────────────────────
type Mode = "login" | "register";
type Method = "email" | "phone";

// ── Logo SVG ──────────────────────────────────────────────────────────────────
function BandhanLogo({ size = 32 }: { size?: number }) {
  return (
    <svg aria-label="Bandhan & Co." viewBox="0 0 32 32" fill="none" width={size} height={size}>
      <rect width="32" height="32" rx="6" fill="hsl(210,69%,16%)" />
      <path
        d="M9 7 L9 25 L18 25 C21.5 25 24 23 24 20 C24 18 22.5 16.5 20.5 16 C22 15.3 23 13.8 23 12 C23 9.2 20.8 7 18 7 Z"
        fill="none" stroke="#C8A45D" strokeWidth="1.6" strokeLinejoin="round"
      />
      <ellipse cx="16" cy="16" rx="4.5" ry="2.2" stroke="#C8A45D" strokeWidth="1.3" fill="none" opacity="0.85" />
      <ellipse cx="16" cy="16" rx="2.2" ry="4.5" stroke="#C8A45D" strokeWidth="1.3" fill="none" opacity="0.85" />
      <circle cx="16" cy="16" r="1.2" fill="#C8A45D" />
    </svg>
  );
}

// ── Decorative background ─────────────────────────────────────────────────────
function BgDecor() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <svg viewBox="0 0 600 600" className="absolute -top-24 -right-24 w-96 h-96 opacity-[0.04]" fill="none">
        <circle cx="300" cy="300" r="260" stroke="hsl(210,69%,16%)" strokeWidth="1" />
        <path d="M300 80 C220 80, 190 180, 300 300 C410 180, 380 80, 300 80Z" fill="hsl(210,69%,16%)" />
        <path d="M300 520 C220 520, 190 420, 300 300 C410 420, 380 520, 300 520Z" fill="hsl(38,49%,57%)" />
        <path d="M80 300 C80 220, 180 190, 300 300 C180 410, 80 380, 80 300Z" fill="hsl(38,49%,57%)" />
        <path d="M520 300 C520 220, 420 190, 300 300 C420 410, 520 380, 520 300Z" fill="hsl(210,69%,16%)" />
      </svg>
      <svg viewBox="0 0 400 400" className="absolute -bottom-20 -left-16 w-64 h-64 opacity-[0.04]" fill="none">
        <path d="M200 60 C150 60, 130 130, 200 200 C270 130, 250 60, 200 60Z" fill="hsl(38,49%,57%)" />
        <path d="M200 340 C150 340, 130 270, 200 200 C270 270, 250 340, 200 340Z" fill="hsl(210,69%,16%)" />
      </svg>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function AuthPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [mode, setMode] = useState<Mode>("register");
  const [method, setMethod] = useState<Method>("email");

  // Email fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Phone fields
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  const [loading, setLoading] = useState(false);

  // ── Handlers ────────────────────────────────────────────────────────────────
  // async function handleSendOtp() {
  //   if (!phone.trim() || phone.trim().length < 10) {
  //     toast({ title: "Enter a valid phone number", variant: "destructive" });
  //     return;
  //   }
    
  //   try {
  //     const res = await fetch("/api/auth/send-otp", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ phone }),
  //     });
  //     const data = await res.json();
      
  //     if (!res.ok) throw new Error(data.error);

  //     setOtpSent(true);
  //     toast({ title: "OTP sent", description: `Use code 123456 for testing.` });
  //   } catch (err: any) {
  //     toast({ title: "Verification Failed", description: err.message, variant: "destructive" });
  //   }
  // }

  // async function handleVerifyOtp() {
  //   if (otp.trim().length !== 6) {
  //     toast({ title: "Enter the 6-digit OTP", variant: "destructive" });
  //     return;
  //   }
    
  //   try {
  //     const res = await fetch("/api/auth/verify-otp", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ phone, otp }),
  //     });
  //     const data = await res.json();
      
  //     if (!res.ok) throw new Error(data.error);

  //     setOtpVerified(true);
  //     toast({ title: "Phone verified", description: "Logging you in..." });
      
  //     // Update session state
  //     await queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      
  //     setTimeout(() => {
  //       if (data.user?.role === "superadmin") {
  //         navigate("/app/superadmin");
  //       } else {
  //         navigate("/app");
  //       }
  //     }, 600);

  //   } catch (err: any) {
  //     toast({ title: "Invalid OTP", description: err.message, variant: "destructive" });
  //   }
  // }

  async function handleSendOtp() {
    if (!phone.trim() || phone.trim().length < 10) {
      toast({ title: "Enter a valid phone number", variant: "destructive" });
      return;
    }
    
    try {
      // FIX: Pass the raw object. apiRequest handles the JSON.stringify securely!
      const res = await apiRequest("POST", "/api/auth/send-otp", { phone });
      
      setOtpSent(true);
      toast({ title: "OTP sent", description: `Use code 123456 for testing.` });
    } catch (err: any) {
      toast({ title: "Verification Failed", description: err.message, variant: "destructive" });
    }
  }

  async function handleVerifyOtp() {
    if (otp.trim().length !== 6) {
      toast({ title: "Enter the 6-digit OTP", variant: "destructive" });
      return;
    }
    
    try {
      // FIX: Pass the raw object here as well!
      const res = await apiRequest("POST", "/api/auth/verify-otp", { phone, otp });
      const data = await res.json();

      setOtpVerified(true);
      toast({ title: "Phone verified", description: "Logging you in..." });
      
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      
      setTimeout(() => {
        if (data.user?.role === "superadmin") {
          navigate("/app/superadmin");
        } else {
          navigate("/app");
        }
      }, 600);

    } catch (err: any) {
      toast({ title: "Invalid OTP", description: err.message, variant: "destructive" });
    }
  }

  // async function handleSubmit(e: React.FormEvent) {
  //   e.preventDefault();
  //   setLoading(true);

  //   try {
  //     if (method === "email") {
  //       if (!email.trim()) { toast({ title: "Email is required", variant: "destructive" }); return; }
  //       if (!password) { toast({ title: "Password is required", variant: "destructive" }); return; }
        
  //       let res;
        
  //       if (mode === "register") {
  //         if (!name.trim()) { toast({ title: "Your name is required", variant: "destructive" }); return; }
  //         if (password.length < 6) { toast({ title: "Password must be at least 6 characters", variant: "destructive" }); return; }
  //         if (password !== confirmPassword) { toast({ title: "Passwords do not match", variant: "destructive" }); return; }
          
  //         res = await fetch("/api/auth/register", {
  //           method: "POST",
  //           headers: { "Content-Type": "application/json" },
  //           body: JSON.stringify({ name, email, password, phone: phone || undefined }),
  //         });
  //       } else {
  //         // Login Mode
  //         // res = await fetch("/api/auth/login", {
  //         //   method: "POST",
  //         //   headers: { "Content-Type": "application/json" },
  //         //   body: JSON.stringify({ email, password }),
  //         // });

  //         const res = await apiRequest("POST", "/api/auth/login", data);
  //       }

  //       const data = await res.json();

  //       // Handle Backend Errors (Wrong password, email taken, trial expired, etc.)
  //       if (!res.ok) {
  //         toast({ title: isLogin ? "Login Failed" : "Registration Failed", description: data.error || "Please check your credentials.", variant: "destructive" });
  //         return;
  //       }

  //       // Tell React Query that the user session has changed
  //       await queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });

  //       toast({ title: mode === "register" ? "Account created!" : "Welcome back!", description: "Securing your session..." });
        
  //       // Smart Routing based on the user's role
  //       setTimeout(() => {
  //         if (data.user?.role === "superadmin") {
  //           navigate("/app/superadmin");
  //         } else {
  //           navigate("/app");
  //         }
  //       }, 600);

  //     } else {return}
  //   } catch (err) {
  //     toast({ title: "Network Error", description: "Could not reach the server.", variant: "destructive" });
  //   } finally {
  //     setLoading(false);
  //   }
  // }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      if (method === "email") {
        if (!email.trim()) { toast({ title: "Email is required", variant: "destructive" }); return; }
        if (!password) { toast({ title: "Password is required", variant: "destructive" }); return; }
        
        let res;
        
        if (mode === "register") {
          if (!name.trim()) { toast({ title: "Your name is required", variant: "destructive" }); return; }
          if (password.length < 6) { toast({ title: "Password must be at least 6 characters", variant: "destructive" }); return; }
          if (password !== confirmPassword) { toast({ title: "Passwords do not match", variant: "destructive" }); return; }
          
          // FIX 1: Use apiRequest for Registration
          res = await apiRequest("POST", "/api/auth/register", { name, email, password, phone: phone || undefined });
        } else {
          // FIX 2: Removed 'const' and passed { email, password } instead of 'data'
          res = await apiRequest("POST", "/api/auth/login", { email, password, rememberMe });
        }

        const data = await res.json();

        // Tell React Query that the user session has changed
        await queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });

        toast({ title: mode === "register" ? "Account created!" : "Welcome back!", description: "Securing your session..." });
        
        // Smart Routing based on the user's role
        setTimeout(() => {
          if (data.user?.role === "superadmin") {
            navigate("/app/superadmin");
          } else {
            navigate("/app");
          }
        }, 600);

      } else {
        return;
      }
    } catch (err: any) {
      // FIX 3: Because apiRequest throws actual errors, we need the catch block to read err.message!
      toast({ 
        title: isLogin ? "Login Failed" : "Registration Failed", 
        description: err.message || "Could not reach the server.", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  }

  const isLogin = mode === "login";

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <BgDecor />

      {/* Nav */}
      <nav className="px-8 py-4 flex items-center justify-between border-b border-border bg-card/80 backdrop-blur sticky top-0 z-40 relative">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2.5 group"
        >
          <BandhanLogo size={28} />
          <span className="text-lg font-semibold group-hover:opacity-80 transition-opacity" style={{ fontFamily: "Playfair Display, serif" }}>
            Bandhan <span style={{ color: "hsl(38,49%,57%)" }}>&amp; Co.</span>
          </span>
        </button>
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={14} /> Back to Home
        </button>
      </nav>

      {/* Main card */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 relative">
        <div className="w-full max-w-md">

          {/* Header */}
          <div className="text-center mb-8">
            <div
              className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-md"
              style={{ background: "hsl(210,69%,16%)" }}
            >
              <BandhanLogo size={28} />
            </div>
            <h1
              className="text-3xl font-light mb-1"
              style={{ fontFamily: "Playfair Display, serif" }}
            >
              {isLogin ? "Welcome back" : "Create your account"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isLogin
                ? "Sign in to access your wedding calendar"
                : "Start managing weddings beautifully"}
            </p>
          </div>

          {/* Card */}
          <div className="bg-card border border-border rounded-2xl shadow-lg overflow-hidden">

            {/* Mode toggle */}
            <div className="flex border-b border-border">
              {(["register", "login"] as Mode[]).map(m => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setOtpSent(false); setOtpVerified(false); setOtp(""); }}
                  className="flex-1 py-3.5 text-sm font-medium transition-colors relative"
                  style={{
                    color: mode === m ? "hsl(210,69%,16%)" : "hsl(var(--muted-foreground))",
                    background: mode === m ? "hsl(210,69%,16%,0.06)" : "transparent",
                  }}
                >
                  {m === "register" ? "Create Account" : "Sign In"}
                  {mode === m && (
                    <span
                      className="absolute bottom-0 left-0 right-0 h-0.5"
                      style={{ background: "hsl(210,69%,16%)" }}
                    />
                  )}
                </button>
              ))}
            </div>

            <div className="p-6">
              {/* Method toggle */}
              <div
                className="flex gap-1 p-1 rounded-lg mb-6"
                style={{ background: "hsl(var(--muted))" }}
              >
                {(["email", "phone"] as Method[]).map(m => (
                  <button
                    key={m}
                    onClick={() => { setMethod(m); setOtpSent(false); setOtpVerified(false); setOtp(""); }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-medium transition-all"
                    style={{
                      background: method === m ? "hsl(var(--card))" : "transparent",
                      color: method === m ? "hsl(210,69%,16%)" : "hsl(var(--muted-foreground))",
                      boxShadow: method === m ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                    }}
                  >
                    {m === "email" ? <><Mail size={13} /> Email</> : <><Phone size={13} /> Phone</>}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">

                {/* ── Email method ── */}
                {method === "email" && (
                  <>
                    {/* Name — register only */}
                    {!isLogin && (
                      <div>
                        <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                          Your Name *
                        </label>
                        <div className="relative">
                          <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="e.g. Priya Mehta"
                            className="pl-9"
                            data-testid="input-name"
                          />
                        </div>
                      </div>
                    )}

                    {/* Email */}
                    <div>
                      <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                        Email Address *
                      </label>
                      <div className="relative">
                        <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type="email"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="pl-9"
                          data-testid="input-email"
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-medium text-muted-foreground">
                          Password *
                        </label>
                        {isLogin && (
                          <button
                            type="button"
                            className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                          >
                            Forgot password?
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          placeholder={isLogin ? "Your password" : "Min. 6 characters"}
                          className="pl-9 pr-10"
                          data-testid="input-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(p => !p)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>

                    {/* NEW: Remember Me Checkbox */}
                    {isLogin && (
                      <div className="flex items-center gap-2 mt-3 pl-1">
                        <input 
                          type="checkbox" 
                          id="remember" 
                          checked={rememberMe} 
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="w-3.5 h-3.5 rounded border-muted-foreground text-[hsl(210,69%,16%)] focus:ring-[hsl(210,69%,16%)]"
                        />
                        <label htmlFor="remember" className="text-xs text-muted-foreground cursor-pointer select-none">
                          Keep me signed in for 30 days
                        </label>
                      </div>
                    )}

                    {/* Confirm password — register only */}
                    {!isLogin && (
                      <div>
                        <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                          Confirm Password *
                        </label>
                        <div className="relative">
                          <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            type={showConfirm ? "text" : "password"}
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            placeholder="Repeat your password"
                            className="pl-9 pr-10"
                            data-testid="input-confirm-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirm(p => !p)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                        {/* Password strength hint */}
                        {password && (
                          <div className="mt-1.5 flex gap-1">
                            {[1, 2, 3].map(i => (
                              <div
                                key={i}
                                className="h-1 flex-1 rounded-full transition-colors"
                                style={{
                                  background: password.length >= i * 4
                                    ? i === 1 ? "#e74c3c" : i === 2 ? "#f39c12" : "#27ae60"
                                    : "hsl(var(--muted))",
                                }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}

                {/* ── Phone method ── */}
                {method === "phone" && (
                  <>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                        Mobile Number *
                      </label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            type="tel"
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            placeholder="+91 98765 43210"
                            className="pl-9"
                            disabled={otpVerified}
                            data-testid="input-phone"
                          />
                        </div>
                        {!otpVerified && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleSendOtp}
                            className="whitespace-nowrap px-4 text-xs"
                            style={otpSent ? {} : { borderColor: "hsl(210,69%,16%)", color: "hsl(210,69%,16%)" }}
                          >
                            {otpSent ? "Resend OTP" : "Send OTP"}
                          </Button>
                        )}
                      </div>
                    </div>

                    {otpSent && !otpVerified && (
                      <div>
                        <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                          Enter OTP
                        </label>
                        <div className="flex gap-2">
                          <Input
                            value={otp}
                            onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                            placeholder="6-digit code"
                            maxLength={6}
                            className="tracking-widest text-center font-mono text-base"
                            data-testid="input-otp"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleVerifyOtp}
                            className="whitespace-nowrap px-4 text-xs"
                            style={{ borderColor: "hsl(210,69%,16%)", color: "hsl(210,69%,16%)" }}
                          >
                            Verify
                          </Button>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1.5">
                          Didn't receive it? Check spam or{" "}
                          <button type="button" onClick={handleSendOtp} className="underline hover:text-foreground transition-colors">
                            resend
                          </button>
                        </p>
                      </div>
                    )}

                    {otpVerified && (
                      <div
                        className="flex items-center gap-2 text-sm rounded-lg px-3 py-2.5"
                        style={{ background: "hsla(142,55%,40%,0.1)", color: "#16a34a" }}
                      >
                        <CheckCircle2 size={15} className="flex-shrink-0" />
                        <span className="font-medium">Phone verified — {phone}</span>
                      </div>
                    )}
                  </>
                )}

                {/* Divider */}
                <div className="flex items-center gap-3 py-1">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-[11px] text-muted-foreground">or continue with</span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                {/* Google button (visual only) */}
                <button
                  type="button"
                  onClick={() => {
                    toast({ title: "Google sign-in", description: "Coming soon in a future update." });
                  }}
                  className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-lg border border-border hover:bg-muted/50 transition-colors text-sm font-medium"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Continue with Google
                </button>

                {/* Submit */}
                <Button
                  type="submit"
                  className="w-full gap-2 mt-1"
                  disabled={loading || (method === "phone" && !otpVerified)}
                  style={{ background: "hsl(210,69%,16%)", color: "#fff" }}
                  data-testid="button-submit-auth"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      {isLogin ? "Signing in…" : "Creating account…"}
                    </span>
                  ) : (
                    <>
                      {isLogin ? "Sign In" : "Create Account"}
                      <ChevronRight size={15} />
                    </>
                  )}
                </Button>

              </form>
            </div>

            {/* Footer */}
            <div className="px-6 pb-5 text-center text-xs text-muted-foreground">
              {isLogin ? (
                <>
                  Don't have an account?{" "}
                  <button
                    onClick={() => setMode("register")}
                    className="font-medium hover:text-foreground transition-colors"
                    style={{ color: "hsl(210,69%,16%)" }}
                  >
                    Create one
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    onClick={() => setMode("login")}
                    className="font-medium hover:text-foreground transition-colors"
                    style={{ color: "hsl(210,69%,16%)" }}
                  >
                    Sign in
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Terms */}
          <p className="text-center text-[11px] text-muted-foreground mt-5 leading-relaxed">
            By continuing you agree to Bandhan &amp; Co.'s{" "}
            <button className="underline hover:text-foreground transition-colors">Terms of Service</button>
            {" "}and{" "}
            <button className="underline hover:text-foreground transition-colors">Privacy Policy</button>.
          </p>
        </div>
      </div>
    </div>
  );
}
