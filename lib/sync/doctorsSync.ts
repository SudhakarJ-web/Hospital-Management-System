import { supabase } from "@/lib/supabase";

export interface SharedDoctor {
  id: string;
  reference_id: string;
  name: string;
  slug: string;
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

// 1. Fetch live doctors from Supabase
export async function getSharedDoctors(): Promise<SharedDoctor[]> {
  try {
    const { data, error } = await supabase
      .from("doctors")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      // Fallback to cache if offline
      if (typeof window !== "undefined") {
        const cached = localStorage.getItem("gavane_live_doctors_cache");
        return cached ? JSON.parse(cached) : [];
      }
      return [];
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("gavane_live_doctors_cache", JSON.stringify(data));
    }
    return data as SharedDoctor[];
  } catch (err) {
    console.error("Error fetching doctors:", err);
    return [];
  }
}

// 2. Add or Update Doctor directly in Supabase
export async function saveSharedDoctor(doctor: Partial<SharedDoctor>): Promise<SharedDoctor | null> {
  try {
    const slug = doctor.slug || (doctor.name ? generateDoctorSlug(doctor.name) : undefined);
    const payload = {
      ...doctor,
      slug,
    };

    const { data, error } = await supabase
      .from("doctors")
      .upsert(payload)
      .select()
      .single();

    if (error) {
      console.error("Error saving doctor:", error);
      return null;
    }

    // Refresh local cache
    await getSharedDoctors();
    return data as SharedDoctor;
  } catch (err) {
    console.error("Error saving doctor:", err);
    return null;
  }
}

// 3. Delete Doctor directly from Supabase
export async function deleteSharedDoctor(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("doctors").delete().eq("id", id);
    if (error) return false;
    await getSharedDoctors();
    return true;
  } catch {
    return false;
  }
}

// 4. Session Persistence for Active Doctor
const DOCTOR_SESSION_KEY = "gavane_current_active_doctor_session";

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

// 5. Generic Database Slug Lookup
export function findDoctorBySlug(doctors: SharedDoctor[], rawSlug: string): SharedDoctor | undefined {
  if (!rawSlug) return undefined;
  const needle = rawSlug.toLowerCase().trim().replace(/^\/+/g, "").replace(/^dashboard\//, "");

  return doctors.find(
    (d) =>
      d.slug.toLowerCase() === needle ||
      d.id.toLowerCase() === needle ||
      generateDoctorSlug(d.name) === needle
  );
}