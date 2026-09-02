export interface SharedDoctor {
  id: string;
  reference_id: string;
  name: string;
  degree: string;
  department: string;
  email: string;
  fee: string;
  image: string;
  status: "Active" | "Pending" | "Suspended";
  created_at: string;
}

export const INITIAL_DOCTORS: SharedDoctor[] = [
  {
    id: "doc-1",
    reference_id: "GH-2026-001",
    name: "Dr. Ananya Rao",
    degree: "MBBS, MD (Cardiology), FACC",
    department: "Cardiology & Cardiac Sciences",
    email: "ananya@gavanehospital.in",
    fee: "₹500",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80",
    status: "Active",
    created_at: "27/08/2026",
  },
  {
    id: "doc-2",
    reference_id: "GH-2026-002",
    name: "Dr. Sudhir Gavane",
    degree: "MS (General & Laparoscopic Surgery), M.Ch",
    department: "General Surgery & Trauma",
    email: "sudhir@gavanehospital.in",
    fee: "₹600",
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80",
    status: "Active",
    created_at: "27/08/2026",
  },
  {
    id: "doc-3",
    reference_id: "GH-2026-003",
    name: "Dr. Priya",
    degree: "MD (Internal Medicine & Pediatrics)",
    department: "General Medicine & Pediatrics",
    email: "priya@gavanehospital.in",
    fee: "₹500",
    image: "https://images.unsplash.com/photo-1594824813629-9e8c45f448ea?auto=format&fit=crop&w=600&q=80",
    status: "Active",
    created_at: "27/08/2026",
  },
];

const STORAGE_KEY = "gavane_shared_doctors_master";

export async function getSharedDoctors(): Promise<SharedDoctor[]> {
  if (typeof window === "undefined") return INITIAL_DOCTORS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : INITIAL_DOCTORS;
  } catch {
    return INITIAL_DOCTORS;
  }
}

export async function saveSharedDoctor(doctor: SharedDoctor): Promise<SharedDoctor[]> {
  const current = await getSharedDoctors();
  const index = current.findIndex((d) => d.id === doctor.id);

  let updated: SharedDoctor[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = doctor;
  } else {
    updated = [doctor, ...current];
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