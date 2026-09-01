"use client";

import React from "react";
import LedgerTable from "@/components/dashboard/shared/LedgerTable";
import { UnifiedRecord } from "@/lib/sync/hospitalMasterSync";

interface ClinicalQueueViewProps {
  type: "OPD" | "IPD";
  records: UnifiedRecord[];
  searchTerm: string;
  onSearchChange: (val: string) => void;
  onOpenEdit: (item: UnifiedRecord) => void;
  onDelete: (id: string, name: string) => void;
}

export default function ClinicalQueueView({
  type,
  records,
  searchTerm,
  onSearchChange,
  onOpenEdit,
  onDelete,
}: ClinicalQueueViewProps) {
  const headers =
    type === "OPD"
      ? ["Token / ID", "Patient Legal Name", "Token Number", "Specialty Department", "Observed Vitals", "Assigned Doctor", "Status", "Controls"]
      : ["Admission ID", "Patient Legal Name", "Bed & Ward", "Department Ward", "Admission Date", "Consultant Doctor", "Status", "Controls"];

  return (
    <LedgerTable
      moduleName={type === "OPD" ? "OPD Consultation Queue" : "In-Patient (IPD) Admissions"}
      records={records}
      headers={headers}
      searchTerm={searchTerm}
      onSearchChange={onSearchChange}
      onOpenEdit={onOpenEdit}
      onDelete={onDelete}
    />
  );
}