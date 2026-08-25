import React from "react";
import { Play, Star, Bookmark, CheckCircle2, Clock } from "lucide-react";
import { AnimeCardItem } from "../types/anime";
import { getCleanImageUrl } from "../services/animeApi";
import { useBookmarks } from "../contexts/BookmarkContext";
import { useToast } from "../contexts/ToastContext";

interface AnimeCardProps {
  anime: AnimeCardItem;
  onClick: (animeId: string) => void;
  statusBadge?: string;
}

export const AnimeCard: React.FC<AnimeCardProps> = ({ anime, onClick, statusBadge }) => {
  const { isBookmarked, toggleBookmark, getHistoryForAnime } = useBookmarks();
  const { showToast } = useToast();

  const bookmarked = isBookmarked(anime.animeId);
  const watchHistory = getHistoryForAnime(anime.animeId);

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleBookmark({
      animeId: anime.animeId,
      title: anime.title,
      poster: anime.poster,
      score: anime.score,
      episodes: anime.episodes,
    });
    showToast(
      bookmarked ? `Dihapus dari Watchlist: ${anime.title}` : `Disimpan ke Watchlist: ${anime.title}`,
      bookmarked ? "info" : "success"
    );
  };

  const episodesText =
    anime.episodes !== undefined && anime.episodes !== null
      ? typeof anime.episodes === "number"
        ? `Ep ${anime.episodes}`
        : anime.episodes.toString().startsWith("Ep")
        ? anime.episodes
        : `${anime.episodes} Ep`
      : null;

  return (
    <div
      id={`anime-card-${anime.animeId}`}
      onClick={() => onClick(anime.animeId)}
      className="group relative flex flex-col bg-slate-900/60 hover:bg-slate-900/90 rounded-2xl overflow-hidden border border-slate-800/80 hover:border-cyan-500/50 hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
    >
      {/* Poster Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-950">
        <img
          src={getCleanImageUrl(anime.poster)}
          alt={anime.title}
          referrerPolicy="no-referrer"
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-500 ease-out"
        />

        {/* Ambient Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none z-10">
          <div className="flex flex-wrap gap-1.5">
            {episodesText && (
              <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-slate-950/85 text-cyan-300 backdrop-blur-md border border-cyan-500/30 shadow-sm">
                {episodesText}
              </span>
            )}
            {statusBadge && (
              <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-emerald-950/85 text-emerald-300 backdrop-blur-md border border-emerald-500/40 shadow-sm">
                {statusBadge}
              </span>
            )}
          </div>

          {anime.score && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black bg-slate-950/85 text-amber-400 backdrop-blur-md border border-amber-500/40 ml-auto shadow-sm">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              {anime.score}
            </span>
          )}
        </div>

        {/* Hover Overlay with Quick Play & Bookmark */}
        <div className="absolute inset-0 bg-slate-950/65 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 backdrop-blur-[2px] z-20">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white flex items-center justify-center shadow-xl shadow-cyan-500/40 transform scale-75 group-hover:scale-100 transition-transform duration-300">
            <Play className="w-5 h-5 fill-white ml-0.5" />
          </div>

          <button
            type="button"
            id={`card-bookmark-btn-${anime.animeId}`}
            onClick={handleBookmarkClick}
            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all cursor-pointer backdrop-blur-md ${
              bookmarked
                ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/40"
                : "bg-slate-900/90 text-slate-200 hover:bg-slate-800 border border-slate-700 hover:border-slate-500"
            }`}
            title={bookmarked ? "Hapus Watchlist" : "Simpan ke Watchlist"}
          >
            <Bookmark className={`w-4 h-4 ${bookmarked ? "fill-slate-950" : ""}`} />
          </button>
        </div>

        {/* Watch Progress Ribbon if watched in history */}
        {watchHistory && (
          <div className="absolute bottom-0 inset-x-0 bg-slate-950/90 backdrop-blur-md border-t border-indigo-500/30 px-2 py-1 flex items-center justify-between text-[10px] z-10">
            <span className="text-cyan-300 font-bold flex items-center gap-1 truncate">
              <CheckCircle2 className="w-3 h-3 text-cyan-400 shrink-0" />
              {watchHistory.episodeTitle || "Terakhir ditonton"}
            </span>
          </div>
        )}

        {/* Bottom subtle shadow gradient */}
        <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none" />
      </div>

      {/* Info Section */}
      <div className="p-3 sm:p-3.5 flex flex-col flex-1 justify-between gap-2">
        <h3
          id={`anime-title-${anime.animeId}`}
          className="text-xs sm:text-sm font-bold text-slate-100 group-hover:text-cyan-300 transition-colors line-clamp-2 leading-snug tracking-tight"
          title={anime.title}
        >
          {anime.title}
        </h3>

        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1.5 border-t border-slate-800/80 mt-auto">
          <span className="truncate text-slate-400 font-medium">
            {anime.releaseDay ? `Hari ${anime.releaseDay}` : anime.latestReleaseDate || anime.lastReleaseDate || anime.season || "Sub Indo"}
          </span>
          {anime.studios && (
            <span className="text-indigo-400/90 truncate max-w-[100px] text-right font-semibold text-[10px] uppercase">
              {anime.studios}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
