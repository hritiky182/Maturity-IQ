import { useState, useEffect } from "react";
import { PageShell } from "@/components/page-shell";
import { useStore } from "@/lib/store";
import { getAssessmentDepartments, departmentScore, sectionScore, maturityColor, maturityLevel } from "@/lib/scoring";
import { cn } from "@/lib/utils";
import { Bar, BarChart, CartesianGrid, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function DepartmentsPage() {
  const assessments = useStore((state) => state.assessments);
  
  // Find active assessment
  const activeAsm = assessments.find((a) => a.status === "Completed") || assessments.find((a) => a.status === "In Progress") || assessments[0];
  
  const departments = activeAsm ? getAssessmentDepartments(activeAsm.id) : [];
  const [activeId, setActiveId] = useState("");

  // Set default active department ID when data loads
  useEffect(() => {
    if (departments.length > 0 && !activeId) {
      setActiveId(departments[0].id);
    }
  }, [departments, activeId]);

  if (departments.length === 0) {
    return (
      <PageShell title="Department Results" description="Explore maturity results by business function.">
        <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-sm">
          <div className="text-muted-foreground">No active assessment found. Please create and complete an assessment first.</div>
        </div>
      </PageShell>
    );
  }

  const dep = departments.find((d) => d.id === activeId) || departments[0];
  const score = dep ? departmentScore(dep) : 0;
  
  const sectionData = dep?.sections.map((s) => ({ 
    name: s.name.split(" ")[0], 
    score: Number(sectionScore(s).toFixed(2)) 
  })) || [];

  const radar = dep?.sections.map((s) => ({ 
    subject: s.name, 
    A: Number(sectionScore(s).toFixed(2)), 
    fullMark: 5 
  })) || [];

  const strengths = dep ? [...dep.sections].sort((a, b) => sectionScore(b) - sectionScore(a)).slice(0, 2) : [];
  const weaknesses = dep ? [...dep.sections].sort((a, b) => sectionScore(a) - sectionScore(b)).slice(0, 2) : [];

  return (
    <PageShell title="Department Results" description={`Explore maturity results by business function for ${activeAsm?.company || "Emaar Holdings"}.`}>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-6">
        {departments.map((d) => {
          const s = departmentScore(d);
          const active = d.id === activeId;
          return (
            <button
              key={d.id}
              onClick={() => setActiveId(d.id)}
              className={cn(
                "text-left rounded-xl border p-3 transition cursor-pointer",
                active ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/30 bg-card"
              )}
            >
              <div className="text-xs font-semibold truncate text-foreground">{d.name}</div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-lg font-bold tabular-nums text-foreground">{s.toFixed(1)}</span>
                <span className="text-[10px] text-muted-foreground">/5</span>
              </div>
              <div className="mt-1.5 h-1 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${(s / 5) * 100}%` }} />
              </div>
            </button>
          );
        })}
      </div>

      {dep && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="text-xs text-muted-foreground">Department Score</div>
              <div className="mt-2 text-3xl font-semibold tabular-nums text-foreground">{score.toFixed(2)}</div>
              <div className="mt-1 text-xs text-muted-foreground">of 5.00</div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="text-xs text-muted-foreground">Maturity Level</div>
              <div className={cn("mt-2 inline-flex px-3 py-1 rounded-full border font-semibold text-sm", maturityColor(score))}>
                {maturityLevel(score)}
              </div>
              <div className="mt-2 text-xs text-muted-foreground">Benchmark: Defined (3.2)</div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="text-xs text-muted-foreground">Strength Areas</div>
              <ul className="mt-2 space-y-1 text-sm">
                {strengths.map((s) => (
                  <li key={s.id} className="flex items-center justify-between">
                    <span className="truncate text-foreground font-medium">{s.name}</span>
                    <span className="text-emerald-600 font-semibold tabular-nums">{sectionScore(s).toFixed(1)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="text-xs text-muted-foreground">Weak Areas</div>
              <ul className="mt-2 space-y-1 text-sm">
                {weaknesses.map((s) => (
                  <li key={s.id} className="flex items-center justify-between">
                    <span className="truncate text-foreground font-medium">{s.name}</span>
                    <span className="text-rose-600 font-semibold tabular-nums">{sectionScore(s).toFixed(1)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h3 className="text-base font-semibold text-foreground">Section Scores</h3>
              <div className="h-72 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sectionData} margin={{ left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                    <YAxis domain={[0, 5]} tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                    <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
                    <Bar dataKey="score" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h3 className="text-base font-semibold text-foreground">Radar</h3>
              <div className="h-72 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radar}>
                    <PolarGrid stroke="var(--border)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fontSize: 10 }} />
                    <Radar dataKey="A" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.4} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="text-base font-semibold mb-4 text-foreground">Section Heat Map</h3>
            <div className="grid grid-cols-1 gap-4">
              {dep.sections.map((s) => {
                const sc = sectionScore(s);
                return (
                  <div key={s.id} className="grid grid-cols-1 md:grid-cols-[200px_1fr_60px] items-center gap-4">
                    <div className="text-sm font-medium truncate text-foreground">{s.name}</div>
                    <div className="flex gap-1.5">
                      {s.questions.map((q) => (
                        <div key={q.id}
                          className="h-8 flex-1 rounded border border-border/20 transition-all flex items-center justify-center text-[10px] font-semibold text-foreground bg-opacity-80 hover:bg-opacity-100"
                          style={{
                            backgroundColor: q.score > 0 
                              ? `oklch(${0.92 - q.score * 0.08} 0.12 ${120 + q.score * 25})`
                              : "var(--muted)",
                          }}
                          title={`${q.text} — ${q.score > 0 ? q.score : "Unanswered"}`}
                        >
                          {q.score > 0 ? q.score : "—"}
                        </div>
                      ))}
                    </div>
                    <div className="text-right tabular-nums font-semibold text-foreground">{sc > 0 ? sc.toFixed(2) : "—"}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </PageShell>
  );
}
