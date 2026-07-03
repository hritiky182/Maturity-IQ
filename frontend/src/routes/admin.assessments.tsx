import { useState, useMemo } from "react";
import { PageShell } from "@/components/page-shell";
import { useStore } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Download, FileSpreadsheet, Eye, Printer, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { getAssessmentDepartments, departmentScore, maturityColor, maturityLevel } from "@/lib/scoring";

export default function AdminAssessmentsPage() {
  const assessments = useStore((state) => state.assessments);
  const deleteAssessment = useStore((state) => state.deleteAssessment);

  // Filter/Sort State
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");

  // Detail Modal State
  const [detailAsmId, setDetailAsmId] = useState<string | null>(null);

  const filteredAssessments = useMemo(() => {
    let result = assessments.filter((asm) => {
      const matchSearch = asm.company.toLowerCase().includes(search.toLowerCase()) || 
                          asm.name.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || asm.status === statusFilter;
      const matchInd = industryFilter === "all" || asm.industry === industryFilter;
      return matchSearch && matchStatus && matchInd;
    });

    // Sorting
    return result.sort((a, b) => {
      if (sortBy === "date-desc") return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      if (sortBy === "date-asc") return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      if (sortBy === "score-desc") return b.overallScore - a.overallScore;
      if (sortBy === "score-asc") return a.overallScore - b.overallScore;
      if (sortBy === "completion-desc") return b.completion - a.completion;
      return 0;
    });
  }, [assessments, search, statusFilter, industryFilter, sortBy]);

  const activeAsmDetail = useMemo(() => {
    return assessments.find((a) => a.id === detailAsmId) || null;
  }, [assessments, detailAsmId]);

  const activeDeps = useMemo(() => {
    if (!activeAsmDetail) return [];
    return getAssessmentDepartments(activeAsmDetail.id);
  }, [activeAsmDetail]);

  const handleExport = (asmName: string, format: string) => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1200)),
      {
        loading: `Exporting ${asmName} in ${format} format...`,
        success: `Successfully exported and downloaded ${asmName}.${format === "Excel" ? "xlsx" : "pdf"}`,
        error: "Export failed"
      }
    );
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this assessment record permanently?")) {
      deleteAssessment(id);
      toast.success("Assessment deleted successfully.");
    }
  };

  return (
    <PageShell title="Assessments Manager" description="Audit historical assessment records, baseline reports, and completion logs.">
      {/* Search & Filter Bar */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search company or assessment title..."
            className="pl-8 text-xs h-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 h-9 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Draft">Draft</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="Submitted">Submitted</SelectItem>
          </SelectContent>
        </Select>

        <Select value={industryFilter} onValueChange={setIndustryFilter}>
          <SelectTrigger className="w-40 h-9 text-xs"><SelectValue placeholder="Industry Template" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Industries</SelectItem>
            <SelectItem value="realestate">Real Estate</SelectItem>
            <SelectItem value="healthcare">Healthcare</SelectItem>
            <SelectItem value="government">Government</SelectItem>
            <SelectItem value="education">Education</SelectItem>
            <SelectItem value="general">General Enterprise</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-44 h-9 text-xs"><SelectValue placeholder="Sort By" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="date-desc">Updated: Newest First</SelectItem>
            <SelectItem value="date-asc">Updated: Oldest First</SelectItem>
            <SelectItem value="score-desc">Score: Highest First</SelectItem>
            <SelectItem value="score-asc">Score: Lowest First</SelectItem>
            <SelectItem value="completion-desc">Completion: Highest First</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Assessments list table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <table className="w-full text-xs">
          <thead className="bg-muted/30 border-b border-border">
            <tr>
              <th className="py-3 px-6 text-left font-semibold text-muted-foreground">ID</th>
              <th className="py-3 px-6 text-left font-semibold text-muted-foreground">Organization Name</th>
              <th className="py-3 px-6 text-left font-semibold text-muted-foreground">Assessment Title</th>
              <th className="py-3 px-6 text-center font-semibold text-muted-foreground">Maturity Score</th>
              <th className="py-3 px-6 text-center font-semibold text-muted-foreground">Completion</th>
              <th className="py-3 px-6 text-center font-semibold text-muted-foreground">Status</th>
              <th className="py-3 px-6 text-right font-semibold text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {filteredAssessments.map((asm) => (
              <tr key={asm.id} className="hover:bg-muted/10 transition cursor-pointer" onClick={() => setDetailAsmId(asm.id)}>
                <td className="py-3 px-6 font-mono text-muted-foreground">{asm.id}</td>
                <td className="py-3 px-6 font-semibold text-foreground">{asm.company}</td>
                <td className="py-3 px-6 text-muted-foreground">{asm.name} ({asm.year})</td>
                <td className="py-3 px-6 text-center">
                  {asm.overallScore > 0 ? (
                    <span className={cn("font-bold border px-2 py-0.5 rounded text-[10px]", maturityColor(asm.overallScore))}>
                      {asm.overallScore.toFixed(2)} ({maturityLevel(asm.overallScore)})
                    </span>
                  ) : (
                    <span className="text-muted-foreground italic">Not Rated</span>
                  )}
                </td>
                <td className="py-3 px-6 text-center font-medium">{asm.completion}%</td>
                <td className="py-3 px-6 text-center">
                  <span className={cn("text-[9px] px-2 py-0.5 rounded border font-semibold",
                    asm.status === "Submitted" || asm.status === "Completed" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                    asm.status === "In Progress" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-muted text-muted-foreground border-border"
                  )}>
                    {asm.status}
                  </span>
                </td>
                <td className="py-3 px-6 text-right flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer" onClick={() => setDetailAsmId(asm.id)} title="View Details">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer" onClick={() => handleExport(asm.company, "PDF")} title="Download PDF">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-rose-600 cursor-pointer" onClick={(e) => handleDelete(asm.id, e)} title="Delete Record">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
            {filteredAssessments.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-muted-foreground italic">
                  No assessments match your filter parameters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* DETAIL DIALOG MODAL */}
      <Dialog open={detailAsmId !== null} onOpenChange={(open) => !open && setDetailAsmId(null)}>
        <DialogContent className="max-w-3xl">
          {activeAsmDetail && (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-foreground">{activeAsmDetail.company}</DialogTitle>
                <DialogDescription className="text-xs">
                  {activeAsmDetail.name} (FY {activeAsmDetail.year}) · Template ID: {activeAsmDetail.industry}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 mt-4">
                <div className="grid grid-cols-3 gap-4 border border-border p-4 rounded-xl text-center text-xs bg-muted/10">
                  <div>
                    <span className="block text-muted-foreground uppercase font-bold text-[10px]">Maturity rating</span>
                    <span className="text-xl font-bold text-foreground block mt-1">{activeAsmDetail.overallScore.toFixed(2)}</span>
                    <span className={cn("px-2 py-0.5 rounded font-semibold border text-[9px] inline-block mt-1", maturityColor(activeAsmDetail.overallScore))}>
                      {maturityLevel(activeAsmDetail.overallScore)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-muted-foreground uppercase font-bold text-[10px]">Completion</span>
                    <span className="text-xl font-bold text-foreground block mt-1">{activeAsmDetail.completion}%</span>
                    <span className="text-[10px] text-muted-foreground block mt-1">Status: {activeAsmDetail.status}</span>
                  </div>
                  <div>
                    <span className="block text-muted-foreground uppercase font-bold text-[10px]">Scope count</span>
                    <span className="text-xl font-bold text-foreground block mt-1">{activeAsmDetail.departments.length} Functions</span>
                    <span className="text-[10px] text-muted-foreground block mt-1">Sponsor: {activeAsmDetail.sponsor || "Corporate"}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Business Function Performance Scorecard</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    {activeDeps.map((d) => {
                      const score = departmentScore(d);
                      return (
                        <div key={d.id} className="flex justify-between items-center p-3 border border-border rounded-lg bg-card">
                          <span className="font-medium text-foreground">{d.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-bold tabular-nums text-foreground">{score.toFixed(2)}</span>
                            <span className={cn("text-[9px] px-1.5 py-0.5 rounded font-semibold border", maturityColor(score))}>
                              {maturityLevel(score)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-border mt-4">
                  <Button variant="outline" size="sm" onClick={() => handleExport(activeAsmDetail.company, "Excel")} className="gap-1">
                    <FileSpreadsheet className="h-4 w-4" /> Export Excel
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleExport(activeAsmDetail.company, "PDF")} className="gap-1">
                    <Printer className="h-4 w-4" /> Export PDF
                  </Button>
                  <Button size="sm" onClick={() => setDetailAsmId(null)}>Close</Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
