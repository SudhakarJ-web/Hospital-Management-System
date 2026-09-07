"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { SharedDoctor, getSharedDoctors } from "@/lib/sync/doctorsSync";
import { SharedPatient, getSharedPatients } from "@/lib/sync/patientsSync";
import { SharedPrescription, getSharedPrescriptions, dispensePrescription } from "@/lib/sync/prescriptionsSync";
import { SharedAppointment, getSharedAppointments } from "@/lib/sync/appointmentsSync";
import DoctorClinicalForm from "@/components/dashboard/DoctorClinicalForm";
import PrescriptionDispensary from "@/components/dashboard/shared/PrescriptionDispensary";
import RegistrationView from "@/components/dashboard/shared/RegistrationView";
import AppointmentsView from "@/components/dashboard/shared/AppointmentsView";
import {
  Stethoscope,
  Users,
  Calendar,
  Pill,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Filter,
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
  const [loading, setLoading] = useState(true);

  // Tab Navigation
  const [activeTab, setActiveTab] = useState<"clinical" | "patients" | "appointments" | "prescriptions">("clinical");
  const [showAllHospitalPatients, setShowAllHospitalPatients] = useState(false);

  // Search Filters
  const [patientSearch, setPatientSearch] = useState("");
  const [appointmentSearch, setAppointmentSearch] = useState("");
  const [prescriptionSearch, setPrescriptionSearch] = useState("");

  // Notification Banner
  const [notification, setNotification] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadDashboardData = async () => {
    try {
      const [doctorsList, patientsData, rxData, apptData] = await Promise.all([
        getSharedDoctors(),
        getSharedPatients(),
        getSharedPrescriptions(),
        getSharedAppointments(),
      ]);

      const matchedDoctor = doctorsList.find(
        (d) =>
          d.slug === doctorSlug ||
          d.slug === `doctor-${doctorSlug}` ||
          doctorSlug?.includes(d.slug)
      );

      if (!matchedDoctor) {
        console.warn("Doctor slug not matched:", doctorSlug);
        setNotification({
          type: "error",
          text: `Doctor record for "${doctorSlug}" was not found.`,
        });
        setLoading(false);
        return;
      }

      setActiveDoctor(matchedDoctor);
      setAllPatients(patientsData);
      setAllPrescriptions(rxData);
      setAllAppointments(apptData);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Database connection failed";
      setNotification({ type: "error", text: msg });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (doctorSlug) {
      loadDashboardData();
    } else {
      setLoading(false);
    }
  }, [doctorSlug]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white space-y-3 font-sans">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold tracking-wider uppercase text-slate-400">
          Loading Clinical EHR Console...
        </p>
      </div>
    );
  }

  if (!activeDoctor) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 text-slate-700 p-4 space-y-3">
        <AlertCircle className="w-10 h-10 text-rose-500" />
        <h2 className="text-base font-black text-slate-900">Physician Profile Not Located</h2>
        <p className="text-xs text-slate-500">Route slug: {doctorSlug}</p>
        <button
          onClick={() => router.push("/")}
          className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold"
        >
          Return to Hospital Portal
        </button>
      </div>
    );
  }

  // Doctor Caseload Filtering Logic
  const assignedPatients = allPatients.filter((p) => {
    if (p.doctor_id && p.doctor_id === activeDoctor.id) return true;
    if (p.assigned_doctor && p.assigned_doctor.toLowerCase().includes(activeDoctor.name.toLowerCase())) return true;
    return false;
  });

  const assignedAppointments = allAppointments.filter((a) => {
    if (a.doctor_id && a.doctor_id === activeDoctor.id) return true;
    if (a.assigned_doctor && a.assigned_doctor.toLowerCase().includes(activeDoctor.name.toLowerCase())) return true;
    return false;
  });

  const clinicalPatientsPool = showAllHospitalPatients
    ? allPatients
    : assignedPatients.length > 0
    ? assignedPatients
    : allPatients;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-800 font-sans">
      {/* Top Header */}
      <header className="bg-slate-900 text-white px-4 sm:px-8 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="flex items-center space-x-3.5">
          <img
            src={activeDoctor.image || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80"}
            alt={activeDoctor.name}
            className="w-11 h-11 rounded-2xl object-cover border-2 border-teal-500 shadow-sm bg-slate-800"
          />
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-black tracking-tight text-white">
                {activeDoctor.name.startsWith("Dr.") ? activeDoctor.name : `Dr. ${activeDoctor.name}`}
              </h1>
              <span className="text-[10px] font-mono bg-teal-950 text-teal-300 border border-teal-800 px-2 py-0.5 rounded">
                Ref: {activeDoctor.reference_id}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              {activeDoctor.degree} • <strong className="text-teal-400">{activeDoctor.department}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5 self-end sm:self-auto">
          <div className="hidden lg:flex items-center space-x-1.5 text-[11px] bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
            <span>DPDP Encrypted Physician Desk</span>
          </div>

          <button
            onClick={() => router.push("/")}
            className="px-3.5 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Exit Workspace</span>
          </button>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-8 flex flex-wrap items-center justify-between gap-2 shadow-2xs">
        <div className="flex space-x-2 sm:space-x-6 text-xs font-extrabold uppercase tracking-wider overflow-x-auto">
          <button
            onClick={() => setActiveTab("clinical")}
            className={`py-3.5 border-b-2 flex items-center space-x-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "clinical"
                ? "border-teal-600 text-teal-700 font-black"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>OPD Clinical Chart</span>
          </button>

          <button
            onClick={() => setActiveTab("patients")}
            className={`py-3.5 border-b-2 flex items-center space-x-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "patients"
                ? "border-teal-600 text-teal-700 font-black"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>My Patient Caseload ({assignedPatients.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("appointments")}
            className={`py-3.5 border-b-2 flex items-center space-x-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "appointments"
                ? "border-teal-600 text-teal-700 font-black"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Booked Appointments ({assignedAppointments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("prescriptions")}
            className={`py-3.5 border-b-2 flex items-center space-x-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "prescriptions"
                ? "border-teal-600 text-teal-700 font-black"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Pill className="w-4 h-4" />
            <span>Dispensary Queue</span>
          </button>
        </div>

        {activeTab === "clinical" && (
          <button
            onClick={() => setShowAllHospitalPatients(!showAllHospitalPatients)}
            className={`text-[11px] font-bold px-3 py-1.5 rounded-xl border transition-all flex items-center space-x-1.5 cursor-pointer my-2 sm:my-0 ${
              showAllHospitalPatients
                ? "bg-teal-50 border-teal-500 text-teal-800"
                : "bg-slate-50 border-slate-300 text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>
              {showAllHospitalPatients
                ? "Viewing All Hospital Patients"
                : `Filtering My Caseload (${assignedPatients.length})`}
            </span>
          </button>
        )}
      </div>

      {/* Notification Banner */}
      {notification && (
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-8 mt-4">
          <div
            className={`p-3.5 rounded-2xl text-xs font-bold flex items-center justify-between border shadow-xs animate-in fade-in duration-150 ${
              notification.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-rose-50 border-rose-200 text-rose-800"
            }`}
          >
            <div className="flex items-center space-x-2">
              {notification.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600" />
              )}
              <span>{notification.text}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-xs font-bold underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Workspace Body */}
      <main className="p-4 sm:p-8 flex-1 max-w-7xl w-full mx-auto space-y-6">
        {activeTab === "clinical" && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
            <DoctorClinicalForm
              doctorName={activeDoctor.name}
              doctorId={activeDoctor.id}
              patients={clinicalPatientsPool}
              onSuccess={(msg) => {
                setNotification({ type: "success", text: msg });
                loadDashboardData();
              }}
              onError={(msg) => setNotification({ type: "error", text: msg })}
            />
          </div>
        )}

        {activeTab === "patients" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  Patient Records Registered Under {activeDoctor.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Showing patients explicitly assigned to your clinical roster.
                </p>
              </div>
              <span className="text-xs font-extrabold text-teal-700 bg-teal-50 border border-teal-200 px-3 py-1 rounded-xl">
                {assignedPatients.length} Active Records
              </span>
            </div>

            <RegistrationView
              patients={assignedPatients}
              searchTerm={patientSearch}
              onSearchChange={setPatientSearch}
              onOpenEditPatient={() => {}}
              onDeletePatient={() => {}}
            />
          </div>
        )}

        {activeTab === "appointments" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  Direct Outpatient Appointments for {activeDoctor.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Bookings scheduled via the online public portal.
                </p>
              </div>
              <span className="text-xs font-extrabold text-teal-700 bg-teal-50 border border-teal-200 px-3 py-1 rounded-xl">
                {assignedAppointments.length} Bookings
              </span>
            </div>

            <AppointmentsView
              appointments={assignedAppointments}
              searchTerm={appointmentSearch}
              onSearchChange={setAppointmentSearch}
              onDeleteAppointment={() => {}}
            />
          </div>
        )}

        {activeTab === "prescriptions" && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <h3 className="text-sm font-black text-slate-900">
                Hospital Pharmacy & Consultation Transmissions
              </h3>
              <p className="text-xs text-slate-500">
                Live view of all prescription orders transmitted across hospital OPD departments.
              </p>
            </div>

            <PrescriptionDispensary
              prescriptions={allPrescriptions}
              searchTerm={prescriptionSearch}
              onSearchChange={setPrescriptionSearch}
              onDispense={async (id) => {
                await dispensePrescription(id, activeDoctor.name);
                loadDashboardData();
              }}
            />
          </div>
        )}
      </main>
    </div>
  );
}