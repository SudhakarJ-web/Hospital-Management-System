import { supabase } from "../supabase";

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

export const INITIAL_SHARED_CERTIFICATES: SharedCertificate[] = [
  {
    id: "cert-01",
    reference_id: "GH-2026-865",
    certificate_title: "Medical Fitness Certificate",
    patient_name: "Mayur Jadhav",
    purpose: "ENT & Fitness Clearance",
    issued_date: "28/08/2026",
    authorizing_doctor: "Dr. Sudhir Gavane",
    status: "Active",
    created_at: "28/08/2026",
  },
  {
    id: "cert-02",
    reference_id: "GH-2026-478",
    certificate_title: "Medical Fitness",
    patient_name: "Mahesh Patil",
    purpose: "Sick Leave",
    issued_date: "28/08/2026",
    authorizing_doctor: "Dr. Ananya Rao",
    status: "Completed",
    created_at: "28/08/2026",
  },
  {
    id: "cert-03",
    reference_id: "GH-2026-SUP212",
    certificate_title: "Medical Fitness",
    patient_name: "Mira Kumar",
    purpose: "Employment",
    issued_date: "28/08/2026",
    authorizing_doctor: "Dr. Priya",
    status: "Completed",
    created_at: "28/08/2026",
  },
  {
    id: "cert-04",
    reference_id: "CERT-2026-991",
    certificate_title: "Medical Fitness Certificate",
    patient_name: "Suresh Shinde",
    purpose: "Pre-Employment Verification",
    issued_date: "27/08/2026",
    authorizing_doctor: "Dr. Sudhir Gavane",
    status: "Completed",
    created_at: "27/08/2026",
  },
  {
    id: "cert-05",
    reference_id: "CERT-2026-992",
    certificate_title: "Medical Leave Certificate (3 Days)",
    patient_name: "Ramesh Kulkarni",
    purpose: "OPD Triage Clearance",
    issued_date: "28/08/2026",
    authorizing_doctor: "Dr. Ananya Rao",
    status: "Completed",
    created_at: "28/08/2026",
  },
];

export async function getSharedCertificates(): Promise<SharedCertificate[]> {
  try {
    const { data, error } = await supabase
      .from("certificates")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      return data.map((c) => ({
        id: c.id,
        reference_id: c.reference_id || `GH-2026-${c.id.substring(0, 5)}`,
        certificate_title: c.certificate_title || c.title || "Medical Fitness Certificate",
        patient_name: c.patient_name || c.full_name || "Patient",
        purpose: c.purpose || "Medical Clearance",
        issued_date: c.issued_date || new Date().toLocaleDateString("en-IN"),
        authorizing_doctor: c.authorizing_doctor || "Dr. Priya",
        status: c.status || "Completed",
        created_at: c.created_at || new Date().toISOString(),
      }));
    }
  } catch {
    // Fallback to cache
  }

  try {
    const cached = localStorage.getItem("gavane_shared_certificates");
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // Return initial
  }

  return INITIAL_SHARED_CERTIFICATES;
}

export async function saveSharedCertificate(cert: SharedCertificate): Promise<SharedCertificate[]> {
  const current = await getSharedCertificates();
  const existingIndex = current.findIndex((c) => c.id === cert.id);

  let updated: SharedCertificate[] = [];
  if (existingIndex >= 0) {
    updated = current.map((c) => (c.id === cert.id ? cert : c));
  } else {
    updated = [cert, ...current];
  }

  try {
    localStorage.setItem("gavane_shared_certificates", JSON.stringify(updated));
  } catch {
    // Handled
  }

  try {
    await supabase.from("certificates").upsert([
      {
        id: cert.id,
        reference_id: cert.reference_id,
        certificate_title: cert.certificate_title,
        patient_name: cert.patient_name,
        purpose: cert.purpose,
        issued_date: cert.issued_date,
        authorizing_doctor: cert.authorizing_doctor,
        status: cert.status,
        created_at: cert.created_at || new Date().toISOString(),
      },
    ]);
  } catch {
    // Handled
  }

  return updated;
}

export async function deleteSharedCertificate(id: string): Promise<SharedCertificate[]> {
  const current = await getSharedCertificates();
  const updated = current.filter((c) => c.id !== id);

  try {
    localStorage.setItem("gavane_shared_certificates", JSON.stringify(updated));
  } catch {
    // Handled
  }

  try {
    await supabase.from("certificates").delete().eq("id", id);
  } catch {
    // Handled
  }

  return updated;
}