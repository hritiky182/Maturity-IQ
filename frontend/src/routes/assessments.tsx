import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStore } from "@/lib/store";
import { maturityColor, maturityLevel } from "@/lib/scoring";
import { cn } from "@/lib/utils";
import { Plus, Search, MoreHorizontal, Copy, FileDown, Play, Eye, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AssessmentsPage() {
  const navigate = useNavigate();
  const assessments = useStore((state) => state.assessments);
  const deleteAssessment = useStore((state) => state.deleteAssessment);
  const duplicateAssessment = useStore((state) => state.duplicateAssessment);
  const setCurrentAssessmentId = useStore((state) => state.setCurrentAssessmentId);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [department, setDepartment] = useState("all");
  const [year, setYear] = useState("all");
  const [sortBy, setSortBy] = useState("updatedAt-desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filtered rows
  const filteredRows = useMemo(() => {
    return assessments.filter((a) => {
      // Status filter
      if (status !== "all" && a.status !== status) return false;
      
      // Department filter
      if (department !== "all" && !a.departments.includes(department)) return false;
      
      // Year filter
      if (year !== "all" && String(a.year) !== year) return false;
      
      // Search query
      if (q) {
        const query = q.toLowerCase();
        const matchesName = a.name.toLowerCase().includes(query);
        const matchesCompany = a.company.toLowerCase().includes(query);
        const matchesId = a.id.toLowerCase().includes(query);
        if (!matchesName && !matchesCompany && !matchesId) return false;
      }
      return true;
    });
  }, [assessments, q, status, department, year]);

  // Sorted rows
  const sortedRows = useMemo(() => {
    const sorted = [...filteredRows];
    const [field, direction] = sortBy.split("-");
    const dirMultiplier = direction === "desc" ? -1 : 1;

    sorted.sort((a, b) => {
      if (field === "score") {
        return (a.overallScore - b.overallScore) * dirMultiplier;
      }
      if (field === "completion") {
        return (a.completion - b.completion) * dirMultiplier;
      }
      if (field === "updatedAt") {
        return a.updatedAt.localeCompare(b.updatedAt) * dirMultiplier;
      }
      if (field === "id") {
        return a.id.localeCompare(b.id) * dirMultiplier;
      }
      return 0;
    });

    return sorted;
  }, [filteredRows, sortBy]);

  // Paginated rows
  const paginatedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedRows.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedRows, currentPage]);

  const totalPages = Math.ceil(sortedRows.length / itemsPerPage) || 1;

  const statusStyle: Record<string, string> = {
    Draft: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    "In Progress": "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
    Completed: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
    Submitted: "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300",
    Archived: "bg-muted text-muted-foreground",
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this assessment?")) {
      deleteAssessment(id);
      toast.success("Assessment deleted successfully");
    }
  };

  const handleDuplicate = (id: string) => {
    duplicateAssessment(id);
    toast.success("Assessment duplicated successfully");
  };

  const handleContinue = (id: string) => {
    setCurrentAssessmentId(id);
    navigate(`/assessments/new?id=${id}`);
  };

  const handleView = (id: string) => {
    setCurrentAssessmentId(id);
    navigate(`/reports?assessmentId=${id}`);
  };

  const handleExport = (id: string, format: "pdf" | "excel") => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: `Generating ${format.toUpperCase()} export...`,
        success: `Assessment ${id} successfully exported as ${format.toUpperCase()}`,
        error: "Export failed",
      }
    );
  };

  return (
    <PageShell
      title="Assessments"
      description="Manage organizational maturity assessments across your portfolio companies."
      actions={
        <Button asChild>
          <Link to="/assessments/new"><Plus className="h-4 w-4 mr-1" /> Create assessment</Link>
        </Button>
      }
    >
      <div className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name, company, ID…" 
              value={q} 
              onChange={(e) => { setQ(e.target.value); setCurrentPage(1); }} 
              className="pl-9" 
            />
          </div>
          
          <Select value={status} onValueChange={(val) => { setStatus(val); setCurrentPage(1); }}>
            <SelectTrigger className="w-40"><SelectValue placeholder="All Statuses" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="Draft">Draft</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Submitted">Submitted</SelectItem>
            </SelectContent>
          </Select>

          <Select value={department} onValueChange={(val) => { setDepartment(val); setCurrentPage(1); }}>
            <SelectTrigger className="w-44"><SelectValue placeholder="All Departments" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All departments</SelectItem>
              <SelectItem value="strategy">Strategy</SelectItem>
              <SelectItem value="hr">Human Resources</SelectItem>
              <SelectItem value="innovation">Innovation</SelectItem>
              <SelectItem value="it">IT</SelectItem>
              <SelectItem value="legal">Legal & Compliance</SelectItem>
              <SelectItem value="operations">Operations</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
            </SelectContent>
          </Select>

          <Select value={year} onValueChange={(val) => { setYear(val); setCurrentPage(1); }}>
            <SelectTrigger className="w-32"><SelectValue placeholder="All Years" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All years</SelectItem>
              <SelectItem value="2026">FY 2026</SelectItem>
              <SelectItem value="2025">FY 2025</SelectItem>
              <SelectItem value="2024">FY 2024</SelectItem>
              <SelectItem value="2023">FY 2023</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Sort By" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="updatedAt-desc">Updated (Recent First)</SelectItem>
              <SelectItem value="updatedAt-asc">Updated (Oldest First)</SelectItem>
              <SelectItem value="score-desc">Maturity Score (High-Low)</SelectItem>
              <SelectItem value="score-asc">Maturity Score (Low-High)</SelectItem>
              <SelectItem value="completion-desc">Completion % (High-Low)</SelectItem>
              <SelectItem value="id-desc">ID (High-Low)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground bg-muted/40">
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">Assessment</th>
                <th className="px-4 py-3 font-medium">Company</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Progress</th>
                <th className="px-4 py-3 font-medium">Score</th>
                <th className="px-4 py-3 font-medium">Updated</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedRows.map((a) => (
                <tr key={a.id} className="hover:bg-muted/30 transition">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{a.id}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{a.name}</div>
                    <div className="text-xs text-muted-foreground">{a.departments.length} departments · FY {a.year}</div>
                  </td>
                  <td className="px-4 py-3 text-foreground">{a.company}</td>
                  <td className="px-4 py-3">
                    <span className={cn("inline-flex px-2 py-0.5 rounded-full text-xs font-medium", statusStyle[a.status])}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 w-32">
                      <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${a.completion}%` }} />
                      </div>
                      <span className="text-xs tabular-nums text-muted-foreground w-8">{a.completion}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold tabular-nums text-foreground">{a.overallScore > 0 ? a.overallScore.toFixed(2) : "—"}</span>
                      {a.overallScore > 0 && (
                        <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-medium", maturityColor(a.overallScore))}>
                          {maturityLevel(a.overallScore)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{a.updatedAt}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end text-muted-foreground">
                      <button 
                        onClick={() => handleView(a.id)}
                        className="p-1.5 rounded hover:bg-muted hover:text-foreground transition" 
                        title="View Report"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button 
                        onClick={() => handleContinue(a.id)}
                        className="p-1.5 rounded hover:bg-muted hover:text-foreground transition" 
                        title={a.status === "Completed" || a.status === "Submitted" ? "Review Flow" : "Continue Assessment"}
                      >
                        <Play className="h-3.5 w-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDuplicate(a.id)}
                        className="p-1.5 rounded hover:bg-muted hover:text-foreground transition" 
                        title="Duplicate"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(a.id)}
                        className="p-1.5 rounded hover:bg-muted hover:text-rose-600 transition" 
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1.5 rounded hover:bg-muted hover:text-foreground transition">
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleExport(a.id, "pdf")}>
                            <FileDown className="h-4 w-4 mr-2" /> Export to PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleExport(a.id, "excel")}>
                            <FileDown className="h-4 w-4 mr-2" /> Export to Excel
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
              {!paginatedRows.length && (
                <tr><td colSpan={8} className="py-16 text-center text-sm text-muted-foreground">No assessments match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-border px-4 py-3 text-xs text-muted-foreground">
          <div>Showing {Math.min(sortedRows.length, (currentPage - 1) * itemsPerPage + 1)}-{Math.min(sortedRows.length, currentPage * itemsPerPage)} of {sortedRows.length} matches ({assessments.length} total)</div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((c) => Math.max(1, c - 1))}
            >
              Previous
            </Button>
            <span className="px-2 text-foreground font-medium">Page {currentPage} of {totalPages}</span>
            <Button 
              variant="outline" 
              size="sm" 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((c) => Math.min(totalPages, c + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
