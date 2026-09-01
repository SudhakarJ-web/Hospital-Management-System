"use client";

import React from "react";
import LedgerTable from "@/components/dashboard/shared/LedgerTable";
import { UnifiedRecord } from "@/lib/sync/hospitalMasterSync";

interface RadiologyConsumablesProps {
  records: UnifiedRecord[];
  searchTerm: string;
  onSearchChange: (val: string) => void;
  onOpenEdit: (item: UnifiedRecord) => void;
  onDelete: (id: string, name: string) => void;
}

export default function RadiologyConsumables({
  records,
  searchTerm,
  onSearchChange,
  onOpenEdit,
  onDelete,
}: RadiologyConsumablesProps) {
  const headers = [
    "Supply ID",
    "Film / Contrast Material",
    "SKU Code",
    "Modality Suite & Device",
    "Inventory Balance",
    "Batch & Expiry",
    "Status",
    "Controls",
  ];

  return (
    <LedgerTable
      moduleName="Radiology Films & Contrast Consumables"
      records={records}
      headers={headers}
      searchTerm={searchTerm}
      onSearchChange={onSearchChange}
      onOpenEdit={onOpenEdit}
      onDelete={onDelete}
    />
  );
}