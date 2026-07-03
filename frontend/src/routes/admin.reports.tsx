import { useState, useMemo } from "react";
import { PageShell } from "@/components/page-shell";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileText, Printer, Building2, Calendar, ClipboardCheck } from "lucide-react";
import { toast } from "sonner";
import { getAssessmentDepartments, departmentScore, maturityColor, maturityLevel } from "@/lib/scoring";
import { cn } from "@/lib/utils";

export default function AdminReportsPage() {
  const organizations = useStore((state) => state.organizations);
  const assessments = useStore((state) => state.assessments);

  // Selected Org and Assessment State
  const [selectedOrgId, setSelectedOrgId] = useState<string>(organizations[0]?.id || "");

  const activeOrg = useMemo(() => {
    return organizations.find((o) => o.id === selectedOrgId) || organizations[0];
  }, [organizations, selectedOrgId]);

  const orgAssessments = useMemo(() => {
    if (!activeOrg) return [];
    return assessments.filter((a) => a.company === activeOrg.name);
  }, [assessments, activeOrg]);

  const [selectedAsmId, setSelectedAsmId] = useState<string>("");

  // Auto-select latest assessment when organization changes
  useMemo(() => {
    if (orgAssessments.length > 0) {
      setSelectedAsmId(orgAssessments[0].id);
    } else {
      setSelectedAsmId("");
    }
  }, [orgAssessments]);

  const activeAsm = useMemo(() => {
    return orgAssessments.find((a) => a.id === selectedAsmId) || orgAssessments[0] || null;
  }, [orgAssessments, selectedAsmId]);

  const activeDeps = useMemo(() => {
    if (!activeAsm) return [];
    return getAssessmentDepartments(activeAsm.id);
  }, [activeAsm]);

  const handleDownload = (format: string) => {
    if (!activeAsm) return;
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: `Generating Executive Summary PDF report...`,
        success: `Successfully exported ${activeAsm.company} Executive Report.${format.toLowerCase()}`,
        error: "Export failed"
      }
    );
  };

  return (
    <PageShell title="Executive Reports Console" description="Generate and export boardroom-ready reports, maturity scorecards, and cross-sector comparisons.">
      
      {/* Selector controls */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">Select Organization Workspace</label>
          <Select value={selectedOrgId} onValueChange={setSelectedOrgId}>
            <SelectTrigger className="text-xs h-9">
              <SelectValue placeholder="Select Organization" />
            </SelectTrigger>
            <SelectContent>
              {organizations.map((org) => (
                <SelectItem key={org.id} value={org.id}>{org.name} ({org.industry})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">Select Assessment Cycle</label>
          <Select value={selectedAsmId} onValueChange={setSelectedAsmId} disabled={orgAssessments.length === 0}>
            <SelectTrigger className="text-xs h-9">
              <SelectValue placeholder={orgAssessments.length === 0 ? "No Assessments Found" : "Select Assessment"} />
            </SelectTrigger>
            <SelectContent>
              {orgAssessments.map((asm) => (
                <SelectItem key={asm.id} value={asm.id}>{asm.name} ({asm.year}) - Score: {asm.overallScore.toFixed(2)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Report Canvas Preview */}
      {activeAsm ? (
        <div className="space-y-6">
          
          {/* Action Row */}
          <div className="flex justify-between items-center bg-card border border-border rounded-xl p-4 shadow-sm">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <ClipboardCheck className="h-4 w-4 text-primary" /> Report Preview
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => handleDownload("PDF")} className="gap-1.5">
                <Printer className="h-4 w-4" /> Download PDF Report
              </Button>
              <Button size="sm" onClick={() => handleDownload("docx")} className="gap-1.5">
                <Download className="h-4 w-4" /> Export DOCX
              </Button>
            </div>
          </div>

          {/* Actual Report Sheet */}
          <div className="bg-card border border-border rounded-2xl shadow-md p-8 md:p-12 max-w-4xl mx-auto space-y-8 font-sans text-foreground">
            
            {/* Header branding */}
            <div className="border-b border-border/80 pb-6 flex justify-between items-start">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-primary">Maturity IQ Executive Report</h1>
                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mt-1">CONFIDENTIAL · Internal Strategy Document</div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-foreground">{activeAsm.company}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{activeOrg.country} · {activeOrg.industry}</div>
              </div>
            </div>

            {/* Assessment Context Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6 border-b border-border/60">
              <div className="flex items-start gap-2.5">
                <Building2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div className="leading-tight">
                  <div className="text-[10px] uppercase font-bold text-muted-foreground">Organization Details</div>
                  <div className="text-xs font-semibold text-foreground mt-1">{activeOrg.name}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{activeOrg.type} · {activeOrg.employees} staff</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Calendar className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div className="leading-tight">
                  <div className="text-[10px] uppercase font-bold text-muted-foreground">Evaluation Cycle</div>
                  <div className="text-xs font-semibold text-foreground mt-1">Calendar Year {activeAsm.year}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">Updated: {activeAsm.updatedAt}</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                  {activeAsm.overallScore.toFixed(1)}
                </div>
                <div className="leading-tight">
                  <div className="text-[10px] uppercase font-bold text-muted-foreground">Baseline Rating</div>
                  <div className="text-xs font-semibold text-foreground mt-1">{activeAsm.overallScore.toFixed(2)} / 5.00</div>
                  <div className="mt-1">
                    <span className={cn("px-2 py-0.5 rounded font-semibold border text-[9px]", maturityColor(activeAsm.overallScore))}>
                      {maturityLevel(activeAsm.overallScore)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Executive summary statement */}
            <div className="space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">1. Executive Summary</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                This capability report summarizes the baseline audit performed by <span className="font-semibold text-foreground">{activeAsm.company}</span> under the {activeAsm.year} maturity assessment cycle. 
                With an overall capability index of <span className="font-bold text-foreground">{activeAsm.overallScore.toFixed(2)}</span>, the organization represents a <span className="font-semibold text-foreground">{maturityLevel(activeAsm.overallScore)}</span> process baseline. 
                This indicates that capabilities are generally structured, with key operational parameters standardized across selected business functions. However, quantitative performance metrics and predictive capability optimizations remain opportunities for systematic uplift.
              </p>
            </div>

            {/* Business function performance breakdown */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">2. Business Function Performance Index</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {activeDeps.map((d) => {
                  const score = departmentScore(d);
                  return (
                    <div key={d.id} className="border border-border/60 rounded-xl p-4 space-y-2 bg-muted/5">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-foreground">{d.name}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold tabular-nums text-foreground">{score.toFixed(2)}</span>
                          <span className={cn("text-[9px] px-1.5 py-0.5 rounded font-semibold border", maturityColor(score))}>
                            {maturityLevel(score)}
                          </span>
                        </div>
                      </div>
                      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${(score / 5) * 100}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sign-off footer */}
            <div className="border-t border-border/60 pt-8 flex justify-between items-end text-[10px] text-muted-foreground">
              <div>
                <div>Report Compiled Automatically by Maturity IQ Core Engine.</div>
                <div>Authorized for Board Distribution.</div>
              </div>
              <div className="text-right">
                <div>Page 1 of 1</div>
                <div>ID: {activeAsm.id}</div>
              </div>
            </div>

          </div>
        </div>
      ) : (
        <div className="p-12 text-center text-muted-foreground italic border border-border bg-card rounded-2xl shadow-sm">
          No assessment cycles recorded for this organization. Choose another workspace from the panel selector.
        </div>
      )}
    </PageShell>
  );
}
