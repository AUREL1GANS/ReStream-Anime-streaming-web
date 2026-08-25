import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PaginationInfo } from "../types/anime";

interface PaginationProps {
  pagination?: PaginationInfo;
  currentPage?: number;
  totalPages?: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  pagination,
  currentPage: propCurrentPage,
  totalPages: propTotalPages,
  onPageChange,
}) => {
  const current = pagination ? pagination.currentPage : propCurrentPage || 1;
  const total = pagination ? pagination.totalPages : propTotalPages || 1;

  if (total <= 1) return null;

  // Build page numbers window
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (total <= maxVisible + 2) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);

      if (start > 2) pages.push("...");
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < total - 1) pages.push("...");
      pages.push(total);
    }

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div id="pagination-controls" className="flex items-center justify-center gap-2 my-10 select-none">
      <button
        id="pagination-prev-btn"
        onClick={() => onPageChange(current - 1)}
        disabled={current <= 1}
        className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
        aria-label="Halaman Sebelumnya"
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Sebelumnya</span>
      </button>

      <div className="flex items-center gap-1.5">
        {pages.map((p, idx) => {
          if (p === "...") {
            return (
              <span key={`dots-${idx}`} className="px-2 py-1 text-slate-500 text-sm">
                ...
              </span>
            );
          }

          const pageNum = Number(p);
          const isActive = pageNum === current;

          return (
            <button
              key={`page-${pageNum}`}
              id={`pagination-page-${pageNum}`}
              onClick={() => onPageChange(pageNum)}
              className={`w-9 h-9 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                isActive
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-105"
                  : "bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              {pageNum}
            </button>
          );
        })}
      </div>

      <button
        id="pagination-next-btn"
        onClick={() => onPageChange(current + 1)}
        disabled={current >= total}
        className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
        aria-label="Halaman Berikutnya"
      >
        <span className="hidden sm:inline">Berikutnya</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};
