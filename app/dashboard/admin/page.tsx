"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardSidebar, { SidebarModule } from "@/components/dashboard/DashboardSidebar";
import LedgerTable from "@/components/dashboard/shared/LedgerTable";
import RegistrationView from "@/components/dashboard/shared/RegistrationView";
import CertificatesView from "@/components/dashboard/shared/CertificatesView";
import PrescriptionDispensary from "@/components/dashboard/shared/PrescriptionDispensary";
import AppointmentsView from "@/components/dashboard/shared/AppointmentsView";
import AdminDoctorModal from "@/components/dashboard/admin/AdminDoctorModal";

import { supabase } from "@/lib/supabase";
import { SharedDoctor } from "@/lib/sync/doctorsSync";
import {
  getUniversalStore,
  deleteUniversalRecord,
  UnifiedRecord,
} from "@/lib/sync/hospitalMasterSync";
import { getSharedPatients, saveSharedPatient, deleteSharedPatient, SharedPatient } from "@/lib/sync/patientsSync";
import { getSharedCertificates, deleteSharedCertificate, SharedCertificate } from "@/lib/sync/certificatesSync";
import { getSharedPrescriptions, dispensePrescription, SharedPrescription } from "@/lib/sync/prescriptionsSync";
import { getSharedAppointments, deleteSharedAppointment, SharedAppointment } from "@/lib/sync/appointmentsSync";

const ADMIN_SIDEBAR_MODULES: SidebarModule[] = [
  { id: "MASTER", label: "MASTER EXECUTIVE DESK", icon: "🏛️" },
  { id: "DOCTORS", label: "DOCTORS DIRECTORY", icon: "🩺" },
  { id: "APPOINTMENTS", label: "ONLINE APPOINTMENTS", icon: "📅" },
  { id: "REGISTRATION", label: "PATIENT REGISTRATION", icon: "👤" },
  { id: "DISPENSARY", label: "PRESCRIPTION DISPENSARY", icon: "💊" },
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

export default function AdminDashboard() {
  const [activeModule, setActiveModule] = useState<string>("DOCTORS");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Database-backed Doctors State
  const [doctors, setDoctors] = useState<SharedDoctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<SharedDoctor | null>(null);
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState<boolean>(false);
  const [doctorSearchTerm, setDoctorSearchTerm] = useState<string>("");

  // Clinical & Departmental Datastores
  const [dataStore, setDataStore] = useState<Record<string, UnifiedRecord[]>>({});
  const [patients, setPatients] = useState<SharedPatient[]>([]);
  const [certificates, setCertificates] = useState<SharedCertificate[]>([]);
  const [prescriptions, setPrescriptions] = useState<SharedPrescription[]>([]);
  const [appointments, setAppointments] = useState<SharedAppointment[]>([]);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Patient Registration Modal State
  const [showRegModal, setShowRegModal] = useState<boolean>(false);
  const [isEditingPt, setIsEditingPt] = useState<boolean>(false);
  const [editPtId, setEditPtId] = useState<string | null>(null);
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regDept, setRegDept] = useState("General Medicine & Pediatrics");
  const [regDoctor, setRegDoctor] = useState("");
  const [regVitals, setRegVitals] = useState("BP: 120/80 • Cleared for Consultation");

  // Fetch doctors directly from live Supabase table
  const loadLiveDoctors = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("doctors")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setDoctors(data as SharedDoctor[]);
      }
    } catch (err) {
      console.error("Failed to fetch doctors from Supabase:", err);
    }
  }, []);

  const loadData = useCallback(async () => {
    await loadLiveDoctors();
    setDataStore(getUniversalStore());
    setPatients(await getSharedPatients());
    setCertificates(await getSharedCertificates());
    setPrescriptions(await getSharedPrescriptions());
    setAppointments(await getSharedAppointments());
  }, [loadLiveDoctors]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleLogout = () => {
    window.location.href = "/";
  };

  const handleDeleteDoctor = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently remove ${name} from the hospital registry?`)) {
      return;
    }

    try {
      const { error } = await supabase.from("doctors").delete().eq("id", id);
      if (error) throw error;

      setFeedback({ type: "success", text: `Successfully removed ${name} from the database.` });
      await loadLiveDoctors();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete physician profile.";
      setFeedback({ type: "error", text: msg });
    }
  };

  const handleOpenAddPatient = () => {
    setIsEditingPt(false);
    setEditPtId(null);
    setRegName("");
    setRegPhone("");
    setRegDept(doctors[0]?.department || "General Medicine & Pediatrics");
    setRegDoctor(doctors[0]?.name || "Chief Medical Officer");
    setRegVitals("BP: 120/80 • Cleared for Consultation");
    setShowRegModal(true);
  };

  const handleOpenEditPatient = (p: SharedPatient) => {
    setIsEditingPt(true);
    setEditPtId(p.id);
    setRegName(p.full_name);
    setRegPhone(p.phone);
    setRegDept(p.department || "General Medicine");
    setRegDoctor(p.assigned_doctor || "Hospital Specialist");
    setRegVitals(p.notes || "BP: 120/80 • Routine Triage");
    setShowRegModal(true);
  };

  const handleSavePatient = async (e: React.FormEvent) => {
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
      department: regDept,
      assigned_doctor: regDoctor || doctors[0]?.name || "Consultant Physician",
      notes: regVitals,
      status: "Active",
      created_at: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
    };

    const updated = await saveSharedPatient(ptObj);
    setPatients(updated);
    setFeedback({
      type: "success",
      text: `Patient ${regName} ${isEditingPt ? "updated" : "registered"} successfully.`,
    });
    setShowRegModal(false);
  };

  const handleDeleteRecord = (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name}?`)) return;
    const updated = deleteUniversalRecord(activeModule, id);
    setDataStore(updated);
    setFeedback({ type: "success", text: `Removed ${name} from ${activeModule} ledger.` });
  };

  const filteredDoctors = useMemo(() => {
    const q = doctorSearchTerm.toLowerCase().trim();
    if (!q) return doctors;
    return doctors.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.department.toLowerCase().includes(q) ||
        d.email.toLowerCase().includes(q) ||
        d.reference_id.toLowerCase().includes(q)
    );
  }, [doctors, doctorSearchTerm]);

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
    ADMIN_SIDEBAR_MODULES.find((m) => m.id === activeModule)?.label || activeModule;

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex flex-col font-sans text-slate-800">
      <DashboardHeader
        roleIcon="🏛️"
        loggedAsText="Hospital Administrator (admin@gavanehospital.in)"
        roleSubtitle="Central Administrative & Medical Governance Desk"
        bannerText="Welcome to the Executive Operations Console"
        onClose={handleLogout}
      />

      {/* Mobile Bar */}
      <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-2 text-xs font-bold text-white truncate">
          <span className="text-teal-400">🏛️ Admin:</span>
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
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <DashboardSidebar
            modules={ADMIN_SIDEBAR_MODULES}
            activeModule={activeModule}
            onSelectModule={(id) => {
              setActiveModule(id);
              setSearchTerm("");
            }}
            sectionTitle="Administrative Control"
          />
        </div>

        {/* Mobile Slide Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex flex-col bg-slate-950/80 backdrop-blur-sm">
            <div className="w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-left duration-200">
              <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
                <span className="font-bold text-xs uppercase tracking-wider text-teal-400">Hospital Administration</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 font-bold hover:text-white"
                >
                  ✕
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-1">
                {ADMIN_SIDEBAR_MODULES.map((m) => (
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
          {/* Action Top Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 px-1 py-0.5 min-w-0">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
              <span className="truncate">
                Live Node: <strong className="text-teal-700">Supabase DB Cluster</strong> • Registered Specialists:{" "}
                <strong className="text-slate-900">{doctors.length}</strong>
              </span>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto justify-end shrink-0">
              <button
                onClick={loadData}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold rounded-lg transition-colors flex items-center space-x-1.5 cursor-pointer"
              >
                <span>🔄</span>
                <span>Sync Live</span>
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

          {/* MASTER EXECUTIVE OVERVIEW DESK */}
          {activeModule === "MASTER" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Consultants</span>
                  <span className="text-2xl font-black text-slate-900 mt-1 block">{doctors.length}</span>
                  <span className="text-[10px] text-emerald-600 font-bold mt-1 block">Live in Database</span>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Active Patients</span>
                  <span className="text-2xl font-black text-teal-700 mt-1 block">{patients.length}</span>
                  <span className="text-[10px] text-slate-500 font-medium mt-1 block">Clinical Queue</span>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Appointments</span>
                  <span className="text-2xl font-black text-indigo-700 mt-1 block">{appointments.length}</span>
                  <span className="text-[10px] text-slate-500 font-medium mt-1 block">Scheduled Triage</span>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Dispensary Orders</span>
                  <span className="text-2xl font-black text-amber-700 mt-1 block">{prescriptions.length}</span>
                  <span className="text-[10px] text-slate-500 font-medium mt-1 block">Pharmacy Ledger</span>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-2">
                  System Architecture & Database Synchronization
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  The hospital system operates with live database records. Adding or updating specialist credentials updates
                  Supabase tables in real time. Dynamic routing routes doctors directly through their calculated slugs,
                  enforcing role-level authentication.
                </p>
              </div>
            </div>
          )}

          {/* DOCTORS MANAGEMENT DESK */}
          {activeModule === "DOCTORS" && (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Specialist Doctors & Medical Consultants
                  </h3>
                  <p className="text-xs text-slate-500">
                    Direct live table representation of <code>public.doctors</code>.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Search by name, department, or email..."
                    value={doctorSearchTerm}
                    onChange={(e) => setDoctorSearchTerm(e.target.value)}
                    className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      setSelectedDoctor(null);
                      setIsDoctorModalOpen(true);
                    }}
                    className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center space-x-1 cursor-pointer whitespace-nowrap"
                  >
                    <span>+ Add Doctor</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-[10px] font-extrabold uppercase text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Ref ID</th>
                      <th className="py-2.5 px-3">Doctor Profile</th>
                      <th className="py-2.5 px-3">Specialty Department</th>
                      <th className="py-2.5 px-3">Official Email</th>
                      <th className="py-2.5 px-3">Portal Password</th>
                      <th className="py-2.5 px-3">Slug Route</th>
                      <th className="py-2.5 px-3">Fee</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Controls</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredDoctors.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-8 text-center text-slate-400 italic">
                          No doctors found in the database. Click &ldquo;+ Add Doctor&rdquo; to register one.
                        </td>
                      </tr>
                    ) : (
                      filteredDoctors.map((doc) => (
                        <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-2.5 px-3 font-mono text-slate-500">{doc.reference_id}</td>
                          <td className="py-2.5 px-3 flex items-center space-x-2.5">
                            <img
                              src={doc.image || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80"}
                              alt={doc.name}
                              className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
                            />
                            <div className="min-w-0">
                              <span className="font-bold text-slate-900 block truncate">{doc.name}</span>
                              <span className="text-[10px] text-slate-400 block truncate">{doc.degree}</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-3">{doc.department}</td>
                          <td className="py-2.5 px-3 font-mono text-slate-600">{doc.email}</td>
                          <td className="py-2.5 px-3 font-mono text-teal-800 font-bold">{doc.password}</td>
                          <td className="py-2.5 px-3 font-mono text-[10px] text-slate-500">
                            /dashboard/{doc.slug}
                          </td>
                          <td className="py-2.5 px-3 font-bold">{doc.fee}</td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                                doc.status === "Active"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : doc.status === "Pending"
                                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                                  : "bg-rose-50 text-rose-700 border border-rose-200"
                              }`}
                            >
                              {doc.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right space-x-2">
                            <button
                              onClick={() => {
                                setSelectedDoctor(doc);
                                setIsDoctorModalOpen(true);
                              }}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-bold cursor-pointer transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteDoctor(doc.id, doc.name)}
                              className="px-2 py-1 bg-rose-50 hover:bg-rose-100 rounded text-rose-600 font-bold cursor-pointer transition-colors"
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

              <AdminDoctorModal
                isOpen={isDoctorModalOpen}
                doctor={selectedDoctor}
                onClose={() => setIsDoctorModalOpen(false)}
                onSaved={loadLiveDoctors}
              />
            </div>
          )}

          {activeModule === "APPOINTMENTS" && (
            <AppointmentsView
              appointments={appointments}
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

          {activeModule === "REGISTRATION" && (
            <RegistrationView
              patients={patients}
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

          {activeModule === "DISPENSARY" && (
            <PrescriptionDispensary
              prescriptions={prescriptions}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onDispense={async (id, pName) => {
                const updated = await dispensePrescription(id, "Central Admin Clearance");
                setPrescriptions(updated);
                setFeedback({ type: "success", text: `Dispensed medication for ${pName}.` });
              }}
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

          {!["MASTER", "DOCTORS", "APPOINTMENTS", "REGISTRATION", "DISPENSARY", "CERTIFICATES"].includes(activeModule) && (
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
        <div>Logged-in as: <strong className="text-teal-400">Hospital Administrator (admin@gavanehospital.in)</strong></div>
        <div>
          <button onClick={handleLogout} className="text-rose-400 hover:underline font-bold cursor-pointer mr-3">
            Sign Out
          </button>
          Powered by <strong className="text-slate-200">Shourya Technologies</strong> • Status: <span className="text-emerald-400 font-bold">Connected to DB</span>
        </div>
      </footer>

      {/* Patient Registration Modal */}
      {showRegModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full p-5 sm:p-6 space-y-4 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  Hospital Central Triage Desk
                </span>
                <h3 className="text-base font-extrabold text-slate-900 mt-1">
                  {isEditingPt ? "Edit Patient Clinical Record" : "Register Patient into Clinical Caseload"}
                </h3>
              </div>
              <button onClick={() => setShowRegModal(false)} className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSavePatient} className="space-y-3.5">
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
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                    Clinical Department *
                  </label>
                  <select
                    value={regDept}
                    onChange={(e) => setRegDept(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
                  >
                    <option value="Cardiology & Cardiac Sciences">Cardiology & Cardiac Sciences</option>
                    <option value="General Surgery & Trauma">General Surgery & Trauma</option>
                    <option value="General Medicine & Pediatrics">General Medicine & Pediatrics</option>
                    <option value="Orthopedics & Joint Replacement">Orthopedics & Joint Replacement</option>
                    <option value="Neurology & Neurosurgery">Neurology & Neurosurgery</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                  Assigned Consulting Physician *
                </label>
                <select
                  value={regDoctor}
                  onChange={(e) => setRegDoctor(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
                >
                  {doctors.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name} ({d.department})
                    </option>
                  ))}
                  {doctors.length === 0 && <option value="Duty Medical Officer">Duty Medical Officer</option>}
                </select>
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
                  {isEditingPt ? "Save Patient Changes" : "Register Patient"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}