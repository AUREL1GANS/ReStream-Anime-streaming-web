import React, { createContext, useContext, useEffect, useState } from "react";
import { BookmarkItem, WatchHistoryItem } from "../types/anime";

interface BookmarkContextType {
  bookmarks: BookmarkItem[];
  history: WatchHistoryItem[];
  isBookmarked: (animeId: string) => boolean;
  toggleBookmark: (item: Omit<BookmarkItem, "addedAt">) => void;
  removeBookmark: (animeId: string) => void;
  clearBookmarks: () => void;
  addToHistory: (item: Omit<WatchHistoryItem, "timestamp">) => void;
  updateHistoryProgress: (episodeId: string, progressSeconds: number, durationSeconds?: number) => void;
  clearHistory: () => void;
  removeHistoryItem: (episodeId: string) => void;
  getHistoryForAnime: (animeId: string) => WatchHistoryItem | undefined;
  exportDataJSON: () => string;
  importDataJSON: (jsonString: string) => { success: boolean; message: string; count?: number };
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined);

const LOCAL_BOOKMARK_KEY = "restream_anime_bookmarks_v2";
const LOCAL_HISTORY_KEY = "restream_anime_history_v2";

export const BookmarkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_BOOKMARK_KEY) || localStorage.getItem("restream_anime_bookmarks");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [history, setHistory] = useState<WatchHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_HISTORY_KEY) || localStorage.getItem("restream_anime_history");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_BOOKMARK_KEY, JSON.stringify(bookmarks));
    } catch (e) {
      console.warn("Failed to persist bookmarks", e);
    }
  }, [bookmarks]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(history));
    } catch (e) {
      console.warn("Failed to persist history", e);
    }
  }, [history]);

  const isBookmarked = (animeId: string) => {
    return bookmarks.some((b) => b.animeId === animeId);
  };

  const toggleBookmark = (item: Omit<BookmarkItem, "addedAt">) => {
    setBookmarks((prev) => {
      const exists = prev.some((b) => b.animeId === item.animeId);
      if (exists) {
        return prev.filter((b) => b.animeId !== item.animeId);
      } else {
        return [{ ...item, addedAt: Date.now() }, ...prev];
      }
    });
  };

  const removeBookmark = (animeId: string) => {
    setBookmarks((prev) => prev.filter((b) => b.animeId !== animeId));
  };

  const clearBookmarks = () => {
    setBookmarks([]);
  };

  const addToHistory = (item: Omit<WatchHistoryItem, "timestamp">) => {
    setHistory((prev) => {
      const filtered = prev.filter((h) => h.episodeId !== item.episodeId);
      return [
        {
          ...item,
          timestamp: Date.now(),
        },
        ...filtered,
      ].slice(0, 100);
    });
  };

  const updateHistoryProgress = (episodeId: string, progressSeconds: number, durationSeconds?: number) => {
    setHistory((prev) =>
      prev.map((h) => {
        if (h.episodeId === episodeId) {
          return {
            ...h,
            progressSeconds,
            ...(durationSeconds ? { durationSeconds } : {}),
            timestamp: Date.now(),
          };
        }
        return h;
      })
    );
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const removeHistoryItem = (episodeId: string) => {
    setHistory((prev) => prev.filter((h) => h.episodeId !== episodeId));
  };

  const getHistoryForAnime = (animeId: string) => {
    return history.find((h) => h.animeId === animeId);
  };

  const exportDataJSON = (): string => {
    const data = {
      version: 2,
      exportedAt: new Date().toISOString(),
      bookmarks,
      history,
    };
    return JSON.stringify(data, null, 2);
  };

  const importDataJSON = (jsonString: string): { success: boolean; message: string; count?: number } => {
    try {
      const parsed = JSON.parse(jsonString);
      let count = 0;

      if (Array.isArray(parsed.bookmarks)) {
        setBookmarks((prev) => {
          const map = new Map<string, BookmarkItem>();
          prev.forEach((b) => map.set(b.animeId, b));
          parsed.bookmarks.forEach((b: BookmarkItem) => {
            if (b.animeId) map.set(b.animeId, b);
          });
          count += parsed.bookmarks.length;
          return Array.from(map.values());
        });
      }

      if (Array.isArray(parsed.history)) {
        setHistory((prev) => {
          const map = new Map<string, WatchHistoryItem>();
          prev.forEach((h) => map.set(h.episodeId, h));
          parsed.history.forEach((h: WatchHistoryItem) => {
            if (h.episodeId) map.set(h.episodeId, h);
          });
          count += parsed.history.length;
          return Array.from(map.values()).slice(0, 100);
        });
      }

      return {
        success: true,
        message: `Berhasil memulihkan ${count} data anime (Watchlist & Riwayat)!`,
        count,
      };
    } catch (e: any) {
      return {
        success: false,
        message: "Format file JSON tidak valid. Pastikan memilih file backup ReStream yang benar.",
      };
    }
  };

  return (
    <BookmarkContext.Provider
      value={{
        bookmarks,
        history,
        isBookmarked,
        toggleBookmark,
        removeBookmark,
        clearBookmarks,
        addToHistory,
        updateHistoryProgress,
        clearHistory,
        removeHistoryItem,
        getHistoryForAnime,
        exportDataJSON,
        importDataJSON,
      }}
    >
      {children}
    </BookmarkContext.Provider>
  );
};

export const useBookmarks = () => {
  const context = useContext(BookmarkContext);
  if (!context) {
    throw new Error("useBookmarks must be used within BookmarkProvider");
  }
  return context;
};
