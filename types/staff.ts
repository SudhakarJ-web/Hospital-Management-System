export interface DoctorRecord {
  id: string;
  reference_id: string;
  name: string;
  degree?: string;
  username?: string;
  email: string;
  password?: string;
  module_category: string;
  department: string;
  consultation_fee?: number;
  access_level: string;
  status: "Active" | "Pending" | "Suspended";
  created_at?: string;
}