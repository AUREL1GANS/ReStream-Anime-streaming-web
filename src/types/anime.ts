export interface GenreItem {
  title: string;
  genreId: string;
  href?: string;
  otakudesuUrl?: string;
}

export interface AnimeCardItem {
  title: string;
  poster: string;
  animeId: string;
  episodes?: number | string | null;
  releaseDay?: string;
  latestReleaseDate?: string;
  lastReleaseDate?: string;
  score?: string;
  studios?: string;
  season?: string;
  href?: string;
  otakudesuUrl?: string;
  synopsis?: { paragraphs?: string[] } | string;
  genreList?: GenreItem[];
}

export interface PaginationInfo {
  currentPage: number;
  hasPrevPage: boolean;
  prevPage: number | null;
  hasNextPage: boolean;
  nextPage: number | null;
  totalPages: number;
}

export interface AnimeHomeData {
  ongoing: {
    animeList: AnimeCardItem[];
  };
  completed: {
    animeList: AnimeCardItem[];
  };
}

export interface EpisodeItem {
  title: string;
  eps?: number | string;
  date?: string;
  episodeId: string;
  href?: string;
  otakudesuUrl?: string;
}

export interface AnimeDetailData {
  title: string;
  poster: string;
  japanese?: string;
  score?: string;
  producers?: string;
  type?: string;
  status?: string;
  episodes?: number | string;
  duration?: string;
  aired?: string;
  studios?: string;
  batch?: any;
  synopsis?: { paragraphs: string[] } | string;
  genreList: GenreItem[];
  episodeList: EpisodeItem[];
  recommendedAnimeList?: AnimeCardItem[];
}

export interface ServerQualityOption {
  title: string;
  serverList: {
    title: string;
    serverId: string;
    href?: string;
  }[];
}

export interface EpisodeDetailData {
  title: string;
  defaultStreamingUrl?: string;
  server?: {
    qualities: ServerQualityOption[];
  };
  downloadUrl?: {
    formats: {
      title: string;
      size?: string;
      urls: {
        title: string;
        url: string;
      }[];
    }[];
  };
  info?: {
    credit?: string;
    encoder?: string;
    duration?: string;
    type?: string;
    genreList?: GenreItem[];
    episodeList?: EpisodeItem[];
  };
  animeId?: string;
}

export interface ScheduleDay {
  day: string;
  anime_list: {
    title: string;
    slug: string;
    url?: string;
    poster: string;
    score?: string;
    episodes?: string;
  }[];
}

export interface WatchHistoryItem {
  animeId: string;
  animeTitle: string;
  episodeId: string;
  episodeTitle: string;
  poster: string;
  timestamp: number;
  progressSeconds?: number;
  durationSeconds?: number;
}

export interface BookmarkItem {
  animeId: string;
  title: string;
  poster: string;
  score?: string;
  episodes?: number | string | null;
  status?: string;
  addedAt: number;
}
