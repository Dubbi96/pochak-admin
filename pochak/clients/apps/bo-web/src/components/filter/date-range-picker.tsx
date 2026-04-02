"use client";

import * as React from "react";
import { format, subMonths } from "date-fns";
import { cn } from "@/lib/utils";

export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

interface QuickPeriod {
  label: string;
  months: number;
}

const QUICK_PERIODS: QuickPeriod[] = [
  { label: "3개월", months: 3 },
  { label: "6개월", months: 6 },
];

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  label?: string;
  className?: string;
  disabled?: boolean;
  onSearch?: () => void;
  onReset?: () => void;
}

export function DateRangePicker({
  value,
  onChange,
  label = "결제일",
  className,
  disabled = false,
  onSearch,
  onReset,
}: DateRangePickerProps) {
  const [selectedPeriod, setSelectedPeriod] = React.useState<number | null>(null);

  const handleQuickPeriod = (months: number) => {
    const now = new Date();
    const from = subMonths(now, months);
    onChange({ from, to: now });
    setSelectedPeriod(months);
  };

  const handleFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value;
    onChange({
      from: dateValue ? new Date(dateValue) : undefined,
      to: value.to,
    });
    setSelectedPeriod(null);
  };

  const handleToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value;
    onChange({
      from: value.from,
      to: dateValue ? new Date(dateValue) : undefined,
    });
    setSelectedPeriod(null);
  };

  const handleReset = () => {
    onChange({ from: undefined, to: undefined });
    setSelectedPeriod(null);
    onReset?.();
  };

  const dateInputStyle: React.CSSProperties = {
    border: "1px solid var(--c-border)",
    backgroundColor: "var(--bg-surface)",
    color: "var(--fg)",
  };

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className="text-sm font-medium whitespace-nowrap" style={{ color: "var(--fg)" }}>
        {label}
      </span>

      <div className="flex items-center gap-2">
        <input
          type="date"
          value={value.from ? format(value.from, "yyyy-MM-dd") : ""}
          onChange={handleFromChange}
          disabled={disabled}
          className="h-9 rounded-md px-3 text-sm shadow-sm focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          style={dateInputStyle}
        />
        <span style={{ color: "var(--fg-tertiary)" }}>~</span>
        <input
          type="date"
          value={value.to ? format(value.to, "yyyy-MM-dd") : ""}
          onChange={handleToChange}
          disabled={disabled}
          className="h-9 rounded-md px-3 text-sm shadow-sm focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          style={dateInputStyle}
        />
      </div>

      <div className="flex items-center gap-1">
        {QUICK_PERIODS.map((period) => (
          <button
            key={period.months}
            type="button"
            disabled={disabled}
            onClick={() => handleQuickPeriod(period.months)}
            className="h-9 rounded-md px-3 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              border: selectedPeriod === period.months
                ? "1px solid var(--c-primary)"
                : "1px solid var(--c-border)",
              backgroundColor: "var(--bg-surface)",
              color: selectedPeriod === period.months
                ? "var(--c-primary)"
                : "var(--fg)",
            }}
          >
            {period.label}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={handleReset}
        disabled={disabled}
        className="flex h-9 items-center gap-1 rounded-md px-3 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        style={{
          border: "1px solid var(--c-border)",
          backgroundColor: "var(--bg-surface)",
          color: "var(--fg)",
        }}
      >
        <span className="text-base leading-none">&#x21bb;</span>
        초기화
      </button>

      {onSearch && (
        <button
          type="button"
          onClick={onSearch}
          disabled={disabled}
          className="h-9 rounded-md px-4 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          style={{
            backgroundColor: "var(--c-primary)",
            color: "var(--fg-on-primary)",
          }}
        >
          검색
        </button>
      )}
    </div>
  );
}
