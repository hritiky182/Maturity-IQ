import { useState, useMemo, useEffect } from "react";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "@/lib/store";
import { maturityColor, maturityLevel } from "@/lib/scoring";
import { cn } from "@/lib/utils";
import { Building2, Upload, FileText, Trash2, Save } from "lucide-react";
import { toast } from "sonner";

export default function OrganizationPage() {
  const currentUser = useStore((state) => state.currentUser);
  const organizations = useStore((state) => state.organizations);
  const assessments = useStore((state) => state.assessments);
  const updateOrganization = useStore((state) => state.updateOrganization);

  // Active Organization linked to current user
  const activeOrg = useMemo(() => {
    const mapped = organizations.find((o) => o.id === currentUser?.organizationId);
    return mapped || organizations[0] || {
      id: "org-1",
      name: "Emaar Holdings",
      industry: "Real Estate Development",
      country: "UAE",
      employees: 8500,
      revenue: "$3.5B",
      type: "Public",
      contactPerson: "Sarah Malik",
      email: "sarah.malik@emaarproperties.com",
    };
  }, [organizations, currentUser]);

  // Form editable states
  const [orgName, setOrgName] = useState("");
  const [industry, setIndustry] = useState("");
  const [country, setCountry] = useState("");
  const [employees, setEmployees] = useState("");
  const [revenue, setRevenue] = useState("");
  const [orgType, setOrgType] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");

  // Sync inputs on activeOrg load
  useEffect(() => {
    if (activeOrg) {
      setOrgName(activeOrg.name);
      setIndustry(activeOrg.industry);
      setCountry(activeOrg.country);
      setEmployees(String(activeOrg.employees));
      setRevenue(activeOrg.revenue);
      setOrgType(activeOrg.type);
      setContact(activeOrg.contactPerson || "");
      setEmail(activeOrg.email || "");
    }
  }, [activeOrg]);

  // Documents Management
  const [documents, setDocuments] = useState([
    { name: "Strategic Plan 2026-2030.pdf", size: "4.2 MB", date: "2026-01-14", status: "Verified" },
    { name: "Risk Register Q4.xlsx", size: "1.8 MB", date: "2025-12-22", status: "Under Review" },
    { name: "Operating Model Diagram.png", size: "820 KB", date: "2025-11-30", status: "Verified" },
    { name: "Board Deck FY25 Results.pdf", size: "8.6 MB", date: "2025-10-08", status: "Verified" },
  ]);

  const history = useMemo(() => {
    return assessments.filter((a) => a.company === activeOrg.name).slice(0, 4);
  }, [assessments, activeOrg]);

  const handleSaveProfile = () => {
    updateOrganization(activeOrg.id, {
      name: orgName,
      industry,
      country,
      employees: parseInt(employees) || 0,
      revenue,
      type: orgType,
      contactPerson: contact,
      email,
    });
    toast.success("Organization profile updated successfully!");
  };

  const handleUploadDocument = () => {
    const filename = prompt("Enter the name of the file to upload (e.g. CSR_Audit_Report.pdf):");
    if (!filename) return;
    
    const newDoc = {
      name: filename,
      size: `${(1 + Math.random() * 8).toFixed(1)} MB`,
      date: new Date().toISOString().split("T")[0],
      status: "Under Review",
    };
    
    setDocuments([newDoc, ...documents]);
    toast.success(`Document "${filename}" uploaded and queued for audit verification.`);
  };

  const handleDeleteDocument = (name: string) => {
    if (confirm(`Remove document "${name}"?`)) {
      setDocuments(documents.filter((d) => d.name !== name));
      toast.success("Document removed");
    }
  };

  return (
    <PageShell title="Organization Profile" description="Manage entity information, assessment history, and supporting documents.">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-4 pb-6 border-b border-border">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 text-primary-foreground flex items-center justify-center">
                <Building2 className="h-8 w-8" />
              </div>
              <div className="flex-1">
                <div className="text-xl font-bold text-foreground">{activeOrg.name}</div>
                <div className="text-sm text-muted-foreground">{activeOrg.industry} · {activeOrg.country} · {activeOrg.type}</div>
              </div>
              <Button variant="outline" onClick={() => toast.info("Logo replacement is configured for enterprise branding settings")}>Replace logo</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
              <div>
                <Label className="text-xs font-semibold text-muted-foreground">Organization Name</Label>
                <Input className="mt-1.5" value={orgName} onChange={(e) => setOrgName(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs font-semibold text-muted-foreground">Industry</Label>
                <Input className="mt-1.5" value={industry} onChange={(e) => setIndustry(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs font-semibold text-muted-foreground">Country</Label>
                <Input className="mt-1.5" value={country} onChange={(e) => setCountry(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs font-semibold text-muted-foreground">Organization Type</Label>
                <Input className="mt-1.5" value={orgType} onChange={(e) => setOrgType(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs font-semibold text-muted-foreground">Number of Employees</Label>
                <Input className="mt-1.5" type="number" value={employees} onChange={(e) => setEmployees(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs font-semibold text-muted-foreground">Annual Revenue</Label>
                <Input className="mt-1.5" value={revenue} onChange={(e) => setRevenue(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs font-semibold text-muted-foreground">Primary Contact</Label>
                <Input className="mt-1.5" value={contact} onChange={(e) => setContact(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs font-semibold text-muted-foreground">Email</Label>
                <Input className="mt-1.5" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button onClick={handleSaveProfile} className="gap-1.5">
                <Save className="h-4 w-4" /> Save changes
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-foreground">Supporting Documents</h3>
              <Button variant="outline" onClick={handleUploadDocument}><Upload className="h-4 w-4 mr-1" /> Upload</Button>
            </div>
            
            <div 
              onClick={handleUploadDocument}
              className="rounded-xl border-2 border-dashed border-border p-8 text-center bg-muted/30 mb-4 cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition"
            >
              <Upload className="h-6 w-6 mx-auto text-muted-foreground" />
              <div className="mt-2 text-sm font-semibold text-foreground">Drop files here or click to upload</div>
              <div className="text-xs text-muted-foreground mt-1">PDF, DOC, DOCX, XLS, PNG, JPG · up to 20MB</div>
            </div>
            
            <div className="divide-y divide-border">
              {documents.map((d) => (
                <div key={d.name} className="flex items-center gap-3 py-3 hover:bg-muted/10 transition px-2 rounded-lg">
                  <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate text-foreground">{d.name}</div>
                    <div className="text-xs text-muted-foreground">{d.size} · uploaded {d.date}</div>
                  </div>
                  <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0",
                    d.status === "Verified" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                    : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300")}>
                    {d.status}
                  </span>
                  <button 
                    onClick={() => handleDeleteDocument(d.name)}
                    className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-rose-600 transition shrink-0 animate-fade-in"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="text-base font-semibold text-foreground">Assessment History</h3>
            <div className="mt-4 space-y-3">
              {history.map((a) => (
                <div key={a.id} className="rounded-lg border border-border p-3 space-y-2">
                  <div className="text-sm font-semibold text-foreground">{a.name}</div>
                  <div className="text-xs text-muted-foreground">{a.updatedAt} · {a.status}</div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold tabular-nums text-foreground">{a.overallScore > 0 ? a.overallScore.toFixed(1) : "—"}</span>
                    {a.overallScore > 0 && (
                      <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full border font-semibold", maturityColor(a.overallScore))}>
                        {maturityLevel(a.overallScore)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {!history.length && (
                <div className="text-xs text-muted-foreground italic">No assessments conducted yet for this entity.</div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-gradient-to-br from-primary to-primary/70 text-primary-foreground p-6 shadow-sm space-y-4">
            <div className="text-xs uppercase tracking-wider opacity-85">Next Review</div>
            <div className="text-2xl font-bold">Q2 2026</div>
            <div className="text-sm opacity-90 leading-snug">Board maturity readout scheduled for April 22, 2026</div>
            <Button variant="secondary" onClick={() => toast.success("Maturity review scheduled successfully")} className="w-full">Schedule review</Button>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
