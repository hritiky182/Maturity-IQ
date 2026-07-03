import { useState } from "react";
import { PageShell } from "@/components/page-shell";
import { useStore } from "@/lib/store";
import { priorityColor } from "@/lib/scoring";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Kanban, ListChecks, CalendarClock, Plus, ChevronRight, ChevronLeft, ArrowRightLeft, Trash2 } from "lucide-react";
import { toast } from "sonner";

const STATUS_COLS = ["Not Started", "In Progress", "On Hold", "Completed"] as const;

export default function RoadmapPage() {
  const roadmap = useStore((state) => state.roadmap);
  const updateRoadmapItem = useStore((state) => state.updateRoadmapItem);
  const addRoadmapItem = useStore((state) => state.addRoadmapItem);
  const deleteRoadmapItem = useStore((state) => state.deleteRoadmapItem);

  const [view, setView] = useState<"kanban" | "timeline" | "quarterly">("kanban");
  const [showAddModal, setShowAddModal] = useState(false);

  // New initiative form state
  const [initiative, setInitiative] = useState("");
  const [priority, setPriority] = useState<"Critical" | "High" | "Medium" | "Low">("Medium");
  const [owner, setOwner] = useState("");
  const [timeline, setTimeline] = useState("3-6 months");
  const [quarter, setQuarter] = useState<"Q1" | "Q2" | "Q3" | "Q4">("Q1");
  const [status, setStatus] = useState<"Not Started" | "In Progress" | "On Hold" | "Completed">("Not Started");
  const [progress, setProgress] = useState(0);
  const [department, setDepartment] = useState("Operations");

  const handleAddInitiative = (e: React.FormEvent) => {
    e.preventDefault();
    if (!initiative.trim()) {
      toast.error("Initiative name is required");
      return;
    }
    if (!owner.trim()) {
      toast.error("Owner name is required");
      return;
    }

    addRoadmapItem({
      initiative,
      priority,
      owner,
      timeline,
      quarter,
      status,
      progress: status === "Completed" ? 100 : progress,
      department,
    });

    toast.success("Strategic initiative added to roadmap");
    setShowAddModal(false);
    
    // Clear form
    setInitiative("");
    setOwner("");
    setProgress(0);
  };

  const handleStatusChange = (id: string, newStatus: any) => {
    updateRoadmapItem(id, {
      status: newStatus,
      progress: newStatus === "Completed" ? 100 : newStatus === "Not Started" ? 0 : 35,
    });
    toast.success(`Initiative status updated to ${newStatus}`);
  };

  const handleProgressChange = (id: string, newProg: number) => {
    const clampProg = Math.max(0, Math.min(100, newProg));
    updateRoadmapItem(id, {
      progress: clampProg,
      status: clampProg === 100 ? "Completed" : clampProg === 0 ? "Not Started" : "In Progress",
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Remove this initiative from the roadmap?")) {
      deleteRoadmapItem(id);
      toast.success("Initiative removed");
    }
  };

  return (
    <PageShell
      title="Improvement Roadmap"
      description="Strategic initiatives and rollout calendar derived from your assessment recommendations."
      actions={
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-lg border border-border p-1 bg-card">
            {[
              { k: "kanban", label: "Kanban", i: Kanban },
              { k: "timeline", label: "Timeline", i: ListChecks },
              { k: "quarterly", label: "Quarterly", i: CalendarClock },
            ].map((v) => (
              <button key={v.k} onClick={() => setView(v.k as any)}
                className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer",
                  view === v.k ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
                <v.i className="h-3.5 w-3.5" /> {v.label}
              </button>
            ))}
          </div>
          <Button onClick={() => setShowAddModal(true)}><Plus className="h-4 w-4 mr-1" /> Add initiative</Button>
        </div>
      }
    >
      {/* Kanban View */}
      {view === "kanban" && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {STATUS_COLS.map((col) => {
            const items = roadmap.filter((r) => r.status === col);
            return (
              <div key={col} className="rounded-2xl bg-muted/40 p-3 flex flex-col min-h-[500px]">
                <div className="flex items-center justify-between px-2 py-2 mb-3">
                  <div className="text-sm font-semibold text-foreground">{col}</div>
                  <span className="text-xs bg-card border border-border rounded-full px-2 py-0.5 font-semibold text-foreground">{items.length}</span>
                </div>
                <div className="space-y-2 flex-1 overflow-y-auto">
                  {items.map((r) => (
                    <div key={r.id} className="rounded-xl bg-card border border-border p-4 shadow-sm hover:shadow transition space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-sm font-semibold leading-snug text-foreground">{r.initiative}</div>
                        <span className={cn("shrink-0 text-[10px] px-1.5 py-0.5 rounded-full border font-medium", priorityColor(r.priority))}>
                          {r.priority}
                        </span>
                      </div>
                      
                      <div className="text-[11px] text-muted-foreground">{r.department} · {r.timeline} · {r.quarter}</div>
                      
                      <div className="h-1 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${r.progress}%` }} />
                      </div>
                      
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-1.5">
                          <div className="h-5 w-5 rounded-full bg-primary/15 text-primary text-[9px] font-bold flex items-center justify-center">
                            {r.owner.split(" ").map((n) => n[0]).join("")}
                          </div>
                          <span className="text-[10px] text-muted-foreground truncate max-w-[80px]">{r.owner.split(" ")[0]}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {/* Column quick move dropdown-like select */}
                          <select 
                            value={r.status} 
                            onChange={(e) => handleStatusChange(r.id, e.target.value)}
                            className="text-[10px] border border-border rounded bg-background p-1 text-muted-foreground focus:text-foreground"
                          >
                            <option value="Not Started">Not Started</option>
                            <option value="In Progress">In Progress</option>
                            <option value="On Hold">On Hold</option>
                            <option value="Completed">Completed</option>
                          </select>
                          <button onClick={() => handleDelete(r.id)} className="text-muted-foreground hover:text-rose-600 p-0.5">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {!items.length && (
                    <div className="h-32 border border-dashed border-border/60 rounded-xl flex items-center justify-center text-xs text-muted-foreground italic">No items</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Timeline List Table View */}
      {view === "timeline" && (
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground bg-muted/40 border-b border-border">
                <th className="px-6 py-3 font-medium">Initiative</th>
                <th className="px-6 py-3 font-medium">Owner</th>
                <th className="px-6 py-3 font-medium">Department</th>
                <th className="px-6 py-3 font-medium">Timeline</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Progress</th>
                <th className="px-6 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {roadmap.map((r) => (
                <tr key={r.id} className="hover:bg-muted/30 transition">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-foreground">{r.initiative}</div>
                    <div className={cn("mt-1 inline-flex text-[9px] px-1.5 py-0.5 rounded border font-medium", priorityColor(r.priority))}>{r.priority}</div>
                  </td>
                  <td className="px-6 py-4 text-foreground font-medium">{r.owner}</td>
                  <td className="px-6 py-4 text-foreground">{r.department}</td>
                  <td className="px-6 py-4 text-muted-foreground">{r.timeline} · {r.quarter}</td>
                  <td className="px-6 py-4">
                    <select 
                      value={r.status} 
                      onChange={(e) => handleStatusChange(r.id, e.target.value)}
                      className="text-xs border border-border rounded bg-background p-1.5 text-foreground"
                    >
                      <option value="Not Started">Not Started</option>
                      <option value="In Progress">In Progress</option>
                      <option value="On Hold">On Hold</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => handleProgressChange(r.id, r.progress - 10)}
                        className="h-6 w-6 rounded border border-border flex items-center justify-center hover:bg-muted font-bold text-xs"
                      >
                        -
                      </button>
                      <div className="flex items-center gap-2 w-32">
                        <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${r.progress}%` }} />
                        </div>
                        <span className="text-xs font-semibold tabular-nums text-foreground w-8">{r.progress}%</span>
                      </div>
                      <button 
                        onClick={() => handleProgressChange(r.id, r.progress + 10)}
                        className="h-6 w-6 rounded border border-border flex items-center justify-center hover:bg-muted font-bold text-xs"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleDelete(r.id)} className="text-muted-foreground hover:text-rose-600 p-1">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Quarterly view */}
      {view === "quarterly" && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {(["Q1", "Q2", "Q3", "Q4"] as const).map((q) => {
            const items = roadmap.filter((r) => r.quarter === q);
            return (
              <div key={q} className="rounded-2xl border border-border bg-card shadow-sm p-5 flex flex-col min-h-[400px]">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div className="text-base font-semibold text-foreground">{q} 2026</div>
                  <span className="text-xs bg-muted text-muted-foreground rounded-full px-2 py-0.5 font-semibold">{items.length} items</span>
                </div>
                <div className="mt-4 space-y-3 flex-1 overflow-y-auto">
                  {items.map((r) => (
                    <div key={r.id} className="rounded-xl border border-border p-4 hover:shadow-sm transition bg-card space-y-2.5">
                      <div className="text-sm font-semibold leading-snug text-foreground">{r.initiative}</div>
                      <div className="text-xs text-muted-foreground">{r.owner} · {r.department}</div>
                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className={cn("px-1.5 py-0.5 rounded border font-medium text-[9px]", priorityColor(r.priority))}>{r.priority}</span>
                        <div className="flex items-center gap-1.5 font-semibold text-foreground">
                          <span className="tabular-nums">{r.progress}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {!items.length && (
                    <div className="h-24 border border-dashed border-border/60 rounded-xl flex items-center justify-center text-xs text-muted-foreground italic">No initiatives</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Initiative Modal (Overlay) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-lg font-semibold text-foreground">Add Roadmap Initiative</h3>
              <button onClick={() => setShowAddModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddInitiative} className="space-y-4">
              <div>
                <Label className="text-xs font-semibold text-muted-foreground">Initiative Name</Label>
                <Input 
                  value={initiative} 
                  onChange={(e) => setInitiative(e.target.value)} 
                  placeholder="e.g. Implement BIM data pipelines"
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground">Owner</Label>
                  <Input 
                    value={owner} 
                    onChange={(e) => setOwner(e.target.value)} 
                    placeholder="e.g. Ahmed Al Nuaimi"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground">Department</Label>
                  <Select value={department} onValueChange={setDepartment}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Strategy">Strategy</SelectItem>
                      <SelectItem value="Operations">Operations</SelectItem>
                      <SelectItem value="Innovation">Innovation</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="IT">IT</SelectItem>
                      <SelectItem value="HR">Human Resources</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground">Priority</Label>
                  <Select value={priority} onValueChange={(val: any) => setPriority(val)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Critical">Critical</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground">Target Quarter</Label>
                  <Select value={quarter} onValueChange={(val: any) => setQuarter(val)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Q1">Q1 2026</SelectItem>
                      <SelectItem value="Q2">Q2 2026</SelectItem>
                      <SelectItem value="Q3">Q3 2026</SelectItem>
                      <SelectItem value="Q4">Q4 2026</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground">Status</Label>
                  <Select value={status} onValueChange={(val: any) => setStatus(val)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Not Started">Not Started</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="On Hold">On Hold</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {status !== "Completed" && status !== "Not Started" && (
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground">Progress Percentage: {progress}%</Label>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={progress} 
                    onChange={(e) => setProgress(parseInt(e.target.value))}
                    className="w-full mt-2 accent-primary"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
                <Button type="submit">Create Initiative</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageShell>
  );
}

// Icon for close button
function X(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
