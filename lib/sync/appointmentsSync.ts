export interface SharedAppointment {
  id: string;
  reference_id: string;
  patient_name: string;
  phone: string;
  department: string;
  assigned_doctor: string;
  appointment_date: string;
  time_slot: string;
  message?: string;
  status: "Active" | "Pending" | "Completed" | "Cancelled";
  created_at: string;
}

const INITIAL_APPOINTMENTS: SharedAppointment[] = [
  {
    id: "apt-101",
    reference_id: "GH-APT-2026-001",
    patient_name: "Ramesh Kulkarni",
    phone: "+91 98220 12345",
    department: "Cardiology Dept",
    assigned_doctor: "Dr. Ananya Rao",
    appointment_date: "2026-09-02",
    time_slot: "10:00 AM - 10:30 AM",
    message: "Follow-up consultation for blood pressure regulation.",
    status: "Active",
    created_at: "Today 09:30 AM",
  },
  {
    id: "apt-102",
    reference_id: "GH-APT-2026-002",
    patient_name: "Sagar Jadhav",
    phone: "+91 91567 88990",
    department: "Cardiology Dept",
    assigned_doctor: "Dr. Priya",
    appointment_date: "2026-09-02",
    time_slot: "11:00 AM - 11:30 AM",
    message: "Post-angioplasty routine checkup.",
    status: "Active",
    created_at: "Today 10:15 AM",
  },
];

const STORAGE_KEY = "gavane_shared_appointments";

export async function getSharedAppointments(): Promise<SharedAppointment[]> {
  if (typeof window === "undefined") return INITIAL_APPOINTMENTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : INITIAL_APPOINTMENTS;
  } catch {
    return INITIAL_APPOINTMENTS;
  }
}

export async function saveSharedAppointment(appointment: SharedAppointment): Promise<SharedAppointment[]> {
  const current = await getSharedAppointments();
  const index = current.findIndex((a) => a.id === appointment.id);

  let updated: SharedAppointment[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = appointment;
  } else {
    updated = [appointment, ...current];
  }

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }
  return updated;
}

export async function deleteSharedAppointment(id: string): Promise<SharedAppointment[]> {
  const current = await getSharedAppointments();
  const updated = current.filter((a) => a.id !== id);
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }
  return updated;
}