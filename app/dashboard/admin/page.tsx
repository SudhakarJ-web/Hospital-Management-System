"use client";

import React, { useState, useEffect, useCallback } from "react";
import DashboardHeader from "../../../components/dashboard/DashboardHeader";
import DashboardSidebar, { SidebarModule } from "../../../components/dashboard/DashboardSidebar";
import MetricsStrip from "../../../components/dashboard/MetricsStrip";
import { getSharedPatients, saveSharedPatient, SharedPatient } from "../../../lib/sync/patientsSync";
import {
  getSharedCertificates,
  saveSharedCertificate,
  deleteSharedCertificate,
  SharedCertificate,
} from "../../../lib/sync/certificatesSync";

const ADMIN_MODULES: SidebarModule[] = [
  { id: "MASTER", label: "MASTER", icon: "🏢", adminBadge: false },
  { id: "Doctors", label: "DOCTORS", icon: "🩺", adminBadge: true },
  { id: "Support", label: "SUPPORT", icon: "👥", adminBadge: true },
  { id: "Medical", label: "MEDICAL", icon: "💊", adminBadge: true },
  { id: "Registration", label: "REGISTRATION", icon: "👤", adminBadge: false },
  { id: "OPD", label: "OPD", icon: "🏥", adminBadge: false },
  { id: "IPD", label: "IPD", icon: "🛏️", adminBadge: false },
  { id: "OT", label: "OT", icon: "✂️", adminBadge: false },
  { id: "Radiology", label: "RADIOLOGY", icon: "📡", adminBadge: false },
  { id: "Pathology", label: "PATHOLOGY", icon: "🔬", adminBadge: false },
  { id: "Stock", label: "STOCK", icon: "📦", adminBadge: false },
  { id: "Billing", label: "BILLING", icon: "💳", adminBadge: false },
  { id: "Analysis", label: "ANALYSIS SYSTEM", icon: "📊", adminBadge: false },
  { id: "Utility", label: "UTILITY", icon: "⚙️", adminBadge: false },
  { id: "Certificates", label: "CERTIFICATES", icon: "📄", adminBadge: false },
  { id: "Backup", label: "BACKUP", icon: "💾", adminBadge: false },
];

export interface UnifiedRecord {
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

const INITIAL_DOMAIN_DATA: Record<string, UnifiedRecord[]> = {
  Doctors: [
    {
      id: "doc-1",
      reference_id: "GH-2026-001",
      category: "Doctors",
      col1: "Dr. Ananya Rao",
      col2: "MBBS, MD (Cardiology)",
      col3: "Cardiology Dept",
      col4: "ananya@gavanehospital.in (ananya.rao)",
      col5: "₹500",
      status: "Active",
      created_at: "27/08/2026",
    },
    {
      id: "doc-2",
      reference_id: "GH-2026-002",
      category: "Doctors",
      col1: "Dr. Sudhir Gavane",
      col2: "MS (General Surgery)",
      col3: "General Surgery",
      col4: "sudhir@gavanehospital.in (sudhir.gavane)",
      col5: "₹600",
      status: "Active",
      created_at: "27/08/2026",
    },
    {
      id: "doc-3",
      reference_id: "GH-2026-211",
      category: "Doctors",
      col1: "Dr. Priya",
      col2: "MD (Pediatrics)",
      col3: "Cardiology Dept",
      col4: "priya@gmail.com (priya)",
      col5: "₹500",
      status: "Active",
      created_at: "27/08/2026",
    },
  ],
  Support: [
    {
      id: "sup-1",
      reference_id: "GH-2026-SUP01",
      category: "Support",
      col1: "Rajesh Patil",
      col2: "Senior Front Desk Executive",
      col3: "Main Reception & Triage",
      col4: "+91 91567 44415",
      col5: "Morning Shift (08:00 - 16:00)",
      status: "Active",
      created_at: "27/08/2026",
    },
  ],
  Medical: [
    {
      id: "med-1",
      reference_id: "GH-2026-MED01",
      category: "Medical",
      col1: "Priya Nair",
      col2: "Chief Pharmacist (B.Pharm)",
      col3: "Central Pharmacy Depot",
      col4: "Lic: MH-PH-88912",
      col5: "priya.nair@gavanehospital.in",
      status: "Active",
      created_at: "27/08/2026",
    },
  ],
  OPD: [
    {
      id: "opd-1",
      reference_id: "GH-OPD-101",
      category: "OPD",
      col1: "Ramesh Kulkarni",
      col2: "Token #01",
      col3: "General Medicine",
      col4: "BP: 120/80 • Pulse: 72",
      col5: "Dr. Ananya Rao",
      status: "Active",
      created_at: "Today 10:15 AM",
    },
  ],
  IPD: [
    {
      id: "ipd-1",
      reference_id: "GH-IPD-301",
      category: "IPD",
      col1: "Amit Patil",
      col2: "Bed 204 (Semi-Private)",
      col3: "Orthopedics Ward",
      col4: "Admitted: 26/08/2026",
      col5: "Dr. Sudhir Gavane",
      status: "Active",
      created_at: "26/08/2026",
    },
  ],
  OT: [
    {
      id: "ot-1",
      reference_id: "GH-OT-881",
      category: "OT",
      col1: "Laparoscopic Appendectomy",
      col2: "Patient: Ramesh Jadhav",
      col3: "OT Complex - Theater 2",
      col4: "Slot: 02:30 PM - 04:00 PM",
      col5: "Chief Surgeon: Dr. Sudhir Gavane",
      status: "Pending",
      created_at: "28/08/2026",
    },
  ],
  Radiology: [
    {
      id: "rad-1",
      reference_id: "GH-RAD-401",
      category: "Radiology",
      col1: "Digital Chest X-Ray (PA View)",
      col2: "Patient: Sunita Deshmukh",
      col3: "X-Ray Room 1",
      col4: "Ref Doctor: Dr. Ananya Rao",
      col5: "Tech: Vishal More",
      status: "Completed",
      created_at: "Today 09:45 AM",
    },
  ],
  Pathology: [
    {
      id: "path-1",
      reference_id: "GH-LAB-901",
      category: "Pathology",
      col1: "Complete Blood Count (CBC) + ESR",
      col2: "Sample ID: SMP-88219",
      col3: "Hematology Section",
      col4: "Patient: Sagar Jadhav",
      col5: "Tech: Kiran Deshmukh",
      status: "Active",
      created_at: "Today 10:00 AM",
    },
  ],
  Stock: [
    {
      id: "stk-1",
      reference_id: "MED-2026-881",
      category: "Stock",
      col1: "Tab. Paracetamol 650mg (Dolo)",
      col2: "SKU: TAB-DOLO-650",
      col3: "Batch: BAT-2026-X01",
      col4: "Stock: 4,500 Units • ₹2.50/unit",
      col5: "Exp: 12/2027",
      status: "Active",
      created_at: "20/08/2026",
    },
  ],
  Billing: [
    {
      id: "bil-1",
      reference_id: "INV-2026-001",
      category: "Billing",
      col1: "Ramesh Kulkarni",
      col2: "General OPD Consultation Fee",
      col3: "₹500.00 (Cash / UPI)",
      col4: "Desk: Front Counter 1",
      col5: "Cleared & Paid",
      status: "Completed",
      created_at: "Today 10:35 AM",
    },
  ],
  Analysis: [
    {
      id: "ana-1",
      reference_id: "KPI-2026-AUG",
      category: "Analysis",
      col1: "Daily Patient Outpatient Flow",
      col2: "Total Footfall: 142 Citizens",
      col3: "OPD: 110 | IPD: 18 | Emergency: 14",
      col4: "Peak Hours: 10:00 AM - 01:00 PM",
      col5: "98.4% On-Time Consultations",
      status: "Active",
      created_at: "Live Feed",
    },
  ],
  Utility: [
    {
      id: "ut-1",
      reference_id: "UTIL-01",
      category: "Utility",
      col1: "Main Liquid Oxygen Plant (10 KL)",
      col2: "Pressure: 4.8 Bar (Optimal)",
      col3: "Central Supply Manifold",
      col4: "Next Audit: 05/09/2026",
      col5: "Operator: Engineering Desk",
      status: "Active",
      created_at: "28/08/2026",
    },
  ],
  Backup: [
    {
      id: "bk-1",
      reference_id: "BAK-2026-0828",
      category: "Backup",
      col1: "DPDP Encrypted Snapshot",
      col2: "Size: 428 MB (PostgreSQL + Assets)",
      col3: "AP-South-1 (Mumbai Node)",
      col4: "Timestamp: 28/08/2026 09:00 AM",
      col5: "Integrity: SHA-256 Verified",
      status: "Completed",
      created_at: "Today 09:00 AM",
    },
  ],
};

export default function AdminDashboardPage() {
  const [activeModule, setActiveModule] = useState<string>("Certificates");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [dataStore, setDataStore] = useState<Record<string, UnifiedRecord[]>>(INITIAL_DOMAIN_DATA);
  const [sharedPatients, setSharedPatients] = useState<SharedPatient[]>([]);
  const [sharedCertificates, setSharedCertificates] = useState<SharedCertificate[]>([]);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Dynamic Context-Aware Modal State
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editTargetId, setEditTargetId] = useState<string | null>(null);

  // Dynamic Form Field State
  const [formCol1, setFormCol1] = useState("");
  const [formCol2, setFormCol2] = useState("");
  const [formCol3, setFormCol3] = useState("");
  const [formCol4, setFormCol4] = useState("");
  const [formCol5, setFormCol5] = useState("");
  const [formStatus, setFormStatus] = useState<"Active" | "Pending" | "Completed" | "Suspended">("Active");

  // Load Synchronized Data Store
  const loadAllLedgers = useCallback(async () => {
    const pts = await getSharedPatients();
    setSharedPatients(pts);

    const certs = await getSharedCertificates();
    setSharedCertificates(certs);

    try {
      const cached = localStorage.getItem("gavane_admin_master_store");
      if (cached) {
        const parsed = JSON.parse(cached);
        setDataStore(parsed);
        return;
      }
    } catch {
      // Fallback
    }
    setDataStore(INITIAL_DOMAIN_DATA);
  }, []);

  useEffect(() => {
    loadAllLedgers();
  }, [loadAllLedgers]);

  const persistData = (updatedStore: Record<string, UnifiedRecord[]>) => {
    setDataStore(updatedStore);
    try {
      localStorage.setItem("gavane_admin_master_store", JSON.stringify(updatedStore));
    } catch {
      // Handled
    }
  };

  // Table Headers
  const getTableHeaders = () => {
    switch (activeModule) {
      case "Doctors":
        return ["Ref ID", "Doctor Name & Title", "Degree / Qualification", "Specialty Department", "Email / Username", "Fee", "Status", "Controls"];
      case "Support":
        return ["Ref ID", "Staff Name", "Designation / Role", "Assigned Unit / Triage", "Contact Phone", "Shift Schedule", "Status", "Controls"];
      case "Medical":
        return ["Ref ID", "Officer / Pharmacist", "Role / Qualification", "Depot Unit", "License / Batch", "Official Email", "Status", "Controls"];
      case "Registration":
        return ["Ref ID", "Patient Legal Name", "Phone Number", "Department", "Assigned Doctor", "Particulars / Notes", "Status", "Controls"];
      case "Certificates":
        return ["Cert ID", "Certificate Title", "Citizen Beneficiary", "Purpose", "Issued Timestamp", "Authorizing Officer", "Status", "Controls"];
      default:
        return ["Ref ID", "Primary Subject", "Classification", "Department", "Metadata Details", "Assigned Owner", "Status", "Controls"];
    }
  };

  // Modal Label Configuration
  const getModalConfig = () => {
    switch (activeModule) {
      case "Certificates":
        return {
          title: isEditing ? "Edit Certificate" : "Issue / Record Medical Certificate",
          l1: "Certificate Title", p1: "e.g. Medical Fitness Certificate",
          l2: "Citizen Beneficiary", p2: "e.g. Mayur Jadhav",
          l3: "Clinical Purpose", p3: "e.g. ENT Clearance / Sick Leave",
          l4: "Issued Timestamp", p4: "28/08/2026",
          l5: "Authorizing Officer / Doctor", p5: "Dr. Sudhir Gavane",
        };
      case "Doctors":
        return {
          title: isEditing ? "Edit Doctor Profile" : "Register Consultant / Doctor",
          l1: "Doctor Full Name", p1: "e.g. Dr. Priya",
          l2: "Degree / Qualification", p2: "e.g. MBBS, MD",
          l3: "Specialty Department", p3: "e.g. Cardiology Dept",
          l4: "Official Email Address", p4: "doctor@gavanehospital.in",
          l5: "Consultation Fee (₹ INR)", p5: "500",
        };
      case "Registration":
        return {
          title: "Register New Patient Record",
          l1: "Patient Legal Name", p1: "e.g. Ramesh Jadhav",
          l2: "Contact Phone Number", p2: "9876543210",
          l3: "Clinical Department", p3: "Cardiology Dept",
          l4: "Assigned Doctor", p4: "Dr. Priya",
          l5: "Registration Notes", p5: "Consultation booked",
        };
      default:
        return {
          title: `Create ${activeModule} Entry`,
          l1: "Primary Title / Name", p1: "Enter primary name...",
          l2: "Specification / Detail", p2: "Enter details...",
          l3: "Department / Section", p3: "Enter department...",
          l4: "Contact / Value / Timestamp", p4: "Enter value...",
          l5: "Operator / Authorized Person", p5: "Enter operator name...",
        };
    }
  };

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setEditTargetId(null);
    setFormCol1("");
    setFormCol2("");
    setFormCol3(activeModule === "Certificates" ? "ENT Clearance" : "");
    setFormCol4(activeModule === "Certificates" ? "28/08/2026" : "");
    setFormCol5(activeModule === "Certificates" ? "Dr. Sudhir Gavane" : "");
    setFormStatus("Active");
    setShowModal(true);
  };

  const handleOpenEditModal = (item: UnifiedRecord | SharedCertificate) => {
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

    if (activeModule === "Registration") {
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      const newPt: SharedPatient = {
        id: `pat-${Date.now()}`,
        reference_id: `GH-2026-REG${randomSuffix}`,
        full_name: formCol1,
        phone: formCol2 || "+91 98000 00000",
        department: formCol3 || "General OPD",
        assigned_doctor: formCol4 || "Dr. Priya",
        notes: formCol5 || "Registered by Admin",
        status: formStatus === "Pending" ? "Pending" : "Active",
        created_at: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      };

      const updated = await saveSharedPatient(newPt);
      setSharedPatients(updated);
      setFeedback({ type: "success", text: `Patient ${formCol1} registered. Synced universally.` });
      setShowModal(false);
      return;
    }

    if (activeModule === "Certificates") {
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      const certObj: SharedCertificate = {
        id: editTargetId || `cert-${Date.now()}`,
        reference_id: isEditing && editTargetId ? (sharedCertificates.find((c) => c.id === editTargetId)?.reference_id || `GH-2026-${randomSuffix}`) : `GH-2026-${randomSuffix}`,
        certificate_title: formCol1,
        patient_name: formCol2,
        purpose: formCol3,
        issued_date: formCol4 || "28/08/2026",
        authorizing_doctor: formCol5 || "Dr. Sudhir Gavane",
        status: formStatus,
        created_at: new Date().toLocaleDateString("en-IN"),
      };

      const updatedCerts = await saveSharedCertificate(certObj);
      setSharedCertificates(updatedCerts);
      setFeedback({ type: "success", text: `Certificate for ${formCol2} saved. Synced to Doctor & Support portals.` });
      setShowModal(false);
      return;
    }

    const currentTabRecords = dataStore[activeModule] || [];
    const randomSuffix = Math.floor(100 + Math.random() * 900);

    let updatedList: UnifiedRecord[] = [];
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
      setFeedback({ type: "success", text: `Updated record for ${formCol1}.` });
    } else {
      const newRecord: UnifiedRecord = {
        id: `${activeModule.toLowerCase()}-${Date.now()}`,
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
      setFeedback({ type: "success", text: `Added new entry into ${activeModule} control ledger.` });
    }

    const updatedStore = { ...dataStore, [activeModule]: updatedList };
    persistData(updatedStore);
    setShowModal(false);
  };

  const handleDeleteEntry = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove record for ${name}?`)) return;

    if (activeModule === "Registration") {
      const updatedPts = sharedPatients.filter((p) => p.id !== id);
      setSharedPatients(updatedPts);
      localStorage.setItem("gavane_shared_patients", JSON.stringify(updatedPts));
      setFeedback({ type: "success", text: `Removed patient ${name}.` });
      return;
    }

    if (activeModule === "Certificates") {
      const updatedCerts = await deleteSharedCertificate(id);
      setSharedCertificates(updatedCerts);
      setFeedback({ type: "success", text: `Removed certificate for ${name}.` });
      return;
    }

    const currentTabRecords = dataStore[activeModule] || [];
    const updatedList = currentTabRecords.filter((r) => r.id !== id);
    const updatedStore = { ...dataStore, [activeModule]: updatedList };

    persistData(updatedStore);
    setFeedback({ type: "success", text: `Removed record for ${name}.` });
  };

  // Resolve Records for Active Tab
  let currentRecords: (UnifiedRecord | { id: string; reference_id: string; col1: string; col2: string; col3: string; col4: string; col5: string; status: "Active" | "Pending" | "Completed" | "Suspended"; created_at?: string })[] = [];

  if (activeModule === "Registration") {
    currentRecords = sharedPatients.map((p) => ({
      id: p.id,
      reference_id: p.reference_id,
      category: "Registration",
      col1: p.full_name,
      col2: p.phone,
      col3: p.department,
      col4: p.assigned_doctor,
      col5: p.notes || "Standard Triage",
      status: p.status,
      created_at: p.created_at,
    }));
  } else if (activeModule === "Certificates") {
    currentRecords = sharedCertificates.map((c) => ({
      id: c.id,
      reference_id: c.reference_id,
      category: "Certificates",
      col1: c.certificate_title,
      col2: c.patient_name,
      col3: c.purpose,
      col4: c.issued_date,
      col5: c.authorizing_doctor,
      status: c.status,
      created_at: c.created_at,
    }));
  } else {
    currentRecords = dataStore[activeModule] || [];
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
        roleIcon="✓"
        loggedAsText="Admin (admin@gavanehospital.in)"
        roleSubtitle="Central Administrative Desk"
        bannerText="Welcome to Gavane Hospital Management System"
      />

      <div className="flex flex-1 overflow-hidden">
        <DashboardSidebar
          modules={ADMIN_MODULES}
          activeModule={activeModule}
          onSelectModule={(id) => {
            setActiveModule(id);
            setSearchTerm("");
          }}
          sectionTitle="Master Modules"
        />

        <main className="flex-1 p-5 overflow-y-auto space-y-5">
          {/* Top Control Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 px-2 py-1">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-teal-500"></span>
              <span>Active Workspace: <strong className="text-teal-700 uppercase">{activeModule} Management Desk</strong></span>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
              <button
                onClick={loadAllLedgers}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold rounded-lg transition-colors flex items-center space-x-1.5"
              >
                <span>🔄</span>
                <span>Sync Live Data</span>
              </button>

              <button
                onClick={handleOpenAddModal}
                className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center space-x-1.5"
              >
                <span>+</span>
                <span>Add {activeModule === "Registration" ? "Patient" : activeModule === "Certificates" ? "Certificate" : `${activeModule} Record`}</span>
              </button>
            </div>
          </div>

          {/* Feedback Banner */}
          {feedback && (
            <div className="p-3 rounded-xl border text-xs font-bold bg-emerald-50 border-emerald-300 text-emerald-900 flex justify-between">
              <span>{feedback.text}</span>
              <button onClick={() => setFeedback(null)} className="font-bold">✕</button>
            </div>
          )}

          {/* Dynamic Master Table Container */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight uppercase">
                  {activeModule} Control Ledger
                </h2>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  Module Scope: <strong className="text-teal-700 font-bold">{activeModule}</strong> • Showing {filteredRecords.length} Monitored Record(s)
                </p>
              </div>

              <div className="relative w-full md:w-72">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-xs">🔍</span>
                <input
                  type="text"
                  placeholder={`Search ${activeModule}...`}
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
              activeLabel="Operational / Active"
              pendingLabel="Pending Review"
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
                        No {activeModule} records currently found. Click &quot;+ Add Record&quot; above to log an entry.
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
                            onClick={() => handleOpenEditModal(item as UnifiedRecord)}
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
        </main>
      </div>

      <footer className="bg-[#0b1b2b] text-slate-400 px-4 py-2 text-[10px] flex items-center justify-between border-t border-slate-800">
        <div>Current User :- <strong className="text-teal-400">Admin Console • Pune Central Node</strong></div>
        <div>Powered by <strong className="text-slate-200">Shourya Technologies</strong> • Status: <span className="text-emerald-400 font-bold">Connected</span></div>
      </footer>

      {/* Dynamic Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  Target: {activeModule} Module
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
                  <option value="Active">Active / Cleared</option>
                  <option value="Pending">Pending Review / Triage</option>
                  <option value="Completed">Completed / Archived</option>
                  <option value="Suspended">Suspended / Inactive</option>
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