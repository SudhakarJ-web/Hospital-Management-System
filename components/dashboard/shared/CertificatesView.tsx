"use client";

import React from "react";
import MetricsStrip from "@/components/dashboard/MetricsStrip";
import { SharedCertificate } from "@/lib/sync/certificatesSync";

interface CertificatesViewProps {
  certificates: SharedCertificate[];
  searchTerm: string;
  onSearchChange: (val: string) => void;
  onDeleteCertificate: (id: string, name: string) => void | Promise<void>;
}

export default function CertificatesView({
  certificates,
  searchTerm,
  onSearchChange,
  onDeleteCertificate,
}: CertificatesViewProps) {
  const filtered = (certificates || []).filter(
    (c) =>
      c.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.certificate_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.authorizing_doctor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.reference_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalCount = filtered.length;
  const activeCount = filtered.filter((c) => c.status === "Active" || c.status === "Completed").length;
  const pendingCount = filtered.filter((c) => c.status === "Pending").length;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight uppercase">
            Medical Records & Issued Certificates
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Authorized Medical Documentation • Showing {filtered.length} Record(s)
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-xs">🔍</span>
          <input
            type="text"
            placeholder="Search patient or certificate..."
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
        totalLabel="Total Certificates Issued"
        activeLabel="Authenticated / Completed"
        pendingLabel="Pending Authorization"
      />

      <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-xs">
        <table className="w-full text-left text-xs text-slate-700 min-w-[800px]">
          <thead className="bg-[#f8fafc] text-[10px] font-black uppercase text-slate-600 border-b border-slate-200 tracking-wider">
            <tr>
              <th className="px-4 py-3.5">Ref ID</th>
              <th className="px-4 py-3.5">Certificate Type</th>
              <th className="px-4 py-3.5">Patient Legal Name</th>
              <th className="px-4 py-3.5">Purpose / Diagnosis</th>
              <th className="px-4 py-3.5">Date Issued</th>
              <th className="px-4 py-3.5">Authorizing Doctor</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-4 py-3.5 text-right">Controls</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-10 text-center text-slate-400 font-medium">
                  No certificate records found matching the query.
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3.5 font-bold text-teal-700 whitespace-nowrap">{item.reference_id}</td>
                  <td className="px-4 py-3.5 font-extrabold text-slate-900">{item.certificate_title}</td>
                  <td className="px-4 py-3.5 font-bold text-slate-800">{item.patient_name}</td>
                  <td className="px-4 py-3.5 font-medium text-slate-600">{item.purpose}</td>
                  <td className="px-4 py-3.5 whitespace-nowrap text-slate-600">{item.issued_date}</td>
                  <td className="px-4 py-3.5 font-bold text-teal-900">{item.authorizing_doctor}</td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        item.status === "Active" || item.status === "Completed"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : "bg-amber-100 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right whitespace-nowrap">
                    <button
                      onClick={() => onDeleteCertificate(item.id, item.patient_name)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded cursor-pointer"
                      title="Delete Certificate"
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