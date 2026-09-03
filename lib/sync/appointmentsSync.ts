import { supabase } from "@/lib/supabase";

export interface SharedAppointment {
  id: string;
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
  created_at: string;
}

export async function getSharedAppointments(): Promise<SharedAppointment[]> {
  try {
    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data) {
      console.error("Error fetching appointments:", error);
      return [];
    }

    return data as SharedAppointment[];
  } catch (err) {
    console.error("Failed to query appointments:", err);
    return [];
  }
}

export async function saveSharedAppointment(apt: Partial<SharedAppointment>): Promise<SharedAppointment[]> {
  try {
    const isNew = !apt.id || apt.id.startsWith("apt-");
    const payload = {
      reference_id: apt.reference_id || `GH-APT-${Math.floor(1000 + Math.random() * 9000)}`,
      patient_name: apt.patient_name,
      phone: apt.phone,
      department: apt.department,
      assigned_doctor: apt.assigned_doctor,
      doctor_id: apt.doctor_id || null,
      appointment_date: apt.appointment_date || new Date().toISOString().split("T")[0],
      time_slot: apt.time_slot || "10:00 AM - 10:30 AM",
      reason: apt.reason || "General Consultation",
      status: apt.status || "Confirmed",
    };

    if (isNew) {
      await supabase.from("appointments").insert([payload]);
    } else {
      await supabase.from("appointments").update(payload).eq("id", apt.id);
    }

    return await getSharedAppointments();
  } catch (err) {
    console.error("Failed to save appointment:", err);
    return await getSharedAppointments();
  }
}

export async function deleteSharedAppointment(id: string): Promise<SharedAppointment[]> {
  try {
    await supabase.from("appointments").delete().eq("id", id);
    return await getSharedAppointments();
  } catch (err) {
    console.error("Failed to delete appointment:", err);
    return await getSharedAppointments();
  }
}