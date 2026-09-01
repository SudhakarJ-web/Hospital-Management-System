"use client";

import React from "react";
import LedgerTable from "@/components/dashboard/shared/LedgerTable";
import { UnifiedRecord } from "@/lib/sync/hospitalMasterSync";

interface InventoryViewProps {
  records: UnifiedRecord[];
  searchTerm: string;
  onSearchChange: (val: string) => void;
  onOpenEdit: (item: UnifiedRecord) => void;
  onDelete: (id: string, name: string) => void;
}

export default function InventoryView({
  records,
  searchTerm,
  onSearchChange,
  onOpenEdit,
  onDelete,
}: InventoryViewProps) {
  const headers = [
    "SKU / Item ID",
    "Medication / Drug Name",
    "Package Identifier",
    "Batch Information",
    "Available Units & MRP",
    "Expiry Date",
    "Status",
    "Controls",
  ];

  return (
    <LedgerTable
      moduleName="Pharmacy & Drug Stock"
      records={records}
      headers={headers}
      searchTerm={searchTerm}
      onSearchChange={onSearchChange}
      onOpenEdit={onOpenEdit}
      onDelete={onDelete}
    />
  );
}