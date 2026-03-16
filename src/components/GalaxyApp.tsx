"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import type { Product } from "@/types/galaxy";
import { useGalaxyData } from "@/hooks/useGalaxyData";
import { useFilters } from "@/hooks/useFilters";
import { GalaxyCanvas } from "./galaxy/GalaxyCanvas";
import { IntroScreen } from "./panels/IntroScreen";
import { ProductPanel } from "./panels/ProductPanel";
import { FilterToolbar } from "./panels/FilterToolbar";
import { PlanetStrip } from "./panels/PlanetStrip";
import { LatestReleasesFeed } from "./panels/LatestReleasesFeed";
import { EcosystemPanel } from "./panels/EcosystemPanel";
import type { EcosystemContribution } from "./galaxy/EcosystemZone";

export default function GalaxyApp() {
  const { data, loading, error } = useGalaxyData();
  const [showIntro, setShowIntro] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [recenterKey, setRecenterKey] = useState(0);
  const [panMode, setPanMode] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [showFeed, setShowFeed] = useState(false);
  const [selectedContribution, setSelectedContribution] = useState<EcosystemContribution | null>(null);
  const zoomDeltaRef = useRef(0);

  // Apply theme class to <html>
  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
  }, [theme]);

  // Reset body cursor when switching modes
  useEffect(() => {
    document.body.style.cursor = "default";
  }, [panMode]);

  // URL deep link: auto-select product from ?product=xxx on load
  useEffect(() => {
    if (!data) return;
    const id = new URLSearchParams(window.location.search).get("product");
    if (id) {
      const p = data.products.find((x) => x.id === id);
      if (p) setSelectedProduct(p);
    }
  }, [data]);

  // URL deep link: keep ?product=xxx in sync with selection
  useEffect(() => {
    const url = new URL(window.location.href);
    if (selectedProduct) {
      url.searchParams.set("product", selectedProduct.id);
    } else {
      url.searchParams.delete("product");
    }
    window.history.replaceState({}, "", url.toString());
  }, [selectedProduct]);

  const {
    timeWindow,
    activeTags,
    activeCategories,
    setTimeWindow,
    toggleTag,
    toggleCategory,
    clearFilters,
    filterProducts,
    filterReleases,
  } = useFilters();

  const visibleProducts = useMemo(
    () => (data ? filterProducts(data.products) : []),
    [data, filterProducts]
  );

  const visibleProductIds = useMemo(
    () => new Set(visibleProducts.map((p) => p.id)),
    [visibleProducts]
  );

  const filteredReleases = useMemo(
    () => (selectedProduct ? filterReleases(selectedProduct.releases) : []),
    [selectedProduct, filterReleases]
  );

  const handleSelectProduct = useCallback((p: Product) => {
    setSelectedProduct((prev) => (prev?.id === p.id ? null : p));
    setSelectedContribution(null);
  }, []);

  const handleDeselect = useCallback(() => { setSelectedProduct(null); setSelectedContribution(null); }, []);
  const handleSelectContribution = useCallback((c: EcosystemContribution) => {
    setSelectedContribution(c);
    setSelectedProduct(null);
    setShowFeed(false);
  }, []);

  const handleRecenter = useCallback(() => {
    setSelectedProduct(null);
    setRecenterKey((k) => k + 1);
  }, []);

  // ── Loading / Error states ──────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ background: "var(--bg)" }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full border-2 border-blue-400/30 border-t-blue-400 animate-spin" />
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Loading galaxy data…</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ background: "var(--bg)" }}>
        <div className="flex flex-col items-center gap-3 text-center px-6">
          <span className="text-3xl">🚨</span>
          <p className="font-semibold" style={{ color: "var(--text)" }}>Failed to load galaxy data</p>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>{error ?? "Unknown error"}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 text-sm rounded-lg bg-white/10 hover:bg-white/15 transition-colors"
            style={{ color: "var(--text)" }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ── Main render ─────────────────────────────────────────────────────────
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "var(--bg)" }}>
      {/* Cinematic intro */}
      {showIntro && (
        <IntroScreen
          onEnter={() => {
            setShowIntro(false);
          }}
        />
      )}

      {/* 3D Canvas — always mounted so Three.js context persists */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ${
          showIntro ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        {/* Top toolbar */}
        <FilterToolbar />


        {/* Canvas — fills remaining space */}
        <div
          className="absolute inset-0 pt-[50px]"
          style={{ cursor: panMode ? "grab" : "default" }}
        >
          <GalaxyCanvas
            data={data}
            selectedProduct={selectedProduct}
            visibleProductIds={visibleProductIds}
            onSelectProduct={handleSelectProduct}
            onSelectContribution={handleSelectContribution}
            onDeselect={handleDeselect}
            recenterKey={recenterKey}
            panMode={panMode}
            theme={theme}
            zoomDeltaRef={zoomDeltaRef}
          />
        </div>

        {/* Right-side product panel */}
        {selectedProduct && (
          <ProductPanel
            product={selectedProduct}
            filteredReleases={filteredReleases}
            onClose={handleDeselect}
          />
        )}

        {/* Ecosystem contribution panel */}
        {selectedContribution && (
          <EcosystemPanel
            contribution={selectedContribution}
            onClose={() => setSelectedContribution(null)}
          />
        )}

        {/* Latest releases feed */}
        {showFeed && !selectedProduct && !selectedContribution && (
          <LatestReleasesFeed products={data.products} onClose={() => setShowFeed(false)} />
        )}

        {/* Bottom-right legend card */}
        <PlanetStrip products={data.products} />

        {/* Top-left vertical icon toolbar — below the header bar */}
        <div className="absolute top-[58px] left-4 z-30 flex flex-col items-start">
          <div
            className="flex flex-col rounded-xl overflow-hidden backdrop-blur-sm"
            style={{ background: "var(--ctrl-bg)", border: "1px solid var(--border)" }}
          >
            {/* Zoom in */}
            <button
              onClick={() => { zoomDeltaRef.current += 1; }}
              title="Zoom in"
              className="w-9 h-9 flex items-center justify-center transition-colors hover:bg-white/10"
              style={{ color: "var(--text-muted)" }}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <line x1="8" y1="3" x2="8" y2="13" />
                <line x1="3" y1="8" x2="13" y2="8" />
              </svg>
            </button>

            {/* Divider */}
            <div style={{ height: "1px", background: "var(--border)" }} />

            {/* Zoom out */}
            <button
              onClick={() => { zoomDeltaRef.current -= 1; }}
              title="Zoom out"
              className="w-9 h-9 flex items-center justify-center transition-colors hover:bg-white/10"
              style={{ color: "var(--text-muted)" }}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <line x1="3" y1="8" x2="13" y2="8" />
              </svg>
            </button>

            {/* Divider */}
            <div style={{ height: "1px", background: "var(--border)" }} />

            {/* Reset view */}
            <button
              onClick={handleRecenter}
              title="Reset view"
              className="w-9 h-9 flex items-center justify-center transition-colors hover:bg-white/10"
              style={{ color: "var(--text-muted)" }}
            >
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <circle cx="8" cy="8" r="4.5" />
                <line x1="8" y1="1" x2="8" y2="3.5" />
                <line x1="8" y1="12.5" x2="8" y2="15" />
                <line x1="1" y1="8" x2="3.5" y2="8" />
                <line x1="12.5" y1="8" x2="15" y2="8" />
              </svg>
            </button>

            {/* Divider */}
            <div style={{ height: "1px", background: "var(--border)" }} />

            {/* Pan / Select toggle */}
            <button
              onClick={() => setPanMode((m) => !m)}
              title={panMode ? "Switch to select mode" : "Switch to pan mode"}
              className="w-9 h-9 flex items-center justify-center transition-colors hover:bg-white/10"
              style={{ color: panMode ? "#60a5fa" : "var(--text-muted)" }}
            >
              {panMode ? (
                /* Open hand — pan mode active */
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8.5 1.75a.75.75 0 0 0-1.5 0V7H6V3.25a.75.75 0 0 0-1.5 0V7h-.5V4.75a.75.75 0 0 0-1.5 0V10a5 5 0 0 0 5 5h.5a5 5 0 0 0 5-5V7.25a.75.75 0 0 0-1.5 0V7h-.5V3.25a.75.75 0 0 0-1.5 0V7h-.5V1.75z" />
                </svg>
              ) : (
                /* Arrow cursor — select mode */
                <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M14.082 2.182a.5.5 0 0 1 .103.557L8.528 15.467a.5.5 0 0 1-.917-.007L5.57 10.694.803 8.652a.5.5 0 0 1-.006-.916l12.728-5.657a.5.5 0 0 1 .556.103z" />
                </svg>
              )}
            </button>

            {/* Divider */}
            <div style={{ height: "1px", background: "var(--border)" }} />

            {/* Latest releases feed toggle */}
            <button
              onClick={() => { setShowFeed((v) => !v); setSelectedProduct(null); }}
              title={showFeed ? "Close releases feed" : "Latest releases feed"}
              className="w-9 h-9 flex items-center justify-center transition-colors hover:bg-white/10"
              style={{ color: showFeed ? "#60a5fa" : "var(--text-muted)" }}
            >
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="3" cy="13" r="1" fill="currentColor" stroke="none" />
                <path d="M1 8.5A6.5 6.5 0 018.5 15" />
                <path d="M1 4A11 11 0 0112 15" />
              </svg>
            </button>

            {/* Divider */}
            <div style={{ height: "1px", background: "var(--border)" }} />

            {/* Theme toggle */}
            <button
              onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              className="w-9 h-9 flex items-center justify-center transition-colors hover:bg-white/10"
              style={{ color: "var(--text-muted)" }}
            >
              {theme === "light" ? (
                /* Moon — click to go dark */
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 0 1 .81.316.733.733 0 0 1-.031.893A8.349 8.349 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 0 1 6 .278z" />
                </svg>
              ) : (
                /* Sun — click to go light */
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                  <circle cx="8" cy="8" r="3" />
                  <line x1="8" y1="1" x2="8" y2="2.5" />
                  <line x1="8" y1="13.5" x2="8" y2="15" />
                  <line x1="1" y1="8" x2="2.5" y2="8" />
                  <line x1="13.5" y1="8" x2="15" y2="8" />
                  <line x1="2.9" y1="2.9" x2="4" y2="4" />
                  <line x1="12" y1="12" x2="13.1" y2="13.1" />
                  <line x1="2.9" y1="13.1" x2="4" y2="12" />
                  <line x1="12" y1="4" x2="13.1" y2="2.9" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
