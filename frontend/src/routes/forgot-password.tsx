import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BarChart3, ArrowLeft, MailCheck } from "lucide-react";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your work email");
      return;
    }

    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1200)),
      {
        loading: "Sending reset instructions...",
        success: () => {
          setSubmitted(true);
          return "Password reset link sent to your inbox!";
        },
        error: "Failed to send reset link."
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-muted/20">
      <div className="w-full max-w-sm bg-card border border-border p-8 rounded-2xl shadow-sm space-y-6">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <BarChart3 className="h-4 w-4" />
          </div>
          <span className="font-semibold text-foreground">Maturity IQ</span>
        </div>

        {!submitted ? (
          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-xl font-bold tracking-tight text-foreground">Reset your password</h2>
              <p className="text-xs text-muted-foreground">
                Enter your work email address and we'll send you instructions to reset your password.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Work email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  className="mt-1.5"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full">Send reset link</Button>
            </form>
          </div>
        ) : (
          <div className="space-y-4 text-center py-2">
            <div className="h-12 w-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
              <MailCheck className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-foreground font-bold">Check your inbox</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                We've sent recovery details to <span className="font-semibold text-foreground">{email}</span>. Click the link in the email to define a new password.
              </p>
            </div>
            <Button variant="outline" className="w-full" onClick={() => setSubmitted(false)}>
              Resend email
            </Button>
          </div>
        )}

        <div className="border-t border-border pt-4 text-center">
          <Link to="/login" className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1.5">
            <ArrowLeft className="h-3 w-3" /> Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
