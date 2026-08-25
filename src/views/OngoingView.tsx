import React, { useState, useEffect } from "react";
import { Flame, RefreshCw } from "lucide-react";
import { animeApi } from "../services/animeApi";
import { AnimeCardItem, PaginationInfo } from "../types/anime";
import { AnimeGrid } from "../components/AnimeGrid";
import { Pagination } from "../components/Pagination";

interface OngoingViewProps {
  onSelectAnime: (animeId: string) => void;
}

export const OngoingView: React.FC<OngoingViewProps> = ({ onSelectAnime }) => {
  const [animeList, setAnimeList] = useState<AnimeCardItem[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOngoing = async (page: number) => {
    setLoading(true);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });

    try {
      const res = await animeApi.getOngoing(page);
      setAnimeList(res.data?.animeList || []);
      setPagination(res.pagination);
    } catch (err: any) {
      setError(err.message || "Gagal memuat anime ongoing.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOngoing(currentPage);
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div id="ongoing-view-container" className="space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Anime Ongoing</h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Daftar anime yang sedang aktif tayang dengan episode terupdate
            </p>
          </div>
        </div>

        {pagination && (
          <div className="text-xs text-slate-400 font-semibold px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 self-start sm:self-auto">
            Halaman {pagination.currentPage} dari {pagination.totalPages}
          </div>
        )}
      </div>

      {error ? (
        <div className="py-20 text-center space-y-4">
          <p className="text-rose-400 text-sm">{error}</p>
          <button
            id="ongoing-retry-btn"
            onClick={() => fetchOngoing(currentPage)}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/30 cursor-pointer"
          >
            Coba Lagi
          </button>
        </div>
      ) : (
        <>
          <AnimeGrid
            animeList={animeList}
            loading={loading}
            onSelectAnime={onSelectAnime}
            statusBadge="Ongoing"
          />

          {!loading && (
            <Pagination
              pagination={pagination}
              currentPage={currentPage}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
};
