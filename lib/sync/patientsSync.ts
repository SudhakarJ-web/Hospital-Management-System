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

export async function saveSharedPatient(patient: Partial<SharedPatient>): Promise<SharedPatient[]> {
  try {
    const isNew = !patient.id || patient.id.startsWith("pat-");
    const payload = {
      reference_id: patient.reference_id || `GH-2026-REG${Math.floor(100 + Math.random() * 900)}`,
      full_name: patient.full_name,
      phone: patient.phone || "+91 98000 00000",
      department: patient.department || "General Medicine",
      assigned_doctor: patient.assigned_doctor || "Consultant Physician",
      doctor_id: patient.doctor_id || null,
      notes: patient.notes || "Routine triage",
      status: patient.status || "Active",
    };

    if (isNew) {
      await supabase.from("patients").insert([payload]);
    } else {
      await supabase.from("patients").update(payload).eq("id", patient.id);
    }

    return await getSharedPatients();
  } catch (err) {
    console.error("Failed to persist patient:", err);
    return await getSharedPatients();
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