"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSharedPatients, deleteSharedPatient, saveSharedPatient, SharedPatient } from "@/lib/sync/patientsSync";
import { getSharedAppointments, deleteSharedAppointment, SharedAppointment } from "@/lib/sync/appointmentsSync";
import { getLiveModuleRecords, saveLiveModuleRecord, deleteLiveModuleRecord, UnifiedRecord } from "@/lib/sync/hospitalMasterSync";
import RegistrationView from "@/components/dashboard/shared/RegistrationView";
import AppointmentsView from "@/components/dashboard/shared/AppointmentsView";
import CertificatesView from "@/components/dashboard/shared/CertificatesView";
import {
  Activity,
  Users,
  Calendar,
  Receipt,
  BedDouble,
  FileCheck,
  UserCheck,
  RotateCw,
  Power,
  Lock,
  Plus,
  Trash2,
  Car,
  LogOut,
  ShieldCheck,
  Search,
} from "lucide-react";

export default function SupportDashboardPage() {
  const router = useRouter();

  const [activeOfficer, setActiveOfficer] = useState<{ name: string; email: string } | null>(null);
  const [authorized, setAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Active module navigation
  const [activeTab, setActiveTab] = useState<
    | "registration"
    | "appointments"
    | "billing"
    | "ipd"
    | "discharge"
    | "visitor"
    | "certificates"
    | "utility"
  >("registration");

  const [patients, setPatients] = useState<SharedPatient[]>([]);
  const [appointments, setAppointments] = useState<SharedAppointment[]>([]);
  const [ledgerRecords, setLedgerRecords] = useState<UnifiedRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);

  // Authentication & Session Verification
  useEffect(() => {
    async function verifyAccess() {
      const sessionEmail = sessionStorage.getItem("staff_email");
      const sessionRole = sessionStorage.getItem("staff_role");

      if (!sessionEmail || (sessionRole !== "support" && sessionRole !== "admin")) {
        setAuthorized(false);
        setCheckingAuth(false);
        router.replace("/?login=support");
        return;
      }

      // Resolve live officer name from database
      const staffList = await getLiveModuleRecords("SUPPORT_STAFF");
      const matched = staffList.find((s) => s.col3?.toLowerCase() === sessionEmail.toLowerCase());

      setActiveOfficer({
        name: matched ? matched.col1 : "Support Executive",
        email: sessionEmail,
      });

      setAuthorized(true);
      setCheckingAuth(false);
    }

    verifyAccess();
  }, [router]);

  const loadData = async () => {
    setIsSyncing(true);
    try {
      const [patData, apptData] = await Promise.all([
        getSharedPatients(),
        getSharedAppointments(),
      ]);
      setPatients(patData);
      setAppointments(apptData);

      // Map support sub-ledgers to module keys
      const moduleMap: Record<string, string> = {
        billing: "BILLING",
        ipd: "IPD",
        discharge: "DISCHARGE",
        visitor: "VISITOR",
        utility: "UTILITY",
      };

      if (moduleMap[activeTab]) {
        const records = await getLiveModuleRecords(moduleMap[activeTab]);
        setLedgerRecords(records);
      }
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (authorized) {
      loadData();
    }
  }, [authorized, activeTab]);

  const handleExit = () => {
    sessionStorage.removeItem("staff_email");
    sessionStorage.removeItem("staff_role");
    router.push("/");
  };

  const handleAddLedgerRow = async () => {
    const moduleMap: Record<string, string> = {
      billing: "BILLING",
      ipd: "IPD",
      discharge: "DISCHARGE",
      visitor: "VISITOR",
      utility: "UTILITY",
    };

    const targetModule = moduleMap[activeTab];
    if (!targetModule) return;

    const col1 = prompt(`Enter Subject / Patient Name for ${targetModule}:`);
    if (!col1) return;
    const col2 = prompt("Enter Description / Particulars (e.g. Ward / Invoice / Purpose):") || "General";
    const col3 = prompt("Enter Contact Number or Amount (₹):") || "-";

    await saveLiveModuleRecord(targetModule, {
      col1: col1.trim(),
      col2: col2.trim(),
      col3: col3.trim(),
      col4: activeOfficer?.name || "Support Staff",
      status: "Active",
    });

    loadData();
  };

  const handleDeleteLedgerRow = async (id: string) => {
    const moduleMap: Record<string, string> = {
      billing: "BILLING",
      ipd: "IPD",
      discharge: "DISCHARGE",
      visitor: "VISITOR",
      utility: "UTILITY",
    };

    const targetModule = moduleMap[activeTab];
    if (!targetModule || !confirm("Delete this entry?")) return;

    await deleteLiveModuleRecord(targetModule, id);
    loadData();
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#07131b] flex items-center justify-center text-white text-xs font-bold font-sans">
        Validating Support Personnel Authorization...
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-[#07131b] flex flex-col items-center justify-center text-white space-y-3 font-sans">
        <Lock className="w-8 h-8 text-rose-500" />
        <h2 className="text-sm font-black">Access Denied: Unauthenticated Session</h2>
        <button
          onClick={() => router.push("/")}
          className="px-4 py-2 bg-teal-600 rounded-xl text-xs font-bold cursor-pointer"
        >
          Return to Hospital Portal
        </button>
      </div>
    );
  }

  const filteredLedger = ledgerRecords.filter(
    (r) =>
      r.col1?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.col2?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.reference_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#07131b] text-slate-200 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-[#050f16] border-b border-slate-800/80 px-6 py-3 flex items-center justify-between z-30 shadow-md">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-teal-700/80 border border-teal-500/30 flex items-center justify-center text-white font-black shadow-xs">
            <Activity className="w-5 h-5 text-teal-300" />
          </div>
          <div>
            <div className="text-xs font-black tracking-tight text-white uppercase">
              GAVANE HOSPITAL & RESEARCH CENTRE
            </div>
            <div className="text-[10px] text-teal-400 font-bold">
              • Front Desk Reception, Patient Registration & Clearance Gateway
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl text-xs text-slate-300">
            <UserCheck className="w-3.5 h-3.5 text-teal-400" />
            <span>
              Logged as: <strong className="text-white">{activeOfficer?.name}</strong> ({activeOfficer?.email})
            </span>
          </div>

          <button
            onClick={handleExit}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Power className="w-3.5 h-3.5" />
            <span>Close / Exit</span>
          </button>
        </div>
      </header>

      {/* Main Frame */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Dark Enterprise Sidebar */}
        <aside className="w-64 bg-[#07131b] border-r border-slate-800/80 flex flex-col justify-between p-3 shrink-0 overflow-y-auto">
          <div className="space-y-1">
            <div className="px-3 py-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
              SUPPORT MODULES
            </div>

            {/* 1. Patient Registration */}
            <button
              onClick={() => setActiveTab("registration")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "registration"
                  ? "bg-teal-600 text-white shadow-sm"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Users className="w-4 h-4" />
                <span>PATIENT REGISTRATION</span>
              </div>
              <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded font-mono">
                {patients.length}
              </span>
            </button>

            {/* 2. OPD Appointments & Queue */}
            <button
              onClick={() => setActiveTab("appointments")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "appointments"
                  ? "bg-teal-600 text-white shadow-sm"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Calendar className="w-4 h-4" />
                <span>OPD APPOINTMENTS & QUEUE</span>
              </div>
              <span className="text-[10px] bg-teal-950 text-teal-300 border border-teal-700/50 px-1.5 py-0.5 rounded font-mono">
                {appointments.length}
              </span>
            </button>

            {/* 3. Front Desk Billing & UPI */}
            <button
              onClick={() => setActiveTab("billing")}
              className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "billing"
                  ? "bg-teal-600 text-white shadow-sm"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>FRONT DESK BILLING & UPI</span>
            </button>

            {/* 4. IPD Admissions & Beds */}
            <button
              onClick={() => setActiveTab("ipd")}
              className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "ipd"
                  ? "bg-teal-600 text-white shadow-sm"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
              }`}
            >
              <BedDouble className="w-4 h-4" />
              <span>IPD ADMISSIONS & BEDS</span>
            </button>

            {/* 5. Discharge Clearance Desk */}
            <button
              onClick={() => setActiveTab("discharge")}
              className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "discharge"
                  ? "bg-teal-600 text-white shadow-sm"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
              }`}
            >
              <LogOut className="w-4 h-4" />
              <span>DISCHARGE CLEARANCE DESK</span>
            </button>

            {/* 6. Visitor & Attendant Pass */}
            <button
              onClick={() => setActiveTab("visitor")}
              className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "visitor"
                  ? "bg-teal-600 text-white shadow-sm"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>VISITOR & ATTENDANT PASS</span>
            </button>

            {/* 7. Medical Certificates */}
            <button
              onClick={() => setActiveTab("certificates")}
              className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "certificates"
                  ? "bg-teal-600 text-white shadow-sm"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
              }`}
            >
              <FileCheck className="w-4 h-4" />
              <span>MEDICAL CERTIFICATES</span>
            </button>

            {/* 8. Utility & Fleet Operations */}
            <button
              onClick={() => setActiveTab("utility")}
              className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "utility"
                  ? "bg-teal-600 text-white shadow-sm"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
              }`}
            >
              <Car className="w-4 h-4" />
              <span>UTILITY & FLEET</span>
            </button>
          </div>

          <div className="pt-4 border-t border-slate-800/60 text-[10px] text-slate-400 space-y-0.5">
            <div className="font-bold text-slate-300">SHOURYA TECHNOLOGIES</div>
            <div>Hadapsar, Pune, Maharashtra.</div>
            <div>Contact: +91 9860043213</div>
          </div>
        </aside>

        {/* Right Main Canvas */}
        <main className="flex-1 bg-slate-100 p-6 overflow-y-auto">
          {/* Top Status Bar */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 mb-5 flex items-center justify-between shadow-2xs">
            <div className="flex items-center space-x-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-slate-700">
                Active Workspace: <strong className="text-teal-700 uppercase">{activeTab}</strong>
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={loadData}
                disabled={isSyncing}
                className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer shadow-2xs"
              >
                <RotateCw className={`w-3.5 h-3.5 text-teal-600 ${isSyncing ? "animate-spin" : ""}`} />
                <span>Sync Live Data</span>
              </button>

              {["billing", "ipd", "discharge", "visitor", "utility"].includes(activeTab) && (
                <button
                  onClick={handleAddLedgerRow}
                  className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Record</span>
                </button>
              )}
            </div>
          </div>

          {/* VIEW: 1. PATIENT REGISTRATION */}
          {activeTab === "registration" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <RegistrationView
                patients={patients}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onOpenEditPatient={() => {}}
                onDeletePatient={async (id) => {
                  if (confirm("Delete patient registration?")) {
                    await deleteSharedPatient(id);
                    loadData();
                  }
                }}
              />
            </div>
          )}

          {/* VIEW: 2. OPD APPOINTMENTS & QUEUE */}
          {activeTab === "appointments" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <AppointmentsView
                appointments={appointments}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onDeleteAppointment={async (id) => {
                  if (confirm("Cancel this appointment?")) {
                    await deleteSharedAppointment(id);
                    loadData();
                  }
                }}
                onRefresh={loadData}
              />
            </div>
          )}

          {/* VIEW: 3, 4, 5, 6, 8. DYNAMIC SUPPORT LEDGERS (BILLING, IPD, DISCHARGE, VISITOR, UTILITY) */}
          {["billing", "ipd", "discharge", "visitor", "utility"].includes(activeTab) && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase">
                    {activeTab === "billing"
                      ? "Front Desk Billing & UPI Payment Gateway"
                      : activeTab === "ipd"
                      ? "Inpatient (IPD) Admission & Bed Tracking"
                      : activeTab === "discharge"
                      ? "Discharge Clearance & Medical Summary Desk"
                      : activeTab === "visitor"
                      ? "Visitor & Attendant Gate Pass Registry"
                      : "Hospital Utility & Ambulance Fleet Registry"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Live operational records synchronized across hospital workstations.
                  </p>
                </div>

                <div className="relative w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search ledger..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">Ref ID</th>
                      <th className="py-2.5 px-3">Subject / Patient Name</th>
                      <th className="py-2.5 px-3">Description / Ward / Particulars</th>
                      <th className="py-2.5 px-3">Contact / Amount</th>
                      <th className="py-2.5 px-3">Processed By</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Controls</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {filteredLedger.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400 text-xs italic">
                          No records active in this module. Click "+ Add Record" to create an entry.
                        </td>
                      </tr>
                    ) : (
                      filteredLedger.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-2.5 px-3 font-mono font-bold text-teal-800">
                            {item.reference_id}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-slate-900">{item.col1}</td>
                          <td className="py-2.5 px-3 text-slate-600">{item.col2 || "-"}</td>
                          <td className="py-2.5 px-3 font-mono text-teal-700 font-bold">
                            {item.col3 || "-"}
                          </td>
                          <td className="py-2.5 px-3 text-slate-500">{item.col4 || "Support"}</td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {item.status || "Active"}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={() => handleDeleteLedgerRow(item.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                              title="Delete entry"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW: 7. MEDICAL CERTIFICATES */}
          {activeTab === "certificates" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              {React.createElement(CertificatesView as any, {
                doctorName: activeOfficer?.name || "Support Clearance Desk",
                doctorId: "support-desk",
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}