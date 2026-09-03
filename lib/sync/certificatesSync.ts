import { supabase } from "@/lib/supabase";

export interface SharedCertificate {
  id: string;
  certificate_id: string;
  patient_name: string;
  patient_age: string;
  patient_gender: string;
  doctor_name: string;
  doctor_id?: string;
  diagnosis: string;
  recommended_leave: string;
  issue_date: string;
  remarks?: string;
  created_at: string;
}

export async function getSharedCertificates(): Promise<SharedCertificate[]> {
  try {
    const { data, error } = await supabase
      .from("medical_certificates")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data) {
      console.error("Error fetching certificates:", error);
      return [];
    }

    return data as SharedCertificate[];
  } catch (err) {
    console.error("Failed to query certificates:", err);
    return [];
  }
}

export async function saveSharedCertificate(cert: Partial<SharedCertificate>): Promise<SharedCertificate[]> {
  try {
    const isNew = !cert.id || cert.id.startsWith("cert-");
    const payload = {
      certificate_id: cert.certificate_id || `GH-MED-${Date.now().toString().slice(-6)}`,
      patient_name: cert.patient_name,
      patient_age: cert.patient_age || "30",
      patient_gender: cert.patient_gender || "Not specified",
      doctor_name: cert.doctor_name,
      doctor_id: cert.doctor_id || null,
      diagnosis: cert.diagnosis,
      recommended_leave: cert.recommended_leave,
      issue_date: cert.issue_date || new Date().toISOString().split("T")[0],
      remarks: cert.remarks || "",
    };

    if (isNew) {
      await supabase.from("medical_certificates").insert([payload]);
    } else {
      await supabase.from("medical_certificates").update(payload).eq("id", cert.id);
    }

    return await getSharedCertificates();
  } catch (err) {
    console.error("Failed to save certificate:", err);
    return await getSharedCertificates();
  }
}

export async function deleteSharedCertificate(id: string): Promise<SharedCertificate[]> {
  try {
    await supabase.from("medical_certificates").delete().eq("id", id);
    return await getSharedCertificates();
  } catch (err) {
    console.error("Failed to delete certificate:", err);
    return await getSharedCertificates();
  }
}