"use client";

import React from "react";
import MetricsStrip from "@/components/dashboard/MetricsStrip";
import { UnifiedRecord } from "@/lib/sync/hospitalMasterSync";

interface VisitorPassDeskProps {
  records: UnifiedRecord[];
  searchTerm: string;
  onSearchChange: (val: string) => void;
  onOpenEdit: (item: UnifiedRecord) => void;
  onDelete: (id: string, name: string) => void;
}

export default function VisitorPassDesk({
  records,
  searchTerm,
  onSearchChange,
  onOpenEdit,
  onDelete,
}: VisitorPassDeskProps) {
  const filtered = (records || []).filter(
    (r) =>
      r.col1?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.col2?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.col3?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.reference_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalCount = filtered.length;
  const activeCount = filtered.filter((r) => r.status === "Active").length;
  const expiredCount = filtered.filter((r) => r.status !== "Active").length;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight uppercase">
            Visitor & Attendant Pass Desk
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            ICU & Ward Attendant Passes • Showing {filtered.length} Active Pass(es)
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-xs">🔍</span>
          <input
            type="text"
            placeholder="Search passes..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
          />
        </div>
      </div>

      <MetricsStrip
        totalCount={totalCount}
        activeCount={activeCount}
        pendingCount={expiredCount}
        totalLabel="Total Issued Passes"
        activeLabel="Active Inside Campus"
        pendingLabel="Expired / Surrendered"
      />

      <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-xs">
        <table className="w-full text-left text-xs text-slate-700 min-w-[750px]">
          <thead className="bg-[#f8fafc] text-[10px] font-black uppercase text-slate-600 border-b border-slate-200 tracking-wider">
            <tr>
              <th className="px-4 py-3.5">Pass ID</th>
              <th className="px-4 py-3.5">Attendant / Visitor Name</th>
              <th className="px-4 py-3.5">Patient & Bed Ref</th>
              <th className="px-4 py-3.5">Permitted Ward</th>
              <th className="px-4 py-3.5">Valid Window</th>
              <th className="px-4 py-3.5">Security Gate Notes</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-4 py-3.5 text-right">Controls</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-10 text-center text-slate-400 font-medium">
                  No visitor passes issued for this cycle.
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3.5 font-bold text-teal-700 whitespace-nowrap">{item.reference_id}</td>
                  <td className="px-4 py-3.5 font-extrabold text-slate-900">{item.col1}</td>
                  <td className="px-4 py-3.5 font-medium text-slate-600">{item.col2}</td>
                  <td className="px-4 py-3.5 font-medium text-slate-700">{item.col3}</td>
                  <td className="px-4 py-3.5 font-medium text-slate-600">{item.col4}</td>
                  <td className="px-4 py-3.5 font-bold text-slate-800">{item.col5}</td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        item.status === "Active"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : "bg-slate-100 text-slate-700 border border-slate-300"
                      }`}
                    >
                      {item.status === "Active" ? "Permitted" : "Expired"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                    <button
                      onClick={() => onOpenEdit(item)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded cursor-pointer"
                      title="Edit Pass"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => onDelete(item.id, item.col1)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded cursor-pointer"
                      title="Revoke Pass"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}