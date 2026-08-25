import React, { useState, useEffect } from "react";
import { Play, Bookmark, Star, ChevronLeft, ChevronRight, Sparkles, Tv, ShieldCheck } from "lucide-react";
import { AnimeCardItem } from "../types/anime";
import { getCleanImageUrl, formatSynopsis } from "../services/animeApi";
import { useBookmarks } from "../contexts/BookmarkContext";
import { useToast } from "../contexts/ToastContext";

interface HeroBannerProps {
  animeList?: AnimeCardItem[];
  onSelectAnime: (animeId: string) => void;
}

// Fallback curated trending anime in case upstream API is slow/empty
const DEFAULT_TRENDING_ANIME: AnimeCardItem[] = [
  {
    animeId: "solo-leveling-season-2-arise-from-the-shadow-sub-indo",
    title: "Solo Leveling Season 2: Arise from the Shadow",
    poster: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&q=80",
    score: "8.95",
    episodes: "Ongoing",
    releaseDay: "Minggu",
    studios: "A-1 Pictures",
    synopsis: "Sung Jinwoo melanjutkan perjalanannya sebagai Shadow Monarch dan pemburu terkuat di dunia saat ancaman baru dari Gate misterius mengancam keselamatan umat manusia.",
  },
  {
    animeId: "jujutsu-kaisen-season-2-sub-indo",
    title: "Jujutsu Kaisen Season 2 (Shibuya Incident)",
    poster: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&q=80",
    score: "8.98",
    episodes: "23",
    releaseDay: "Kamis",
    studios: "MAPPA",
    synopsis: "Tragedi Shibuya pecah saat Geto dan roh terkutuk melancarkan rencana jahat mereka untuk menyegel penyihir terkuat Satoru Gojo.",
  },
  {
    animeId: "sousou-no-frieren-sub-indo",
    title: "Sousou no Frieren (Frieren: Beyond Journey's End)",
    poster: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&q=80",
    score: "9.35",
    episodes: "28",
    releaseDay: "Jumat",
    studios: "Madhouse",
    synopsis: "Penyihir elf Frieren mengarungi perjalanan baru setelah kelompok pahlawannya mengalahkan Raja Iblis, belajar memahami arti waktu dan ikatan manusia.",
  },
];

export const normalizeHeroItem = (item: any): AnimeCardItem => {
  if (!item) return DEFAULT_TRENDING_ANIME[0];
  return {
    animeId:
      item.animeId ||
      item.slug ||
      item.id ||
      item.endpoint?.replace(/^.*\/anime\//, "").replace(/\/$/, "") ||
      item.href?.replace(/^.*\/anime\//, "").replace(/\/$/, "") ||
      "anime-detail",
    title: item.title || item.name || "Anime Populer",
    poster:
      item.poster ||
      item.thumb ||
      item.image ||
      item.thumbnail ||
      "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&q=80",
    episodes: item.episodes ?? item.current_episode ?? item.total_episode ?? item.eps ?? "Ongoing",
    score: item.score ?? item.rating ?? "8.8",
    releaseDay: item.releaseDay ?? item.release_day ?? item.day ?? item.updated_day ?? "Hari ini",
    studios: item.studios ?? item.studio ?? "Studio Anime",
    season: item.season,
    synopsis: item.synopsis,
  };
};

export const HeroBanner: React.FC<HeroBannerProps> = ({ animeList, onSelectAnime }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { showToast } = useToast();

  const rawList = animeList && animeList.length > 0 ? animeList : DEFAULT_TRENDING_ANIME;
  const featured = rawList.slice(0, 6).map(normalizeHeroItem);

  const SLIDE_DURATION = 7000;

  useEffect(() => {
    if (featured.length <= 1) return;

    setProgress(0);
    const start = Date.now();

    const progressTimer = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, (elapsed / SLIDE_DURATION) * 100);
      setProgress(pct);
    }, 50);

    const slideTimer = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % featured.length);
    }, SLIDE_DURATION);

    return () => {
      clearInterval(progressTimer);
      clearTimeout(slideTimer);
    };
  }, [currentIndex, featured.length]);

  const current = featured[currentIndex] || featured[0];
  const bookmarked = isBookmarked(current.animeId);

  const handleToggleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleBookmark({
      animeId: current.animeId,
      title: current.title,
      poster: current.poster,
      score: current.score,
      episodes: current.episodes,
    });
    showToast(
      bookmarked ? `Dihapus dari Watchlist: ${current.title}` : `Ditambahkan ke Watchlist: ${current.title}`,
      bookmarked ? "info" : "success"
    );
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + featured.length) % featured.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % featured.length);
  };

  const synopsisText = formatSynopsis(current.synopsis);

  return (
    <div
      id="hero-banner-section"
      className="relative w-full h-[520px] sm:h-[560px] lg:h-[620px] overflow-hidden rounded-3xl mb-8 sm:mb-12 shadow-2xl group border border-indigo-500/20 bg-slate-950"
    >
      {/* Ambient Lighting Behind Backdrop */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Layered Blurred Backdrop */}
      <div className="absolute inset-0 bg-slate-950 overflow-hidden">
        <img
          key={`bg-${current.animeId}`}
          src={getCleanImageUrl(current.poster)}
          alt={current.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center opacity-35 filter blur-2xl scale-110 transition-all duration-1000 ease-out"
        />
        {/* Cinematic Deep Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/95 sm:via-slate-950/75 to-transparent" />
      </div>

      {/* Slide Countdown Progress Bar */}
      <div className="absolute top-0 inset-x-0 h-1 bg-slate-900/60 z-30 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500 transition-all duration-100 ease-linear shadow-sm shadow-cyan-400"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Main Foreground Content */}
      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 flex flex-col justify-end pb-12 sm:pb-16 z-10">
        <div className="flex flex-col md:flex-row items-start md:items-end gap-6 sm:gap-10">
          {/* Main Poster on Desktop & Tablet */}
          <div
            onClick={() => onSelectAnime(current.animeId)}
            className="hidden sm:block relative shrink-0 shadow-2xl rounded-3xl overflow-hidden border-2 border-indigo-500/40 hover:border-cyan-400/80 transition-all cursor-pointer transform hover:scale-[1.03] group/poster"
          >
            <img
              src={getCleanImageUrl(current.poster)}
              alt={current.title}
              referrerPolicy="no-referrer"
              className="w-40 h-56 md:w-48 md:h-68 object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover/poster:opacity-100 transition-opacity flex items-end justify-center pb-3">
              <span className="px-3 py-1 rounded-xl bg-cyan-500 text-slate-950 text-xs font-black flex items-center gap-1 shadow-lg">
                <Play className="w-3 h-3 fill-slate-950" />
                Lihat Detail
              </span>
            </div>
          </div>

          {/* Info Block */}
          <div className="space-y-3 sm:space-y-4 max-w-2xl">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-lg shadow-cyan-500/30">
                <Sparkles className="w-3.5 h-3.5 fill-white" />
                Trending #{currentIndex + 1}
              </span>

              {current.score && (
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 backdrop-blur-md">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{current.score}</span>
                </span>
              )}

              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-900/90 text-cyan-300 border border-cyan-500/30 backdrop-blur-md">
                ⚡ HD 1080P
              </span>

              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-900/90 text-slate-300 border border-slate-700/80 backdrop-blur-md">
                Sub Indo
              </span>

              {current.studios && (
                <span className="hidden sm:inline-flex px-2.5 py-1 rounded-full text-xs font-bold bg-slate-900/90 text-purple-300 border border-purple-500/30 backdrop-blur-md">
                  {current.studios}
                </span>
              )}
            </div>

            {/* Title */}
            <h1
              onClick={() => onSelectAnime(current.animeId)}
              className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight cursor-pointer hover:text-cyan-300 transition-colors drop-shadow-md line-clamp-2"
            >
              {current.title}
            </h1>

            {/* Synopsis */}
            {synopsisText && (
              <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 sm:line-clamp-3 leading-relaxed max-w-xl font-normal drop-shadow">
                {synopsisText}
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                id="hero-watch-button"
                onClick={() => onSelectAnime(current.animeId)}
                className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-black text-sm transition-all transform hover:-translate-y-0.5 shadow-xl shadow-cyan-500/25 cursor-pointer group"
              >
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                </div>
                <span>Nonton Sekarang</span>
              </button>

              <button
                id="hero-bookmark-button"
                onClick={handleToggleBookmark}
                className={`flex items-center gap-2 px-5 py-3.5 rounded-2xl border font-bold text-sm transition-all cursor-pointer backdrop-blur-xl ${
                  bookmarked
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-lg shadow-amber-500/20"
                    : "bg-slate-900/80 hover:bg-slate-800 text-slate-200 border-slate-700/80 hover:border-slate-500"
                }`}
              >
                <Bookmark className={`w-4 h-4 ${bookmarked ? "fill-amber-400 text-amber-400" : ""}`} />
                <span>{bookmarked ? "Di Watchlist" : "+ Watchlist"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Slide Controls */}
      <div className="absolute bottom-4 right-4 sm:bottom-8 sm:right-8 flex items-center gap-2 z-20">
        <button
          id="hero-prev-slide-btn"
          onClick={handlePrev}
          className="p-2.5 rounded-2xl bg-slate-950/70 hover:bg-slate-900 text-slate-300 hover:text-white border border-slate-800/80 backdrop-blur-md transition-all cursor-pointer shadow-lg"
          aria-label="Slide sebelumnya"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Slide Indicator Dots */}
        <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-slate-950/70 border border-slate-800/80 backdrop-blur-md">
          {featured.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                idx === currentIndex ? "w-6 bg-cyan-400 shadow-sm shadow-cyan-400" : "w-2 bg-slate-700 hover:bg-slate-500"
              }`}
              aria-label={`Pindah ke slide ${idx + 1}`}
            />
          ))}
        </div>

        <button
          id="hero-next-slide-btn"
          onClick={handleNext}
          className="p-2.5 rounded-2xl bg-slate-950/70 hover:bg-slate-900 text-slate-300 hover:text-white border border-slate-800/80 backdrop-blur-md transition-all cursor-pointer shadow-lg"
          aria-label="Slide selanjutnya"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
