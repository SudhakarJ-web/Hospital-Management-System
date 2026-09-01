"use client";

import React, { useState, useEffect, useCallback } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardSidebar, { SidebarModule } from "@/components/dashboard/DashboardSidebar";

// Import modular tab views
import MasterOverviewTab from "@/components/dashboard/admin/MasterOverviewTab";
import DoctorsTab from "@/components/dashboard/admin/DoctorsTab";
import SupportTab from "@/components/dashboard/admin/SupportTab";
import MedicalTab from "@/components/dashboard/admin/MedicalTab";
import RegistrationTab from "@/components/dashboard/admin/RegistrationTab";
import GenericModuleTab from "@/components/dashboard/admin/GenericModuleTab";
import StockTab from "@/components/dashboard/admin/StockTab";
import BillingTab from "@/components/dashboard/admin/BillingTab";
import AnalysisTab from "@/components/dashboard/admin/AnalysisTab";
import UtilityTab from "@/components/dashboard/admin/UtilityTab";
import BackupTab from "@/components/dashboard/admin/BackupTab";
import CertificatesTab from "@/components/dashboard/admin/CertificatesTab";

import { getSharedPatients, saveSharedPatient, SharedPatient } from "@/lib/sync/patientsSync";
import {
  getSharedCertificates,
  saveSharedCertificate,
  deleteSharedCertificate,
  SharedCertificate,
} from "@/lib/sync/certificatesSync";

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
  MASTER: [
    {
      id: "mst-1",
      reference_id: "GH-MST-001",
      category: "MASTER",
      col1: "Cardiology & Cardiac Sciences",
      col2: "Head: Dr. Ananya Rao",
      col3: "Building A • Floor 3",
      col4: "24 Beds Active • 4 CCU",
      col5: "₹500 Base OPD",
      status: "Active",
      created_at: "27/08/2026",
    },
    {
      id: "mst-2",
      reference_id: "GH-MST-002",
      category: "MASTER",
      col1: "Trauma & Emergency Care Unit",
      col2: "Head: Dr. Sudhir Gavane",
      col3: "Ground Floor Triage",
      col4: "12 Acute Bays • 2 Resus",
      col5: "24/7 Dedicated Team",
      status: "Active",
      created_at: "27/08/2026",
    },
    {
      id: "mst-3",
      reference_id: "GH-MST-003",
      category: "MASTER",
      col1: "Pediatrics & Neonatal Care",
      col2: "Head: Dr. Priya",
      col3: "Building B • Floor 2",
      col4: "18 Beds • 6 NICU Bays",
      col5: "₹500 Base OPD",
      status: "Active",
      created_at: "27/08/2026",
    },
    {
      id: "mst-4",
      reference_id: "GH-MST-004",
      category: "MASTER",
      col1: "Central Diagnostic Pathology Lab",
      col2: "In-Charge: Kiran Deshmukh",
      col3: "Building A • Basement 1",
      col4: "NABL Certified Node",
      col5: "High-Throughput CBC/Bio",
      status: "Active",
      created_at: "27/08/2026",
    },
  ],
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
  const [activeModule, setActiveModule] = useState<string>("MASTER");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [dataStore, setDataStore] = useState<Record<string, UnifiedRecord[]>>(INITIAL_DOMAIN_DATA);
  const [sharedPatients, setSharedPatients] = useState<SharedPatient[]>([]);
  const [sharedCertificates, setSharedCertificates] = useState<SharedCertificate[]>([]);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modal State
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editTargetId, setEditTargetId] = useState<string | null>(null);
  const [formCol1, setFormCol1] = useState("");
  const [formCol2, setFormCol2] = useState("");
  const [formCol3, setFormCol3] = useState("");
  const [formCol4, setFormCol4] = useState("");
  const [formCol5, setFormCol5] = useState("");
  const [formStatus, setFormStatus] = useState<"Active" | "Pending" | "Completed" | "Suspended">("Active");

  const loadAllLedgers = useCallback(async () => {
    const pts = await getSharedPatients();
    setSharedPatients(pts);

    const certs = await getSharedCertificates();
    setSharedCertificates(certs);

    try {
      const cached = localStorage.getItem("gavane_admin_master_store");
      if (cached) setDataStore(JSON.parse(cached));
    } catch {}
  }, []);

  useEffect(() => {
    loadAllLedgers();
  }, [loadAllLedgers]);

  const persistData = (updatedStore: Record<string, UnifiedRecord[]>) => {
    setDataStore(updatedStore);
    try {
      localStorage.setItem("gavane_admin_master_store", JSON.stringify(updatedStore));
    } catch {}
  };

  const getGenericHeaders = (mod: string) => {
    switch (mod) {
      case "OPD":
        return ["Token / ID", "Patient Legal Name", "Token Number", "Consultation Specialty", "Observed Vitals", "Assigned Doctor", "Status", "Controls"];
      case "IPD":
        return ["Admission ID", "Patient Legal Name", "Bed & Ward Assignment", "Department Ward", "Admission Date", "Attending Consultant", "Status", "Controls"];
      case "OT":
        return ["Surgery ID", "Surgical Procedure", "Patient Name", "OT Theater Complex", "Scheduled Slot", "Chief Surgeon", "Status", "Controls"];
      case "Radiology":
        return ["Scan ID", "Imaging Investigation", "Patient Name", "Radiology Suite", "Request Timestamp", "Technician / Radiologist", "Status", "Controls"];
      case "Pathology":
        return ["Sample ID", "Diagnostic Panel", "Sample Identifier", "Lab Section", "Patient Name", "Technician / Notes", "Status", "Controls"];
      default:
        return ["Ref ID", "Primary Subject", "Detail", "Department", "Metadata", "Owner / Notes", "Status", "Controls"];
    }
  };

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setEditTargetId(null);
    setFormCol1("");
    setFormCol2("");
    setFormCol3("");
    setFormCol4("");
    setFormCol5("");
    setFormStatus("Active");
    setShowModal(true);
  };

  const handleOpenEditModal = (item: UnifiedRecord) => {
    setIsEditing(true);
    setEditTargetId(item.id);
    setFormCol1(item.col1);
    setFormCol2(item.col2);
    setFormCol3(item.col3);
    setFormCol4(item.col4);
    setFormCol5(item.col5);
    setFormStatus(item.status);
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
      setFeedback({ type: "success", text: `Patient ${formCol1} registered.` });
      setShowModal(false);
      return;
    }

    if (activeModule === "Certificates") {
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      const certObj: SharedCertificate = {
        id: editTargetId || `cert-${Date.now()}`,
        reference_id: `GH-2026-${randomSuffix}`,
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
      setFeedback({ type: "success", text: `Certificate for ${formCol2} saved.` });
      setShowModal(false);
      return;
    }

    const currentTabRecords = dataStore[activeModule] || [];
    const randomSuffix = Math.floor(100 + Math.random() * 900);

    let updatedList: UnifiedRecord[] = [];
    if (isEditing && editTargetId) {
      updatedList = currentTabRecords.map((r) =>
        r.id === editTargetId
          ? { ...r, col1: formCol1, col2: formCol2, col3: formCol3, col4: formCol4, col5: formCol5, status: formStatus }
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
      setFeedback({ type: "success", text: `Added new entry into ${activeModule} ledger.` });
    }

    const updatedStore = { ...dataStore, [activeModule]: updatedList };
    persistData(updatedStore);
    setShowModal(false);
  };

  const handleDeleteEntry = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;

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
    setFeedback({ type: "success", text: `Removed ${name}.` });
  };

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex flex-col font-sans text-slate-800">
      <DashboardHeader
        roleIcon="✓"
        loggedAsText="Admin (admin@gavanehospital.in)"
        roleSubtitle="Central Administrative Desk"
        bannerText="Welcome to Gavane Hospital Management System"
      />

      {/* Mobile Switch Bar */}
      <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-2 text-xs font-bold text-white truncate">
          <span className="text-teal-400">🏢 Module:</span>
          <span className="uppercase text-teal-300 truncate">{activeModule} DESK</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center space-x-1"
        >
          <span>{mobileMenuOpen ? "✕ Close" : "☰ Switch Module"}</span>
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        <div className="hidden lg:block">
          <DashboardSidebar
            modules={ADMIN_MODULES}
            activeModule={activeModule}
            onSelectModule={(id) => {
              setActiveModule(id);
              setSearchTerm("");
            }}
            sectionTitle="Master Modules"
          />
        </div>

        {/* Mobile Sidebar Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex flex-col bg-slate-950/80 backdrop-blur-sm">
            <div className="w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-left duration-200">
              <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
                <span className="font-bold text-xs uppercase tracking-wider text-teal-400">Hospital Modules</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 font-bold hover:text-white"
                >
                  ✕
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-1">
                {ADMIN_MODULES.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setActiveModule(m.id);
                      setSearchTerm("");
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      activeModule === m.id ? "bg-teal-600 text-white shadow-sm" : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <span>{m.icon}</span>
                      <span className="truncate">{m.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
          </div>
        )}

        {/* Main Orchestrator Workspace */}
        <main className="flex-1 p-3 sm:p-5 overflow-y-auto space-y-4 sm:space-y-5 min-w-0">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 px-1 py-0.5 min-w-0">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-teal-500 shrink-0"></span>
              <span className="truncate">Active Workspace: <strong className="text-teal-700 uppercase">{activeModule} Management Desk</strong></span>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto justify-end shrink-0">
              <button
                onClick={loadAllLedgers}
                className="flex-1 sm:flex-none px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold rounded-lg transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <span>🔄</span>
                <span>Sync Live</span>
              </button>

              <button
                onClick={handleOpenAddModal}
                className="flex-1 sm:flex-none px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <span>+</span>
                <span>Add {activeModule} Entry</span>
              </button>
            </div>
          </div>

          {feedback && (
            <div className="p-3 rounded-xl border text-xs font-bold bg-emerald-50 border-emerald-300 text-emerald-900 flex justify-between items-center">
              <span>{feedback.text}</span>
              <button onClick={() => setFeedback(null)} className="font-bold px-2 py-0.5">✕</button>
            </div>
          )}

          {/* Conditional Modular Tab Renderers */}
          {activeModule === "MASTER" && (
            <MasterOverviewTab
              records={dataStore.MASTER || []}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onOpenAddModal={handleOpenAddModal}
              onOpenEditModal={handleOpenEditModal}
              onDeleteRecord={handleDeleteEntry}
              activeDoctorsCount={dataStore.Doctors?.length || 2}
              totalRegisteredPatients={sharedPatients.length}
              activeOtCount={dataStore.OT?.length || 1}
            />
          )}

          {activeModule === "Doctors" && (
            <DoctorsTab
              records={dataStore.Doctors || []}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onOpenEditModal={handleOpenEditModal}
              onDeleteRecord={handleDeleteEntry}
            />
          )}

          {activeModule === "Support" && (
            <SupportTab
              records={dataStore.Support || []}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onOpenEditModal={handleOpenEditModal}
              onDeleteRecord={handleDeleteEntry}
            />
          )}

          {activeModule === "Medical" && (
            <MedicalTab
              records={dataStore.Medical || []}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onOpenEditModal={handleOpenEditModal}
              onDeleteRecord={handleDeleteEntry}
            />
          )}

          {activeModule === "Registration" && (
            <RegistrationTab
              patients={sharedPatients}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onDeletePatient={handleDeleteEntry}
            />
          )}

          {activeModule === "Stock" && (
            <StockTab
              records={dataStore.Stock || []}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onOpenEditModal={handleOpenEditModal}
              onDeleteRecord={handleDeleteEntry}
            />
          )}

          {activeModule === "Billing" && (
            <BillingTab
              records={dataStore.Billing || []}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onOpenEditModal={handleOpenEditModal}
              onDeleteRecord={handleDeleteEntry}
            />
          )}

          {activeModule === "Analysis" && (
            <AnalysisTab
              records={dataStore.Analysis || []}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onOpenEditModal={handleOpenEditModal}
              onDeleteRecord={handleDeleteEntry}
            />
          )}

          {activeModule === "Utility" && (
            <UtilityTab
              records={dataStore.Utility || []}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onOpenEditModal={handleOpenEditModal}
              onDeleteRecord={handleDeleteEntry}
            />
          )}

          {activeModule === "Backup" && (
            <BackupTab
              records={dataStore.Backup || []}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onOpenEditModal={handleOpenEditModal}
              onDeleteRecord={handleDeleteEntry}
            />
          )}

          {activeModule === "Certificates" && (
            <CertificatesTab
              certificates={sharedCertificates}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onDeleteCertificate={handleDeleteEntry}
            />
          )}

          {["OPD", "IPD", "OT", "Radiology", "Pathology"].includes(activeModule) && (
            <GenericModuleTab
              moduleName={activeModule}
              records={dataStore[activeModule] || []}
              headers={getGenericHeaders(activeModule)}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onOpenEditModal={handleOpenEditModal}
              onDeleteRecord={handleDeleteEntry}
            />
          )}
        </main>
      </div>

      <footer className="bg-[#0b1b2b] text-slate-400 px-4 py-2 text-[10px] flex flex-col sm:flex-row items-center justify-between border-t border-slate-800 gap-1 text-center sm:text-left">
        <div>Current User :- <strong className="text-teal-400">Admin Console • Pune Central Node</strong></div>
        <div>Powered by <strong className="text-slate-200">Shourya Technologies</strong> • Status: <span className="text-emerald-400 font-bold">Connected</span></div>
      </footer>

      {/* Dynamic Creation / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full p-5 sm:p-6 space-y-4 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-extrabold text-slate-900">
                {isEditing ? `Edit ${activeModule} Entry` : `New ${activeModule} Entry`}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSaveModalEntry} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Primary Title / Name *</label>
                <input
                  type="text"
                  required
                  value={formCol1}
                  onChange={(e) => setFormCol1(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Specification / Role *</label>
                  <input
                    type="text"
                    required
                    value={formCol2}
                    onChange={(e) => setFormCol2(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Department / Location *</label>
                  <input
                    type="text"
                    required
                    value={formCol3}
                    onChange={(e) => setFormCol3(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Contact / Units / Time *</label>
                  <input
                    type="text"
                    required
                    value={formCol4}
                    onChange={(e) => setFormCol4(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Fee / Expiry / Notes *</label>
                  <input
                    type="text"
                    required
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
                  <option value="Completed">Completed / Cleared</option>
                  <option value="Suspended">Suspended / Inactive</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-slate-100 text-xs font-bold rounded-lg cursor-pointer">
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer"
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