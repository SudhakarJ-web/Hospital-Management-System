export interface SharedPatient {
  id: string;
  reference_id: string;
  full_name: string;
  phone: string;
  department: string;
  assigned_doctor: string;
  notes: string;
  status: "Active" | "Pending" | "Completed" | "Suspended";
  created_at: string;
}

const INITIAL_PATIENTS: SharedPatient[] = [
  {
    id: "pat-1",
    reference_id: "GH-2026-REG101",
    full_name: "Ramesh Kulkarni",
    phone: "+91 98220 12345",
    department: "General Medicine",
    assigned_doctor: "Dr. Ananya Rao",
    notes: "Triage Cleared • BP: 120/80",
    status: "Active",
    created_at: "Today 09:30 AM",
  },
  {
    id: "pat-2",
    reference_id: "GH-2026-REG102",
    full_name: "Sagar Jadhav",
    phone: "+91 91567 88990",
    department: "Cardiology Dept",
    assigned_doctor: "Dr. Priya",
    notes: "Routine follow-up for ECG evaluation",
    status: "Active",
    created_at: "Today 10:15 AM",
  },
];

const STORAGE_KEY = "gavane_shared_patients";

export async function getSharedPatients(): Promise<SharedPatient[]> {
  if (typeof window === "undefined") return INITIAL_PATIENTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : INITIAL_PATIENTS;
  } catch {
    return INITIAL_PATIENTS;
  }
}

export async function saveSharedPatient(patient: SharedPatient): Promise<SharedPatient[]> {
  const current = await getSharedPatients();
  const existsIndex = current.findIndex((p) => p.id === patient.id);

  let updated: SharedPatient[];
  if (existsIndex >= 0) {
    updated = [...current];
    updated[existsIndex] = patient;
  } else {
    updated = [patient, ...current];
  }

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }
  return updated;
}

export async function deleteSharedPatient(id: string): Promise<SharedPatient[]> {
  const current = await getSharedPatients();
  const updated = current.filter((p) => p.id !== id);
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }
  return updated;
}