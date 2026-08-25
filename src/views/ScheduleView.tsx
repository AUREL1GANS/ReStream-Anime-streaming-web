import React, { useState, useEffect } from "react";
import { Calendar, Clock, Film } from "lucide-react";
import { animeApi } from "../services/animeApi";
import { ScheduleDay } from "../types/anime";
import { AnimeCard } from "../components/AnimeCard";
import { AnimeGridSkeleton } from "../components/SkeletonLoader";

interface ScheduleViewProps {
  initialDay?: string;
  onSelectAnime: (animeId: string) => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({ initialDay, onSelectAnime }) => {
  const [scheduleData, setScheduleData] = useState<ScheduleDay[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>(initialDay || "Senin");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchedule = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await animeApi.getSchedule();
        const days = Array.isArray(res?.data) ? res.data : [];
        setScheduleData(days);
        if (days.length > 0) {
          if (initialDay && days.some((d) => d.day.toLowerCase() === initialDay.toLowerCase())) {
            const matched = days.find((d) => d.day.toLowerCase() === initialDay.toLowerCase());
            if (matched) setSelectedDay(matched.day);
          } else {
            setSelectedDay(days[0].day);
          }
        }
      } catch (err: any) {
        setError(err.message || "Gagal memuat jadwal anime.");
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [initialDay]);

  const activeSchedule = scheduleData.find((d) => d.day === selectedDay);
  const animeList = activeSchedule?.anime_list || [];

  return (
    <div id="schedule-view-container" className="space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Jadwal Rilis Anime
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Jadwal update episode terbaru berdasarkan hari penayangan di Indonesia
            </p>
          </div>
        </div>
      </div>

      {/* Day Tabs */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {scheduleData.map((day) => {
            const isSelected = day.day === selectedDay;
            return (
              <button
                key={day.day}
                id={`schedule-day-tab-${day.day}`}
                onClick={() => setSelectedDay(day.day)}
                className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer border flex items-center gap-2 whitespace-nowrap ${
                  isSelected
                    ? "bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-600/30 scale-105"
                    : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>{day.day}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    isSelected ? "bg-indigo-800/80 text-white" : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {day.anime_list?.length || 0}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Anime List for selected day */}
      {loading ? (
        <AnimeGridSkeleton count={8} />
      ) : error ? (
        <div className="py-16 text-center text-rose-400 text-sm">{error}</div>
      ) : animeList.length === 0 ? (
        <div className="text-center py-16 px-4 bg-slate-900/40 rounded-3xl border border-slate-800">
          <Film className="w-12 h-12 mx-auto text-slate-600 mb-3" />
          <h3 className="text-base font-semibold text-slate-300">Tidak ada jadwal rilis hari ini</h3>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-5">
          {animeList.map((anime) => (
            <AnimeCard
              key={anime.slug || anime.title}
              anime={{
                title: anime.title,
                poster: anime.poster,
                animeId: anime.slug,
                score: anime.score,
                episodes: anime.episodes,
                releaseDay: selectedDay,
              }}
              onClick={onSelectAnime}
              statusBadge={`Hari ${selectedDay}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
