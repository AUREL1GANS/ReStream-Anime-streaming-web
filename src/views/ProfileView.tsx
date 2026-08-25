import React, { useState, useRef } from "react";
import {
  Sliders,
  Bookmark,
  History,
  Sparkles,
  Check,
  Play,
  Trash2,
  Clock,
  Heart,
  Save,
  Coffee,
  ExternalLink,
  Download,
  Upload,
  RefreshCw,
  Zap,
  Tv,
  Film,
  CheckCircle2,
  Flame,
} from "lucide-react";
import { useUserPreferences } from "../contexts/UserPreferencesContext";
import { useBookmarks } from "../contexts/BookmarkContext";
import { useToast } from "../contexts/ToastContext";
import { ANIME_AVATARS } from "../data/avatars";
import { AnimeCard } from "../components/AnimeCard";

interface ProfileViewProps {
  onSelectAnime: (animeId: string) => void;
  onSelectEpisode: (episodeId: string, animeTitle: string) => void;
  onNavigate: (view: string, param?: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  onSelectAnime,
  onSelectEpisode,
  onNavigate,
}) => {
  const { preferences, updatePreferences, resetPreferences } = useUserPreferences();
  const {
    bookmarks,
    history,
    removeHistoryItem,
    removeBookmark,
    clearHistory,
    clearBookmarks,
    exportDataJSON,
    importDataJSON,
  } = useBookmarks();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<"overview" | "watchlist" | "history" | "customization" | "backup">("overview");

  // Form State for Customization
  const [nickname, setNickname] = useState(preferences.nickname);
  const [bio, setBio] = useState(preferences.bio);
  const [selectedAvatar, setSelectedAvatar] = useState(preferences.avatar);
  const [customAvatarUrl, setCustomAvatarUrl] = useState("");
  const [autoNext, setAutoNext] = useState(preferences.autoNextEpisode);
  const [preferredQuality, setPreferredQuality] = useState(preferences.preferredQuality);
  const [isSaved, setIsSaved] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAvatar = customAvatarUrl.trim() || selectedAvatar;
    updatePreferences({
      nickname: nickname.trim() || "Otaku ReStream",
      bio: bio.trim(),
      avatar: finalAvatar,
      autoNextEpisode: autoNext,
      preferredQuality: preferredQuality as any,
    });
    setIsSaved(true);
    showToast("Pengaturan profil & streaming berhasil disimpan!", "success");
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleExportBackup = () => {
    const json = exportDataJSON();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ReStream-Backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("File backup JSON berhasil diunduh!", "success");
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const result = importDataJSON(content);
        if (result.success) {
          showToast(result.message, "success");
        } else {
          showToast(result.message, "error");
        }
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Stats calculation
  const totalWatchlist = bookmarks.length;
  const totalEpisodesWatched = history.length;
  const uniqueAnimeWatched = new Set(history.map((h) => h.animeId)).size;
  const estimatedWatchTimeMinutes = totalEpisodesWatched * 23; // average anime episode ~23 mins
  const watchTimeHours = (estimatedWatchTimeMinutes / 60).toFixed(1);

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
    <div id="profile-view-container" className="space-y-8">
      {/* Studio Header Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900/80 border border-indigo-500/30 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-cyan-500/10 via-indigo-600/15 to-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Avatar and Basic Info */}
          <div className="flex items-center gap-5">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl overflow-hidden bg-slate-950 border-2 border-cyan-400 p-1 shrink-0 shadow-xl shadow-cyan-500/20">
              <img
                src={preferences.avatar}
                alt={preferences.nickname}
                className="w-full h-full object-cover rounded-2xl"
              />
              <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {preferences.nickname}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[11px] font-black uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  Otaku Explorer
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md">
                {preferences.bio || "Penikmat anime di ReStream."}
              </p>
              <div className="flex items-center gap-4 text-xs text-slate-400 pt-1 font-medium">
                <span className="flex items-center gap-1">
                  <Film className="w-3.5 h-3.5 text-indigo-400" />
                  {uniqueAnimeWatched} Judul Ditonton
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  ~{watchTimeHours} Jam Streaming
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3 self-stretch md:self-auto justify-end">
            <button
              onClick={() => setActiveTab("customization")}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-indigo-600/30 cursor-pointer"
            >
              <Sliders className="w-4 h-4" />
              <span>Kustomisasi Studio</span>
            </button>

            <button
              onClick={handleExportBackup}
              className="flex items-center justify-center gap-2 p-2.5 sm:px-4 sm:py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs sm:text-sm transition-all cursor-pointer"
              title="Backup Data Watchlist & Riwayat"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">Backup</span>
            </button>
          </div>
        </div>

        {/* Stats Grid Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-8 pt-6 border-t border-slate-800/80">
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5 text-amber-400" />
              Watchlist
            </span>
            <div className="text-xl sm:text-2xl font-black text-white">{totalWatchlist}</div>
            <span className="text-[10px] text-slate-400">Anime tersimpan</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
              <Tv className="w-3.5 h-3.5 text-cyan-400" />
              Episode Ditonton
            </span>
            <div className="text-xl sm:text-2xl font-black text-white">{totalEpisodesWatched}</div>
            <span className="text-[10px] text-slate-400">Total riwayat episode</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-purple-400" />
              Estimasi Waktu
            </span>
            <div className="text-xl sm:text-2xl font-black text-white">{watchTimeHours} jam</div>
            <span className="text-[10px] text-slate-400">Waktu tayang anime</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              Status Sistem
            </span>
            <div className="text-xs sm:text-sm font-black text-emerald-400 flex items-center gap-1 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Offline / Local Ready
            </div>
            <span className="text-[10px] text-slate-400">100% Bebas Akun</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto custom-scrollbar">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "overview"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          <Film className="w-4 h-4" />
          <span>Ikhtisar Studio</span>
        </button>

        <button
          onClick={() => setActiveTab("watchlist")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "watchlist"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Watchlist ({bookmarks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "history"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          <History className="w-4 h-4" />
          <span>Riwayat ({history.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("customization")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "customization"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Kustomisasi & Pemutar</span>
        </button>

        <button
          onClick={() => setActiveTab("backup")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "backup"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          <Download className="w-4 h-4" />
          <span>Cadangan & Ekspor</span>
        </button>
      </div>

      {/* Tab: Overview */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          {/* Continue Watching Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Play className="w-4 h-4 text-cyan-400 fill-cyan-400" />
                Lanjutkan Nonton Terakhir
              </h2>
              {history.length > 0 && (
                <button
                  onClick={() => setActiveTab("history")}
                  className="text-xs text-indigo-400 hover:underline font-bold"
                >
                  Lihat Semua ({history.length})
                </button>
              )}
            </div>

            {history.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {history.slice(0, 3).map((item) => (
                  <div
                    key={item.episodeId}
                    onClick={() => onSelectEpisode(item.episodeId, item.animeTitle)}
                    className="flex gap-3.5 p-3 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-cyan-500/50 hover:bg-slate-900 transition-all cursor-pointer group"
                  >
                    <div className="relative w-20 h-28 rounded-xl overflow-hidden bg-slate-950 shrink-0">
                      <img
                        src={item.poster}
                        alt={item.animeTitle}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-6 h-6 fill-cyan-400 text-cyan-400" />
                      </div>
                    </div>

                    <div className="flex flex-col justify-between py-1 flex-1 min-w-0">
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-1">
                          {item.animeTitle}
                        </h4>
                        <span className="text-xs text-cyan-300 font-medium block truncate mt-0.5">
                          {item.episodeTitle}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                        <span>{formatTimeAgo(item.timestamp)}</span>
                        <span className="text-cyan-400 font-bold flex items-center gap-1">
                          Putar
                          <Play className="w-2.5 h-2.5 fill-cyan-400" />
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800 text-center space-y-2">
                <History className="w-8 h-8 text-slate-500 mx-auto" />
                <p className="text-xs text-slate-400">Belum ada riwayat tontonan. Mulai tonton anime favoritmu!</p>
              </div>
            )}
          </div>

          {/* Quick Watchlist Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-amber-400 fill-amber-400" />
                Watchlist Tersimpan
              </h2>
              {bookmarks.length > 0 && (
                <button
                  onClick={() => setActiveTab("watchlist")}
                  className="text-xs text-indigo-400 hover:underline font-bold"
                >
                  Lihat Semua ({bookmarks.length})
                </button>
              )}
            </div>

            {bookmarks.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                {bookmarks.slice(0, 6).map((item) => (
                  <AnimeCard
                    key={item.animeId}
                    anime={{
                      animeId: item.animeId,
                      title: item.title,
                      poster: item.poster,
                      score: item.score,
                      episodes: item.episodes,
                    }}
                    onClick={onSelectAnime}
                  />
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800 text-center space-y-2">
                <Bookmark className="w-8 h-8 text-slate-500 mx-auto" />
                <p className="text-xs text-slate-400">Watchlist Anda masih kosong. Simpan anime untuk ditonton nanti!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Watchlist */}
      {activeTab === "watchlist" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-white">Daftar Watchlist Anime</h2>
              <p className="text-xs text-slate-400">{bookmarks.length} anime tersimpan di perangkat ini</p>
            </div>

            {bookmarks.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm("Apakah Anda yakin ingin menghapus semua bookmark di watchlist?")) {
                    clearBookmarks();
                    showToast("Semua watchlist berhasil dibersihkan", "info");
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/20 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Kosongkan Watchlist</span>
              </button>
            )}
          </div>

          {bookmarks.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {bookmarks.map((item) => (
                <div key={item.animeId} className="relative group/item">
                  <AnimeCard
                    anime={{
                      animeId: item.animeId,
                      title: item.title,
                      poster: item.poster,
                      score: item.score,
                      episodes: item.episodes,
                    }}
                    onClick={onSelectAnime}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center space-y-3 bg-slate-900/30 rounded-3xl border border-slate-800">
              <Bookmark className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">Watchlist Kosong</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Jelajahi anime ongoing atau tamat lalu klik ikon Bookmark untuk menyimpannya di sini.
              </p>
              <button
                onClick={() => onNavigate("home")}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold cursor-pointer"
              >
                Jelajahi Anime
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab: History */}
      {activeTab === "history" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-white">Riwayat Tontonan</h2>
              <p className="text-xs text-slate-400">{history.length} riwayat pemutaran episode</p>
            </div>

            {history.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm("Hapus seluruh riwayat tontonan?")) {
                    clearHistory();
                    showToast("Riwayat tontonan telah dibersihkan", "info");
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/20 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Bersihkan Riwayat</span>
              </button>
            )}
          </div>

          {history.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {history.map((item) => (
                <div
                  key={item.episodeId}
                  className="flex gap-3.5 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-cyan-500/40 transition-all group"
                >
                  <div
                    onClick={() => onSelectEpisode(item.episodeId, item.animeTitle)}
                    className="relative w-20 h-28 rounded-xl overflow-hidden bg-slate-950 shrink-0 cursor-pointer"
                  >
                    <img
                      src={item.poster}
                      alt={item.animeTitle}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-6 h-6 fill-cyan-400 text-cyan-400" />
                    </div>
                  </div>

                  <div className="flex flex-col justify-between py-1 flex-1 min-w-0">
                    <div>
                      <h4
                        onClick={() => onSelectEpisode(item.episodeId, item.animeTitle)}
                        className="text-xs sm:text-sm font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-1 cursor-pointer"
                      >
                        {item.animeTitle}
                      </h4>
                      <span className="text-xs text-cyan-300 font-semibold block truncate mt-0.5">
                        {item.episodeTitle}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                      <span>{formatTimeAgo(item.timestamp)}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onSelectEpisode(item.episodeId, item.animeTitle)}
                          className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-0.5 cursor-pointer"
                        >
                          <Play className="w-3 h-3 fill-cyan-400" />
                          Nonton
                        </button>
                        <button
                          onClick={() => {
                            removeHistoryItem(item.episodeId);
                            showToast("Item riwayat dihapus", "info");
                          }}
                          className="text-slate-500 hover:text-red-400 p-1 cursor-pointer"
                          title="Hapus dari riwayat"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center space-y-3 bg-slate-900/30 rounded-3xl border border-slate-800">
              <History className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">Belum Ada Riwayat</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Setiap episode anime yang Anda tonton akan otomatis tercatat di sini.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab: Customization & Playback */}
      {activeTab === "customization" && (
        <form onSubmit={handleSaveSettings} className="space-y-8 max-w-3xl">
          {/* Avatar Selector */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Pilih Karakter Anime Avatar
            </h3>
            <p className="text-xs text-slate-400">
              Pilih karakter favorit untuk mewakili profil studio Anda.
            </p>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
              {ANIME_AVATARS.map((av) => {
                const isSelected = selectedAvatar === av.url && !customAvatarUrl;
                return (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => {
                      setSelectedAvatar(av.url);
                      setCustomAvatarUrl("");
                    }}
                    className={`relative flex flex-col items-center p-2 rounded-2xl border transition-all cursor-pointer group ${
                      isSelected
                        ? "bg-indigo-600/30 border-cyan-400 ring-2 ring-cyan-400/50 scale-105"
                        : "bg-slate-950 border-slate-800 hover:border-slate-600"
                    }`}
                  >
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-900">
                      <img src={av.url} alt={av.name} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-200 mt-1.5 text-center truncate w-full">
                      {av.name}
                    </span>
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-cyan-400 text-slate-950 rounded-full flex items-center justify-center font-bold text-xs shadow-md">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Custom Avatar URL option */}
            <div className="pt-2">
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Atau gunakan URL Gambar Kustom:
              </label>
              <input
                type="url"
                value={customAvatarUrl}
                onChange={(e) => setCustomAvatarUrl(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Profile Nickname & Bio */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-base font-black text-white">Profil Pengguna</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Nama Panggilan / Nickname</label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Misal: Sung Jinwoo"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Bio Singkat</label>
                <input
                  type="text"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Slogan atau anime favorit Anda..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Streaming & Playback Preferences */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Preferensi Pemutar Video
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white">Auto Next Episode</h4>
                  <p className="text-[11px] text-slate-400">Otomatis putar episode berikutnya setelah selesai</p>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoNext(!autoNext)}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    autoNext ? "bg-cyan-500" : "bg-slate-700"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                      autoNext ? "left-6" : "left-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white">Resolusi Default</h4>
                  <p className="text-[11px] text-slate-400">Prioritaskan kualitas video saat pertama kali memuat</p>
                </div>
                <select
                  value={preferredQuality}
                  onChange={(e) => setPreferredQuality(e.target.value as any)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-bold focus:border-cyan-500 focus:outline-none cursor-pointer"
                >
                  <option value="auto">Auto (Rekomendasi)</option>
                  <option value="1080p">1080p Full HD</option>
                  <option value="720p">720p HD</option>
                  <option value="480p">480p SD</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-black text-sm shadow-xl shadow-cyan-500/25 transition-all cursor-pointer"
            >
              {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              <span>{isSaved ? "Tersimpan!" : "Simpan Perubahan"}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (window.confirm("Kembalikan pengaturan ke default?")) {
                  resetPreferences();
                  showToast("Pengaturan dikembalikan ke bawaan", "info");
                }
              }}
              className="px-4 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold border border-slate-800 cursor-pointer"
            >
              Reset ke Default
            </button>
          </div>
        </form>
      )}

      {/* Tab: Backup & Export */}
      {activeTab === "backup" && (
        <div className="space-y-6 max-w-2xl">
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Download className="w-4 h-4 text-cyan-400" />
              Ekspor & Impor Data (100% Milik Anda)
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Karena ReStream tidak memerlukan akun, semua Watchlist dan Riwayat tontonan disimpan langsung di browser Anda secara aman. Anda dapat mengekspor data ke file JSON untuk dipindahkan ke laptop, HP, atau browser lain kapan saja!
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Export Card */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-black text-white flex items-center gap-1.5">
                    <Download className="w-4 h-4 text-cyan-400" />
                    Unduh File Backup
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Simpan semua ({bookmarks.length}) watchlist dan ({history.length}) riwayat tontonan.
                  </p>
                </div>

                <button
                  onClick={handleExportBackup}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download .JSON</span>
                </button>
              </div>

              {/* Import Card */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-black text-white flex items-center gap-1.5">
                    <Upload className="w-4 h-4 text-purple-400" />
                    Pulihkan dari Backup
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Pilih file JSON cadangan untuk memulihkan watchlist & riwayat.
                  </p>
                </div>

                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,application/json"
                    onChange={handleImportFile}
                    className="hidden"
                    id="import-backup-input"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs transition-all shadow-md shadow-purple-600/20 cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Pilih File Backup</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
