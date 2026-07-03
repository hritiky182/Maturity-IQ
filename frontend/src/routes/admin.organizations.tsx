import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { PageShell } from "@/components/page-shell";
import { useStore } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Building, ShieldAlert, Sparkles, Map, User, Mail, Phone, Globe, Users, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAssessmentDepartments, departmentScore, maturityColor, maturityLevel } from "@/lib/scoring";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function AdminOrganizationsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const organizations = useStore((state) => state.organizations);
  const assessments = useStore((state) => state.assessments);
  const recommendations = useStore((state) => state.recommendations);
  const roadmap = useStore((state) => state.roadmap);

  // Search & Filter State
  const [search, setSearch] = useState("");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");

  const orgId = searchParams.get("id") || organizations[0]?.id;

  const filteredOrgs = useMemo(() => {
    return organizations.filter((org) => {
      const matchSearch = org.name.toLowerCase().includes(search.toLowerCase()) || 
                          (org.contactPerson || "").toLowerCase().includes(search.toLowerCase());
      const matchInd = industryFilter === "all" || org.industry === industryFilter;
      const matchCountry = countryFilter === "all" || org.country === countryFilter;
      return matchSearch && matchInd && matchCountry;
    });
  }, [organizations, search, industryFilter, countryFilter]);

  const activeOrg = useMemo(() => {
    return organizations.find((o) => o.id === orgId) || organizations[0];
  }, [organizations, orgId]);

  // Resolve assessment for active organization
  const latestAsm = useMemo(() => {
    if (!activeOrg) return null;
    const orgAsms = assessments.filter((a) => a.company === activeOrg.name);
    if (orgAsms.length === 0) return null;
    orgAsms.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    return orgAsms[0];
  }, [assessments, activeOrg]);

  const activeDeps = useMemo(() => {
    if (!latestAsm) return [];
    return getAssessmentDepartments(latestAsm.id);
  }, [latestAsm]);

  const departmentChartData = useMemo(() => {
    return activeDeps.map((d) => ({
      name: d.name,
      score: Number(departmentScore(d).toFixed(2))
    }));
  }, [activeDeps]);

  // Filter recommendations for active org functions
  const orgRecs = useMemo(() => {
    if (!latestAsm) return [];
    const activeNames = activeDeps.map((d) => d.name);
    return recommendations.filter((r) => activeNames.includes(r.department)).slice(0, 5);
  }, [recommendations, latestAsm, activeDeps]);

  // Filter roadmap for active org functions
  const orgRoadmap = useMemo(() => {
    if (!latestAsm) return [];
    const activeNames = activeDeps.map((d) => d.name);
    return roadmap.filter((r) => activeNames.includes(r.department)).slice(0, 5);
  }, [roadmap, latestAsm, activeDeps]);

  // Tab State
  const [activeTab, setActiveTab] = useState("overview");

  // Filter options lists
  const industriesList = useMemo(() => {
    return Array.from(new Set(organizations.map((org) => org.industry)));
  }, [organizations]);

  const countriesList = useMemo(() => {
    return Array.from(new Set(organizations.map((org) => org.country)));
  }, [organizations]);

  const handleSelectOrg = (id: string) => {
    setSearchParams({ id });
  };

  return (
    <PageShell title="Organizations" description="Manage enterprise workspaces, baseline capabilties, and roadmaps.">
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
        
        {/* Left Column: Organization List */}
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search organizations..."
                className="pl-8 text-xs h-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <Select value={industryFilter} onValueChange={setIndustryFilter}>
              <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Industry" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                {industriesList.map((ind) => (
                  <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={countryFilter} onValueChange={setCountryFilter}>
              <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Country" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                {countriesList.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm max-h-[500px] overflow-y-auto">
            <div className="divide-y divide-border/60">
              {filteredOrgs.map((org) => {
                const active = org.id === activeOrg?.id;
                return (
                  <button
                    key={org.id}
                    onClick={() => handleSelectOrg(org.id)}
                    className={cn(
                      "w-full text-left p-3.5 flex items-center gap-3 transition cursor-pointer text-xs",
                      active ? "bg-primary/5 border-l-2 border-primary" : "hover:bg-muted/30"
                    )}
                  >
                    <Building className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-foreground truncate">{org.name}</div>
                      <div className="text-[10px] text-muted-foreground truncate">{org.industry} · {org.country}</div>
                    </div>
                  </button>
                );
              })}
              {filteredOrgs.length === 0 && (
                <div className="p-4 text-center text-muted-foreground italic text-xs">No workspaces found.</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Detailed views */}
        {activeOrg ? (
          <div className="bg-card border border-border rounded-2xl shadow-sm p-6 space-y-6">
            
            {/* Header profile details */}
            <div className="border-b border-border pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-foreground">{activeOrg.name}</h3>
                <div className="flex flex-wrap gap-2.5 mt-1.5 text-xs text-muted-foreground items-center">
                  <span className="flex items-center gap-1"><Globe className="h-3.5 w-3.5" /> {activeOrg.country}</span>
                  <span>•</span>
                  <span>{activeOrg.industry}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {activeOrg.employees} staff</span>
                  <span>•</span>
                  <span>{activeOrg.type}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => toast.success("Shared dashboard link copied to clipboard.")}>Share View</Button>
              </div>
            </div>

            {/* Profile Contact info box */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/20 border border-border rounded-xl text-xs">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary shrink-0" />
                <span className="truncate text-foreground font-semibold">{activeOrg.contactPerson || "No Contact Assigned"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                <span className="truncate text-foreground">{activeOrg.email || "—"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary shrink-0" />
                <span className="truncate text-foreground">{activeOrg.phone || "—"}</span>
              </div>
            </div>

            {/* Tabs Selector */}
            <div className="flex border-b border-border gap-4 pb-2">
              {[
                { id: "overview", label: "Overview", icon: Building },
                { id: "capability", label: "Capability scores", icon: TrendingUp },
                { id: "recommendations", label: "Recommendations", icon: Sparkles },
                { id: "roadmap", label: "Transformation roadmap", icon: Map },
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

            {/* TAB PANELS */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {latestAsm ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="border border-border bg-muted/10 rounded-xl p-4 text-center">
                        <div className="text-[10px] uppercase font-bold text-muted-foreground">Overall maturity score</div>
                        <div className="text-2xl font-bold text-foreground mt-1">{latestAsm.overallScore.toFixed(2)}</div>
                        <div className="mt-1 text-xs">
                          <span className={cn("px-2 py-0.5 rounded font-semibold border text-[9px]", maturityColor(latestAsm.overallScore))}>
                            {maturityLevel(latestAsm.overallScore)}
                          </span>
                        </div>
                      </div>
                      <div className="border border-border bg-muted/10 rounded-xl p-4 text-center">
                        <div className="text-[10px] uppercase font-bold text-muted-foreground">Scope In-Play</div>
                        <div className="text-2xl font-bold text-foreground mt-1">{latestAsm.departments.length} Functions</div>
                        <div className="text-[10px] text-muted-foreground mt-1">Evaluated this cycle</div>
                      </div>
                      <div className="border border-border bg-muted/10 rounded-xl p-4 text-center">
                        <div className="text-[10px] uppercase font-bold text-muted-foreground">Completion</div>
                        <div className="text-2xl font-bold text-foreground mt-1">{latestAsm.completion}%</div>
                        <div className="text-[10px] text-muted-foreground mt-1">Status: {latestAsm.status}</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Assessment Summary</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {activeOrg.name} has finalized its capabilities assessment for {latestAsm.year} with an overall rating of {latestAsm.overallScore}. 
                        This places the organization in the <span className="font-semibold text-foreground">{maturityLevel(latestAsm.overallScore)}</span> capability bracket.
                        Based on parameters, the primary improvement areas lie in technology infrastructure integration and strategic governance oversight.
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="p-8 text-center text-muted-foreground italic border border-dashed border-border rounded-xl">
                    No completed capability assessments found for this organization.
                  </div>
                )}
              </div>
            )}

            {activeTab === "capability" && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Business Function Breakdown</h4>
                {departmentChartData.length > 0 ? (
                  <div className="h-72 border border-border rounded-xl p-4 bg-muted/5">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={departmentChartData} margin={{ left: -20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                        <XAxis dataKey="name" stroke="var(--muted-foreground)" tick={{ fontSize: 10 }} />
                        <YAxis domain={[0, 5]} stroke="var(--muted-foreground)" tick={{ fontSize: 10 }} />
                        <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 11 }} />
                        <Bar dataKey="score" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground italic border border-dashed border-border rounded-xl">
                    No capability scores compiled.
                  </div>
                )}
              </div>
            )}

            {activeTab === "recommendations" && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tailored Strategic Recommendations</h4>
                {orgRecs.length > 0 ? (
                  <div className="space-y-2">
                    {orgRecs.map((rec) => (
                      <div key={rec.id} className="border border-border rounded-xl p-4 bg-card shadow-sm space-y-1">
                        <div className="flex justify-between items-start gap-2">
                          <span className="font-semibold text-xs text-foreground">{rec.title}</span>
                          <span className={cn("text-[9px] px-1.5 py-0.5 rounded font-semibold border shrink-0",
                            rec.priority === "Critical" ? "bg-rose-50 text-rose-700 border-rose-200" :
                            rec.priority === "High" ? "bg-orange-50 text-orange-700 border-orange-200" : "bg-muted text-muted-foreground border-border"
                          )}>
                            {rec.priority}
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">{rec.description}</p>
                        <div className="flex items-center justify-between text-[9px] text-muted-foreground pt-1.5 border-t border-border/40 mt-1.5">
                          <span>Function: {rec.department}</span>
                          <span>Timeline: {rec.timeline}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground italic border border-dashed border-border rounded-xl">
                    No recommendations found.
                  </div>
                )}
              </div>
            )}

            {activeTab === "roadmap" && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Initiative Milestones Roadmap</h4>
                {orgRoadmap.length > 0 ? (
                  <div className="space-y-2">
                    {orgRoadmap.map((item) => (
                      <div key={item.id} className="border border-border rounded-xl p-3 bg-card shadow-sm flex items-center justify-between gap-4 text-xs">
                        <div>
                          <div className="font-semibold text-foreground">{item.initiative}</div>
                          <div className="text-[10px] text-muted-foreground mt-0.5">Owner: {item.owner} · Function: {item.department}</div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className={cn("px-2 py-0.5 rounded border text-[9px] font-semibold",
                            item.status === "Completed" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                            item.status === "In Progress" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-muted text-muted-foreground border-border"
                          )}>
                            {item.status} ({item.progress}%)
                          </span>
                          <div className="text-[9px] text-muted-foreground mt-1">{item.quarter} ({item.timeline})</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground italic border border-dashed border-border rounded-xl">
                    No roadmap items generated.
                  </div>
                )}
              </div>
            )}

          </div>
        ) : (
          <div className="p-12 text-center text-muted-foreground italic border border-border bg-card rounded-2xl shadow-sm">
            Select an organization from the panel list to view details.
          </div>
        )}

      </div>
    </PageShell>
  );
}
