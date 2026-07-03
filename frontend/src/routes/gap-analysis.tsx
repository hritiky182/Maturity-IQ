import { PageShell } from "@/components/page-shell";
import { useStore } from "@/lib/store";
import { getAssessmentDepartments, departmentScore, maturityColor, maturityLevel, priorityColor } from "@/lib/scoring";
import { cn } from "@/lib/utils";
import { AlertTriangle, ArrowRight } from "lucide-react";

const TARGET = 4.2;

export default function GapAnalysisPage() {
  const assessments = useStore((state) => state.assessments);
  
  // Find active assessment
  const activeAsm = assessments.find((a) => a.status === "Completed") || assessments.find((a) => a.status === "In Progress") || assessments[0];
  
  const departments = activeAsm ? getAssessmentDepartments(activeAsm.id) : [];

  const rows = departments.map((d) => {
    const current = departmentScore(d);
    const gap = current > 0 ? Number((TARGET - current).toFixed(2)) : TARGET;
    const priority = gap > 2 ? "Critical" : gap > 1.5 ? "High" : gap > 0.8 ? "Medium" : "Low";
    return { d, current, target: TARGET, gap, priority };
  }).sort((a, b) => b.gap - a.gap);

  const critical = rows.filter((r) => r.priority === "Critical" && r.current > 0).length;
  const totalGap = rows.reduce((a, r) => a + Math.max(0, r.gap), 0).toFixed(1);

  if (departments.length === 0) {
    return (
      <PageShell title="Gap Analysis" description="Consulting-style view of the delta between current maturity and target state.">
        <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-sm">
          <div className="text-muted-foreground">No active assessment found. Please create and complete an assessment first.</div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Gap Analysis"
      description={`Consulting-style view of the delta between current maturity and target state for ${activeAsm?.company || "Emaar Holdings"}.`}
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="text-xs text-muted-foreground">Aggregate Gap</div>
          <div className="mt-2 text-3xl font-semibold tabular-nums text-foreground">{totalGap}</div>
          <div className="text-xs text-muted-foreground">across {departments.length} departments</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="text-xs text-muted-foreground">Target State</div>
          <div className="mt-2 text-3xl font-semibold tabular-nums text-foreground">{TARGET.toFixed(1)}</div>
          <div className="text-xs text-muted-foreground">Level: Managed → Optimized</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="text-xs text-muted-foreground">Critical Priority</div>
          <div className="mt-2 text-3xl font-semibold tabular-nums text-rose-600">{critical}</div>
          <div className="text-xs text-muted-foreground">departments requiring intervention</div>
        </div>
        <div className="rounded-2xl border border-border bg-primary text-primary-foreground p-5 shadow-sm">
          <div className="text-xs opacity-80">Executive Recommendation</div>
          <div className="mt-2 text-sm font-semibold leading-tight">Prioritize Innovation, IT and Risk to close 60% of the gap within 12 months.</div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-6 py-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-foreground">Current vs Target State</h3>
          <span className="text-xs text-muted-foreground">Target set to 4.2 (Managed+)</span>
        </div>
        <div className="p-6 space-y-4">
          {rows.map(({ d, current, gap, priority }) => (
            <div key={d.id} className="grid grid-cols-1 md:grid-cols-[220px_1fr_120px_100px] items-center gap-4 border-b border-border/40 pb-4 last:border-0 last:pb-0">
              <div>
                <div className="text-sm font-semibold text-foreground">{d.name}</div>
                <div className={cn("mt-1 inline-flex px-2 py-0.5 rounded-full border text-[10px] font-medium", current > 0 ? maturityColor(current) : "bg-muted text-muted-foreground")}>
                  {current > 0 ? maturityLevel(current) : "Not Assessed"}
                </div>
              </div>

              <div className="relative h-6">
                <div className="absolute inset-y-0 left-0 right-0 rounded-full bg-muted" />
                <div className="absolute inset-y-0 left-0 rounded-full bg-primary/80"
                  style={{ width: `${(current / 5) * 100}%` }} />
                <div className="absolute inset-y-0 border-r-2 border-emerald-500"
                  style={{ left: `${(TARGET / 5) * 100}%` }}>
                  <span className="absolute -top-4 -translate-x-1/2 text-[10px] font-semibold text-emerald-600">Target</span>
                </div>
                <div className="absolute inset-0 flex items-center justify-between px-3 text-[10px] font-medium text-white mix-blend-difference">
                  <span>{current > 0 ? current.toFixed(2) : "0.00"}</span>
                  <span className="text-emerald-700">→ {TARGET.toFixed(1)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 justify-end md:justify-start">
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-sm font-semibold text-rose-600 tabular-nums">+{gap.toFixed(2)}</span>
                <span className="text-xs text-muted-foreground">gap</span>
              </div>

              <span className={cn("inline-flex px-2.5 py-1 rounded-full border text-xs font-semibold justify-center", priorityColor(priority))}>
                {priority === "Critical" && <AlertTriangle className="h-3 w-3 mr-1" />}
                {priority}
              </span>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
