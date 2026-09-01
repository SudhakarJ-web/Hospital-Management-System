"use client";

import React, { useState, useEffect, useCallback } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardSidebar, { SidebarModule } from "@/components/dashboard/DashboardSidebar";

// Universal Shared Views
import RegistrationView from "@/components/dashboard/shared/RegistrationView";
import CertificatesView from "@/components/dashboard/shared/CertificatesView";
import ClinicalQueueView from "@/components/dashboard/shared/ClinicalQueueView";
import BillingView from "@/components/dashboard/shared/BillingView";

// Support-Dedicated Views
import DischargeClearance from "@/components/dashboard/support/DischargeClearance";
import VisitorPassDesk from "@/components/dashboard/support/VisitorPassDesk";
import SupportUtility from "@/components/dashboard/support/SupportUtility";

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
import { supabase } from "@/lib/supabase";

const SUPPORT_SIDEBAR_MODULES: SidebarModule[] = [
  { id: "REGISTRATION", label: "PATIENT REGISTRATION", icon: "👤" },
  { id: "OPD_QUEUE", label: "OPD APPOINTMENTS & QUEUE", icon: "🩺" },
  { id: "BILLING", label: "FRONT DESK BILLING & UPI", icon: "💳" },
  { id: "IPD_ADMISSION", label: "IPD ADMISSIONS & BEDS", icon: "🛏️" },
  { id: "DISCHARGE", label: "DISCHARGE CLEARANCE DESK", icon: "🚪" },
  { id: "VISITOR_PASS", label: "VISITOR & ATTENDANT PASS", icon: "🏷️" },
  { id: "CERTIFICATES", label: "MEDICAL CERTIFICATES", icon: "📄" },
  { id: "UTILITY", label: "UTILITY & FLEET", icon: "⚙️" },
];

export const HOSPITAL_DEPARTMENTS = [
  "Cardiology Dept",
  "General Medicine",
  "General Surgery",
  "Orthopedics Ward",
  "Pediatrics & Neonatal",
  "Neurology & Stroke",
  "Radiology & Imaging",
  "Pathology Laboratory",
  "Trauma & Emergency",
];

export const HOSPITAL_DOCTORS = [
  "Dr. Priya",
  "Dr. Ananya Rao",
  "Dr. Sudhir Gavane",
  "Dr. Elena Rostova",
  "Dr. Rajesh Kumar",
];

export default function SupportDashboardPage() {
  const [activeModule, setActiveModule] = useState<string>("REGISTRATION");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const [operatorName, setOperatorName] = useState<string>("Rajesh Patil");
  const [operatorEmail, setOperatorEmail] = useState<string>("support@gavanehospital.in");

  const [dataStore, setDataStore] = useState<Record<string, UnifiedRecord[]>>({});
  const [patients, setPatients] = useState<SharedPatient[]>([]);
  const [certificates, setCertificates] = useState<SharedCertificate[]>([]);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Dynamic Add / Edit Modal State
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editTargetId, setEditTargetId] = useState<string | null>(null);
  const [formCol1, setFormCol1] = useState("");
  const [formCol2, setFormCol2] = useState("");
  const [formCol3, setFormCol3] = useState(HOSPITAL_DEPARTMENTS[0]);
  const [formCol4, setFormCol4] = useState(HOSPITAL_DOCTORS[0]);
  const [formCol5, setFormCol5] = useState("");
  const [formStatus, setFormStatus] = useState<"Active" | "Pending" | "Completed" | "Suspended">("Active");

  useEffect(() => {
    async function resolveSession() {
      try {
        const { data } = await supabase.auth.getUser();
        if (data?.user) {
          const metaName = data.user.user_metadata?.full_name || data.user.user_metadata?.name;
          if (metaName) setOperatorName(metaName);
          if (data.user.email) setOperatorEmail(data.user.email);
        }
      } catch {}
    }
    resolveSession();
  }, []);

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
    setFormCol3(HOSPITAL_DEPARTMENTS[0]);
    setFormCol4(HOSPITAL_DOCTORS[0]);
    setFormCol5(activeModule === "REGISTRATION" ? "BP: 120/80 • Standard Triage" : "");
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

  const handleOpenEditPatient = (p: SharedPatient) => {
    setIsEditing(true);
    setEditTargetId(p.id);
    setFormCol1(p.full_name);
    setFormCol2(p.phone);
    setFormCol3(p.department);
    setFormCol4(p.assigned_doctor);
    setFormCol5(p.notes);
    setFormStatus(p.status);
    setShowModal(true);
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();

    if (activeModule === "REGISTRATION") {
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      const newPt: SharedPatient = {
        id: editTargetId || `pat-${Date.now()}`,
        reference_id: isEditing && editTargetId ? (patients.find((p) => p.id === editTargetId)?.reference_id || `GH-2026-REG${randomSuffix}`) : `GH-2026-REG${randomSuffix}`,
        full_name: formCol1,
        phone: formCol2 || "+91 98000 00000",
        department: formCol3,
        assigned_doctor: formCol4,
        notes: formCol5 || `Registered via Front Desk (${operatorName})`,
        status: formStatus === "Pending" ? "Pending" : "Active",
        created_at: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      };
      const updated = await saveSharedPatient(newPt);
      setPatients(updated);
      setFeedback({ type: "success", text: `Patient ${formCol1} saved and synced.` });
      setShowModal(false);
      return;
    }

    if (activeModule === "CERTIFICATES") {
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      const certObj: SharedCertificate = {
        id: editTargetId || `cert-${Date.now()}`,
        reference_id: isEditing && editTargetId ? (certificates.find((c) => c.id === editTargetId)?.reference_id || `GH-2026-SUP${randomSuffix}`) : `GH-2026-SUP${randomSuffix}`,
        certificate_title: formCol1,
        patient_name: formCol2,
        purpose: formCol3,
        issued_date: formCol4 || "28/08/2026",
        authorizing_doctor: formCol5 || "Dr. Priya",
        status: formStatus,
        created_at: new Date().toLocaleDateString("en-IN"),
      };
      const updatedCerts = await saveSharedCertificate(certObj);
      setCertificates(updatedCerts);
      setFeedback({ type: "success", text: `Certificate for ${formCol2} saved.` });
      setShowModal(false);
      return;
    }

    const targetKey = activeModule === "UTILITY" ? "Utility" : activeModule === "OPD_QUEUE" ? "OPD" : activeModule === "IPD_ADMISSION" ? "IPD" : activeModule === "BILLING" ? "Billing" : activeModule;
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const newRecord: UnifiedRecord = {
      id: editTargetId || `${targetKey.toLowerCase()}-${Date.now()}`,
      reference_id: isEditing && editTargetId ? (dataStore[targetKey]?.find((r) => r.id === editTargetId)?.reference_id || `GH-2026-${randomSuffix}`) : `GH-2026-${randomSuffix}`,
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
    setFeedback({ type: "success", text: `Saved entry in ${activeModule}.` });
    setShowModal(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Delete record for ${name}?`)) return;
    const targetKey = activeModule === "UTILITY" ? "Utility" : activeModule === "OPD_QUEUE" ? "OPD" : activeModule === "IPD_ADMISSION" ? "IPD" : activeModule === "BILLING" ? "Billing" : activeModule;
    const updated = deleteUniversalRecord(targetKey, id);
    setDataStore(updated);
    setFeedback({ type: "success", text: `Removed ${name}.` });
  };

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex flex-col font-sans text-slate-800">
      <DashboardHeader
        roleIcon="👥"
        loggedAsText={`${operatorName} (${operatorEmail})`}
        roleSubtitle="Front Desk Reception & Support Operations"
        bannerText="Front Desk Reception, Patient Registration & Clearance Gateway"
      />

      {/* Mobile Switch Bar */}
      <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-2 text-xs font-bold text-white truncate">
          <span className="text-teal-400">👥 Desk:</span>
          <span className="uppercase text-teal-300 truncate">
            {SUPPORT_SIDEBAR_MODULES.find((m) => m.id === activeModule)?.label || activeModule}
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
            modules={SUPPORT_SIDEBAR_MODULES}
            activeModule={activeModule}
            onSelectModule={(id) => {
              setActiveModule(id);
              setSearchTerm("");
            }}
            sectionTitle="Support Modules"
          />
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex flex-col bg-slate-950/80 backdrop-blur-sm">
            <div className="w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-left duration-200">
              <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
                <span className="font-bold text-xs uppercase tracking-wider text-teal-400">Front Desk Menu</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 font-bold hover:text-white"
                >
                  ✕
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-1">
                {SUPPORT_SIDEBAR_MODULES.map((m) => (
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
              <span className="truncate">Active Workspace: <strong className="text-teal-700 uppercase">{activeModule}</strong></span>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto justify-end shrink-0">
              <button
                onClick={loadData}
                className="flex-1 sm:flex-none px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold rounded-lg transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <span>🔄</span>
                <span>Sync Live Data</span>
              </button>

              <button
                onClick={handleOpenAdd}
                className="flex-1 sm:flex-none px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <span>+</span>
                <span>Add {activeModule === "REGISTRATION" ? "Patient" : "Entry"}</span>
              </button>
            </div>
          </div>

          {feedback && (
            <div className="p-3 rounded-xl border text-xs font-bold bg-emerald-50 border-emerald-300 text-emerald-900 flex justify-between items-center">
              <span>{feedback.text}</span>
              <button onClick={() => setFeedback(null)} className="font-bold px-2 py-0.5">✕</button>
            </div>
          )}

          {/* Module Views */}
          {activeModule === "REGISTRATION" && (
            <RegistrationView
              patients={patients}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onOpenEditPatient={handleOpenEditPatient}
              onDeletePatient={async (id, name) => {
                if (!confirm(`Delete patient ${name}?`)) return;
                const updated = await deleteSharedPatient(id);
                setPatients(updated);
                setFeedback({ type: "success", text: `Deleted patient ${name}.` });
              }}
            />
          )}

          {activeModule === "OPD_QUEUE" && (
            <ClinicalQueueView
              type="OPD"
              records={dataStore.OPD || []}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onOpenEdit={handleOpenEdit}
              onDelete={handleDelete}
            />
          )}

          {activeModule === "BILLING" && (
            <BillingView
              records={dataStore.Billing || []}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onOpenEdit={handleOpenEdit}
              onDelete={handleDelete}
            />
          )}

          {activeModule === "IPD_ADMISSION" && (
            <ClinicalQueueView
              type="IPD"
              records={dataStore.IPD || []}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onOpenEdit={handleOpenEdit}
              onDelete={handleDelete}
            />
          )}

          {activeModule === "DISCHARGE" && (
            <DischargeClearance
              records={dataStore.DISCHARGE || []}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onOpenEdit={handleOpenEdit}
              onDelete={handleDelete}
            />
          )}

          {activeModule === "VISITOR_PASS" && (
            <VisitorPassDesk
              records={dataStore.VISITOR_PASS || []}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onOpenEdit={handleOpenEdit}
              onDelete={handleDelete}
            />
          )}

          {activeModule === "CERTIFICATES" && (
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

          {activeModule === "UTILITY" && (
            <SupportUtility
              records={dataStore.Utility || []}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onOpenEdit={handleOpenEdit}
              onDelete={handleDelete}
            />
          )}
        </main>
      </div>

      <footer className="bg-[#0b1b2b] text-slate-400 px-4 py-2 text-[10px] flex flex-col sm:flex-row items-center justify-between border-t border-slate-800 gap-1 text-center sm:text-left">
        <div>Current Session :- <strong className="text-teal-400">{operatorName} ({operatorEmail}) • Front Desk Node</strong></div>
        <div>Powered by <strong className="text-slate-200">Shourya Technologies</strong> • Status: <span className="text-emerald-400 font-bold">Connected</span></div>
      </footer>

      {/* Identical Professional Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full p-5 sm:p-6 space-y-4 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  Target: {activeModule} Console
                </span>
                <h3 className="text-base font-extrabold text-slate-900 mt-1">
                  {activeModule === "REGISTRATION"
                    ? isEditing
                      ? "Edit Patient Record"
                      : "Register New Patient Record"
                    : isEditing
                    ? `Edit ${activeModule} Entry`
                    : `New ${activeModule} Entry`}
                </h3>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-3.5">
              {activeModule === "REGISTRATION" ? (
                <>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                      Patient Full Legal Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mayur Jadhav"
                      value={formCol1}
                      onChange={(e) => setFormCol1(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                        Contact Mobile Number *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. +91 98765 43210"
                        value={formCol2}
                        onChange={(e) => setFormCol2(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                        Clinical Department / Specialty *
                      </label>
                      <select
                        value={formCol3}
                        onChange={(e) => setFormCol3(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
                      >
                        {HOSPITAL_DEPARTMENTS.map((dept, idx) => (
                          <option key={idx} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                        Assigned Consultant Doctor *
                      </label>
                      <select
                        value={formCol4}
                        onChange={(e) => setFormCol4(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
                      >
                        {HOSPITAL_DOCTORS.map((doc, idx) => (
                          <option key={idx} value={doc}>{doc}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                        Triage Findings / Vitals Notes
                      </label>
                      <input
                        type="text"
                        placeholder="BP: 120/80 • Standard Triage"
                        value={formCol5}
                        onChange={(e) => setFormCol5(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Primary Title / Name *</label>
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
                </>
              )}

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Status Flag *</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as "Active" | "Pending" | "Completed" | "Suspended")}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
                >
                  <option value="Active">Active / Cleared</option>
                  <option value="Pending">Pending Review / Triage</option>
                  <option value="Completed">Completed / Cleared</option>
                  <option value="Suspended">Suspended / Inactive</option>
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
                  {isEditing ? "Save Changes" : `Commit Entry to ${activeModule}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}