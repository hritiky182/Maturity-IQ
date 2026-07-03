import { useState } from "react";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore } from "@/lib/store";
import { priorityColor } from "@/lib/scoring";
import { cn } from "@/lib/utils";
import { Sparkles, Clock, Building2, TrendingUp, Search } from "lucide-react";
import { toast } from "sonner";

export default function RecommendationsPage() {
  const recommendations = useStore((state) => state.recommendations);
  const assessments = useStore((state) => state.assessments);
  const regenerateRecommendations = useStore((state) => state.regenerateRecommendations);

  const activeAsm = assessments.find((a) => a.status === "Completed") || assessments.find((a) => a.status === "In Progress") || assessments[0];

  const [q, setQ] = useState("");
  const [pri, setPri] = useState<string>("all");

  const rows = recommendations.filter((r) => {
    if (pri !== "all" && r.priority !== pri) return false;
    if (q && !`${r.title} ${r.department}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const handleRegenerate = () => {
    if (activeAsm) {
      toast.promise(
        new Promise((resolve) => {
          setTimeout(() => {
            regenerateRecommendations(activeAsm.id);
            resolve(true);
          }, 1500);
        }),
        {
          loading: "AI scoring engine evaluating gaps and compiling actions...",
          success: "Maturity recommendations successfully compiled and updated!",
          error: "Failed to regenerate recommendations",
        }
      );
    } else {
      toast.error("No active assessment found to base recommendations on");
    }
  };

  return (
    <PageShell
      title="AI Recommendations"
      description={`Prioritized actions generated from maturity assessment scores and real estate benchmarks for ${activeAsm?.company || "Emaar Holdings"}.`}
      actions={<Button onClick={handleRegenerate}><Sparkles className="h-4 w-4 mr-1" /> Regenerate</Button>}
    >
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-64 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search recommendations…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-border p-1 bg-card">
          {["all", "Critical", "High", "Medium", "Low"].map((p) => (
            <button key={p} onClick={() => setPri(p)}
              className={cn("px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer",
                pri === p ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
              {p === "all" ? "All" : p}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {rows.map((r) => (
          <article key={r.id} className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-[10px] font-mono text-muted-foreground">{r.id}</div>
                  <h3 className="text-base font-semibold leading-snug mt-0.5 text-foreground">{r.title}</h3>
                </div>
              </div>
              <span className={cn("shrink-0 inline-flex px-2.5 py-1 rounded-full border text-xs font-semibold", priorityColor(r.priority))}>
                {r.priority}
              </span>
            </div>

            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{r.description}</p>

            <div className="mt-5 grid grid-cols-3 gap-3 pt-4 border-t border-border">
              <div>
                <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground"><TrendingUp className="h-3 w-3" /> Impact</div>
                <div className="text-sm font-semibold mt-1 text-foreground">{r.impact}</div>
              </div>
              <div>
                <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground"><Clock className="h-3 w-3" /> Timeline</div>
                <div className="text-sm font-semibold mt-1 text-foreground">{r.timeline}</div>
              </div>
              <div>
                <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground"><Building2 className="h-3 w-3" /> Owner</div>
                <div className="text-sm font-semibold mt-1 truncate text-foreground">{r.department}</div>
              </div>
            </div>
          </article>
        ))}
        {!rows.length && (
          <div className="col-span-2 py-12 text-center text-sm text-muted-foreground">No recommendations found. Try changing filters or search query.</div>
        )}
      </div>
    </PageShell>
  );
}
