import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { SearchModal } from "./components/SearchBar";
import { Footer } from "./components/Footer";
import { UserPreferencesProvider } from "./contexts/UserPreferencesContext";
import { BookmarkProvider } from "./contexts/BookmarkContext";
import { ToastProvider } from "./contexts/ToastContext";
import { HomeView } from "./views/HomeView";
import { OngoingView } from "./views/OngoingView";
import { CompletedView } from "./views/CompletedView";
import { GenreView } from "./views/GenreView";
import { ScheduleView } from "./views/ScheduleView";
import { DetailView } from "./views/DetailView";
import { WatchView } from "./views/WatchView";
import { BookmarksView } from "./views/BookmarksView";
import { SearchView } from "./views/SearchView";
import { ProfileView } from "./views/ProfileView";
import { MobileBottomNav } from "./components/MobileBottomNav";

export function AppContent() {
  const [currentView, setCurrentView] = useState<string>("home");
  const [selectedAnimeSlug, setSelectedAnimeSlug] = useState<string>("");
  const [selectedEpisodeSlug, setSelectedEpisodeSlug] = useState<string>("");
  const [selectedAnimeTitle, setSelectedAnimeTitle] = useState<string>("");
  const [selectedGenreId, setSelectedGenreId] = useState<string>("");
  const [selectedScheduleDay, setSelectedScheduleDay] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchModalOpen, setSearchModalOpen] = useState<boolean>(false);

  // Hash-based routing synchronization
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, "");
      if (!hash) {
        setCurrentView("home");
        return;
      }

      const parts = hash.split("/");
      const route = parts[0];
      const param = parts.slice(1).join("/");

      if (route === "anime" && param) {
        setSelectedAnimeSlug(decodeURIComponent(param));
        setCurrentView("detail");
      } else if (route === "watch" && param) {
        setSelectedEpisodeSlug(decodeURIComponent(param));
        setCurrentView("watch");
      } else if (route === "genre" && param) {
        setSelectedGenreId(decodeURIComponent(param));
        setCurrentView("genre-detail");
      } else if (route === "schedule") {
        if (param) setSelectedScheduleDay(decodeURIComponent(param));
        setCurrentView("schedule");
      } else if (route === "search") {
        setSearchQuery(decodeURIComponent(param || ""));
        setCurrentView("search");
      } else if (route === "profile" || route === "studio" || route === "account" || route === "settings") {
        setCurrentView("profile");
      } else if (["ongoing", "completed", "genres", "bookmarks", "history"].includes(route)) {
        setCurrentView(route);
      } else {
        setCurrentView("home");
      }
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Global keydown for search shortcut ( / )
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && (document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA")) {
        e.preventDefault();
        setSearchModalOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const navigateTo = (view: string, param?: string) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (view === "home") {
      window.location.hash = "#/";
    } else if (view === "ongoing") {
      window.location.hash = "#/ongoing";
    } else if (view === "completed") {
      window.location.hash = "#/completed";
    } else if (view === "genres") {
      window.location.hash = "#/genres";
    } else if (view === "genre-detail" && param) {
      window.location.hash = `#/genre/${encodeURIComponent(param)}`;
    } else if (view === "schedule") {
      window.location.hash = param ? `#/schedule/${encodeURIComponent(param)}` : "#/schedule";
    } else if (view === "bookmarks") {
      window.location.hash = "#/bookmarks";
    } else if (view === "history") {
      window.location.hash = "#/history";
    } else if (view === "profile") {
      window.location.hash = "#/profile";
    } else if (view === "search") {
      window.location.hash = param ? `#/search/${encodeURIComponent(param)}` : "#/search";
    } else if (view === "detail" && param) {
      window.location.hash = `#/anime/${encodeURIComponent(param)}`;
    } else if (view === "watch" && param) {
      window.location.hash = `#/watch/${encodeURIComponent(param)}`;
    }
  };

  const handleSelectAnime = (slug: string) => {
    setSelectedAnimeSlug(slug);
    navigateTo("detail", slug);
  };

  const handleSelectEpisode = (episodeSlug: string, animeTitle?: string) => {
    setSelectedEpisodeSlug(episodeSlug);
    if (animeTitle) setSelectedAnimeTitle(animeTitle);
    navigateTo("watch", episodeSlug);
  };

  const handleSelectGenre = (genreId: string) => {
    setSelectedGenreId(genreId);
    navigateTo("genre-detail", genreId);
  };

  const handleSearchAll = (query: string) => {
    setSearchQuery(query);
    navigateTo("search", query);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={navigateTo}
        onOpenSearch={() => setSearchModalOpen(true)}
      />

      {/* Main Content Area */}
      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 pt-20 sm:pt-28 pb-24 lg:pb-16">
        {currentView === "home" && (
          <HomeView onSelectAnime={handleSelectAnime} onNavigate={navigateTo} />
        )}

        {currentView === "ongoing" && (
          <OngoingView onSelectAnime={handleSelectAnime} />
        )}

        {currentView === "completed" && (
          <CompletedView onSelectAnime={handleSelectAnime} />
        )}

        {currentView === "genres" && (
          <GenreView onSelectAnime={handleSelectAnime} />
        )}

        {currentView === "genre-detail" && (
          <GenreView initialGenreId={selectedGenreId} onSelectAnime={handleSelectAnime} />
        )}

        {currentView === "schedule" && (
          <ScheduleView initialDay={selectedScheduleDay} onSelectAnime={handleSelectAnime} />
        )}

        {currentView === "detail" && (
          <DetailView
            animeSlug={selectedAnimeSlug}
            onSelectAnime={handleSelectAnime}
            onSelectEpisode={handleSelectEpisode}
            onSelectGenre={handleSelectGenre}
            onBack={() => window.history.back()}
          />
        )}

        {currentView === "watch" && (
          <WatchView
            episodeSlug={selectedEpisodeSlug}
            initialAnimeTitle={selectedAnimeTitle}
            onSelectAnime={handleSelectAnime}
            onSelectEpisode={handleSelectEpisode}
            onBack={() => {
              if (selectedAnimeSlug) {
                navigateTo("detail", selectedAnimeSlug);
              } else {
                navigateTo("home");
              }
            }}
          />
        )}

        {(currentView === "bookmarks" || currentView === "history") && (
          <BookmarksView
            onSelectAnime={handleSelectAnime}
            onSelectEpisode={handleSelectEpisode}
          />
        )}

        {currentView === "profile" && (
          <ProfileView
            onSelectAnime={handleSelectAnime}
            onSelectEpisode={handleSelectEpisode}
            onNavigate={navigateTo}
          />
        )}

        {currentView === "search" && (
          <SearchView
            initialQuery={searchQuery}
            onSelectAnime={handleSelectAnime}
          />
        )}
      </main>

      {/* Global Search Spotlight Modal */}
      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onSelectAnime={handleSelectAnime}
        onSearchAll={handleSearchAll}
      />

      {/* Footer */}
      <Footer onNavigate={navigateTo} />

      {/* Mobile & WebView Bottom Navigation Bar */}
      <MobileBottomNav currentView={currentView} onNavigate={navigateTo} />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <UserPreferencesProvider>
        <BookmarkProvider>
          <AppContent />
        </BookmarkProvider>
      </UserPreferencesProvider>
    </ToastProvider>
  );
}
