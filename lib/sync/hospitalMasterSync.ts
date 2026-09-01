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

export const INITIAL_HOSPITAL_DATA: Record<string, UnifiedRecord[]> = {
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
  ],
  Doctors: [
    {
      id: "doc-1",
      reference_id: "GH-2026-001",
      category: "Doctors",
      col1: "Dr. Ananya Rao",
      col2: "MBBS, MD (Cardiology)",
      col3: "Cardiology Dept",
      col4: "ananya@gavanehospital.in",
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
      col4: "sudhir@gavanehospital.in",
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

const STORE_KEY = "gavane_universal_master_store";

export function getUniversalStore(): Record<string, UnifiedRecord[]> {
  if (typeof window === "undefined") return INITIAL_HOSPITAL_DATA;
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? JSON.parse(raw) : INITIAL_HOSPITAL_DATA;
  } catch {
    return INITIAL_HOSPITAL_DATA;
  }
}

export function saveUniversalRecord(moduleKey: string, record: UnifiedRecord): Record<string, UnifiedRecord[]> {
  const store = getUniversalStore();
  const current = store[moduleKey] || [];
  const existsIndex = current.findIndex((r) => r.id === record.id);

  let updatedList: UnifiedRecord[];
  if (existsIndex >= 0) {
    updatedList = [...current];
    updatedList[existsIndex] = record;
  } else {
    updatedList = [record, ...current];
  }

  const updatedStore = { ...store, [moduleKey]: updatedList };
  if (typeof window !== "undefined") {
    localStorage.setItem(STORE_KEY, JSON.stringify(updatedStore));
  }
  return updatedStore;
}

export function deleteUniversalRecord(moduleKey: string, id: string): Record<string, UnifiedRecord[]> {
  const store = getUniversalStore();
  const current = store[moduleKey] || [];
  const updatedList = current.filter((r) => r.id !== id);
  const updatedStore = { ...store, [moduleKey]: updatedList };
  if (typeof window !== "undefined") {
    localStorage.setItem(STORE_KEY, JSON.stringify(updatedStore));
  }
  return updatedStore;
}