"use client";

import React, { useState, useEffect, useCallback } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardSidebar, { SidebarModule } from "@/components/dashboard/DashboardSidebar";
import DoctorClinicalForm from "@/components/dashboard/DoctorClinicalForm";
import LedgerTable from "@/components/dashboard/shared/LedgerTable";
import RegistrationView from "@/components/dashboard/shared/RegistrationView";
import CertificatesView from "@/components/dashboard/shared/CertificatesView";
import PrescriptionDispensary from "@/components/dashboard/medical/PrescriptionDispensary";

import {
  getUniversalStore,
  deleteUniversalRecord,
  UnifiedRecord,
} from "@/lib/sync/hospitalMasterSync";
import { getSharedPatients, saveSharedPatient, deleteSharedPatient, SharedPatient } from "@/lib/sync/patientsSync";
import { getSharedCertificates, deleteSharedCertificate, SharedCertificate } from "@/lib/sync/certificatesSync";
import { getSharedPrescriptions, dispensePrescription, SharedPrescription } from "@/lib/sync/prescriptionsSync";
import { supabase } from "@/lib/supabase";

const DOCTOR_SIDEBAR_MODULES: SidebarModule[] = [
  { id: "OPD", label: "OPD CLINICAL DESK", icon: "🩺" },
  { id: "DISPENSARY", label: "PRESCRIPTION DISPENSARY", icon: "💊" },
  { id: "REGISTRATION", label: "REGISTRATION", icon: "👤" },
  { id: "IPD", label: "IPD (IN-PATIENT)", icon: "🛏️" },
  { id: "OT", label: "OT (OPERATION THEATRE)", icon: "✂️" },
  { id: "RADIOLOGY", label: "RADIOLOGY", icon: "📡" },
  { id: "PATHOLOGY", label: "PATHOLOGY", icon: "🔬" },
  { id: "STOCK", label: "PHARMACY STOCK", icon: "📦" },
  { id: "BILLING", label: "BILLING LEDGER", icon: "💳" },
  { id: "ANALYSIS", label: "ANALYSIS SYSTEM", icon: "📊" },
  { id: "UTILITY", label: "UTILITY", icon: "⚙️" },
  { id: "CERTIFICATES", label: "CERTIFICATES", icon: "📄" },
];

export default function DoctorDashboardPage() {
  const [activeModule, setActiveModule] = useState<string>("OPD");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const [doctorName, setDoctorName] = useState<string>("Dr. Priya");
  const [doctorEmail, setDoctorEmail] = useState<string>("priya@gmail.com");
  const [doctorDept, setDoctorDept] = useState<string>("Cardiology Dept");

  const [dataStore, setDataStore] = useState<Record<string, UnifiedRecord[]>>({});
  const [patients, setPatients] = useState<SharedPatient[]>([]);
  const [certificates, setCertificates] = useState<SharedCertificate[]>([]);
  const [prescriptions, setPrescriptions] = useState<SharedPrescription[]>([]);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Doctor Patient Registration Modal
  const [showRegModal, setShowRegModal] = useState<boolean>(false);
  const [isEditingPt, setIsEditingPt] = useState<boolean>(false);
  const [editPtId, setEditPtId] = useState<string | null>(null);
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regVitals, setRegVitals] = useState("BP: 120/80 • Cleared for Consultation");

  useEffect(() => {
    async function resolveDoctorSession() {
      try {
        const { data } = await supabase.auth.getUser();
        if (data?.user) {
          const metaName = data.user.user_metadata?.full_name || data.user.user_metadata?.name;
          if (metaName) setDoctorName(metaName);
          if (data.user.email) setDoctorEmail(data.user.email);
        }
      } catch {}
    }
    resolveDoctorSession();
  }, []);

  const loadData = useCallback(async () => {
    setDataStore(getUniversalStore());
    setPatients(await getSharedPatients());
    setCertificates(await getSharedCertificates());
    setPrescriptions(await getSharedPrescriptions());
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenAddPatient = () => {
    setIsEditingPt(false);
    setEditPtId(null);
    setRegName("");
    setRegPhone("");
    setRegVitals("BP: 120/80 • Cleared for Consultation");
    setShowRegModal(true);
  };

  const handleOpenEditPatient = (p: SharedPatient) => {
    setIsEditingPt(true);
    setEditPtId(p.id);
    setRegName(p.full_name);
    setRegPhone(p.phone);
    setRegVitals(p.notes);
    setShowRegModal(true);
  };

  const handleRegisterPatientByDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const ptObj: SharedPatient = {
      id: editPtId || `pat-${Date.now()}`,
      reference_id: isEditingPt && editPtId ? (patients.find((p) => p.id === editPtId)?.reference_id || `GH-2026-REG${randomSuffix}`) : `GH-2026-REG${randomSuffix}`,
      full_name: regName,
      phone: regPhone || "+91 98000 00000",
      department: doctorDept,
      assigned_doctor: doctorName,
      notes: regVitals || "Registered directly by Doctor",
      status: "Active",
      created_at: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
    };

    const updated = await saveSharedPatient(ptObj);
    setPatients(updated);
    setFeedback({
      type: "success",
      text: `Patient ${regName} ${isEditingPt ? "updated" : "registered"} successfully. Available for consultation immediately.`,
    });
    setShowRegModal(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Delete ${name}?`)) return;
    const updated = deleteUniversalRecord(activeModule, id);
    setDataStore(updated);
    setFeedback({ type: "success", text: `Removed ${name} from ${activeModule}.` });
  };

  const getHeaders = (mod: string) => {
    switch (mod) {
      case "IPD":
        return ["Ref ID", "Patient Name", "Bed & Ward No", "Department Ward", "Admission Date", "Clinical Status", "Status", "Controls"];
      case "OT":
        return ["Ref ID", "Surgical Procedure", "Patient Name", "OT Theater Room", "Scheduled Slot", "Anesthesia / Surgeon", "Status", "Controls"];
      case "RADIOLOGY":
        return ["Ref ID", "Imaging Scan", "Patient Name", "Radiology Suite", "Timestamp", "Findings", "Status", "Controls"];
      case "PATHOLOGY":
        return ["Ref ID", "Diagnostic Panel", "Sample ID", "Lab Section", "Patient Name", "Results", "Status", "Controls"];
      case "STOCK":
        return ["Item ID", "Medication Name", "SKU Identifier", "Dispenser Unit", "Stock Balance", "Batch / Expiry", "Status", "Controls"];
      case "BILLING":
        return ["Invoice ID", "Patient Name", "Service Description", "Amount", "Receipt Particulars", "Clearance Status", "Status", "Controls"];
      case "ANALYSIS":
        return ["Metric ID", "KPI Indicator", "Volume Metric", "Benchmark", "Prescription Summary", "Performance", "Status", "Controls"];
      case "UTILITY":
        return ["Unit ID", "Equipment", "Location", "Calibration Status", "Sensor Check", "Readiness", "Status", "Controls"];
      default:
        return ["Ref ID", "Subject", "Details", "Department", "Parameters", "Notes", "Status", "Controls"];
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex flex-col font-sans text-slate-800">
      <DashboardHeader
        roleIcon="🩺"
        loggedAsText={`${doctorName} (${doctorEmail})`}
        roleSubtitle="Physician & Outpatient Clinical Workspace"
        bannerText="Physician Clinical EHR & Outpatient Operations Workspace"
      />

      {/* Mobile Switch Bar */}
      <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-2 text-xs font-bold text-white truncate">
          <span className="text-teal-400">🩺 Active:</span>
          <span className="uppercase text-teal-300 truncate">
            {DOCTOR_SIDEBAR_MODULES.find((m) => m.id === activeModule)?.label || activeModule}
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
            modules={DOCTOR_SIDEBAR_MODULES}
            activeModule={activeModule}
            onSelectModule={(id) => {
              setActiveModule(id);
              setSearchTerm("");
            }}
            sectionTitle="Physician Features"
          />
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex flex-col bg-slate-950/80 backdrop-blur-sm">
            <div className="w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-left duration-200">
              <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
                <span className="font-bold text-xs uppercase tracking-wider text-teal-400">Doctor Navigation</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 font-bold hover:text-white"
                >
                  ✕
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-1">
                {DOCTOR_SIDEBAR_MODULES.map((m) => (
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
                    <span>{m.label}</span>
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
                onClick={handleOpenAddPatient}
                className="flex-1 sm:flex-none px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <span>+</span>
                <span>Register New Patient</span>
              </button>
            </div>
          </div>

          {feedback && (
            <div className="p-3 rounded-xl border text-xs font-bold bg-emerald-50 border-emerald-300 text-emerald-900 flex justify-between items-center">
              <span>{feedback.text}</span>
              <button onClick={() => setFeedback(null)} className="font-bold px-2 py-0.5">✕</button>
            </div>
          )}

          {/* OPD Clinical Form View */}
          {activeModule === "OPD" && (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 sm:p-6 overflow-x-auto">
              <DoctorClinicalForm
                doctorName={doctorName}
                patients={patients}
                onSuccess={(msg) => setFeedback({ type: "success", text: msg })}
                onError={(msg) => setFeedback({ type: "error", text: msg })}
              />
            </div>
          )}

          {/* Prescription Dispensary View */}
          {activeModule === "DISPENSARY" && (
            <PrescriptionDispensary
              prescriptions={prescriptions}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onDispense={async (id, pName) => {
                const updated = await dispensePrescription(id, `${doctorName} (Physician Verified)`);
                setPrescriptions(updated);
                setFeedback({ type: "success", text: `Prescription for ${pName} marked verified & dispensed.` });
              }}
            />
          )}

          {/* Universal Registration Ledger */}
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

          {/* Universal Certificates */}
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

          {/* Standard Hospital Ledger */}
          {!["OPD", "DISPENSARY", "REGISTRATION", "CERTIFICATES"].includes(activeModule) && (
            <LedgerTable
              moduleName={activeModule}
              records={dataStore[activeModule] || []}
              headers={getHeaders(activeModule)}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onOpenEdit={() => {}}
              onDelete={handleDelete}
            />
          )}
        </main>
      </div>

      <footer className="bg-[#0b1b2b] text-slate-400 px-4 py-2 text-[10px] flex flex-col sm:flex-row items-center justify-between border-t border-slate-800 gap-1 text-center sm:text-left">
        <div>Current Session :- <strong className="text-teal-400">{doctorName} ({doctorEmail}) • Pune Node</strong></div>
        <div>Powered by <strong className="text-slate-200">Shourya Technologies</strong> • Status: <span className="text-emerald-400 font-bold">Connected</span></div>
      </footer>

      {/* Locked Department & Doctor Modal for Physician Walk-In */}
      {showRegModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full p-5 sm:p-6 space-y-4 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  Physician Walk-In Registration
                </span>
                <h3 className="text-base font-extrabold text-slate-900 mt-1">
                  {isEditingPt ? "Edit Patient Clinical Record" : "Register New Patient to Clinical Queue"}
                </h3>
              </div>
              <button onClick={() => setShowRegModal(false)} className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleRegisterPatientByDoctor} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                  Patient Full Legal Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Jadhav"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
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
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1 flex items-center justify-between">
                    <span>Clinical Department</span>
                    <span className="text-[9px] text-teal-700 font-extrabold bg-teal-100/70 px-1.5 rounded">🔒 Locked</span>
                  </label>
                  <input
                    type="text"
                    disabled
                    value={doctorDept}
                    className="w-full bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-lg p-2.5 text-xs cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1 flex items-center justify-between">
                  <span>Assigned Physician</span>
                  <span className="text-[9px] text-teal-700 font-extrabold bg-teal-100/70 px-1.5 rounded">🔒 Locked</span>
                </label>
                <input
                  type="text"
                  disabled
                  value={doctorName}
                  className="w-full bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-lg p-2.5 text-xs cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                  Observed Vitals & Triage Notes
                </label>
                <input
                  type="text"
                  value={regVitals}
                  onChange={(e) => setRegVitals(e.target.value)}
                  placeholder="BP: 120/80 • Pulse: 72 • Routine Triage"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowRegModal(false)}
                  className="px-4 py-2 bg-slate-100 text-xs font-bold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer"
                >
                  {isEditingPt ? "Save Patient Changes" : "Confirm & Add to Clinical Queue"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}