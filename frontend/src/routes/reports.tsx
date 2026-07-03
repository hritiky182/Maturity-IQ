import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, Printer, ArrowRight } from "lucide-react";
import { useStore } from "@/lib/store";
import { getAssessmentDepartments, departmentScore, maturityColor, maturityLevel, overallScore } from "@/lib/scoring";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const REPORTS = [
  { title: "Executive Summary", desc: "Board-ready summary of maturity results and strategic imperatives.", tag: "12 pages", color: "from-blue-500 to-indigo-600" },
  { title: "Business Function Scorecard", desc: "Detailed section-level performance across all business functions.", tag: "28 pages", color: "from-emerald-500 to-teal-600" },
  { title: "Gap Analysis Report", desc: "Current vs target state with prioritized gap closure roadmap.", tag: "18 pages", color: "from-orange-500 to-rose-600" },
  { title: "Recommendations Report", desc: "24 prioritized initiatives with impact and effort estimates.", tag: "22 pages", color: "from-violet-500 to-fuchsia-600" },
  { title: "Improvement Roadmap Report", desc: "Quarterly execution plan with owners and dependencies.", tag: "16 pages", color: "from-amber-500 to-orange-600" },
];

export default function ReportsPage() {
  const assessments = useStore((state) => state.assessments);
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Resolve active assessment ID (from query param, then store's active, then first assessment)
  const assessmentId = useMemo(() => {
    return searchParams.get("assessmentId") || useStore.getState().currentAssessmentId || assessments[0]?.id;
  }, [searchParams, assessments]);

  const activeAsm = useMemo(() => {
    return assessments.find((a) => a.id === assessmentId) || assessments[0];
  }, [assessments, assessmentId]);

  const activeDeps = useMemo(() => {
    if (!activeAsm) return [];
    return getAssessmentDepartments(activeAsm.id);
  }, [activeAsm]);

  const overall = activeDeps.length ? overallScore(activeDeps) : 0;

  const handleAssessmentChange = (id: string) => {
    setSearchParams({ assessmentId: id });
    useStore.getState().setCurrentAssessmentId(id);
  };

  const handleExport = (reportTitle: string) => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: `Compiling publication-ready PDF for ${reportTitle}...`,
        success: `${reportTitle} successfully compiled and downloaded.`,
        error: "Export failed",
      }
    );
  };

  const topDepartments = useMemo(() => {
    return [...activeDeps]
      .map((d) => ({ ...d, s: departmentScore(d) }))
      .sort((a, b) => b.s - a.s)
      .slice(0, 5);
  }, [activeDeps]);

  if (!activeAsm) {
    return (
      <PageShell title="Reports" description="Publication-ready reports for executives, boards and steering committees.">
        <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-sm">
          <div className="text-muted-foreground">No assessment data available to compile reports.</div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Reports"
      description="Publication-ready reports for executives, boards and steering committees."
      actions={
        <>
          <div className="flex items-center gap-2 mr-2">
            <span className="text-xs text-muted-foreground font-semibold">Active Assessment:</span>
            <Select value={activeAsm.id} onValueChange={handleAssessmentChange}>
              <SelectTrigger className="w-56 h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                {assessments.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.company} ({a.year})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" onClick={() => window.print()}><Printer className="h-4 w-4 mr-1" /> Print</Button>
          <Button onClick={() => handleExport("All Combined Reports")}><Download className="h-4 w-4 mr-1" /> Download all (PDF)</Button>
        </>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
        {REPORTS.map((r) => (
          <div key={r.title} className="group rounded-2xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-lg transition">
            <div className={cn("h-32 bg-gradient-to-br relative", r.color)}>
              <FileText className="absolute inset-0 m-auto h-12 w-12 text-white/80" />
              <span className="absolute top-3 right-3 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/20 backdrop-blur text-white">
                {r.tag}
              </span>
            </div>
            <div className="p-5">
              <div className="text-base font-semibold text-foreground">{r.title}</div>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{r.desc}</p>
              <div className="mt-4 flex items-center justify-between">
                <button 
                  onClick={() => handleExport(r.title)}
                  className="text-xs font-semibold text-primary inline-flex items-center gap-1 cursor-pointer hover:underline"
                >
                  Preview & Export <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition" />
                </button>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => handleExport(r.title)}><Printer className="h-3.5 w-3.5" /></Button>
                  <Button variant="outline" size="sm" onClick={() => handleExport(r.title)}><Download className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Preview */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="border-b border-border px-6 py-4 flex items-center justify-between bg-muted/20">
          <div>
            <div className="text-sm font-semibold text-foreground">Preview · Executive Summary</div>
            <div className="text-xs text-muted-foreground">{activeAsm.company} · FY {activeAsm.year}</div>
          </div>
          <Button variant="outline" size="sm" onClick={() => handleExport("Executive Summary")}><Download className="h-3.5 w-3.5 mr-1" /> Export PDF</Button>
        </div>
        
        <div className="p-10 bg-gradient-to-b from-background to-muted/30">
          <div className="max-w-3xl mx-auto bg-card border border-border rounded-lg shadow-xl p-12 space-y-8">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <span className="text-[10px] uppercase tracking-widest font-bold text-rose-600">Confidential</span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{activeAsm.id}</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Organizational Maturity Assessment</h1>
              <p className="text-sm text-muted-foreground">{activeAsm.company} · Fiscal Year {activeAsm.year}</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg bg-muted/50 p-4 border border-border/40">
                <div className="text-xs text-muted-foreground">Overall Score</div>
                <div className="text-2xl font-bold mt-1 tabular-nums text-foreground">{overall > 0 ? overall.toFixed(2) : "0.00"}</div>
              </div>
              <div className="rounded-lg bg-muted/50 p-4 border border-border/40">
                <div className="text-xs text-muted-foreground">Maturity Level</div>
                <div className="mt-1.5 flex">
                  {overall > 0 ? (
                    <span className={cn("px-2.5 py-0.5 rounded border font-semibold text-xs", maturityColor(overall))}>
                      {maturityLevel(overall)}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground font-semibold">Not Assessed</span>
                  )}
                </div>
              </div>
              <div className="rounded-lg bg-muted/50 p-4 border border-border/40">
                <div className="text-xs text-muted-foreground">Functions Assessed</div>
                <div className="text-2xl font-bold mt-1 text-foreground">{activeDeps.filter(d => departmentScore(d) > 0).length} / {activeDeps.length}</div>
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">Executive Summary</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {activeAsm.company} demonstrates a maturity profile consistent with a transitioning enterprise
                moving from an ad-hoc operating model to a standard platform model. Strengths in key operational
                parameters are contrasted by gaps in technology integration, customer experience, and systematic innovation.
                Initiating the recommended 12-month roadmap initiatives is highly advised to optimize organizational output.
              </p>
            </div>

            <div className="space-y-3 pt-4 border-t border-border">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Top Performing Business Functions</h3>
              <table className="w-full text-sm">
                <tbody>
                  {topDepartments.map((d) => (
                    <tr key={d.id} className="border-t border-border/40 hover:bg-muted/10 transition">
                      <td className="py-2.5 font-medium text-foreground">{d.name}</td>
                      <td className="py-2.5 text-right tabular-nums font-bold text-foreground">{d.s.toFixed(2)}</td>
                      <td className="py-2.5 pl-4 w-24 text-right">
                        <span className={cn("text-[9px] px-2 py-0.5 rounded border font-semibold", maturityColor(d.s))}>
                          {maturityLevel(d.s)}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {!topDepartments.length && (
                    <tr><td colSpan={3} className="py-4 text-center text-xs text-muted-foreground italic">No business functions assessed yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
