"use client";

import React from "react";
import Link from "next/link";
import { Zap, LogOut } from "lucide-react";

interface DashboardHeaderProps {
  roleIcon?: string;
  loggedAsText: string;
  roleSubtitle: string;
  bannerText?: string;
  onClose?: () => void;
}

export default function DashboardHeader({
  roleIcon = "🩺",
  loggedAsText,
  roleSubtitle,
  bannerText = "Healthcare Administration & Clinical Operations Network",
  onClose,
}: DashboardHeaderProps) {
  return (
    <header className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-3 text-white">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Brand & Subtitle */}
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 shrink-0">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xs sm:text-sm font-black tracking-wider uppercase text-white truncate">
              Gavane Hospital & Research Centre
            </h1>
            <p className="text-[10px] sm:text-[11px] text-teal-400 font-semibold truncate">
              • {roleSubtitle}
            </p>
          </div>
        </div>

        {/* User Session & Logout Action */}
        <div className="flex items-center space-x-3 shrink-0 self-end sm:self-auto">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-slate-200">
              <span className="text-teal-400 mr-1">{roleIcon}</span>
              Logged as: <strong className="text-white">{loggedAsText}</strong>
            </div>
            <div className="text-[10px] text-slate-400 font-medium">
              DPDP Act 2023 Encrypted Session
            </div>
          </div>

          {onClose ? (
            <button
              onClick={onClose}
              type="button"
              className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500 border border-rose-500/50 hover:border-rose-400 text-rose-300 hover:text-white rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Close / Exit</span>
            </button>
          ) : (
            <Link
              href="/"
              className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500 border border-rose-500/50 hover:border-rose-400 text-rose-300 hover:text-white rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Close / Exit</span>
            </Link>
          )}
        </div>
      </div>

      {bannerText && (
        <div className="mt-2 text-[10px] tracking-wider uppercase font-bold text-center text-teal-300/80 bg-slate-950/60 py-1 rounded-md border border-slate-800/80">
          {bannerText}
        </div>
      )}
    </header>
  );
}