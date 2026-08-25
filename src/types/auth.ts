import { BookmarkItem, WatchHistoryItem } from "./anime";

export interface UserPreferences {
  autoNextEpisode: boolean;
  preferredQuality: "360p" | "480p" | "720p" | "auto";
  preferredServer: string;
  notifyNewEpisodes: boolean;
}

export interface User {
  id: string;
  username: string;
  email: string;
  nickname: string;
  avatar: string;
  bio?: string;
  favoriteGenres?: string[];
  role: "member" | "supporter" | "vip";
  createdAt: number;
  preferences: UserPreferences;
  bookmarks: BookmarkItem[];
  history: WatchHistoryItem[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  nickname: string;
  avatar: string;
  verificationCode: string;
  honeypot?: string;
}

export interface SendVerificationData {
  email: string;
  username: string;
  mathAnswer: number;
  mathToken: string;
  honeypot?: string;
}

export interface SecurityChallenge {
  num1: number;
  num2: number;
  operator: string;
  token: string;
  prompt: string;
}

export interface LoginFormData {
  identifier: string; // username or email
  password: string;
}

export interface PendingVerification {
  email: string;
  username: string;
  code: string;
  expiresAt: number;
  sentAt: number;
  attempts: number;
  maxAttempts: number;
  previewBody?: string;
}

export interface VerificationValidationResult {
  valid: boolean;
  message: string;
  isExpired?: boolean;
  remainingAttempts?: number;
}
