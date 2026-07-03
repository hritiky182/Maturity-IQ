import { useState, type ReactNode } from "react";
import { Bell, Search, Sun, Moon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Props {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function PageShell({ title, description, actions, children }: Props) {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    toast.success(`Switched to ${nextTheme} theme`);
    
    // Dispatch custom event to let other components know the theme changed (e.g. sidebar)
    window.dispatchEvent(new Event("theme-changed"));
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="flex h-16 items-center gap-4 px-6 lg:px-10">
          <div className="relative hidden md:block w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search assessments, departments, recommendations…"
              className="pl-9 h-9 bg-muted/50 border-transparent focus-visible:bg-background"
            />
          </div>
          
          <div className="ml-auto flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition cursor-pointer"
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </button>

            <button className="relative rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-rose-500" />
            </button>
            
            <div className="h-6 w-px bg-border" />
            
            <div className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Emaar Holdings</span> · FY 2026
            </div>
          </div>
        </div>
      </header>

      <div className="px-6 lg:px-10 py-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
            {description && (
              <p className="mt-1.5 text-sm text-muted-foreground max-w-2xl">{description}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>

        {children}
      </div>
    </div>
  );
}
