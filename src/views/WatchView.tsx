import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Info,
  Bookmark,
  Share2,
  Tv,
  Film,
  Download,
  AlertCircle,
} from "lucide-react";
import { animeApi } from "../services/animeApi";
import { EpisodeDetailData, AnimeDetailData } from "../types/anime";
import { VideoPlayer } from "../components/VideoPlayer";
import { EpisodeList } from "../components/EpisodeList";
import { WatchPlayerSkeleton } from "../components/SkeletonLoader";
import { useBookmarks } from "../contexts/BookmarkContext";
import { useToast } from "../contexts/ToastContext";

interface WatchViewProps {
  episodeSlug: string;
  initialAnimeTitle?: string;
  onSelectAnime: (slug: string) => void;
  onSelectEpisode: (episodeSlug: string, animeTitle?: string) => void;
  onBack: () => void;
}

export const WatchView: React.FC<WatchViewProps> = ({
  episodeSlug,
  initialAnimeTitle,
  onSelectAnime,
  onSelectEpisode,
  onBack,
}) => {
  const [episodeData, setEpisodeData] = useState<EpisodeDetailData | null>(null);
  const [animeDetail, setAnimeDetail] = useState<AnimeDetailData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { addToHistory, isBookmarked, toggleBookmark } = useBookmarks();
  const { showToast } = useToast();

  // Extract anime slug candidate from episode slug (e.g. "sololeveling-s2-episode-1-sub-indo" -> "sololeveling-s2")
  const deriveAnimeSlug = (epSlug: string, explicitAnimeId?: string) => {
    if (explicitAnimeId) return explicitAnimeId;
    return epSlug.replace(/-episode-\d+.*$/i, "").replace(/-ep-\d+.*$/i, "");
  };

  const fetchEpisode = async () => {
    setLoading(true);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });

    try {
      const res = await animeApi.getEpisode(episodeSlug);
      setEpisodeData(res.data);

      // Track into watch history
      const animeId = deriveAnimeSlug(episodeSlug, res.data.animeId);
      const title = res.data.title || initialAnimeTitle || "Anime Episode";

      addToHistory({
        animeId,
        animeTitle: initialAnimeTitle || title,
        episodeId: episodeSlug,
        episodeTitle: title,
        poster: animeDetail?.poster || "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&q=80",
      });

      // Also try fetching anime detail if we have an animeId to get full episode list
      if (animeId && (!animeDetail || animeDetail.episodeList.length === 0)) {
        try {
          const detailRes = await animeApi.getDetail(animeId);
          setAnimeDetail(detailRes.data);
        } catch {
          // Ignore if detail fails
        }
      }
    } catch (err: any) {
      setError(err.message || "Gagal memuat streaming episode.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEpisode();
  }, [episodeSlug]);

  if (loading) {
    return (
      <div className="space-y-6">
        <WatchPlayerSkeleton />
      </div>
    );
  }

  if (error || !episodeData) {
    return (
      <div className="py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 mx-auto text-rose-400" />
        <h2 className="text-xl font-bold text-white">Gagal Memuat Episode</h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto">{error}</p>
        <div className="flex justify-center gap-3">
          <button
            id="watch-back-btn"
            onClick={onBack}
            className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-200 text-sm font-semibold cursor-pointer"
          >
            Kembali
          </button>
          <button
            id="watch-retry-btn"
            onClick={fetchEpisode}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold cursor-pointer shadow-lg shadow-indigo-600/30"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  const animeSlug = deriveAnimeSlug(episodeSlug, episodeData.animeId);
  const bookmarked = isBookmarked(animeSlug);

  // Derive episode list for navigation (from animeDetail or fallback to episodeData.info)
  const episodes = animeDetail?.episodeList || episodeData.info?.episodeList || [];

  // Find index of current episode in list
  const currentIdx = episodes.findIndex((e) => e.episodeId === episodeSlug);
  // Episode list is usually newest (index 0) to oldest (index N)
  const nextEpisode = currentIdx > 0 ? episodes[currentIdx - 1] : null;
  const prevEpisode = currentIdx !== -1 && currentIdx < episodes.length - 1 ? episodes[currentIdx + 1] : null;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast("Tautan streaming disalin!", "success");
  };

  return (
    <div id="watch-view-container" className="space-y-6">
      {/* Top Breadcrumb / Nav */}
      <div className="flex items-center justify-between gap-3">
        <button
          id="watch-back-navigation"
          onClick={onBack}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </button>

        {animeSlug && (
          <button
            id="watch-view-anime-detail-btn"
            onClick={() => onSelectAnime(animeSlug)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
          >
            <Info className="w-4 h-4" />
            <span>Detail Anime</span>
          </button>
        )}
      </div>

      {/* Main Watch Layout: Player on Left, Episodes on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Player, Controls, and Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video Player */}
          <VideoPlayer
            defaultStreamingUrl={episodeData.defaultStreamingUrl}
            qualities={episodeData.server?.qualities}
            title={episodeData.title}
          />

          {/* Episode Title & Controls Bar */}
          <div className="p-5 bg-slate-900/60 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 id="watch-episode-title" className="text-lg sm:text-xl font-black text-white tracking-tight leading-snug">
                  {episodeData.title}
                </h1>
                {initialAnimeTitle && (
                  <p className="text-xs text-indigo-400 font-medium mt-0.5">
                    {initialAnimeTitle}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  id="watch-bookmark-btn"
                  onClick={() => {
                    toggleBookmark({
                      animeId: animeSlug,
                      title: initialAnimeTitle || episodeData.title,
                      poster: animeDetail?.poster || "",
                    });
                    showToast(
                      bookmarked ? "Dihapus dari Watchlist" : "Disimpan ke Watchlist",
                      bookmarked ? "info" : "success"
                    );
                  }}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    bookmarked
                      ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                      : "bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-200"
                  }`}
                  title={bookmarked ? "Hapus dari Watchlist" : "Tambah ke Watchlist"}
                >
                  <Bookmark className={`w-4 h-4 ${bookmarked ? "fill-amber-400 text-amber-400" : ""}`} />
                  <span className="hidden sm:inline">{bookmarked ? "Tersimpan" : "Watchlist"}</span>
                </button>

                <button
                  id="watch-share-btn"
                  onClick={handleShare}
                  className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Bagikan"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Prev / Next Episode Navigation */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 gap-3">
              <button
                id="watch-prev-episode-btn"
                onClick={() => prevEpisode && onSelectEpisode(prevEpisode.episodeId, initialAnimeTitle)}
                disabled={!prevEpisode}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800/90 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-slate-200 text-xs font-bold transition-all border border-slate-700/60 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="truncate">
                  {prevEpisode ? `Eps Sebelumnya (${prevEpisode.eps || "Prev"})` : "Episode Pertama"}
                </span>
              </button>

              <button
                id="watch-next-episode-btn"
                onClick={() => nextEpisode && onSelectEpisode(nextEpisode.episodeId, initialAnimeTitle)}
                disabled={!nextEpisode}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
              >
                <span className="truncate">
                  {nextEpisode ? `Eps Selanjutnya (${nextEpisode.eps || "Next"})` : "Episode Terakhir"}
                </span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Download Links Section (if available) */}
          {episodeData.downloadUrl && episodeData.downloadUrl.formats?.length > 0 && (
            <div id="watch-download-section" className="p-5 bg-slate-900/60 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Link Download Episode:</span>
              </div>

              <div className="space-y-3">
                {episodeData.downloadUrl.formats.map((fmt) => (
                  <div key={fmt.title} className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                      <span>{fmt.title}</span>
                      {fmt.size && <span className="text-slate-500">{fmt.size}</span>}
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {fmt.urls.map((u) => (
                        <a
                          key={u.title + u.url}
                          href={u.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white text-[11px] font-semibold transition-colors"
                        >
                          {u.title}
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Episodes List Sidebar */}
        <div className="space-y-4">
          <EpisodeList
            episodes={episodes}
            activeEpisodeId={episodeSlug}
            onSelectEpisode={(epId) => onSelectEpisode(epId, initialAnimeTitle)}
            animeTitle={initialAnimeTitle}
          />
        </div>
      </div>
    </div>
  );
};
