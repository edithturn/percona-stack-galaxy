"use client";

import { useEffect, useState } from "react";

interface IntroScreenProps {
  onEnter: () => void;
}

export function IntroScreen({ onEnter }: IntroScreenProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Slight delay so CSS transition fires
    const id = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(id);
  }, []);

  return (
    <div
      className={`absolute inset-0 z-50 flex flex-col items-center justify-center
        bg-[#03040e] transition-opacity duration-700
        ${visible ? "opacity-100" : "opacity-0"}`}
    >
      {/* Animated background nebula blobs */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        aria-hidden
      >
        <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] rounded-full bg-blue-900/20 blur-[120px] animate-pulse-glow" />
        <div
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[400px] rounded-full bg-purple-900/20 blur-[100px] animate-pulse-glow"
          style={{ animationDelay: "1.2s" }}
        />
        <div
          className="absolute top-1/2 left-1/4 w-[400px] h-[300px] rounded-full bg-emerald-900/10 blur-[100px] animate-pulse-glow"
          style={{ animationDelay: "2.4s" }}
        />
      </div>

      {/* Star-field hint (pure CSS dots) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(1px 1px at 20% 30%, white 0%, transparent 100%)," +
            "radial-gradient(1px 1px at 60% 20%, white 0%, transparent 100%)," +
            "radial-gradient(1px 1px at 80% 60%, white 0%, transparent 100%)," +
            "radial-gradient(1px 1px at 40% 80%, white 0%, transparent 100%)," +
            "radial-gradient(1px 1px at 10% 70%, white 0%, transparent 100%)",
          opacity: 0.4,
        }}
        aria-hidden
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8 text-center px-6 animate-fade-in">
        {/* Logo / title cluster */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-3">
            {/* Percona brand accent */}
            <div className="w-3 h-3 rounded-full bg-blue-400 shadow-[0_0_12px_4px_rgba(96,165,250,0.7)]" />
            <span className="text-xs font-semibold tracking-[0.3em] uppercase text-blue-300/80">
              Percona Open Source
            </span>
            <div className="w-3 h-3 rounded-full bg-purple-400 shadow-[0_0_12px_4px_rgba(192,132,252,0.7)]" />
          </div>

          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-white leading-none">
            Stack{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #34d399 100%)",
              }}
            >
              Galaxy
            </span>
          </h1>

          <p className="max-w-md text-slate-400 text-base sm:text-lg leading-relaxed">
            Explore Percona&apos;s open source database ecosystem in an
            interactive 3D galaxy. Navigate products, discover releases, and
            understand how everything connects.
          </p>
        </div>

        {/* Stats row */}
        <div className="flex gap-8 text-center">
          {[
            { value: "11", label: "Products" },
            { value: "17", label: "Edges" },
            { value: "Live", label: "Release Data" },
          ].map(({ value, label }) => (
            <div key={label} className="flex flex-col gap-1">
              <span className="text-2xl font-bold text-white">{value}</span>
              <span className="text-xs text-slate-500 uppercase tracking-wider">{label}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={onEnter}
          className="group relative px-10 py-4 rounded-full text-white font-semibold text-lg
            bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500
            transition-all duration-300 shadow-[0_0_30px_rgba(96,165,250,0.35)]
            hover:shadow-[0_0_50px_rgba(96,165,250,0.6)] hover:scale-105 active:scale-95"
        >
          <span className="relative z-10">Enter the Galaxy</span>
          <div className="absolute inset-0 rounded-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>

        <p className="text-xs text-slate-600">
          Use scroll to zoom · drag to orbit · click planets to explore
        </p>
      </div>
    </div>
  );
}
