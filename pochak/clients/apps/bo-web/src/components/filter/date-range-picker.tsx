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
  /** Called when search is clicked */
  onSearch?: () => void;
  /** Called when reset is clicked */
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

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* Label */}
      <span className="text-sm font-medium text-gray-700 whitespace-nowrap">{label}</span>

      {/* Date inputs */}
      <div className="flex items-center gap-2">
        <input
          type="date"
          value={value.from ? format(value.from, "yyyy-MM-dd") : ""}
          onChange={handleFromChange}
          disabled={disabled}
          className="h-9 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <span className="text-gray-400">~</span>
        <input
          type="date"
          value={value.to ? format(value.to, "yyyy-MM-dd") : ""}
          onChange={handleToChange}
          disabled={disabled}
          className="h-9 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      {/* Quick period toggle buttons */}
      <div className="flex items-center gap-1">
        {QUICK_PERIODS.map((period) => (
          <button
            key={period.months}
            type="button"
            disabled={disabled}
            onClick={() => handleQuickPeriod(period.months)}
            className={cn(
              "h-9 rounded-md border px-3 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
              selectedPeriod === period.months
                ? "border-blue-600 bg-white text-blue-600"
                : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            )}
          >
            {period.label}
          </button>
        ))}
      </div>

      {/* Reset button */}
      <button
        type="button"
        onClick={handleReset}
        disabled={disabled}
        className="flex h-9 items-center gap-1 rounded-md border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className="text-base leading-none">&#x21bb;</span>
        초기화
      </button>

      {/* Search button */}
      {onSearch && (
        <button
          type="button"
          onClick={onSearch}
          disabled={disabled}
          className="h-9 rounded-md bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          검색
        </button>
      )}
    </div>
  );
}
