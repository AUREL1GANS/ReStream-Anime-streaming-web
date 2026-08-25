import React from "react";

export const AnimeCardSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col bg-slate-900/40 rounded-2xl overflow-hidden border border-slate-800/80 animate-pulse">
      <div className="aspect-[3/4] w-full bg-slate-800/60" />
      <div className="p-3.5 space-y-2">
        <div className="h-4 bg-slate-800 rounded w-4/5" />
        <div className="h-3 bg-slate-800/60 rounded w-3/5" />
        <div className="flex justify-between pt-2 border-t border-slate-800/60">
          <div className="h-2.5 bg-slate-800/60 rounded w-1/3" />
          <div className="h-2.5 bg-slate-800/60 rounded w-1/4" />
        </div>
      </div>
    </div>
  );
};

export const AnimeGridSkeleton: React.FC<{ count?: number }> = ({ count = 12 }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-5">
      {Array.from({ length: count }).map((_, idx) => (
        <AnimeCardSkeleton key={idx} />
      ))}
    </div>
  );
};

export const HeroBannerSkeleton: React.FC = () => {
  return (
    <div className="relative w-full h-[460px] sm:h-[520px] lg:h-[580px] bg-slate-900/60 rounded-3xl mb-10 overflow-hidden animate-pulse border border-slate-800">
      <div className="absolute inset-0 bg-slate-800/40" />
      <div className="relative h-full max-w-7xl mx-auto px-6 sm:px-10 flex flex-col justify-end pb-16">
        <div className="flex items-end gap-8">
          <div className="hidden sm:block w-44 h-64 bg-slate-800 rounded-2xl" />
          <div className="space-y-4 max-w-xl w-full">
            <div className="flex gap-2">
              <div className="w-24 h-6 bg-slate-800 rounded" />
              <div className="w-16 h-6 bg-slate-800 rounded" />
            </div>
            <div className="h-10 bg-slate-800 rounded w-3/4" />
            <div className="space-y-2">
              <div className="h-3.5 bg-slate-800/80 rounded w-full" />
              <div className="h-3.5 bg-slate-800/80 rounded w-4/5" />
            </div>
            <div className="flex gap-3 pt-2">
              <div className="w-36 h-12 bg-slate-800 rounded-xl" />
              <div className="w-28 h-12 bg-slate-800 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const WatchPlayerSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="aspect-video w-full bg-slate-900 rounded-2xl border border-slate-800" />
      <div className="h-8 bg-slate-800 rounded w-1/2" />
      <div className="flex gap-2">
        <div className="h-10 bg-slate-800 rounded-xl w-28" />
        <div className="h-10 bg-slate-800 rounded-xl w-28" />
        <div className="h-10 bg-slate-800 rounded-xl w-28" />
      </div>
    </div>
  );
};
