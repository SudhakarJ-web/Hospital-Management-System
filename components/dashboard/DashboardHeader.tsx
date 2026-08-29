"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface DashboardHeaderProps {
  roleIcon?: string;
  loggedAsText: string;
  roleSubtitle?: string;
  bannerText?: string;
}

export default function DashboardHeader({
  roleIcon = "🏥",
  loggedAsText,
  roleSubtitle = "Clinical & Administrative Node",
  bannerText = "Gavane Hospital Management System",
}: DashboardHeaderProps) {
  const router = useRouter();

  const handleExit = () => {
    router.push("/");
  };

  return (
    <header className="bg-[#0b1b2b] text-white border-b border-slate-800 sticky top-0 z-40 shadow-md">
      {/* Top Main Navigation Row */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2.5">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center space-x-2.5 w-full sm:w-auto justify-between sm:justify-start">
          <Link href="/" className="flex items-center space-x-2.5 group min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 font-bold shrink-0 shadow-inner">
              ⚡
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-extrabold text-xs sm:text-sm tracking-tight text-white uppercase leading-tight truncate">
                GAVANE HOSPITAL AND RESEARCH CENTRE
              </span>
              <span className="text-[9px] sm:text-[10px] text-teal-400 font-medium tracking-wide truncate">
                • {roleSubtitle}
              </span>
            </div>
          </Link>

          {/* Mobile-Only Close/Exit Button */}
          <button
            onClick={handleExit}
            type="button"
            className="sm:hidden px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] rounded-lg transition-colors shrink-0 shadow-xs flex items-center space-x-1"
          >
            <span>🚪</span>
            <span>Exit</span>
          </button>
        </div>

        {/* User Identity Badge & Desktop Exit Button */}
        <div className="flex items-center justify-between sm:justify-end space-x-2 w-full sm:w-auto">
          <div className="flex items-center space-x-1.5 bg-[#07131e] border border-teal-500/30 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[10px] sm:text-xs text-slate-300 font-medium max-w-[280px] sm:max-w-none truncate">
            <span className="text-teal-400 shrink-0">{roleIcon}</span>
            <span className="truncate">
              Logged as: <strong className="text-white">{loggedAsText}</strong>
            </span>
          </div>

          <button
            onClick={handleExit}
            type="button"
            className="hidden sm:inline-flex items-center space-x-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg transition-colors shadow-xs shrink-0 cursor-pointer"
          >
            <span>🚪</span>
            <span>Close / Exit</span>
          </button>
        </div>

      </div>

      {/* Sub-Header Operational Banner */}
      {bannerText && (
        <div className="bg-[#050e17] border-t border-slate-800/80 py-1 px-3 text-center">
          <p className="text-[9px] sm:text-[11px] font-bold text-teal-400 tracking-wider uppercase truncate">
            {bannerText}
          </p>
        </div>
      )}
    </header>
  );
}