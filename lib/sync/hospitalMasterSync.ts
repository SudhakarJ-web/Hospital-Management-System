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

const INVENTORY_MODULES = [
  "STOCK",
  "DISPENSARY",
  "PATHOLOGY",
  "RADIOLOGY",
  "BLOOD_BANK",
  "CSSD",
  "NARCOTICS",
  "SUPPLIERS",
  "AUDIT",
];

const OPERATIONS_MODULES = [
  "BILLING",
  "IPD",
  "OT",
  "DISCHARGE",
  "VISITOR",
  "UTILITY",
  "ANALYSIS",
];

export async function getLiveModuleRecords(moduleKey: string): Promise<UnifiedRecord[]> {
  const normKey = moduleKey.toUpperCase();

  try {
    // 1. Staff Directory Table
    if (normKey === "MEDICAL_STAFF" || normKey === "SUPPORT_STAFF") {
      const { data, error } = await supabase
        .from("staff_members")
        .select("*")
        .eq("role_type", normKey)
        .order("created_at", { ascending: false });

      if (error || !data) return [];

      return data.map((row) => ({
        id: row.id,
        module: row.role_type,
        reference_id: row.reference_id,
        col1: row.full_name,
        col2: row.designation_dept,
        col3: row.email,
        col4: row.password,
        col5: row.phone_details,
        status: row.status || "Active",
        created_at: row.created_at,
      }));
    }

    // 2. Clinical Depot & Medical Inventory Table
    if (INVENTORY_MODULES.includes(normKey)) {
      const { data, error } = await supabase
        .from("medical_inventory")
        .select("*")
        .eq("category", normKey)
        .order("created_at", { ascending: false });

      if (error || !data) return [];

      return data.map((row) => ({
        id: row.id,
        module: row.category,
        reference_id: row.reference_id,
        col1: row.item_name,
        col2: row.batch_lot,
        col3: row.quantity,
        col4: row.location_officer,
        col5: row.expiry_cycle,
        status: row.status || "Available",
        doctor_id: row.doctor_id,
        created_at: row.created_at,
      }));
    }

    // 3. Hospital Operations & Ledgers Table
    if (OPERATIONS_MODULES.includes(normKey)) {
      const { data, error } = await supabase
        .from("hospital_operations")
        .select("*")
        .eq("module_type", normKey)
        .order("created_at", { ascending: false });

      if (error || !data) return [];

      return data.map((row) => ({
        id: row.id,
        module: row.module_type,
        reference_id: row.reference_id,
        col1: row.subject_name,
        col2: row.description_particulars,
        col3: row.contact_amount,
        col4: row.processed_by,
        col5: "",
        status: row.status || "Active",
        doctor_id: row.doctor_id,
        created_at: row.created_at,
      }));
    }

    return [];
  } catch (err) {
    console.error(`Error reading module ${moduleKey}:`, err);
    return [];
  }
}

export async function saveLiveModuleRecord(
  moduleKey: string,
  record: Partial<UnifiedRecord>
): Promise<UnifiedRecord> {
  const normKey = moduleKey.toUpperCase();
  const ref =
    record.reference_id ||
    `GH-${normKey.slice(0, 3)}-${Math.floor(1000 + Math.random() * 9000)}`;

  // 1. Persist Staff Records into public.staff_members
  if (normKey === "MEDICAL_STAFF" || normKey === "SUPPORT_STAFF") {
    const payload = {
      reference_id: ref,
      role_type: normKey,
      full_name: record.col1 || "Staff Member",
      designation_dept: record.col2 || "General Department",
      email: (record.col3 || "").toLowerCase().trim(),
      password: record.col4 || "Staff@2026",
      phone_details: record.col5 || "",
      status: record.status || "Active",
    };

    if (record.id) {
      const { data, error } = await supabase
        .from("staff_members")
        .update(payload)
        .eq("id", record.id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return {
        id: data.id,
        module: data.role_type,
        reference_id: data.reference_id,
        col1: data.full_name,
        col2: data.designation_dept,
        col3: data.email,
        col4: data.password,
        col5: data.phone_details,
        status: data.status,
      };
    } else {
      const { data, error } = await supabase
        .from("staff_members")
        .insert([payload])
        .select()
        .single();

      if (error) throw new Error(error.message);
      return {
        id: data.id,
        module: data.role_type,
        reference_id: data.reference_id,
        col1: data.full_name,
        col2: data.designation_dept,
        col3: data.email,
        col4: data.password,
        col5: data.phone_details,
        status: data.status,
      };
    }
  }

  // 2. Persist Medical Stock into public.medical_inventory
  if (INVENTORY_MODULES.includes(normKey)) {
    const payload = {
      reference_id: ref,
      category: normKey,
      item_name: record.col1 || "Medical Item",
      batch_lot: record.col2 || "LOT-2026",
      quantity: record.col3 || "1",
      location_officer: record.col4 || "Clinical Depot",
      expiry_cycle: record.col5 || "-",
      status: record.status || "Available",
      doctor_id: record.doctor_id || null,
    };

    if (record.id) {
      const { data, error } = await supabase
        .from("medical_inventory")
        .update(payload)
        .eq("id", record.id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return {
        id: data.id,
        module: data.category,
        reference_id: data.reference_id,
        col1: data.item_name,
        col2: data.batch_lot,
        col3: data.quantity,
        col4: data.location_officer,
        col5: data.expiry_cycle,
        status: data.status,
      };
    } else {
      const { data, error } = await supabase
        .from("medical_inventory")
        .insert([payload])
        .select()
        .single();

      if (error) throw new Error(error.message);
      return {
        id: data.id,
        module: data.category,
        reference_id: data.reference_id,
        col1: data.item_name,
        col2: data.batch_lot,
        col3: data.quantity,
        col4: data.location_officer,
        col5: data.expiry_cycle,
        status: data.status,
      };
    }
  }

  // 3. Persist Hospital Operations into public.hospital_operations
  const payload = {
    reference_id: ref,
    module_type: normKey,
    subject_name: record.col1 || "Subject",
    description_particulars: record.col2 || "-",
    contact_amount: record.col3 || "-",
    processed_by: record.col4 || "Staff",
    status: record.status || "Active",
    doctor_id: record.doctor_id || null,
  };

  if (record.id) {
    const { data, error } = await supabase
      .from("hospital_operations")
      .update(payload)
      .eq("id", record.id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return {
      id: data.id,
      module: data.module_type,
      reference_id: data.reference_id,
      col1: data.subject_name,
      col2: data.description_particulars,
      col3: data.contact_amount,
      col4: data.processed_by,
      status: data.status,
    };
  } else {
    const { data, error } = await supabase
      .from("hospital_operations")
      .insert([payload])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return {
      id: data.id,
      module: data.module_type,
      reference_id: data.reference_id,
      col1: data.subject_name,
      col2: data.description_particulars,
      col3: data.contact_amount,
      col4: data.processed_by,
      status: data.status,
    };
  }
}

export async function deleteLiveModuleRecord(
  moduleKey: string,
  id: string
): Promise<boolean> {
  const normKey = moduleKey.toUpperCase();

  try {
    if (normKey === "MEDICAL_STAFF" || normKey === "SUPPORT_STAFF") {
      const { error } = await supabase
        .from("staff_members")
        .delete()
        .eq("id", id);
      return !error;
    }

    if (INVENTORY_MODULES.includes(normKey)) {
      const { error } = await supabase
        .from("medical_inventory")
        .delete()
        .eq("id", id);
      return !error;
    }

    const { error } = await supabase
      .from("hospital_operations")
      .delete()
      .eq("id", id);
    return !error;
  } catch {
    return false;
  }
}