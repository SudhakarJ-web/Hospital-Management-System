export interface SharedPrescription {
  id: string;
  rx_id: string;
  patient_id: string;
  patient_name: string;
  age_gender: string;
  prescribing_doctor: string;
  department: string;
  diagnosis: string;
  medications: string; // e.g. "Tab. Telmisartan 40mg (1-0-0) • 30 Days, Tab. Aspirin 75mg (0-0-1)"
  dosage_notes?: string;
  status: "Pending Dispense" | "Dispensed" | "Partially Dispensed" | "Quarantined";
  issued_at: string;
  dispensed_at?: string;
  dispensed_by?: string;
}

const INITIAL_PRESCRIPTIONS: SharedPrescription[] = [
  {
    id: "rx-101",
    rx_id: "GH-RX-2026-001",
    patient_id: "GH-2026-REG101",
    patient_name: "Ramesh Kulkarni",
    age_gender: "48 / Male",
    prescribing_doctor: "Dr. Ananya Rao",
    department: "Cardiology Dept",
    diagnosis: "Essential Hypertension (Grade 1)",
    medications: "1. Tab. Telmisartan 40mg (1-0-0) - 30 Days\n2. Tab. Amlodipine 5mg (0-0-1) - 30 Days",
    dosage_notes: "Take after food with warm water. Review in 1 month.",
    status: "Pending Dispense",
    issued_at: "Today 10:45 AM",
  },
  {
    id: "rx-102",
    rx_id: "GH-RX-2026-002",
    patient_id: "GH-2026-REG102",
    patient_name: "Sagar Jadhav",
    age_gender: "36 / Male",
    prescribing_doctor: "Dr. Priya",
    department: "Cardiology Dept",
    diagnosis: "Post-Angioplasty Follow-up",
    medications: "1. Tab. Atorvastatin 20mg (0-0-1) - 30 Days\n2. Tab. Ecosprin 75mg (1-0-0) - 30 Days",
    dosage_notes: "Strict lipid-lowering protocol.",
    status: "Dispensed",
    issued_at: "Today 09:30 AM",
    dispensed_at: "Today 10:00 AM",
    dispensed_by: "Priya Nair (B.Pharm)",
  },
];

const STORAGE_KEY = "gavane_shared_prescriptions";

export async function getSharedPrescriptions(): Promise<SharedPrescription[]> {
  if (typeof window === "undefined") return INITIAL_PRESCRIPTIONS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : INITIAL_PRESCRIPTIONS;
  } catch {
    return INITIAL_PRESCRIPTIONS;
  }
}

export async function saveSharedPrescription(rx: SharedPrescription): Promise<SharedPrescription[]> {
  const current = await getSharedPrescriptions();
  const index = current.findIndex((item) => item.id === rx.id);

  let updated: SharedPrescription[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = rx;
  } else {
    updated = [rx, ...current];
  }

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }
  return updated;
}

export async function dispensePrescription(id: string, pharmacistName: string): Promise<SharedPrescription[]> {
  const current = await getSharedPrescriptions();
  const updated = current.map((rx) =>
    rx.id === id
      ? {
          ...rx,
          status: "Dispensed" as const,
          dispensed_at: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
          dispensed_by: pharmacistName,
        }
      : rx
  );

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }
  return updated;
}