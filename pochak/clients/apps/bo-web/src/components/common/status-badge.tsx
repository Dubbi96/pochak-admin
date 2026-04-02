import * as React from "react";
import { cn } from "@/lib/utils";

export type StatusType =
  | "활성화"
  | "비활성화"
  | "운영중"
  | "운영중단"
  | "해체"
  | "차단"
  | "대기"
  | "승인"
  | "거절"
  | "활성"
  | "중단"
  | "종료"
  | "이용중"
  | "만료"
  | "취소"
  | "환불"
  | "구독활성";

type ChipStyle = {
  type: "fill" | "outline";
  color: "blue" | "amber" | "red" | "gray" | "green";
};

const STATUS_STYLES: Record<StatusType, ChipStyle> = {
  "활성화": { type: "fill", color: "blue" },
  "비활성화": { type: "outline", color: "gray" },
  "운영중": { type: "fill", color: "blue" },
  "운영중단": { type: "outline", color: "amber" },
  "해체": { type: "fill", color: "red" },
  "차단": { type: "fill", color: "red" },
  "대기": { type: "outline", color: "amber" },
  "승인": { type: "fill", color: "green" },
  "거절": { type: "fill", color: "red" },
  "활성": { type: "fill", color: "blue" },
  "중단": { type: "fill", color: "amber" },
  "종료": { type: "outline", color: "gray" },
  "이용중": { type: "fill", color: "green" },
  "만료": { type: "outline", color: "gray" },
  "취소": { type: "fill", color: "red" },
  "환불": { type: "fill", color: "red" },
  "구독활성": { type: "fill", color: "blue" },
};

const CHIP_CLASSES: Record<string, string> = {
  "fill-blue": "bg-blue-600 text-white",
  "fill-red": "bg-red-500 text-white",
  "fill-green": "bg-green-600 text-white",
  "fill-gray": "bg-gray-500 text-white",
  "fill-amber": "bg-amber-500 text-white",
  "outline-blue": "border border-blue-300 text-blue-700 bg-blue-50",
  "outline-red": "border border-red-300 text-red-700 bg-red-50",
  "outline-green": "border border-green-300 text-green-700 bg-green-50",
  "outline-gray": "border border-gray-300 text-gray-600 bg-gray-50",
  "outline-amber": "border border-amber-300 text-amber-700 bg-amber-50",
};

interface StatusBadgeProps {
  status: StatusType | string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_STYLES[status as StatusType] ?? { type: "outline" as const, color: "gray" as const };
  const chipKey = `${config.type}-${config.color}`;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
        CHIP_CLASSES[chipKey],
        className
      )}
    >
      {status}
    </span>
  );
}
