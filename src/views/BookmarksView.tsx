import React, { useState } from "react";
import { Bookmark, History, Trash2, Play, Film, Clock } from "lucide-react";
import { useBookmarks } from "../contexts/BookmarkContext";
import { AnimeCard } from "../components/AnimeCard";
import { useToast } from "../contexts/ToastContext";

interface BookmarksViewProps {
  onSelectAnime: (animeId: string) => void;
  onSelectEpisode: (episodeId: string, animeTitle: string) => void;
}

export const BookmarksView: React.FC<BookmarksViewProps> = ({
  onSelectAnime,
  onSelectEpisode,
}) => {
  const [activeTab, setActiveTab] = useState<"watchlist" | "history">("watchlist");
  const { bookmarks, history, clearHistory, removeHistoryItem, removeBookmark } = useBookmarks();
  const { showToast } = useToast();

  const handleClearHistory = () => {
    if (window.confirm("Apakah Anda yakin ingin menghapus semua riwayat tontonan?")) {
      clearHistory();
      showToast("Riwayat tontonan berhasil dibersihkan", "info");
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} hari lalu`;
    if (hours > 0) return `${hours} jam lalu`;
    if (minutes > 0) return `${minutes} menit lalu`;
    return "Baru saja";
  };

  return (
    <div id="bookmarks-history-container" className="space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            {activeTab === "watchlist" ? <Bookmark className="w-6 h-6" /> : <History className="w-6 h-6" />}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {activeTab === "watchlist" ? "Watchlist Saya" : "Riwayat Tontonan"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              {activeTab === "watchlist"
                ? "Daftar anime yang Anda simpan untuk ditonton nanti"
                : "Daftar episode anime yang baru-baru ini Anda tonton"}
            </p>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 self-start sm:self-auto">
          <button
            id="tab-watchlist-btn"
            onClick={() => setActiveTab("watchlist")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "watchlist"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Watchlist ({bookmarks.length})</span>
          </button>

          <button
            id="tab-history-btn"
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "history"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <History className="w-4 h-4" />
            <span>Riwayat ({history.length})</span>
          </button>
        </div>
      </div>

      {/* Content depending on Tab */}
      {activeTab === "watchlist" ? (
        <div>
          {bookmarks.length === 0 ? (
            <div className="text-center py-20 px-4 bg-slate-900/40 rounded-3xl border border-slate-800 space-y-3">
              <Bookmark className="w-12 h-12 mx-auto text-slate-600 mb-2" />
              <h3 className="text-base font-semibold text-slate-300">Watchlist Anda masih kosong</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Tekan tombol ikon Bookmark pada anime yang Anda sukai untuk menyimpannya di sini.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-5">
              {bookmarks.map((anime) => (
                <AnimeCard
                  key={anime.animeId}
                  anime={{
                    title: anime.title,
                    poster: anime.poster,
                    animeId: anime.animeId,
                    score: anime.score,
                    episodes: anime.episodes,
                  }}
                  onClick={onSelectAnime}
                  statusBadge={anime.status}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {history.length > 0 && (
            <div className="flex justify-end">
              <button
                id="clear-all-history-btn"
                onClick={handleClearHistory}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Semua Riwayat</span>
              </button>
            </div>
          )}

          {history.length === 0 ? (
            <div className="text-center py-20 px-4 bg-slate-900/40 rounded-3xl border border-slate-800 space-y-3">
              <History className="w-12 h-12 mx-auto text-slate-600 mb-2" />
              <h3 className="text-base font-semibold text-slate-300">Belum ada riwayat tontonan</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Episode yang Anda putar akan otomatis tercatat di sini sehingga mudah melanjutkan menonton.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {history.map((item) => (
                <div
                  key={item.episodeId}
                  id={`history-item-${item.episodeId}`}
                  className="flex items-center justify-between p-3.5 bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/30 rounded-2xl transition-all group"
                >
                  <div
                    onClick={() => onSelectEpisode(item.episodeId, item.animeTitle)}
                    className="flex items-center gap-3.5 min-w-0 flex-1 cursor-pointer"
                  >
                    <div className="relative w-12 h-16 rounded-xl overflow-hidden bg-slate-950 shrink-0">
                      <img
                        src={item.poster}
                        alt={item.animeTitle}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-4 h-4 fill-white text-white" />
                      </div>
                    </div>

                    <div className="min-w-0 space-y-1">
                      <h4 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors truncate">
                        {item.animeTitle}
                      </h4>
                      <p className="text-xs text-indigo-300 truncate font-medium">
                        {item.episodeTitle}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <Clock className="w-3 h-3" />
                        <span>{formatTimeAgo(item.timestamp)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pl-2">
                    <button
                      id={`delete-history-btn-${item.episodeId}`}
                      onClick={() => removeHistoryItem(item.episodeId)}
                      className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Hapus dari riwayat"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
