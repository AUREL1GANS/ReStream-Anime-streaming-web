import React, { createContext, useContext, useState, useEffect } from "react";
import { ANIME_AVATARS } from "../data/avatars";

export interface UserPreferences {
  nickname: string;
  avatar: string;
  bio: string;
  autoNextEpisode: boolean;
  preferredQuality: "auto" | "1080p" | "720p" | "480p" | "360p";
  preferredServer: string;
  cinemaMode: boolean;
  favoriteGenres: string[];
}

interface UserPreferencesContextType {
  preferences: UserPreferences;
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  resetPreferences: () => void;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  nickname: "Otaku ReStream",
  avatar: ANIME_AVATARS[0].url,
  bio: "Penikmat anime garis keras di ReStream.",
  autoNextEpisode: true,
  preferredQuality: "auto",
  preferredServer: "server-1",
  cinemaMode: false,
  favoriteGenres: ["Action", "Fantasy", "Adventure"],
};

const PREFERENCES_STORAGE_KEY = "restream_user_preferences_v2";

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

export const UserPreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    try {
      const saved = localStorage.getItem(PREFERENCES_STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn("Failed to load user preferences", e);
    }
    return DEFAULT_PREFERENCES;
  });

  useEffect(() => {
    try {
      localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
    } catch (e) {
      console.warn("Failed to save user preferences", e);
    }
  }, [preferences]);

  const updatePreferences = (updates: Partial<UserPreferences>) => {
    setPreferences((prev) => ({ ...prev, ...updates }));
  };

  const resetPreferences = () => {
    setPreferences(DEFAULT_PREFERENCES);
  };

  return (
    <UserPreferencesContext.Provider value={{ preferences, updatePreferences, resetPreferences }}>
      {children}
    </UserPreferencesContext.Provider>
  );
};

export const useUserPreferences = () => {
  const context = useContext(UserPreferencesContext);
  if (!context) {
    throw new Error("useUserPreferences must be used within UserPreferencesProvider");
  }
  return context;
};
