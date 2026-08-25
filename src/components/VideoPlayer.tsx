import React, { useState, useEffect, useRef } from "react";
import {
  RotateCcw,
  Maximize2,
  Minimize2,
  Server,
  Layers,
  AlertTriangle,
  Loader2,
  ExternalLink,
  Tv,
  Sparkles,
  Zap,
  Moon,
  Sun,
  ShieldAlert,
} from "lucide-react";
import { ServerQualityOption } from "../types/anime";
import { animeApi } from "../services/animeApi";
import { useToast } from "../contexts/ToastContext";

interface VideoPlayerProps {
  defaultStreamingUrl?: string;
  qualities?: ServerQualityOption[];
  title?: string;
  onServerChange?: (serverName: string) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  defaultStreamingUrl,
  qualities = [],
  title = "Video Player",
}) => {
  const [currentStreamUrl, setCurrentStreamUrl] = useState<string>(defaultStreamingUrl || "");
  const [selectedQuality, setSelectedQuality] = useState<string>("");
  const [selectedServerId, setSelectedServerId] = useState<string>("");
  const [loadingServer, setLoadingServer] = useState<boolean>(false);
  const [iframeLoading, setIframeLoading] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [cinemaMode, setCinemaMode] = useState<boolean>(false);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (defaultStreamingUrl) {
      setCurrentStreamUrl(defaultStreamingUrl);
      setIframeLoading(true);
    }
  }, [defaultStreamingUrl]);

  // Set default quality & server on mount/change
  useEffect(() => {
    if (qualities && qualities.length > 0) {
      const firstQuality = qualities[0];
      setSelectedQuality(firstQuality.title);
      if (firstQuality.serverList.length > 0) {
        setSelectedServerId(firstQuality.serverList[0].serverId);
      }
    }
  }, [qualities]);

  const handleSelectServer = async (qualityTitle: string, server: { title: string; serverId: string }) => {
    setSelectedQuality(qualityTitle);
    setSelectedServerId(server.serverId);
    setLoadingServer(true);
    setIframeLoading(true);

    try {
      const res = await animeApi.getServer(server.serverId);
      if (res?.data?.url) {
        setCurrentStreamUrl(res.data.url);
        showToast(`Beralih ke ${server.title} (${qualityTitle})`, "info");
      } else {
        showToast("Server tidak mengembalikan URL streaming", "error");
      }
    } catch (err: any) {
      showToast("Gagal memuat server ini. Silakan coba server alternatif.", "error");
      if (defaultStreamingUrl && !currentStreamUrl) {
        setCurrentStreamUrl(defaultStreamingUrl);
      }
    } finally {
      setLoadingServer(false);
    }
  };

  const handleReloadIframe = () => {
    setIframeLoading(true);
    if (iframeRef.current) {
      const src = iframeRef.current.src;
      iframeRef.current.src = "";
      setTimeout(() => {
        if (iframeRef.current) iframeRef.current.src = src;
      }, 100);
    }
  };

  const handleToggleFullscreen = () => {
    if (!playerContainerRef.current) return;

    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().catch(() => {
        showToast("Fullscreen tidak didukung di browser ini", "error");
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div className={`space-y-4 transition-all duration-500 ${cinemaMode ? "relative z-50" : ""}`}>
      {/* Cinema Mode Global Dim Overlay */}
      {cinemaMode && (
        <div
          onClick={() => setCinemaMode(false)}
          className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-40 cursor-pointer"
        />
      )}

      {/* Main Video Player Container with Ambient Backglow */}
      <div
        ref={playerContainerRef}
        id="video-player-frame-container"
        className={`relative w-full rounded-3xl overflow-hidden bg-black border border-indigo-500/30 shadow-2xl shadow-black/80 transition-all ${
          cinemaMode ? "relative z-50 ring-4 ring-cyan-500/40" : ""
        }`}
      >
        {/* Ambient Backlight Glow Behind Screen */}
        <div className="absolute -top-10 -left-10 -right-10 -bottom-10 bg-gradient-to-r from-cyan-500/15 via-indigo-600/15 to-purple-600/15 rounded-3xl blur-2xl pointer-events-none -z-10" />

        {/* Video Aspect Ratio Frame */}
        <div className="relative aspect-video w-full bg-slate-950 flex items-center justify-center overflow-hidden">
          {currentStreamUrl ? (
            <>
              {iframeLoading && (
                <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center gap-3 z-10">
                  <div className="relative">
                    <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
                    <Sparkles className="w-4 h-4 text-purple-400 absolute top-0 right-0 animate-ping" />
                  </div>
                  <span className="text-xs font-bold text-slate-300 tracking-wide">
                    Menghubungkan ke Pemutar Video...
                  </span>
                </div>
              )}

              <iframe
                ref={iframeRef}
                src={currentStreamUrl}
                title={title}
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                onLoad={() => setIframeLoading(false)}
                className="w-full h-full border-0 absolute inset-0 z-0"
              />
            </>
          ) : (
            <div className="p-8 text-center space-y-3">
              <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto" />
              <p className="text-sm font-bold text-slate-300">
                URL Streaming belum tersedia atau server sedang mengalami gangguan.
              </p>
              <p className="text-xs text-slate-500">
                Silakan pilih server alternatif di bagian bawah pemutar.
              </p>
            </div>
          )}
        </div>

        {/* Video Player Quick Bar */}
        <div className="bg-slate-950/90 backdrop-blur-md px-4 py-2.5 border-t border-slate-800/80 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300 truncate">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="font-bold text-white truncate">{title}</span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Cinema Mode Toggle */}
            <button
              onClick={() => setCinemaMode(!cinemaMode)}
              className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                cinemaMode
                  ? "bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/30"
                  : "bg-slate-900 text-slate-300 hover:text-white border border-slate-800"
              }`}
              title="Mode Bioskop (Redupkan Lampu)"
            >
              {cinemaMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{cinemaMode ? "Normal" : "Bioskop"}</span>
            </button>

            {/* Reload Iframe */}
            <button
              onClick={handleReloadIframe}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors cursor-pointer"
              title="Muat Ulang Video"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Fullscreen Button */}
            <button
              onClick={handleToggleFullscreen}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors cursor-pointer"
              title="Layar Penuh"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Server & Quality Switcher Panel */}
      {qualities && qualities.length > 0 && (
        <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/80 border border-slate-800/90 backdrop-blur-xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white tracking-tight">Pilihan Server & Resolusi</h3>
                <p className="text-[11px] text-slate-400">Ganti server jika pemutar mengalami buffering atau lag</p>
              </div>
            </div>

            {loadingServer && (
              <span className="text-xs text-cyan-400 font-bold flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Menghubungkan Server...
              </span>
            )}
          </div>

          {/* Quality Categories & Server Buttons */}
          <div className="space-y-3 pt-1">
            {qualities.map((q) => (
              <div key={q.title} className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                  <span className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-indigo-300 font-mono">
                    {q.title}
                  </span>
                  <span>Server Tersedia:</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {q.serverList.map((srv) => {
                    const isSelected = selectedServerId === srv.serverId;
                    return (
                      <button
                        key={srv.serverId}
                        onClick={() => handleSelectServer(q.title, srv)}
                        disabled={loadingServer}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? "bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-lg shadow-cyan-500/25 ring-2 ring-cyan-400/40 font-black"
                            : "bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800"
                        }`}
                      >
                        <Server className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{srv.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
