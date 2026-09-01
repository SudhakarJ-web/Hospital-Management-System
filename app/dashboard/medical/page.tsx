"use client";

import React, { useState, useEffect, useCallback } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardSidebar, { SidebarModule } from "@/components/dashboard/DashboardSidebar";

// Universal Shared & Dedicated Medical Views
import InventoryView from "@/components/dashboard/shared/InventoryView";
import PrescriptionDispensary from "@/components/dashboard/medical/PrescriptionDispensary";
import DiagnosticReagents from "@/components/dashboard/medical/DiagnosticReagents";
import RadiologyConsumables from "@/components/dashboard/medical/RadiologyConsumables";
import SupplierPurchaseOrders from "@/components/dashboard/medical/SupplierPurchaseOrders";
import ExpiredQuarantine from "@/components/dashboard/medical/ExpiredQuarantine";

import {
  getUniversalStore,
  saveUniversalRecord,
  deleteUniversalRecord,
  UnifiedRecord,
} from "@/lib/sync/hospitalMasterSync";
import {
  getSharedPrescriptions,
  dispensePrescription,
  SharedPrescription,
} from "@/lib/sync/prescriptionsSync";
import { supabase } from "@/lib/supabase";

const MEDICAL_SIDEBAR_MODULES: SidebarModule[] = [
  { id: "PHARMACY_STOCK", label: "PHARMACY STOCK & DRUGS", icon: "💊" },
  { id: "DISPENSARY", label: "PRESCRIPTION DISPENSARY", icon: "📦" },
  { id: "PATHOLOGY_LAB", label: "PATHOLOGY REAGENTS & KITS", icon: "🔬" },
  { id: "RADIOLOGY_SUPPLIES", label: "RADIOLOGY FILMS & CONSUMABLES", icon: "📡" },
  { id: "SUPPLIERS", label: "SUPPLIERS & PO ORDERS", icon: "🚚" },
  { id: "EXPIRED_LEDGER", label: "AUDIT & EXPIRED LOGS", icon: "⚠️" },
];

export default function MedicalDashboardPage() {
  const [activeModule, setActiveModule] = useState<string>("PHARMACY_STOCK");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const [pharmacistName, setPharmacistName] = useState<string>("Priya Nair");
  const [pharmacistEmail, setPharmacistEmail] = useState<string>("medical@gavanehospital.in");

  const [dataStore, setDataStore] = useState<Record<string, UnifiedRecord[]>>({});
  const [prescriptions, setPrescriptions] = useState<SharedPrescription[]>([]);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Dynamic Add / Edit Modal State
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editTargetId, setEditTargetId] = useState<string | null>(null);
  const [formCol1, setFormCol1] = useState("");
  const [formCol2, setFormCol2] = useState("");
  const [formCol3, setFormCol3] = useState("");
  const [formCol4, setFormCol4] = useState("");
  const [formCol5, setFormCol5] = useState("");
  const [formStatus, setFormStatus] = useState<"Active" | "Pending" | "Completed" | "Suspended">("Active");

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

  const loadData = useCallback(async () => {
    setDataStore(getUniversalStore());
    setPrescriptions(await getSharedPrescriptions());
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDispense = async (id: string, patientName: string) => {
    const updated = await dispensePrescription(id, pharmacistName);
    setPrescriptions(updated);
    setFeedback({
      type: "success",
      text: `Prescription for ${patientName} fulfilled and dispensed successfully.`,
    });
  };

  const handleOpenAdd = () => {
    setIsEditing(false);
    setEditTargetId(null);
    setFormCol1("");
    setFormCol2("");
    setFormCol3("");
    setFormCol4("");
    setFormCol5("");
    setFormStatus("Active");
    setShowModal(true);
  };

  const handleOpenEdit = (item: UnifiedRecord) => {
    setIsEditing(true);
    setEditTargetId(item.id);
    setFormCol1(item.col1);
    setFormCol2(item.col2);
    setFormCol3(item.col3);
    setFormCol4(item.col4);
    setFormCol5(item.col5);
    setFormStatus(item.status);
    setShowModal(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    const targetKey = activeModule === "PHARMACY_STOCK" ? "Stock" : activeModule === "PATHOLOGY_LAB" ? "Pathology" : activeModule === "RADIOLOGY_SUPPLIES" ? "Radiology" : activeModule;

    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const newRecord: UnifiedRecord = {
      id: editTargetId || `${targetKey.toLowerCase()}-${Date.now()}`,
      reference_id: isEditing && editTargetId ? (dataStore[targetKey]?.find((r) => r.id === editTargetId)?.reference_id || `MED-2026-${randomSuffix}`) : `MED-2026-${randomSuffix}`,
      category: targetKey,
      col1: formCol1,
      col2: formCol2,
      col3: formCol3,
      col4: formCol4,
      col5: formCol5,
      status: formStatus,
      created_at: new Date().toLocaleDateString("en-IN"),
    };

    const updatedStore = saveUniversalRecord(targetKey, newRecord);
    setDataStore(updatedStore);
    setFeedback({ type: "success", text: `Item saved in ${activeModule}.` });
    setShowModal(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Retire ${name}?`)) return;
    const targetKey = activeModule === "PHARMACY_STOCK" ? "Stock" : activeModule === "PATHOLOGY_LAB" ? "Pathology" : activeModule === "RADIOLOGY_SUPPLIES" ? "Radiology" : activeModule;
    const updated = deleteUniversalRecord(targetKey, id);
    setDataStore(updated);
    setFeedback({ type: "success", text: `Removed ${name} from ledger.` });
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

              {activeModule !== "DISPENSARY" && (
                <button
                  onClick={handleOpenAdd}
                  className="flex-1 sm:flex-none px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <span>+</span>
                  <span>Add Item</span>
                </button>
              )}
            </div>
          </div>

          {feedback && (
            <div className="p-3 rounded-xl border text-xs font-bold bg-emerald-50 border-emerald-300 text-emerald-900 flex justify-between items-center">
              <span>{feedback.text}</span>
              <button onClick={() => setFeedback(null)} className="font-bold px-2 py-0.5">✕</button>
            </div>
          )}

          {/* Module Views */}
          {activeModule === "PHARMACY_STOCK" && (
            <InventoryView
              records={dataStore.Stock || []}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onOpenEdit={handleOpenEdit}
              onDelete={handleDelete}
            />
          )}

          {activeModule === "DISPENSARY" && (
            <PrescriptionDispensary
              prescriptions={prescriptions}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onDispense={handleDispense}
            />
          )}

          {activeModule === "PATHOLOGY_LAB" && (
            <DiagnosticReagents
              records={dataStore.Pathology || []}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onOpenEdit={handleOpenEdit}
              onDelete={handleDelete}
            />
          )}

          {activeModule === "RADIOLOGY_SUPPLIES" && (
            <RadiologyConsumables
              records={dataStore.Radiology || []}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onOpenEdit={handleOpenEdit}
              onDelete={handleDelete}
            />
          )}

          {activeModule === "SUPPLIERS" && (
            <SupplierPurchaseOrders
              records={dataStore.SUPPLIERS || []}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onOpenEdit={handleOpenEdit}
              onDelete={handleDelete}
            />
          )}

          {activeModule === "EXPIRED_LEDGER" && (
            <ExpiredQuarantine
              records={dataStore.EXPIRED_LEDGER || []}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onOpenEdit={handleOpenEdit}
              onDelete={handleDelete}
            />
          )}
        </main>
      </div>

      <footer className="bg-[#0b1b2b] text-slate-400 px-4 py-2 text-[10px] flex flex-col sm:flex-row items-center justify-between border-t border-slate-800 gap-1 text-center sm:text-left">
        <div>Current Session :- <strong className="text-teal-400">{pharmacistName} ({pharmacistEmail}) • Pharmacy Depot</strong></div>
        <div>Powered by <strong className="text-slate-200">Shourya Technologies</strong> • Status: <span className="text-emerald-400 font-bold">Connected</span></div>
      </footer>

      {/* Unified Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full p-5 sm:p-6 space-y-4 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-extrabold text-slate-900">
                {isEditing ? `Edit ${activeModule} Item` : `Add Item to ${activeModule}`}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Item / Reagent Name *</label>
                <input
                  type="text"
                  required
                  value={formCol1}
                  onChange={(e) => setFormCol1(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">SKU / Code *</label>
                  <input
                    type="text"
                    required
                    value={formCol2}
                    onChange={(e) => setFormCol2(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Dosage Form / Section *</label>
                  <input
                    type="text"
                    required
                    value={formCol3}
                    onChange={(e) => setFormCol3(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Stock Balance & Price *</label>
                  <input
                    type="text"
                    required
                    value={formCol4}
                    onChange={(e) => setFormCol4(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Batch / Expiry / Notes *</label>
                  <input
                    type="text"
                    required
                    value={formCol5}
                    onChange={(e) => setFormCol5(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Stock Flag *</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as "Active" | "Pending" | "Completed" | "Suspended")}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
                >
                  <option value="Active">In Stock / Available</option>
                  <option value="Pending">Low Stock / Reorder</option>
                  <option value="Completed">Cleared / Filled</option>
                  <option value="Suspended">Quarantined / Expired</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-slate-100 text-xs font-bold rounded-lg cursor-pointer">
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer"
                >
                  {isEditing ? "Save Changes" : `Commit Entry`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}