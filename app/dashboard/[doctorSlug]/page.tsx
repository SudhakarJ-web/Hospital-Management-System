"use client";

import React, { useState, useEffect, useCallback, useMemo, use } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardSidebar, { SidebarModule } from "@/components/dashboard/DashboardSidebar";
import DoctorClinicalForm from "@/components/dashboard/DoctorClinicalForm";
import LedgerTable from "@/components/dashboard/shared/LedgerTable";
import RegistrationView from "@/components/dashboard/shared/RegistrationView";
import CertificatesView from "@/components/dashboard/shared/CertificatesView";
import PrescriptionDispensary from "@/components/dashboard/shared/PrescriptionDispensary";
import AppointmentsView from "@/components/dashboard/shared/AppointmentsView";

import { supabase } from "@/lib/supabase";
import {
  getUniversalStore,
  deleteUniversalRecord,
  UnifiedRecord,
} from "@/lib/sync/hospitalMasterSync";
import { getSharedPatients, saveSharedPatient, deleteSharedPatient, SharedPatient } from "@/lib/sync/patientsSync";
import { getSharedCertificates, deleteSharedCertificate, SharedCertificate } from "@/lib/sync/certificatesSync";
import { getSharedPrescriptions, dispensePrescription, SharedPrescription } from "@/lib/sync/prescriptionsSync";
import { getSharedAppointments, deleteSharedAppointment, SharedAppointment } from "@/lib/sync/appointmentsSync";
import { 
  getCurrentDoctorSession, 
  setCurrentDoctorSession, 
  SharedDoctor 
} from "@/lib/sync/doctorsSync";

const DOCTOR_SIDEBAR_MODULES: SidebarModule[] = [
  { id: "OPD", label: "OPD CLINICAL DESK", icon: "🩺" },
  { id: "APPOINTMENTS", label: "ONLINE APPOINTMENTS", icon: "📅" },
  { id: "DISPENSARY", label: "PRESCRIPTION DISPENSARY", icon: "💊" },
  { id: "REGISTRATION", label: "PATIENT REGISTRATION", icon: "👤" },
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

export default function DynamicDoctorDashboard({
  params,
}: {
  params: Promise<{ doctorSlug: string }>;
}) {
  const resolvedParams = use(params);
  const rawSlug = (resolvedParams?.doctorSlug || "").trim().toLowerCase();

  const [activeModule, setActiveModule] = useState<string>("OPD");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [filterScope, setFilterScope] = useState<"MY_PATIENTS" | "ALL">("MY_PATIENTS");

  const [activeDoctor, setActiveDoctor] = useState<SharedDoctor | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  const [dataStore, setDataStore] = useState<Record<string, UnifiedRecord[]>>({});
  const [patients, setPatients] = useState<SharedPatient[]>([]);
  const [certificates, setCertificates] = useState<SharedCertificate[]>([]);
  const [prescriptions, setPrescriptions] = useState<SharedPrescription[]>([]);
  const [appointments, setAppointments] = useState<SharedAppointment[]>([]);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [showRegModal, setShowRegModal] = useState<boolean>(false);
  const [isEditingPt, setIsEditingPt] = useState<boolean>(false);
  const [editPtId, setEditPtId] = useState<string | null>(null);
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regVitals, setRegVitals] = useState("BP: 120/80 • Cleared for Consultation");

  // Pure Database Resolution of Doctor by URL slug
  useEffect(() => {
    let isMounted = true;

    async function resolveDoctor() {
      if (!rawSlug) {
        window.location.replace("/");
        return;
      }

      // Query Supabase directly for this slug
      try {
        const { data: matched, error } = await supabase
          .from("doctors")
          .select("*")
          .eq("slug", rawSlug)
          .maybeSingle();

        if (!isMounted) return;

        if (matched && !error) {
          setActiveDoctor(matched as SharedDoctor);
          setCurrentDoctorSession(matched as SharedDoctor);
          setIsInitializing(false);
          return;
        }

        // Secondary fallback to session
        const session = getCurrentDoctorSession();
        if (session && session.slug === rawSlug) {
          setActiveDoctor(session);
          setIsInitializing(false);
          return;
        }

        // Slug does not exist in the database
        window.location.replace("/");
      } catch {
        window.location.replace("/");
      }
    }

    resolveDoctor();

    return () => {
      isMounted = false;
    };
  }, [rawSlug]);

  const doctorName = activeDoctor?.name || "Dr. Specialist";
  const doctorEmail = activeDoctor?.email || "doctor@gavanehospital.in";
  const doctorDept = activeDoctor?.department || "General Medicine";

  const loadData = useCallback(async () => {
    setDataStore(getUniversalStore());
    setPatients(await getSharedPatients());
    setCertificates(await getSharedCertificates());
    setPrescriptions(await getSharedPrescriptions());
    setAppointments(await getSharedAppointments());
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Scoped Data by Active Physician
  const doctorPatients = useMemo(() => {
    if (filterScope === "ALL") return patients;
    return patients.filter((p) => {
      const matchDoc =
        p.assigned_doctor?.toLowerCase().includes(doctorName.toLowerCase()) ||
        doctorName.toLowerCase().includes(p.assigned_doctor?.toLowerCase() || "");
      const matchDept =
        p.department?.toLowerCase().includes(doctorDept.toLowerCase()) ||
        doctorDept.toLowerCase().includes(p.department?.toLowerCase() || "");
      return matchDoc || matchDept;
    });
  }, [patients, doctorName, doctorDept, filterScope]);

  const doctorAppointments = useMemo(() => {
    if (filterScope === "ALL") return appointments;
    return appointments.filter((a) => {
      return (
        a.assigned_doctor?.toLowerCase().includes(doctorName.toLowerCase()) ||
        doctorName.toLowerCase().includes(a.assigned_doctor?.toLowerCase() || "") ||
        a.department?.toLowerCase() === doctorDept.toLowerCase()
      );
    });
  }, [appointments, doctorName, doctorDept, filterScope]);

  const doctorPrescriptions = useMemo(() => {
    if (filterScope === "ALL") return prescriptions;
    return prescriptions.filter((rx) => {
      return (
        rx.prescribing_doctor?.toLowerCase().includes(doctorName.toLowerCase()) ||
        doctorName.toLowerCase().includes(rx.prescribing_doctor?.toLowerCase() || "")
      );
    });
  }, [prescriptions, doctorName, filterScope]);

  const doctorOtLedger = useMemo(() => {
    const rawOt = dataStore.OT || [];
    if (filterScope === "ALL") return rawOt;
    return rawOt.filter((r) => {
      return (
        r.col5?.toLowerCase().includes(doctorName.toLowerCase()) ||
        doctorName.toLowerCase().includes(r.col5?.toLowerCase() || "")
      );
    });
  }, [dataStore.OT, doctorName, filterScope]);

  const doctorIpdLedger = useMemo(() => {
    const rawIpd = dataStore.IPD || [];
    if (filterScope === "ALL") return rawIpd;
    return rawIpd.filter((r) => {
      return (
        r.col5?.toLowerCase().includes(doctorName.toLowerCase()) ||
        r.col3?.toLowerCase().includes(doctorDept.toLowerCase())
      );
    });
  }, [dataStore.IPD, doctorName, doctorDept, filterScope]);

  const handleLogout = () => {
    setCurrentDoctorSession(null);
    window.location.href = "/";
  };

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
    setRegVitals(p.notes || "BP: 120/80 • Routine Triage");
    setShowRegModal(true);
  };

  const handleSavePatientByDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const ptObj: SharedPatient = {
      id: editPtId || `pat-${Date.now()}`,
      reference_id:
        isEditingPt && editPtId
          ? patients.find((p) => p.id === editPtId)?.reference_id || `GH-2026-REG${randomSuffix}`
          : `GH-2026-REG${randomSuffix}`,
      full_name: regName.trim(),
      phone: regPhone.trim() || "+91 98000 00000",
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
      text: `Patient ${regName} ${isEditingPt ? "updated" : "registered"} successfully in ${doctorName}'s queue.`,
    });
    setShowRegModal(false);
  };

  const handleDeleteRecord = (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name}?`)) return;
    const updated = deleteUniversalRecord(activeModule, id);
    setDataStore(updated);
    setFeedback({ type: "success", text: `Removed ${name} from ${activeModule} ledger.` });
  };

  const getHeaders = (mod: string) => {
    switch (mod) {
      case "IPD":
        return ["Ref ID", "Patient Name", "Bed & Ward No", "Department Ward", "Admission Date", "Consultant Doctor", "Status", "Controls"];
      case "OT":
        return ["Ref ID", "Surgical Procedure", "Patient Name", "OT Theater Room", "Scheduled Slot", "Chief Surgeon", "Status", "Controls"];
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

  const activeModuleLabel =
    DOCTOR_SIDEBAR_MODULES.find((m) => m.id === activeModule)?.label || activeModule;

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-slate-500">Connecting to clinical console...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex flex-col font-sans text-slate-800">
      <DashboardHeader
        roleIcon="🩺"
        loggedAsText={`${doctorName} (${doctorEmail})`}
        roleSubtitle={`${doctorDept} • Specialist Console`}
        bannerText={`Welcome to your clinical workspace, ${doctorName}`}
        onClose={handleLogout}
      />

      <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-2 text-xs font-bold text-white truncate">
          <span className="text-teal-400">🩺 {doctorName}:</span>
          <span className="uppercase text-teal-300 truncate">{activeModuleLabel}</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center space-x-1 cursor-pointer"
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
            sectionTitle={`${doctorName}'s Modules`}
          />
        </div>

        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex flex-col bg-slate-950/80 backdrop-blur-sm">
            <div className="w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-left duration-200">
              <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
                <span className="font-bold text-xs uppercase tracking-wider text-teal-400">{doctorName}</span>
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
              <span className="truncate">
                Active Physician: <strong className="text-teal-700">{doctorName}</strong> ({doctorDept})
              </span>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto justify-end shrink-0">
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-300 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setFilterScope("MY_PATIENTS")}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    filterScope === "MY_PATIENTS"
                      ? "bg-white text-teal-800 shadow-xs font-black"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  My Caseload ({doctorPatients.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterScope("ALL")}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    filterScope === "ALL"
                      ? "bg-white text-teal-800 shadow-xs font-black"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  All Hospital ({patients.length})
                </button>
              </div>

              <button
                onClick={loadData}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold rounded-lg transition-colors flex items-center space-x-1.5 cursor-pointer"
              >
                <span>🔄</span>
                <span className="hidden sm:inline">Sync Live</span>
              </button>

              <button
                onClick={handleOpenAddPatient}
                className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center space-x-1 cursor-pointer whitespace-nowrap"
              >
                <span>+</span>
                <span>Register Patient</span>
              </button>
            </div>
          </div>

          {feedback && (
            <div
              className={`p-3 rounded-xl border text-xs font-bold flex justify-between items-center ${
                feedback.type === "success"
                  ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                  : "bg-rose-50 border-rose-300 text-rose-900"
              }`}
            >
              <span>{feedback.text}</span>
              <button onClick={() => setFeedback(null)} className="font-bold px-2 py-0.5 hover:text-slate-900">
                ✕
              </button>
            </div>
          )}

          {activeModule === "OPD" && (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 sm:p-6 overflow-x-auto">
              <DoctorClinicalForm
                doctorName={doctorName}
                patients={doctorPatients}
                onSuccess={(msg) => {
                  setFeedback({ type: "success", text: msg });
                  loadData();
                }}
                onError={(msg) => setFeedback({ type: "error", text: msg })}
              />
            </div>
          )}

          {activeModule === "APPOINTMENTS" && (
            <AppointmentsView
              appointments={doctorAppointments}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onDeleteAppointment={async (id, name) => {
                if (!confirm(`Cancel appointment for ${name}?`)) return;
                const updated = await deleteSharedAppointment(id);
                setAppointments(updated);
                setFeedback({ type: "success", text: `Cancelled appointment for ${name}.` });
              }}
            />
          )}

          {activeModule === "DISPENSARY" && (
            <PrescriptionDispensary
              prescriptions={doctorPrescriptions}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onDispense={async (id, pName) => {
                const updated = await dispensePrescription(id, `${doctorName} (Physician Verified)`);
                setPrescriptions(updated);
                setFeedback({ type: "success", text: `Prescription for ${pName} verified and dispensed.` });
              }}
            />
          )}

          {activeModule === "REGISTRATION" && (
            <RegistrationView
              patients={doctorPatients}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onOpenEditPatient={handleOpenEditPatient}
              onDeletePatient={async (id, name) => {
                if (!confirm(`Delete registered patient ${name}?`)) return;
                const updated = await deleteSharedPatient(id);
                setPatients(updated);
                setFeedback({ type: "success", text: `Deleted patient ${name}.` });
              }}
            />
          )}

          {activeModule === "IPD" && (
            <LedgerTable
              moduleName="In-Patient (IPD) Admissions"
              records={doctorIpdLedger}
              headers={getHeaders("IPD")}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onOpenEdit={() => {}}
              onDelete={handleDeleteRecord}
            />
          )}

          {activeModule === "OT" && (
            <LedgerTable
              moduleName="Operation Theatre (OT) Suites"
              records={doctorOtLedger}
              headers={getHeaders("OT")}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onOpenEdit={() => {}}
              onDelete={handleDeleteRecord}
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

          {!["OPD", "APPOINTMENTS", "DISPENSARY", "REGISTRATION", "IPD", "OT", "CERTIFICATES"].includes(activeModule) && (
            <LedgerTable
              moduleName={activeModule}
              records={dataStore[activeModule] || []}
              headers={getHeaders(activeModule)}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onOpenEdit={() => {}}
              onDelete={handleDeleteRecord}
            />
          )}
        </main>
      </div>

      <footer className="bg-[#0b1b2b] text-slate-400 px-4 py-2 text-[10px] flex flex-col sm:flex-row items-center justify-between border-t border-slate-800 gap-1 text-center sm:text-left">
        <div>Logged-in Consultant :- <strong className="text-teal-400">{doctorName} ({doctorEmail}) • {doctorDept}</strong></div>
        <div>
          <button onClick={handleLogout} className="text-rose-400 hover:underline font-bold cursor-pointer mr-3">
            Sign Out
          </button>
          Powered by <strong className="text-slate-200">Shourya Technologies</strong> • Status: <span className="text-emerald-400 font-bold">Connected</span>
        </div>
      </footer>

      {showRegModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full p-5 sm:p-6 space-y-4 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  {doctorName} • Clinical Triage
                </span>
                <h3 className="text-base font-extrabold text-slate-900 mt-1">
                  {isEditingPt ? "Edit Patient Clinical Record" : `Register Patient to ${doctorName}'s Queue`}
                </h3>
              </div>
              <button onClick={() => setShowRegModal(false)} className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSavePatientByDoctor} className="space-y-3.5">
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
                    <span className="text-[9px] text-teal-700 font-extrabold bg-teal-100/70 px-1.5 rounded">{"🔒 Locked"}</span>
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
                  <span className="text-[9px] text-teal-700 font-extrabold bg-teal-100/70 px-1.5 rounded">{"🔒 Locked"}</span>
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

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
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
                  {isEditingPt ? "Save Patient Changes" : `Add to ${doctorName}'s Queue`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}