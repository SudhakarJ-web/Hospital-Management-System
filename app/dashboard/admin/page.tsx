"use client";

import React, { useState, useEffect, useCallback } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardSidebar, { SidebarModule } from "@/components/dashboard/DashboardSidebar";

// Admin-Exclusive Modules
import MasterOverview from "@/components/dashboard/admin/MasterOverview";
import DoctorsManagement from "@/components/dashboard/admin/DoctorsManagement";
import SupportStaffManagement from "@/components/dashboard/admin/SupportStaffManagement";
import MedicalOfficersManagement from "@/components/dashboard/admin/MedicalOfficersManagement";
import AnalyticsConsole from "@/components/dashboard/admin/AnalyticsConsole";
import BiomedicalUtility from "@/components/dashboard/admin/BiomedicalUtility";
import ComplianceBackup from "@/components/dashboard/admin/ComplianceBackup";

// Shared Universal Modules
import RegistrationView from "@/components/dashboard/shared/RegistrationView";
import CertificatesView from "@/components/dashboard/shared/CertificatesView";
import ClinicalQueueView from "@/components/dashboard/shared/ClinicalQueueView";
import InventoryView from "@/components/dashboard/shared/InventoryView";
import BillingView from "@/components/dashboard/shared/BillingView";
import DiagnosticsView from "@/components/dashboard/shared/DiagnosticsView";
import SurgeryOtView from "@/components/dashboard/shared/SurgeryOtView";

import {
  getUniversalStore,
  saveUniversalRecord,
  deleteUniversalRecord,
  UnifiedRecord,
} from "@/lib/sync/hospitalMasterSync";
import { getSharedPatients, saveSharedPatient, deleteSharedPatient, SharedPatient } from "@/lib/sync/patientsSync";
import {
  getSharedCertificates,
  saveSharedCertificate,
  deleteSharedCertificate,
  SharedCertificate,
} from "@/lib/sync/certificatesSync";

const ADMIN_MODULES: SidebarModule[] = [
  { id: "MASTER", label: "MASTER", icon: "🏢", adminBadge: false },
  { id: "Doctors", label: "DOCTORS", icon: "🩺", adminBadge: true },
  { id: "Support", label: "SUPPORT", icon: "👥", adminBadge: true },
  { id: "Medical", label: "MEDICAL", icon: "💊", adminBadge: true },
  { id: "Registration", label: "REGISTRATION", icon: "👤", adminBadge: false },
  { id: "OPD", label: "OPD", icon: "🏥", adminBadge: false },
  { id: "IPD", label: "IPD", icon: "🛏️", adminBadge: false },
  { id: "OT", label: "OT", icon: "✂️", adminBadge: false },
  { id: "Radiology", label: "RADIOLOGY", icon: "📡", adminBadge: false },
  { id: "Pathology", label: "PATHOLOGY", icon: "🔬", adminBadge: false },
  { id: "Stock", label: "STOCK", icon: "📦", adminBadge: false },
  { id: "Billing", label: "BILLING", icon: "💳", adminBadge: false },
  { id: "Analysis", label: "ANALYSIS SYSTEM", icon: "📊", adminBadge: false },
  { id: "Utility", label: "UTILITY", icon: "⚙️", adminBadge: false },
  { id: "Certificates", label: "CERTIFICATES", icon: "📄", adminBadge: false },
  { id: "Backup", label: "BACKUP", icon: "💾", adminBadge: false },
];

export default function AdminDashboardPage() {
  const [activeModule, setActiveModule] = useState<string>("MASTER");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const [dataStore, setDataStore] = useState<Record<string, UnifiedRecord[]>>({});
  const [patients, setPatients] = useState<SharedPatient[]>([]);
  const [certificates, setCertificates] = useState<SharedCertificate[]>([]);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [showModal, setShowModal] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editTargetId, setEditTargetId] = useState<string | null>(null);
  const [formCol1, setFormCol1] = useState("");
  const [formCol2, setFormCol2] = useState("");
  const [formCol3, setFormCol3] = useState("");
  const [formCol4, setFormCol4] = useState("");
  const [formCol5, setFormCol5] = useState("");
  const [formStatus, setFormStatus] = useState<"Active" | "Pending" | "Completed" | "Suspended">("Active");

  const loadData = useCallback(async () => {
    setDataStore(getUniversalStore());
    setPatients(await getSharedPatients());
    setCertificates(await getSharedCertificates());
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

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

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();

    if (activeModule === "Registration") {
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      const newPt: SharedPatient = {
        id: `pat-${Date.now()}`,
        reference_id: `GH-2026-REG${randomSuffix}`,
        full_name: formCol1,
        phone: formCol2 || "+91 98000 00000",
        department: formCol3 || "General OPD",
        assigned_doctor: formCol4 || "Dr. Priya",
        notes: formCol5 || "Registered by Admin",
        status: formStatus === "Pending" ? "Pending" : "Active",
        created_at: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      };
      const updated = await saveSharedPatient(newPt);
      setPatients(updated);
      setFeedback({ type: "success", text: `Patient ${formCol1} saved.` });
      setShowModal(false);
      return;
    }

    if (activeModule === "Certificates") {
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      const certObj: SharedCertificate = {
        id: editTargetId || `cert-${Date.now()}`,
        reference_id: `GH-2026-${randomSuffix}`,
        certificate_title: formCol1,
        patient_name: formCol2,
        purpose: formCol3,
        issued_date: formCol4 || "28/08/2026",
        authorizing_doctor: formCol5 || "Dr. Sudhir Gavane",
        status: formStatus,
        created_at: new Date().toLocaleDateString("en-IN"),
      };
      const updatedCerts = await saveSharedCertificate(certObj);
      setCertificates(updatedCerts);
      setFeedback({ type: "success", text: `Certificate for ${formCol2} saved.` });
      setShowModal(false);
      return;
    }

    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const newRecord: UnifiedRecord = {
      id: editTargetId || `${activeModule.toLowerCase()}-${Date.now()}`,
      reference_id: isEditing && editTargetId ? (dataStore[activeModule]?.find((r) => r.id === editTargetId)?.reference_id || `GH-2026-${randomSuffix}`) : `GH-2026-${randomSuffix}`,
      category: activeModule,
      col1: formCol1,
      col2: formCol2,
      col3: formCol3,
      col4: formCol4,
      col5: formCol5,
      status: formStatus,
      created_at: new Date().toLocaleDateString("en-IN"),
    };

    const updatedStore = saveUniversalRecord(activeModule, newRecord);
    setDataStore(updatedStore);
    setFeedback({ type: "success", text: `Saved record in ${activeModule}.` });
    setShowModal(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Delete ${name}?`)) return;
    const updated = deleteUniversalRecord(activeModule, id);
    setDataStore(updated);
    setFeedback({ type: "success", text: `Removed ${name} from ${activeModule}.` });
  };

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex flex-col font-sans text-slate-800">
      <DashboardHeader
        roleIcon="✓"
        loggedAsText="Admin (admin@gavanehospital.in)"
        roleSubtitle="Central Administrative Desk"
        bannerText="Welcome to Gavane Hospital Management System"
      />

      {/* Mobile Switch Bar */}
      <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-2 text-xs font-bold text-white truncate">
          <span className="text-teal-400">🏢 Module:</span>
          <span className="uppercase text-teal-300 truncate">{activeModule} DESK</span>
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
            modules={ADMIN_MODULES}
            activeModule={activeModule}
            onSelectModule={(id) => {
              setActiveModule(id);
              setSearchTerm("");
            }}
            sectionTitle="Master Modules"
          />
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex flex-col bg-slate-950/80 backdrop-blur-sm">
            <div className="w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-left duration-200">
              <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
                <span className="font-bold text-xs uppercase tracking-wider text-teal-400">Hospital Modules</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 font-bold hover:text-white"
                >
                  ✕
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-1">
                {ADMIN_MODULES.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setActiveModule(m.id);
                      setSearchTerm("");
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      activeModule === m.id ? "bg-teal-600 text-white shadow-sm" : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <span>{m.icon}</span>
                      <span className="truncate">{m.label}</span>
                    </div>
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
              <span className="truncate">Active Workspace: <strong className="text-teal-700 uppercase">{activeModule} Management Desk</strong></span>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto justify-end shrink-0">
              <button
                onClick={loadData}
                className="flex-1 sm:flex-none px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold rounded-lg transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <span>🔄</span>
                <span>Sync Live</span>
              </button>

              <button
                onClick={handleOpenAdd}
                className="flex-1 sm:flex-none px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <span>+</span>
                <span>Add {activeModule} Entry</span>
              </button>
            </div>
          </div>

          {feedback && (
            <div className="p-3 rounded-xl border text-xs font-bold bg-emerald-50 border-emerald-300 text-emerald-900 flex justify-between items-center">
              <span>{feedback.text}</span>
              <button onClick={() => setFeedback(null)} className="font-bold px-2 py-0.5">✕</button>
            </div>
          )}

          {/* Clean Dedicated Router */}
          {activeModule === "MASTER" && (
            <MasterOverview
              records={dataStore.MASTER || []}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onOpenEdit={handleOpenEdit}
              onDelete={handleDelete}
              activeDoctorsCount={dataStore.Doctors?.length || 2}
              totalRegisteredPatients={patients.length}
              activeOtCount={dataStore.OT?.length || 1}
            />
          )}

          {activeModule === "Doctors" && (
            <DoctorsManagement
              records={dataStore.Doctors || []}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onOpenEdit={handleOpenEdit}
              onDelete={handleDelete}
            />
          )}

          {activeModule === "Support" && (
            <SupportStaffManagement
              records={dataStore.Support || []}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onOpenEdit={handleOpenEdit}
              onDelete={handleDelete}
            />
          )}

          {activeModule === "Medical" && (
            <MedicalOfficersManagement
              records={dataStore.Medical || []}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onOpenEdit={handleOpenEdit}
              onDelete={handleDelete}
            />
          )}

          {activeModule === "Registration" && (
            <RegistrationView
              patients={patients}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onDeletePatient={async (id, name) => {
                if (!confirm(`Delete ${name}?`)) return;
                const updated = await deleteSharedPatient(id);
                setPatients(updated);
                setFeedback({ type: "success", text: `Deleted patient ${name}.` });
              }}
            />
          )}

          {(activeModule === "OPD" || activeModule === "IPD") && (
            <ClinicalQueueView
              type={activeModule as "OPD" | "IPD"}
              records={dataStore[activeModule] || []}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onOpenEdit={handleOpenEdit}
              onDelete={handleDelete}
            />
          )}

          {activeModule === "OT" && (
            <SurgeryOtView
              records={dataStore.OT || []}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onOpenEdit={handleOpenEdit}
              onDelete={handleDelete}
            />
          )}

          {(activeModule === "Radiology" || activeModule === "Pathology") && (
            <DiagnosticsView
              type={activeModule as "Radiology" | "Pathology"}
              records={dataStore[activeModule] || []}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onOpenEdit={handleOpenEdit}
              onDelete={handleDelete}
            />
          )}

          {activeModule === "Stock" && (
            <InventoryView
              records={dataStore.Stock || []}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onOpenEdit={handleOpenEdit}
              onDelete={handleDelete}
            />
          )}

          {activeModule === "Billing" && (
            <BillingView
              records={dataStore.Billing || []}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onOpenEdit={handleOpenEdit}
              onDelete={handleDelete}
            />
          )}

          {activeModule === "Analysis" && (
            <AnalyticsConsole
              records={dataStore.Analysis || []}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onOpenEdit={handleOpenEdit}
              onDelete={handleDelete}
            />
          )}

          {activeModule === "Utility" && (
            <BiomedicalUtility
              records={dataStore.Utility || []}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onOpenEdit={handleOpenEdit}
              onDelete={handleDelete}
            />
          )}

          {activeModule === "Backup" && (
            <ComplianceBackup
              records={dataStore.Backup || []}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onOpenEdit={handleOpenEdit}
              onDelete={handleDelete}
            />
          )}

          {activeModule === "Certificates" && (
            <CertificatesView
              certificates={certificates}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onDeleteCertificate={async (id, name) => {
                if (!confirm(`Delete certificate for ${name}?`)) return;
                const updated = await deleteSharedCertificate(id);
                setCertificates(updated);
                setFeedback({ type: "success", text: `Deleted certificate for ${name}.` });
              }}
            />
          )}
        </main>
      </div>

      <footer className="bg-[#0b1b2b] text-slate-400 px-4 py-2 text-[10px] flex flex-col sm:flex-row items-center justify-between border-t border-slate-800 gap-1 text-center sm:text-left">
        <div>Current User :- <strong className="text-teal-400">Admin Console • Pune Central Node</strong></div>
        <div>Powered by <strong className="text-slate-200">Shourya Technologies</strong> • Status: <span className="text-emerald-400 font-bold">Connected</span></div>
      </footer>

      {/* Dynamic Creation / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full p-5 sm:p-6 space-y-4 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-extrabold text-slate-900">
                {isEditing ? `Edit ${activeModule} Entry` : `New ${activeModule} Entry`}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Primary Name / Title *</label>
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
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Field 2 *</label>
                  <input
                    type="text"
                    required
                    value={formCol2}
                    onChange={(e) => setFormCol2(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Field 3 *</label>
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
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Field 4 *</label>
                  <input
                    type="text"
                    required
                    value={formCol4}
                    onChange={(e) => setFormCol4(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Field 5 *</label>
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
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Status *</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as "Active" | "Pending" | "Completed" | "Suspended")}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
                >
                  <option value="Active">Active / Cleared</option>
                  <option value="Pending">Pending Review</option>
                  <option value="Completed">Completed</option>
                  <option value="Suspended">Suspended</option>
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