import { useMemo } from "react";
import { PageShell } from "@/components/page-shell";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { cn } from "@/lib/utils";
import { getAssessmentDepartments, departmentScore, maturityLevel } from "@/lib/scoring";

const COLORS = ["#EF4444", "#F59E0B", "#3B82F6", "#8B5CF6", "#10B981"]; // Initial to Optimized colors

export default function AdminAnalyticsPage() {
  const organizations = useStore((state) => state.organizations);
  const assessments = useStore((state) => state.assessments);

  // Completed/Submitted assessments
  const completedAsms = useMemo(() => {
    return assessments.filter((a) => a.status === "Completed" || a.status === "Submitted");
  }, [assessments]);

  // 1. Industry-wise average maturity
  const industryAverages = useMemo(() => {
    const scores: Record<string, number[]> = {};
    completedAsms.forEach((asm) => {
      // Find org industry
      const org = organizations.find((o) => o.name === asm.company);
      if (org) {
        if (!scores[org.industry]) scores[org.industry] = [];
        scores[org.industry].push(asm.overallScore);
      }
    });

    return Object.entries(scores).map(([name, values]) => {
      const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
      return { name, score: Number(avg.toFixed(2)) };
    });
  }, [completedAsms, organizations]);

  // 2. Business Function Averages
  const functionAverages = useMemo(() => {
    const scores: Record<string, number[]> = {};
    completedAsms.forEach((asm) => {
      const deps = getAssessmentDepartments(asm.id);
      deps.forEach((d) => {
        const dScore = departmentScore(d);
        if (!scores[d.name]) scores[d.name] = [];
        scores[d.name].push(dScore);
      });
    });

    return Object.entries(scores).map(([subject, values]) => {
      const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
      return { subject, A: Number(avg.toFixed(2)) };
    });
  }, [completedAsms]);

  // 3. Risk Distribution (Maturity bands counts)
  const riskDistribution = useMemo(() => {
    let initialCount = 0; // < 1.8
    let developingCount = 0; // 1.8 - 2.8
    let definedCount = 0; // 2.8 - 3.8
    let managedCount = 0; // 3.8 - 4.5
    let optimizedCount = 0; // >= 4.5

    completedAsms.forEach((asm) => {
      const s = asm.overallScore;
      if (s < 1.8) initialCount++;
      else if (s < 2.8) developingCount++;
      else if (s < 3.8) definedCount++;
      else if (s < 4.5) managedCount++;
      else optimizedCount++;
    });

    return [
      { name: "Initial", value: initialCount },
      { name: "Developing", value: developingCount },
      { name: "Defined", value: definedCount },
      { name: "Managed", value: managedCount },
      { name: "Optimized", value: optimizedCount },
    ].filter(d => d.value > 0);
  }, [completedAsms]);

  // 4. Rankings Leaderboard (Top 10 Organizations)
  const organizationLeaderboard = useMemo(() => {
    const board: { name: string; industry: string; score: number }[] = [];
    organizations.forEach((org) => {
      const orgAsms = completedAsms.filter((a) => a.company === org.name);
      if (orgAsms.length > 0) {
        orgAsms.sort((a, b) => b.overallScore - a.overallScore);
        board.push({
          name: org.name,
          industry: org.industry,
          score: orgAsms[0].overallScore
        });
      }
    });

    return board.sort((a, b) => b.score - a.score).slice(0, 10);
  }, [organizations, completedAsms]);

  // 5. Historical Trends
  const historicalTrends = [
    { year: "2023", average: 2.15 },
    { year: "2024", average: 2.58 },
    { year: "2025", average: 3.12 },
    { year: "2026", average: 3.48 },
  ];

  return (
    <PageShell title="Platform Analytics" description="High-fidelity analysis of organizational capability indexes, industry performance benchmarks, and maturity bands.">
      
      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        
        {/* Industry Benchmarks */}
        <Card className="rounded-2xl border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-foreground">Industry Maturity Averages</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {industryAverages.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={industryAverages} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                  <XAxis type="number" domain={[0, 5]} stroke="var(--muted-foreground)" tick={{ fontSize: 10 }} />
                  <YAxis dataKey="name" type="category" stroke="var(--muted-foreground)" tick={{ fontSize: 10 }} width={100} />
                  <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 11 }} />
                  <Bar dataKey="score" fill="var(--primary)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center italic text-xs text-muted-foreground">No assessment data.</div>
            )}
          </CardContent>
        </Card>

        {/* Function Radar */}
        <Card className="rounded-2xl border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-foreground">Business Function Capability Map</CardTitle>
          </CardHeader>
          <CardContent className="h-80 flex items-center justify-center">
            {functionAverages.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={functionAverages}>
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis dataKey="subject" stroke="var(--muted-foreground)" tick={{ fontSize: 9 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 5]} stroke="var(--muted-foreground)" tick={{ fontSize: 8 }} />
                  <Radar name="Average Score" dataKey="A" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.2} />
                  <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 11 }} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center italic text-xs text-muted-foreground">No assessment data.</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* Risk Distribution Pie */}
        <Card className="rounded-2xl border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-foreground">Maturity Band Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-72 flex flex-col justify-between">
            {riskDistribution.length > 0 ? (
              <>
                <div className="h-44 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={riskDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {riskDistribution.map((entry, index) => {
                          let colorIndex = 0;
                          if (entry.name === "Developing") colorIndex = 1;
                          else if (entry.name === "Defined") colorIndex = 2;
                          else if (entry.name === "Managed") colorIndex = 3;
                          else if (entry.name === "Optimized") colorIndex = 4;
                          return <Cell key={`cell-${index}`} fill={COLORS[colorIndex]} />;
                        })}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-3 gap-1.5 text-[9px]">
                  {riskDistribution.map((d) => (
                    <div key={d.name} className="flex items-center gap-1 min-w-0">
                      <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{
                        backgroundColor:
                          d.name === "Initial" ? COLORS[0] :
                          d.name === "Developing" ? COLORS[1] :
                          d.name === "Defined" ? COLORS[2] :
                          d.name === "Managed" ? COLORS[3] : COLORS[4]
                      }} />
                      <span className="truncate text-muted-foreground">{d.name} ({d.value})</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center italic text-xs text-muted-foreground">No assessment data.</div>
            )}
          </CardContent>
        </Card>

        {/* Historical Trends Area */}
        <Card className="rounded-2xl border-border bg-card shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-foreground">Platform Progress Trend (Average Score)</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historicalTrends} margin={{ left: -20, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="year" stroke="var(--muted-foreground)" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 5]} stroke="var(--muted-foreground)" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 11 }} />
                <Line type="monotone" dataKey="average" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Rankings Leaderboard */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="border-b border-border px-6 py-4">
          <h3 className="text-sm font-semibold text-foreground">Organization Maturity Leaderboard</h3>
          <p className="text-[10px] text-muted-foreground mt-0.5">Top performing workspace profiles registered on the maturity assessment engine.</p>
        </div>
        <table className="w-full text-xs">
          <thead className="bg-muted/30 border-b border-border">
            <tr>
              <th className="py-2.5 px-6 text-left font-semibold text-muted-foreground">Rank</th>
              <th className="py-2.5 px-6 text-left font-semibold text-muted-foreground">Organization Name</th>
              <th className="py-2.5 px-6 text-left font-semibold text-muted-foreground">Industry Sector</th>
              <th className="py-2.5 px-6 text-center font-semibold text-muted-foreground">Maturity Score</th>
              <th className="py-2.5 px-6 text-right font-semibold text-muted-foreground">Rating Band</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {organizationLeaderboard.map((item, idx) => (
              <tr key={item.name} className="hover:bg-muted/10 transition">
                <td className="py-2.5 px-6 font-bold text-muted-foreground">#{idx + 1}</td>
                <td className="py-2.5 px-6 font-semibold text-foreground">{item.name}</td>
                <td className="py-2.5 px-6 text-muted-foreground">{item.industry}</td>
                <td className="py-2.5 px-6 text-center">
                  <span className="font-bold text-foreground">{item.score.toFixed(2)}</span>
                </td>
                <td className="py-2.5 px-6 text-right">
                  <span className={cn("text-[9px] px-1.5 py-0.5 rounded font-semibold border",
                    item.score >= 4.5 ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                    item.score >= 3.8 ? "bg-blue-50 text-blue-700 border-blue-200" :
                    item.score >= 2.8 ? "bg-indigo-50 text-indigo-700 border-indigo-200" :
                    item.score >= 1.8 ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-rose-50 text-rose-700 border-rose-200"
                  )}>
                    {maturityLevel(item.score)}
                  </span>
                </td>
              </tr>
            ))}
            {organizationLeaderboard.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 text-center text-muted-foreground italic">
                  No organization rankings resolved yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}
