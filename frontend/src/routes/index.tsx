import { Link } from "react-router-dom";
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart,
  PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis, Pie, PieChart,
} from "recharts";
import { ArrowUpRight, TrendingUp, ClipboardCheck, Building2, AlertTriangle, Sparkles, ChevronRight, Circle } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { getAssessmentDepartments, departmentScore, maturityColor, maturityLevel, overallScore, priorityColor } from "@/lib/scoring";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const assessments = useStore((state) => state.assessments);
  const recommendations = useStore((state) => state.recommendations);
  
  // Find latest active assessment to show on dashboard
  const activeAsm = assessments.find((a) => a.status === "Completed") || assessments.find((a) => a.status === "In Progress") || assessments[0];
  
  const activeDeps = activeAsm ? getAssessmentDepartments(activeAsm.id) : [];
  const overall = activeDeps.length ? overallScore(activeDeps) : 0;
  
  const barData = activeDeps.map((d) => ({
    name: d.name.length > 10 ? d.name.slice(0, 8) + "…" : d.name,
    score: Number(departmentScore(d).toFixed(2)),
  }));

  const radarData = activeDeps.slice(0, 8).map((d) => ({
    subject: d.name.length > 12 ? d.name.slice(0, 10) + "…" : d.name,
    A: Number(departmentScore(d).toFixed(2)),
    fullMark: 5,
  }));

  const trendData = [
    { m: "Jan", completion: 22 },
    { m: "Feb", completion: 34 },
    { m: "Mar", completion: 41 },
    { m: "Apr", completion: 55 },
    { m: "May", completion: 63 },
    { m: "Jun", completion: 71 },
    { m: "Jul", completion: 79 },
    { m: "Aug", completion: 86 },
  ];

  // Count functions per maturity level
  const levelsCount = { Initial: 0, Developing: 0, Defined: 0, Managed: 0, Optimized: 0 };
  activeDeps.forEach((d) => {
    const s = departmentScore(d);
    const lvl = maturityLevel(s);
    levelsCount[lvl]++;
  });

  const distribution = [
    { name: "Initial", value: levelsCount.Initial || 1, color: "oklch(0.6 0.22 25)" },
    { name: "Developing", value: levelsCount.Developing || 2, color: "oklch(0.7 0.18 55)" },
    { name: "Defined", value: levelsCount.Defined || 4, color: "oklch(0.75 0.16 85)" },
    { name: "Managed", value: levelsCount.Managed || 3, color: "oklch(0.65 0.15 170)" },
    { name: "Optimized", value: levelsCount.Optimized || 2, color: "oklch(0.55 0.16 250)" },
  ];

  const ranked = [...activeDeps]
    .map((d) => ({ ...d, s: departmentScore(d) }))
    .sort((a, b) => b.s - a.s);

  const highRiskCount = activeDeps.filter((d) => departmentScore(d) > 0 && departmentScore(d) < 2.5).length;

  return (
    <PageShell
      title="Executive Dashboard"
      description={`Real-time view of organizational maturity across all business functions for ${activeAsm?.company || "Emaar Properties"}.`}
      actions={
        <>
          <Button variant="outline" onClick={() => window.print()}>Export report</Button>
          <Button asChild><Link to="/assessments/new">New assessment</Link></Button>
        </>
      }
    >
      {/* Executive KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        <KpiCard 
          tone="primary" 
          label="Organization Score" 
          value={overall ? overall.toFixed(2) : "0.00"}
          sub={`Level: ${maturityLevel(overall)} · Benchmark 3.2`} 
          trend="+0.4 YoY" 
          icon={TrendingUp} 
        />
        <KpiCard 
          label="Assessment Trends" 
          value={activeAsm ? `${activeAsm.completion}%` : "0%"} 
          sub="Current Cycle Progress" 
          trend={activeAsm?.status} 
          icon={ClipboardCheck} 
        />
        <KpiCard 
          label="Business Functions Assessed" 
          value={`${activeDeps.filter(d => departmentScore(d) > 0).length} / ${activeDeps.length}`} 
          sub="Full organizational coverage" 
          icon={Building2} 
        />
        <KpiCard 
          label="High Risk Areas" 
          value={String(highRiskCount)} 
          sub="Score below 2.5 · needs action" 
          icon={AlertTriangle} 
        />
        <KpiCard 
          label="Improvement Opportunities" 
          value={String(recommendations.length)} 
          sub="Prioritized initiatives" 
          icon={Sparkles} 
        />
      </div>

      <div className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold">Business Function Scores</h3>
              <p className="text-sm text-muted-foreground">Average score across 5 categories per business function</p>
            </div>
            <div className="text-xs text-muted-foreground">Scale 1–5</div>
          </div>
          <div className="h-72">
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                  <YAxis domain={[0, 5]} tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                  <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
                  <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                    {barData.map((_, i) => (
                      <Cell key={i} fill={`oklch(${0.45 + (i % 5) * 0.06} 0.14 ${210 + i * 8})`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">No assessment data available.</div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-base font-semibold">Maturity Distribution</h3>
          <p className="text-sm text-muted-foreground">Business functions per maturity level</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={distribution} innerRadius={60} outerRadius={95} dataKey="value" paddingAngle={2}>
                  {distribution.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-base font-semibold">Industry Benchmark</h3>
          <p className="text-sm text-muted-foreground">Rolling 8-month capability alignment</p>
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="m" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
                <Line type="monotone" dataKey="completion" stroke="var(--primary)" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm xl:col-span-2">
          <h3 className="text-base font-semibold">Radar by Business Function</h3>
          <p className="text-sm text-muted-foreground">Balanced maturity view</p>
          <div className="h-64 mt-2">
            {radarData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fontSize: 10 }} />
                  <Radar dataKey="A" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.35} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">No radar data available.</div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold">Pending Assessments</h3>
            <Link to="/assessments" className="text-xs text-primary font-medium inline-flex items-center gap-1">View all <ChevronRight className="h-3 w-3" /></Link>
          </div>
          <ul className="mt-4 divide-y divide-border">
            {assessments.filter((a) => a.status !== "Completed" && a.status !== "Submitted").slice(0, 5).map((a) => (
              <li key={a.id} className="py-3 flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-[10px] font-semibold">
                  {a.company.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{a.company}</div>
                  <div className="text-xs text-muted-foreground">{a.name} · {a.completion}%</div>
                </div>
                <div className="h-1.5 w-20 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${a.completion}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold">Recent Recommendations</h3>
            <Link to="/recommendations" className="text-xs text-primary font-medium inline-flex items-center gap-1">View all <ChevronRight className="h-3 w-3" /></Link>
          </div>
          <ul className="mt-4 space-y-3">
            {recommendations.slice(0, 4).map((r) => (
              <li key={r.id} className="rounded-lg border border-border p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="text-sm font-medium leading-snug">{r.title}</div>
                  <span className={cn("text-[10px] px-2 py-0.5 rounded-full border font-medium", priorityColor(r.priority))}>
                    {r.priority}
                  </span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{r.department} · {r.timeline}</div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold">Business Function Ranking</h3>
            <Link to="/departments" className="text-xs text-primary font-medium inline-flex items-center gap-1">Details <ChevronRight className="h-3 w-3" /></Link>
          </div>
          <ol className="mt-4 space-y-2">
            {ranked.slice(0, 6).map((d, i) => (
              <li key={d.id} className="flex items-center gap-3">
                <span className="text-xs font-mono w-5 text-muted-foreground">#{i + 1}</span>
                <span className="flex-1 text-sm font-medium truncate">{d.name}</span>
                <span className={cn("text-[10px] px-2 py-0.5 rounded-full border font-medium", maturityColor(d.s))}>
                  {maturityLevel(d.s)}
                </span>
                <span className="text-sm font-semibold tabular-nums w-10 text-right">{d.s.toFixed(2)}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">Upcoming Review Dates</h3>
          <Button variant="ghost" size="sm">Add review</Button>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3">
          {[
            { d: "Q1 2026", title: "Executive Steering Review", who: "CEO · Sponsor" },
            { d: "Feb 14", title: "Strategy function deep-dive", who: "CSO office" },
            { d: "Mar 03", title: "IT & Cybersecurity assessment", who: "IT Director" },
            { d: "Mar 22", title: "Board maturity readout", who: "Board of Directors" },
          ].map((e) => (
            <div key={e.title} className="rounded-xl border border-border p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                <Circle className="h-2 w-2 fill-current" /> {e.d}
              </div>
              <div className="mt-2 text-sm font-medium">{e.title}</div>
              <div className="text-xs text-muted-foreground">{e.who}</div>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}

function KpiCard({ label, value, sub, trend, icon: Icon, tone = "default" }: any) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className={cn(
          "flex h-10 w-10 items-center justify-center rounded-xl",
          tone === "primary" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
        )}>
          <Icon className="h-5 w-5" />
        </div>
        {trend && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
            <ArrowUpRight className="h-3 w-3" /> {trend}
          </span>
        )}
      </div>
      <div className="mt-5">
        <div className="text-3xl font-semibold tracking-tight text-foreground">{value}</div>
        <div className="mt-1 text-sm text-muted-foreground">{label}</div>
        {sub && <div className="mt-3 text-xs text-muted-foreground">{sub}</div>}
      </div>
    </div>
  );
}
