"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

interface DashboardHeaderProps {
  roleIcon: string;
  loggedAsText: string;
  roleSubtitle?: string;
  bannerText: string;
}

export default function DashboardHeader({
  roleIcon,
  loggedAsText,
  roleSubtitle = "Medical Staff Portal",
  bannerText,
}: DashboardHeaderProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // Offline fallback
    }
    router.push("/");
  };

  return (
    <>
      <header className="bg-[#0b1b2b] text-white px-4 py-2.5 flex items-center justify-between shadow-md border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="bg-teal-500 text-slate-950 p-1.5 rounded-lg flex items-center justify-center font-bold">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-extrabold tracking-wider uppercase">
              Integrated Hospital Management System
            </h1>
            <p className="text-[10px] text-teal-400 font-medium">
              Gavane Hospital & Research Centre • {roleSubtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="bg-[#12283e] border border-teal-500/40 px-3 py-1 rounded-md text-xs flex items-center space-x-2">
            <span className="text-teal-400 font-bold">{roleIcon}</span>
            <span className="text-slate-300">
              Logged as: <strong className="text-white">{loggedAsText}</strong>
            </span>
          </div>

          <button
            onClick={handleSignOut}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-sm"
          >
            <span>🚪</span>
            <span>Close / Exit</span>
          </button>
        </div>
      </header>

      <div className="bg-[#18314a] text-teal-300 py-1 px-4 text-center text-xs font-bold uppercase tracking-widest border-b border-[#0f2234]">
        {bannerText}
      </div>
    </>
  );
}