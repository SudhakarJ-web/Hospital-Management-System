import { supabase } from "@/lib/supabase";

export interface SharedAppointment {
  id?: string;
  reference_id: string;
  patient_name: string;
  phone: string;
  department: string;
  assigned_doctor: string;
  doctor_id?: string | null;
  appointment_date: string;
  time_slot: string;
  reason?: string;
  status: "Confirmed" | "Completed" | "Cancelled";
  created_at?: string;
}

// Strict UUID regex pattern (matches standard 8-4-4-4-12 hex UUID format)
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getSharedAppointments(): Promise<SharedAppointment[]> {
  try {
    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data) {
      console.error("Failed to fetch appointments from Supabase:", error);
      return [];
    }

    return data.map((row) => ({
      id: row.id,
      reference_id: row.reference_id || `APT-${row.id?.slice(0, 5)}`,
      patient_name: row.patient_name || "Outpatient",
      phone: row.phone || "",
      department: row.department || "General Medicine",
      assigned_doctor: row.assigned_doctor || "Consultant Physician",
      doctor_id: row.doctor_id || null,
      appointment_date: row.appointment_date || "",
      time_slot: row.time_slot || row.appointment_time || "09:30 AM - 10:00 AM",
      reason: row.reason || "OPD Consultation",
      status: (row.status as "Confirmed" | "Completed" | "Cancelled") || "Confirmed",
      created_at: row.created_at,
    }));
  } catch (err) {
    console.error("Appointments query exception:", err);
    return [];
  }
}

export async function saveSharedAppointment(
  appt: Omit<SharedAppointment, "reference_id"> & {
    id?: string;
    reference_id?: string;
  }
): Promise<SharedAppointment> {
  const ref =
    appt.reference_id ||
    `APT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  // Trim and validate UUID format, otherwise set to null to avoid FK crashes
  const cleanDoctorId = appt.doctor_id?.trim();
  const validDoctorId =
    cleanDoctorId && UUID_REGEX.test(cleanDoctorId) ? cleanDoctorId : null;

  const payload = {
    reference_id: ref,
    patient_name: appt.patient_name.trim(),
    phone: appt.phone.trim(),
    department: appt.department.trim() || "General Medicine",
    assigned_doctor: appt.assigned_doctor.trim() || "Consultant Physician",
    doctor_id: validDoctorId,
    appointment_date: appt.appointment_date,
    time_slot: appt.time_slot,
    reason: appt.reason?.trim() || "OPD Consultation",
    status: appt.status || "Confirmed",
  };

  try {
    if (appt.id) {
      // Update existing record
      const { data, error } = await supabase
        .from("appointments")
        .update(payload)
        .eq("id", appt.id)
        .select()
        .single();

      if (error) {
        console.error("Supabase Appointment Update Error:", error);
        throw new Error(error.message || "Failed to update appointment");
      }
      return data as SharedAppointment;
    } else {
      // Insert new appointment record
      const { data, error } = await supabase
        .from("appointments")
        .insert([payload])
        .select()
        .single();

      if (error) {
        console.error("Supabase Appointment Insert Error:", error);
        throw new Error(error.message || "Failed to create appointment record");
      }
      return data as SharedAppointment;
    }
  } catch (err) {
    console.error("saveSharedAppointment failed:", err);
    throw err;
  }
}

export async function deleteSharedAppointment(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("appointments").delete().eq("id", id);
    if (error) {
      console.error("Supabase Appointment Delete Error:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("deleteSharedAppointment exception:", err);
    return false;
  }
}