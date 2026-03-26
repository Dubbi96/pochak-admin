"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { SearchInput, type SearchTypeOption } from "./search-input";
import { DateRangePicker, type DateRange } from "./date-range-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RotateCcw, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FilterDropdown {
  key: string;
  label: string;
  placeholder?: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

interface FilterBarProps {
  /** Search input value */
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  /** Search type dropdown (전체/이름/이메일 etc) */
  searchTypes?: SearchTypeOption[];
  selectedSearchType?: string;
  onSearchTypeChange?: (type: string) => void;
  /** Dropdown filters */
  dropdowns?: FilterDropdown[];
  /** Date range filter */
  dateRange?: DateRange;
  onDateRangeChange?: (range: DateRange) => void;
  dateRangeLabel?: string;
  /** Action callbacks */
  onSearch: () => void;
  onReset: () => void;
  className?: string;
}

export function FilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  searchTypes,
  selectedSearchType,
  onSearchTypeChange,
  dropdowns,
  dateRange,
  onDateRangeChange,
  dateRangeLabel,
  onSearch,
  onReset,
  className,
}: FilterBarProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-gray-200 bg-white px-5 py-4",
        className
      )}
    >
      <div className="flex flex-wrap items-end gap-4">
        {/* Search input */}
        {onSearchChange && searchValue !== undefined && (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">검색</label>
            <SearchInput
              value={searchValue}
              onChange={onSearchChange}
              placeholder={searchPlaceholder}
              searchTypes={searchTypes}
              selectedSearchType={selectedSearchType}
              onSearchTypeChange={onSearchTypeChange}
              onSearch={onSearch}
            />
          </div>
        )}

        {/* Dropdown filters */}
        {dropdowns?.map((dropdown) => (
          <div key={dropdown.key} className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">{dropdown.label}</label>
            <Select value={dropdown.value} onValueChange={dropdown.onChange}>
              <SelectTrigger className="h-9 w-[160px]">
                <SelectValue placeholder={dropdown.placeholder ?? dropdown.label} />
              </SelectTrigger>
              <SelectContent>
                {dropdown.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}

        {/* Date range */}
        {onDateRangeChange && dateRange && (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              {dateRangeLabel ?? "기간"}
            </label>
            <DateRangePicker value={dateRange} onChange={onDateRangeChange} />
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-end gap-2 ml-auto">
          <Button
            variant="outline"
            onClick={onReset}
            size="default"
            className="h-9 border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <RotateCcw className="mr-1.5 h-4 w-4" />
            초기화
          </Button>
          <Button
            onClick={onSearch}
            size="default"
            className="h-9 bg-blue-600 text-white hover:bg-blue-700"
          >
            <Search className="mr-1.5 h-4 w-4" />
            검색
          </Button>
        </div>
      </div>
    </div>
  );
}
