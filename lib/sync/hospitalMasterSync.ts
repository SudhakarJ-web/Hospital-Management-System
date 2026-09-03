import { supabase } from "@/lib/supabase";

export interface UnifiedRecord {
  id: string;
  reference_id: string;
  col1: string; // Title / Subject / Name
  col2?: string;
  col3?: string;
  col4?: string;
  col5?: string;
  status: string;
  doctor_id?: string;
  created_at: string;
}

export async function getLiveModuleRecords(moduleName: string): Promise<UnifiedRecord[]> {
  try {
    const { data, error } = await supabase
      .from("clinical_ledgers")
      .select("*")
      .eq("module", moduleName)
      .order("created_at", { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map((item) => ({
      id: item.id,
      reference_id: item.reference_id,
      col1: item.col1,
      col2: item.col2,
      col3: item.col3,
      col4: item.col4,
      col5: item.col5,
      status: item.status,
      doctor_id: item.doctor_id,
      created_at: item.created_at,
    }));
  } catch {
    return [];
  }
}

export async function saveLiveModuleRecord(
  moduleName: string,
  record: Partial<UnifiedRecord>
): Promise<UnifiedRecord[]> {
  try {
    const isNew = !record.id || record.id.startsWith("rec-");
    const payload = {
      module: moduleName,
      reference_id: record.reference_id || `GH-${moduleName}-${Math.floor(100 + Math.random() * 900)}`,
      col1: record.col1 || "Unspecified Particular",
      col2: record.col2 || "",
      col3: record.col3 || "",
      col4: record.col4 || "",
      col5: record.col5 || "",
      status: record.status || "Active",
      doctor_id: record.doctor_id || null,
    };

    if (isNew) {
      await supabase.from("clinical_ledgers").insert([payload]);
    } else {
      await supabase.from("clinical_ledgers").update(payload).eq("id", record.id);
    }

    return await getLiveModuleRecords(moduleName);
  } catch {
    return await getLiveModuleRecords(moduleName);
  }
}

export async function deleteLiveModuleRecord(
  moduleName: string,
  id: string
): Promise<UnifiedRecord[]> {
  try {
    await supabase.from("clinical_ledgers").delete().eq("id", id);
    return await getLiveModuleRecords(moduleName);
  } catch {
    return await getLiveModuleRecords(moduleName);
  }
}

// Backward-compatible memory stub for components during initial mount
export function getUniversalStore(): Record<string, UnifiedRecord[]> {
  return {};
}

export function deleteUniversalRecord(moduleName: string, id: string): Record<string, UnifiedRecord[]> {
  deleteLiveModuleRecord(moduleName, id);
  return {};
}