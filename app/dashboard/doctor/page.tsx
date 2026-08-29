"use client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

import React, { useState, useEffect, useCallback } from "react";
import DashboardHeader from "../../../components/dashboard/DashboardHeader";
import DashboardSidebar, { SidebarModule } from "../../../components/dashboard/DashboardSidebar";
import MetricsStrip from "../../../components/dashboard/MetricsStrip";
import DoctorClinicalForm from "../../../components/dashboard/DoctorClinicalForm";
import { getSharedPatients, saveSharedPatient, SharedPatient } from "../../../lib/sync/patientsSync";
import {
  getSharedCertificates,
  saveSharedCertificate,
  deleteSharedCertificate,
  SharedCertificate,
} from "../../../lib/sync/certificatesSync";
import { supabase } from "../../../lib/supabase";

const DOCTOR_SIDEBAR_MODULES: SidebarModule[] = [
  { id: "OPD", label: "OPD CLINICAL DESK", icon: "🩺" },
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

export interface DoctorTabRecord {
  id: string;
  reference_id: string;
  category: string;
  col1: string;
  col2: string;
  col3: string;
  col4: string;
  col5: string;
  status: "Active" | "Pending" | "Completed" | "Suspended";
  created_at: string;
}

const INITIAL_DOCTOR_DOMAIN_DATA: Record<string, DoctorTabRecord[]> = {
  IPD: [
    {
      id: "doc-ipd-1",
      reference_id: "GH-IPD-301",
      category: "IPD",
      col1: "Amit Patil",
      col2: "Bed 204 (Semi-Private)",
      col3: "Orthopedics Ward",
      col4: "Admitted: 26/08/2026",
      col5: "Post-op recovery • Stable vitals",
      status: "Active",
      created_at: "26/08/2026",
    },
  ],
  OT: [
    {
      id: "doc-ot-1",
      reference_id: "GH-OT-881",
      category: "OT",
      col1: "Laparoscopic Appendectomy",
      col2: "Patient: Ramesh Jadhav",
      col3: "OT Complex - Theater 2",
      col4: "Slot: 02:30 PM - 04:00 PM",
      col5: "Anesthesia: GA • PAC Cleared",
      status: "Pending",
      created_at: "28/08/2026",
    },
  ],
  RADIOLOGY: [
    {
      id: "doc-rad-1",
      reference_id: "GH-RAD-401",
      category: "RADIOLOGY",
      col1: "Digital Chest X-Ray (PA View)",
      col2: "Patient: Sunita Deshmukh",
      col3: "X-Ray Suite 1",
      col4: "Requested: Today 09:30 AM",
      col5: "Report: Mild bronchovascular markings",
      status: "Completed",
      created_at: "Today 09:45 AM",
    },
  ],
  PATHOLOGY: [
    {
      id: "doc-path-1",
      reference_id: "GH-LAB-901",
      category: "PATHOLOGY",
      col1: "Complete Blood Count (CBC) + ESR",
      col2: "Sample ID: SMP-88219",
      col3: "Hematology Section",
      col4: "Patient: Sagar Jadhav",
      col5: "Hb: 13.8 g/dL • TLC: 7,400 /cu.mm (Normal)",
      status: "Completed",
      created_at: "Today 10:00 AM",
    },
  ],
  STOCK: [
    {
      id: "doc-stk-1",
      reference_id: "MED-2026-881",
      category: "STOCK",
      col1: "Tab. Paracetamol 650mg (Dolo)",
      col2: "SKU: TAB-DOLO-650",
      col3: "Central Pharmacy Dispenser",
      col4: "Available: 4,500 Units",
      col5: "Batch: BAT-2026-X01 • Exp: 12/2027",
      status: "Active",
      created_at: "20/08/2026",
    },
  ],
  BILLING: [
    {
      id: "doc-bil-1",
      reference_id: "INV-2026-001",
      category: "BILLING",
      col1: "Ramesh Kulkarni",
      col2: "Consultation Fee (OPD)",
      col3: "₹500.00 (Cash / UPI)",
      col4: "Receipt: #GH-REC-901",
      col5: "Clearance Confirmed",
      status: "Completed",
      created_at: "Today 10:35 AM",
    },
  ],
  ANALYSIS: [
    {
      id: "doc-ana-1",
      reference_id: "DOC-KPI-01",
      category: "ANALYSIS",
      col1: "Consultation Throughput Summary",
      col2: "Today: 18 Patients Consulted",
      col3: "Average Time: 12 mins / patient",
      col4: "Prescriptions Issued: 16",
      col5: "Lab Tests Requested: 9",
      status: "Active",
      created_at: "Live Feed",
    },
  ],
  UTILITY: [
    {
      id: "doc-ut-1",
      reference_id: "UTIL-CLIN-01",
      category: "UTILITY",
      col1: "Multiparameter Patient Monitor 1",
      col2: "OPD Examination Room 102",
      col3: "Calibration: Verified",
      col4: "SpO2 & NIBP Sensors: OK",
      col5: "Ready for Consultations",
      status: "Active",
      created_at: "28/08/2026",
    },
  ],
};

export default function DoctorDashboardPage() {
  const [activeModule, setActiveModule] = useState<string>("OPD");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Doctor session state
  const [doctorName, setDoctorName] = useState<string>("Dr. Priya");
  const [doctorEmail, setDoctorEmail] = useState<string>("priya@gmail.com");

  // Domain Store & Shared Registries
  const [doctorDataStore, setDoctorDataStore] = useState<Record<string, DoctorTabRecord[]>>(INITIAL_DOCTOR_DOMAIN_DATA);
  const [patients, setPatients] = useState<SharedPatient[]>([]);
  const [certificates, setCertificates] = useState<SharedCertificate[]>([]);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Dynamic Modal State
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editTargetId, setEditTargetId] = useState<string | null>(null);

  // Modal Form Inputs
  const [formCol1, setFormCol1] = useState("");
  const [formCol2, setFormCol2] = useState("");
  const [formCol3, setFormCol3] = useState("");
  const [formCol4, setFormCol4] = useState("");
  const [formCol5, setFormCol5] = useState("");
  const [formStatus, setFormStatus] = useState<"Active" | "Pending" | "Completed" | "Suspended">("Active");

  // 1. Resolve Authenticated Doctor Profile
  useEffect(() => {
    async function resolveDoctorSession() {
      try {
        const { data } = await supabase.auth.getUser();
        if (data?.user) {
          const metaName = data.user.user_metadata?.full_name || data.user.user_metadata?.name;
          if (metaName) setDoctorName(metaName);
          if (data.user.email) setDoctorEmail(data.user.email);
          return;
        }
      } catch {
        // Fallback
      }

      try {
        const cachedStaff = localStorage.getItem("gavane_staff_registry");
        if (cachedStaff) {
          const list = JSON.parse(cachedStaff);
          const currentDoc = list.find((s: { module_category: string }) => s.module_category === "Doctors");
          if (currentDoc) {
            setDoctorName(currentDoc.name);
            setDoctorEmail(currentDoc.email);
          }
        }
      } catch {
        // Handled
      }
    }

    resolveDoctorSession();
  }, []);

  // 2. Load Synchronized Patient Records & Certificates
  const loadDoctorLedgers = useCallback(async () => {
    const pts = await getSharedPatients();
    setPatients(pts);

    const certs = await getSharedCertificates();
    setCertificates(certs);

    try {
      const cached = localStorage.getItem("gavane_doctor_master_store");
      if (cached) {
        const parsed = JSON.parse(cached);
        setDoctorDataStore(parsed);
        return;
      }
    } catch {
      // Fallback
    }
    setDoctorDataStore(INITIAL_DOCTOR_DOMAIN_DATA);
  }, []);

  useEffect(() => {
    loadDoctorLedgers();
  }, [loadDoctorLedgers]);

  const persistDoctorData = (updatedStore: Record<string, DoctorTabRecord[]>) => {
    setDoctorDataStore(updatedStore);
    try {
      localStorage.setItem("gavane_doctor_master_store", JSON.stringify(updatedStore));
    } catch {
      // Handled
    }
  };

  // Table Headers
  const getTableHeaders = () => {
    switch (activeModule) {
      case "REGISTRATION":
        return ["Ref ID", "Patient Legal Name", "Phone Number", "Department", "Assigned Doctor", "Particulars / Notes", "Status", "Controls"];
      case "CERTIFICATES":
        return ["Cert ID", "Certificate Title", "Patient / Beneficiary", "Clinical Purpose", "Issued Timestamp", "Verification Details", "Status", "Controls"];
      case "IPD":
        return ["Ref ID", "Patient Name", "Bed & Ward No", "Department Ward", "Admission Date", "Clinical Rounds / Status", "Status", "Controls"];
      case "OT":
        return ["Ref ID", "Surgical Procedure", "Patient Name", "OT Theater Room", "Scheduled Slot", "Anesthesia / Surgeon", "Status", "Controls"];
      case "RADIOLOGY":
        return ["Ref ID", "Imaging Investigation", "Patient Name", "Radiology Room", "Request Timestamp", "Findings / Report", "Status", "Controls"];
      case "PATHOLOGY":
        return ["Ref ID", "Diagnostic Panel", "Sample ID", "Lab Section", "Patient Name", "Lab Results & Values", "Status", "Controls"];
      case "STOCK":
        return ["Item ID", "Medication / Reagent", "SKU Identifier", "Dispenser Unit", "Available Units", "Batch & Expiry", "Status", "Controls"];
      case "BILLING":
        return ["Invoice ID", "Patient Name", "Service Description", "Net Amount", "Receipt Particulars", "Clearance Status", "Status", "Controls"];
      case "ANALYSIS":
        return ["Metric ID", "Clinical KPI Indicator", "Case Volume Metric", "Throughput Benchmark", "Prescription Summary", "Performance Flag", "Status", "Controls"];
      case "UTILITY":
        return ["Unit ID", "Clinical Equipment", "Installation Location", "Calibration Status", "Sensor Check", "Operational Readiness", "Status", "Controls"];
      default:
        return ["Ref ID", "Patient / Subject", "Details", "Department", "Parameters", "Remarks", "Status", "Controls"];
    }
  };

  // Dynamic Modal Form Configurator
  const getModalConfig = () => {
    switch (activeModule) {
      case "REGISTRATION":
        return {
          title: "Register New Patient",
          l1: "Patient Full Legal Name", p1: "e.g. Ramesh Jadhav",
          l2: "Contact Mobile Number", p2: "9876543210",
          l3: "Department / Specialty", p3: "Cardiology Dept",
          l4: "Assigned Consultant", p4: doctorName,
          l5: "Clinical Particulars / Notes", p5: "Consultation booked",
        };
      case "CERTIFICATES":
        return {
          title: isEditing ? "Edit Certificate" : "Issue / Record Medical Certificate",
          l1: "Certificate Title", p1: "e.g. Medical Fitness Certificate",
          l2: "Patient / Beneficiary Name", p2: "e.g. Mahesh Patil",
          l3: "Clinical Purpose / Diagnosis", p3: "e.g. Sick Leave / Fitness Clearance",
          l4: "Issued Timestamp", p4: "28/08/2026",
          l5: "Authorizing Officer / Doctor", p5: doctorName,
        };
      case "IPD":
        return {
          title: isEditing ? "Edit In-Patient Admission" : "Admit Patient to IPD Ward",
          l1: "Patient Full Name", p1: "e.g. Sunita Deshmukh",
          l2: "Assigned Bed & Ward", p2: "Bed 204 (Semi-Private)",
          l3: "Department Ward", p3: "Orthopedics Ward",
          l4: "Admission Date", p4: "28/08/2026",
          l5: "Clinical Rounds / Status Notes", p5: "Post-op recovery • Stable vitals",
        };
      case "OT":
        return {
          title: isEditing ? "Edit Surgical Slot" : "Schedule Operation Theatre (OT) Procedure",
          l1: "Surgical Procedure Name", p1: "e.g. Laparoscopic Appendectomy",
          l2: "Patient Full Name", p2: "e.g. Ramesh Jadhav",
          l3: "OT Complex & Theater", p3: "OT Complex - Theater 2",
          l4: "Scheduled Time Slot", p4: "02:30 PM - 04:00 PM",
          l5: "Anesthesia / Lead Surgeon Notes", p5: "Anesthesia: GA • PAC Cleared",
        };
      case "RADIOLOGY":
        return {
          title: isEditing ? "Edit Radiology Order" : "Order Radiology Investigation",
          l1: "Scan / Investigation Name", p1: "e.g. Digital Chest X-Ray (PA View)",
          l2: "Patient Full Name", p2: "e.g. Sunita Deshmukh",
          l3: "Imaging Suite", p3: "X-Ray Suite 1",
          l4: "Request Date / Time", p4: "Today 09:30 AM",
          l5: "Diagnostic Findings / Remarks", p5: "Enter radiologist remarks...",
        };
      case "PATHOLOGY":
        return {
          title: isEditing ? "Edit Pathology Order" : "Order Pathology Diagnostic Test",
          l1: "Test / Panel Name", p1: "e.g. Complete Blood Count (CBC)",
          l2: "Sample ID / Barcode", p2: "SMP-88219",
          l3: "Lab Section", p3: "Hematology Section",
          l4: "Patient Full Name", p4: "e.g. Sagar Jadhav",
          l5: "Lab Results / Observations", p5: "Hb: 13.8 g/dL • TLC: 7,400",
        };
      default:
        return {
          title: `Create ${activeModule} Entry`,
          l1: "Primary Title / Name", p1: "Enter primary details...",
          l2: "Specification / Description", p2: "Enter details...",
          l3: "Department / Section", p3: "Enter department...",
          l4: "Parameters / Values", p4: "Enter values...",
          l5: "Clinical Remarks / Doctor Notes", p5: "Enter remarks...",
        };
    }
  };

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setEditTargetId(null);
    setFormCol1("");
    setFormCol2("");
    setFormCol3(activeModule === "REGISTRATION" ? "Cardiology Dept" : activeModule === "CERTIFICATES" ? "Sick Leave" : "");
    setFormCol4(activeModule === "REGISTRATION" ? doctorName : activeModule === "CERTIFICATES" ? "28/08/2026" : "");
    setFormCol5(activeModule === "CERTIFICATES" ? doctorName : "");
    setFormStatus("Active");
    setShowModal(true);
  };

  const handleOpenEditModal = (item: DoctorTabRecord | SharedCertificate) => {
    setIsEditing(true);
    setEditTargetId(item.id);

    if ("certificate_title" in item) {
      setFormCol1(item.certificate_title);
      setFormCol2(item.patient_name);
      setFormCol3(item.purpose);
      setFormCol4(item.issued_date);
      setFormCol5(item.authorizing_doctor);
      setFormStatus(item.status);
    } else {
      setFormCol1(item.col1);
      setFormCol2(item.col2);
      setFormCol3(item.col3);
      setFormCol4(item.col4);
      setFormCol5(item.col5);
      setFormStatus(item.status);
    }
    setShowModal(true);
  };

  const handleSaveModalEntry = async (e: React.FormEvent) => {
    e.preventDefault();

    if (activeModule === "REGISTRATION") {
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      const newPt: SharedPatient = {
        id: `pat-${Date.now()}`,
        reference_id: `GH-2026-REG${randomSuffix}`,
        full_name: formCol1,
        phone: formCol2 || "+91 98000 00000",
        department: formCol3 || "General OPD",
        assigned_doctor: formCol4 || doctorName,
        notes: formCol5 || `Registered by ${doctorName}`,
        status: formStatus === "Pending" ? "Pending" : "Active",
        created_at: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      };

      const updated = await saveSharedPatient(newPt);
      setPatients(updated);
      setFeedback({ type: "success", text: `Patient ${formCol1} registered. Synced universally.` });
      setShowModal(false);
      return;
    }

    if (activeModule === "CERTIFICATES") {
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      const certObj: SharedCertificate = {
        id: editTargetId || `cert-${Date.now()}`,
        reference_id: isEditing && editTargetId ? (certificates.find((c) => c.id === editTargetId)?.reference_id || `GH-2026-${randomSuffix}`) : `GH-2026-${randomSuffix}`,
        certificate_title: formCol1,
        patient_name: formCol2,
        purpose: formCol3,
        issued_date: formCol4 || "28/08/2026",
        authorizing_doctor: formCol5 || doctorName,
        status: formStatus,
        created_at: new Date().toLocaleDateString("en-IN"),
      };

      const updatedCerts = await saveSharedCertificate(certObj);
      setCertificates(updatedCerts);
      setFeedback({ type: "success", text: `Certificate for ${formCol2} saved. Synced to Admin & Support portals.` });
      setShowModal(false);
      return;
    }

    const currentTabRecords = doctorDataStore[activeModule] || [];
    const randomSuffix = Math.floor(100 + Math.random() * 900);

    let updatedList: DoctorTabRecord[] = [];
    if (isEditing && editTargetId) {
      updatedList = currentTabRecords.map((r) =>
        r.id === editTargetId
          ? {
              ...r,
              col1: formCol1,
              col2: formCol2,
              col3: formCol3,
              col4: formCol4,
              col5: formCol5,
              status: formStatus,
            }
          : r
      );
      setFeedback({ type: "success", text: `Updated entry for ${formCol1}.` });
    } else {
      const newRecord: DoctorTabRecord = {
        id: `doc-${activeModule.toLowerCase()}-${Date.now()}`,
        reference_id: `GH-2026-${randomSuffix}`,
        category: activeModule,
        col1: formCol1,
        col2: formCol2,
        col3: formCol3,
        col4: formCol4,
        col5: formCol5,
        status: formStatus,
        created_at: new Date().toLocaleDateString("en-IN"),
      };
      updatedList = [newRecord, ...currentTabRecords];
      setFeedback({ type: "success", text: `Added new entry to ${activeModule} clinical ledger.` });
    }

    const updatedStore = { ...doctorDataStore, [activeModule]: updatedList };
    persistDoctorData(updatedStore);
    setShowModal(false);
  };

  const handleDeleteEntry = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove record: ${name}?`)) return;

    if (activeModule === "REGISTRATION") {
      const updatedPts = patients.filter((p) => p.id !== id);
      setPatients(updatedPts);
      localStorage.setItem("gavane_shared_patients", JSON.stringify(updatedPts));
      setFeedback({ type: "success", text: `Removed patient ${name}.` });
      return;
    }

    if (activeModule === "CERTIFICATES") {
      const updatedCerts = await deleteSharedCertificate(id);
      setCertificates(updatedCerts);
      setFeedback({ type: "success", text: `Removed certificate for ${name}.` });
      return;
    }

    const currentTabRecords = doctorDataStore[activeModule] || [];
    const updatedList = currentTabRecords.filter((r) => r.id !== id);
    const updatedStore = { ...doctorDataStore, [activeModule]: updatedList };

    persistDoctorData(updatedStore);
    setFeedback({ type: "success", text: `Removed record for ${name}.` });
  };

  // Resolve Records for Active Tab
  let currentRecords: (DoctorTabRecord | { id: string; reference_id: string; col1: string; col2: string; col3: string; col4: string; col5: string; status: "Active" | "Pending" | "Completed" | "Suspended"; created_at?: string })[] = [];

  if (activeModule === "REGISTRATION") {
    currentRecords = patients.map((p) => ({
      id: p.id,
      reference_id: p.reference_id,
      category: "REGISTRATION",
      col1: p.full_name,
      col2: p.phone,
      col3: p.department,
      col4: p.assigned_doctor,
      col5: p.notes || "Standard Triage",
      status: p.status,
      created_at: p.created_at,
    }));
  } else if (activeModule === "CERTIFICATES") {
    currentRecords = certificates.map((c) => ({
      id: c.id,
      reference_id: c.reference_id,
      category: "CERTIFICATES",
      col1: c.certificate_title,
      col2: c.patient_name,
      col3: c.purpose,
      col4: c.issued_date,
      col5: c.authorizing_doctor,
      status: c.status,
      created_at: c.created_at,
    }));
  } else {
    currentRecords = doctorDataStore[activeModule] || [];
  }

  const filteredRecords = currentRecords.filter(
    (r) =>
      r.col1.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.col2.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.col3.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.reference_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.col4.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalCount = filteredRecords.length;
  const activeCount = filteredRecords.filter((r) => r.status === "Active" || r.status === "Completed").length;
  const pendingCount = filteredRecords.filter((r) => r.status === "Pending" || r.status === "Suspended").length;
  const modalConfig = getModalConfig();

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex flex-col font-sans text-slate-800">
      <DashboardHeader
        roleIcon="🩺"
        loggedAsText={`${doctorName} (${doctorEmail})`}
        roleSubtitle="Physician & Outpatient Clinical Workspace"
        bannerText="Physician Clinical EHR & Outpatient Operations Workspace"
      />

      <div className="flex flex-1 overflow-hidden">
        <DashboardSidebar
          modules={DOCTOR_SIDEBAR_MODULES}
          activeModule={activeModule}
          onSelectModule={(id) => {
            setActiveModule(id);
            setSearchTerm("");
          }}
          sectionTitle="Physician Features"
        />

        <main className="flex-1 p-5 overflow-y-auto space-y-5">
          {/* Top Control Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 px-2 py-1">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-teal-500"></span>
              <span>Active Clinical Ledger: <strong className="text-teal-700 uppercase">{activeModule}</strong></span>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
              <button
                onClick={loadDoctorLedgers}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold rounded-lg transition-colors flex items-center space-x-1.5"
              >
                <span>🔄</span>
                <span>Sync Live Data</span>
              </button>

              {activeModule !== "OPD" && (
                <button
                  onClick={handleOpenAddModal}
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center space-x-1.5"
                >
                  <span>+</span>
                  <span>Add {activeModule === "REGISTRATION" ? "Patient" : activeModule === "CERTIFICATES" ? "Certificate" : `${activeModule} Record`}</span>
                </button>
              )}
            </div>
          </div>

          {/* Feedback Banner */}
          {feedback && (
            <div className={`p-3 rounded-xl border text-xs font-bold flex justify-between ${
              feedback.type === "success" ? "bg-emerald-50 border-emerald-300 text-emerald-900" : "bg-rose-50 border-rose-300 text-rose-900"
            }`}>
              <span>{feedback.text}</span>
              <button onClick={() => setFeedback(null)} className="font-bold">✕</button>
            </div>
          )}

          {/* OPD PRIMARY CLINICAL FORM VIEW VS. TAB LEDGERS */}
          {activeModule === "OPD" ? (
            <DoctorClinicalForm
              doctorName={doctorName}
              patients={patients}
              onSuccess={(msg) => setFeedback({ type: "success", text: msg })}
              onError={(msg) => setFeedback({ type: "error", text: msg })}
            />
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-black text-slate-900 tracking-tight uppercase">
                    {activeModule === "REGISTRATION"
                      ? "Patient Registration Ledger"
                      : activeModule === "CERTIFICATES"
                      ? "Medical Certificates Clinical Ledger"
                      : `${activeModule} Clinical Management Ledger`}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">
                    Authorized view for <strong className="text-teal-700">{doctorName}</strong> • Showing {filteredRecords.length} Monitored Record(s)
                  </p>
                </div>

                <div className="relative w-full md:w-72">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-xs">🔍</span>
                  <input
                    type="text"
                    placeholder={`Search in ${activeModule}...`}
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
                totalLabel={`Total ${activeModule} Entries`}
                activeLabel="Active / Cleared"
                pendingLabel="Pending Triage / Review"
              />

              {/* Context-Aware Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-[#f8fafc] text-[10px] font-black uppercase text-slate-600 border-b border-slate-200 tracking-wider">
                    <tr>
                      {getTableHeaders().map((h, idx) => (
                        <th
                          key={idx}
                          className={`px-4 py-3.5 ${idx === getTableHeaders().length - 1 ? "text-right" : ""}`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRecords.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-5 py-10 text-center text-slate-400 font-medium">
                          No {activeModule} records currently logged. Click &quot;+ Add Record&quot; above to log an entry.
                        </td>
                      </tr>
                    ) : (
                      filteredRecords.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-4 py-3.5 font-bold text-teal-700">{item.reference_id}</td>
                          <td className="px-4 py-3.5 font-extrabold text-slate-900">{item.col1}</td>
                          <td className="px-4 py-3.5 font-medium text-slate-600">{item.col2}</td>
                          <td className="px-4 py-3.5 font-medium text-slate-700">{item.col3}</td>
                          <td className="px-4 py-3.5 font-medium text-slate-600">{item.col4}</td>
                          <td className="px-4 py-3.5 font-bold text-slate-800">{item.col5}</td>
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
                          <td className="px-4 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              onClick={() => handleOpenEditModal(item as DoctorTabRecord)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="Edit Record"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDeleteEntry(item.id, item.col1)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                              title="Delete Record"
                            >
                              🗑️
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
        </main>
      </div>

      <footer className="bg-[#0b1b2b] text-slate-400 px-4 py-2 text-[10px] flex items-center justify-between border-t border-slate-800">
        <div>Current Session :- <strong className="text-teal-400">{doctorName} ({doctorEmail}) • Pune Node</strong></div>
        <div>Powered by <strong className="text-slate-200">Shourya Technologies</strong> • Status: <span className="text-emerald-400 font-bold">Connected</span></div>
      </footer>

      {/* Dynamic Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  Target: {activeModule} Clinical Module
                </span>
                <h3 className="text-base font-extrabold text-slate-900 mt-1">
                  {modalConfig.title}
                </h3>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleSaveModalEntry} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">{modalConfig.l1} *</label>
                <input
                  type="text"
                  required
                  placeholder={modalConfig.p1}
                  value={formCol1}
                  onChange={(e) => setFormCol1(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">{modalConfig.l2} *</label>
                  <input
                    type="text"
                    required
                    placeholder={modalConfig.p2}
                    value={formCol2}
                    onChange={(e) => setFormCol2(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">{modalConfig.l3} *</label>
                  <input
                    type="text"
                    required
                    placeholder={modalConfig.p3}
                    value={formCol3}
                    onChange={(e) => setFormCol3(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">{modalConfig.l4} *</label>
                  <input
                    type="text"
                    required
                    placeholder={modalConfig.p4}
                    value={formCol4}
                    onChange={(e) => setFormCol4(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">{modalConfig.l5} *</label>
                  <input
                    type="text"
                    required
                    placeholder={modalConfig.p5}
                    value={formCol5}
                    onChange={(e) => setFormCol5(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Status Flag *</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as "Active" | "Pending" | "Completed" | "Suspended")}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
                >
                  <option value="Active">Active / In Progress</option>
                  <option value="Pending">Pending Review / Triage</option>
                  <option value="Completed">Completed / Cleared</option>
                  <option value="Suspended">Suspended / Postponed</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-slate-100 text-xs font-bold rounded-lg">
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg shadow-sm"
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