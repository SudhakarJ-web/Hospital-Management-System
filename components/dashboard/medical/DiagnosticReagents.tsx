"use client";

import React from "react";
import LedgerTable from "@/components/dashboard/shared/LedgerTable";
import { UnifiedRecord } from "@/lib/sync/hospitalMasterSync";

interface DiagnosticReagentsProps {
  records: UnifiedRecord[];
  searchTerm: string;
  onSearchChange: (val: string) => void;
  onOpenEdit: (item: UnifiedRecord) => void;
  onDelete: (id: string, name: string) => void;
}

export default function DiagnosticReagents({
  records,
  searchTerm,
  onSearchChange,
  onOpenEdit,
  onDelete,
}: DiagnosticReagentsProps) {
  const headers = [
    "Reagent ID",
    "Assay / Kit Description",
    "SKU Identifier",
    "Analyzer Instrument",
    "Available Volume / Tests",
    "Lot Number & Expiry",
    "Status",
    "Controls",
  ];

  return (
    <LedgerTable
      moduleName="Pathology Reagents & Laboratory Kits"
      records={records}
      headers={headers}
      searchTerm={searchTerm}
      onSearchChange={onSearchChange}
      onOpenEdit={onOpenEdit}
      onDelete={onDelete}
    />
  );
}