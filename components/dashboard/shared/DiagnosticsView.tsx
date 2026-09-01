"use client";

import React from "react";
import LedgerTable from "@/components/dashboard/shared/LedgerTable";
import { UnifiedRecord } from "@/lib/sync/hospitalMasterSync";

interface DiagnosticsViewProps {
  type: "Radiology" | "Pathology";
  records: UnifiedRecord[];
  searchTerm: string;
  onSearchChange: (val: string) => void;
  onOpenEdit: (item: UnifiedRecord) => void;
  onDelete: (id: string, name: string) => void;
}

export default function DiagnosticsView({
  type,
  records,
  searchTerm,
  onSearchChange,
  onOpenEdit,
  onDelete,
}: DiagnosticsViewProps) {
  const headers =
    type === "Radiology"
      ? ["Scan ID", "Imaging Investigation", "Patient Name", "Radiology Suite", "Timestamp", "Radiologist Notes", "Status", "Controls"]
      : ["Sample ID", "Diagnostic Panel", "Identifier", "Lab Section", "Patient Name", "Observed Values", "Status", "Controls"];

  return (
    <LedgerTable
      moduleName={type === "Radiology" ? "Radiology & Imaging" : "Diagnostic Pathology Lab"}
      records={records}
      headers={headers}
      searchTerm={searchTerm}
      onSearchChange={onSearchChange}
      onOpenEdit={onOpenEdit}
      onDelete={onDelete}
    />
  );
}