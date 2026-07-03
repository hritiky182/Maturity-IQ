import { useMemo } from "react";
import { PageShell } from "@/components/page-shell";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Building,
  ClipboardCheck,
  TrendingUp,
  AlertTriangle,
  Users,
  Compass,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", "#6366F1", "#14B8A6", "#F43F5E"];

export default function AdminDashboard() {
  const organizations = useStore((state) => state.organizations);
  const assessments = useStore((state) => state.assessments);

  // Statistics
  const totalOrgs = organizations.length;
  const totalAsms = assessments.length;

  const completedOrSubmitted = useMemo(() => {
    return assessments.filter((a) => a.status === "Completed" || a.status === "Submitted");
  }, [assessments]);

  const avgMaturity = useMemo(() => {
    if (completedOrSubmitted.length === 0) return 0;
    const sum = completedOrSubmitted.reduce((acc, a) => acc + a.overallScore, 0);
    return Number((sum / completedOrSubmitted.length).toFixed(2));
  }, [completedOrSubmitted]);

  const completionRate = useMemo(() => {
    if (totalAsms === 0) return 0;
    return Math.round((completedOrSubmitted.length / totalAsms) * 100);
  }, [totalAsms, completedOrSubmitted]);

  // Industry distribution chart data
  const industryData = useMemo(() => {
    const counts: Record<string, number> = {};
    organizations.forEach((org) => {
      counts[org.industry] = (counts[org.industry] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [organizations]);

  // High Risk Organizations (score < 2.5)
  const highRiskOrgs = useMemo(() => {
    // Map each organization to their latest score
    const riskList: { name: string; industry: string; score: number; status: string; id: string }[] = [];
    organizations.forEach((org) => {
      // Find latest completed or in-progress assessment
      const orgAsms = assessments.filter((a) => a.company === org.name);
      if (orgAsms.length > 0) {
        // sort by updatedAt
        orgAsms.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        const latest = orgAsms[0];
        if (latest.overallScore > 0 && latest.overallScore < 3.0) {
          riskList.push({
            id: org.id,
            name: org.name,
            industry: org.industry,
            score: latest.overallScore,
            status: latest.status
          });
        }
      }
    });
    // sort ascending by score
    return riskList.sort((a, b) => a.score - b.score).slice(0, 5);
  }, [organizations, assessments]);

  return (
    <PageShell title="Admin Command Center" description="Overview of maturity assessments, organizational baselines, and cross-sector diagnostics.">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="rounded-2xl border-border bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground">Total Organizations</CardTitle>
            <Building className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalOrgs}</div>
            <p className="text-[10px] text-muted-foreground mt-0.5">Actively registered workspaces</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground">Total Assessments</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalAsms}</div>
            <p className="text-[10px] text-muted-foreground mt-0.5">{completedOrSubmitted.length} completed / submitted</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground">Average Maturity Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{avgMaturity.toFixed(2)} / 5.0</div>
            <p className="text-[10px] text-muted-foreground mt-0.5">Across completed cycles</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground">Completion Rate</CardTitle>
            <Compass className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{completionRate}%</div>
            <p className="text-[10px] text-muted-foreground mt-0.5">Assessment finalization progress</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts & Risk Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* Industry Distribution Chart */}
        <Card className="rounded-2xl border-border bg-card shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-foreground">Industry Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={industryData} margin={{ left: -10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" tick={{ fontSize: 10 }} />
                <YAxis stroke="var(--muted-foreground)" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 11 }} />
                <Bar dataKey="value" fill="var(--primary)" radius={[4, 4, 0, 0]}>
                  {industryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Industry Pie Summary */}
        <Card className="rounded-2xl border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-foreground">Sector Ratios</CardTitle>
          </CardHeader>
          <CardContent className="h-80 flex flex-col justify-between">
            <div className="h-48 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={industryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {industryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px] mt-4">
              {industryData.slice(0, 6).map((d, index) => (
                <div key={d.name} className="flex items-center gap-1.5 min-w-0">
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="truncate text-muted-foreground">{d.name} ({d.value})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* High Risk Organizations Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="border-b border-border px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" /> Action Required: High Risk Portfolios
            </h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">Organizations with overall maturity scoring below 3.0 (Developing/Initial).</p>
          </div>
          <Link to="/admin/organizations" className="text-xs text-primary font-semibold hover:underline">
            View All Organizations
          </Link>
        </div>
        <table className="w-full text-xs">
          <thead className="bg-muted/30 border-b border-border">
            <tr>
              <th className="py-3 px-6 text-left font-semibold text-muted-foreground">Organization Name</th>
              <th className="py-3 px-6 text-left font-semibold text-muted-foreground">Industry</th>
              <th className="py-3 px-6 text-center font-semibold text-muted-foreground">Maturity score</th>
              <th className="py-3 px-6 text-center font-semibold text-muted-foreground">Status</th>
              <th className="py-3 px-6 text-right font-semibold text-muted-foreground">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {highRiskOrgs.map((org) => (
              <tr key={org.id} className="hover:bg-muted/10 transition">
                <td className="py-3 px-6 font-semibold text-foreground">{org.name}</td>
                <td className="py-3 px-6 text-muted-foreground">{org.industry}</td>
                <td className="py-3 px-6 text-center">
                  <span className="font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 px-2 py-0.5 rounded">
                    {org.score.toFixed(2)}
                  </span>
                </td>
                <td className="py-3 px-6 text-center">
                  <span className={cn("text-[10px] px-2 py-0.5 rounded border font-medium",
                    org.status === "Submitted" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                    org.status === "In Progress" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-muted text-muted-foreground border-border"
                  )}>
                    {org.status}
                  </span>
                </td>
                <td className="py-3 px-6 text-right">
                  <Link to={`/admin/organizations?id=${org.id}`} className="text-xs font-semibold text-primary hover:underline">
                    Analyze Profile
                  </Link>
                </td>
              </tr>
            ))}
            {highRiskOrgs.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 text-center text-muted-foreground italic">
                  All organizations demonstrate solid capability levels.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}
