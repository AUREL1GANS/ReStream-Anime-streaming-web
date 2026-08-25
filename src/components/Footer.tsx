import React from "react";
import { Film, Heart, Shield, Sparkles, Coffee, ExternalLink, Sliders, Zap } from "lucide-react";

interface FooterProps {
  onNavigate: (view: string, param?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer id="main-app-footer" className="mt-20 border-t border-slate-800/80 bg-slate-950/90 backdrop-blur-xl pt-12 pb-16 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-cyan-400 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
                <Film className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black tracking-tight text-white">
                RE<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">STREAM</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-md">
              Platform streaming anime modern dan super responsif dengan subtitle Indonesia. 100% bebas login tanpa ribet, instan simpan Watchlist & Riwayat di browser Anda, serta pemutar video HD berkecepatan tinggi.
            </p>
            <div className="flex items-center gap-3 pt-2 flex-wrap">
              <a
                id="footer-saweria-link"
                href="https://saweria.co/ItsRell"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/30 text-xs font-black text-amber-300 transition-all shadow-md shadow-amber-500/10"
              >
                <Coffee className="w-4 h-4 text-amber-400" />
                <span>Dukung Server di Saweria (ItsRell)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Nav Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Navigasi Utama
            </h4>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <button
                  id="footer-nav-home"
                  onClick={() => onNavigate("home")}
                  className="hover:text-cyan-400 transition-colors cursor-pointer"
                >
                  Beranda
                </button>
              </li>
              <li>
                <button
                  id="footer-nav-ongoing"
                  onClick={() => onNavigate("ongoing")}
                  className="hover:text-cyan-400 transition-colors cursor-pointer"
                >
                  Anime Ongoing (Sedang Tayang)
                </button>
              </li>
              <li>
                <button
                  id="footer-nav-completed"
                  onClick={() => onNavigate("completed")}
                  className="hover:text-cyan-400 transition-colors cursor-pointer"
                >
                  Anime Tamat (Completed)
                </button>
              </li>
              <li>
                <button
                  id="footer-nav-schedule"
                  onClick={() => onNavigate("schedule")}
                  className="hover:text-cyan-400 transition-colors cursor-pointer"
                >
                  Jadwal Rilis Mingguan
                </button>
              </li>
              <li>
                <button
                  id="footer-nav-genres"
                  onClick={() => onNavigate("genres")}
                  className="hover:text-cyan-400 transition-colors cursor-pointer"
                >
                  Katalog Genre
                </button>
              </li>
            </ul>
          </div>

          {/* Studio & Features */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Studio & Personalisasi
            </h4>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <button
                  id="footer-nav-profile"
                  onClick={() => onNavigate("profile")}
                  className="hover:text-cyan-400 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Kustomisasi Studio & Avatar</span>
                </button>
              </li>
              <li>
                <button
                  id="footer-nav-bookmarks"
                  onClick={() => onNavigate("bookmarks")}
                  className="hover:text-cyan-400 transition-colors cursor-pointer"
                >
                  Watchlist Anime
                </button>
              </li>
              <li>
                <button
                  id="footer-nav-history"
                  onClick={() => onNavigate("history")}
                  className="hover:text-cyan-400 transition-colors cursor-pointer"
                >
                  Riwayat Nonton
                </button>
              </li>
              <li className="flex items-center gap-1.5 text-slate-500 pt-2">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span>Instant Offline Storage (No Login)</span>
              </li>
              <li className="flex items-center gap-1.5 text-slate-500">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>1-Click JSON Backup & Restore</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} ReStream Anime. Dibuat untuk pecinta anime Indonesia.</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Dibuat dengan cinta untuk komunitas wibu Indonesia</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          </div>
        </div>
      </div>
    </footer>
  );
};
