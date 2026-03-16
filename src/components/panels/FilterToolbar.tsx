"use client";

export function FilterToolbar() {
  return (
    <div
      className="absolute top-0 left-0 right-0 z-40 flex items-center px-4"
      style={{
        background: "var(--toolbar-bg)",
        backdropFilter: "blur(14px)",
        borderBottom: "1px solid var(--border)",
        height: "50px",
      }}
    >
      <div className="flex items-center gap-3">
        <img src="/percona.png" alt="Percona" width={28} height={28} className="shrink-0" />
        <div className="hidden sm:flex flex-col leading-none gap-1">
          <span className="text-base font-bold tracking-tight" style={{ color: "var(--text)" }}>
            Percona Galaxy
          </span>
          <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
            Explore Percona&apos;s open source database ecosystem
          </span>
        </div>
      </div>
    </div>
  );
}
