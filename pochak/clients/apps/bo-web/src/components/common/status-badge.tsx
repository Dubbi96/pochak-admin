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
  color: "primary" | "amber" | "red" | "gray" | "green";
};

const STATUS_STYLES: Record<StatusType, ChipStyle> = {
  "활성화": { type: "fill", color: "primary" },
  "비활성화": { type: "outline", color: "gray" },
  "운영중": { type: "fill", color: "primary" },
  "운영중단": { type: "outline", color: "amber" },
  "해체": { type: "fill", color: "red" },
  "차단": { type: "fill", color: "red" },
  "대기": { type: "outline", color: "amber" },
  "승인": { type: "fill", color: "green" },
  "거절": { type: "fill", color: "red" },
  "활성": { type: "fill", color: "primary" },
  "중단": { type: "fill", color: "amber" },
  "종료": { type: "outline", color: "gray" },
  "이용중": { type: "fill", color: "green" },
  "만료": { type: "outline", color: "gray" },
  "취소": { type: "fill", color: "red" },
  "환불": { type: "fill", color: "red" },
  "구독활성": { type: "fill", color: "primary" },
};

const CHIP_INLINE_STYLES: Record<string, React.CSSProperties> = {
  "fill-primary": { backgroundColor: "var(--c-primary)", color: "var(--fg-on-primary)" },
  "fill-red": { backgroundColor: "var(--c-error)", color: "#fff" },
  "fill-green": { backgroundColor: "var(--c-success)", color: "var(--fg-on-primary)" },
  "fill-gray": { backgroundColor: "var(--fg-secondary)", color: "#fff" },
  "fill-amber": { backgroundColor: "#F59E0B", color: "#fff" },
  "outline-primary": {
    border: "1px solid var(--c-primary)",
    color: "var(--c-primary)",
    backgroundColor: "var(--c-primary-lighter)",
  },
  "outline-red": {
    border: "1px solid var(--c-error)",
    color: "var(--c-error)",
    backgroundColor: "rgba(229,23,40,0.05)",
  },
  "outline-green": {
    border: "1px solid var(--c-success)",
    color: "var(--c-success)",
    backgroundColor: "var(--c-primary-lighter)",
  },
  "outline-gray": {
    border: "1px solid var(--c-border)",
    color: "var(--fg-secondary)",
    backgroundColor: "var(--bg-surface-variant)",
  },
  "outline-amber": {
    border: "1px solid #F59E0B",
    color: "#B8860B",
    backgroundColor: "rgba(255,215,64,0.1)",
  },
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
        className
      )}
      style={CHIP_INLINE_STYLES[chipKey]}
    >
      {status}
    </span>
  );
}
