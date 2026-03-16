"use client";

import { useEffect } from "react";
import { X, ExternalLink, Rss, Activity, Star, GitFork, CircleDot, GitBranch, Clock } from "lucide-react";
import type { EcosystemContribution } from "@/components/galaxy/EcosystemZone";
import { relativeTime } from "@/lib/utils";

interface EcosystemPanelProps {
  contribution: EcosystemContribution;
  onClose: () => void;
}

const VALKEY_VITALS = { stars: 25127, forks: 1061, openIssues: 413, openPRs: 194, lastCommit: "2026-03-13", repoUrl: "https://github.com/valkey-io/valkey" };
const EVEREST_VITALS = { stars: 700, forks: 47, openIssues: 127, openPRs: 56, lastCommit: "2026-03-13", repoUrl: "https://github.com/openeverest/openeverest" };

function fmtNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

const VALKEY_BLOG = [
  { title: "Valkey and Redis Sorted Sets: Leaderboards and Beyond", url: "https://www.percona.com/blog/valkey-and-redis-sorted-sets-leaderboards-and-beyond/", author: "Martin Visser", date: "2026-03-06" },
  { title: "Security Advisory: A Series of CVEs Affecting Valkey", url: "https://www.percona.com/blog/security-advisory-a-series-of-cves-affecting-valkey/", author: "Hieu Nguyen", date: "2026-02-26" },
  { title: "A Guide to Accelerating Your Application with Valkey: Caching Database Queries and Sessions", url: "https://www.percona.com/blog/a-guide-to-accelerating-your-application-with-valkey-caching-database-queries-and-sessions/", author: "Arunjith Aravindan", date: "2026-02-19" },
];

const EVEREST_BLOG = [
  { title: "Anonymizing Data with Greenmask and OpenEverest", url: "https://openeverest.io/blog/greenmask-data-anonymization/", author: "Sergey Pronin, Vadim Voitenko", date: "2026-03-05" },
  { title: "Simplify Database Operator Management on Kubernetes with OpenEverest", url: "https://openeverest.io/blog/simplify-database-operator-managemnt/", author: "Lalit Choudhary", date: "2026-02-24" },
  { title: "OpenEverest 1.13: Pod Logs Viewer, Dynamic Load Balancer Annotations and Rebranding", url: "https://openeverest.io/blog/openeverest-v1.13.0-podlogs/", author: "Sergey Pronin", date: "2026-02-18" },
];

const VALKEY_CONTENT = {
  summary: "A high-performance, open-source key-value datastore governed by the Linux Foundation — born after Redis changed its license away from open source.",
  perconaRole: "Percona is a founding contributor to the Valkey project, led by Co-founder Vadim Tkachenko. While other companies pull back, Percona is doubling down — enhancing Valkey's functionality and helping companies migrate from Redis.",
  services: [
    {
      title: "Health Assessments",
      desc: "Instance health checks, best practices, and infrastructure evaluation for a successful transition.",
    },
    {
      title: "Migration Services",
      desc: "Seamless workload migration from Redis to Valkey with minimal downtime.",
    },
    {
      title: "24×7 Support",
      desc: "Round-the-clock expertise to support your team in any Valkey environment.",
    },
  ],
  quote: {
    text: "For over 18 years, we have been the unbiased champions of open source databases. Percona has the opportunity to offer its contributions and support to yet another great open source project — one that shares our most core values.",
    author: "Ann Schlemmer, CEO at Percona",
  },
};

const EVEREST_CONTENT = {
  summary: "An independent open source platform that automates deployment, scaling, and management of PostgreSQL, MySQL, and MongoDB on Kubernetes — with no vendor lock-in.",
  perconaRole: "Percona founded the project and transitioned it to open governance with a multi-vendor community. Percona remains an active contributor and funds Solanica, a dedicated subsidiary supporting OpenEverest's growth.",
  highlights: [
    { label: "Unified control plane", desc: "Manage all your open-source databases from a single Kubernetes-native interface." },
    { label: "Open governance", desc: "Community-driven development with transparent roadmap and multi-vendor contributions." },
    { label: "Extensible platform", desc: "Built to support additional database engines and integrations over time." },
  ],
};

export function EcosystemPanel({ contribution, onClose }: EcosystemPanelProps) {
  useEffect(() => {
    const handle = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [onClose]);

  const isValkey = contribution.id === "valkey";
  const isEverest = contribution.id === "everest";
  const c = contribution.color;
  const vitals = isValkey ? VALKEY_VITALS : isEverest ? EVEREST_VITALS : null;

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
        <div className="h-1 w-full" style={{ background: c }} />

        {/* Header */}
        <div className="flex items-start justify-between p-5 pb-3 shrink-0">
          <div className="flex flex-col gap-1.5">
            <span
              className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full border w-fit"
              style={{ color: c, borderColor: `${c}40`, background: `${c}15` }}
            >
              Ecosystem Contribution
            </span>
            <h2 className="text-lg font-bold leading-tight" style={{ color: "var(--text)" }}>
              {contribution.name}
            </h2>
            <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
              {contribution.tagline}
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-3 mt-0.5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
            aria-label="Close panel"
          >
            <X size={16} />
          </button>
        </div>

        {/* Links */}
        <div className="px-5 pb-4 shrink-0 flex flex-wrap gap-2">
          <a
            href={contribution.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg
              bg-white/8 hover:bg-white/14 border border-white/10 hover:border-white/20
              text-slate-300 hover:text-white transition-all"
          >
            <ExternalLink size={12} />
            {isValkey ? "valkey.io" : "Documentation"}
          </a>
          {isEverest && (
            <a
              href="https://solanica.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg
                bg-white/8 hover:bg-white/14 border border-white/10 hover:border-white/20
                text-slate-300 hover:text-white transition-all"
            >
              <ExternalLink size={12} />
              Solanica
            </a>
          )}
          {isValkey && (
            <a
              href="https://www.percona.com/valkey-project-contribution"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg
                bg-white/8 hover:bg-white/14 border border-white/10 hover:border-white/20
                text-slate-300 hover:text-white transition-all"
            >
              <ExternalLink size={12} />
              Percona &amp; Valkey
            </a>
          )}
        </div>

        {/* Separator */}
        <div className="mx-5 mb-0 shrink-0" style={{ borderTop: "1px solid var(--border)" }} />

        {/* Scrollable body */}
        <div className="px-5 py-4 overflow-y-auto flex-1 flex flex-col gap-5 min-h-0">

          {/* Summary */}
          <p className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>
            {isValkey ? VALKEY_CONTENT.summary : EVEREST_CONTENT.summary}
          </p>

          {/* Vital Signs */}
          {vitals && (
            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
              <div className="px-3 py-2 flex items-center gap-1.5" style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
                <Activity size={11} style={{ color: c }} />
                <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                  Vital Signs
                </span>
                <a href={vitals.repoUrl} target="_blank" rel="noopener noreferrer" className="ml-auto flex items-center gap-1 text-[10px]" style={{ color: "var(--text-faint)" }}>
                  <GitBranch size={10} /> GitHub
                </a>
              </div>
              <div className="grid grid-cols-2">
                <div className="flex items-center gap-2 px-3 py-2.5" style={{ borderRight: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
                  <Star size={13} style={{ color: "#f59e0b" }} />
                  <div>
                    <div className="text-sm font-bold leading-none" style={{ color: "var(--text)" }}>{fmtNum(vitals.stars)}</div>
                    <div className="text-[9px] mt-0.5" style={{ color: "var(--text-faint)" }}>Stars</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-2.5" style={{ borderBottom: "1px solid var(--border)" }}>
                  <GitFork size={13} style={{ color: "#60a5fa" }} />
                  <div>
                    <div className="text-sm font-bold leading-none" style={{ color: "var(--text)" }}>{fmtNum(vitals.forks)}</div>
                    <div className="text-[9px] mt-0.5" style={{ color: "var(--text-faint)" }}>Forks</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-2.5" style={{ borderRight: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
                  <CircleDot size={13} style={{ color: "#f87171" }} />
                  <div>
                    <div className="text-sm font-bold leading-none" style={{ color: "var(--text)" }}>{fmtNum(vitals.openIssues)}</div>
                    <div className="text-[9px] mt-0.5" style={{ color: "var(--text-faint)" }}>Open Issues</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-2.5" style={{ borderBottom: "1px solid var(--border)" }}>
                  <GitBranch size={13} style={{ color: "#34d399" }} />
                  <div>
                    <div className="text-sm font-bold leading-none" style={{ color: "var(--text)" }}>{fmtNum(vitals.openPRs)}</div>
                    <div className="text-[9px] mt-0.5" style={{ color: "var(--text-faint)" }}>Open PRs</div>
                  </div>
                </div>
                <div className="col-span-2 flex items-center gap-2 px-3 py-2.5">
                  <Clock size={13} style={{ color: "#a78bfa" }} />
                  <div>
                    <div className="text-sm font-bold leading-none" style={{ color: "var(--text)" }}>{relativeTime(vitals.lastCommit)}</div>
                    <div className="text-[9px] mt-0.5" style={{ color: "var(--text-faint)" }}>Last Commit</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Highlights / Services */}
          {isValkey && (
            <div className="flex flex-col gap-2">
              {VALKEY_CONTENT.services.map(({ title, desc }) => (
                <div
                  key={title}
                  className="flex flex-col gap-0.5 p-3 rounded-lg"
                  style={{ background: `${c}0d`, border: `1px solid ${c}20` }}
                >
                  <span className="text-xs font-semibold" style={{ color: c }}>{title}</span>
                  <span className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>{desc}</span>
                </div>
              ))}
            </div>
          )}

          {isEverest && (
            <div className="flex flex-col gap-2">
              {EVEREST_CONTENT.highlights.map(({ label, desc }) => (
                <div
                  key={label}
                  className="flex gap-3 p-3 rounded-lg"
                  style={{ background: `${c}0d`, border: `1px solid ${c}20` }}
                >
                  <div className="mt-0.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: c }} />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-semibold" style={{ color: c }}>{label}</span>
                    <span className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>{desc}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Percona's role */}
          <div
            className="p-4 rounded-xl flex flex-col gap-2"
            style={{ background: `${c}10`, border: `1px solid ${c}28` }}
          >
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: c }} />
              <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: c }}>
                Percona&apos;s Role
              </span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
              {isValkey ? VALKEY_CONTENT.perconaRole : EVEREST_CONTENT.perconaRole}
            </p>
            {isValkey && (
              <>
                <div className="mt-1" style={{ borderTop: `1px solid ${c}20` }} />
                <p className="text-xs leading-relaxed italic" style={{ color: "var(--text-muted)" }}>
                  &ldquo;{VALKEY_CONTENT.quote.text}&rdquo;
                </p>
                <p className="text-[10px] font-semibold" style={{ color: "var(--text-faint)" }}>
                  — {VALKEY_CONTENT.quote.author}
                </p>
              </>
            )}
          </div>

          {/* From the Blog */}
          {(isValkey ? VALKEY_BLOG : EVEREST_BLOG).length > 0 && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1.5">
                <Rss size={11} style={{ color: c }} />
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                  From the Blog
                </span>
              </div>
              {(isValkey ? VALKEY_BLOG : EVEREST_BLOG).map((post, i) => (
                <a
                  key={i}
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start justify-between gap-2 p-3 rounded-lg group transition-colors"
                  style={{ border: "1px solid var(--border)" }}
                >
                  <div className="flex flex-col gap-1.5 min-w-0">
                    <span className="text-xs font-medium leading-snug line-clamp-2" style={{ color: "var(--text-muted)" }}>
                      {post.title}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-semibold" style={{ color: "var(--text-muted)" }}>
                        {post.author}
                      </span>
                      <span className="text-[10px]" style={{ color: "var(--text-faint)" }}>
                        · {relativeTime(post.date)}
                      </span>
                    </div>
                  </div>
                  <ExternalLink size={11} className="shrink-0 mt-0.5 opacity-40 group-hover:opacity-80 transition-opacity" style={{ color: "var(--text-muted)" }} />
                </a>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
