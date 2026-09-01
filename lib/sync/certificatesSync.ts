export interface SharedCertificate {
  id: string;
  reference_id: string;
  certificate_title: string;
  patient_name: string;
  purpose: string;
  issued_date: string;
  authorizing_doctor: string;
  status: "Active" | "Pending" | "Completed" | "Suspended";
  created_at: string;
}

const INITIAL_CERTIFICATES: SharedCertificate[] = [
  {
    id: "cert-1",
    reference_id: "GH-2026-CERT01",
    certificate_title: "Medical Fitness Certificate",
    patient_name: "Mayur Jadhav",
    purpose: "Pre-Employment Fitness Assessment",
    issued_date: "28/08/2026",
    authorizing_doctor: "Dr. Sudhir Gavane",
    status: "Active",
    created_at: "28/08/2026",
  },
];

const STORAGE_KEY = "gavane_shared_certificates";

export async function getSharedCertificates(): Promise<SharedCertificate[]> {
  if (typeof window === "undefined") return INITIAL_CERTIFICATES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : INITIAL_CERTIFICATES;
  } catch {
    return INITIAL_CERTIFICATES;
  }
}

export async function saveSharedCertificate(cert: SharedCertificate): Promise<SharedCertificate[]> {
  const current = await getSharedCertificates();
  const existsIndex = current.findIndex((c) => c.id === cert.id);

  let updated: SharedCertificate[];
  if (existsIndex >= 0) {
    updated = [...current];
    updated[existsIndex] = cert;
  } else {
    updated = [cert, ...current];
  }

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }
  return updated;
}

export async function deleteSharedCertificate(id: string): Promise<SharedCertificate[]> {
  const current = await getSharedCertificates();
  const updated = current.filter((c) => c.id !== id);
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }
  return updated;
}