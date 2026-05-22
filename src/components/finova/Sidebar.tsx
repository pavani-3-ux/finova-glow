import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, BarChart3, Settings, User, LogOut, Sparkles, Menu, X } from "lucide-react";
import { useState } from "react";
import { auth } from "@/lib/finova/store";

const items = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    auth.logout();
    navigate({ to: "/login" });
  };

  return (
    <>
      <button
        className="md:hidden fixed top-4 left-4 z-50 glass-strong p-2 rounded-xl"
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 glass-strong border-r border-border z-40 transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } flex flex-col p-5`}
      >
        <div className="flex items-center gap-2 mb-10 px-2">
          <div className="size-10 rounded-xl bg-gradient-primary grid place-items-center shadow-glow">
            <Sparkles className="size-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gradient">Finova</h1>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Wealth OS</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {items.map(({ to, label, icon: Icon }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative overflow-hidden ${
                  active
                    ? "bg-gradient-primary text-primary-foreground shadow-glow"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
        >
          <LogOut className="size-4" />
          Logout
        </button>
      </aside>
    </>
  );
}