"use client";

import { X, TriangleAlert } from "lucide-react";
import type { Product } from "@/types/galaxy";
import { PLANET_COLORS, TAG_STYLES, formatDate, relativeTime } from "@/lib/utils";

interface FeedItem {
  product: Product;
  version: string;
  date: string;
  tags: string[];
  url: string | null;
}

interface LatestReleasesFeedProps {
  products: Product[];
  onClose: () => void;
}

export function LatestReleasesFeed({ products, onClose }: LatestReleasesFeedProps) {
  // Flatten all releases with their product, sort by date desc
  const items: FeedItem[] = products
    .flatMap((p) =>
      p.releases.map((r) => ({
        product: p,
        version: r.version,
        date: r.date,
        tags: r.tags,
        url: r.url,
      }))
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 60);

  return (
    <div className="absolute top-0 right-0 h-full w-full sm:w-[380px] lg:w-[420px] z-30 flex flex-col animate-slide-in">
      <div
        className="flex flex-col h-full overflow-hidden"
        style={{
          background: "var(--panel-bg)",
          backdropFilter: "blur(16px)",
          borderLeft: "1px solid var(--border)",
        }}
      >
        {/* Accent bar */}
        <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899)" }} />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 shrink-0" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#60a5fa" }}>
              <circle cx="3" cy="13" r="1" fill="currentColor" stroke="none" />
              <path d="M1 8.5A6.5 6.5 0 018.5 15" />
              <path d="M1 4A11 11 0 0112 15" />
            </svg>
            <h2 className="text-sm font-semibold" style={{ color: "var(--text)" }}>Latest Releases</h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "var(--surface)", color: "var(--text-faint)", border: "1px solid var(--border)" }}>
              All products
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close feed"
          >
            <X size={16} />
          </button>
        </div>

        {/* Feed list */}
        <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2 min-h-0">
          {items.map((item, i) => {
            const color = PLANET_COLORS[item.product.id] ?? "#8888ff";
            const isSecurity = item.tags.includes("security");
            const isBreaking = item.tags.includes("breaking");
            return (
              <div
                key={i}
                className="flex flex-col gap-2 p-3 rounded-lg transition-colors hover:bg-white/4"
                style={{
                  border: `1px solid ${isSecurity ? "rgba(239,68,68,0.3)" : isBreaking ? "rgba(249,115,22,0.25)" : "var(--border)"}`,
                  background: isSecurity ? "rgba(239,68,68,0.05)" : isBreaking ? "rgba(249,115,22,0.04)" : undefined,
                }}
              >
                {/* Product + version row */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {/* Color dot */}
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{
                        background: color,
                        boxShadow: `0 0 5px ${color}88`,
                      }}
                    />
                    <span className="text-xs font-medium truncate" style={{ color: "var(--text-muted)" }}>
                      {item.product.shortName}
                    </span>
                    <span className="font-mono text-xs font-semibold shrink-0" style={{ color: "var(--text)" }}>
                      {item.version}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px]" style={{ color: "var(--text-faint)" }}>
                      {relativeTime(item.date)}
                    </span>
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-slate-500 hover:text-blue-300 transition-colors"
                        title="Release notes"
                      >
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M7 1h4v4M11 1L5 7M4 2H2a1 1 0 00-1 1v7a1 1 0 001 1h7a1 1 0 001-1V8" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>

                {/* Alerts */}
                {isSecurity && (
                  <div className="flex items-center gap-1.5 text-[10px]" style={{ color: "#ef4444" }}>
                    <TriangleAlert size={10} />
                    Security release
                  </div>
                )}
                {!isSecurity && isBreaking && (
                  <div className="flex items-center gap-1.5 text-[10px]" style={{ color: "#f97316" }}>
                    <TriangleAlert size={10} />
                    Breaking changes
                  </div>
                )}

                {/* Tags */}
                {item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`text-[9px] font-semibold uppercase tracking-wider px-1.5 py-px rounded-full ${(TAG_STYLES as Record<string, string>)[tag] ?? "bg-white/8 text-slate-400"}`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Date */}
                <span className="text-[10px]" style={{ color: "var(--text-faint)" }}>
                  {formatDate(item.date)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
