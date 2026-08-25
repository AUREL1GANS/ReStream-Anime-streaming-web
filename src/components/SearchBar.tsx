import React, { useState, useEffect, useRef } from "react";
import { Search, X, Loader2, Star, Film, Sparkles, TrendingUp, ArrowRight } from "lucide-react";
import { animeApi, getCleanImageUrl } from "../services/animeApi";
import { AnimeCardItem } from "../types/anime";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAnime: (animeId: string) => void;
  onSearchAll: (query: string) => void;
}

const POPULAR_SEARCH_TAGS = [
  "Solo Leveling",
  "Jujutsu Kaisen",
  "Frieren",
  "One Piece",
  "Demon Slayer",
  "Bleach",
  "Chainsaw Man",
  "Oshi no Ko",
];

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectAnime,
  onSearchAll,
}) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AnimeCardItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResults([]);
      setError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleQueryChange = (text: string) => {
    setQuery(text);
    if (!text.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    setLoading(true);
    setError(null);

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const res = await animeApi.search(text.trim());
        setResults(res.data?.animeList || []);
      } catch (err: any) {
        setError("Gagal mencari anime. Coba lagi.");
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  const handleSelect = (animeId: string) => {
    onSelectAnime(animeId);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearchAll(query.trim());
      onClose();
    }
  };

  const handleTagClick = (tag: string) => {
    setQuery(tag);
    handleQueryChange(tag);
  };

  if (!isOpen) return null;

  return (
    <div
      id="search-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xl flex items-start justify-center pt-12 sm:pt-20 px-4"
      onClick={onClose}
    >
      <div
        id="search-modal-container"
        className="bg-slate-900/95 border border-indigo-500/30 rounded-3xl w-full max-w-2xl shadow-2xl shadow-black/80 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200 backdrop-blur-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input bar */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 border-b border-slate-800 flex items-center gap-3.5 bg-slate-950/60">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Search className="w-5 h-5" />
          </div>

          <input
            ref={inputRef}
            id="search-modal-input"
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Cari judul anime, genre, atau studio..."
            className="w-full bg-transparent text-white placeholder-slate-400 text-sm sm:text-base font-medium focus:outline-none"
          />

          {loading && <Loader2 className="w-5 h-5 text-cyan-400 animate-spin shrink-0" />}

          {query && (
            <button
              type="button"
              id="search-clear-btn"
              onClick={() => handleQueryChange("")}
              className="text-slate-400 hover:text-white p-1 cursor-pointer"
              aria-label="Hapus kata kunci"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <kbd className="hidden sm:inline-flex px-2 py-1 text-xs font-mono font-bold bg-slate-950 text-slate-400 rounded-lg border border-slate-800">
            ESC
          </kbd>
        </form>

        {/* Popular / Trending Chips */}
        {!query && (
          <div className="p-4 sm:p-5 space-y-3 bg-slate-900/40">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
              <span>Paling Sering Dicari:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {POPULAR_SEARCH_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagClick(tag)}
                  className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-indigo-600/20 text-slate-300 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/40 text-xs font-semibold transition-all cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results List */}
        <div id="search-results-list" className="overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
          {error && <div className="p-4 text-center text-rose-400 text-sm">{error}</div>}

          {results.length > 0 ? (
            results.map((anime) => (
              <div
                key={anime.animeId}
                id={`search-item-${anime.animeId}`}
                onClick={() => handleSelect(anime.animeId)}
                className="flex items-center gap-3.5 p-2.5 rounded-2xl hover:bg-slate-800/80 cursor-pointer transition-colors group"
              >
                <div className="w-12 h-16 rounded-xl overflow-hidden bg-slate-950 shrink-0 border border-slate-800 group-hover:border-cyan-500/40 transition-colors">
                  <img
                    src={getCleanImageUrl(anime.poster)}
                    alt={anime.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-100 group-hover:text-cyan-400 transition-colors line-clamp-1">
                    {anime.title}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5 flex-wrap">
                    {anime.episodes && (
                      <span className="px-1.5 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[10px] text-cyan-300 font-semibold">
                        {anime.episodes}
                      </span>
                    )}
                    {anime.score && (
                      <span className="flex items-center gap-1 text-amber-400 font-bold text-xs">
                        <Star className="w-3 h-3 fill-amber-400" />
                        {anime.score}
                      </span>
                    )}
                    <span>{anime.releaseDay ? `Hari ${anime.releaseDay}` : anime.season || "Sub Indo"}</span>
                  </div>
                </div>

                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all shrink-0" />
              </div>
            ))
          ) : query && !loading ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Film className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm font-bold text-slate-300">Tidak ada anime yang cocok dengan "{query}"</p>
              <p className="text-xs text-slate-500">Coba periksa ejaan atau gunakan kata kunci yang lebih umum.</p>
            </div>
          ) : null}
        </div>

        {/* Footer info in modal */}
        {query && results.length > 0 && (
          <div className="p-3 bg-slate-950/80 border-t border-slate-800 text-center">
            <button
              onClick={handleSubmit}
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center justify-center gap-1 mx-auto cursor-pointer"
            >
              <span>Lihat semua hasil pencarian untuk "{query}"</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
