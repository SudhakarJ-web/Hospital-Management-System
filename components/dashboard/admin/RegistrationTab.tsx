"use client";

import React from "react";
import MetricsStrip from "@/components/dashboard/MetricsStrip";
import { SharedPatient } from "@/lib/sync/patientsSync";

interface RegistrationTabProps {
  patients: SharedPatient[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onDeletePatient: (id: string, name: string) => void;
}

export default function RegistrationTab({
  patients,
  searchTerm,
  onSearchChange,
  onDeletePatient,
}: RegistrationTabProps) {
  const filtered = patients.filter(
    (p) =>
      p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.reference_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalCount = filtered.length;
  const activeCount = filtered.filter((p) => p.status === "Active").length;
  const pendingCount = filtered.filter((p) => p.status === "Pending").length;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight uppercase">
            Universal Patient Registration Ledger
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Cross-Portal Synced Triage • Showing {filtered.length} Citizen(s)
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-xs">🔍</span>
          <input
            type="text"
            placeholder="Search registered patients..."
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
        totalLabel="Total Registrations"
        activeLabel="Triage Cleared"
        pendingLabel="Pending Consultation"
      />

      <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-xs">
        <table className="w-full text-left text-xs text-slate-700 min-w-[750px]">
          <thead className="bg-[#f8fafc] text-[10px] font-black uppercase text-slate-600 border-b border-slate-200 tracking-wider">
            <tr>
              <th className="px-4 py-3.5">Ref ID</th>
              <th className="px-4 py-3.5">Patient Legal Name</th>
              <th className="px-4 py-3.5">Phone Number</th>
              <th className="px-4 py-3.5">Department</th>
              <th className="px-4 py-3.5">Assigned Consultant</th>
              <th className="px-4 py-3.5">Triage Particulars</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-4 py-3.5 text-right">Controls</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-10 text-center text-slate-400 font-medium">
                  No patient records found.
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3.5 font-bold text-teal-700 whitespace-nowrap">{item.reference_id}</td>
                  <td className="px-4 py-3.5 font-extrabold text-slate-900">{item.full_name}</td>
                  <td className="px-4 py-3.5 font-medium text-slate-600">{item.phone}</td>
                  <td className="px-4 py-3.5 font-medium text-slate-700">{item.department}</td>
                  <td className="px-4 py-3.5 font-medium text-slate-600">{item.assigned_doctor}</td>
                  <td className="px-4 py-3.5 font-bold text-slate-800">{item.notes || "Standard Triage"}</td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        item.status === "Active"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : "bg-amber-100 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                    <button
                      onClick={() => onDeletePatient(item.id, item.full_name)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded cursor-pointer"
                      title="Delete Patient Record"
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