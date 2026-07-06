import { useState } from "react";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Settings2, Sliders, Bell, Palette, CalendarClock, RotateCcw } from "lucide-react";
import { toast } from "sonner";

const SECTIONS = [
  { id: "general", label: "General", icon: Settings2 },
  { id: "scoring", label: "Scoring Configuration", icon: Sliders },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "branding", label: "Report Branding", icon: Palette },
  { id: "cadence", label: "Assessment Frequency", icon: CalendarClock },
];

export default function SettingsPage() {
  const resetAllData = useStore((state) => state.resetAllData);
  const [active, setActive] = useState("general");

  // Form states
  const [workspaceName, setWorkspaceName] = useState("Maturity IQ Workspace");
  const [language, setLanguage] = useState("en");
  const [timezone, setTimezone] = useState("gst");
  const [fiscalYear, setFiscalYear] = useState("jan");
  const [darkMode, setDarkMode] = useState(false); // Default false for light mode
  const [autoSave, setAutoSave] = useState(true);
  const [requireSignoff, setRequireSignoff] = useState(false);

  // Scoring thresholds
  const [targetMaturity, setTargetMaturity] = useState("4.2");

  // Report Branding
  const [reportHeader, setReportHeader] = useState("Organization Capability Summary · Confidential");
  const [reportFooter, setReportFooter] = useState("© 2026. Prepared by Maturity IQ.");
  const [primaryColor, setPrimaryColor] = useState("#1E3A8A");
  const [accentColor, setAccentColor] = useState("#0EA5E9");
  const [disclaimer, setDisclaimer] = useState(
    "This report has been prepared for the exclusive use of the executive committee and board of directors."
  );

  const handleSaveChanges = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1000)),
      {
        loading: "Saving platform settings...",
        success: "Platform settings updated successfully!",
        error: "Failed to save settings",
      }
    );
  };

  const handleResetData = () => {
    if (confirm("WARNING: This will wipe out all custom assessments, questions answered, roadmap initiatives, and restore the default assessments database. Continue?")) {
      resetAllData();
      toast.success("Database restored to default seeds!");
      // Reload page to refresh state
      setTimeout(() => window.location.reload(), 800);
    }
  };

  return (
    <PageShell title="Settings" description="Configure the assessment platform and scoring system for your organization.">
      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
        <aside className="rounded-2xl border border-border bg-card p-3 shadow-sm h-fit">
          <ul className="space-y-1">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <button onClick={() => setActive(s.id)}
                  className={cn("w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-left transition cursor-pointer",
                    active === s.id ? "bg-primary text-primary-foreground font-semibold" : "hover:bg-muted text-muted-foreground hover:text-foreground")}>
                  <s.icon className="h-4 w-4" /> {s.label}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          {active === "general" && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-foreground">General Settings</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground">Workspace Name</Label>
                  <Input className="mt-1.5" value={workspaceName} onChange={(e) => setWorkspaceName(e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground">Default Language</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ar">Arabic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground">Time Zone</Label>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gst">GST (UAE)</SelectItem>
                      <SelectItem value="ast">AST (Saudi)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground">Fiscal Year Start</Label>
                  <Select value={fiscalYear} onValueChange={setFiscalYear}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="jan">January</SelectItem>
                      <SelectItem value="apr">April</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div className="text-sm font-semibold text-foreground">Enable dark mode by default</div>
                  <Switch checked={darkMode} onCheckedChange={setDarkMode} />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div className="text-sm font-semibold text-foreground">Auto-save draft assessments</div>
                  <Switch checked={autoSave} onCheckedChange={setAutoSave} />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div className="text-sm font-semibold text-foreground">Require executive sign-off before publishing</div>
                  <Switch checked={requireSignoff} onCheckedChange={setRequireSignoff} />
                </div>
              </div>

              <div className="pt-6 border-t border-border space-y-4">
                <h3 className="text-sm font-semibold text-rose-600">Danger Zone</h3>
                <div className="flex items-center justify-between rounded-lg border border-rose-200 bg-rose-50/20 dark:border-rose-900/40 p-4">
                  <div>
                    <div className="text-sm font-semibold text-foreground">Reset Platform Data</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Wipe all custom assessments, answers, files and restore initial seed database.</div>
                  </div>
                  <Button variant="destructive" onClick={handleResetData} className="gap-1.5 shrink-0">
                    <RotateCcw className="h-4 w-4" /> Reset Data
                  </Button>
                </div>
              </div>
            </div>
          )}

          {active === "scoring" && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-foreground">Scoring Configuration</h2>
              <p className="text-sm text-muted-foreground">Define maturity thresholds used across dashboards and reports.</p>
              
              <div className="space-y-3">
                {[
                  { l: "Initial", from: 0, to: 1.5, c: "bg-rose-500" },
                  { l: "Developing", from: 1.5, to: 2.5, c: "bg-orange-500" },
                  { l: "Defined", from: 2.5, to: 3.5, c: "bg-amber-500" },
                  { l: "Managed", from: 3.5, to: 4.5, c: "bg-emerald-500" },
                  { l: "Optimized", from: 4.5, to: 5.0, c: "bg-teal-500" },
                ].map((r) => (
                  <div key={r.l} className="grid grid-cols-[100px_1fr_80px_80px] items-center gap-4 rounded-lg border border-border p-4">
                    <div className="flex items-center gap-2">
                      <span className={cn("h-2.5 w-2.5 rounded-full", r.c)} />
                      <span className="text-sm font-semibold text-foreground">{r.l}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted">
                      <div className={cn("h-full rounded-full", r.c)} style={{ width: `${((r.to - r.from) / 5) * 100}%`, marginLeft: `${(r.from / 5) * 100}%` }} />
                    </div>
                    <Input defaultValue={r.from} type="number" step="0.1" className="h-8 text-xs font-semibold" />
                    <Input defaultValue={r.to} type="number" step="0.1" className="h-8 text-xs font-semibold" />
                  </div>
                ))}
              </div>
              
              <div className="max-w-xs">
                <Label className="text-xs font-semibold text-muted-foreground">Target Maturity Level</Label>
                <Input className="mt-1.5" value={targetMaturity} onChange={(e) => setTargetMaturity(e.target.value)} type="number" step="0.1" />
              </div>
            </div>
          )}

          {active === "notifications" && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-foreground">Notification Preferences</h2>
              <div className="space-y-3">
                {[
                  "Assessment assigned to me",
                  "Assessment submitted for review",
                  "New recommendation generated",
                  "Roadmap initiative status change",
                  "Quarterly maturity digest",
                ].map((label) => (
                  <div key={label} className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div className="text-sm font-semibold text-foreground">{label}</div>
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 text-xs font-medium text-foreground"><Switch defaultChecked /> Email</label>
                      <label className="flex items-center gap-2 text-xs font-medium text-foreground"><Switch /> In-app</label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {active === "branding" && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-foreground">Report Branding</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground">Report Header</Label>
                  <Input className="mt-1.5" value={reportHeader} onChange={(e) => setReportHeader(e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground">Report Footer</Label>
                  <Input className="mt-1.5" value={reportFooter} onChange={(e) => setReportFooter(e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground">Primary Color</Label>
                  <Input className="mt-1.5" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground">Accent Color</Label>
                  <Input className="mt-1.5" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} />
                </div>
                <div className="md:col-span-2">
                  <Label className="text-xs font-semibold text-muted-foreground">Cover Disclaimer</Label>
                  <Textarea className="mt-1.5 text-xs" rows={4} value={disclaimer} onChange={(e) => setDisclaimer(e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {active === "cadence" && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-foreground">Assessment Frequency</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: "Annual", desc: "Full maturity assessment run once per fiscal year." },
                  { title: "Semi-annual", desc: "Two full runs — mid-year and year-end reviews." },
                  { title: "Quarterly light-touch", desc: "Rolling assessment of business functions each quarter." },
                  { title: "Continuous", desc: "Always-on maturity monitoring with monthly deltas." },
                ].map((c, i) => (
                  <button key={c.title} className={cn("text-left rounded-xl border p-5 transition cursor-pointer bg-card", i === 0 ? "border-primary bg-primary/5 ring-1 ring-primary/30" : "border-border hover:border-primary/40")}>
                    <div className="text-sm font-semibold text-foreground">{c.title}</div>
                    <div className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{c.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 flex items-center justify-end gap-2 pt-6 border-t border-border">
            <Button variant="outline">Cancel</Button>
            <Button onClick={handleSaveChanges}>Save changes</Button>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
