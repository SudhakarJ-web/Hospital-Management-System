"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSharedPatients, SharedPatient } from "@/lib/sync/patientsSync";
import { getSharedAppointments, SharedAppointment } from "@/lib/sync/appointmentsSync";
import { getLiveModuleRecords, UnifiedRecord } from "@/lib/sync/hospitalMasterSync";
import RegistrationView from "@/components/dashboard/shared/RegistrationView";
import AppointmentsView from "@/components/dashboard/shared/AppointmentsView";
import {
  Activity,
  Users,
  Calendar,
  Receipt,
  BedDouble,
  FileCheck,
  RotateCw,
  Power,
  Lock,
} from "lucide-react";

export default function SupportDashboardPage() {
  const router = useRouter();

  const [activeOfficer, setActiveOfficer] = useState<{ name: string; email: string } | null>(null);
  const [authorized, setAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [activeTab, setActiveTab] = useState<"registration" | "appointments" | "billing" | "ipd">("registration");
  const [patients, setPatients] = useState<SharedPatient[]>([]);
  const [appointments, setAppointments] = useState<SharedAppointment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    async function verifyAccess() {
      const sessionEmail = sessionStorage.getItem("staff_email");
      const sessionRole = sessionStorage.getItem("staff_role");

      if (!sessionEmail || sessionRole !== "support") {
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
            <Activity className="w-3.5 h-3.5 text-teal-400" />
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
        {/* Dark Sidebar */}
        <aside className="w-64 bg-[#07131b] border-r border-slate-800/80 flex flex-col justify-between p-3 shrink-0 overflow-y-auto">
          <div className="space-y-1">
            <div className="px-3 py-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
              SUPPORT MODULES
            </div>

            <button
              onClick={() => setActiveTab("registration")}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "registration"
                  ? "bg-teal-600 text-white shadow-sm"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>PATIENT REGISTRATION</span>
            </button>

            <button
              onClick={() => setActiveTab("appointments")}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "appointments"
                  ? "bg-teal-600 text-white shadow-sm"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>OPD APPOINTMENTS & QUEUE</span>
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
          {activeTab === "registration" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <RegistrationView
                patients={patients}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onOpenEditPatient={() => {}}
                onDeletePatient={() => {}}
              />
            </div>
          )}

          {activeTab === "appointments" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <AppointmentsView
                appointments={appointments}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onDeleteAppointment={() => {}}
                onRefresh={loadData}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}