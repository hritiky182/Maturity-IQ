import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BarChart3, Building2, ShieldCheck, Key } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";

export default function LoginPage() {
  const navigate = useNavigate();
  const loginUser = useStore((state) => state.loginUser);

  const [email, setEmail] = useState("sarah.malik@maturityiq.com");
  const [password, setPassword] = useState("password123");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password credentials.");
      return;
    }

    const success = loginUser(email, password);
    if (success) {
      const user = useStore.getState().currentUser;
      toast.success(`Welcome back, ${user?.fullName}!`);
      if (user?.role === "Admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }
    } else {
      toast.error("Invalid credentials. Please verify your email and password.");
    }
  };

  const handleSSO = () => {
    // Authenticate as a default organization user
    const success = loginUser("sarah.malik@maturityiq.com", "password123");
    if (success) {
      toast.success("Workspace authenticated via SSO!");
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-primary via-primary to-primary/70 text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-white/40 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-white/30 blur-3xl" />
        </div>
        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-semibold tracking-tight">Maturity IQ</div>
            <div className="text-[11px] opacity-80">Enterprise Edition</div>
          </div>
        </div>

        <div className="relative max-w-md">
          <div className="text-[11px] font-semibold uppercase tracking-widest opacity-80">Enterprise Assessment Platform</div>
          <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight">
            The maturity operating system for modern enterprises.
          </h1>
          <p className="mt-4 text-sm opacity-90 leading-relaxed">
            Score business functions, close gaps and drive board-ready transformation roadmaps.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              { k: "50+", v: "Enterprises" },
              { k: "200+", v: "Assessments" },
              { k: "8+", v: "Functions" },
            ].map((s) => (
              <div key={s.k}>
                <div className="text-2xl font-semibold tabular-nums">{s.k}</div>
                <div className="text-[11px] opacity-80">{s.v}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex items-center gap-2 text-xs opacity-80">
          <ShieldCheck className="h-4 w-4" /> SOC 2 Type II · ISO 27001 · GDPR ready
        </div>
      </div>

      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2 lg:hidden mb-8">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <BarChart3 className="h-4 w-4" />
            </div>
            <span className="font-semibold">Maturity IQ</span>
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">Sign in to your workspace</h2>
          <p className="mt-1 text-sm text-muted-foreground">Continue to your assessment cycle.</p>

          <form className="mt-8 space-y-4" onSubmit={handleLogin}>
            <div>
              <Label htmlFor="email">Work email</Label>
              <Input
                id="email"
                type="email"
                className="mt-1.5"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link className="text-xs text-primary hover:underline" to="/forgot-password">Forgot?</Link>
              </div>
              <Input
                id="password"
                type="password"
                className="mt-1.5"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full">Sign in</Button>
          </form>

          {/* TESTING CREDENTIALS HELPER */}
          <div className="mt-4 p-3 bg-muted/40 border border-border rounded-lg space-y-2 text-xs">
            <div className="font-semibold text-foreground flex items-center gap-1.5">
              <Key className="h-3.5 w-3.5 text-primary" /> Test Accounts
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px] leading-relaxed">
              <div>
                <span className="font-medium text-foreground block">Admin Console:</span>
                email: <code className="bg-muted px-1 rounded select-all">admin@maturityiq.com</code><br/>
                pass: <code className="bg-muted px-1 rounded">admin123</code>
              </div>
              <div>
                <span className="font-medium text-foreground block">Organization User:</span>
                email: <code className="bg-muted px-1 rounded select-all font-sans">sarah.malik@maturityiq.com</code><br/>
                pass: <code className="bg-muted px-1 rounded">password123</code>
              </div>
            </div>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center"><span className="bg-background px-2 text-xs text-muted-foreground">or</span></div>
          </div>

          <Button variant="outline" className="w-full" onClick={handleSSO}>
            <Building2 className="h-4 w-4 mr-2" /> Continue with SSO
          </Button>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            Need an account? <Link to="/register" className="text-primary font-medium hover:underline">Register & complete onboarding</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
