"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ToolbarAction {
  label: string;
  onClick: () => void;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost";
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface DataTableToolbarProps {
  selectedCount: number;
  actions?: ToolbarAction[];
  className?: string;
}

export function DataTableToolbar({
  selectedCount,
  actions = [],
  className,
}: DataTableToolbarProps) {
  if (selectedCount === 0 && actions.length === 0) return null;

  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-4 py-2",
        className
      )}
    >
      <p className="text-sm text-gray-600">
        <span className="font-semibold text-emerald-600">{selectedCount}</span>개 항목 선택됨
      </p>
      {actions.length > 0 && (
        <div className="flex items-center gap-2">
          {actions.map((action) => (
            <Button
              key={action.label}
              variant={action.variant ?? "outline"}
              size="sm"
              onClick={action.onClick}
              disabled={action.disabled || selectedCount === 0}
            >
              {action.icon && <span className="mr-1.5">{action.icon}</span>}
              {action.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
