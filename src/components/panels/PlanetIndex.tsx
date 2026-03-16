"use client";

import { useState } from "react";
import type { Product } from "@/types/galaxy";
import { PLANET_COLORS, relativeTime } from "@/lib/utils";

const GROUPS: { label: string; ids: string[] }[] = [
  { label: "Observability",  ids: ["pmm"] },
  { label: "Databases",      ids: ["ppg", "psmysql", "pxc", "psmdb", "valkey"] },
  { label: "Operators",      ids: ["pg-operator", "mysql-operator", "pxc-operator", "psmdb-operator"] },
  { label: "Tools",          ids: ["toolkit"] },
];

interface PlanetIndexProps {
  products: Product[];
  selectedProduct: Product | null;
  onSelectProduct: (p: Product) => void;
  recentlyViewed: Product[];
}

export function PlanetIndex({
  products, selectedProduct, onSelectProduct, recentlyViewed,
}: PlanetIndexProps) {
  const [open, setOpen] = useState(true);

  const byId = Object.fromEntries(products.map((p) => [p.id, p]));

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        title="Open planet index"
        className="absolute left-0 top-1/2 -translate-y-1/2 z-30 flex items-center justify-center w-5 h-14 bg-[#03040e]/80 border border-white/10 border-l-0 rounded-r-lg text-slate-500 hover:text-slate-300 hover:bg-white/10 transition-all"
      >
        <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor">
          <path d="M1 0l6 4-6 4z" />
        </svg>
      </button>
    );
  }

  return (
    <aside className="absolute left-0 top-[44px] bottom-0 z-30 w-[216px] flex flex-col bg-[#03040e]/92 border-r border-white/8 backdrop-blur-md overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/8 shrink-0">
        <div className="flex items-center gap-2">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-slate-400">
            <circle cx="6" cy="6" r="2.5" fill="currentColor" opacity="0.8" />
            <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1" opacity="0.3" />
          </svg>
          <span className="text-[10px] font-semibold text-slate-400 tracking-widest uppercase">
            Planet Index
          </span>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="text-slate-600 hover:text-slate-300 transition-colors"
        >
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M9 3L3 9M3 3l6 6" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Planet list */}
      <div className="flex-1 overflow-y-auto py-1.5 px-1.5">
        {GROUPS.map(({ label, ids }) => {
          const group = ids.map((id) => byId[id]).filter(Boolean);
          if (group.length === 0) return null;
          return (
            <div key={label} className="mb-2">
              <p className="px-3 pt-1.5 pb-1 text-[9px] font-bold text-slate-600 tracking-widest uppercase">
                {label}
              </p>
              {group.map((p) => {
                const color   = PLANET_COLORS[p.id] ?? "#888";
                const latest  = p.releases[0];
                const active  = selectedProduct?.id === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => onSelectProduct(p)}
                    className={`w-full flex items-start gap-2.5 px-3 py-1.5 rounded-lg text-left transition-all duration-150 ${
                      active
                        ? "bg-white/10 text-white"
                        : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                    }`}
                  >
                    <span
                      className="mt-[3px] shrink-0 w-2 h-2 rounded-full"
                      style={{ background: color, boxShadow: `0 0 5px ${color}99` }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-medium leading-snug truncate">{p.name}</div>
                      {latest && (
                        <div className="text-[9px] text-slate-500 mt-0.5 leading-tight">
                          v{latest.version}&nbsp;·&nbsp;{relativeTime(latest.date)}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Recently viewed */}
      {recentlyViewed.length > 0 && (
        <div className="border-t border-white/8 px-1.5 py-2 shrink-0">
          <p className="px-3 pb-1 text-[9px] font-bold text-slate-600 tracking-widest uppercase">
            Recently viewed
          </p>
          {recentlyViewed.map((p) => (
            <button
              key={p.id}
              onClick={() => onSelectProduct(p)}
              className="w-full flex items-center gap-2 px-3 py-1 rounded-lg text-left text-slate-500 hover:text-slate-200 hover:bg-white/5 transition-all"
            >
              <span
                className="shrink-0 w-1.5 h-1.5 rounded-full"
                style={{ background: PLANET_COLORS[p.id] ?? "#888" }}
              />
              <span className="text-[10px] truncate">{p.shortName}</span>
            </button>
          ))}
        </div>
      )}
    </aside>
  );
}
