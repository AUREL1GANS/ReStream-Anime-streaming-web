import React, { useState, useEffect } from "react";
import {
  Film,
  Search,
  Bookmark,
  Calendar,
  Flame,
  CheckSquare,
  Compass,
  Menu,
  X,
  History,
  Sparkles,
  Heart,
  Sliders,
  PlayCircle,
} from "lucide-react";
import { useBookmarks } from "../contexts/BookmarkContext";
import { useUserPreferences } from "../contexts/UserPreferencesContext";

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, param?: string) => void;
  onOpenSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, onOpenSearch }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { bookmarks, history } = useBookmarks();
  const { preferences } = useUserPreferences();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { id: "home", label: "Beranda", icon: Film },
    { id: "ongoing", label: "Ongoing", icon: Flame },
    { id: "completed", label: "Tamat", icon: CheckSquare },
    { id: "genres", label: "Genre", icon: Compass },
    { id: "schedule", label: "Jadwal", icon: Calendar },
    {
      id: "bookmarks",
      label: "Watchlist",
      icon: Bookmark,
      badge: bookmarks.length > 0 ? bookmarks.length : undefined,
    },
    {
      id: "history",
      label: "Riwayat",
      icon: History,
      badge: history.length > 0 ? history.length : undefined,
    },
  ];

  const handleItemClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <header
      id="main-navbar"
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? "bg-slate-950/85 backdrop-blur-xl border-b border-indigo-500/20 shadow-xl shadow-black/40 py-2.5"
          : "bg-gradient-to-b from-slate-950/95 via-slate-950/70 to-transparent py-3.5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-6 lg:gap-8">
          <button
            id="brand-logo-button"
            onClick={() => handleItemClick("home")}
            className="flex items-center gap-3 group cursor-pointer text-left focus:outline-none"
          >
            <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 via-indigo-600 to-purple-600 p-[1.5px] shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 group-hover:scale-105 transition-all">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <PlayCircle className="w-5 h-5 text-cyan-400 group-hover:text-white transition-colors" />
              </div>
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-cyan-400 rounded-full animate-ping" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-cyan-400 rounded-full" />
            </div>

            <div>
              <span className="text-xl font-black tracking-tight text-white flex items-center gap-1 leading-none">
                RE<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400">STREAM</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                HD Anime Sub Indo
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav id="desktop-navigation" className="hidden lg:flex items-center gap-1 bg-slate-900/50 p-1 rounded-2xl border border-slate-800/80 backdrop-blur-md">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => handleItemClick(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer relative ${
                    isActive
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30 font-bold"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/70"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span className={`px-1.5 py-0.5 text-[10px] font-black rounded-full leading-none ${
                      isActive ? "bg-white text-indigo-700" : "bg-indigo-500/30 text-indigo-300 border border-indigo-500/40"
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Actions: Quick Search, Saweria Badge & Personal Hub */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Quick Search Spotlight Button */}
          <button
            id="open-search-modal-btn"
            onClick={onOpenSearch}
            className="flex items-center gap-2.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl bg-slate-900/80 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800 hover:border-indigo-500/40 text-xs sm:text-sm transition-all shadow-sm cursor-pointer group"
          >
            <Search className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline text-slate-400 font-medium">Cari anime...</span>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-bold bg-slate-950 text-slate-400 rounded-md border border-slate-800">
              /
            </kbd>
          </button>

          {/* Saweria Supporter Shortcut */}
          <a
            id="nav-saweria-btn"
            href="https://saweria.co/ItsRell"
            target="_blank"
            rel="noopener noreferrer"
            title="Dukung ReStream via Saweria"
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all cursor-pointer hover:shadow-lg hover:shadow-amber-500/10"
          >
            <Heart className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>Saweria</span>
          </a>

          {/* Personal Hub / Studio Profile Button */}
          <button
            id="nav-profile-hub-btn"
            onClick={() => handleItemClick("profile")}
            className={`flex items-center gap-2.5 p-1 sm:pl-2 sm:pr-3 sm:py-1 rounded-2xl border transition-all cursor-pointer ${
              currentView === "profile"
                ? "bg-indigo-600/20 border-indigo-500/60 ring-2 ring-indigo-500/30"
                : "bg-slate-900/80 hover:bg-slate-800 border-slate-800 hover:border-indigo-500/30"
            }`}
          >
            <div className="relative w-8 h-8 rounded-xl overflow-hidden bg-slate-950 border border-indigo-500/40 shrink-0">
              <img src={preferences.avatar} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-bold text-white leading-tight max-w-[90px] truncate">
                {preferences.nickname}
              </span>
              <span className="text-[10px] text-indigo-400 font-medium leading-none">
                Studio Hub
              </span>
            </div>
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            id="mobile-menu-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white bg-slate-900 border border-slate-800 transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div
          id="mobile-nav-dropdown"
          className="lg:hidden mt-2 bg-slate-950/95 backdrop-blur-2xl border-b border-slate-800 px-4 py-4 space-y-2 shadow-2xl animate-in slide-in-from-top duration-200"
        >
          <div className="grid grid-cols-2 gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`flex items-center gap-2.5 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30"
                      : "bg-slate-900/80 text-slate-300 hover:text-white border border-slate-800/80"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="ml-auto px-2 py-0.5 text-[10px] font-black rounded-full bg-indigo-500 text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={() => handleItemClick("profile")}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 text-slate-200 text-xs font-bold border border-slate-800"
            >
              <Sliders className="w-4 h-4 text-indigo-400" />
              <span>Pengaturan & Personalisasi</span>
            </button>

            <a
              href="https://saweria.co/ItsRell"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold"
            >
              <Heart className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>Saweria</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
