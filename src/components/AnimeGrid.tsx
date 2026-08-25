import React from "react";
import { AnimeCardItem } from "../types/anime";
import { AnimeCard } from "./AnimeCard";
import { AnimeGridSkeleton } from "./SkeletonLoader";
import { Film } from "lucide-react";

interface AnimeGridProps {
  animeList: AnimeCardItem[];
  loading?: boolean;
  onSelectAnime: (animeId: string) => void;
  statusBadge?: string;
  emptyMessage?: string;
}

export const AnimeGrid: React.FC<AnimeGridProps> = ({
  animeList,
  loading = false,
  onSelectAnime,
  statusBadge,
  emptyMessage = "Tidak ada anime ditemukan.",
}) => {
  if (loading) {
    return <AnimeGridSkeleton count={12} />;
  }

  if (!animeList || animeList.length === 0) {
    return (
      <div id="anime-grid-empty-state" className="text-center py-16 px-4 bg-slate-900/40 rounded-3xl border border-slate-800">
        <Film className="w-12 h-12 mx-auto text-slate-600 mb-3" />
        <h3 className="text-base font-semibold text-slate-300 mb-1">{emptyMessage}</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Silakan coba kategori lain atau cari menggunakan kolom pencarian.
        </p>
      </div>
    );
  }

  return (
    <div
      id="anime-cards-grid"
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-5"
    >
      {animeList.map((anime) => (
        <AnimeCard
          key={anime.animeId}
          anime={anime}
          onClick={onSelectAnime}
          statusBadge={statusBadge}
        />
      ))}
    </div>
  );
};
