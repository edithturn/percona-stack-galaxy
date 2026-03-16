"use client";

import { ExternalLink, TriangleAlert } from "lucide-react";
import type { Release } from "@/types/galaxy";
import { TAG_STYLES, formatDate, relativeTime } from "@/lib/utils";

interface ReleaseCardProps {
  release: Release;
}

export function ReleaseCard({ release }: ReleaseCardProps) {
  return (
    <div
      className="rounded-lg p-4 flex flex-col gap-3 transition-colors"
      style={{ border: "1px solid var(--border)", background: "var(--surface)" }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-sm font-semibold" style={{ color: "var(--text)" }}>
            {release.version}
          </span>
          <span className="text-xs" style={{ color: "var(--text-faint)" }}>
            {formatDate(release.date)} · {relativeTime(release.date)}
          </span>
        </div>
        {release.url && (
          <a
            href={release.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs transition-colors shrink-0"
            style={{ color: "var(--text-muted)" }}
          >
            <ExternalLink size={12} />
            <span className="hidden sm:inline">Notes</span>
          </a>
        )}
      </div>

      {/* Breaking change banner */}
      {release.tags.includes("breaking") && (
        <a
          href={release.url || undefined}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 rounded-lg transition-opacity hover:opacity-80"
          style={{ background: "rgba(249,115,22,0.12)", border: "1px solid rgba(249,115,22,0.35)" }}
        >
          <TriangleAlert size={13} style={{ color: "#f97316" }} className="shrink-0" />
          <span className="text-xs font-medium" style={{ color: "#f97316" }}>
            Breaking changes — review before upgrading
          </span>
        </a>
      )}

      {/* Tags */}
      {release.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {release.tags.map((tag) => (
            <span
              key={tag}
              className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${TAG_STYLES[tag]}`}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Highlights */}
      {release.highlights.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {release.highlights.map((h, i) => (
            <li key={i} className="flex items-start gap-2 text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
              <span className="mt-1 w-1 h-1 rounded-full shrink-0" style={{ background: "var(--text-faint)" }} />
              {h}
            </li>
          ))}
        </ul>
      )}

      {/* Notes snippet */}
      {release.notesSnippet && release.highlights.length === 0 && (
        <p className="text-xs leading-relaxed line-clamp-3" style={{ color: "var(--text-muted)" }}>
          {release.notesSnippet}
        </p>
      )}
    </div>
  );
}
