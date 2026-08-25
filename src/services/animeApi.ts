import {
  AnimeHomeData,
  AnimeCardItem,
  AnimeDetailData,
  EpisodeDetailData,
  GenreItem,
  PaginationInfo,
  ScheduleDay,
} from "../types/anime";

// Client-side cache
const clientCache = new Map<string, { data: any; expiry: number }>();
const inFlightRequests = new Map<string, Promise<any>>();

async function fetchApi<T>(path: string, ttlMs: number = 3 * 60 * 1000): Promise<T> {
  const cached = clientCache.get(path);
  if (cached && Date.now() < cached.expiry) {
    return cached.data;
  }

  if (inFlightRequests.has(path)) {
    return inFlightRequests.get(path)!;
  }

  const promise = (async () => {
    try {
      const response = await fetch(`/api/anime${path}`);
      if (!response.ok) {
        throw new Error(`Gagal memuat data (${response.status})`);
      }
      const json = await response.json();
      clientCache.set(path, {
        data: json,
        expiry: Date.now() + ttlMs,
      });
      return json;
    } finally {
      inFlightRequests.delete(path);
    }
  })();

  inFlightRequests.set(path, promise);
  return promise;
}

export const animeApi = {
  // 1. Home
  async getHome(): Promise<{ data: AnimeHomeData }> {
    return fetchApi<{ data: AnimeHomeData }>("/home", 5 * 60 * 1000);
  },

  // 2. Ongoing
  async getOngoing(page = 1): Promise<{ data: { animeList: AnimeCardItem[] }; pagination: PaginationInfo }> {
    return fetchApi<{ data: { animeList: AnimeCardItem[] }; pagination: PaginationInfo }>(
      `/ongoing?page=${page}`,
      5 * 60 * 1000
    );
  },

  // 3. Completed
  async getCompleted(page = 1): Promise<{ data: { animeList: AnimeCardItem[] }; pagination: PaginationInfo }> {
    return fetchApi<{ data: { animeList: AnimeCardItem[] }; pagination: PaginationInfo }>(
      `/completed?page=${page}`,
      10 * 60 * 1000
    );
  },

  // 4. Schedule
  async getSchedule(): Promise<{ data: ScheduleDay[] }> {
    return fetchApi<{ data: ScheduleDay[] }>("/schedule", 15 * 60 * 1000);
  },

  // 5. Genres
  async getGenres(): Promise<{ data: { genreList: GenreItem[] } | GenreItem[] }> {
    return fetchApi<{ data: { genreList: GenreItem[] } | GenreItem[] }>("/genres", 30 * 60 * 1000);
  },

  // 6. Anime by genre
  async getByGenre(
    genreId: string,
    page = 1
  ): Promise<{ data: { animeList: AnimeCardItem[] }; pagination: PaginationInfo }> {
    return fetchApi<{ data: { animeList: AnimeCardItem[] }; pagination: PaginationInfo }>(
      `/genre/${encodeURIComponent(genreId)}?page=${page}`,
      10 * 60 * 1000
    );
  },

  // 7. Search
  async search(keyword: string): Promise<{ data: { animeList: AnimeCardItem[] } }> {
    if (!keyword.trim()) {
      return { data: { animeList: [] } };
    }
    return fetchApi<{ data: { animeList: AnimeCardItem[] } }>(
      `/search/${encodeURIComponent(keyword.trim())}`,
      2 * 60 * 1000
    );
  },

  // 8. Anime Detail
  async getDetail(slug: string): Promise<{ data: AnimeDetailData }> {
    return fetchApi<{ data: AnimeDetailData }>(`/detail/${encodeURIComponent(slug)}`, 10 * 60 * 1000);
  },

  // 9. Episode Detail
  async getEpisode(slug: string): Promise<{ data: EpisodeDetailData }> {
    return fetchApi<{ data: EpisodeDetailData }>(`/episode/${encodeURIComponent(slug)}`, 5 * 60 * 1000);
  },

  // 10. Streaming Server
  async getServer(serverId: string): Promise<{ data: { url: string } }> {
    return fetchApi<{ data: { url: string } }>(`/server/${encodeURIComponent(serverId)}`, 10 * 60 * 1000);
  },
};

export function getCleanImageUrl(url?: string): string {
  if (!url) {
    return "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&q=80";
  }
  return url;
}

export function formatSynopsis(synopsis?: { paragraphs?: string[] } | string): string {
  if (!synopsis) return "Belum ada sinopsis untuk anime ini.";
  if (typeof synopsis === "string") return synopsis;
  if (Array.isArray(synopsis.paragraphs) && synopsis.paragraphs.length > 0) {
    return synopsis.paragraphs.filter(Boolean).join("\n\n");
  }
  return "Belum ada sinopsis untuk anime ini.";
}
