"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface DataTablePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
}

function getPageNumbers(currentPage: number, totalPages: number, siblingCount: number): number[] {
  const totalVisible = siblingCount * 2 + 1;

  if (totalPages <= totalVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  let start = Math.max(1, currentPage - siblingCount);
  let end = Math.min(totalPages, currentPage + siblingCount);

  if (start === 1) {
    end = Math.min(totalPages, totalVisible);
  }
  if (end === totalPages) {
    start = Math.max(1, totalPages - totalVisible + 1);
  }

  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

function PageButton({
  children,
  onClick,
  disabled,
  active,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  label?: string;
}) {
  return (
    <button
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors",
        disabled && "cursor-not-allowed",
      )}
      style={{
        color: disabled
          ? "var(--c-border)"
          : active
            ? "var(--c-primary)"
            : "var(--fg-secondary)",
        border: active ? "2px solid var(--c-primary)" : undefined,
      }}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
    >
      {children}
    </button>
  );
}

export function DataTablePagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 2,
}: DataTablePaginationProps) {
  const pages = getPageNumbers(currentPage, totalPages, siblingCount);

  return (
    <div className="flex items-center justify-center gap-1 py-2">
      <PageButton onClick={() => onPageChange(1)} disabled={currentPage === 1} label="첫 페이지">
        &laquo;
      </PageButton>

      <PageButton onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} label="이전 페이지">
        &lsaquo;
      </PageButton>

      {pages[0] > 1 && (
        <>
          <PageButton onClick={() => onPageChange(1)}>1</PageButton>
          {pages[0] > 2 && (
            <span
              className="flex h-8 w-8 items-center justify-center text-sm"
              style={{ color: "var(--fg-tertiary)" }}
            >
              ...
            </span>
          )}
        </>
      )}

      {pages.map((page) => (
        <PageButton
          key={page}
          onClick={() => onPageChange(page)}
          disabled={page === currentPage}
          active={page === currentPage}
        >
          {page}
        </PageButton>
      ))}

      {pages[pages.length - 1] < totalPages && (
        <>
          {pages[pages.length - 1] < totalPages - 1 && (
            <span
              className="flex h-8 w-8 items-center justify-center text-sm"
              style={{ color: "var(--fg-tertiary)" }}
            >
              ...
            </span>
          )}
          <PageButton onClick={() => onPageChange(totalPages)}>{totalPages}</PageButton>
        </>
      )}

      <PageButton onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} label="다음 페이지">
        &rsaquo;
      </PageButton>

      <PageButton onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages} label="마지막 페이지">
        &raquo;
      </PageButton>
    </div>
  );
}
