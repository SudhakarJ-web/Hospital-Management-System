import { supabase } from "@/lib/supabase";

export interface SharedAppointment {
  id?: string;
  reference_id: string;
  patient_name: string;
  phone: string;
  department: string;
  assigned_doctor: string;
  doctor_id?: string;
  appointment_date: string;
  time_slot: string;
  reason?: string;
  status: "Confirmed" | "Completed" | "Cancelled";
  created_at?: string;
}

export async function getSharedAppointments(): Promise<SharedAppointment[]> {
  try {
    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data) {
      console.error("Failed to fetch appointments:", error);
      return [];
    }

    return data.map((row) => ({
      id: row.id,
      reference_id: row.reference_id || `APT-${row.id?.slice(0, 5)}`,
      patient_name: row.patient_name || "Outpatient",
      phone: row.phone || "",
      department: row.department || "General Medicine",
      assigned_doctor: row.assigned_doctor || "Consultant",
      doctor_id: row.doctor_id,
      appointment_date: row.appointment_date || "",
      time_slot: row.time_slot || row.appointment_time || "09:30 AM - 10:00 AM",
      reason: row.reason || "OPD Consultation",
      status: (row.status as any) || "Confirmed",
      created_at: row.created_at,
    }));
  } catch (err) {
    console.error("Appointments fetch error:", err);
    return [];
  }
}

export async function saveSharedAppointment(
  appt: Omit<SharedAppointment, "reference_id"> & { reference_id?: string }
): Promise<SharedAppointment | null> {
  const ref =
    appt.reference_id ||
    `APT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const payload = {
    reference_id: ref,
    patient_name: appt.patient_name,
    phone: appt.phone,
    department: appt.department,
    assigned_doctor: appt.assigned_doctor,
    doctor_id: appt.doctor_id || null,
    appointment_date: appt.appointment_date,
    time_slot: appt.time_slot,
    reason: appt.reason || "OPD Consultation",
    status: appt.status || "Confirmed",
  };

  const { data, error } = await supabase
    .from("appointments")
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error("Supabase Appointment Insert Error:", error);
    throw new Error(error.message || "Failed to save appointment");
  }

  return data as SharedAppointment;
}

export async function deleteSharedAppointment(id: string): Promise<boolean> {
  const { error } = await supabase.from("appointments").delete().eq("id", id);
  return !error;
}