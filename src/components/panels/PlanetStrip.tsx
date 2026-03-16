"use client";

import { CATEGORY_COLORS } from "@/lib/utils";
import type { Product } from "@/types/galaxy";

const ORBITS = [
  { category: "database",     label: "Databases",     color: CATEGORY_COLORS.database },
  { category: "operator",     label: "Operators",     color: CATEGORY_COLORS.operator },
  { category: "observability",label: "Observability", color: CATEGORY_COLORS.observability },
  { category: "tools",        label: "Tools",         color: CATEGORY_COLORS.tools },
] as const;

interface PlanetStripProps {
  products: Product[];
}

function OrbitArc({ color }: { color: string }) {
  return (
    <svg width="26" height="9" viewBox="0 0 26 9" fill="none">
      <path
        d="M 1,7 Q 13,1 25,7"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="4 2.5"
        opacity="0.9"
      />
    </svg>
  );
}

export function PlanetStrip({ products }: PlanetStripProps) {
  const countByCategory = (cat: string) =>
    products.filter((p) => p.category === cat).length;

  return (
    <div
      className="absolute bottom-4 left-4 z-20 flex flex-col gap-2.5 px-4 py-3 rounded-xl"
      style={{
        background: "var(--panel-bg)",
        backdropFilter: "blur(14px)",
        border: "1px solid var(--border)",
      }}
    >
      <span
        className="text-[9px] font-semibold uppercase tracking-widest"
        style={{ color: "var(--text-faint)" }}
      >
        Orbits
      </span>

      {ORBITS.map(({ category, label, color }) => (
        <div key={category} className="flex items-center gap-2.5">
          <OrbitArc color={color} />
          <span className="text-[11px] font-medium flex-1" style={{ color: "var(--text-muted)" }}>
            {label}
          </span>
          <span
            className="text-[10px] font-semibold tabular-nums px-1.5 py-0.5 rounded-md"
            style={{ color, background: `${color}18` }}
          >
            {countByCategory(category)}
          </span>
        </div>
      ))}
    </div>
  );
}
