"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { SharedDoctor, getSharedDoctors } from "@/lib/sync/doctorsSync";
import { SharedPatient, getSharedPatients } from "@/lib/sync/patientsSync";
import { SharedPrescription, getSharedPrescriptions, dispensePrescription } from "@/lib/sync/prescriptionsSync";
import { SharedAppointment, getSharedAppointments } from "@/lib/sync/appointmentsSync";
import { getLiveModuleRecords, saveLiveModuleRecord, deleteLiveModuleRecord, UnifiedRecord } from "@/lib/sync/hospitalMasterSync";
import DoctorClinicalForm from "@/components/dashboard/DoctorClinicalForm";
import PrescriptionDispensary from "@/components/dashboard/shared/PrescriptionDispensary";
import RegistrationView from "@/components/dashboard/shared/RegistrationView";
import AppointmentsView from "@/components/dashboard/shared/AppointmentsView";
import CertificatesView from "@/components/dashboard/shared/CertificatesView";
import {
  Activity,
  Stethoscope,
  Users,
  Calendar,
  Pill,
  BedDouble,
  Scissors,
  Scan,
  FlaskConical,
  Boxes,
  Receipt,
  BarChart3,
  Wrench,
  FileCheck,
  RotateCw,
  Power,
  Plus,
  Trash2,
} from "lucide-react";

interface DoctorSlugProps {
  params: Promise<{ doctorSlug?: string; slug?: string }>;
}

export default function DoctorSlugDashboard({ params }: DoctorSlugProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const doctorSlug = resolvedParams.doctorSlug || resolvedParams.slug;

  const [activeDoctor, setActiveDoctor] = useState<SharedDoctor | null>(null);
  const [allPatients, setAllPatients] = useState<SharedPatient[]>([]);
  const [allPrescriptions, setAllPrescriptions] = useState<SharedPrescription[]>([]);
  const [allAppointments, setAllAppointments] = useState<SharedAppointment[]>([]);
  const [ledgerRecords, setLedgerRecords] = useState<UnifiedRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Active Sidebar View
  const [activeView, setActiveView] = useState<
    | "opd"
    | "appointments"
    | "registration"
    | "dispensary"
    | "ipd"
    | "ot"
    | "radiology"
    | "pathology"
    | "pharmacy"
    | "billing"
    | "analysis"
    | "utility"
    | "certificates"
  >("opd");

  const [notification, setNotification] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadAllData = async () => {
    setIsSyncing(true);
    try {
      const [doctorsList, patientsData, rxData, apptData] = await Promise.all([
        getSharedDoctors(),
        getSharedPatients(),
        getSharedPrescriptions(),
        getSharedAppointments(),
      ]);

      const matched = doctorsList.find(
        (d) =>
          d.slug === doctorSlug ||
          d.slug === `doctor-${doctorSlug}` ||
          doctorSlug?.includes(d.slug)
      );

      if (!matched) {
        setNotification({ type: "error", text: `Doctor profile "${doctorSlug}" not found.` });
        setLoading(false);
        return;
      }

      setActiveDoctor(matched);
      setAllPatients(patientsData);
      setAllPrescriptions(rxData);
      setAllAppointments(apptData);

      // Load ledger records if active view is a clinical ledger
      const moduleMap: Record<string, string> = {
        pharmacy: "STOCK",
        ipd: "IPD",
        ot: "OT",
        radiology: "RADIOLOGY",
        pathology: "PATHOLOGY",
        billing: "BILLING",
        analysis: "ANALYSIS",
        utility: "UTILITY",
      };

      if (moduleMap[activeView]) {
        const records = await getLiveModuleRecords(moduleMap[activeView]);
        setLedgerRecords(records);
      }
    } catch {
      setNotification({ type: "error", text: "Database sync failed. Check connectivity." });
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (doctorSlug) {
      loadAllData();
    }
  }, [doctorSlug, activeView]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#07131b] text-white space-y-3 font-sans">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
          Loading Clinical EHR Operations Workspace...
        </p>
      </div>
    );
  }

  if (!activeDoctor) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-4 space-y-4">
        <p className="text-sm font-bold text-rose-400">Doctor account could not be resolved from URL.</p>
        <button
          onClick={() => router.push("/")}
          className="px-4 py-2 bg-teal-600 rounded-xl text-xs font-bold"
        >
          Return to Hospital Portal
        </button>
      </div>
    );
  }

  // Filter dedicated patient caseload and appointments for this physician
  const myPatients = allPatients.filter(
    (p) =>
      (p.doctor_id && p.doctor_id === activeDoctor.id) ||
      (p.assigned_doctor && p.assigned_doctor.toLowerCase().includes(activeDoctor.name.toLowerCase()))
  );

  const myAppointments = allAppointments.filter(
    (a) =>
      (a.doctor_id && a.doctor_id === activeDoctor.id) ||
      (a.assigned_doctor && a.assigned_doctor.toLowerCase().includes(activeDoctor.name.toLowerCase()))
  );

  // Quick ledger entry addition
  const handleAddLedgerRow = async () => {
    const moduleKey = activeView === "pharmacy" ? "STOCK" : activeView.toUpperCase();
    const itemTitle = prompt(`Enter new entry title for ${moduleKey}:`);
    if (!itemTitle) return;

    await saveLiveModuleRecord(moduleKey, {
      col1: itemTitle,
      col2: activeDoctor.name,
      col3: new Date().toLocaleDateString(),
      status: "Active",
      doctor_id: activeDoctor.id,
    });
    const updated = await getLiveModuleRecords(moduleKey);
    setLedgerRecords(updated);
  };

  const handleDeleteLedgerRow = async (id: string) => {
    const moduleKey = activeView === "pharmacy" ? "STOCK" : activeView.toUpperCase();
    await deleteLiveModuleRecord(moduleKey, id);
    const updated = await getLiveModuleRecords(moduleKey);
    setLedgerRecords(updated);
  };

  return (
    <div className="min-h-screen bg-[#07131b] text-slate-200 flex flex-col font-sans">
      {/* Top Main Dark Navbar */}
      <header className="bg-[#050f16] border-b border-slate-800/80 px-6 py-3 flex items-center justify-between z-30 shadow-md">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-teal-700/80 border border-teal-500/30 flex items-center justify-center text-white font-black shadow-xs">
            <Activity className="w-5 h-5 text-teal-300" />
          </div>
          <div>
            <div className="text-xs font-black tracking-tight text-white uppercase">
              GAVANE HOSPITAL AND RESEARCH CENTRE
            </div>
            <div className="text-[10px] text-teal-400 font-bold">
              • Physician & Outpatient Clinical Workspace
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl text-xs text-slate-300">
            <Stethoscope className="w-3.5 h-3.5 text-teal-400" />
            <span>
              Logged as: <strong className="text-white">{activeDoctor.name}</strong> ({activeDoctor.email})
            </span>
          </div>

          <button
            onClick={() => router.push("/")}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Power className="w-3.5 h-3.5" />
            <span>Close / Exit</span>
          </button>
        </div>
      </header>

      {/* Sub-header ticker bar */}
      <div className="bg-[#040b10] border-b border-slate-800/50 py-1 text-center text-[10px] tracking-widest text-teal-400 uppercase font-bold">
        PHYSICIAN CLINICAL EHR & OUTPATIENT OPERATIONS WORKSPACE
      </div>

      {/* Main Workspace Frame */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Dark Enterprise Sidebar */}
        <aside className="w-64 bg-[#07131b] border-r border-slate-800/80 flex flex-col justify-between p-3 shrink-0 overflow-y-auto">
          <div className="space-y-1">
            <div className="px-3 py-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
              PHYSICIAN FEATURES
            </div>

            <button
              onClick={() => setActiveView("opd")}
              className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeView === "opd"
                  ? "bg-teal-600 text-white shadow-sm"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              <span>OPD CLINICAL DESK</span>
            </button>

            <button
              onClick={() => setActiveView("appointments")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeView === "appointments"
                  ? "bg-teal-600 text-white shadow-sm"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Calendar className="w-4 h-4" />
                <span>ONLINE APPOINTMENTS</span>
              </div>
              {myAppointments.length > 0 && (
                <span className="bg-teal-950 text-teal-300 border border-teal-700/50 text-[10px] px-1.5 py-0.2 rounded font-mono">
                  {myAppointments.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveView("registration")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeView === "registration"
                  ? "bg-teal-600 text-white shadow-sm"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Users className="w-4 h-4" />
                <span>PATIENT REGISTRATION</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                {myPatients.length}
              </span>
            </button>

            <button
              onClick={() => setActiveView("dispensary")}
              className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeView === "dispensary"
                  ? "bg-teal-600 text-white shadow-sm"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
              }`}
            >
              <Pill className="w-4 h-4" />
              <span>PRESCRIPTION DISPENSARY</span>
            </button>

            <div className="pt-2 px-3 pb-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
              DEPARTMENTAL LEDGERS
            </div>

            <button
              onClick={() => setActiveView("ipd")}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                activeView === "ipd" ? "bg-teal-600 text-white" : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
              }`}
            >
              <BedDouble className="w-4 h-4" />
              <span>IPD (IN-PATIENT)</span>
            </button>

            <button
              onClick={() => setActiveView("ot")}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                activeView === "ot" ? "bg-teal-600 text-white" : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
              }`}
            >
              <Scissors className="w-4 h-4" />
              <span>OT (OPERATION THEATRE)</span>
            </button>

            <button
              onClick={() => setActiveView("radiology")}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                activeView === "radiology" ? "bg-teal-600 text-white" : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
              }`}
            >
              <Scan className="w-4 h-4" />
              <span>RADIOLOGY</span>
            </button>

            <button
              onClick={() => setActiveView("pathology")}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                activeView === "pathology" ? "bg-teal-600 text-white" : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
              }`}
            >
              <FlaskConical className="w-4 h-4" />
              <span>PATHOLOGY</span>
            </button>

            <button
              onClick={() => setActiveView("pharmacy")}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                activeView === "pharmacy" ? "bg-teal-600 text-white" : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
              }`}
            >
              <Boxes className="w-4 h-4" />
              <span>PHARMACY STOCK</span>
            </button>

            <button
              onClick={() => setActiveView("billing")}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                activeView === "billing" ? "bg-teal-600 text-white" : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>BILLING LEDGER</span>
            </button>

            <button
              onClick={() => setActiveView("analysis")}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                activeView === "analysis" ? "bg-teal-600 text-white" : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>ANALYSIS SYSTEM</span>
            </button>

            <button
              onClick={() => setActiveView("utility")}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                activeView === "utility" ? "bg-teal-600 text-white" : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span>UTILITY</span>
            </button>

            <button
              onClick={() => setActiveView("certificates")}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                activeView === "certificates" ? "bg-teal-600 text-white" : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
              }`}
            >
              <FileCheck className="w-4 h-4" />
              <span>CERTIFICATES</span>
            </button>
          </div>

          <div className="pt-4 border-t border-slate-800/60 text-[10px] text-slate-400 space-y-0.5">
            <div className="font-bold text-slate-300">SHOURYA TECHNOLOGIES</div>
            <div>Hadapsar, Pune, Maharashtra.</div>
            <div>Contact: +91 9860043213</div>
          </div>
        </aside>

        {/* Right Main Body */}
        <main className="flex-1 bg-slate-100 p-6 overflow-y-auto">
          {/* Sub-header Strip */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 mb-5 flex items-center justify-between shadow-2xs">
            <div className="flex items-center space-x-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-slate-700">
                Active Clinical Ledger:{" "}
                <strong className="text-teal-700 uppercase">{activeView}</strong>
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-500">
                Department: <strong>{activeDoctor.department}</strong>
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={loadAllData}
                disabled={isSyncing}
                className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer shadow-2xs"
              >
                <RotateCw className={`w-3.5 h-3.5 text-teal-600 ${isSyncing ? "animate-spin" : ""}`} />
                <span>Sync Live Data</span>
              </button>
            </div>
          </div>

          {notification && (
            <div
              className={`p-3.5 rounded-xl text-xs font-bold mb-4 ${
                notification.type === "success"
                  ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                  : "bg-rose-50 border border-rose-200 text-rose-800"
              }`}
            >
              {notification.text}
            </div>
          )}

          {/* VIEW: OPD Clinical Form */}
          {activeView === "opd" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
              <DoctorClinicalForm
                doctorName={activeDoctor.name}
                doctorId={activeDoctor.id}
                patients={myPatients.length > 0 ? myPatients : allPatients}
                onSuccess={(msg) => {
                  setNotification({ type: "success", text: msg });
                  loadAllData();
                }}
                onError={(msg) => setNotification({ type: "error", text: msg })}
              />
            </div>
          )}

          {/* VIEW: Dedicated Online Appointments */}
          {activeView === "appointments" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="mb-4">
                <h2 className="text-base font-black text-slate-900">
                  Online Appointments for {activeDoctor.name}
                </h2>
                <p className="text-xs text-slate-500">
                  Consultations booked via the web portal ({myAppointments.length} confirmed bookings).
                </p>
              </div>

              <AppointmentsView
                appointments={myAppointments}
                searchTerm=""
                onSearchChange={() => {}}
                onDeleteAppointment={() => {}}
              />
            </div>
          )}

          {/* VIEW: Patient Caseload Registration */}
          {activeView === "registration" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-black text-slate-900">
                    Patient Registration Ledger
                  </h2>
                  <p className="text-xs text-slate-500">
                    Active clinical caseload assigned to {activeDoctor.name}.
                  </p>
                </div>
                <span className="text-xs font-bold bg-teal-50 text-teal-700 px-3 py-1 rounded-xl border border-teal-200">
                  {myPatients.length} Active Patients
                </span>
              </div>

              <RegistrationView
                patients={myPatients}
                searchTerm=""
                onSearchChange={() => {}}
                onOpenEditPatient={() => {}}
                onDeletePatient={() => {}}
              />
            </div>
          )}

          {/* VIEW: Dispensary */}
          {activeView === "dispensary" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <PrescriptionDispensary
                prescriptions={allPrescriptions}
                searchTerm=""
                onSearchChange={() => {}}
                onDispense={async (id) => {
                  await dispensePrescription(id, activeDoctor.name);
                  loadAllData();
                }}
              />
            </div>
          )}

          {/* VIEW: Clinical Departmental Ledgers */}
          {["ipd", "ot", "radiology", "pathology", "pharmacy", "billing", "analysis", "utility"].includes(
            activeView
          ) && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-black text-slate-900 uppercase">
                    {activeDoctor.name} — {activeView} Clinical Ledger
                  </h2>
                  <p className="text-xs text-slate-500">
                    Live operational records synchronized with the hospital database.
                  </p>
                </div>
                <button
                  onClick={handleAddLedgerRow}
                  className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Entry</span>
                </button>
              </div>

              {ledgerRecords.length === 0 ? (
                <div className="py-12 text-center text-xs font-bold text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  No records registered in this ledger. Click "+ Add Entry" to create one.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 text-[10px] font-black uppercase tracking-wider">
                        <th className="py-2.5 px-3">Ref ID</th>
                        <th className="py-2.5 px-3">Subject / Name</th>
                        <th className="py-2.5 px-3">Assigned Consultant</th>
                        <th className="py-2.5 px-3">Recorded Date</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {ledgerRecords.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-2.5 px-3 font-mono font-bold text-teal-800">
                            {item.reference_id}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-slate-900">{item.col1}</td>
                          <td className="py-2.5 px-3 text-slate-600">{item.col2 || "General"}</td>
                          <td className="py-2.5 px-3 text-slate-500">{item.col3 || "-"}</td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {item.status || "Active"}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={() => handleDeleteLedgerRow(item.id)}
                              className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                              title="Delete record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* VIEW: Medical Certificates */}
          {activeView === "certificates" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              {React.createElement(CertificatesView as any, {
                doctorName: activeDoctor.name,
                doctorId: activeDoctor.id,
                onClose: () => setActiveView("opd"),
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}