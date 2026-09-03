"use client";

import React, { useState } from "react";
import { UnifiedRecord } from "@/lib/sync/hospitalMasterSync";

interface LedgerTableProps {
  moduleName: string;
  records: UnifiedRecord[];
  headers: string[];
  searchTerm: string;
  onSearchChange: (val: string) => void;
  onOpenEdit: (record: UnifiedRecord) => void;
  onDelete: (id: string, name: string) => void;
}

export default function LedgerTable({
  moduleName,
  records,
  headers,
  searchTerm,
  onSearchChange,
  onOpenEdit,
  onDelete,
}: LedgerTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const filtered = records.filter((r) => {
    const q = searchTerm.toLowerCase();
    return (
      r.col1?.toLowerCase().includes(q) ||
      r.col2?.toLowerCase().includes(q) ||
      r.col3?.toLowerCase().includes(q) ||
      r.col5?.toLowerCase().includes(q) ||
      r.reference_id?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 sm:p-6 space-y-4 text-slate-800">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-black text-slate-900 tracking-tight">
            {moduleName} Ledger Workspace
          </h3>
          <p className="text-xs text-slate-500">
            Live database ledger node • {filtered.length} total entries
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder={`Search ${moduleName}...`}
            value={searchTerm}
            onChange={(e) => {
              onSearchChange(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none w-full sm:w-64"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 text-[10px] font-extrabold uppercase text-slate-500 border-b border-slate-200">
            <tr>
              {headers.map((h, idx) => (
                <th
                  key={idx}
                  className={`py-2.5 px-3 ${idx === headers.length - 1 ? "text-right" : ""}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={headers.length} className="py-8 text-center text-slate-400 italic">
                  No records active in this ledger.
                </td>
              </tr>
            ) : (
              paginated.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3 font-mono text-slate-500 font-bold">{row.reference_id}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-900">{row.col1}</td>
                  <td className="py-2.5 px-3">{row.col2 || "—"}</td>
                  <td className="py-2.5 px-3">{row.col3 || "—"}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-600">{row.col4 || "—"}</td>
                  <td className="py-2.5 px-3 font-semibold text-teal-800">{row.col5 || "—"}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        row.status === "Active" || row.status === "Confirmed"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : row.status === "Pending"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right space-x-1.5 whitespace-nowrap">
                    <button
                      onClick={() => onOpenEdit(row)}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-bold cursor-pointer transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(row.id, row.col1)}
                      className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded text-[11px] font-bold cursor-pointer transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
          <span className="text-slate-500 font-medium">
            Page {currentPage} of {totalPages}
          </span>
          <div className="space-x-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded text-slate-700 font-bold cursor-pointer"
            >
              Prev
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded text-slate-700 font-bold cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}