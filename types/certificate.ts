export interface SharedCertificate {
  id: string;
  reference_id: string;
  certificate_title: string;
  patient_name: string;
  purpose: string;
  issued_date: string;
  authorizing_doctor: string;
  status: "Active" | "Completed" | "Pending" | "Suspended";
  created_at?: string;
}