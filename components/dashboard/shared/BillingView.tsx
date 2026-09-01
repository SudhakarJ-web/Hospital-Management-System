"use client";

import React from "react";
import LedgerTable from "@/components/dashboard/shared/LedgerTable";
import { UnifiedRecord } from "@/lib/sync/hospitalMasterSync";

interface BillingViewProps {
  records: UnifiedRecord[];
  searchTerm: string;
  onSearchChange: (val: string) => void;
  onOpenEdit: (item: UnifiedRecord) => void;
  onDelete: (id: string, name: string) => void;
}

export default function BillingView({
  records,
  searchTerm,
  onSearchChange,
  onOpenEdit,
  onDelete,
}: BillingViewProps) {
  const headers = [
    "Invoice ID",
    "Citizen / Patient Name",
    "Service Description",
    "Net Amount (₹)",
    "Payment Mode & Desk",
    "Settlement Notes",
    "Status",
    "Controls",
  ];

  return (
    <LedgerTable
      moduleName="Billing & Financial Receipts"
      records={records}
      headers={headers}
      searchTerm={searchTerm}
      onSearchChange={onSearchChange}
      onOpenEdit={onOpenEdit}
      onDelete={onDelete}
    />
  );
}