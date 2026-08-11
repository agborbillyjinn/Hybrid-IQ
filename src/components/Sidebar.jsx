import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Crosshair, Building2, Radar, GitBranch, BookMarked, Settings, Sparkles } from "lucide-react";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/analyse", label: "Analyse Account", icon: Crosshair },
  { to: "/accounts", label: "Accounts", icon: Building2 },
  { to: "/prospects", label: "Prospect Finder", icon: Radar },
  { to: "/pipeline", label: "Pipeline Intelligence", icon: GitBranch },
  { to: "/saved", label: "Saved Research", icon: BookMarked },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="w-60 shrink-0 bg-slate-900 text-slate-300 flex flex-col h-screen sticky top-0">
      <div className="px-5 py-5 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-white font-semibold tracking-tight leading-none">HybridIQ</div>
            <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">ERP Intelligence & GTM Copilot</div>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
      <div className="px-5 py-4 border-t border-slate-800">
        <p className="text-[10px] text-slate-500 leading-relaxed">Know who to target.<br />Know why now. Quantify the opportunity.</p>
      </div>
    </aside>
  );
}