"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// GalaxyApp uses WebGL / window — never run on the server.
const GalaxyApp = dynamic(() => import("@/components/GalaxyApp"), { ssr: false });

function LoadingScreen() {
  return (
    <div className="flex h-screen items-center justify-center bg-[#03040e]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 rounded-full border-2 border-blue-400/30 border-t-blue-400 animate-spin" />
        <p className="text-sm text-slate-500">Initialising galaxy…</p>
      </div>
    </div>
  );
}

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Server renders <LoadingScreen />.
  // Client initial render (hydration pass) also returns <LoadingScreen /> — they match.
  // After useEffect fires, mounted → true and <GalaxyApp /> takes over client-side only.
  if (!mounted) return <LoadingScreen />;
  return <GalaxyApp />;
}
