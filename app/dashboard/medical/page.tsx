"use client";

import React, { useState, useEffect, useCallback } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardSidebar, { SidebarModule } from "@/components/dashboard/DashboardSidebar";
import LedgerTable from "@/components/dashboard/shared/LedgerTable";

import {
  getUniversalStore,
  deleteUniversalRecord,
  UnifiedRecord,
} from "@/lib/sync/hospitalMasterSync";
import { supabase } from "@/lib/supabase";

const MEDICAL_SIDEBAR_MODULES: SidebarModule[] = [
  { id: "Stock", label: "PHARMACY STOCK & DRUGS", icon: "💊" },
  { id: "DISPENSARY", label: "PRESCRIPTION DISPENSARY", icon: "📦" },
  { id: "Pathology", label: "PATHOLOGY REAGENTS & KITS", icon: "🔬" },
  { id: "Radiology", label: "RADIOLOGY FILMS & CONSUMABLES", icon: "📡" },
  { id: "SUPPLIERS", label: "SUPPLIERS & PO ORDERS", icon: "🚚" },
  { id: "EXPIRED_LEDGER", label: "AUDIT & EXPIRED LOGS", icon: "⚠️" },
];

export default function MedicalDashboardPage() {
  const [activeModule, setActiveModule] = useState<string>("Stock");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const [pharmacistName, setPharmacistName] = useState<string>("Priya Nair");
  const [pharmacistEmail, setPharmacistEmail] = useState<string>("medical@gavanehospital.in");

  const [dataStore, setDataStore] = useState<Record<string, UnifiedRecord[]>>({});
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function resolveSession() {
      try {
        const { data } = await supabase.auth.getUser();
        if (data?.user) {
          const metaName = data.user.user_metadata?.full_name || data.user.user_metadata?.name;
          if (metaName) setPharmacistName(metaName);
          if (data.user.email) setPharmacistEmail(data.user.email);
        }
      } catch {}
    }
    resolveSession();
  }, []);

  const loadData = useCallback(() => {
    setDataStore(getUniversalStore());
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Retire ${name}?`)) return;
    const updated = deleteUniversalRecord(activeModule, id);
    setDataStore(updated);
    setFeedback({ type: "success", text: `Removed ${name} from ${activeModule}.` });
  };

  const getHeaders = (mod: string) => {
    switch (mod) {
      case "Stock":
        return ["SKU / Item ID", "Medication & Strength", "SKU / Package Type", "Dosage Form", "Stock Units & MRP", "Batch & Expiry", "Status", "Actions"];
      case "DISPENSARY":
        return ["Rx ID", "Patient Name", "Rx Reference", "Prescribed Meds", "Total Quantity", "Prescribing Doctor", "Status", "Actions"];
      case "Pathology":
        return ["Reagent ID", "Assay / Kit Name", "SKU Identifier", "Analyzer Instrument", "Volume / Tests", "Lot & Expiry", "Status", "Actions"];
      case "Radiology":
        return ["Item ID", "Film / Contrast Material", "SKU Reference", "Modality Device", "Inventory Count", "Lot & Expiry", "Status", "Actions"];
      case "SUPPLIERS":
        return ["PO Number", "Distributor Agency", "PO Reference ID", "Consignment Particulars", "Invoice Total", "Tracking Status", "Status", "Actions"];
      case "EXPIRED_LEDGER":
        return ["Audit Ref", "Quarantined Item", "SKU Code", "Batch Code Number", "Condemned Quantity", "Disposal Protocol", "Status", "Actions"];
      default:
        return ["Item ID", "Name", "Code", "Section", "Quantity / Price", "Expiry / Details", "Status", "Actions"];
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex flex-col font-sans text-slate-800">
      <DashboardHeader
        roleIcon="💊"
        loggedAsText={`${pharmacistName} (${pharmacistEmail})`}
        roleSubtitle="Central Pharmacy & Medical Depot Console"
        bannerText="Central Pharmacy, Reagent Consumables & Stock Dispensation Ledger"
      />

      {/* Mobile Switch Bar */}
      <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-2 text-xs font-bold text-white truncate">
          <span className="text-teal-400">💊 Inventory:</span>
          <span className="uppercase text-teal-300 truncate">
            {MEDICAL_SIDEBAR_MODULES.find((m) => m.id === activeModule)?.label || activeModule}
          </span>
        </div>
        <button
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center space-x-1"
        >
          <span>{mobileMenuOpen ? "✕ Close" : "☰ Switch Module"}</span>
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        <div className="hidden lg:block">
          <DashboardSidebar
            modules={MEDICAL_SIDEBAR_MODULES}
            activeModule={activeModule}
            onSelectModule={(id) => {
              setActiveModule(id);
              setSearchTerm("");
            }}
            sectionTitle="Medical & Drug Modules"
          />
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex flex-col bg-slate-950/80 backdrop-blur-sm">
            <div className="w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-left duration-200">
              <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
                <span className="font-bold text-xs uppercase tracking-wider text-teal-400">Pharmacy Menu</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 font-bold hover:text-white"
                >
                  ✕
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-1">
                {MEDICAL_SIDEBAR_MODULES.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setActiveModule(m.id);
                      setSearchTerm("");
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      activeModule === m.id ? "bg-teal-600 text-white shadow-sm" : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <span>{m.icon}</span>
                    <span className="truncate">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
          </div>
        )}

        <main className="flex-1 p-3 sm:p-5 overflow-y-auto space-y-4 sm:space-y-5 min-w-0">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 px-1 py-0.5 min-w-0">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-teal-500 shrink-0"></span>
              <span className="truncate">Active Medical Ledger: <strong className="text-teal-700 uppercase">{activeModule}</strong></span>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto justify-end shrink-0">
              <button
                onClick={loadData}
                className="flex-1 sm:flex-none px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold rounded-lg transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <span>🔄</span>
                <span>Sync Stock</span>
              </button>
            </div>
          </div>

          {feedback && (
            <div className="p-3 rounded-xl border text-xs font-bold bg-emerald-50 border-emerald-300 text-emerald-900 flex justify-between items-center">
              <span>{feedback.text}</span>
              <button onClick={() => setFeedback(null)} className="font-bold px-2 py-0.5">✕</button>
            </div>
          )}

          <LedgerTable
            moduleName={activeModule}
            records={dataStore[activeModule] || []}
            headers={getHeaders(activeModule)}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onOpenEdit={() => {}}
            onDelete={handleDelete}
          />
        </main>
      </div>

      <footer className="bg-[#0b1b2b] text-slate-400 px-4 py-2 text-[10px] flex flex-col sm:flex-row items-center justify-between border-t border-slate-800 gap-1 text-center sm:text-left">
        <div>Current Session :- <strong className="text-teal-400">{pharmacistName} ({pharmacistEmail}) • Pharmacy Node</strong></div>
        <div>Powered by <strong className="text-slate-200">Shourya Technologies</strong> • Status: <span className="text-emerald-400 font-bold">Connected</span></div>
      </footer>
    </div>
  );
}