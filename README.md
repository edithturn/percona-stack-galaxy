# 🌌 Percona Stack Galaxy

An interactive **3D galaxy map** of Percona's open source database ecosystem.
Navigate a star field, click planets to explore product releases, and see how
tools relate to each other — all driven by live GitHub release data.

![screenshot placeholder](docs/screenshot.png)

## Live Demo

> Coming soon — deploy to Vercel in one click (button below once the repo is public).

---

## Deploy to Vercel

### 1. Push the repo to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_ORG/percona-stack-galaxy.git
git push -u origin main
```

### 2. Import to Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and click **Import Git Repository**
2. Select your repo
3. Framework will be auto-detected as **Next.js** — no changes needed
4. Under **Environment Variables**, add:

| Name | Value |
|---|---|
| `GITHUB_TOKEN` | A GitHub PAT with no scopes (read-only public repos) |
| `AI_SUMMARIZE` | `false` (or `true` to enable Claude summaries) |
| `ANTHROPIC_API_KEY` | Your Anthropic key (only needed if `AI_SUMMARIZE=true`) |

5. Click **Deploy**

### 3. Enable the auto-update pipeline

The GitHub Action (`.github/workflows/update-galaxy-data.yml`) runs daily, refreshes the data, and pushes the result — Vercel auto-redeploys on every push.

Add these secrets to your GitHub repo (**Settings → Secrets → Actions**):

| Secret | Value |
|---|---|
| `GITHUB_TOKEN` | Auto-provided by GitHub Actions — no action needed |
| `ANTHROPIC_API_KEY` | Only if AI summarisation is enabled |

### Auto-update flow

```
Every day at 02:00 UTC
        │
        ▼
GitHub Actions: npm run build:data
        │  fetches latest releases from GitHub API
        │  generates public/galaxy-data.json
        ▼
git commit "chore: update galaxy data [skip ci]"
        │  [skip ci] prevents an infinite Actions loop
        ▼
git push → GitHub repo updated
        │
        ▼
Vercel detects new commit → redeploys in ~30 s
        │
        ▼
Live site shows fresh release data
```

To trigger a manual refresh:

```bash
# Locally
npm run build:data && git add public/galaxy-data.json && git commit -m "chore: refresh data" && git push

# Or via GitHub UI: Actions → "Update Galaxy Data" → Run workflow
```

---

## Features

| Feature | Details |
|---|---|
| 🪐 **3D Galaxy** | react-three-fiber + drei, orbit/pan/zoom controls |
| 🌟 **11 Products** | All Percona DB servers, operators, PMM, Valkey, Toolkit |
| 🔗 **Relationship Edges** | Curved glowing lines: monitors, manages, toolsFor, accelerates |
| 📦 **Release Cards** | Version, date, tags (security/breaking/feature/fix), 3 highlights |
| 🔭 **Filters** | Time window · release tags · product category |
| 🤖 **Automated Pipeline** | GitHub Actions fetches releases daily; no manual maintenance |
| ✨ **Post-processing** | Bloom + Vignette for cinematic galaxy feel |

---

## Quick Start

```bash
git clone https://github.com/your-org/percona-stack-galaxy.git
cd percona-stack-galaxy

npm install
npm run dev          # → http://localhost:3000
```

The app ships a seeded `public/galaxy-data.json` so it works immediately.
To pull fresh data from GitHub:

```bash
# Optional: set a GitHub token (increases rate limit 60 → 5 000 req/h)
cp .env.example .env
# edit .env and add GITHUB_TOKEN=ghp_...

npm run build:data
```

---

## How the Data Pipeline Works

```
data/products.yaml
      │
      ▼
scripts/build-galaxy-data.ts
      │  reads YAML
      │  fetches GitHub releases for each product
      │  extracts tags via heuristics (security/breaking/feature/fix)
      │  extracts 3 highlight bullets from release body
      │  falls back to seed data if GitHub fetch fails
      ▼
public/galaxy-data.json   ← loaded by the UI at runtime
```

GitHub Actions runs `npm run build:data` daily at 02:00 UTC and
commits any changed `galaxy-data.json` back to the repo.

### Optional AI summarisation

Set `AI_SUMMARIZE=true` and provide `ANTHROPIC_API_KEY` to use
Claude Haiku to generate richer release highlights when the
heuristic extractor finds fewer than 3 bullet points.
AI is **disabled by default** and never required to run the app.

---

## Project Structure

```
percona-stack-galaxy/
├── data/
│   └── products.yaml          # Source of truth for products & edges
├── public/
│   └── galaxy-data.json       # Generated dataset (committed)
├── scripts/
│   └── build-galaxy-data.ts   # Data pipeline
├── src/
│   ├── app/                   # Next.js App Router
│   ├── components/
│   │   ├── galaxy/            # Three.js / R3F components
│   │   │   ├── GalaxyCanvas.tsx
│   │   │   ├── GalaxyScene.tsx
│   │   │   ├── Planet.tsx
│   │   │   ├── EdgeLine.tsx
│   │   │   ├── StarField.tsx   # 7 800+ stars, clusters, dark/light theme
│   │   │   ├── CometField.tsx  # 2 animated comets with nucleus + tail
│   │   │   ├── Sun.tsx
│   │   │   ├── OrbitPath.tsx
│   │   │   ├── EcosystemZone.tsx
│   │   │   └── CameraRig.tsx
│   │   ├── panels/            # UI overlays
│   │   │   ├── IntroScreen.tsx
│   │   │   ├── FilterToolbar.tsx
│   │   │   ├── ProductPanel.tsx
│   │   │   └── ReleaseCard.tsx
│   │   └── GalaxyApp.tsx      # Root client component
│   ├── hooks/
│   │   ├── useGalaxyData.ts
│   │   └── useFilters.ts
│   ├── lib/utils.ts
│   └── types/galaxy.ts
├── .github/
│   └── workflows/
│       └── update-galaxy-data.yml
└── .env.example
```

---

## Adding a New Product

1. **Edit `data/products.yaml`** — add an entry following the existing schema:

```yaml
- id: my-product
  name: My Product
  shortName: MP
  category: database          # database | operator | observability | cache | tools
  description: "Short description."
  docsUrl: "https://docs.example.com/"
  github:
    repo: "org/repo-name"
    releasesUrl: ""           # leave blank to use default releases API
  position: { x: 5, y: 0, z: 4 }   # choose a position that doesn't overlap
```

2. **Add edges** (optional) to the `edges:` section using any existing product `id` as `from`/`to`.

3. **Regenerate data:**

```bash
npm run build:data
```

4. Open a PR — the GitHub Action will keep the data current automatically.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) + TypeScript |
| Styling | Tailwind CSS |
| 3D | react-three-fiber + @react-three/drei |
| Post-processing | @react-three/postprocessing (Bloom, Vignette) |
| Data | products.yaml → galaxy-data.json |
| Pipeline | Node.js + tsx (no bundler needed) |
| CI | GitHub Actions (daily scheduled workflow) |

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GITHUB_TOKEN` | No | Personal Access Token (no scopes needed). Increases rate limit to 5 000 req/h. |
| `AI_SUMMARIZE` | No | Set to `true` to enable AI highlight generation (default: `false`). |
| `ANTHROPIC_API_KEY` | Only if `AI_SUMMARIZE=true` | Anthropic API key for Claude Haiku. |

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full guide.

Short version:
1. Fork the repo
2. Create a feature branch: `git checkout -b feat/my-thing`
3. Make your changes + run `npm run lint`
4. Open a PR with a clear description

---

## License

[Apache 2.0](LICENSE) — Percona open source community project.
