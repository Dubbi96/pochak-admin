"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface DataTablePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** How many page numbers to show at once (default 5) */
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

export function DataTablePagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 2,
}: DataTablePaginationProps) {
  const pages = getPageNumbers(currentPage, totalPages, siblingCount);

  return (
    <div className="flex items-center justify-center gap-1 py-2">
      {/* First page */}
      <button
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full text-sm transition-colors",
          currentPage === 1
            ? "cursor-not-allowed text-gray-300"
            : "text-gray-500 hover:bg-gray-100"
        )}
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        aria-label="첫 페이지"
      >
        &laquo;
      </button>

      {/* Previous page */}
      <button
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full text-sm transition-colors",
          currentPage === 1
            ? "cursor-not-allowed text-gray-300"
            : "text-gray-500 hover:bg-gray-100"
        )}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="이전 페이지"
      >
        &lsaquo;
      </button>

      {/* Leading ellipsis */}
      {pages[0] > 1 && (
        <>
          <button
            className="flex h-8 w-8 items-center justify-center rounded-full text-sm text-gray-500 hover:bg-gray-100 transition-colors"
            onClick={() => onPageChange(1)}
          >
            1
          </button>
          {pages[0] > 2 && (
            <span className="flex h-8 w-8 items-center justify-center text-sm text-gray-400">
              ...
            </span>
          )}
        </>
      )}

      {/* Page numbers */}
      {pages.map((page) => (
        <button
          key={page}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors",
            page === currentPage
              ? "border-2 border-blue-600 text-blue-600"
              : "text-gray-500 hover:bg-gray-100"
          )}
          onClick={() => onPageChange(page)}
          disabled={page === currentPage}
        >
          {page}
        </button>
      ))}

      {/* Trailing ellipsis */}
      {pages[pages.length - 1] < totalPages && (
        <>
          {pages[pages.length - 1] < totalPages - 1 && (
            <span className="flex h-8 w-8 items-center justify-center text-sm text-gray-400">
              ...
            </span>
          )}
          <button
            className="flex h-8 w-8 items-center justify-center rounded-full text-sm text-gray-500 hover:bg-gray-100 transition-colors"
            onClick={() => onPageChange(totalPages)}
          >
            {totalPages}
          </button>
        </>
      )}

      {/* Next page */}
      <button
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full text-sm transition-colors",
          currentPage === totalPages
            ? "cursor-not-allowed text-gray-300"
            : "text-gray-500 hover:bg-gray-100"
        )}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="다음 페이지"
      >
        &rsaquo;
      </button>

      {/* Last page */}
      <button
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full text-sm transition-colors",
          currentPage === totalPages
            ? "cursor-not-allowed text-gray-300"
            : "text-gray-500 hover:bg-gray-100"
        )}
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        aria-label="마지막 페이지"
      >
        &raquo;
      </button>
    </div>
  );
}
