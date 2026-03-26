"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExportColumn {
  header: string;
  accessor: string;
}

interface ExportButtonProps<TData> {
  data: TData[];
  columns: ExportColumn[];
  filename?: string;
  label?: string;
  className?: string;
  disabled?: boolean;
}

function escapeCSVValue(value: unknown): string {
  const str = value == null ? "" : String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, part) => {
    if (acc && typeof acc === "object") {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, obj);
}

export function ExportButton<TData extends Record<string, unknown>>({
  data,
  columns,
  filename = "export",
  label = "Export",
  className,
  disabled = false,
}: ExportButtonProps<TData>) {
  const handleExport = () => {
    if (data.length === 0) return;

    const BOM = "\uFEFF";
    const header = columns.map((col) => escapeCSVValue(col.header)).join(",");
    const rows = data.map((row) =>
      columns.map((col) => escapeCSVValue(getNestedValue(row, col.accessor))).join(",")
    );

    const csv = BOM + [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      disabled={disabled || data.length === 0}
      className={cn(className)}
    >
      <Download className="mr-1.5 h-4 w-4" />
      {label}
    </Button>
  );
}
