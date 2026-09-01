"use client";

import React from "react";
import LedgerTable from "@/components/dashboard/shared/LedgerTable";
import { UnifiedRecord } from "@/lib/sync/hospitalMasterSync";

interface SurgeryOtViewProps {
  records: UnifiedRecord[];
  searchTerm: string;
  onSearchChange: (val: string) => void;
  onOpenEdit: (item: UnifiedRecord) => void;
  onDelete: (id: string, name: string) => void;
}

export default function SurgeryOtView({
  records,
  searchTerm,
  onSearchChange,
  onOpenEdit,
  onDelete,
}: SurgeryOtViewProps) {
  const headers = [
    "Surgery ID",
    "Surgical Procedure",
    "Patient Legal Name",
    "OT Theater Complex",
    "Scheduled Slot",
    "Chief Surgeon",
    "Status",
    "Controls",
  ];

  return (
    <LedgerTable
      moduleName="Operation Theatre (OT) Complex"
      records={records}
      headers={headers}
      searchTerm={searchTerm}
      onSearchChange={onSearchChange}
      onOpenEdit={onOpenEdit}
      onDelete={onDelete}
    />
  );
}