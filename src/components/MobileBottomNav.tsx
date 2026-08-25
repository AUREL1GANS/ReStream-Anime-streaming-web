import React from "react";
import { Home, Flame, Bookmark, History, Sliders } from "lucide-react";
import { useBookmarks } from "../contexts/BookmarkContext";
import { useUserPreferences } from "../contexts/UserPreferencesContext";

interface MobileBottomNavProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ currentView, onNavigate }) => {
  const { bookmarks, history } = useBookmarks();
  const { preferences } = useUserPreferences();

  const navItems = [
    {
      id: "home",
      label: "Beranda",
      icon: Home,
      view: "home",
      active: currentView === "home",
    },
    {
      id: "ongoing",
      label: "Ongoing",
      icon: Flame,
      view: "ongoing",
      active: currentView === "ongoing",
    },
    {
      id: "bookmarks",
      label: "Watchlist",
      icon: Bookmark,
      view: "bookmarks",
      badge: bookmarks.length > 0 ? bookmarks.length : undefined,
      active: currentView === "bookmarks",
    },
    {
      id: "history",
      label: "Riwayat",
      icon: History,
      view: "history",
      badge: history.length > 0 ? history.length : undefined,
      active: currentView === "history",
    },
    {
      id: "profile",
      label: "Studio Hub",
      icon: Sliders,
      view: "profile",
      avatar: preferences.avatar,
      active: currentView === "profile",
    },
  ];

  return (
    <nav
      id="mobile-bottom-navigation"
      aria-label="Navigasi Mobile Bawah"
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-slate-950/90 backdrop-blur-2xl border-t border-indigo-500/20 px-2 py-1.5 shadow-2xl shadow-black/80 safe-area-bottom"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.active;

          return (
            <button
              key={item.id}
              id={`mobile-nav-btn-${item.id}`}
              onClick={() => onNavigate(item.view)}
              className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all duration-200 cursor-pointer select-none touch-manipulation active:scale-95 ${
                isActive ? "text-cyan-400" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {/* Active Neon Glow Top Bar */}
              {isActive && (
                <span className="absolute -top-1.5 w-8 h-1 bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full shadow-md shadow-cyan-400/50" />
              )}

              {/* Icon / Avatar with Badge */}
              <div className="relative p-0.5">
                {item.avatar && item.id === "profile" ? (
                  <div
                    className={`w-6 h-6 rounded-full overflow-hidden border transition-all ${
                      isActive ? "border-cyan-400 ring-2 ring-cyan-400/50 scale-105" : "border-slate-700"
                    }`}
                  >
                    <img src={item.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <Icon className={`w-5 h-5 transition-transform ${isActive ? "scale-110 text-cyan-400" : ""}`} />
                )}

                {/* Badge Number */}
                {item.badge !== undefined && (
                  <span className="absolute -top-1 -right-2 px-1.5 py-0.2 text-[9px] font-black rounded-full bg-indigo-600 text-white border border-slate-950 shadow-sm leading-none">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </div>

              {/* Label */}
              <span className={`text-[10px] font-bold tracking-tight mt-0.5 ${isActive ? "text-cyan-400 font-extrabold" : "text-slate-400"}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
