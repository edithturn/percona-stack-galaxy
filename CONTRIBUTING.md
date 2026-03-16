# Contributing to Percona Stack Galaxy

Thanks for your interest! This is an open source community project and all contributions are welcome.

---

## Ways to Contribute

| Type | How |
|---|---|
| 🐛 Bug report | Open a GitHub Issue with steps to reproduce |
| 💡 Feature idea | Open an Issue to discuss before coding |
| 🪐 New product | Add to `data/products.yaml` (see below) |
| 🔗 New edge | Add to the `edges:` section in `products.yaml` |
| 🎨 UI improvement | PRs welcome — please keep the space theme |
| 📖 Docs | README, comments, CONTRIBUTING updates |
| 🔧 Pipeline | Improve `scripts/build-galaxy-data.ts` |

---

## Development Setup

```bash
git clone https://github.com/your-org/percona-stack-galaxy.git
cd percona-stack-galaxy
npm install
npm run dev
```

The dev server starts at `http://localhost:3000`. The app uses the committed
`public/galaxy-data.json` — no pipeline run required to get started.

---

## Adding a Product

Edit `data/products.yaml` and add an entry:

```yaml
- id: unique-id           # lowercase, hyphen-separated, must be unique
  name: Full Product Name
  shortName: Abbrev       # shown on the planet label
  category: database      # database | operator | observability | cache | tools
  description: "One-sentence description."
  docsUrl: "https://docs.example.com/"
  github:
    repo: "github-org/repo-name"   # used to fetch releases
    releasesUrl: ""                # optional override of the releases API URL
  position: { x: 3, y: 0, z: 5 } # 3D position — choose non-overlapping coords
```

**Position tips:**
- Current products span roughly x: −10 to 8, y: −3 to 3, z: −9 to 3.
- Check existing products to pick a gap.
- The `y` axis is "up" — slight vertical offsets look good.

Then run:

```bash
npm run build:data   # regenerate public/galaxy-data.json
npm run dev          # verify it appears in the galaxy
```

---

## Adding a Relationship Edge

In the `edges:` section of `products.yaml`:

```yaml
edges:
  - from: product-id-a
    to: product-id-b
    type: monitors         # monitors | manages | toolsFor | accelerates
    label: "Short description of the relationship"
```

Edge colour is determined by `type`:
- `monitors` → emerald green
- `manages` → purple
- `toolsFor` → pink
- `accelerates` → amber

---

## Code Style

- TypeScript strict mode is enabled — no `any` unless unavoidable.
- Components are functional with hooks.
- Keep components focused — split if over ~150 lines.
- Tailwind CSS for styling — no inline styles except for dynamic Three.js colours.
- No `console.log` in production code (pipeline scripts are fine).

---

## Testing

There are no automated tests yet — contributions welcome! For now:

```bash
npm run lint    # ESLint
npm run build   # TypeScript + Next.js build check
```

---

## Pull Request Checklist

- [ ] `npm run lint` passes with no new warnings
- [ ] `npm run build` succeeds
- [ ] If adding a product: `npm run build:data` runs without errors
- [ ] UI change tested in Chrome and Firefox
- [ ] PR description explains what changed and why

---

## Commit Messages

Follow conventional commits loosely:

```
feat: add Percona Everest product
fix: prevent camera jitter on planet deselect
chore: update galaxy data 2026-03-09
docs: clarify adding a product in CONTRIBUTING
```

---

## Questions?

Open an Issue or start a GitHub Discussion.
