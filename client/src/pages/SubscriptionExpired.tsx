import { useLocation } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { Crown, Mail, LogOut, ArrowRight, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { queryClient } from "@/lib/queryClient";

export default function SubscriptionExpired() {
  const [, navigate] = useHashLocation();

  async function handleLogout() {
    await fetch("/api/auth/login", { method: "POST" }); // Endpoint from routes.ts
    queryClient.setQueryData(["/api/auth/me"], null);
    navigate("/auth");
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full space-y-8">
        {/* Visual Header */}
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-2xl"
               style={{ background: "hsl(210,69%,16%)", border: "2px solid hsl(38,49%,57%)" }}>
            <Crown size={40} style={{ color: "hsl(38,49%,57%)" }} className="animate-pulse" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground" 
              style={{ fontFamily: "Playfair Display, serif" }}>
            Subscription <span style={{ color: "hsl(38,49%,57%)" }}>Expired</span>
          </h1>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Your trial period for <span className="font-semibold text-foreground">Bandhan & Co.</span> has concluded. 
            To continue managing your weddings and venues, please upgrade to a premium plan.
          </p>
        </div>

        {/* Action Card */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm space-y-6">
          <div className="space-y-4">
            <Button 
              className="w-full h-12 text-base font-semibold group"
              style={{ background: "hsl(210,69%,16%)", color: "white" }}
              onClick={() => window.open('mailto:support@bandhanandco.com?subject=Upgrade%20Request')}
            >
              Contact Rhythm to Upgrade
              <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Mail size={14} />
              <span>support@bandhanandco.com</span>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground tracking-widest">or</span></div>
          </div>

          <Button 
            variant="ghost" 
            className="w-full text-muted-foreground hover:text-foreground"
            onClick={handleLogout}
          >
            <LogOut size={16} className="mr-2" />
            Switch Account
          </Button>
        </div>

        {/* Footer Info */}
        <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-muted/50 w-fit mx-auto">
          <ShieldAlert size={14} className="text-muted-foreground" />
          <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
            Data is securely preserved but currently locked
          </p>
        </div>
      </div>
    </div>
  );
}