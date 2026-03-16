"use client";

import { useEffect, useRef, useState } from "react";
import { X, BookOpen, GitBranch, Activity, Star, GitFork, CircleDot, Clock, MessageSquare, Rss, ExternalLink } from "lucide-react";
import type { Product, Release } from "@/types/galaxy";
import { CATEGORY_COLORS, CATEGORY_BG, CATEGORY_LABELS, getActivityScore, relativeTime } from "@/lib/utils";
import { ReleaseCard } from "./ReleaseCard";

function fmtNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

interface ProductPanelProps {
  product: Product;
  filteredReleases: Release[];
  onClose: () => void;
}

export function ProductPanel({ product, filteredReleases, onClose }: ProductPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const color = CATEGORY_COLORS[product.category];
  const activityScore = getActivityScore(product.releases);
  const DEFAULT_SHOWN = 3;
  const [showAll, setShowAll] = useState(false);

  // Reset "show all" when switching products
  useEffect(() => { setShowAll(false); }, [product.id]);

  // Scroll to top when product changes
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [product.id]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div className="absolute top-[50px] right-0 h-[calc(100%-50px)] w-full sm:w-[380px] lg:w-[420px] z-30 flex flex-col animate-slide-in">
      <div
        className="flex flex-col h-full overflow-hidden"
        style={{
          background: "var(--panel-bg)",
          backdropFilter: "blur(16px)",
          borderLeft: "1px solid var(--border)",
        }}
      >
        {/* Colored top accent */}
        <div className="h-1 w-full" style={{ background: color }} />

        {/* Header */}
        <div className="flex items-start justify-between p-5 pb-3 shrink-0">
          <div className="flex flex-col gap-2 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full border"
                style={{
                  color: color,
                  borderColor: `${color}50`,
                  background: `${color}18`,
                }}
              >
                {CATEGORY_LABELS[product.category]}
              </span>
            </div>
            <h2 className="text-lg font-bold leading-tight" style={{ color: "var(--text)" }}>{product.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="ml-3 mt-0.5 p-1.5 rounded-lg transition-colors shrink-0"
            style={{ color: "var(--text-muted)" }}
            aria-label="Close panel"
          >
            <X size={16} />
          </button>
        </div>

        {/* Description */}
        <div className="px-5 pb-4 shrink-0">
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{product.description}</p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 px-5 pb-4 shrink-0">
          {product.docsUrl && (
            <a
              href={product.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg transition-all"
              style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-muted)" }}
            >
              <BookOpen size={13} />
              View Docs
            </a>
          )}
          {product.repoUrl && (
            <a
              href={product.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg transition-all"
              style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-muted)" }}
            >
              <GitBranch size={13} />
              GitHub
            </a>
          )}
          {product.forumUrl && (
            <a
              href={product.forumUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg transition-all"
              style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-muted)" }}
            >
              <MessageSquare size={13} />
              Forum
            </a>
          )}
        </div>

        {/* Vital Signs */}
        {product.vitals && (
          <div className="mx-5 mb-4 shrink-0 rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
            {/* Section header */}
            <div className="px-3 py-2 flex items-center gap-1.5" style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
              <Activity size={11} style={{ color: color }} />
              <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                Vital Signs
              </span>
            </div>
            {/* Stats grid */}
            <div className="grid grid-cols-2">
              {/* Row 1: Stars | Forks */}
              <div className="flex items-center gap-2 px-3 py-2.5" style={{ borderRight: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
                <Star size={13} style={{ color: "#f59e0b" }} />
                <div>
                  <div className="text-sm font-bold leading-none" style={{ color: "var(--text)" }}>{fmtNum(product.vitals.stars)}</div>
                  <div className="text-[9px] mt-0.5" style={{ color: "var(--text-faint)" }}>Stars</div>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-2.5" style={{ borderBottom: "1px solid var(--border)" }}>
                <GitFork size={13} style={{ color: "#60a5fa" }} />
                <div>
                  <div className="text-sm font-bold leading-none" style={{ color: "var(--text)" }}>{fmtNum(product.vitals.forks)}</div>
                  <div className="text-[9px] mt-0.5" style={{ color: "var(--text-faint)" }}>Forks</div>
                </div>
              </div>
              {/* Row 2: Open Issues | Open PRs */}
              <div className="flex items-center gap-2 px-3 py-2.5" style={{ borderRight: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
                <CircleDot size={13} style={{ color: "#f87171" }} />
                <div>
                  <div className="text-sm font-bold leading-none" style={{ color: "var(--text)" }}>{fmtNum(product.vitals.openIssues)}</div>
                  <div className="text-[9px] mt-0.5" style={{ color: "var(--text-faint)" }}>Open Issues</div>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-2.5" style={{ borderBottom: "1px solid var(--border)" }}>
                <GitBranch size={13} style={{ color: "#34d399" }} />
                <div>
                  <div className="text-sm font-bold leading-none" style={{ color: "var(--text)" }}>{fmtNum(product.vitals.openPRs)}</div>
                  <div className="text-[9px] mt-0.5" style={{ color: "var(--text-faint)" }}>Open PRs</div>
                </div>
              </div>
              {/* Row 3: Last Commit — full width */}
              <div className="col-span-2 flex items-center gap-2 px-3 py-2.5">
                <Clock size={13} style={{ color: "#a78bfa" }} />
                <div>
                  <div className="text-sm font-bold leading-none" style={{ color: "var(--text)" }}>{relativeTime(product.vitals.lastCommit)}</div>
                  <div className="text-[9px] mt-0.5" style={{ color: "var(--text-faint)" }}>Last Commit</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Activity indicator bar */}
        <div className="px-5 pb-4 shrink-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Release Activity
            </span>
            <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
              {product.releases.length} total · {filteredReleases.length} visible
            </span>
          </div>
          <div className="h-1 w-full rounded-full" style={{ background: "var(--border)" }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${activityScore * 100}%`, background: color }}
            />
          </div>
        </div>

        {/* Separator */}
        <div className="mx-5 mb-3 shrink-0" style={{ borderTop: "1px solid var(--border)" }} />

        {/* Releases list */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 pb-5 flex flex-col gap-3 min-h-0">
          {/* Section header */}
          <div className="flex items-center justify-between shrink-0">
            <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Releases
            </h3>
            <span className="text-[10px]" style={{ color: "var(--text-faint)" }}>
              {filteredReleases.length} total
            </span>
          </div>

          {filteredReleases.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
              <span className="text-2xl">🪐</span>
              <p className="text-sm text-slate-500">No releases match the current filters.</p>
            </div>
          ) : (
            <>
              {(showAll ? filteredReleases : filteredReleases.slice(0, DEFAULT_SHOWN)).map((release, i) => (
                <div key={i} className="shrink-0">
                  <ReleaseCard release={release} />
                </div>
              ))}

              {filteredReleases.length > DEFAULT_SHOWN && (
                <button
                  onClick={() => setShowAll((v) => !v)}
                  className="shrink-0 w-full py-2 rounded-lg text-xs font-medium transition-colors"
                  style={{ color: "var(--text-muted)", border: "1px solid var(--border)" }}
                >
                  {showAll
                    ? "Show less"
                    : `Show ${filteredReleases.length - DEFAULT_SHOWN} more release${filteredReleases.length - DEFAULT_SHOWN > 1 ? "s" : ""}`}
                </button>
              )}
            </>
          )}

          {/* From the Blog */}
          {product.blogPosts.length > 0 && (
            <div className="shrink-0 mt-2">
              <div className="flex items-center gap-1.5 mb-2">
                <Rss size={11} style={{ color: color }} />
                <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                  From the Blog
                </h3>
              </div>
              <div className="flex flex-col gap-2">
                {product.blogPosts.map((post, i) => (
                  <a
                    key={i}
                    href={post.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start justify-between gap-2 p-3 rounded-lg group transition-colors"
                    style={{ border: "1px solid var(--border)" }}
                  >
                    <div className="flex flex-col gap-1.5 min-w-0">
                      <span className="text-xs font-medium leading-snug line-clamp-2 transition-colors" style={{ color: "var(--text-muted)" }}>
                        {post.title}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {post.author && (
                          <span className="text-[10px] font-semibold" style={{ color: "var(--text-muted)" }}>
                            {post.author}
                          </span>
                        )}
                        <span className="text-[10px]" style={{ color: "var(--text-faint)" }}>
                          · {relativeTime(post.date)}
                        </span>
                      </div>
                    </div>
                    <ExternalLink size={11} className="shrink-0 mt-0.5 opacity-40 group-hover:opacity-80 transition-opacity" style={{ color: "var(--text-muted)" }} />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
