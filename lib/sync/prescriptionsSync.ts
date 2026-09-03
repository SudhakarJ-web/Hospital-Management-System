import { supabase } from "@/lib/supabase";

export interface SharedPrescription {
  id: string;
  reference_id: string;
  patient_name: string;
  patient_phone?: string;
  prescribing_doctor: string;
  doctor_id?: string;
  department: string;
  clinical_notes?: string;
  investigations?: string;
  medications: string;
  diet_instructions?: string;
  status: "Pending Dispensation" | "Dispensed & Verified" | "Cancelled";
  dispensed_by?: string;
  dispensed_at?: string;
  created_at?: string;
}

export async function getSharedPrescriptions(): Promise<SharedPrescription[]> {
  try {
    const { data, error } = await supabase
      .from("prescriptions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data) {
      return [];
    }

    return data as SharedPrescription[];
  } catch {
    return [];
  }
}

export async function saveSharedPrescription(
  rx: Partial<SharedPrescription> & { medications: string; prescribing_doctor: string; patient_name: string }
): Promise<SharedPrescription[]> {
  try {
    const payload = {
      reference_id: rx.reference_id || `GH-RX-${Date.now().toString().slice(-6)}`,
      patient_name: rx.patient_name,
      patient_phone: rx.patient_phone || "",
      prescribing_doctor: rx.prescribing_doctor,
      doctor_id: rx.doctor_id || null,
      department: rx.department || "General OPD",
      clinical_notes: rx.clinical_notes || "",
      investigations: rx.investigations || "",
      medications: rx.medications,
      diet_instructions: rx.diet_instructions || "",
      status: rx.status || "Pending Dispensation",
    };

    if (!rx.id || rx.id.startsWith("rx-")) {
      await supabase.from("prescriptions").insert([payload]);
    } else {
      await supabase.from("prescriptions").update(payload).eq("id", rx.id);
    }

    return await getSharedPrescriptions();
  } catch {
    return await getSharedPrescriptions();
  }
}

export async function dispensePrescription(id: string, dispensedBy: string): Promise<SharedPrescription[]> {
  try {
    await supabase
      .from("prescriptions")
      .update({
        status: "Dispensed & Verified",
        dispensed_by: dispensedBy,
        dispensed_at: new Date().toISOString(),
      })
      .eq("id", id);

    return await getSharedPrescriptions();
  } catch {
    return await getSharedPrescriptions();
  }
}

export async function deleteSharedPrescription(id: string): Promise<SharedPrescription[]> {
  try {
    await supabase.from("prescriptions").delete().eq("id", id);
    return await getSharedPrescriptions();
  } catch {
    return await getSharedPrescriptions();
  }
}