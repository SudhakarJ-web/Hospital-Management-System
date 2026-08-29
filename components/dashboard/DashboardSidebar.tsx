"use client";

import React from "react";

export interface SidebarModule {
  id: string;
  label: string;
  icon: string;
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
  sectionTitle = "MODULES",
}: DashboardSidebarProps) {
  return (
    <aside className="w-64 bg-[#081624] border-r border-slate-800 flex flex-col justify-between shrink-0 min-h-[calc(100vh-70px)] select-none">
      
      {/* Top Module List */}
      <div className="p-3.5 space-y-1 overflow-y-auto">
        <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2 px-2.5">
          {sectionTitle}
        </div>

        <nav className="space-y-1">
          {modules.map((m) => {
            const isSelected = activeModule === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => onSelectModule(m.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-teal-600 text-white shadow-md shadow-teal-950/50"
                    : "text-slate-300 hover:bg-slate-800/70 hover:text-white"
                }`}
              >
                <div className="flex items-center space-x-2.5 truncate">
                  <span className="text-sm shrink-0">{m.icon}</span>
                  <span className="truncate">{m.label}</span>
                </div>
                {m.adminBadge && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-black tracking-wider shrink-0">
                    ADMIN
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Node Attribution Card */}
      <div className="p-3.5 border-t border-slate-800/80 bg-[#06111d] text-[10px] text-slate-400 space-y-0.5">
        <div className="font-extrabold uppercase text-slate-200 tracking-wider">
          Shourya Technologies
        </div>
        <div className="text-slate-400">Hadapsar, Pune, Maharashtra.</div>
        <div className="text-slate-500">Contact: +91 9860043213</div>
        <div className="text-teal-400/90 font-mono truncate text-[9px]">
          shouryacomputers17@gmail.com
        </div>
      </div>

    </aside>
  );
}