import { supabase } from "@/lib/supabase";

export interface SharedPatient {
  id: string;
  reference_id: string;
  full_name: string;
  phone: string;
  department: string;
  assigned_doctor: string;
  doctor_id?: string;
  notes: string;
  status: "Active" | "Discharged" | "Transferred";
  created_at: string;
}

// Valid UUIDv4 / UUID hex string pattern (8-4-4-4-12)
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getSharedPatients(): Promise<SharedPatient[]> {
  try {
    const { data, error } = await supabase
      .from("patients")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data) {
      console.error("Error fetching patients from Supabase:", error);
      return [];
    }

    return data as SharedPatient[];
  } catch (err) {
    console.error("Failed to query patients:", err);
    return [];
  }
}

export async function saveSharedPatient(
  patient: Partial<SharedPatient>
): Promise<SharedPatient[]> {
  try {
    const isNew = !patient.id || patient.id.startsWith("pat-");

    // Ensure doctor_id is either a valid UUID or null to prevent foreign key violations
    const sanitizedDoctorId =
      patient.doctor_id && UUID_REGEX.test(patient.doctor_id.trim())
        ? patient.doctor_id.trim()
        : null;

    const payload = {
      reference_id:
        patient.reference_id ||
        `GH-2026-REG${Math.floor(100 + Math.random() * 900)}`,
      full_name: patient.full_name?.trim() || "Unspecified Patient",
      phone: patient.phone?.trim() || "+91 98000 00000",
      department: patient.department?.trim() || "General Medicine",
      assigned_doctor: patient.assigned_doctor?.trim() || "Consultant Physician",
      doctor_id: sanitizedDoctorId,
      notes: patient.notes?.trim() || "Routine triage",
      status: patient.status || "Active",
    };

    if (isNew) {
      const { error } = await supabase.from("patients").insert([payload]);
      if (error) {
        console.error("Failed to insert patient:", error);
        throw new Error(error.message || "Failed to insert patient record");
      }
    } else {
      const { error } = await supabase
        .from("patients")
        .update(payload)
        .eq("id", patient.id);

      if (error) {
        console.error("Failed to update patient:", error);
        throw new Error(error.message || "Failed to update patient record");
      }
    }

    return await getSharedPatients();
  } catch (err) {
    console.error("Failed to persist patient:", err);
    throw err;
  }
}

export async function deleteSharedPatient(id: string): Promise<SharedPatient[]> {
  try {
    const { error } = await supabase.from("patients").delete().eq("id", id);
    if (error) throw error;
    return await getSharedPatients();
  } catch (err) {
    console.error("Failed to delete patient:", err);
    return await getSharedPatients();
  }
}