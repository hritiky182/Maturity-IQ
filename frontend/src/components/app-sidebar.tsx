import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardCheck,
  Building2,
  TrendingDown,
  Sparkles,
  Map,
  FileBarChart,
  Building,
  Settings,
  BarChart3,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const items = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/assessments", label: "Assessments", icon: ClipboardCheck },
  { to: "/departments", label: "Departments", icon: Building2 },
  { to: "/gap-analysis", label: "Gap Analysis", icon: TrendingDown },
  { to: "/recommendations", label: "Recommendations", icon: Sparkles },
  { to: "/roadmap", label: "Roadmap", icon: Map },
  { to: "/reports", label: "Reports", icon: FileBarChart },
  { to: "/organization", label: "Organization", icon: Building },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    toast.success("Successfully logged out");
    navigate("/login");
  };

  return (
    <aside className="hidden lg:flex fixed inset-y-0 left-0 z-30 w-64 flex-col border-r border-border bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 items-center gap-3 border-b border-border px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <BarChart3 className="h-5 w-5" />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold tracking-tight">Maturity IQ</div>
          <div className="text-[11px] text-muted-foreground">Real Estate Edition</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Workspace
        </div>
        <ul className="space-y-1">
          {items.map((it) => {
            const active = it.exact ? pathname === it.to : pathname.startsWith(it.to);
            return (
              <li key={it.to}>
                <Link
                  to={it.to}
                  className={cn(
                    "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                >
                  <it.icon className="h-4 w-4" />
                  <span>{it.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-border p-4 space-y-3">
        <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent/50 p-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
            SM
          </div>
          <div className="min-w-0 leading-tight">
            <div className="truncate text-sm font-semibold">Sarah Malik</div>
            <div className="truncate text-xs text-muted-foreground">Chief Strategy Officer</div>
          </div>
        </div>
        
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
