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