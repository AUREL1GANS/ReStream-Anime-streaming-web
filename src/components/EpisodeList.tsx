import React, { useState } from "react";
import { Play, Check, Search, ArrowUpDown } from "lucide-react";
import { EpisodeItem } from "../types/anime";
import { useBookmarks } from "../contexts/BookmarkContext";

interface EpisodeListProps {
  episodes: EpisodeItem[];
  activeEpisodeId?: string;
  onSelectEpisode: (episodeId: string) => void;
  animeTitle?: string;
}

export const EpisodeList: React.FC<EpisodeListProps> = ({
  episodes = [],
  activeEpisodeId,
  onSelectEpisode,
}) => {
  const [search, setSearch] = useState("");
  const [ascending, setAscending] = useState(false);
  const { history } = useBookmarks();

  const isWatched = (epId: string) => {
    return history.some((h) => h.episodeId === epId);
  };

  const filtered = episodes
    .filter((ep) => {
      const q = search.toLowerCase().trim();
      return (
        ep.title.toLowerCase().includes(q) ||
        (ep.eps && String(ep.eps).includes(q)) ||
        ep.episodeId.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      const numA = typeof a.eps === "number" ? a.eps : parseFloat(String(a.eps).replace(/[^\d.]/g, "")) || 0;
      const numB = typeof b.eps === "number" ? b.eps : parseFloat(String(b.eps).replace(/[^\d.]/g, "")) || 0;
      return ascending ? numA - numB : numB - numA;
    });

  return (
    <div id="episode-list-container" className="bg-slate-900/70 rounded-3xl p-5 border border-slate-800 space-y-4">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>Daftar Episode</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              {episodes.length} Total
            </span>
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick search input */}
          <div className="relative flex-1 sm:w-44">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="episode-filter-input"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari eps..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-800/80 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 border border-slate-700/60"
            />
          </div>

          {/* Sort order toggle */}
          <button
            id="episode-sort-toggle-btn"
            onClick={() => setAscending(!ascending)}
            className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 text-xs font-medium text-slate-300 hover:text-white flex items-center gap-1.5 cursor-pointer transition-colors"
            title={ascending ? "Urutan: Terlama ke Terbaru" : "Urutan: Terbaru ke Terlama"}
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">{ascending ? "1 → N" : "N → 1"}</span>
          </button>
        </div>
      </div>

      {/* Episodes Grid / List */}
      <div id="episodes-scroll-area" className="max-h-[480px] overflow-y-auto pr-1 space-y-1.5 custom-scrollbar">
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">
            Episode tidak ditemukan untuk kata kunci "{search}"
          </div>
        ) : (
          filtered.map((ep) => {
            const isActive = activeEpisodeId === ep.episodeId;
            const watched = isWatched(ep.episodeId);

            return (
              <button
                key={ep.episodeId}
                id={`episode-item-${ep.episodeId}`}
                onClick={() => onSelectEpisode(ep.episodeId)}
                className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all cursor-pointer text-left border ${
                  isActive
                    ? "bg-indigo-600/20 border-indigo-500/50 text-white shadow-lg shadow-indigo-600/10"
                    : "bg-slate-800/40 hover:bg-slate-800/80 border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      isActive
                        ? "bg-indigo-600 text-white"
                        : watched
                        ? "bg-emerald-950/80 text-emerald-400 border border-emerald-700/50"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {isActive ? (
                      <Play className="w-3.5 h-3.5 fill-white" />
                    ) : watched ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                    ) : (
                      <span className="text-xs font-bold font-mono">
                        {ep.eps || ep.title.replace(/[^\d]/g, "") || "•"}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-semibold truncate leading-snug">
                      {ep.title}
                    </h4>
                    {ep.date && <span className="text-[11px] text-slate-500 block">{ep.date}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {watched && (
                    <span className="text-[10px] uppercase font-bold text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-950/50 border border-emerald-800/40">
                      Ditonton
                    </span>
                  )}
                  {isActive && (
                    <span className="text-[10px] uppercase font-bold text-indigo-400 px-1.5 py-0.5 rounded bg-indigo-950/50 border border-indigo-800/40 animate-pulse">
                      Sedang Diputar
                    </span>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
