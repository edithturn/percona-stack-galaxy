"use client";

import { useState, useCallback } from "react";
import type { Category, FilterState, Product, Release, ReleaseTag, TimeWindow } from "@/types/galaxy";
import { filterByTimeWindow } from "@/lib/utils";

export function useFilters(): FilterState & {
  setTimeWindow: (w: TimeWindow) => void;
  toggleTag: (tag: ReleaseTag) => void;
  toggleCategory: (cat: Category) => void;
  clearFilters: () => void;
  filterProducts: (products: Product[]) => Product[];
  filterReleases: (releases: Release[]) => Release[];
} {
  const [timeWindow, setTimeWindow] = useState<TimeWindow>("all");
  const [activeTags, setActiveTags] = useState<ReleaseTag[]>([]);
  const [activeCategories, setActiveCategories] = useState<Category[]>([]);

  const toggleTag = useCallback((tag: ReleaseTag) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }, []);

  const toggleCategory = useCallback((cat: Category) => {
    setActiveCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }, []);

  const clearFilters = useCallback(() => {
    setTimeWindow("all");
    setActiveTags([]);
    setActiveCategories([]);
  }, []);

  const filterProducts = useCallback(
    (products: Product[]) => {
      if (activeCategories.length === 0) return products;
      return products.filter((p) => activeCategories.includes(p.category));
    },
    [activeCategories]
  );

  const filterReleases = useCallback(
    (releases: Release[]) => {
      let result = filterByTimeWindow(releases, timeWindow);
      if (activeTags.length > 0) {
        result = result.filter((r) => activeTags.some((tag) => r.tags.includes(tag)));
      }
      return result;
    },
    [timeWindow, activeTags]
  );

  return {
    timeWindow,
    activeTags,
    activeCategories,
    setTimeWindow,
    toggleTag,
    toggleCategory,
    clearFilters,
    filterProducts,
    filterReleases,
  };
}
