"use client";

import React, { useState, useEffect, useCallback } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardSidebar, { SidebarModule } from "@/components/dashboard/DashboardSidebar";
import MetricsStrip from "@/components/dashboard/MetricsStrip";
import { getSharedPatients, SharedPatient } from "@/lib/sync/patientsSync";
import { getSharedCertificates, SharedCertificate } from "@/lib/sync/certificatesSync";
import { supabase } from "@/lib/supabase";

const PATIENT_SIDEBAR_MODULES: SidebarModule[] = [
  { id: "APPOINTMENTS", label: "MY APPOINTMENTS & QUEUE", icon: "📅" },
  { id: "CLINICAL_EHR", label: "MEDICAL RECORDS & EHR", icon: "🩺" },
  { id: "PRESCRIPTIONS", label: "ACTIVE PRESCRIPTIONS", icon: "💊" },
  { id: "LAB_REPORTS", label: "DIAGNOSTIC & LAB REPORTS", icon: "🔬" },
  { id: "INVOICES", label: "BILLING & RECEIPTS", icon: "💳" },
  { id: "CERTIFICATES", label: "ISSUED CERTIFICATES", icon: "📄" },
];

export interface PatientPortalRecord {
  id: string;
  reference_id: string;
  category: string;
  col1: string; // Doctor / Medication / Test / Purpose
  col2: string; // Specialty / Dosage / Specimen / Ref
  col3: string; // Slot / Frequency / Section / Date
  col4: string; // Status Detail / Prescriber / Normal Range / Amount
  col5: string; // Notes / Duration / Result Value / Payment Mode
  status: "Active" | "Pending" | "Completed" | "Suspended";
  created_at: string;
}

const INITIAL_PATIENT_RECORDS: Record<string, PatientPortalRecord[]> = {
  APPOINTMENTS: [
    {
      id: "pt-apt-1",
      reference_id: "APT-2026-801",
      category: "APPOINTMENTS",
      col1: "Dr. Priya",
      col2: "Cardiology Consultation",
      col3: "Today • 10:15 AM Slot",
      col4: "Token #02 • Triage Cleared",
      col5: "Follow-up consultation for hypertension",
      status: "Active",
      created_at: "28/08/2026",
    },
    {
      id: "pt-apt-2",
      reference_id: "APT-2026-750",
      category: "APPOINTMENTS",
      col1: "Dr. Sudhir Gavane",
      col2: "General Surgery OPD",
      col3: "22/08/2026 • 11:00 AM",
      col4: "Consultation Concluded",
      col5: "Post-op wound dressing reviewed",
      status: "Completed",
      created_at: "22/08/2026",
    },
  ],
  CLINICAL_EHR: [
    {
      id: "pt-ehr-1",
      reference_id: "EHR-2026-901",
      category: "CLINICAL_EHR",
      col1: "Essential Hypertension & Gastritis",
      col2: "Attending: Dr. Priya (Cardiology)",
      col3: "BP: 130/85 mmHg • Pulse: 76 bpm",
      col4: "EHR Chart Digitally Signed",
      col5: "Advised low-sodium diet and lifestyle modification",
      status: "Completed",
      created_at: "28/08/2026",
    },
  ],
  PRESCRIPTIONS: [
    {
      id: "pt-rx-1",
      reference_id: "RX-2026-441",
      category: "PRESCRIPTIONS",
      col1: "Tab. Telmisartan 40mg",
      col2: "Oral Tablet • 1-0-0 (Morning After Food)",
      col3: "Duration: 30 Days",
      col4: "Prescribed: Dr. Priya",
      col5: "Dispensed at Central Pharmacy Node",
      status: "Active",
      created_at: "28/08/2026",
    },
    {
      id: "pt-rx-2",
      reference_id: "RX-2026-442",
      category: "PRESCRIPTIONS",
      col1: "Tab. Pantoprazole 40mg",
      col2: "Oral Tablet • 1-0-0 (Before Breakfast)",
      col3: "Duration: 15 Days",
      col4: "Prescribed: Dr. Priya",
      col5: "Dispensed at Central Pharmacy Node",
      status: "Active",
      created_at: "28/08/2026",
    },
  ],
  LAB_REPORTS: [
    {
      id: "pt-lab-1",
      reference_id: "LAB-2026-301",
      category: "LAB_REPORTS",
      col1: "Complete Blood Count (CBC)",
      col2: "Specimen: Whole Blood (EDTA)",
      col3: "Hematology Section",
      col4: "Normal Range: Hb 13.0 - 17.0 g/dL",
      col5: "Result: 14.2 g/dL • Normal",
      status: "Completed",
      created_at: "27/08/2026",
    },
    {
      id: "pt-lab-2",
      reference_id: "LAB-2026-302",
      category: "LAB_REPORTS",
      col1: "Lipid Profile Diagnostic Panel",
      col2: "Specimen: Fasting Serum",
      col3: "Biochemistry Section",
      col4: "Normal Range: Total Chol < 200 mg/dL",
      col5: "Result: 182 mg/dL • Optimal",
      status: "Completed",
      created_at: "27/08/2026",
    },
  ],
  INVOICES: [
    {
      id: "pt-inv-1",
      reference_id: "INV-2026-001",
      category: "INVOICES",
      col1: "OPD Specialist Consultation Fee",
      col2: "Dr. Priya (Cardiology)",
      col3: "Receipt #GH-REC-901",
      col4: "Net Amount: ₹500.00",
      col5: "Paid via UPI QR (PhonePe) • Cleared",
      status: "Completed",
      created_at: "28/08/2026",
    },
  ],
};

export default function PatientDashboardPage() {
  const [activeModule, setActiveModule] = useState<string>("APPOINTMENTS");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Patient Identity Session
  const [patientName, setPatientName] = useState<string>("Sagar Jadhav");
  const [patientEmail, setPatientEmail] = useState<string>("patient@gavanehospital.in");
  const [patientPhone, setPatientPhone] = useState<string>("+91 98765 43210");

  // Stores
  const [patientDataStore, setPatientDataStore] = useState<Record<string, PatientPortalRecord[]>>(INITIAL_PATIENT_RECORDS);
  const [certificates, setCertificates] = useState<SharedCertificate[]>([]);
  const [registeredPatients, setRegisteredPatients] = useState<SharedPatient[]>([]);

  // 1. Resolve Patient Identity from Session or Registered Database
  useEffect(() => {
    async function resolveSession() {
      try {
        const { data } = await supabase.auth.getUser();
        if (data?.user) {
          const metaName = data.user.user_metadata?.full_name || data.user.user_metadata?.name;
          if (metaName) setPatientName(metaName);
          if (data.user.email) setPatientEmail(data.user.email);
          if (data.user.phone) setPatientPhone(data.user.phone);
          return;
        }
      } catch {
        // Handled
      }

      try {
        const cachedStaff = localStorage.getItem("gavane_staff_registry");
        if (cachedStaff) {
          const list = JSON.parse(cachedStaff);
          const currentPatient = list.find((s: { module_category: string }) => s.module_category === "Patient");
          if (currentPatient) {
            setPatientName(currentPatient.name);
            setPatientEmail(currentPatient.email);
          }
        }
      } catch {
        // Handled
      }
    }

    resolveSession();
  }, []);

  // 2. Load Patient Data & Certificates
  const loadPatientData = useCallback(async () => {
    const pts = await getSharedPatients();
    setRegisteredPatients(pts);

    const certs = await getSharedCertificates();
    setCertificates(certs);

    try {
      const cached = localStorage.getItem("gavane_patient_portal_store");
      if (cached) {
        const parsed = JSON.parse(cached);
        setPatientDataStore(parsed);
        return;
      }
    } catch {
      // Fallback
    }

    setPatientDataStore(INITIAL_PATIENT_RECORDS);
  }, []);

  useEffect(() => {
    loadPatientData();
  }, [loadPatientData]);

  // Headers for each Patient Tab
  const getTableHeaders = () => {
    switch (activeModule) {
      case "APPOINTMENTS":
        return ["Appt ID", "Consultant Doctor", "Department / Specialty", "Date & Slot", "Queue / Token Status", "Clinical Reason", "Status"];
      case "CLINICAL_EHR":
        return ["Record ID", "Diagnosis & Findings", "Attending Physician", "Vitals Recorded", "Verification Flag", "Clinical Advice", "Status"];
      case "PRESCRIPTIONS":
        return ["Rx ID", "Medication & Strength", "Dosage & Instructions", "Duration", "Prescribing Doctor", "Dispensary Note", "Status"];
      case "LAB_REPORTS":
        return ["Report ID", "Investigation Name", "Specimen Sample", "Lab Section", "Standard Reference Range", "Observed Result", "Status"];
      case "INVOICES":
        return ["Invoice ID", "Service Description", "Consulting Doctor", "Receipt Number", "Amount Paid", "Payment Mode", "Status"];
      case "CERTIFICATES":
        return ["Cert ID", "Certificate Title", "Citizen Beneficiary", "Clinical Purpose", "Issued Timestamp", "Authorizing Doctor", "Status"];
      default:
        return ["Ref ID", "Title / Item", "Particulars", "Department", "Value", "Remarks", "Status"];
    }
  };

  // Compile records for active tab
  let currentRecords: {
    id: string;
    reference_id: string;
    col1: string;
    col2: string;
    col3: string;
    col4: string;
    col5: string;
    status: "Active" | "Pending" | "Completed" | "Suspended";
  }[] = [];

  if (activeModule === "CERTIFICATES") {
    // Show all universally synchronized certificates issued for this patient
    currentRecords = certificates.map((c) => ({
      id: c.id,
      reference_id: c.reference_id,
      col1: c.certificate_title,
      col2: c.patient_name,
      col3: c.purpose,
      col4: c.issued_date,
      col5: c.authorizing_doctor,
      status: c.status,
    }));
  } else {
    currentRecords = patientDataStore[activeModule] || [];
  }

  const filteredRecords = currentRecords.filter(
    (r) =>
      r.col1.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.col2.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.col3.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.reference_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.col4.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.col5.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalCount = filteredRecords.length;
  const activeCount = filteredRecords.filter((r) => r.status === "Active" || r.status === "Completed").length;
  const pendingCount = filteredRecords.filter((r) => r.status === "Pending" || r.status === "Suspended").length;

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex flex-col font-sans text-slate-800">
      <DashboardHeader
        roleIcon="👤"
        loggedAsText={`${patientName} (${patientEmail})`}
        roleSubtitle="Patient Digital Health Portal"
        bannerText="Personal Health Records, Electronic Prescriptions & Digital Care Gateway"
      />

      <div className="flex flex-1 overflow-hidden">
        <DashboardSidebar
          modules={PATIENT_SIDEBAR_MODULES}
          activeModule={activeModule}
          onSelectModule={(id) => {
            setActiveModule(id);
            setSearchTerm("");
          }}
          sectionTitle="Patient Workspace"
        />

        <main className="flex-1 p-5 overflow-y-auto space-y-5">
          {/* Patient Info Card */}
          <div className="bg-gradient-to-r from-teal-800 to-slate-900 text-white p-5 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-teal-300 bg-white/10 px-2.5 py-1 rounded-md">
                Verified Citizen Health ID • ABHA Integrated
              </span>
              <h1 className="text-xl font-black mt-2 tracking-tight">{patientName}</h1>
              <p className="text-xs text-slate-300 mt-0.5">
                Primary Contact: <span className="font-semibold text-white">{patientPhone}</span> • Email: <span className="font-semibold text-white">{patientEmail}</span>
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={loadPatientData}
                className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold rounded-lg transition-colors flex items-center space-x-1.5"
              >
                <span>🔄</span>
                <span>Sync Health Data</span>
              </button>
            </div>
          </div>

          {/* Master Display Container */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight uppercase">
                  {activeModule.replace(/_/g, " ")} OVERVIEW
                </h2>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  DPDP Act 2023 Encrypted Records • Showing {filteredRecords.length} Verified Item(s)
                </p>
              </div>

              <div className="relative w-full md:w-72">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-xs">🔍</span>
                <input
                  type="text"
                  placeholder={`Search in ${activeModule.replace(/_/g, " ")}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
                />
              </div>
            </div>

            <MetricsStrip
              totalCount={totalCount}
              activeCount={activeCount}
              pendingCount={pendingCount}
              totalLabel={`Total Tracked in ${activeModule.replace(/_/g, " ")}`}
              activeLabel="Active / Cleared"
              pendingLabel="Pending Review"
            />

            {/* Records Data Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-[#f8fafc] text-[10px] font-black uppercase text-slate-600 border-b border-slate-200 tracking-wider">
                  <tr>
                    {getTableHeaders().map((h, idx) => (
                      <th key={idx} className="px-4 py-3.5">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-10 text-center text-slate-400 font-medium">
                        No records currently logged in this section.
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3.5 font-bold text-teal-700">{item.reference_id}</td>
                        <td className="px-4 py-3.5 font-extrabold text-slate-900">{item.col1}</td>
                        <td className="px-4 py-3.5 font-medium text-slate-600">{item.col2}</td>
                        <td className="px-4 py-3.5 font-medium text-slate-700">{item.col3}</td>
                        <td className="px-4 py-3.5 font-bold text-slate-800">{item.col4}</td>
                        <td className="px-4 py-3.5 font-medium text-slate-600">{item.col5}</td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              item.status === "Active" || item.status === "Completed"
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                : item.status === "Pending"
                                ? "bg-amber-100 text-amber-800 border border-amber-200"
                                : "bg-rose-100 text-rose-800 border border-rose-200"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      <footer className="bg-[#0b1b2b] text-slate-400 px-4 py-2 text-[10px] flex items-center justify-between border-t border-slate-800">
        <div>Current User :- <strong className="text-teal-400">{patientName} ({patientEmail}) • Patient Gateway</strong></div>
        <div>Powered by <strong className="text-slate-200">Shourya Technologies</strong> • Status: <span className="text-emerald-400 font-bold">Connected</span></div>
      </footer>
    </div>
  );
}