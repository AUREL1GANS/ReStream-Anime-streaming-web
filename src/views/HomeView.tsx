import React, { useState, useEffect } from "react";
import { Flame, CheckSquare, Calendar, ChevronRight, Sparkles, RefreshCw } from "lucide-react";
import { animeApi } from "../services/animeApi";
import { AnimeHomeData, GenreItem, ScheduleDay, AnimeCardItem } from "../types/anime";
import { HeroBanner } from "../components/HeroBanner";
import { AnimeGrid } from "../components/AnimeGrid";
import { HeroBannerSkeleton } from "../components/SkeletonLoader";
import { DonationBanner } from "../components/DonationBanner";

interface HomeViewProps {
  onSelectAnime: (animeId: string) => void;
  onNavigate: (view: string, param?: string) => void;
}

// Helper to extract list from flexible upstream formats
const extractAnimeArray = (raw: any): AnimeCardItem[] => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw.animeList)) return raw.animeList;
  if (Array.isArray(raw.ongoing_anime)) return raw.ongoing_anime;
  if (Array.isArray(raw.ongoingAnime)) return raw.ongoingAnime;
  if (Array.isArray(raw.complete_anime)) return raw.complete_anime;
  if (Array.isArray(raw.completedAnime)) return raw.completedAnime;
  if (Array.isArray(raw.data)) return extractAnimeArray(raw.data);
  return [];
};

export const HomeView: React.FC<HomeViewProps> = ({ onSelectAnime, onNavigate }) => {
  const [data, setData] = useState<AnimeHomeData | null>(null);
  const [genres, setGenres] = useState<GenreItem[]>([]);
  const [schedule, setSchedule] = useState<ScheduleDay[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHome = async () => {
    setLoading(true);
    setError(null);
    try {
      const [homeRes, genreRes, scheduleRes] = await Promise.all([
        animeApi.getHome().catch(() => null),
        animeApi.getGenres().catch(() => ({ data: { genreList: [] } })),
        animeApi.getSchedule().catch(() => ({ data: [] })),
      ]);

      let homeData = homeRes?.data || null;

      // If homeRes is empty or ongoing is missing, fetch ongoing directly
      const extractedOngoing = homeData ? extractAnimeArray(homeData.ongoing || (homeData as any).ongoingAnime || (homeData as any).ongoing_anime) : [];
      if (extractedOngoing.length === 0) {
        try {
          const ongoingFallback = await animeApi.getOngoing(1);
          const completedFallback = await animeApi.getCompleted(1).catch(() => ({ data: { animeList: [] }, pagination: {} as any }));
          homeData = {
            ongoing: { animeList: ongoingFallback?.data?.animeList || [] },
            completed: { animeList: completedFallback?.data?.animeList || [] },
          };
        } catch {
          // If fallback fails, preserve homeData or empty
        }
      }

      setData(homeData);

      const rawGenres = genreRes?.data;
      if (rawGenres) {
        if (Array.isArray(rawGenres)) {
          setGenres(rawGenres);
        } else if (Array.isArray(rawGenres.genreList)) {
          setGenres(rawGenres.genreList);
        }
      }

      if (Array.isArray(scheduleRes?.data)) {
        setSchedule(scheduleRes.data);
      }
    } catch (err: any) {
      setError(err.message || "Gagal memuat data anime. Silakan muat ulang.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHome();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 sm:space-y-12">
        <HeroBannerSkeleton />
        <div className="space-y-4">
          <div className="h-8 bg-slate-800 rounded w-48 animate-pulse" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-slate-800 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const ongoingList = data
    ? extractAnimeArray(data.ongoing || (data as any).ongoingAnime || (data as any).ongoing_anime)
    : [];
  const completedList = data
    ? extractAnimeArray(data.completed || (data as any).completedAnime || (data as any).complete_anime)
    : [];

  return (
    <div id="home-view-container" className="space-y-8 sm:space-y-12">
      {/* Hero Banner Showcase (Always displayed with trending items or fallback) */}
      <HeroBanner animeList={ongoingList} onSelectAnime={onSelectAnime} />

      {/* Saweria Donation Banner */}
      <DonationBanner />

      {/* Quick Genre Pills Bar */}
      {genres.length > 0 && (
        <section id="quick-genres-section" className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Jelajahi Berdasarkan Genre</span>
            </h3>
            <button
              id="see-all-genres-btn"
              onClick={() => onNavigate("genres")}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
            >
              <span>Semua Genre</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {genres.slice(0, 14).map((g) => (
              <button
                key={g.genreId}
                id={`quick-genre-${g.genreId}`}
                onClick={() => onNavigate("genre-detail", g.genreId)}
                className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-900/90 hover:bg-indigo-600/20 text-slate-300 hover:text-indigo-300 border border-slate-800 hover:border-indigo-500/40 whitespace-nowrap transition-all cursor-pointer shadow-sm"
              >
                {g.title}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Ongoing Anime Section (Anime Terbaru) */}
      <section id="ongoing-anime-section" className="space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">Anime Ongoing Terbaru</h2>
              <p className="text-xs text-slate-400">Episode baru yang baru saja rilis dan sedang tayang</p>
            </div>
          </div>

          <button
            id="view-all-ongoing-btn"
            onClick={() => onNavigate("ongoing")}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white border border-slate-800 transition-colors cursor-pointer"
          >
            <span>Lihat Semua</span>
            <ChevronRight className="w-4 h-4 text-indigo-400" />
          </button>
        </div>

        <AnimeGrid
          animeList={ongoingList.slice(0, 12)}
          onSelectAnime={onSelectAnime}
          statusBadge="Ongoing"
        />
      </section>

      {/* Completed Anime Section */}
      <section id="completed-anime-section" className="space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">Anime Tamat (Completed)</h2>
              <p className="text-xs text-slate-400">Koleksi anime full episode siap tonton marathon</p>
            </div>
          </div>

          <button
            id="view-all-completed-btn"
            onClick={() => onNavigate("completed")}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white border border-slate-800 transition-colors cursor-pointer"
          >
            <span>Lihat Semua</span>
            <ChevronRight className="w-4 h-4 text-emerald-400" />
          </button>
        </div>

        <AnimeGrid
          animeList={completedList.slice(0, 12)}
          onSelectAnime={onSelectAnime}
          statusBadge="Tamat"
        />
      </section>

      {/* Quick Schedule Preview Bar */}
      {schedule.length > 0 && (
        <section id="home-schedule-preview" className="p-6 bg-slate-900/60 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <Calendar className="w-5 h-5 text-indigo-400" />
              <span>Jadwal Rilis Anime Minggu Ini</span>
            </div>
            <button
              id="home-full-schedule-btn"
              onClick={() => onNavigate("schedule")}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
            >
              <span>Jadwal Lengkap</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
            {schedule.map((day) => (
              <button
                key={day.day}
                id={`home-schedule-day-${day.day}`}
                onClick={() => onNavigate("schedule", day.day)}
                className="p-3 rounded-2xl bg-slate-950/80 hover:bg-indigo-600/20 border border-slate-800/80 hover:border-indigo-500/40 text-left transition-all group cursor-pointer"
              >
                <span className="text-xs font-bold text-indigo-400 group-hover:text-indigo-300 block">
                  {day.day}
                </span>
                <span className="text-[11px] text-slate-400 font-medium mt-1 block">
                  {day.anime_list?.length || 0} Anime
                </span>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
