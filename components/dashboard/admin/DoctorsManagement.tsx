"use client";

import React from "react";
import MetricsStrip from "@/components/dashboard/MetricsStrip";
import { SharedDoctor } from "@/lib/sync/doctorsSync";

interface DoctorsManagementProps {
  records: SharedDoctor[];
  searchTerm: string;
  onSearchChange: (val: string) => void;
  onOpenEdit: (item: SharedDoctor) => void;
  onDelete: (id: string, name: string) => void;
}

export default function DoctorsManagement({
  records,
  searchTerm,
  onSearchChange,
  onOpenEdit,
  onDelete,
}: DoctorsManagementProps) {
  const filtered = (records || []).filter(
    (r) =>
      r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.degree?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.reference_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalCount = filtered.length;
  const activeCount = filtered.filter((r) => r.status === "Active").length;
  const pendingCount = filtered.filter((r) => r.status !== "Active").length;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight uppercase">
            Specialist Doctors & Consultants
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Clinical Credentials, Live Web Showcase & Fee Console • Showing {filtered.length} Doctor(s)
          </p>
        </div>
        <div className="relative w-full md:w-72">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-xs">🔍</span>
          <input
            type="text"
            placeholder="Search doctors..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
          />
        </div>
      </div>

      <MetricsStrip
        totalCount={totalCount}
        activeCount={activeCount}
        pendingCount={pendingCount}
        totalLabel="Total Consultants"
        activeLabel="Active Practice"
        pendingLabel="Pending Verification"
      />

      <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-xs">
        <table className="w-full text-left text-xs text-slate-700 min-w-[800px]">
          <thead className="bg-[#f8fafc] text-[10px] font-black uppercase text-slate-600 border-b border-slate-200 tracking-wider">
            <tr>
              <th className="px-4 py-3.5">Ref ID</th>
              <th className="px-4 py-3.5">Doctor Profile</th>
              <th className="px-4 py-3.5">Degree / Qualification</th>
              <th className="px-4 py-3.5">Specialty Department</th>
              <th className="px-4 py-3.5">Official Email</th>
              <th className="px-4 py-3.5">OPD Fee</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-4 py-3.5 text-right">Controls</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-10 text-center text-slate-400 font-medium">
                  No doctors found matching the query.
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3.5 font-bold text-teal-700 whitespace-nowrap">{item.reference_id}</td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full overflow-hidden border border-teal-500/40 bg-slate-100 shrink-0">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-teal-700 text-xs">
                            {item.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <span className="font-extrabold text-slate-900">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 font-medium text-slate-600">{item.degree}</td>
                  <td className="px-4 py-3.5 font-medium text-slate-700">
                    <span className="bg-teal-50 text-teal-800 text-[11px] font-bold px-2 py-0.5 rounded border border-teal-200">
                      {item.department}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-medium text-slate-600">{item.email}</td>
                  <td className="px-4 py-3.5 font-bold text-slate-900">{item.fee}</td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        item.status === "Active" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                    <button
                      onClick={() => onOpenEdit(item)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded cursor-pointer"
                      title="Edit Doctor Profile"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => onDelete(item.id, item.name)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded cursor-pointer"
                      title="Delete Doctor"
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