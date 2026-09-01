"use client";

import React from "react";
import LedgerTable from "@/components/dashboard/shared/LedgerTable";
import { UnifiedRecord } from "@/lib/sync/hospitalMasterSync";

interface ExpiredQuarantineProps {
  records: UnifiedRecord[];
  searchTerm: string;
  onSearchChange: (val: string) => void;
  onOpenEdit: (item: UnifiedRecord) => void;
  onDelete: (id: string, name: string) => void;
}

export default function ExpiredQuarantine({
  records,
  searchTerm,
  onSearchChange,
  onOpenEdit,
  onDelete,
}: ExpiredQuarantineProps) {
  const headers = [
    "Audit Log Ref",
    "Quarantined Drug / Chemical",
    "SKU Code",
    "Condemned Batch Lot",
    "Quarantined Quantity",
    "Disposal Protocol / Incineration Log",
    "Status",
    "Controls",
  ];

  return (
    <LedgerTable
      moduleName="Quarantine, Expired Drugs & Compliance Audit Logs"
      records={records}
      headers={headers}
      searchTerm={searchTerm}
      onSearchChange={onSearchChange}
      onOpenEdit={onOpenEdit}
      onDelete={onDelete}
    />
  );
}