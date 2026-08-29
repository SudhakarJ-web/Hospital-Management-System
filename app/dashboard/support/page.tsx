"use client";

import React, { useState, useEffect, useCallback } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardSidebar, { SidebarModule } from "@/components/dashboard/DashboardSidebar";
import MetricsStrip from "@/components/dashboard/MetricsStrip";
import { getSharedPatients, saveSharedPatient, SharedPatient } from "@/lib/sync/patientsSync";
import {
  getSharedCertificates,
  saveSharedCertificate,
  deleteSharedCertificate,
  SharedCertificate,
} from "@/lib/sync/certificatesSync";
import { supabase } from "@/lib/supabase";

const SUPPORT_SIDEBAR_MODULES: SidebarModule[] = [
  { id: "REGISTRATION", label: "PATIENT REGISTRATION", icon: "👤" },
  { id: "OPD_QUEUE", label: "OPD APPOINTMENTS & QUEUE", icon: "🩺" },
  { id: "BILLING", label: "FRONT DESK BILLING & UPI", icon: "💳" },
  { id: "IPD_ADMISSION", label: "IPD ADMISSIONS & BEDS", icon: "🛏️" },
  { id: "DISCHARGE", label: "DISCHARGE CLEARANCE DESK", icon: "🚪" },
  { id: "CERTIFICATES", label: "MEDICAL CERTIFICATES", icon: "📄" },
  { id: "HELPDESK", label: "HELPDESK & UTILITY", icon: "⚙️" },
];

export interface SupportTabRecord {
  id: string;
  reference_id: string;
  category: string;
  col1: string; // Patient / Citizen Name / Equipment
  col2: string; // Phone / Token / Bed / Invoice No
  col3: string; // Department / Service / Ward
  col4: string; // Doctor / Amount / Date
  col5: string; // Notes / Shift / Payment Mode
  status: "Active" | "Pending" | "Completed" | "Suspended";
  created_at: string;
}

const INITIAL_SUPPORT_DOMAIN_DATA: Record<string, SupportTabRecord[]> = {
  OPD_QUEUE: [
    {
      id: "sup-q-1",
      reference_id: "GH-OPD-101",
      category: "OPD_QUEUE",
      col1: "Ramesh Kulkarni",
      col2: "Token #01",
      col3: "General Medicine",
      col4: "Dr. Ananya Rao",
      col5: "09:30 AM Slot • Triage Cleared",
      status: "Completed",
      created_at: "Today 09:30 AM",
    },
    {
      id: "sup-q-2",
      reference_id: "GH-OPD-102",
      category: "OPD_QUEUE",
      col1: "Sagar Jadhav",
      col2: "Token #02",
      col3: "Cardiology Dept",
      col4: "Dr. Priya",
      col5: "10:15 AM Slot • In Consultation",
      status: "Active",
      created_at: "Today 10:15 AM",
    },
  ],
  BILLING: [
    {
      id: "sup-bil-1",
      reference_id: "INV-2026-001",
      category: "BILLING",
      col1: "Ramesh Kulkarni",
      col2: "Receipt #GH-REC-901",
      col3: "OPD General Consultation Fee",
      col4: "₹500.00",
      col5: "UPI QR (PhonePe) • Desk 1",
      status: "Completed",
      created_at: "Today 10:35 AM",
    },
    {
      id: "sup-bil-2",
      reference_id: "INV-2026-002",
      category: "BILLING",
      col1: "Sunita Deshmukh",
      col2: "Bill Ref: #BIL-8891",
      col3: "Consultation + Diagnostic X-Ray",
      col4: "₹1,100.00",
      col5: "Cash Counter • Clearance Pending",
      status: "Pending",
      created_at: "Today 11:15 AM",
    },
  ],
  IPD_ADMISSION: [
    {
      id: "sup-ipd-1",
      reference_id: "GH-IPD-301",
      category: "IPD_ADMISSION",
      col1: "Amit Patil",
      col2: "Bed 204 (Semi-Private)",
      col3: "Orthopedics Ward (Floor 2)",
      col4: "Dr. Sudhir Gavane",
      col5: "Admitted: 26/08/2026 • Attendant Pass Issued",
      status: "Active",
      created_at: "26/08/2026",
    },
  ],
  DISCHARGE: [
    {
      id: "sup-dis-1",
      reference_id: "DIS-2026-01",
      category: "DISCHARGE",
      col1: "Amit Patil",
      col2: "Discharge Summary #DS-204",
      col3: "Orthopedics Ward (Bed 204)",
      col4: "Attending: Dr. Sudhir Gavane",
      col5: "Pharmacy & Pharmacy Clearance Completed",
      status: "Active",
      created_at: "28/08/2026",
    },
    {
      id: "sup-dis-2",
      reference_id: "DIS-2026-02",
      category: "DISCHARGE",
      col1: "Meena Sharma",
      col2: "Discharge Summary #DS-102",
      col3: "General Medicine Ward",
      col4: "Attending: Dr. Ananya Rao",
      col5: "Billing Clearance in Progress",
      status: "Pending",
      created_at: "28/08/2026",
    },
  ],
  HELPDESK: [
    {
      id: "sup-help-1",
      reference_id: "TKT-2026-001",
      category: "HELPDESK",
      col1: "Ambulance Transport Request",
      col2: "Caller: +91 94210 55667",
      col3: "Pickup: Hadapsar, Pune",
      col4: "Driver: Santosh (MH-12-GH-01)",
      col5: "Dispatched • ETA 15 Mins",
      status: "Active",
      created_at: "Today 08:30 AM",
    },
  ],
};

export default function SupportDashboardPage() {
  const [activeModule, setActiveModule] = useState<string>("REGISTRATION");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Support Operator Session State
  const [operatorName, setOperatorName] = useState<string>("Rajesh Patil");
  const [operatorEmail, setOperatorEmail] = useState<string>("support@gavanehospital.in");

  // Stores
  const [supportDataStore, setSupportDataStore] = useState<Record<string, SupportTabRecord[]>>(INITIAL_SUPPORT_DOMAIN_DATA);
  const [patients, setPatients] = useState<SharedPatient[]>([]);
  const [certificates, setCertificates] = useState<SharedCertificate[]>([]);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modal State
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editTargetId, setEditTargetId] = useState<string | null>(null);

  // Form Fields
  const [formCol1, setFormCol1] = useState("");
  const [formCol2, setFormCol2] = useState("");
  const [formCol3, setFormCol3] = useState("");
  const [formCol4, setFormCol4] = useState("");
  const [formCol5, setFormCol5] = useState("");
  const [formStatus, setFormStatus] = useState<"Active" | "Pending" | "Completed" | "Suspended">("Active");

  // 1. Resolve Operator Session
  useEffect(() => {
    async function resolveSession() {
      try {
        const { data } = await supabase.auth.getUser();
        if (data?.user) {
          const metaName = data.user.user_metadata?.full_name || data.user.user_metadata?.name;
          if (metaName) setOperatorName(metaName);
          if (data.user.email) setOperatorEmail(data.user.email);
          return;
        }
      } catch {
        // Handled
      }

      try {
        const cachedStaff = localStorage.getItem("gavane_staff_registry");
        if (cachedStaff) {
          const list = JSON.parse(cachedStaff);
          const currentSupport = list.find((s: { module_category: string }) => s.module_category === "Support");
          if (currentSupport) {
            setOperatorName(currentSupport.name);
            setOperatorEmail(currentSupport.email);
          }
        }
      } catch {
        // Handled
      }
    }

    resolveSession();
  }, []);

  // 2. Load Synchronized Patient & Certificate Ledgers
  const loadSupportLedgers = useCallback(async () => {
    const pts = await getSharedPatients();
    setPatients(pts);

    const certs = await getSharedCertificates();
    setCertificates(certs);

    try {
      const cached = localStorage.getItem("gavane_support_master_store");
      if (cached) {
        const parsed = JSON.parse(cached);
        setSupportDataStore(parsed);
        return;
      }
    } catch {
      // Fallback
    }
    setSupportDataStore(INITIAL_SUPPORT_DOMAIN_DATA);
  }, []);

  useEffect(() => {
    loadSupportLedgers();
  }, [loadSupportLedgers]);

  const persistSupportData = (updatedStore: Record<string, SupportTabRecord[]>) => {
    setSupportDataStore(updatedStore);
    try {
      localStorage.setItem("gavane_support_master_store", JSON.stringify(updatedStore));
    } catch {
      // Handled
    }
  };

  // Table Headers
  const getTableHeaders = () => {
    switch (activeModule) {
      case "REGISTRATION":
        return ["Ref ID", "Patient Legal Name", "Phone Number", "Specialty Department", "Assigned Consultant", "Triage / Desk Notes", "Status", "Actions"];
      case "OPD_QUEUE":
        return ["Token / ID", "Patient Legal Name", "Token Number", "Consultation Specialty", "Assigned Doctor", "Queue Schedule / Vitals", "Status", "Actions"];
      case "BILLING":
        return ["Invoice ID", "Patient Name", "Receipt / Bill Ref", "Service Description", "Net Amount (₹)", "Payment Mode & Desk", "Status", "Actions"];
      case "IPD_ADMISSION":
        return ["Admission ID", "Patient Legal Name", "Bed & Ward Assignment", "Department Ward", "Attending Consultant", "Admission Particulars", "Status", "Actions"];
      case "DISCHARGE":
        return ["Discharge ID", "Patient Legal Name", "Summary Reference", "Admitted Ward / Bed", "Attending Physician", "Clearance Checklist", "Status", "Actions"];
      case "CERTIFICATES":
        return ["Cert ID", "Certificate Title", "Patient / Beneficiary", "Clinical Purpose", "Issued Timestamp", "Authorizing Officer", "Status", "Actions"];
      case "HELPDESK":
        return ["Ticket ID", "Inquiry / Request Title", "Citizen Contact", "Service Location / Ward", "Assigned Staff / Unit", "Dispatch Status", "Status", "Actions"];
      default:
        return ["Ref ID", "Primary Subject", "Detail", "Department", "Assigned Person", "Particulars", "Status", "Actions"];
    }
  };

  // Dynamic Modal Form Configurator
  const getModalConfig = () => {
    switch (activeModule) {
      case "REGISTRATION":
        return {
          title: "Register New Patient Record",
          l1: "Patient Full Legal Name", p1: "e.g. Ramesh Jadhav",
          l2: "Contact Mobile Number", p2: "9876543210",
          l3: "Specialty Department", p3: "Cardiology Dept",
          l4: "Assigned Consultant Doctor", p4: "Dr. Priya",
          l5: "Triage / Desk Particulars", p5: "New OPD Consultation booked",
        };
      case "DISCHARGE":
        return {
          title: isEditing ? "Edit Discharge Record" : "Process In-Patient Discharge Clearance",
          l1: "Patient Full Legal Name", p1: "e.g. Amit Patil",
          l2: "Discharge Summary Ref", p2: "DS-2026-204",
          l3: "Admitted Ward / Room", p3: "Orthopedics Ward (Bed 204)",
          l4: "Attending Physician", p4: "Dr. Sudhir Gavane",
          l5: "Clearance Notes / Protocol", p5: "Pharmacy & Billing Cleared",
        };
      case "CERTIFICATES":
        return {
          title: isEditing ? "Edit Certificate" : "Issue / Record Medical Certificate",
          l1: "Certificate Title", p1: "e.g. Medical Fitness",
          l2: "Patient / Citizen Beneficiary", p2: "e.g. Mira Kumar",
          l3: "Clinical Purpose / Reason", p3: "e.g. Employment / Sick Leave",
          l4: "Issued Timestamp / Date", p4: "28/08/2026",
          l5: "Authorizing Officer / Doctor", p5: "Dr. Priya",
        };
      case "OPD_QUEUE":
        return {
          title: isEditing ? "Edit Queue Token" : "Issue New OPD Queue Token",
          l1: "Patient Name", p1: "e.g. Sagar Jadhav",
          l2: "Token Number", p2: "Token #04",
          l3: "Consultation Specialty", p3: "Cardiology Dept",
          l4: "Attending Doctor", p4: "Dr. Priya",
          l5: "Queue Time / Observed Vitals", p5: "11:30 AM Slot • Vitals Checked",
        };
      case "BILLING":
        return {
          title: isEditing ? "Edit Front Desk Bill" : "Generate Front Desk Bill / Collect Payment",
          l1: "Patient Legal Name", p1: "e.g. Sunita Deshmukh",
          l2: "Receipt / Bill Reference", p2: "#GH-REC-903",
          l3: "Service Description", p3: "OPD Consultation Fee",
          l4: "Total Amount (₹ INR)", p4: "500.00",
          l5: "Payment Mode & Cash Desk", p5: "UPI QR (PhonePe) • Counter 1",
        };
      case "IPD_ADMISSION":
        return {
          title: isEditing ? "Edit Bed Allocation" : "Process IPD Bed Admission",
          l1: "Patient Full Name", p1: "e.g. Amit Patil",
          l2: "Assigned Bed & Ward", p2: "Bed 204 (Semi-Private)",
          l3: "Department Ward", p3: "Orthopedics Ward (Floor 2)",
          l4: "Attending Consultant", p4: "Dr. Sudhir Gavane",
          l5: "Admission Notes / Attendant Pass", p5: "Admitted • Attendant Pass #AP-01 Issued",
        };
      case "HELPDESK":
        return {
          title: isEditing ? "Edit Helpdesk Request" : "Log Helpdesk / Ambulance Request",
          l1: "Request / Inquiry Title", p1: "Emergency Ambulance Request",
          l2: "Citizen Contact Number", p2: "+91 94210 55667",
          l3: "Pickup Location / Ward", p3: "Hadapsar, Pune",
          l4: "Assigned Vehicle / Staff", p4: "Driver Santosh (MH-12-GH-01)",
          l5: "Action Particulars", p5: "Ambulance Dispatched",
        };
      default:
        return {
          title: `Create ${activeModule} Entry`,
          l1: "Primary Title / Name", p1: "Enter primary name...",
          l2: "Specification / Detail", p2: "Enter details...",
          l3: "Department / Section", p3: "Enter department...",
          l4: "Contact / Value / Doctor", p4: "Enter value...",
          l5: "Desk Notes / Remarks", p5: "Enter notes...",
        };
    }
  };

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setEditTargetId(null);
    setFormCol1("");
    setFormCol2("");
    setFormCol3(activeModule === "REGISTRATION" ? "Cardiology Dept" : activeModule === "CERTIFICATES" ? "Employment" : "");
    setFormCol4(activeModule === "REGISTRATION" ? "Dr. Priya" : activeModule === "CERTIFICATES" ? "28/08/2026" : "");
    setFormCol5(activeModule === "CERTIFICATES" ? "Dr. Priya" : "");
    setFormStatus("Active");
    setShowModal(true);
  };

  const handleOpenEditModal = (item: SupportTabRecord | SharedCertificate) => {
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
        assigned_doctor: formCol4 || "Dr. Priya",
        notes: formCol5 || `Registered via Front Desk (${operatorName})`,
        status: formStatus === "Pending" ? "Pending" : "Active",
        created_at: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      };

      const updated = await saveSharedPatient(newPt);
      setPatients(updated);
      setFeedback({ type: "success", text: `Patient ${formCol1} registered. Visible to Admin & Doctor portals.` });
      setShowModal(false);
      return;
    }

    if (activeModule === "CERTIFICATES") {
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      const certObj: SharedCertificate = {
        id: editTargetId || `cert-${Date.now()}`,
        reference_id: isEditing && editTargetId ? (certificates.find((c) => c.id === editTargetId)?.reference_id || `GH-2026-${randomSuffix}`) : `GH-2026-SUP${randomSuffix}`,
        certificate_title: formCol1,
        patient_name: formCol2,
        purpose: formCol3,
        issued_date: formCol4 || "28/08/2026",
        authorizing_doctor: formCol5 || "Dr. Priya",
        status: formStatus,
        created_at: new Date().toLocaleDateString("en-IN"),
      };

      const updatedCerts = await saveSharedCertificate(certObj);
      setCertificates(updatedCerts);
      setFeedback({ type: "success", text: `Certificate for ${formCol2} saved. Synced to Admin & Doctor portals.` });
      setShowModal(false);
      return;
    }

    const currentTabRecords = supportDataStore[activeModule] || [];
    const randomSuffix = Math.floor(100 + Math.random() * 900);

    let updatedList: SupportTabRecord[] = [];
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
      const newRecord: SupportTabRecord = {
        id: `sup-${activeModule.toLowerCase()}-${Date.now()}`,
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
      setFeedback({ type: "success", text: `Added new entry to ${activeModule} front desk ledger.` });
    }

    const updatedStore = {
      ...supportDataStore,
      [activeModule]: updatedList,
    };

    persistSupportData(updatedStore);
    setShowModal(false);
  };

  const handleDeleteEntry = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove record for ${name}?`)) return;

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

    const currentTabRecords = supportDataStore[activeModule] || [];
    const updatedList = currentTabRecords.filter((r) => r.id !== id);
    const updatedStore = { ...supportDataStore, [activeModule]: updatedList };

    persistSupportData(updatedStore);
    setFeedback({ type: "success", text: `Removed record for ${name}.` });
  };

  // Resolve Records for Active Tab
  let currentRecords: (SupportTabRecord | { id: string; reference_id: string; col1: string; col2: string; col3: string; col4: string; col5: string; status: "Active" | "Pending" | "Completed" | "Suspended"; created_at?: string })[] = [];

  if (activeModule === "REGISTRATION") {
    currentRecords = patients.map((p) => ({
      id: p.id,
      reference_id: p.reference_id,
      category: "REGISTRATION",
      col1: p.full_name,
      col2: p.phone,
      col3: p.department,
      col4: p.assigned_doctor,
      col5: p.notes || "Standard Triage Checked",
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
    currentRecords = supportDataStore[activeModule] || [];
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
        roleIcon="👥"
        loggedAsText={`${operatorName} (${operatorEmail})`}
        roleSubtitle="Front Desk Reception & Support Operations"
        bannerText="Front Desk Reception, Patient Registration & Clearance Gateway"
      />

      <div className="flex flex-1 overflow-hidden">
        <DashboardSidebar
          modules={SUPPORT_SIDEBAR_MODULES}
          activeModule={activeModule}
          onSelectModule={(id) => {
            setActiveModule(id);
            setSearchTerm("");
          }}
          sectionTitle="Support Modules"
        />

        <main className="flex-1 p-5 overflow-y-auto space-y-5">
          {/* Top Control Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 px-2 py-1">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-teal-500"></span>
              <span>Active Front Desk Workspace: <strong className="text-teal-700 uppercase">{activeModule}</strong></span>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
              <button
                onClick={loadSupportLedgers}
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
                <span>Add {activeModule === "REGISTRATION" ? "Patient" : activeModule === "CERTIFICATES" ? "Certificate" : activeModule === "DISCHARGE" ? "Discharge Record" : `${activeModule} Record`}</span>
              </button>
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

          {/* Dynamic Master Table Container */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight uppercase">
                  {activeModule === "REGISTRATION"
                    ? "Patient Registration Ledger"
                    : activeModule === "CERTIFICATES"
                    ? "Medical Certificates Control Ledger"
                    : activeModule === "DISCHARGE"
                    ? "In-Patient Discharge Clearance Ledger"
                    : `${activeModule} Front Desk Ledger`}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  Authorized Support Operations • Desk Officer: <strong className="text-teal-700">{operatorName}</strong> • Showing {filteredRecords.length} Monitored Record(s)
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
              totalLabel={`Total ${activeModule} Queue`}
              activeLabel="Active / Cleared"
              pendingLabel="Pending Check-Ins"
            />

            {/* Context-Aware Data Table */}
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
                        No {activeModule} records found. Click &quot;+ Add Record&quot; above to log an entry.
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
                            onClick={() => handleOpenEditModal(item as SupportTabRecord)}
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
        <div>Current Session :- <strong className="text-teal-400">{operatorName} ({operatorEmail}) • Front Desk Node</strong></div>
        <div>Powered by <strong className="text-slate-200">Shourya Technologies</strong> • Status: <span className="text-emerald-400 font-bold">Connected</span></div>
      </footer>

      {/* Dynamic Context-Aware Modal */}
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
                  <option value="Active">Active / In Progress</option>
                  <option value="Pending">Pending Check-In / Clearance</option>
                  <option value="Completed">Completed / Cleared</option>
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