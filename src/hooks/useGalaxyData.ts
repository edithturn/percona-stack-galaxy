"use client";

import { useState, useEffect } from "react";
import type { GalaxyData } from "@/types/galaxy";

export function useGalaxyData() {
  const [data, setData] = useState<GalaxyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/galaxy-data.json")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<GalaxyData>;
      })
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        setError(String(err.message ?? err));
        setLoading(false);
      });
  }, []);

  return { data, loading, error };
}
