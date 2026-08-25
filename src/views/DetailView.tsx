import React, { useState, useEffect } from "react";
import {
  Play,
  Bookmark,
  Star,
  Tv,
  Film,
  Calendar,
  Clock,
  Share2,
  ChevronDown,
  ChevronUp,
  Layers,
  Sparkles,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import { animeApi, getCleanImageUrl, formatSynopsis } from "../services/animeApi";
import { AnimeDetailData } from "../types/anime";
import { EpisodeList } from "../components/EpisodeList";
import { AnimeGrid } from "../components/AnimeGrid";
import { useBookmarks } from "../contexts/BookmarkContext";
import { useToast } from "../contexts/ToastContext";

interface DetailViewProps {
  animeSlug: string;
  onSelectAnime: (slug: string) => void;
  onSelectEpisode: (episodeId: string, animeTitle: string) => void;
  onSelectGenre: (genreId: string) => void;
  onBack: () => void;
}

export const DetailView: React.FC<DetailViewProps> = ({
  animeSlug,
  onSelectAnime,
  onSelectEpisode,
  onSelectGenre,
  onBack,
}) => {
  const [detail, setDetail] = useState<AnimeDetailData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showFullSynopsis, setShowFullSynopsis] = useState<boolean>(false);

  const { isBookmarked, toggleBookmark, history } = useBookmarks();
  const { showToast } = useToast();

  const fetchDetail = async () => {
    setLoading(true);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });

    try {
      const res = await animeApi.getDetail(animeSlug);
      setDetail(res.data);
    } catch (err: any) {
      setError(err.message || "Gagal memuat detail anime.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [animeSlug]);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-[320px] bg-slate-900 rounded-3xl border border-slate-800" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-10 bg-slate-800 rounded w-3/4" />
            <div className="h-32 bg-slate-800/60 rounded" />
          </div>
          <div className="h-64 bg-slate-800/60 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="py-20 text-center space-y-4">
        <p className="text-rose-400 text-sm">{error || "Anime tidak ditemukan"}</p>
        <div className="flex justify-center gap-3">
          <button
            id="detail-back-btn"
            onClick={onBack}
            className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-200 text-sm font-semibold cursor-pointer"
          >
            Kembali
          </button>
          <button
            id="detail-retry-btn"
            onClick={fetchDetail}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold cursor-pointer shadow-lg shadow-indigo-600/30"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  const bookmarked = isBookmarked(animeSlug);
  const synopsisText = formatSynopsis(detail.synopsis);

  // Check if user previously watched an episode of this anime
  const lastWatched = history.find((h) => h.animeId === animeSlug);

  const handleToggleBookmark = () => {
    toggleBookmark({
      animeId: animeSlug,
      title: detail.title,
      poster: detail.poster,
      score: detail.score,
      episodes: detail.episodes,
      status: detail.status,
    });
    showToast(
      bookmarked ? `Dihapus dari Watchlist: ${detail.title}` : `Disimpan ke Watchlist: ${detail.title}`,
      bookmarked ? "info" : "success"
    );
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast("Tautan anime disalin ke clipboard!", "success");
  };

  // Find first episode to watch or resume last watched
  const firstEpisode = detail.episodeList && detail.episodeList.length > 0
    ? detail.episodeList[detail.episodeList.length - 1] // usually episode 1 is at the bottom
    : null;

  const targetEpisode = lastWatched
    ? { episodeId: lastWatched.episodeId, title: lastWatched.episodeTitle }
    : firstEpisode;

  return (
    <div id="detail-view-container" className="space-y-10">
      {/* Back button */}
      <button
        id="detail-nav-back"
        onClick={onBack}
        className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali</span>
      </button>

      {/* Main Header / Backdrop Card */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl">
        {/* Blurred background image */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={getCleanImageUrl(detail.poster)}
            alt={detail.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover filter blur-2xl opacity-20 scale-125"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-transparent" />
        </div>

        {/* Content Container */}
        <div className="relative p-6 sm:p-8 lg:p-10 z-10 flex flex-col md:flex-row gap-8 items-start">
          {/* Poster */}
          <div className="shrink-0 w-44 sm:w-56 mx-auto md:mx-0 shadow-2xl rounded-2xl overflow-hidden border-2 border-slate-700/50">
            <img
              src={getCleanImageUrl(detail.poster)}
              alt={detail.title}
              referrerPolicy="no-referrer"
              className="w-full aspect-[3/4] object-cover"
            />
          </div>

          {/* Details column */}
          <div className="flex-1 space-y-4">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              {detail.status && (
                <span
                  className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                    detail.status.toLowerCase().includes("ongoing")
                      ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                      : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  }`}
                >
                  {detail.status}
                </span>
              )}

              {detail.type && (
                <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                  {detail.type}
                </span>
              )}

              {detail.score && (
                <span className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {detail.score}
                </span>
              )}

              {detail.episodes && (
                <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                  {detail.episodes} Episode
                </span>
              )}
            </div>

            {/* Title & Japanese */}
            <div>
              <h1 id="detail-anime-title" className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                {detail.title}
              </h1>
              {detail.japanese && (
                <h2 className="text-xs sm:text-sm text-slate-400 font-medium mt-1">
                  {detail.japanese}
                </h2>
              )}
            </div>

            {/* Genre Pills */}
            {detail.genreList && detail.genreList.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {detail.genreList.map((g) => (
                  <button
                    key={g.genreId}
                    id={`detail-genre-${g.genreId}`}
                    onClick={() => onSelectGenre(g.genreId)}
                    className="px-3 py-1 rounded-xl text-xs font-medium bg-slate-900/80 hover:bg-indigo-600/20 text-slate-300 hover:text-indigo-300 border border-slate-800 hover:border-indigo-500/40 transition-colors cursor-pointer"
                  >
                    {g.title}
                  </button>
                ))}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              {targetEpisode && (
                <button
                  id={`detail-watch-action-btn`}
                  onClick={() => onSelectEpisode(targetEpisode.episodeId, detail.title)}
                  className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm sm:text-base rounded-xl transition-all shadow-lg shadow-indigo-600/30 hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>
                    {lastWatched ? "Lanjut Nonton" : "Tonton Sekarang"}
                  </span>
                </button>
              )}

              <button
                id="detail-bookmark-btn"
                onClick={handleToggleBookmark}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium text-sm transition-all border cursor-pointer ${
                  bookmarked
                    ? "bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30"
                    : "bg-slate-900/80 hover:bg-slate-800 border-slate-700 text-slate-200"
                }`}
              >
                <Bookmark className={`w-4 h-4 ${bookmarked ? "fill-amber-400 text-amber-400" : ""}`} />
                <span>{bookmarked ? "Tersimpan di Watchlist" : "Tambah ke Watchlist"}</span>
              </button>

              <button
                id="detail-share-btn"
                onClick={handleShare}
                className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Bagikan Tautan"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Details & Episode List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Synopsis & Metadata Cards */}
        <div className="lg:col-span-2 space-y-8">
          {/* Synopsis Card */}
          <div className="p-6 bg-slate-900/60 rounded-3xl border border-slate-800 space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Sinopsis</span>
            </h3>

            <div className="relative">
              <p
                className={`text-sm text-slate-300 leading-relaxed whitespace-pre-line ${
                  !showFullSynopsis ? "line-clamp-4" : ""
                }`}
              >
                {synopsisText}
              </p>

              {synopsisText.length > 250 && (
                <button
                  id="toggle-synopsis-btn"
                  onClick={() => setShowFullSynopsis(!showFullSynopsis)}
                  className="mt-2 text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                >
                  <span>{showFullSynopsis ? "Sembunyikan" : "Baca Selengkapnya"}</span>
                  {showFullSynopsis ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>
          </div>

          {/* Episode List component */}
          <EpisodeList
            episodes={detail.episodeList || []}
            animeTitle={detail.title}
            onSelectEpisode={(epId) => onSelectEpisode(epId, detail.title)}
          />
        </div>

        {/* Right Column: Information Sidebar */}
        <div className="space-y-6">
          <div className="p-6 bg-slate-900/60 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 pb-2 border-b border-slate-800">
              Informasi Lengkap
            </h3>

            <div className="space-y-3 text-xs">
              {detail.studios && (
                <div className="flex justify-between items-center py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Studio</span>
                  <span className="font-semibold text-slate-200 text-right">{detail.studios}</span>
                </div>
              )}

              {detail.producers && (
                <div className="flex justify-between items-center py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Produser</span>
                  <span className="font-semibold text-slate-200 text-right">{detail.producers}</span>
                </div>
              )}

              {detail.duration && (
                <div className="flex justify-between items-center py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Durasi</span>
                  <span className="font-semibold text-slate-200">{detail.duration}</span>
                </div>
              )}

              {detail.aired && (
                <div className="flex justify-between items-center py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Tanggal Rilis</span>
                  <span className="font-semibold text-slate-200 text-right">{detail.aired}</span>
                </div>
              )}

              {detail.type && (
                <div className="flex justify-between items-center py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Tipe</span>
                  <span className="font-semibold text-slate-200">{detail.type}</span>
                </div>
              )}

              {detail.status && (
                <div className="flex justify-between items-center py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Status</span>
                  <span className="font-semibold text-slate-200">{detail.status}</span>
                </div>
              )}

              <div className="flex justify-between items-center py-1.5">
                <span className="text-slate-400">Subtitle</span>
                <span className="font-semibold text-indigo-400">Indonesia</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Anime Section */}
      {detail.recommendedAnimeList && detail.recommendedAnimeList.length > 0 && (
        <section id="detail-recommendations-section" className="space-y-5 pt-8 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-black text-white tracking-tight">Rekomendasi Anime Serupa</h2>
          </div>

          <AnimeGrid
            animeList={detail.recommendedAnimeList.map((rec) => ({
              title: rec.title,
              poster: rec.poster,
              animeId: rec.animeId || rec.href?.split("/").filter(Boolean).pop() || "",
            }))}
            onSelectAnime={onSelectAnime}
          />
        </section>
      )}
    </div>
  );
};
