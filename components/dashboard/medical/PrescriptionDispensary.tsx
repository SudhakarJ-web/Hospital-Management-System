"use client";

import React from "react";
import MetricsStrip from "@/components/dashboard/MetricsStrip";
import { SharedPrescription } from "@/lib/sync/prescriptionsSync";

interface PrescriptionDispensaryProps {
  prescriptions: SharedPrescription[];
  searchTerm: string;
  onSearchChange: (val: string) => void;
  onDispense: (id: string, patientName: string) => void;
}

export default function PrescriptionDispensary({
  prescriptions,
  searchTerm,
  onSearchChange,
  onDispense,
}: PrescriptionDispensaryProps) {
  const filtered = (prescriptions || []).filter(
    (p) =>
      p.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.rx_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.prescribing_doctor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.medications?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalCount = filtered.length;
  const pendingCount = filtered.filter((p) => p.status === "Pending Dispense").length;
  const dispensedCount = filtered.filter((p) => p.status === "Dispensed").length;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight uppercase">
            Live Doctor E-Prescriptions & Dispensary Queue
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Real-time feed from OPD & IPD Consultations • Showing {filtered.length} Rx Order(s)
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-xs">🔍</span>
          <input
            type="text"
            placeholder="Search patient, doctor, or drug..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
          />
        </div>
      </div>

      <MetricsStrip
        totalCount={totalCount}
        activeCount={dispensedCount}
        pendingCount={pendingCount}
        totalLabel="Total Prescriptions Received"
        activeLabel="Filled / Dispensed"
        pendingLabel="Awaiting Pharmacist Action"
      />

      <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-xs">
        <table className="w-full text-left text-xs text-slate-700 min-w-[850px]">
          <thead className="bg-[#f8fafc] text-[10px] font-black uppercase text-slate-600 border-b border-slate-200 tracking-wider">
            <tr>
              <th className="px-4 py-3.5">Rx Reference</th>
              <th className="px-4 py-3.5">Patient Details</th>
              <th className="px-4 py-3.5">Attending Doctor</th>
              <th className="px-4 py-3.5">Clinical Diagnosis</th>
              <th className="px-4 py-3.5">Prescribed Pharmacotherapy</th>
              <th className="px-4 py-3.5">Prescribed Time</th>
              <th className="px-4 py-3.5">Dispense Status</th>
              <th className="px-4 py-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-10 text-center text-slate-400 font-medium">
                  No active e-prescriptions currently in dispensary queue.
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3.5 font-bold text-teal-700 whitespace-nowrap">{item.rx_id}</td>
                  <td className="px-4 py-3.5">
                    <div className="font-extrabold text-slate-900">{item.patient_name}</div>
                    <div className="text-[10px] text-slate-500">{item.age_gender} • {item.patient_id}</div>
                  </td>
                  <td className="px-4 py-3.5 font-medium text-slate-800">
                    <div>{item.prescribing_doctor}</div>
                    <div className="text-[10px] text-teal-600 font-semibold">{item.department}</div>
                  </td>
                  <td className="px-4 py-3.5 font-medium text-slate-700 max-w-xs">{item.diagnosis}</td>
                  <td className="px-4 py-3.5 font-mono text-[11px] text-slate-800 whitespace-pre-line bg-slate-50/50 p-2 rounded">
                    {item.medications}
                  </td>
                  <td className="px-4 py-3.5 font-medium text-slate-600 whitespace-nowrap">{item.issued_at}</td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        item.status === "Dispensed"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : "bg-amber-100 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {item.status}
                    </span>
                    {item.dispensed_by && (
                      <div className="text-[9px] text-slate-400 mt-0.5">By {item.dispensed_by}</div>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-right whitespace-nowrap">
                    {item.status === "Pending Dispense" ? (
                      <button
                        onClick={() => onDispense(item.id, item.patient_name)}
                        className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-lg text-xs transition-colors shadow-xs cursor-pointer"
                      >
                        ✓ Dispense & Clear
                      </button>
                    ) : (
                      <span className="text-[11px] font-bold text-emerald-600">Dispensed</span>
                    )}
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