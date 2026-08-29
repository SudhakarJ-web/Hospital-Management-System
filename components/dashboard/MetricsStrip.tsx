"use client";

import React from "react";

interface MetricsStripProps {
  totalCount: number;
  activeCount: number;
  pendingCount: number;
  totalLabel?: string;
  activeLabel?: string;
  pendingLabel?: string;
}

export default function MetricsStrip({
  totalCount,
  activeCount,
  pendingCount,
  totalLabel = "Total Records",
  activeLabel = "Active Accounts",
  pendingLabel = "Pending Actions",
}: MetricsStripProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-cyan-50/60 border border-cyan-200 rounded-xl p-4">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-900 block">
          {totalLabel}
        </span>
        <span className="text-3xl font-black text-cyan-950 mt-1 block">
          {totalCount}
        </span>
      </div>

      <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-900 block">
          {activeLabel}
        </span>
        <span className="text-3xl font-black text-emerald-950 mt-1 block">
          {activeCount}
        </span>
      </div>

      <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-4">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-900 block">
          {pendingLabel}
        </span>
        <span className="text-3xl font-black text-amber-950 mt-1 block">
          {pendingCount}
        </span>
      </div>
    </div>
  );
}