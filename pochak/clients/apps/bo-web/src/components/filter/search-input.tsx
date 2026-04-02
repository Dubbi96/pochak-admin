"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchTypeOption {
  value: string;
  label: string;
}

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchTypes?: SearchTypeOption[];
  selectedSearchType?: string;
  onSearchTypeChange?: (type: string) => void;
  onSearch?: () => void;
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "검색어를 입력하세요",
  searchTypes,
  selectedSearchType,
  onSearchTypeChange,
  onSearch,
  className,
}: SearchInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onSearch?.();
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {searchTypes && searchTypes.length > 0 && (
        <Select value={selectedSearchType} onValueChange={onSearchTypeChange}>
          <SelectTrigger className="h-9 w-[140px] shrink-0">
            <SelectValue placeholder="검색 유형" />
          </SelectTrigger>
          <SelectContent>
            {searchTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="h-9 pl-8"
        />
      </div>
    </div>
  );
}
