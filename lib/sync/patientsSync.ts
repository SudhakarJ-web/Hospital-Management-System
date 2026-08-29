import { supabase } from "../supabase";

export interface SharedPatient {
  id: string;
  reference_id: string;
  full_name: string;
  phone: string;
  department: string;
  assigned_doctor: string;
  notes?: string;
  status: "Active" | "Pending" | "Completed";
  created_at: string;
}

export const DEFAULT_INITIAL_PATIENTS: SharedPatient[] = [
  {
    id: "p-01",
    reference_id: "GH-2026-REG01",
    full_name: "Ramesh Kulkarni",
    phone: "+91 98765 43210",
    department: "General Medicine",
    assigned_doctor: "Dr. Ananya Rao",
    notes: "Token #12 - General Consultation",
    status: "Active",
    created_at: "27/08/2026 10:30 AM",
  },
  {
    id: "p-02",
    reference_id: "GH-2026-BIL02",
    full_name: "Sunita Deshmukh",
    phone: "+91 98223 34455",
    department: "General Surgery",
    assigned_doctor: "Dr. Suresh Gavane",
    notes: "Consultation Fee ₹500",
    status: "Pending",
    created_at: "27/08/2026 11:15 AM",
  },
  {
    id: "p-03",
    reference_id: "GH-2026-IPD03",
    full_name: "Amit Patil",
    phone: "+91 94210 08899",
    department: "Orthopedics",
    assigned_doctor: "Dr. Sudhir Gavane",
    notes: "Bed 204 - Semi-Private Ward",
    status: "Active",
    created_at: "27/08/2026 01:00 PM",
  },
  {
    id: "p-04",
    reference_id: "GH-2026-SUP365",
    full_name: "Sagar Jadhav",
    phone: "8521479630",
    department: "Cardiology Dept",
    assigned_doctor: "Dr. Priya",
    notes: "Consultation booked via Front Desk",
    status: "Active",
    created_at: "27/08/2026 04:35 PM",
  },
];

export async function getSharedPatients(): Promise<SharedPatient[]> {
  try {
    const { data, error } = await supabase
      .from("patients")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      return data.map((d) => ({
        id: d.id,
        reference_id: d.reference_id || `GH-2026-${d.id.substring(0, 5)}`,
        full_name: d.full_name,
        phone: d.phone || "",
        department: d.department || "General OPD",
        assigned_doctor: d.assigned_doctor || "Dr. Priya",
        notes: d.notes || "",
        status: d.status || "Active",
        created_at: d.created_at || new Date().toLocaleString("en-IN"),
      }));
    }
  } catch {
    // Fallback to local storage
  }

  try {
    const cached = localStorage.getItem("gavane_shared_patients");
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // Return defaults if parsing fails
  }

  return DEFAULT_INITIAL_PATIENTS;
}

export async function saveSharedPatient(patient: SharedPatient): Promise<SharedPatient[]> {
  const current = await getSharedPatients();
  const updated = [patient, ...current.filter((p) => p.id !== patient.id)];

  try {
    localStorage.setItem("gavane_shared_patients", JSON.stringify(updated));
  } catch {
    // Handled
  }

  try {
    await supabase.from("patients").insert([
      {
        id: patient.id,
        full_name: patient.full_name,
        phone: patient.phone,
        department: patient.department,
        assigned_doctor: patient.assigned_doctor,
        notes: patient.notes,
        status: patient.status,
        created_at: new Date().toISOString(),
      },
    ]);
  } catch {
    // Local copy maintained
  }

  return updated;
}   