# Multi-Machine Setup (Laptop + Desktop)

GitHub is the single source of truth. Each machine has its own clone at the same path, **outside OneDrive**:

```
C:\Users\bussi\Projects\tridim-cognition-ui
```

Do not keep the project in OneDrive. OneDrive turns files into cloud placeholders that lock folders and break `git checkout` and `npm install`.

## First-time setup (run on each machine)

```powershell
New-Item -ItemType Directory -Force C:\Users\bussi\Projects
git clone https://github.com/Benjamin-svg166/tridim-cognition-ui.git C:\Users\bussi\Projects\tridim-cognition-ui
cd C:\Users\bussi\Projects\tridim-cognition-ui
git checkout nine-d-cube
npm install
code .
```

## Daily workflow

Before you start working on a machine:

```powershell
git pull
npm install   # only needed if package.json changed
```

When you're done on that machine:

```powershell
git add -A
git commit -m "Describe the change"
git push
```

Always push before you switch machines, and pull when you sit down at the other one.

## Commands

| Command | Purpose |
|---------|---------|
| `npm start` | Dev server (http://localhost:3000) |
| `npm run build` | Production build to `build/` |
| `npm test` | Run tests |

## Branches

- `nine-d-cube`: active development (Sapience System, MCTS, Computer vs Computer, Adversarial Modeling Engine)
- `main`: default branch
- `clean-start`: older line of work that has diverged from `nine-d-cube`

## What is not in Git (by design)

`node_modules/`, `build/`, and `dist/` are ignored. Each machine regenerates them with `npm install` and `npm run build`.
