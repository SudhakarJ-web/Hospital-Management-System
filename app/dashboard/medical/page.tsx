"use client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

import React, { useState, useEffect, useCallback } from "react";
import DashboardHeader from "../../../components/dashboard/DashboardHeader";
import DashboardSidebar, { SidebarModule } from "../../../components/dashboard/DashboardSidebar";
import MetricsStrip from "../../../components/dashboard/MetricsStrip";
import { supabase } from "../../../lib/supabase";

const MEDICAL_SIDEBAR_MODULES: SidebarModule[] = [
  { id: "PHARMACY_STOCK", label: "PHARMACY STOCK & DRUGS", icon: "💊" },
  { id: "DISPENSARY", label: "PRESCRIPTION DISPENSARY", icon: "📦" },
  { id: "PATHOLOGY_LAB", label: "PATHOLOGY REAGENTS & KITS", icon: "🔬" },
  { id: "RADIOLOGY_SUPPLIES", label: "RADIOLOGY FILMS & CONSUMABLES", icon: "📡" },
  { id: "SUPPLIERS", label: "SUPPLIERS & PO ORDERS", icon: "🚚" },
  { id: "EXPIRED_LEDGER", label: "AUDIT & EXPIRED LOGS", icon: "⚠️" },
];

export interface MedicalTabRecord {
  id: string;
  reference_id: string;
  category: string;
  col1: string; // Drug Name / Rx Patient / Kit Name / Supplier
  col2: string; // SKU / Rx ID / Batch / PO Number
  col3: string; // Dosage Form / Section / Distributor / Volume
  col4: string; // Units / Unit Price / Total / Tests
  col5: string; // Expiry / Doctor / Tracking / Disposal Notes
  status: "Active" | "Pending" | "Completed" | "Suspended";
  created_at: string;
}

const INITIAL_MEDICAL_DOMAIN_DATA: Record<string, MedicalTabRecord[]> = {
  PHARMACY_STOCK: [
    {
      id: "med-stk-1",
      reference_id: "MED-2026-881",
      category: "PHARMACY_STOCK",
      col1: "Tab. Paracetamol 650mg (Dolo)",
      col2: "SKU: TAB-DOLO-650",
      col3: "Oral Tablet • Strip of 15",
      col4: "4,500 Units • ₹2.50/unit",
      col5: "Batch: BAT-2026-X01 • Exp: 12/2027",
      status: "Active",
      created_at: "20/08/2026",
    },
    {
      id: "med-stk-2",
      reference_id: "MED-2026-882",
      category: "PHARMACY_STOCK",
      col1: "Inj. Ceftriaxone 1g (IV)",
      col2: "SKU: INJ-CEF-1G",
      col3: "Injectable Vial + Sterile Water",
      col4: "35 Units • ₹65.00/unit",
      col5: "Batch: BAT-2026-Y89 • Exp: 06/2027",
      status: "Pending",
      created_at: "20/08/2026",
    },
    {
      id: "med-stk-3",
      reference_id: "MED-2026-883",
      category: "PHARMACY_STOCK",
      col1: "Tab. Azithromycin 500mg (Azee)",
      col2: "SKU: TAB-AZI-500",
      col3: "Oral Tablet • Strip of 5",
      col4: "850 Units • ₹18.00/unit",
      col5: "Batch: BAT-2026-Z12 • Exp: 09/2028",
      status: "Active",
      created_at: "22/08/2026",
    },
    {
      id: "med-stk-4",
      reference_id: "MED-2026-884",
      category: "PHARMACY_STOCK",
      col1: "IV Normal Saline 0.9% (500ml)",
      col2: "SKU: IV-NS-500",
      col3: "Infusion Bottle • Polyethylene",
      col4: "620 Units • ₹38.00/unit",
      col5: "Batch: BAT-2026-NS09 • Exp: 04/2028",
      status: "Active",
      created_at: "25/08/2026",
    },
  ],
  DISPENSARY: [
    {
      id: "med-disp-1",
      reference_id: "RX-2026-101",
      category: "DISPENSARY",
      col1: "Ramesh Kulkarni",
      col2: "EHR Rx Ref #GH-EHR-901",
      col3: "Tab. Paracetamol 650mg (1-0-1)",
      col4: "Total Items: 10 Tabs",
      col5: "Prescribed: Dr. Ananya Rao • Counter 1",
      status: "Completed",
      created_at: "Today 10:45 AM",
    },
    {
      id: "med-disp-2",
      reference_id: "RX-2026-102",
      category: "DISPENSARY",
      col1: "Sagar Jadhav",
      col2: "EHR Rx Ref #GH-EHR-902",
      col3: "Tab. Atorvastatin 20mg + Tab. Aspirin 75mg",
      col4: "Total Items: 30 Tabs",
      col5: "Prescribed: Dr. Priya • Queue #02",
      status: "Active",
      created_at: "Today 11:00 AM",
    },
  ],
  PATHOLOGY_LAB: [
    {
      id: "med-lab-1",
      reference_id: "REAG-2026-001",
      category: "PATHOLOGY_LAB",
      col1: "CBC Automated Lyse Reagent (500ml)",
      col2: "SKU: LAB-CBC-LYSE",
      col3: "Hematology 5-Part Cell Counter",
      col4: "12 Bottles • 2,400 Tests",
      col5: "Lot: REAG-091 • Exp: 03/2027",
      status: "Active",
      created_at: "18/08/2026",
    },
    {
      id: "med-lab-2",
      reference_id: "REAG-2026-002",
      category: "PATHOLOGY_LAB",
      col1: "Glucose Hexokinase Assay Kit",
      col2: "SKU: LAB-GLU-HEX",
      col3: "Biochemistry Clinical Analyzer",
      col4: "4 Kits • 800 Determinations",
      col5: "Lot: REAG-114 • Exp: 11/2026",
      status: "Pending",
      created_at: "19/08/2026",
    },
  ],
  RADIOLOGY_SUPPLIES: [
    {
      id: "med-rad-1",
      reference_id: "RAD-2026-551",
      category: "RADIOLOGY_SUPPLIES",
      col1: "Digital X-Ray Film (10x12 Inch)",
      col2: "SKU: RAD-FILM-1012",
      col3: "Carestream DryView Laser Imager",
      col4: "18 Packs • 125 Sheets/pack",
      col5: "Lot: RAD-552 • Exp: 10/2028",
      status: "Active",
      created_at: "15/08/2026",
    },
    {
      id: "med-rad-2",
      reference_id: "RAD-2026-552",
      category: "RADIOLOGY_SUPPLIES",
      col1: "Omnipaque 350mg Non-Ionic Contrast (50ml)",
      col2: "SKU: RAD-CONT-350",
      col3: "CT & Fluoroscopy Imaging",
      col4: "42 Vials • ₹1,450.00/vial",
      col5: "Lot: RAD-OMN-88 • Exp: 01/2028",
      status: "Active",
      created_at: "16/08/2026",
    },
  ],
  SUPPLIERS: [
    {
      id: "med-sup-1",
      reference_id: "PO-2026-9041",
      category: "SUPPLIERS",
      col1: "Maharashtra Pharma Distributors Pvt Ltd",
      col2: "PO Ref: #PO-AUG-2026-01",
      col3: "Antibiotics & IV Fluids Consignment",
      col4: "Invoice Total: ₹1,45,800.00",
      col5: "Delivered & Stock Verified (Invoice Cleared)",
      status: "Completed",
      created_at: "24/08/2026",
    },
    {
      id: "med-sup-2",
      reference_id: "PO-2026-9042",
      category: "SUPPLIERS",
      col1: "Siemens Healthineers India Diagnostics",
      col2: "PO Ref: #PO-AUG-2026-02",
      col3: "Auto-Analyzer Diagnostic Reagent Cartridges",
      col4: "Invoice Total: ₹84,200.00",
      col5: "Dispatched from Pune Hub • In Transit",
      status: "Pending",
      created_at: "27/08/2026",
    },
  ],
  EXPIRED_LEDGER: [
    {
      id: "med-exp-1",
      reference_id: "AUD-EXP-2026-01",
      category: "EXPIRED_LEDGER",
      col1: "Tab. Amoxicillin 250mg DT",
      col2: "Quarantined SKU: TAB-AMX-250",
      col3: "Batch: BAT-2024-Q11",
      col4: "Expired Qty: 40 Strips",
      col5: "Incineration Log #INC-44 • DPDP Compliant",
      status: "Completed",
      created_at: "27/08/2026",
    },
  ],
};

export default function MedicalDashboardPage() {
  const [activeModule, setActiveModule] = useState<string>("PHARMACY_STOCK");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Pharmacist Operator Session State
  const [pharmacistName, setPharmacistName] = useState<string>("Priya Nair");
  const [pharmacistEmail, setPharmacistEmail] = useState<string>("medical@gavanehospital.in");

  // Domain Store
  const [medicalDataStore, setMedicalDataStore] = useState<Record<string, MedicalTabRecord[]>>(INITIAL_MEDICAL_DOMAIN_DATA);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Dynamic Context-Aware Modal State
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editTargetId, setEditTargetId] = useState<string | null>(null);

  // Modal Input Fields
  const [formCol1, setFormCol1] = useState("");
  const [formCol2, setFormCol2] = useState("");
  const [formCol3, setFormCol3] = useState("");
  const [formCol4, setFormCol4] = useState("");
  const [formCol5, setFormCol5] = useState("");
  const [formStatus, setFormStatus] = useState<"Active" | "Pending" | "Completed" | "Suspended">("Active");

  // 1. Resolve Pharmacist Operator Session
  useEffect(() => {
    async function resolveSession() {
      try {
        const { data } = await supabase.auth.getUser();
        if (data?.user) {
          const metaName = data.user.user_metadata?.full_name || data.user.user_metadata?.name;
          if (metaName) setPharmacistName(metaName);
          if (data.user.email) setPharmacistEmail(data.user.email);
          return;
        }
      } catch {
        // Handled
      }

      try {
        const cachedStaff = localStorage.getItem("gavane_staff_registry");
        if (cachedStaff) {
          const list = JSON.parse(cachedStaff);
          const currentMedical = list.find((s: { module_category: string }) => s.module_category === "Medical");
          if (currentMedical) {
            setPharmacistName(currentMedical.name);
            setPharmacistEmail(currentMedical.email);
          }
        }
      } catch {
        // Handled
      }
    }

    resolveSession();
  }, []);

  // 2. Load Synchronized Medical Store
  const loadMedicalLedgers = useCallback(async () => {
    try {
      const cached = localStorage.getItem("gavane_medical_master_store");
      if (cached) {
        const parsed = JSON.parse(cached);
        setMedicalDataStore(parsed);
        return;
      }
    } catch {
      // Fallback
    }
    setMedicalDataStore(INITIAL_MEDICAL_DOMAIN_DATA);
  }, []);

  useEffect(() => {
    loadMedicalLedgers();
  }, [loadMedicalLedgers]);

  const persistMedicalData = (updatedStore: Record<string, MedicalTabRecord[]>) => {
    setMedicalDataStore(updatedStore);
    try {
      localStorage.setItem("gavane_medical_master_store", JSON.stringify(updatedStore));
    } catch {
      // Handled
    }
  };

  // Table Headers by Module
  const getTableHeaders = () => {
    switch (activeModule) {
      case "PHARMACY_STOCK":
        return ["SKU / Item ID", "Medication & Strength", "SKU / Package Type", "Dosage Form & Packing", "Stock Units & MRP", "Batch No & Expiry", "Status", "Actions"];
      case "DISPENSARY":
        return ["Rx ID", "Patient Legal Name", "Prescription Reference", "Prescribed Medications", "Total Items Prescribed", "Prescribing Doctor", "Status", "Actions"];
      case "PATHOLOGY_LAB":
        return ["Reagent ID", "Assay / Kit Description", "SKU Identifier", "Analyzer Instrument", "Available Volume / Tests", "Lot No & Expiry", "Status", "Actions"];
      case "RADIOLOGY_SUPPLIES":
        return ["Item ID", "Film / Contrast Material", "SKU Reference", "Modality Suite & Device", "Available Inventory", "Lot No & Expiry", "Status", "Actions"];
      case "SUPPLIERS":
        return ["PO Number", "Distributor / Agency Name", "PO Reference ID", "Consignment Particulars", "Net Invoice Total", "Consignment Tracking", "Status", "Actions"];
      case "EXPIRED_LEDGER":
        return ["Audit Ref", "Quarantined Medication", "SKU Code", "Batch Code Number", "Condemned Quantity", "Disposal Protocol Log", "Status", "Actions"];
      default:
        return ["Item ID", "Primary Name", "Code", "Section", "Quantity / Price", "Expiry / Details", "Status", "Actions"];
    }
  };

  // Dynamic Modal Configurator
  const getModalConfig = () => {
    switch (activeModule) {
      case "PHARMACY_STOCK":
        return {
          title: isEditing ? "Edit Medication Item" : "Add Medication / Drug to Pharmacy Stock",
          l1: "Medication Name & Strength", p1: "e.g. Tab. Azithromycin 500mg",
          l2: "SKU Identifier Code", p2: "e.g. TAB-AZI-500",
          l3: "Dosage Form & Packaging", p3: "Oral Tablet • Strip of 5",
          l4: "Stock Quantity & Unit MRP", p4: "850 Units • ₹18.00/unit",
          l5: "Batch Code & Expiry Date", p5: "Batch: BAT-2026-Z12 • Exp: 09/2028",
        };
      case "DISPENSARY":
        return {
          title: isEditing ? "Edit Prescription Fill" : "Log Prescription Dispensation",
          l1: "Patient Legal Name", p1: "e.g. Sagar Jadhav",
          l2: "EHR Prescription Reference", p2: "#GH-EHR-903",
          l3: "Dispensed Medications", p3: "Tab. Paracetamol 650mg + Inj. Ceftriaxone",
          l4: "Total Item Quantity", p4: "15 Tablets / 1 Vial",
          l5: "Prescribing Physician", p5: "Dr. Priya (Cardiology)",
        };
      case "PATHOLOGY_LAB":
        return {
          title: isEditing ? "Edit Lab Reagent" : "Add Pathology Diagnostic Kit / Reagent",
          l1: "Reagent / Assay Kit Name", p1: "e.g. Lipid Profile Reagent Kit",
          l2: "SKU Code", p2: "LAB-LIP-KIT",
          l3: "Analyzer Section", p3: "Biochemistry Clinical Auto-Analyzer",
          l4: "Available Tests / Determinations", p4: "10 Kits • 1,000 Tests",
          l5: "Lot Number & Expiry Date", p5: "Lot: REAG-441 • Exp: 05/2027",
        };
      case "RADIOLOGY_SUPPLIES":
        return {
          title: isEditing ? "Edit Radiology Supply" : "Add Radiology Consumable / Contrast",
          l1: "Supply / Film / Contrast Name", p1: "e.g. Digital X-Ray Film 10x12",
          l2: "SKU Identifier", p2: "RAD-FILM-1012",
          l3: "Imaging Suite / Device", p3: "X-Ray Suite 1 Imager",
          l4: "Stock Balance & Unit Price", p4: "20 Packs • ₹3,200.00/pack",
          l5: "Lot Number & Expiry", p5: "Lot: RAD-552 • Exp: 10/2028",
        };
      case "SUPPLIERS":
        return {
          title: isEditing ? "Edit Purchase Order" : "Generate Purchase Order (PO) to Supplier",
          l1: "Supplier / Distributor Agency", p1: "e.g. Maharashtra Pharma Distributors",
          l2: "PO Reference Code", p2: "#PO-AUG-2026-03",
          l3: "Ordered Supply Items", p3: "Antibiotics, IV Fluids, Reagent Kits",
          l4: "Net Invoice Total (₹ INR)", p4: "₹1,25,000.00",
          l5: "Delivery Tracking Status", p5: "Dispatched from Depot • In Transit",
        };
      case "EXPIRED_LEDGER":
        return {
          title: isEditing ? "Edit Audit Record" : "Quarantine & Log Expired Medication",
          l1: "Medication / Reagent Name", p1: "e.g. Tab. Amoxicillin 250mg DT",
          l2: "Quarantined SKU Identifier", p2: "TAB-AMX-250",
          l3: "Condemned Batch Lot Number", p3: "BAT-2024-Q11",
          l4: "Total Expired Quantity", p4: "40 Strips",
          l5: "Disposal Protocol & Incineration Log", p5: "Incineration Log #INC-44 • DPDP Compliant",
        };
      default:
        return {
          title: `Create ${activeModule} Entry`,
          l1: "Primary Item / Title", p1: "Enter primary name...",
          l2: "SKU / Code / Identifier", p2: "Enter code...",
          l3: "Classification / Form", p3: "Enter form...",
          l4: "Units / Value", p4: "Enter units...",
          l5: "Expiry / Notes", p5: "Enter expiry...",
        };
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

  const handleOpenEditModal = (item: MedicalTabRecord) => {
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

  const handleSaveModalEntry = (e: React.FormEvent) => {
    e.preventDefault();

    const currentTabRecords = medicalDataStore[activeModule] || [];
    const randomSuffix = Math.floor(100 + Math.random() * 900);

    let updatedList: MedicalTabRecord[] = [];
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
      const newRecord: MedicalTabRecord = {
        id: `med-${activeModule.toLowerCase()}-${Date.now()}`,
        reference_id: `MED-2026-${randomSuffix}`,
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
      setFeedback({ type: "success", text: `Added new entry to ${activeModule} inventory ledger.` });
    }

    const updatedStore = {
      ...medicalDataStore,
      [activeModule]: updatedList,
    };

    persistMedicalData(updatedStore);
    setShowModal(false);
  };

  const handleDeleteEntry = (id: string, name: string) => {
    if (!confirm(`Are you sure you want to retire record for ${name}?`)) return;

    const currentTabRecords = medicalDataStore[activeModule] || [];
    const updatedList = currentTabRecords.filter((r) => r.id !== id);
    const updatedStore = { ...medicalDataStore, [activeModule]: updatedList };

    persistMedicalData(updatedStore);
    setFeedback({ type: "success", text: `Removed ${name} from active ledger.` });
  };

  const currentRecords = medicalDataStore[activeModule] || [];

  const filteredRecords = currentRecords.filter(
    (r) =>
      r.col1.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.col2.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.col3.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.reference_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.col4.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalCount = filteredRecords.length;
  const inStockCount = filteredRecords.filter((r) => r.status === "Active" || r.status === "Completed").length;
  const lowStockCount = filteredRecords.filter((r) => r.status === "Pending" || r.status === "Suspended").length;
  const modalConfig = getModalConfig();

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex flex-col font-sans text-slate-800">
      <DashboardHeader
        roleIcon="💊"
        loggedAsText={`${pharmacistName} (${pharmacistEmail})`}
        roleSubtitle="Central Pharmacy & Medical Depot Console"
        bannerText="Central Pharmacy, Reagent Consumables & Stock Dispensation Ledger"
      />

      <div className="flex flex-1 overflow-hidden">
        <DashboardSidebar
          modules={MEDICAL_SIDEBAR_MODULES}
          activeModule={activeModule}
          onSelectModule={(id) => {
            setActiveModule(id);
            setSearchTerm("");
          }}
          sectionTitle="Medical & Drug Modules"
        />

        <main className="flex-1 p-5 overflow-y-auto space-y-5">
          {/* Top Control Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 px-2 py-1">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-teal-500"></span>
              <span>Active Medical Ledger: <strong className="text-teal-700 uppercase">{activeModule}</strong></span>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
              <button
                onClick={loadMedicalLedgers}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold rounded-lg transition-colors flex items-center space-x-1.5"
              >
                <span>🔄</span>
                <span>Sync Stock</span>
              </button>

              <button
                onClick={handleOpenAddModal}
                className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center space-x-1.5"
              >
                <span>+</span>
                <span>Add Item to {activeModule}</span>
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
                  {activeModule} Inventory Table
                </h2>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  Controlled Pharmaceutical Records • Depot Officer: <strong className="text-teal-700">{pharmacistName}</strong> • Showing {filteredRecords.length} Monitored Item(s)
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
              activeCount={inStockCount}
              pendingCount={lowStockCount}
              totalLabel={`Total Tracked in ${activeModule}`}
              activeLabel="In Stock / Cleared"
              pendingLabel="Low Stock / Reorders"
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
                        No inventory items found. Click &quot;+ Add Item to {activeModule}&quot; above to log stock.
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3.5 font-bold text-teal-700">{item.reference_id}</td>
                        <td className="px-4 py-3.5 font-extrabold text-slate-900">{item.col1}</td>
                        <td className="px-4 py-3.5 font-mono text-slate-600 text-[11px]">{item.col2}</td>
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
                            {item.status === "Active" || item.status === "Completed" ? "In Stock" : "Low Stock"}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Edit Stock Item"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteEntry(item.id, item.col1)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                            title="Retire Stock Item"
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
        <div>Current Session :- <strong className="text-teal-400">{pharmacistName} ({pharmacistEmail}) • Pharmacy Node</strong></div>
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
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Stock / Availability Flag *</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as "Active" | "Pending" | "Completed" | "Suspended")}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
                >
                  <option value="Active">In Stock / Sufficient</option>
                  <option value="Pending">Low Stock / Reorder Alert</option>
                  <option value="Completed">Filled / Cleared</option>
                  <option value="Suspended">Quarantined / Expired</option>
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