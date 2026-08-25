import React, { useState, useEffect } from "react";
import { Compass, Sparkles } from "lucide-react";
import { animeApi } from "../services/animeApi";
import { AnimeCardItem, GenreItem, PaginationInfo } from "../types/anime";
import { AnimeGrid } from "../components/AnimeGrid";
import { Pagination } from "../components/Pagination";

interface GenreViewProps {
  initialGenreId?: string;
  onSelectAnime: (animeId: string) => void;
}

export const GenreView: React.FC<GenreViewProps> = ({ initialGenreId, onSelectAnime }) => {
  const [genres, setGenres] = useState<GenreItem[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string>(initialGenreId || "action");
  const [animeList, setAnimeList] = useState<AnimeCardItem[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loadingGenres, setLoadingGenres] = useState<boolean>(true);
  const [loadingAnime, setLoadingAnime] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all genres
  useEffect(() => {
    const fetchGenres = async () => {
      setLoadingGenres(true);
      try {
        const res = await animeApi.getGenres();
        const raw = res?.data;
        let list: GenreItem[] = [];
        if (Array.isArray(raw)) {
          list = raw;
        } else if (raw && Array.isArray((raw as any).genreList)) {
          list = (raw as any).genreList;
        }
        setGenres(list);
        if (!initialGenreId && list.length > 0) {
          setSelectedGenre(list[0].genreId);
        }
      } catch (err: any) {
        console.error("Failed to load genres", err);
      } finally {
        setLoadingGenres(false);
      }
    };

    fetchGenres();
  }, [initialGenreId]);

  // Fetch anime for selected genre
  useEffect(() => {
    if (!selectedGenre) return;

    const fetchByGenre = async () => {
      setLoadingAnime(true);
      setError(null);
      try {
        const res = await animeApi.getByGenre(selectedGenre, currentPage);
        setAnimeList(res.data?.animeList || []);
        setPagination(res.pagination);
      } catch (err: any) {
        setError("Gagal memuat anime untuk genre ini.");
      } finally {
        setLoadingAnime(false);
      }
    };

    fetchByGenre();
  }, [selectedGenre, currentPage]);

  const handleSelectGenre = (genreId: string) => {
    setSelectedGenre(genreId);
    setCurrentPage(1);
  };

  const currentGenreObj = genres.find((g) => g.genreId === selectedGenre);

  return (
    <div id="genre-view-container" className="space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Katalog Genre</h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Temukan ribuan anime berdasarkan genre favorit Anda
            </p>
          </div>
        </div>
      </div>

      {/* Genre Pills */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Pilih Genre</span>
        </h3>

        {loadingGenres ? (
          <div className="flex flex-wrap gap-2 animate-pulse">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="h-9 w-24 bg-slate-800 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {genres.map((g) => {
              const isSelected = g.genreId === selectedGenre;
              return (
                <button
                  key={g.genreId}
                  id={`genre-pill-${g.genreId}`}
                  onClick={() => handleSelectGenre(g.genreId)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                    isSelected
                      ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/30 scale-105"
                      : "bg-slate-900/90 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white"
                  }`}
                >
                  {g.title}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Active Genre Title */}
      {currentGenreObj && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>Genre:</span>
            <span className="text-indigo-400">{currentGenreObj.title}</span>
          </h2>
          {pagination && (
            <span className="text-xs text-slate-400 font-semibold px-3 py-1 rounded-xl bg-slate-900 border border-slate-800">
              Halaman {pagination.currentPage} / {pagination.totalPages}
            </span>
          )}
        </div>
      )}

      {/* Grid */}
      {error ? (
        <div className="py-16 text-center text-rose-400 text-sm">{error}</div>
      ) : (
        <>
          <AnimeGrid
            animeList={animeList}
            loading={loadingAnime}
            onSelectAnime={onSelectAnime}
            emptyMessage={`Belum ada anime untuk genre ${currentGenreObj?.title || ""}`}
          />

          {!loadingAnime && (
            <Pagination
              pagination={pagination}
              currentPage={currentPage}
              onPageChange={(p) => {
                setCurrentPage(p);
                window.scrollTo({ top: 200, behavior: "smooth" });
              }}
            />
          )}
        </>
      )}
    </div>
  );
};
