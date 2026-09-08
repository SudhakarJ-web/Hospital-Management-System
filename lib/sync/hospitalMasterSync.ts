import { supabase } from "@/lib/supabase";

export interface UnifiedRecord {
  id: string;
  module: string;
  reference_id: string;
  col1: string;
  col2?: string;
  col3?: string;
  col4?: string;
  col5?: string;
  status: string;
  doctor_id?: string;
  created_at?: string;
}

export async function getLiveModuleRecords(moduleKey: string): Promise<UnifiedRecord[]> {
  try {
    const { data, error } = await supabase
      .from("clinical_ledgers")
      .select("*")
      .eq("module", moduleKey.toUpperCase())
      .order("created_at", { ascending: false });

    if (error || !data) {
      console.error(`Error fetching ledger ${moduleKey}:`, error);
      return [];
    }

    return data.map((row) => ({
      id: row.id,
      module: row.module,
      reference_id: row.reference_id || `GH-${row.id?.slice(0, 5)}`,
      col1: row.col1 || "",
      col2: row.col2 || "",
      col3: row.col3 || "",
      col4: row.col4 || "",
      col5: row.col5 || "",
      status: row.status || "Active",
      doctor_id: row.doctor_id,
      created_at: row.created_at,
    }));
  } catch (err) {
    console.error(`Ledger query failure on ${moduleKey}:`, err);
    return [];
  }
}

export async function saveLiveModuleRecord(
  moduleKey: string,
  record: Partial<UnifiedRecord>
): Promise<UnifiedRecord> {
  const ref =
    record.reference_id ||
    `GH-${moduleKey.slice(0, 3)}-${Math.floor(1000 + Math.random() * 9000)}`;

  const payload = {
    module: moduleKey.toUpperCase(),
    reference_id: ref,
    col1: record.col1 || "",
    col2: record.col2 || "",
    col3: record.col3 || "",
    col4: record.col4 || "",
    col5: record.col5 || "",
    status: record.status || "Active",
    doctor_id: record.doctor_id || null,
  };

  if (record.id) {
    // Update existing record
    const { data, error } = await supabase
      .from("clinical_ledgers")
      .update(payload)
      .eq("id", record.id)
      .select()
      .single();

    if (error) {
      console.error(`Update failed in ${moduleKey}:`, error);
      throw new Error(error.message || "Database failed to update staff record");
    }
    return data as UnifiedRecord;
  } else {
    // Insert new record
    const { data, error } = await supabase
      .from("clinical_ledgers")
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error(`Insert failed in ${moduleKey}:`, error);
      throw new Error(error.message || "Database failed to persist staff record");
    }
    return data as UnifiedRecord;
  }
}

export async function deleteLiveModuleRecord(
  moduleKey: string,
  id: string
): Promise<boolean> {
  const { error } = await supabase
    .from("clinical_ledgers")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(`Delete failed in ${moduleKey}:`, error);
    return false;
  }
  return true;
}