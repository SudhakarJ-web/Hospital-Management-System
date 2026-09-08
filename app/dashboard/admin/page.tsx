"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SharedDoctor, getSharedDoctors, deleteSharedDoctor } from "@/lib/sync/doctorsSync";
import { SharedAppointment, getSharedAppointments, deleteSharedAppointment } from "@/lib/sync/appointmentsSync";
import { SharedPatient, getSharedPatients, deleteSharedPatient } from "@/lib/sync/patientsSync";
import { SharedPrescription, getSharedPrescriptions } from "@/lib/sync/prescriptionsSync";
import { getLiveModuleRecords, deleteLiveModuleRecord, UnifiedRecord } from "@/lib/sync/hospitalMasterSync";
import AppointmentsView from "@/components/dashboard/shared/AppointmentsView";
import RegistrationView from "@/components/dashboard/shared/RegistrationView";
import PrescriptionDispensary from "@/components/dashboard/shared/PrescriptionDispensary";
import CertificatesView from "@/components/dashboard/shared/CertificatesView";
import AdminDoctorModal from "@/components/dashboard/admin/AdminDoctorModal";
import StaffRegistrationModal from "@/components/dashboard/admin/StaffRegistrationModal";
import {
  Activity,
  Users,
  Calendar,
  Stethoscope,
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
  ShieldAlert,
  RotateCw,
  Power,
  Plus,
  Trash2,
  Edit2,
  HeartHandshake,
  UserCheck,
  Building2,
  Lock,
} from "lucide-react";

export default function AdminDashboardPage() {
  const router = useRouter();

  // Auth Guard States
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [doctors, setDoctors] = useState<SharedDoctor[]>([]);
  const [appointments, setAppointments] = useState<SharedAppointment[]>([]);
  const [patients, setPatients] = useState<SharedPatient[]>([]);
  const [prescriptions, setPrescriptions] = useState<SharedPrescription[]>([]);
  const [medicalStaff, setMedicalStaff] = useState<UnifiedRecord[]>([]);
  const [supportStaff, setSupportStaff] = useState<UnifiedRecord[]>([]);
  const [ledgerRecords, setLedgerRecords] = useState<UnifiedRecord[]>([]);

  const [isSyncing, setIsSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState<
    | "desk"
    | "doctors"
    | "medical_staff"
    | "support_staff"
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
  >("desk");

  // Search & Modal States
  const [searchTerm, setSearchTerm] = useState("");
  const [doctorModalOpen, setDoctorModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<SharedDoctor | null>(null);

  // Staff Registration & Edit Modal
  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [staffModalType, setStaffModalType] = useState<"MEDICAL_STAFF" | "SUPPORT_STAFF">("MEDICAL_STAFF");
  const [selectedStaff, setSelectedStaff] = useState<UnifiedRecord | null>(null);

  // Session Authentication Guard
  useEffect(() => {
    const role = sessionStorage.getItem("staff_role");
    const email = sessionStorage.getItem("staff_email");

    if (role !== "admin" || email !== "admin@gavanehospital.in") {
      setIsAuthorized(false);
      setCheckingAuth(false);
      router.replace("/?login=admin");
      return;
    }

    setIsAuthorized(true);
    setCheckingAuth(false);
  }, [router]);

  const loadData = async () => {
    setIsSyncing(true);
    try {
      const [docData, apptData, patData, rxData, medData, supData] = await Promise.all([
        getSharedDoctors(),
        getSharedAppointments(),
        getSharedPatients(),
        getSharedPrescriptions(),
        getLiveModuleRecords("MEDICAL_STAFF"),
        getLiveModuleRecords("SUPPORT_STAFF"),
      ]);

      setDoctors(docData);
      setAppointments(apptData);
      setPatients(patData);
      setPrescriptions(rxData);
      setMedicalStaff(medData);
      setSupportStaff(supData);

      const moduleMap: Record<string, string> = {
        ipd: "IPD",
        ot: "OT",
        radiology: "RADIOLOGY",
        pathology: "PATHOLOGY",
        pharmacy: "STOCK",
        billing: "BILLING",
        analysis: "ANALYSIS",
        utility: "UTILITY",
      };

      if (moduleMap[activeTab]) {
        const recs = await getLiveModuleRecords(moduleMap[activeTab]);
        setLedgerRecords(recs);
      }
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      loadData();
    }
  }, [isAuthorized, activeTab]);

  const handleExit = () => {
    sessionStorage.removeItem("staff_role");
    sessionStorage.removeItem("staff_email");
    router.push("/");
  };

  const handleDeleteAppointment = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;
    await deleteSharedAppointment(id);
    loadData();
  };

  const handleDeleteDoctor = async (id: string) => {
    if (!confirm("Remove this doctor from the active medical board?")) return;
    await deleteSharedDoctor(id);
    loadData();
  };

  const handleDeleteStaffMember = async (type: "MEDICAL_STAFF" | "SUPPORT_STAFF", id: string) => {
    if (!confirm("Remove staff credential record?")) return;
    await deleteLiveModuleRecord(type, id);
    loadData();
  };

  const openNewStaffModal = (type: "MEDICAL_STAFF" | "SUPPORT_STAFF") => {
    setSelectedStaff(null);
    setStaffModalType(type);
    setStaffModalOpen(true);
  };

  const openEditStaffModal = (type: "MEDICAL_STAFF" | "SUPPORT_STAFF", staff: UnifiedRecord) => {
    setSelectedStaff(staff);
    setStaffModalType(type);
    setStaffModalOpen(true);
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#07131b] flex items-center justify-center text-white text-xs font-bold font-sans">
        Verifying Administrator Access Credentials...
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#07131b] flex flex-col items-center justify-center text-white space-y-3 font-sans">
        <Lock className="w-8 h-8 text-rose-500" />
        <h2 className="text-sm font-black">Access Denied: Unauthenticated Administrator</h2>
        <button
          onClick={() => router.push("/?login=admin")}
          className="px-4 py-2 bg-teal-600 rounded-xl text-xs font-bold cursor-pointer"
        >
          Login via Staff Portal
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07131b] text-slate-200 flex flex-col font-sans">
      {/* Top Administrative Header */}
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
              • Central Administrative & Medical Governance Desk
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl text-xs text-slate-300">
            <ShieldAlert className="w-3.5 h-3.5 text-teal-400" />
            <span>
              Logged as: <strong className="text-white">Hospital Administrator</strong> (admin@gavanehospital.in)
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

      {/* Main Workspace Frame */}
      <div className="flex flex-1 overflow-hidden">
        {/* Dark Enterprise Sidebar */}
        <aside className="w-64 bg-[#07131b] border-r border-slate-800/80 flex flex-col justify-between p-3 shrink-0 overflow-y-auto">
          <div className="space-y-1">
            <div className="px-3 py-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
              ADMINISTRATIVE CONTROL
            </div>

            {/* 1. MASTER EXECUTIVE DESK */}
            <button
              onClick={() => setActiveTab("desk")}
              className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "desk"
                  ? "bg-teal-600 text-white shadow-sm"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>MASTER EXECUTIVE DESK</span>
            </button>

            {/* 2. DOCTORS DIRECTORY */}
            <button
              onClick={() => setActiveTab("doctors")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "doctors"
                  ? "bg-teal-600 text-white shadow-sm"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Stethoscope className="w-4 h-4" />
                <span>DOCTORS DIRECTORY</span>
              </div>
              <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded font-mono">{doctors.length}</span>
            </button>

            {/* 3. MEDICAL DIRECTORY */}
            <button
              onClick={() => setActiveTab("medical_staff")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "medical_staff"
                  ? "bg-teal-600 text-white shadow-sm"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <HeartHandshake className="w-4 h-4" />
                <span>MEDICAL DIRECTORY</span>
              </div>
              <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded font-mono">{medicalStaff.length}</span>
            </button>

            {/* 4. SUPPORT DIRECTORY */}
            <button
              onClick={() => setActiveTab("support_staff")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "support_staff"
                  ? "bg-teal-600 text-white shadow-sm"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <UserCheck className="w-4 h-4" />
                <span>SUPPORT DIRECTORY</span>
              </div>
              <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded font-mono">{supportStaff.length}</span>
            </button>

            {/* 5. ONLINE APPOINTMENTS */}
            <button
              onClick={() => setActiveTab("appointments")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "appointments"
                  ? "bg-teal-600 text-white shadow-sm"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Calendar className="w-4 h-4" />
                <span>ONLINE APPOINTMENTS</span>
              </div>
              <span className="text-[10px] bg-teal-950 text-teal-300 border border-teal-700/50 px-1.5 py-0.5 rounded font-mono">
                {appointments.length}
              </span>
            </button>

            {/* 6. PATIENT REGISTRATION */}
            <button
              onClick={() => setActiveTab("registration")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "registration"
                  ? "bg-teal-600 text-white shadow-sm"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Users className="w-4 h-4" />
                <span>PATIENT REGISTRATION</span>
              </div>
              <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded font-mono">{patients.length}</span>
            </button>

            {/* 7. PRESCRIPTION DISPENSARY */}
            <button
              onClick={() => setActiveTab("dispensary")}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "dispensary"
                  ? "bg-teal-600 text-white shadow-sm"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
              }`}
            >
              <Pill className="w-4 h-4" />
              <span>PRESCRIPTION DISPENSARY</span>
            </button>

            <div className="pt-2 px-3 pb-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
              HOSPITAL LEDGERS
            </div>

            <button
              onClick={() => setActiveTab("ipd")}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                activeTab === "ipd" ? "bg-teal-600 text-white" : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
              }`}
            >
              <BedDouble className="w-4 h-4" />
              <span>IPD (IN-PATIENT)</span>
            </button>

            <button
              onClick={() => setActiveTab("ot")}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                activeTab === "ot" ? "bg-teal-600 text-white" : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
              }`}
            >
              <Scissors className="w-4 h-4" />
              <span>OT (OPERATION THEATRE)</span>
            </button>

            <button
              onClick={() => setActiveTab("radiology")}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                activeTab === "radiology" ? "bg-teal-600 text-white" : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
              }`}
            >
              <Scan className="w-4 h-4" />
              <span>RADIOLOGY</span>
            </button>

            <button
              onClick={() => setActiveTab("pathology")}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                activeTab === "pathology" ? "bg-teal-600 text-white" : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
              }`}
            >
              <FlaskConical className="w-4 h-4" />
              <span>PATHOLOGY</span>
            </button>

            <button
              onClick={() => setActiveTab("pharmacy")}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                activeTab === "pharmacy" ? "bg-teal-600 text-white" : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
              }`}
            >
              <Boxes className="w-4 h-4" />
              <span>PHARMACY STOCK</span>
            </button>

            <button
              onClick={() => setActiveTab("billing")}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                activeTab === "billing" ? "bg-teal-600 text-white" : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>BILLING LEDGER</span>
            </button>

            <button
              onClick={() => setActiveTab("analysis")}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                activeTab === "analysis" ? "bg-teal-600 text-white" : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>ANALYSIS SYSTEM</span>
            </button>

            <button
              onClick={() => setActiveTab("utility")}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                activeTab === "utility" ? "bg-teal-600 text-white" : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span>UTILITY</span>
            </button>

            <button
              onClick={() => setActiveTab("certificates")}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                activeTab === "certificates" ? "bg-teal-600 text-white" : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
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
          {/* Top Status Bar */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 mb-5 flex items-center justify-between shadow-2xs">
            <div className="flex items-center space-x-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-slate-700">
                Live Node: <strong className="text-teal-700 font-mono">Supabase DB Cluster</strong>
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-500">
                Registered Specialists: <strong>{doctors.length}</strong>
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={loadData}
                disabled={isSyncing}
                className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer shadow-2xs"
              >
                <RotateCw className={`w-3.5 h-3.5 text-teal-600 ${isSyncing ? "animate-spin" : ""}`} />
                <span>Sync Live</span>
              </button>
            </div>
          </div>

          {/* VIEW: MASTER EXECUTIVE DESK */}
          {activeTab === "desk" && (
            <div className="space-y-6">
              {/* Executive Overview KPI Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider">Medical Board</span>
                    <Stethoscope className="w-4 h-4 text-teal-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">{doctors.length} Specialists</div>
                  <p className="text-[11px] text-teal-700 font-semibold">Active Credentialed Doctors</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider">Clinical Staff</span>
                    <HeartHandshake className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">{medicalStaff.length} Officers</div>
                  <p className="text-[11px] text-blue-700 font-semibold">RMOs & Nursing Staff</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider">Support Operations</span>
                    <UserCheck className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">{supportStaff.length} Personnel</div>
                  <p className="text-[11px] text-amber-700 font-semibold">Billing, OT, Pharmacy & Triage</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider">Online Appointments</span>
                    <Calendar className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">{appointments.length} Consultations</div>
                  <p className="text-[11px] text-emerald-700 font-semibold">Live Web Bookings</p>
                </div>
              </div>

              {/* Fast Actions */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Executive Fast Actions
                </h3>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      setSelectedDoctor(null);
                      setDoctorModalOpen(true);
                    }}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Specialist Doctor</span>
                  </button>
                  <button
                    onClick={() => openNewStaffModal("MEDICAL_STAFF")}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center space-x-1.5 cursor-pointer"
                  >
                    <HeartHandshake className="w-3.5 h-3.5 text-teal-400" />
                    <span>+ Register Medical Staff</span>
                  </button>
                  <button
                    onClick={() => openNewStaffModal("SUPPORT_STAFF")}
                    className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center space-x-1.5 cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-teal-600" />
                    <span>+ Register Support Staff</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("appointments")}
                    className="px-4 py-2 bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5 text-teal-700" />
                    <span>Manage Outpatient Bookings</span>
                  </button>
                </div>
              </div>

              {/* Consultation Schedule Preview */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Recent Consultation Schedule</h3>
                    <p className="text-xs text-slate-500">Live feed of incoming outpatient bookings.</p>
                  </div>
                  <button
                    onClick={() => setActiveTab("appointments")}
                    className="text-xs font-bold text-teal-700 hover:underline cursor-pointer"
                  >
                    View All {appointments.length} Appointments →
                  </button>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-wider">
                      <tr>
                        <th className="py-2.5 px-3">Ref ID</th>
                        <th className="py-2.5 px-3">Patient Name</th>
                        <th className="py-2.5 px-3">Assigned Physician</th>
                        <th className="py-2.5 px-3">Scheduled Date</th>
                        <th className="py-2.5 px-3">Time Slot</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {appointments.slice(0, 5).map((a) => (
                        <tr key={a.id || a.reference_id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-2.5 px-3 font-mono font-bold text-teal-800">{a.reference_id}</td>
                          <td className="py-2.5 px-3 font-bold text-slate-900">{a.patient_name}</td>
                          <td className="py-2.5 px-3 text-slate-700">{a.assigned_doctor}</td>
                          <td className="py-2.5 px-3 font-mono text-slate-600">{a.appointment_date}</td>
                          <td className="py-2.5 px-3 font-mono text-teal-700 font-bold">{a.time_slot}</td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {a.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: ONLINE APPOINTMENTS */}
          {activeTab === "appointments" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <AppointmentsView
                appointments={appointments}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onDeleteAppointment={handleDeleteAppointment}
                onRefresh={loadData}
              />
            </div>
          )}

          {/* VIEW: DOCTORS DIRECTORY */}
          {activeTab === "doctors" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900">Hospital Medical Board Directory</h3>
                  <p className="text-xs text-slate-500">Manage credentialed consultants, credentials, and fee structures.</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedDoctor(null);
                    setDoctorModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Doctor</span>
                </button>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">Ref ID</th>
                      <th className="py-2.5 px-3">Doctor Profile</th>
                      <th className="py-2.5 px-3">Department</th>
                      <th className="py-2.5 px-3">Official Email</th>
                      <th className="py-2.5 px-3">OPD Fee</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Controls</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {doctors.map((doc) => (
                      <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3 font-mono text-teal-800 font-bold">{doc.reference_id}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-900 flex items-center space-x-2">
                          <img src={doc.image} alt={doc.name} className="w-7 h-7 rounded-full object-cover border border-teal-600" />
                          <span>{doc.name}</span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">{doc.department}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-500">{doc.email}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-teal-700">{doc.fee}</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {doc.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={() => {
                                setSelectedDoctor(doc);
                                setDoctorModalOpen(true);
                              }}
                              className="p-1 text-slate-400 hover:text-teal-600 rounded"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteDoctor(doc.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW: MEDICAL DIRECTORY (WITH EDIT CONTROLS) */}
          {activeTab === "medical_staff" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900">Clinical & Medical Officer Directory</h3>
                  <p className="text-xs text-slate-500">Resident Medical Officers (RMO), Clinical Specialists, and Nursing Superintendents.</p>
                </div>
                <button
                  onClick={() => openNewStaffModal("MEDICAL_STAFF")}
                  className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Register Medical Staff</span>
                </button>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">Credential Ref</th>
                      <th className="py-2.5 px-3">Clinician Name</th>
                      <th className="py-2.5 px-3">Designation / Ward</th>
                      <th className="py-2.5 px-3">Official Login Email</th>
                      <th className="py-2.5 px-3">Registration / Details</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Controls</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {medicalStaff.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400 text-xs italic">
                          No medical officers recorded yet. Click "+ Register Medical Staff" to add clinicians.
                        </td>
                      </tr>
                    ) : (
                      medicalStaff.map((staff) => (
                        <tr key={staff.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-2.5 px-3 font-mono font-bold text-teal-800">{staff.reference_id}</td>
                          <td className="py-2.5 px-3 font-bold text-slate-900">{staff.col1}</td>
                          <td className="py-2.5 px-3 text-teal-700 font-semibold">{staff.col2}</td>
                          <td className="py-2.5 px-3 font-mono text-slate-600">{staff.col3}</td>
                          <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">{staff.col5 || "-"}</td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {staff.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <div className="flex items-center justify-end space-x-1">
                              <button
                                onClick={() => openEditStaffModal("MEDICAL_STAFF", staff)}
                                className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                                title="Edit Staff Member"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteStaffMember("MEDICAL_STAFF", staff.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Delete Staff Member"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW: SUPPORT DIRECTORY (WITH EDIT CONTROLS) */}
          {activeTab === "support_staff" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900">Hospital Support & Operations Directory</h3>
                  <p className="text-xs text-slate-500">Reception triage, billing officers, OT technicians, and ward assistants.</p>
                </div>
                <button
                  onClick={() => openNewStaffModal("SUPPORT_STAFF")}
                  className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Register Support Staff</span>
                </button>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">Credential Ref</th>
                      <th className="py-2.5 px-3">Staff Member</th>
                      <th className="py-2.5 px-3">Position / Department</th>
                      <th className="py-2.5 px-3">Official Login Email</th>
                      <th className="py-2.5 px-3">Staff ID / Details</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Controls</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {supportStaff.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400 text-xs italic">
                          No support staff recorded yet. Click "+ Register Support Staff" to add personnel.
                        </td>
                      </tr>
                    ) : (
                      supportStaff.map((staff) => (
                        <tr key={staff.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-2.5 px-3 font-mono font-bold text-teal-800">{staff.reference_id}</td>
                          <td className="py-2.5 px-3 font-bold text-slate-900">{staff.col1}</td>
                          <td className="py-2.5 px-3 text-slate-700 font-semibold">{staff.col2}</td>
                          <td className="py-2.5 px-3 font-mono text-slate-600">{staff.col3}</td>
                          <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">{staff.col5 || "-"}</td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {staff.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <div className="flex items-center justify-end space-x-1">
                              <button
                                onClick={() => openEditStaffModal("SUPPORT_STAFF", staff)}
                                className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                                title="Edit Staff Member"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteStaffMember("SUPPORT_STAFF", staff.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Delete Staff Member"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW: PATIENT REGISTRATION */}
          {activeTab === "registration" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <RegistrationView
                patients={patients}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onOpenEditPatient={() => {}}
                onDeletePatient={async (id) => {
                  if (confirm("Delete patient record?")) {
                    await deleteSharedPatient(id);
                    loadData();
                  }
                }}
              />
            </div>
          )}

          {/* VIEW: PRESCRIPTION DISPENSARY */}
          {activeTab === "dispensary" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <PrescriptionDispensary
                prescriptions={prescriptions}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onDispense={() => {}}
              />
            </div>
          )}

          {/* VIEW: CERTIFICATES */}
          {activeTab === "certificates" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              {React.createElement(CertificatesView as any, {
                doctorName: "Hospital Medical Superintendent",
                doctorId: "admin",
              })}
            </div>
          )}
        </main>
      </div>

      {/* Admin Doctor Modal */}
      {doctorModalOpen && (
        <AdminDoctorModal
          isOpen={doctorModalOpen}
          doctor={selectedDoctor}
          onClose={() => setDoctorModalOpen(false)}
          onSaved={loadData}
        />
      )}

      {/* Medical & Support Staff Registration and Edit Modal */}
      {staffModalOpen && (
        <StaffRegistrationModal
          isOpen={staffModalOpen}
          type={staffModalType}
          initialRecord={selectedStaff}
          onClose={() => setStaffModalOpen(false)}
          onSuccess={loadData}
        />
      )}
    </div>
  );
}