"use client";

import React from "react";
import MetricsStrip from "@/components/dashboard/MetricsStrip";
import { UnifiedRecord } from "@/app/dashboard/admin/page";

interface AnalysisTabProps {
  records: UnifiedRecord[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onOpenEditModal: (record: UnifiedRecord) => void;
  onDeleteRecord: (id: string, name: string) => void;
}

export default function AnalysisTab({
  records,
  searchTerm,
  onSearchChange,
  onOpenEditModal,
  onDeleteRecord,
}: AnalysisTabProps) {
  const filtered = records.filter(
    (r) =>
      r.col1.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.col2.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.col3.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.reference_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Visual Analytics Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex justify-between text-xs font-bold text-slate-500 uppercase">
            <span>OPD Consultation Pacing</span>
            <span className="text-teal-600">98.4% Target</span>
          </div>
          <div className="text-2xl font-black text-slate-900">12 Mins / Px</div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div className="bg-teal-500 h-full w-[85%]"></div>
          </div>
          <p className="text-[10px] text-slate-400">Peak flow managed without triage choke points.</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex justify-between text-xs font-bold text-slate-500 uppercase">
            <span>Bed Occupancy Ratio</span>
            <span className="text-blue-600">Optimal</span>
          </div>
          <div className="text-2xl font-black text-slate-900">93% Capacity</div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div className="bg-blue-600 h-full w-[93%]"></div>
          </div>
          <p className="text-[10px] text-slate-400">186 of 200 total active IPD beds occupied.</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex justify-between text-xs font-bold text-slate-500 uppercase">
            <span>Pharmacy Fill Velocity</span>
            <span className="text-emerald-600">Real-Time</span>
          </div>
          <div className="text-2xl font-black text-slate-900">100% Filled</div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div className="bg-emerald-500 h-full w-full"></div>
          </div>
          <p className="text-[10px] text-slate-400">Zero unfulfilled active e-prescriptions.</p>
        </div>
      </div>

      {/* KPI Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 sm:p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight uppercase">
              Hospital KPI Performance Feed
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Operational Benchmarks • Showing {filtered.length} Metric Stream(s)
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-xs">🔍</span>
            <input
              type="text"
              placeholder="Search KPIs..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
            />
          </div>
        </div>

        <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-xs">
          <table className="w-full text-left text-xs text-slate-700 min-w-[750px]">
            <thead className="bg-[#f8fafc] text-[10px] font-black uppercase text-slate-600 border-b border-slate-200 tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Metric ID</th>
                <th className="px-4 py-3.5">KPI Indicator</th>
                <th className="px-4 py-3.5">Volume Value</th>
                <th className="px-4 py-3.5">Throughput Benchmark</th>
                <th className="px-4 py-3.5">Observed Pacing</th>
                <th className="px-4 py-3.5">Compliance Level</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3.5 font-bold text-teal-700 whitespace-nowrap">{item.reference_id}</td>
                  <td className="px-4 py-3.5 font-extrabold text-slate-900">{item.col1}</td>
                  <td className="px-4 py-3.5 font-medium text-slate-600">{item.col2}</td>
                  <td className="px-4 py-3.5 font-medium text-slate-700">{item.col3}</td>
                  <td className="px-4 py-3.5 font-medium text-slate-600">{item.col4}</td>
                  <td className="px-4 py-3.5 font-bold text-slate-800">{item.col5}</td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                    <button
                      onClick={() => onOpenEditModal(item)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded cursor-pointer"
                      title="Edit Metric"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => onDeleteRecord(item.id, item.col1)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded cursor-pointer"
                      title="Delete Metric"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}