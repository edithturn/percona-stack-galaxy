import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Category, EdgeType, ReleaseTag, Release, TimeWindow } from "@/types/galaxy";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Visual constants ────────────────────────────────────────────────────────

export const CATEGORY_COLORS: Record<Category, string> = {
  database: "#3B82F6",
  operator: "#8B5CF6",
  observability: "#10B981",
  tools: "#EC4899",
};

export const CATEGORY_LABELS: Record<Category, string> = {
  database: "DB Server",
  operator: "Operator",
  observability: "Observability",
  tools: "Tools",
};

export const CATEGORY_BG: Record<Category, string> = {
  database: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  operator: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  observability: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  tools: "bg-pink-500/20 text-pink-300 border-pink-500/30",
};

export const TAG_STYLES: Record<ReleaseTag, string> = {
  security: "bg-red-500/15 text-red-600 border border-red-500/40",
  breaking: "bg-orange-500/15 text-orange-600 border border-orange-500/40",
  feature: "bg-blue-500/15 text-blue-600 border border-blue-500/40",
  fix: "bg-green-500/15 text-green-700 border border-green-500/40",
};

export const EDGE_COLORS: Record<EdgeType, string> = {
  monitors: "#10B981",
  manages: "#8B5CF6",
  toolsFor: "#EC4899",
  accelerates: "#F59E0B",
};

export const PLANET_RADIUS: Record<Category, number> = {
  database: 1.0,
  operator: 0.72,
  observability: 1.25,
  tools: 0.72,
};

// Scale factor: YAML coords → Three.js world units
export const COORD_SCALE = 3;

// ─── Release utilities ───────────────────────────────────────────────────────

export function filterByTimeWindow(releases: Release[], window: TimeWindow): Release[] {
  if (window === "all") return releases;
  const now = Date.now();
  const ms = { "30d": 30, "90d": 90, "1y": 365 }[window] * 86_400_000;
  return releases.filter((r) => now - new Date(r.date).getTime() <= ms);
}

/** Returns 0–1 activity score based on recency of releases. */
export function getActivityScore(releases: Release[]): number {
  const now = Date.now();
  let score = 0;
  for (const r of releases) {
    const days = (now - new Date(r.date).getTime()) / 86_400_000;
    if (days <= 30) score += 1.0;
    else if (days <= 90) score += 0.6;
    else if (days <= 365) score += 0.25;
  }
  return Math.min(1, score / 3);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function relativeTime(dateStr: string): string {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

// Per-product base colors (keyed by product.id)
export const PLANET_COLORS: Record<string, string> = {
  psmdb: "#16a34a",
  "psmdb-operator": "#4ade80",
  ppg: "#1d4ed8",
  "pg-operator": "#38bdf8",
  psmysql: "#991b1b",
  "mysql-operator": "#f97316",
  pxc: "#7f1d1d",
  "pxc-operator": "#dc2626",
  pmm: "#ea580c",
  toolkit: "#0ea5e9",
};

// Per-product material settings
export const PLANET_MATERIAL: Record<string, { roughness: number; metalness: number; clearcoat?: number }> = {
  psmdb:            { roughness: 0.65, metalness: 0.10 },
  "psmdb-operator": { roughness: 0.35, metalness: 0.30, clearcoat: 0.7 },
  ppg:              { roughness: 0.70, metalness: 0.05 },
  "pg-operator":    { roughness: 0.50, metalness: 0.15, clearcoat: 0.3 },
  psmysql:          { roughness: 0.75, metalness: 0.05 },
  "mysql-operator": { roughness: 0.55, metalness: 0.15, clearcoat: 0.2 },
  pxc:              { roughness: 0.35, metalness: 0.55 },
  "pxc-operator":   { roughness: 0.45, metalness: 0.35, clearcoat: 0.2 },
  pmm:              { roughness: 0.60, metalness: 0.10 },
  toolkit:          { roughness: 0.60, metalness: 0.15 },
};
