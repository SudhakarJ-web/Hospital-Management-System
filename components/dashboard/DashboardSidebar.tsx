"use client";

import React from "react";

export interface SidebarModule {
  id: string;
  label: string;
  icon?: string;
  adminBadge?: boolean;
}

interface DashboardSidebarProps {
  modules: SidebarModule[];
  activeModule: string;
  onSelectModule: (id: string) => void;
  sectionTitle?: string;
}

export default function DashboardSidebar({
  modules,
  activeModule,
  onSelectModule,
  sectionTitle = "Navigation Modules",
}: DashboardSidebarProps) {
  return (
    <aside className="w-60 sm:w-64 bg-[#0c1f33] text-slate-300 flex flex-col justify-between shrink-0 select-none overflow-y-auto border-r border-[#081523]">
      <nav className="p-2 space-y-1">
        <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-800 mb-1">
          {sectionTitle}
        </div>
        {modules.map((mod) => {
          const isActive = activeModule === mod.id;
          return (
            <button
              key={mod.id}
              onClick={() => onSelectModule(mod.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs font-bold tracking-wide uppercase transition-all ${
                isActive
                  ? "bg-teal-600 text-white shadow-md"
                  : "hover:bg-[#152e4a] text-slate-300"
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <span className="text-sm">{mod.icon || "⚙️"}</span>
                <span>{mod.label}</span>
              </div>
              {mod.adminBadge && (
                <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded font-semibold uppercase">
                  Admin
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-3 bg-[#081524] text-[10px] text-slate-400 border-t border-slate-800 space-y-0.5">
        <div className="font-bold text-slate-200 uppercase tracking-wider">Shourya Technologies</div>
        <div>Hadapsar, Pune, Maharashtra.</div>
        <div>Contact No.: 9860043213</div>
        <div>Email: shouryacomputers17@gmail.com</div>
      </div>
    </aside>
  );
}