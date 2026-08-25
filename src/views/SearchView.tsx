import React, { useState, useEffect } from "react";
import { Search, Loader2, Film } from "lucide-react";
import { animeApi } from "../services/animeApi";
import { AnimeCardItem } from "../types/anime";
import { AnimeGrid } from "../components/AnimeGrid";

interface SearchViewProps {
  initialQuery?: string;
  onSelectAnime: (animeId: string) => void;
}

export const SearchView: React.FC<SearchViewProps> = ({ initialQuery = "", onSelectAnime }) => {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<AnimeCardItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const performSearch = async (term: string) => {
    if (!term.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const res = await animeApi.search(term.trim());
      setResults(res.data?.animeList || []);
    } catch (err: any) {
      setError("Gagal melakukan pencarian anime.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };

  return (
    <div id="search-view-container" className="space-y-8">
      {/* Header & Search Bar */}
      <div className="p-6 sm:p-8 bg-slate-900/60 rounded-3xl border border-slate-800 space-y-4">
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Cari Anime
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Temukan anime favorit Anda berdasarkan judul, karakter, atau franchise
        </p>

        <form onSubmit={handleSubmit} className="flex gap-3 pt-2">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              id="search-view-input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ketik judul anime (contoh: Jujutsu Kaisen, One Piece, Bleach)..."
              className="w-full pl-12 pr-4 py-3.5 bg-slate-950/80 rounded-2xl text-sm sm:text-base text-white placeholder-slate-500 border border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            id="search-view-submit-btn"
            disabled={loading}
            className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-sm sm:text-base rounded-2xl transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer shrink-0"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            <span className="hidden sm:inline">Cari</span>
          </button>
        </form>
      </div>

      {/* Results Header */}
      {hasSearched && (
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h2 className="text-base sm:text-lg font-bold text-white">
            Hasil Pencarian: <span className="text-indigo-400">"{query}"</span>
          </h2>
          <span className="text-xs text-slate-400 font-semibold px-3 py-1 bg-slate-900 rounded-xl border border-slate-800">
            {results.length} Anime Ditemukan
          </span>
        </div>
      )}

      {/* Grid or Empty / Error */}
      {error ? (
        <div className="py-16 text-center text-rose-400 text-sm">{error}</div>
      ) : (
        <AnimeGrid
          animeList={results}
          loading={loading}
          onSelectAnime={onSelectAnime}
          emptyMessage={hasSearched ? `Tidak ditemukan anime dengan kata kunci "${query}"` : "Ketik judul anime untuk mulai mencari"}
        />
      )}
    </div>
  );
};
