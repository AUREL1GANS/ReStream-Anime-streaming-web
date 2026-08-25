import React, { useState } from "react";
import { Heart, Coffee, ExternalLink, Sparkles, Copy, Check } from "lucide-react";
import { useToast } from "../contexts/ToastContext";

export const DonationBanner: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  const handleCopyLink = (e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText("https://saweria.co/ItsRell");
    setCopied(true);
    showToast("Link Saweria disalin ke clipboard!", "success");
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section
      id="saweria-donation-banner"
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500/15 via-slate-900/90 to-indigo-950/40 border border-amber-500/30 p-5 sm:p-7 shadow-2xl shadow-amber-500/5 transition-all hover:border-amber-500/50 group"
    >
      {/* Decorative ambient background glows */}
      <div className="absolute -top-12 -right-12 w-56 h-56 bg-amber-500/15 rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-700" />
      <div className="absolute -bottom-10 -left-10 w-56 h-56 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* Left info */}
        <div className="flex items-start sm:items-center gap-4">
          <div className="relative p-4 rounded-3xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 text-slate-950 font-black shadow-xl shadow-amber-500/30 shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Coffee className="w-7 h-7 text-slate-950" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-ping" />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>Patron ReStream Server</span>
              </span>
              <span className="text-xs text-slate-400 font-medium">Bebas Iklan & Akses Lancar</span>
            </div>

            <h3 className="text-base sm:text-xl font-black text-white tracking-tight leading-snug">
              Suka nonton di ReStream? Traktir Kopi Kreator via Saweria! ☕✨
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Dukungan Anda membantu biaya server berkecepatan tinggi, integrasi episode anime tanpa batas, dan update fitur terbaru.
            </p>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="w-full lg:w-auto flex flex-col sm:flex-row items-center gap-3 shrink-0">
          <button
            onClick={handleCopyLink}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold transition-all cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
            <span>{copied ? "Tersalin!" : "Salin Link Saweria"}</span>
          </button>

          <a
            id="saweria-donate-btn"
            href="https://saweria.co/ItsRell"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-sm transition-all transform hover:-translate-y-0.5 shadow-xl shadow-amber-500/30 cursor-pointer"
          >
            <Heart className="w-4 h-4 fill-slate-950 text-slate-950 animate-bounce" />
            <span>Donasi di Saweria</span>
            <ExternalLink className="w-4 h-4 text-slate-950" />
          </a>
        </div>
      </div>
    </section>
  );
};
