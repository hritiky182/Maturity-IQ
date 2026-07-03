import { useState, useMemo } from "react";
import { PageShell } from "@/components/page-shell";
import { useStore, User } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, FileJson, Database, ShieldAlert, Plus, RefreshCw, Trash2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { INDUSTRY_TEMPLATES, FUNCTION_DEFS } from "@/lib/mock-data";

export default function AdminSettingsPage() {
  const users = useStore((state) => state.users);
  const organizations = useStore((state) => state.organizations);
  const resetAllData = useStore((state) => state.resetAllData);

  // Tab State
  const [activeTab, setActiveTab] = useState("users");

  // User management state
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState<User["role"]>("Organization User");
  const [newUserOrgId, setNewUserOrgId] = useState("");

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) {
      toast.error("Please fill in the user name and email fields.");
      return;
    }

    // Add user to Zustand store (temporary addition for UI representation)
    const newUser: User = {
      id: `u-new-${users.length + 1}`,
      fullName: newUserName,
      email: newUserEmail,
      role: newUserRole,
      organizationId: newUserRole === "Admin" ? null : newUserOrgId || null,
      password: "password123",
    };

    useStore.setState((state) => ({
      users: [...state.users, newUser],
    }));

    toast.success(`Successfully added ${newUserName} as ${newUserRole}.`);
    setNewUserName("");
    setNewUserEmail("");
  };

  const handleResetData = () => {
    if (confirm("WARNING: This will reset all organization profiles, assessments, uploaded answers and custom roadmap items back to seeded defaults. Proceed?")) {
      resetAllData();
      toast.success("Database restored to seeded defaults successfully.");
    }
  };

  // Simulated Audit Logs
  const auditLogs = [
    { time: "2026-07-03 10:24:18", user: "admin@maturityiq.com", action: "User Registration finalization", target: "Cleveland Clinic Abu Dhabi", status: "Success", ip: "192.168.1.45" },
    { time: "2026-07-03 09:12:05", user: "admin@maturityiq.com", action: "System Seed Restoration", target: "All Databases", status: "Success", ip: "192.168.1.45" },
    { time: "2026-07-02 16:44:32", user: "sarah.malik@emaarproperties.com", action: "Maturity Report Generated", target: "Emaar Properties PDF", status: "Success", ip: "85.24.112.5" },
    { time: "2026-07-02 15:30:11", user: "ahmed.nuaimi@cleveland.com", action: "Evaluation Parameter Saved", target: "Question IT-s0-q2", status: "Success", ip: "85.24.112.9" },
    { time: "2026-07-02 14:18:22", user: "admin@maturityiq.com", action: "Admin Panel Console Access", target: "Security Configs", status: "Success", ip: "192.168.1.45" },
  ];

  return (
    <PageShell title="Console Settings" description="Configure global templates, manage user access, audit security logs, and administer database records.">
      
      {/* Navigation tabs */}
      <div className="flex border-b border-border gap-4 pb-2 mb-6">
        {[
          { id: "users", label: "User Access", icon: Users },
          { id: "templates", label: "Industry Templates", icon: FileJson },
          { id: "database", label: "Database Operations", icon: Database },
          { id: "audit", label: "Audit Logs", icon: ShieldAlert },
        ].map((tab) => {
          const active = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-1.5 pb-2 text-xs font-semibold border-b-2 transition cursor-pointer",
                active ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <tab.icon className="h-4 w-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* USER ACCESS TAB */}
      {activeTab === "users" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add User form */}
          <Card className="rounded-xl border-border bg-card shadow-sm h-fit">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Provision New User</CardTitle>
              <CardDescription className="text-[10px]">Create administrator accounts or bind users to organization profiles.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddUser} className="space-y-4 text-xs">
                <div>
                  <Label>Full Name</Label>
                  <Input className="mt-1.5 h-8 text-xs" placeholder="e.g. David Miller" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} />
                </div>
                <div>
                  <Label>Email Address</Label>
                  <Input type="email" className="mt-1.5 h-8 text-xs" placeholder="david.miller@company.com" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} />
                </div>
                <div>
                  <Label>System Role</Label>
                  <Select value={newUserRole} onValueChange={(val: User["role"]) => setNewUserRole(val)}>
                    <SelectTrigger className="mt-1.5 h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Admin">System Admin</SelectItem>
                      <SelectItem value="Organization User">Organization User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {newUserRole === "Organization User" && (
                  <div>
                    <Label>Organization Workspace</Label>
                    <Select value={newUserOrgId} onValueChange={setNewUserOrgId}>
                      <SelectTrigger className="mt-1.5 h-8 text-xs"><SelectValue placeholder="Select Organization" /></SelectTrigger>
                      <SelectContent>
                        {organizations.map((org) => (
                          <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <Button type="submit" className="w-full h-8 text-xs gap-1">
                  <Plus className="h-3.5 w-3.5" /> Add User
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Users List */}
          <Card className="rounded-xl border-border bg-card shadow-sm lg:col-span-2 overflow-hidden">
            <CardHeader className="border-b border-border">
              <CardTitle className="text-sm font-semibold">Active User Registry</CardTitle>
              <CardDescription className="text-[10px]">Registry of credentialed users authorized to access strategy dashboards.</CardDescription>
            </CardHeader>
            <div className="overflow-x-auto max-h-[350px] overflow-y-auto text-xs">
              <table className="w-full">
                <thead className="bg-muted/30 border-b border-border">
                  <tr>
                    <th className="py-2.5 px-4 text-left font-semibold text-muted-foreground">User Profile</th>
                    <th className="py-2.5 px-4 text-left font-semibold text-muted-foreground">Email</th>
                    <th className="py-2.5 px-4 text-center font-semibold text-muted-foreground">Role</th>
                    <th className="py-2.5 px-4 text-right font-semibold text-muted-foreground">Workspace</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {users.map((u) => {
                    const org = organizations.find((o) => o.id === u.organizationId);
                    return (
                      <tr key={u.id} className="hover:bg-muted/15 transition">
                        <td className="py-2.5 px-4 font-semibold text-foreground">{u.fullName}</td>
                        <td className="py-2.5 px-4 text-muted-foreground">{u.email}</td>
                        <td className="py-2.5 px-4 text-center">
                          <span className={cn("text-[9px] px-1.5 py-0.5 rounded font-semibold border",
                            u.role === "Admin" ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-blue-50 text-blue-700 border-blue-200"
                          )}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-right text-muted-foreground max-w-[150px] truncate">
                          {org ? org.name : "Global Administration"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* INDUSTRY TEMPLATES TAB */}
      {activeTab === "templates" && (
        <div className="space-y-4">
          {INDUSTRY_TEMPLATES.map((temp) => (
            <Card key={temp.id} className="rounded-xl border-border bg-card shadow-sm">
              <CardHeader className="border-b border-border/60 pb-3 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold text-primary">{temp.name} Industry Template</CardTitle>
                  <CardDescription className="text-[10px]">Custom evaluation parameters calibrated for the {temp.name} sector.</CardDescription>
                </div>
                <span className="text-[9px] font-bold bg-primary/10 border border-primary/20 text-primary px-2 py-0.5 rounded uppercase">
                  {temp.functions.length} Active Business Functions
                </span>
              </CardHeader>
              <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                {temp.functions.map((f) => (
                  <div key={f.id} className="border border-border/60 p-3 rounded-lg bg-muted/5 leading-normal">
                    <span className="font-semibold text-foreground text-xs block mb-1">{f.name}</span>
                    <span className="text-[10px] text-muted-foreground block">
                      Categories: {f.sections.slice(0, 3).join(", ")}{f.sections.length > 3 && "..."}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* DATABASE MANAGEMENT TAB */}
      {activeTab === "database" && (
        <div className="space-y-6 max-w-xl">
          <Card className="rounded-xl border-border bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Seed Restoration Operations</CardTitle>
              <CardDescription className="text-[10px]">Restores all databases and local storage keys back to seed states.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <p className="text-muted-foreground leading-relaxed">
                Running a seed database restoration will clear all custom organization registrations, baseline answers, custom uploads, and transformation initiatives. This is primarily useful during demonstration testing of the onboarding workflow.
              </p>
              <div className="flex gap-2.5">
                <Button variant="outline" className="gap-1.5 h-8 text-xs cursor-pointer" onClick={handleResetData}>
                  <RefreshCw className="h-4 w-4" /> Reset database
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-rose-200 dark:border-rose-950/40 bg-rose-50/10 dark:bg-rose-950/5 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-rose-600 dark:text-rose-400">Danger Zone Operations</CardTitle>
              <CardDescription className="text-[10px]">Destructive admin operations affecting system-wide workspace tables.</CardDescription>
            </CardHeader>
            <CardContent className="text-xs space-y-4">
              <p className="text-rose-600/80 leading-relaxed">
                Clearing system logs or removing inactive workspaces cannot be undone. Always verify current assessments before executing wipe tasks.
              </p>
              <Button variant="destructive" className="h-8 text-xs cursor-pointer" onClick={() => toast.error("System configuration restrictions prevent clearing audit logs.")}>
                Clear System Audit Logs
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* SECURITY AUDIT LOGS TAB */}
      {activeTab === "audit" && (
        <Card className="rounded-xl border-border bg-card shadow-sm overflow-hidden">
          <CardHeader className="border-b border-border">
            <CardTitle className="text-sm font-semibold">Security Audit Log</CardTitle>
            <CardDescription className="text-[10px]">Real-time system events, administrative changes, and user accesses.</CardDescription>
          </CardHeader>
          <div className="overflow-x-auto text-xs">
            <table className="w-full">
              <thead className="bg-muted/30 border-b border-border">
                <tr>
                  <th className="py-2.5 px-4 text-left font-semibold text-muted-foreground">Timestamp</th>
                  <th className="py-2.5 px-4 text-left font-semibold text-muted-foreground">Actor</th>
                  <th className="py-2.5 px-4 text-left font-semibold text-muted-foreground">Event / Action</th>
                  <th className="py-2.5 px-4 text-left font-semibold text-muted-foreground">Target</th>
                  <th className="py-2.5 px-4 text-center font-semibold text-muted-foreground">Status</th>
                  <th className="py-2.5 px-4 text-right font-semibold text-muted-foreground">IP Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {auditLogs.map((log, idx) => (
                  <tr key={idx} className="hover:bg-muted/15 transition font-mono text-[11px]">
                    <td className="py-2.5 px-4 text-muted-foreground whitespace-nowrap">{log.time}</td>
                    <td className="py-2.5 px-4 font-semibold text-foreground">{log.user}</td>
                    <td className="py-2.5 px-4 text-foreground font-sans">{log.action}</td>
                    <td className="py-2.5 px-4 text-muted-foreground font-sans">{log.target}</td>
                    <td className="py-2.5 px-4 text-center">
                      <span className="text-[9px] px-1.5 py-0.5 rounded font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200">
                        {log.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right text-muted-foreground">{log.ip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

    </PageShell>
  );
}
