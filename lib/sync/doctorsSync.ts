export interface SharedDoctor {
  id: string;
  reference_id: string;
  name: string;
  slug?: string;
  degree: string;
  department: string;
  email: string;
  password?: string;
  fee: string;
  image: string;
  status: "Active" | "Pending" | "Suspended";
  created_at: string;
}

export function generateDoctorSlug(name: string): string {
  const cleanName = name
    .toLowerCase()
    .replace(/^dr\.?\s*/i, "")
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `doctor-${cleanName}`;
}

export const INITIAL_DOCTORS: SharedDoctor[] = [
  {
    id: "doc-1",
    reference_id: "GH-2026-001",
    name: "Dr. Ananya Rao",
    slug: "doctor-ananya-rao",
    degree: "MBBS, MD (Cardiology), FACC",
    department: "Cardiology & Cardiac Sciences",
    email: "ananya@gavanehospital.in",
    password: "password123",
    fee: "₹500",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80",
    status: "Active",
    created_at: "27/08/2026",
  },
  {
    id: "doc-2",
    reference_id: "GH-2026-002",
    name: "Dr. Sudhir Gavane",
    slug: "doctor-sudhir-gavane",
    degree: "MS (General & Laparoscopic Surgery), M.Ch",
    department: "General Surgery & Trauma",
    email: "sudhir@gavanehospital.in",
    password: "password123",
    fee: "₹600",
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80",
    status: "Active",
    created_at: "27/08/2026",
  },
  {
    id: "doc-3",
    reference_id: "GH-2026-003",
    name: "Dr. Priya",
    slug: "doctor-priya",
    degree: "MD (Internal Medicine & Pediatrics)",
    department: "General Medicine & Pediatrics",
    email: "priya@gavanehospital.in",
    password: "password123",
    fee: "₹500",
    image: "https://images.unsplash.com/photo-1594824813629-9e8c45f448ea?auto=format&fit=crop&w=600&q=80",
    status: "Active",
    created_at: "27/08/2026",
  },
];

const STORAGE_KEY = "gavane_shared_doctors_master";
const DOCTOR_SESSION_KEY = "gavane_current_active_doctor_session";

export async function getSharedDoctors(): Promise<SharedDoctor[]> {
  if (typeof window === "undefined") return INITIAL_DOCTORS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed: SharedDoctor[] = raw ? JSON.parse(raw) : INITIAL_DOCTORS;
    return parsed.map((doc) => ({
      ...doc,
      slug: doc.slug || generateDoctorSlug(doc.name),
    }));
  } catch {
    return INITIAL_DOCTORS;
  }
}

export async function saveSharedDoctor(doctor: SharedDoctor): Promise<SharedDoctor[]> {
  const current = await getSharedDoctors();
  const slug = doctor.slug || generateDoctorSlug(doctor.name);
  const normalizedDoc: SharedDoctor = { ...doctor, slug };

  const index = current.findIndex((d) => d.id === doctor.id);
  let updated: SharedDoctor[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = normalizedDoc;
  } else {
    updated = [normalizedDoc, ...current];
  }

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }
  return updated;
}

export async function deleteSharedDoctor(id: string): Promise<SharedDoctor[]> {
  const current = await getSharedDoctors();
  const updated = current.filter((d) => d.id !== id);
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }
  return updated;
}

export function getCurrentDoctorSession(): SharedDoctor | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DOCTOR_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setCurrentDoctorSession(doctor: SharedDoctor | null) {
  if (typeof window === "undefined") return;
  if (!doctor) {
    localStorage.removeItem(DOCTOR_SESSION_KEY);
  } else {
    localStorage.setItem(DOCTOR_SESSION_KEY, JSON.stringify(doctor));
  }
}

// Resilient fuzzy matcher for doctor slugs
export function findDoctorBySlug(doctors: SharedDoctor[], rawSlug: string): SharedDoctor | undefined {
  const needle = rawSlug.toLowerCase().trim();
  
  // 1. Direct slug or ID match
  const exact = doctors.find(
    (d) => d.slug?.toLowerCase() === needle || d.id.toLowerCase() === needle
  );
  if (exact) return exact;

  // 2. Standard generated slug match
  const genMatch = doctors.find(
    (d) => generateDoctorSlug(d.name) === needle
  );
  if (genMatch) return genMatch;

  // 3. Partial / first name matching (e.g., "doctor-ananya" matches "Dr. Ananya Rao")
  const strippedNeedle = needle.replace(/^doctor-/, "");
  return doctors.find((d) => {
    const docFirstName = d.name.toLowerCase().replace(/^dr\.?\s*/i, "").split(" ")[0];
    return strippedNeedle.includes(docFirstName) || docFirstName.includes(strippedNeedle);
  });
}