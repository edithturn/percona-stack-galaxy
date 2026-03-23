#!/usr/bin/env tsx
/**
 * build-galaxy-data.ts
 *
 * Reads /data/products.yaml, fetches GitHub releases for each product,
 * normalises the data into the GalaxyData schema, and writes
 * /public/galaxy-data.json.
 *
 * Usage:
 *   npm run build:data                  # standard run
 *   GITHUB_TOKEN=ghp_xxx npm run build:data  # higher rate limit
 *   AI_SUMMARIZE=true npm run build:data     # AI-assisted highlights (requires GEMINI_API_KEY)
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import yaml from "js-yaml";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// ─── Load .env.local (tsx does not read it automatically) ────────────────────
try {
  const envFile = path.join(ROOT, ".env.local");
  if (fs.existsSync(envFile)) {
    for (const line of fs.readFileSync(envFile, "utf-8").split("\n")) {
      const match = line.match(/^([^#=][^=]*)=(.*)$/);
      if (match) process.env[match[1].trim()] = match[2].trim();
    }
  }
} catch { /* ignore */ }

// ─── Types ───────────────────────────────────────────────────────────────────

interface ProductYaml {
  id: string;
  name: string;
  shortName: string;
  category: "database" | "operator" | "observability" | "tools";
  description: string;
  docsUrl: string;
  forumUrl?: string;
  github: {
    repo: string;
    releasesUrl?: string;
    useTagsAsReleases?: boolean;
    useReleaseBranchesAsReleases?: boolean;
    docsReleaseNotesPattern?: string;
  };
  position: { x: number; y: number; z: number };
}

interface ProductsFile {
  version: number;
  products: ProductYaml[];
  edges: Array<{
    from: string;
    to: string;
    type: string;
    label: string;
  }>;
}

interface GitHubRelease {
  tag_name: string;
  name: string;
  published_at: string;
  html_url: string;
  body: string | null;
}

interface Release {
  version: string;
  date: string;
  url: string;
  docsUrl: string;
  tags: string[];
  highlights: string[];
  notesSnippet: string;
}

interface BlogPost {
  title: string;
  url: string;
  date: string;
  author: string;
}

interface VitalSigns {
  stars: number;
  forks: number;
  openIssues: number;
  openPRs: number;
  lastCommit: string;
}

interface Product {
  id: string;
  name: string;
  shortName: string;
  category: string;
  description: string;
  docsUrl: string;
  forumUrl: string;
  repoUrl: string;
  position: { x: number; y: number; z: number };
  releases: Release[];
  vitals: VitalSigns | null;
  blogPosts: BlogPost[];
}

interface GalaxyData {
  generatedAt: string;
  products: Product[];
  edges: Array<{ from: string; to: string; type: string; label: string }>;
}

// ─── Config ──────────────────────────────────────────────────────────────────

const GITHUB_TOKEN = process.env.GITHUB_TOKEN ?? "";
const AI_SUMMARIZE = process.env.AI_SUMMARIZE === "true";
const MAX_RELEASES_PER_PRODUCT = 10;

const headers: Record<string, string> = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  "User-Agent": "percona-stack-galaxy/1.0",
};
if (GITHUB_TOKEN) {
  headers["Authorization"] = `Bearer ${GITHUB_TOKEN}`;
}

// ─── Heuristic tag extraction ─────────────────────────────────────────────────

function extractTags(title: string, body: string): string[] {
  const text = `${title} ${body}`.toLowerCase();
  const tags: string[] = [];

  if (/cve-|security\s+(fix|patch|advisory)|vulnerabilit|authentication\s+bypass/.test(text)) {
    tags.push("security");
  }
  if (/breaking[\s-]change|incompatible|migration\s+required|breaks?\s+backward|not\s+backward/.test(text)) {
    tags.push("breaking");
  }
  if (/new\s+feature|add(ed|s)\s+support|introduc(ed|es)|enhancement|improvement/.test(text)) {
    tags.push("feature");
  }
  if (/fix(ed|es)|bug\s+fix|resolv(ed|es)|patch(ed|es)|regression|crash|issue\s+#/.test(text)) {
    tags.push("fix");
  }

  return [...new Set(tags)];
}

// ─── Bullet highlight extraction ─────────────────────────────────────────────

function extractHighlights(body: string): string[] {
  if (!body) return [];

  // Strip markdown headings and horizontal rules
  const cleaned = body
    .replace(/^#{1,6}\s+.+$/gm, "")
    .replace(/^---+$/gm, "")
    .replace(/\r\n/g, "\n");

  // Collect bullet lines (* - •)
  const bullets = cleaned.match(/^[\*\-\u2022]\s+.{10,}/gm) ?? [];
  const highlights = bullets
    .slice(0, 3)
    .map((b) =>
      b
        .replace(/^[\*\-\u2022]\s+/, "")
        .replace(/\*\*(.+?)\*\*/g, "$1") // strip bold
        .replace(/`(.+?)`/g, "$1")        // strip code
        .trim()
    )
    .filter((h) => h.length > 0);

  return highlights;
}

// ─── Notes snippet ────────────────────────────────────────────────────────────

function extractSnippet(body: string, maxLen = 280): string {
  if (!body) return "";
  const text = body
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/\[(.+?)\]\(.+?\)/g, "$1")
    .replace(/\r\n/g, " ")
    .replace(/\n/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen).replace(/\s\S*$/, "") + "…";
}

// ─── GitHub API ───────────────────────────────────────────────────────────────

async function fetchGitHubReleases(repo: string, docsPattern?: string): Promise<Release[]> {
  const url = `https://api.github.com/repos/${repo}/releases?per_page=${MAX_RELEASES_PER_PRODUCT}`;

  let response: Response;
  try {
    response = await fetch(url, { headers });
  } catch (err) {
    console.warn(`  [warn] Network error fetching ${repo}: ${err}`);
    return [];
  }

  if (response.status === 404) {
    console.warn(`  [warn] Repo not found: ${repo} — using empty releases`);
    return [];
  }
  if (response.status === 403 || response.status === 429) {
    const reset = response.headers.get("x-ratelimit-reset");
    console.warn(
      `  [warn] Rate limited on ${repo}. ` +
      (reset ? `Resets at ${new Date(Number(reset) * 1000).toISOString()}.` : "") +
      ` Set GITHUB_TOKEN to increase limits.`
    );
    return [];
  }
  if (!response.ok) {
    console.warn(`  [warn] HTTP ${response.status} for ${repo}`);
    return [];
  }

  const raw = (await response.json()) as GitHubRelease[];

  return raw
    .filter((r) => !r.tag_name.toLowerCase().includes("alpha") && !r.tag_name.toLowerCase().includes("beta") && !r.tag_name.toLowerCase().includes("rc"))
    .map((r) => {
      const body = r.body ?? "";
      const title = r.name ?? r.tag_name;
      const version = r.tag_name.replace(/^v/, "");
      return {
        version,
        date: r.published_at,
        url: r.html_url,
        docsUrl: buildDocsUrl(version, docsPattern),
        tags: extractTags(title, body),
        highlights: extractHighlights(body),
        notesSnippet: extractSnippet(body),
      };
    });
}

// ─── Docs URL builder ─────────────────────────────────────────────────────────

function buildDocsUrl(version: string, pattern?: string): string {
  if (!pattern) return "";
  // Extract major version: "8.0.19-7" → "8.0"
  const major = version.match(/^(\d+\.\d+)/)?.[1] ?? "";
  return pattern.replace("{major}", major).replace("{version}", version);
}

// ─── GitHub tags (fallback for repos that don't use GitHub Releases) ─────────

interface GitHubTag {
  name: string;
  commit: { sha: string; url: string };
}

const SEMVER_RE = /\d+\.\d+/;
const NOISE_RE = /jenkins|upstream|build|test|snapshot|nightly/i;

function normalizeTagVersion(tag: string): string {
  // Strip leading 'v', then strip any non-numeric prefix (e.g. "Percona-Server-")
  return tag.replace(/^v/, "").replace(/^[a-zA-Z][\w-]*?(?=\d)/, "").trim();
}

async function fetchGitHubTags(repo: string, docsPattern?: string): Promise<Release[]> {
  let response: Response;
  try {
    response = await fetch(`https://api.github.com/repos/${repo}/tags?per_page=30`, { headers });
  } catch (err) {
    console.warn(`  [warn] Network error fetching tags for ${repo}: ${err}`);
    return [];
  }

  if (!response.ok) {
    console.warn(`  [warn] HTTP ${response.status} fetching tags for ${repo}`);
    return [];
  }

  const tags = (await response.json()) as GitHubTag[];

  const candidates = tags
    .filter((t) => SEMVER_RE.test(t.name) && !NOISE_RE.test(t.name))
    .slice(0, 30); // fetch more so we can date-filter

  const TWO_YEARS_AGO = Date.now() - 2 * 365 * 24 * 60 * 60 * 1000;

  const withDates = await Promise.all(
    candidates.map(async (tag): Promise<Release | null> => {
      let date = "";
      try {
        const commitResp = await fetch(tag.commit.url, { headers });
        if (commitResp.ok) {
          const data = (await commitResp.json()) as { commit: { committer: { date: string } } };
          date = data.commit?.committer?.date ?? "";
        }
      } catch { /* skip date */ }

      // Drop tags older than 2 years
      if (date && new Date(date).getTime() < TWO_YEARS_AGO) return null;

      const version = normalizeTagVersion(tag.name);
      if (!version) return null;

      return {
        version,
        date,
        url: `https://github.com/${repo}/releases/tag/${tag.name}`,
        docsUrl: buildDocsUrl(version, docsPattern),
        tags: [],
        highlights: [],
        notesSnippet: "",
      };
    })
  );

  return withDates.filter((r): r is Release => r !== null).slice(0, 10);
}

// ─── GitHub branches (for repos that use release-x.y.z-n branch naming) ──────

interface GitHubBranch {
  name: string;
  commit: { sha: string; url: string };
}

const RELEASE_BRANCH_RE = /^release-(\d+\.\d+.*)/;

async function fetchGitHubBranches(repo: string, docsPattern?: string): Promise<Release[]> {
  // Fetch up to 2 pages of branches to cover all release-* branches
  const allBranches: GitHubBranch[] = [];
  for (let page = 1; page <= 2; page++) {
    let resp: Response;
    try {
      resp = await fetch(
        `https://api.github.com/repos/${repo}/branches?per_page=100&page=${page}`,
        { headers }
      );
    } catch (err) {
      console.warn(`  [warn] Network error fetching branches for ${repo}: ${err}`);
      break;
    }
    if (!resp.ok) {
      console.warn(`  [warn] HTTP ${resp.status} fetching branches for ${repo}`);
      break;
    }
    const page_data = (await resp.json()) as GitHubBranch[];
    allBranches.push(...page_data);
    if (page_data.length < 100) break;
  }

  // Sort release branches by version descending so we fetch dates for the newest ones first
  const releaseBranches = allBranches
    .filter((b) => RELEASE_BRANCH_RE.test(b.name))
    .sort((a, b) => {
      // Compare version strings numerically (e.g. "release-9.6.0-1" > "release-8.0.45-36")
      const av = a.name.replace(/^release-/, "").split(/[.\-]/).map(Number);
      const bv = b.name.replace(/^release-/, "").split(/[.\-]/).map(Number);
      for (let i = 0; i < Math.max(av.length, bv.length); i++) {
        const diff = (bv[i] ?? 0) - (av[i] ?? 0);
        if (diff !== 0) return diff;
      }
      return 0;
    })
    .slice(0, 30);

  const TWO_YEARS_AGO = Date.now() - 2 * 365 * 24 * 60 * 60 * 1000;

  const withDates = await Promise.all(
    releaseBranches.map(async (branch): Promise<Release | null> => {
      let date = "";
      try {
        const commitResp = await fetch(branch.commit.url, { headers });
        if (commitResp.ok) {
          const data = (await commitResp.json()) as { commit: { committer: { date: string } } };
          date = data.commit?.committer?.date ?? "";
        }
      } catch { /* skip date */ }

      if (date && new Date(date).getTime() < TWO_YEARS_AGO) return null;

      const version = branch.name.replace(/^release-/, "");
      return {
        version,
        date,
        url: `https://github.com/${repo}/tree/${branch.name}`,
        docsUrl: buildDocsUrl(version, docsPattern),
        tags: [],
        highlights: [],
        notesSnippet: "",
      };
    })
  );

  return withDates
    .filter((r): r is Release => r !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);
}

// ─── GitHub repo vitals ───────────────────────────────────────────────────────

async function fetchGitHubRepoStats(repo: string): Promise<VitalSigns | null> {
  try {
    const [repoResp, prsResp] = await Promise.all([
      fetch(`https://api.github.com/repos/${repo}`, { headers }),
      fetch(`https://api.github.com/repos/${repo}/pulls?state=open&per_page=1`, { headers }),
    ]);

    if (!repoResp.ok) return null;

    const data = (await repoResp.json()) as {
      stargazers_count: number;
      forks_count: number;
      open_issues_count: number;
      pushed_at: string;
    };

    // Parse open PR count from Link header (avoids fetching all PRs)
    let openPRs = 0;
    if (prsResp.ok) {
      const link = prsResp.headers.get("link") ?? "";
      const match = link.match(/[?&]page=(\d+)>;\s*rel="last"/);
      if (match) {
        openPRs = parseInt(match[1], 10);
      } else {
        const prs = (await prsResp.json()) as unknown[];
        openPRs = prs.length;
      }
    }

    return {
      stars: data.stargazers_count,
      forks: data.forks_count,
      openIssues: Math.max(0, data.open_issues_count - openPRs),
      openPRs,
      lastCommit: data.pushed_at,
    };
  } catch {
    return null;
  }
}

// ─── Blog post RSS fetch ──────────────────────────────────────────────────────

const BLOG_TAG: Record<string, string> = {
  psmdb:            "mongodb",
  "psmdb-operator": "mongodb",
  ppg:              "postgresql",
  "pg-operator":    "postgresql",
  psmysql:          "mysql",
  "mysql-operator": "mysql",
  pxc:              "mysql",
  "pxc-operator":   "mysql",
  pmm:              "pmm",
  toolkit:          "mysql",
  valkey:           "valkey",
  openeverest:      "everest",
};

function extractCdata(raw: string): string {
  const m = raw.match(/<!\[CDATA\[([\s\S]*?)\]\]>/);
  return m ? m[1].trim() : raw.trim();
}

async function fetchBlogPosts(productId: string): Promise<BlogPost[]> {
  const tag = BLOG_TAG[productId];
  if (!tag) return [];

  const url = `https://www.percona.com/blog/tag/${tag}/feed/`;
  try {
    const resp = await fetch(url, { headers: { "User-Agent": "percona-stack-galaxy/1.0" } });
    if (!resp.ok) return [];

    const xml = await resp.text();

    // Extract <item> blocks
    const items = xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];

    return items.slice(0, 2).map((item) => {
      const titleMatch  = item.match(/<title>([\s\S]*?)<\/title>/);
      const linkMatch   = item.match(/<link>([\s\S]*?)<\/link>/);
      const dateMatch   = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
      const authorMatch = item.match(/<dc:creator>([\s\S]*?)<\/dc:creator>/);

      const title  = titleMatch  ? extractCdata(titleMatch[1])  : "";
      const link   = linkMatch   ? linkMatch[1].trim()          : "";
      const date   = dateMatch   ? new Date(dateMatch[1].trim()).toISOString() : "";
      const author = authorMatch ? extractCdata(authorMatch[1]) : "";

      return { title, url: link, date, author };
    }).filter((p) => p.title && p.url);
  } catch {
    return [];
  }
}

// ─── AI summarisation (optional) ─────────────────────────────────────────────

async function aiEnrichHighlights(release: Release, productName: string): Promise<Release> {
  if (!AI_SUMMARIZE) return release;
  if (release.highlights.length >= 3) return release; // already extracted enough

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("  [warn] AI_SUMMARIZE=true but GEMINI_API_KEY not set — skipping AI");
    return release;
  }

  const prompt =
    `You are summarising a software release for ${productName}.\n` +
    `Release version: ${release.version}\n` +
    `Notes snippet: ${release.notesSnippet}\n\n` +
    "Return exactly 3 concise bullet points (plain text, no markdown, no dashes) summarising the key changes. " +
    "One point per line.";

  try {
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 256 },
        }),
      }
    );

    if (!resp.ok) {
      console.warn(`  [warn] Gemini API error ${resp.status}`);
      return release;
    }

    const data = (await resp.json()) as {
      candidates: Array<{ content: { parts: Array<{ text: string }> } }>;
    };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const bullets = text
      .split("\n")
      .map((l) => l.replace(/^[\d\.\-\*]\s*/, "").trim())
      .filter((l) => l.length > 10)
      .slice(0, 3);

    return { ...release, highlights: bullets };
  } catch (err) {
    console.warn(`  [warn] AI summarisation failed: ${err}`);
    return release;
  }
}

// ─── Seed / fallback releases ─────────────────────────────────────────────────

function seedReleasesForProduct(id: string): Release[] {
  const base = new Date("2026-03-09T00:00:00Z").getTime();
  const day = 86_400_000;

  const versionMap: Record<string, Array<[string, number, string[]]>> = {
    psmdb:         [["8.0.4-4", 18, ["security","fix"]], ["7.0.15-9", 85, ["fix"]], ["7.0.14-8", 160, ["fix"]]],
    "psmdb-operator": [["1.18.0", 33, ["feature"]], ["1.17.0", 110, ["feature","fix"]], ["1.16.0", 210, ["feature"]]],
    ppg:           [["17.2", 24, ["feature","fix"]], ["16.6", 100, ["security","fix"]], ["15.10", 185, ["fix"]]],
    "pg-operator": [["2.5.0", 38, ["feature"]], ["2.4.1", 120, ["fix","security"]], ["2.4.0", 173, ["feature"]]],
    psmysql:       [["8.4.4-4", 8, ["security","fix"]], ["8.0.41-32", 54, ["fix"]], ["8.0.40-31", 140, ["feature","fix"]]],
    "mysql-operator": [["0.10.0", 9, ["feature","breaking"]], ["0.9.1", 99, ["fix"]], ["0.9.0", 183, ["feature"]]],  // PS-based operator
    pxc:           [["8.0.41-33.1", 28, ["fix","security"]], ["8.4.2-4.0", 99, ["feature"]], ["8.0.39-30.1", 196, ["fix"]]],
    "pxc-operator": [["1.15.1", 13, ["fix"]], ["1.15.0", 80, ["feature"]], ["1.14.1", 175, ["fix","security"]]],
    pmm:           [["3.2.0", 4, ["feature"]], ["3.1.0", 49, ["feature","fix"]], ["3.0.0", 115, ["feature","breaking"]]],
    toolkit:       [["3.6.0", 110, ["feature"]], ["3.5.7", 244, ["fix"]], ["3.5.6", 338, ["fix"]]],
  };

  const entries = versionMap[id] ?? [["0.0.1", 300, ["fix"]]];

  return entries.map(([version, daysAgo, tags]) => ({
    version,
    date: new Date(base - daysAgo * day).toISOString(),
    url: `https://github.com/percona/${id}/releases/tag/v${version}`,
    docsUrl: "",
    tags,
    highlights: [
      "Stability and performance improvements",
      "Updated third-party dependencies",
      "Bug fixes and documentation updates",
    ],
    notesSnippet: `Release ${version} — includes targeted bug fixes and dependency updates.`,
  }));
}

// ─── Seed vitals fallback ─────────────────────────────────────────────────────

function seedVitals(id: string): VitalSigns {
  const base = new Date("2026-03-13T10:00:00Z").toISOString();
  const seedMap: Record<string, VitalSigns> = {
    psmdb:            { stars: 660,  forks: 148, openIssues: 32,  openPRs: 10, lastCommit: base },
    "psmdb-operator": { stars: 380,  forks: 132, openIssues: 20,  openPRs: 8,  lastCommit: base },
    ppg:              { stars: 440,  forks: 96,  openIssues: 27,  openPRs: 8,  lastCommit: base },
    "pg-operator":    { stars: 510,  forks: 178, openIssues: 48,  openPRs: 13, lastCommit: base },
    psmysql:          { stars: 3100, forks: 910, openIssues: 89,  openPRs: 26, lastCommit: base },
    "mysql-operator": { stars: 290,  forks: 98,  openIssues: 33,  openPRs: 11, lastCommit: base },
    pxc:              { stars: 1100, forks: 310, openIssues: 60,  openPRs: 18, lastCommit: base },
    "pxc-operator":   { stars: 360,  forks: 142, openIssues: 25,  openPRs: 8,  lastCommit: base },
    pmm:              { stars: 1900, forks: 420, openIssues: 95,  openPRs: 78, lastCommit: base },
    toolkit:          { stars: 2800, forks: 550, openIssues: 72,  openPRs: 23, lastCommit: base },
  };
  return seedMap[id] ?? { stars: 0, forks: 0, openIssues: 0, openPRs: 0, lastCommit: base };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌌  Percona Stack Galaxy — data pipeline");
  console.log(`    GitHub token: ${GITHUB_TOKEN ? "✔ provided" : "✗ not set (60 req/h limit)"}`);
  console.log(`    AI summarise: ${AI_SUMMARIZE ? "✔ enabled" : "✗ disabled"}`);
  console.log();

  // Read YAML
  const yamlPath = path.join(ROOT, "data", "products.yaml");
  const yamlContent = fs.readFileSync(yamlPath, "utf-8");
  const parsed = yaml.load(yamlContent) as ProductsFile;

  const products: Product[] = [];

  for (const p of parsed.products) {
    process.stdout.write(`  → ${p.name} (${p.github.repo}) … `);

    let releases: Release[] = [];
    let vitals: VitalSigns | null = null;

    let blogPosts: BlogPost[] = [];

    if (p.github.repo && !p.github.repo.includes("placeholder")) {
      [releases, vitals, blogPosts] = await Promise.all([
        p.github.useReleaseBranchesAsReleases
          ? fetchGitHubBranches(p.github.repo, p.github.docsReleaseNotesPattern)
          : p.github.useTagsAsReleases
            ? fetchGitHubTags(p.github.repo, p.github.docsReleaseNotesPattern)
            : fetchGitHubReleases(p.github.repo, p.github.docsReleaseNotesPattern),
        fetchGitHubRepoStats(p.github.repo),
        fetchBlogPosts(p.id),
      ]);
    }

    if (releases.length === 0) {
      if (p.github.useTagsAsReleases) {
        // No recent tags found — vitals are still real, just no release history
        console.log(`(no recent tags)  ⭐${vitals?.stars ?? "?"}`);
      } else {
        console.log("(seeded)");
        releases = seedReleasesForProduct(p.id);
      }
    } else {
      const source = p.github.useTagsAsReleases ? "tags" : "releases";
      console.log(`${releases.length} ${source}  ⭐${vitals?.stars ?? "?"}`);
    }

    if (!vitals) vitals = seedVitals(p.id);

    // Optionally enrich with AI highlights
    if (AI_SUMMARIZE) {
      releases = await Promise.all(releases.map((r) => aiEnrichHighlights(r, p.name)));
    }

    products.push({
      id: p.id,
      name: p.name,
      shortName: p.shortName,
      category: p.category,
      description: p.description,
      docsUrl: p.docsUrl,
      forumUrl: p.forumUrl ?? "",
      repoUrl: p.github.repo ? `https://github.com/${p.github.repo}` : "",
      position: p.position,
      releases,
      vitals,
      blogPosts,
    });
  }

  const galaxyData: GalaxyData = {
    generatedAt: new Date().toISOString(),
    products,
    edges: parsed.edges,
  };

  const outPath = path.join(ROOT, "public", "galaxy-data.json");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(galaxyData, null, 2));

  console.log();
  console.log(`✅  Written → ${path.relative(ROOT, outPath)}`);
  console.log(`    Products: ${products.length}`);
  console.log(`    Edges:    ${galaxyData.edges.length}`);
  console.log(
    `    Releases: ${products.reduce((n, p) => n + p.releases.length, 0)}`
  );
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
