# thaiparts-infinity

Repository path: `l:/Sprouting-Tech/thaiparts-infinity`

A Next.js App Router starter scaffolded with create-next-app. Production-ready defaults with optimized fonts and Vercel-friendly settings.

## Overview

This repository contains a Next.js application using the App Router (`/app`) and is configured for server components, TypeScript, Tailwind, and optimized font loading.

## Goals

- Provide a clean, opinionated Next.js (App Router) structure.
- Fast local development with HMR and minimal scripts.
- Optimize fonts and assets for predictable CLS and performance.
- Easy deployment to Vercel or other Node hosts.

## Key Features

- Next.js (App Router) structure
- Automatic font optimization via `next/font`
- Ready dev/build/start scripts
- Minimal, clear README with quick-start instructions

## Tech Stack

- Next.js (App Router)
- Node.js
- Package manager: npm / yarn / pnpm / bun
- Optional: Vercel for deployment

## Repository layout (typical)

```
/app
    ├─ page.tsx
    ├─ layout.tsx
    └─ globals.css
/public
    └─ assets...
/styles
    └─ (optional)
package.json
tsconfig.json
next.config.js
README.md
```

## Quick start — Local development

1. Install dependencies:
   - `npm install` or `yarn` or `pnpm install` or `bun install`
2. Start dev server:
   - `npm run dev` or `yarn dev` or `pnpm dev` or `bun dev`
3. Open http://localhost:3000 — HMR will reload on changes.

## Available scripts

- `dev` — Start Next.js in development mode.
- `build` — Create an optimized production build.
- `start` — Start production server after `build`.
- `lint` — Run linters (if configured).
- `test` — Run tests (if configured).

## Build & Production

1. Install dependencies on CI/server.
2. Build:
   - `npm run build`
3. Start:
   - `npm start`

For Vercel: connect the repository and use the default Next.js configuration.

## Fonts & Performance

This project uses `next/font` for automatic font optimization and preload:

- Automatic subsets
- Reduced layout shift
- No external stylesheet link required

## Routing & App Structure

- App Router organizes routes as nested folders with `page.tsx`, `layout.tsx`, and `loading.tsx`.
- Prefer Server Components for data fetching; use `"use client"` only for interactive UI.
- For APIs, use Next.js API routes or server actions in the App Router.

## Environment variables

- Use a `.env.local` file for local development.
- Prefix client-exposed variables with `NEXT_PUBLIC_`.
- Never commit secrets; add `.env.*` to `.gitignore`.

## Testing

- Add unit/integration tests (Jest, React Testing Library, Playwright).
- Configure and expose `npm run test` in `package.json`.

## Linting & Formatting

- Integrate ESLint and Prettier.
- Add `lint` and `format` scripts and run them in CI.

## Deployment

- Vercel: recommended — auto-detects Next.js.
- Other platforms: build with `npm run build` and run `npm start`.
- Use Node 18+ or the runtime recommended by Next.js.

## Contributing

- Fork, branch, implement, run lint/tests, and open PRs.
- Provide descriptive commit messages and PR descriptions.
- Update documentation for new features.

## Troubleshooting

- Port in use: set `PORT` env var or free port 3000.
- Build errors: check missing deps, TypeScript errors, invalid imports.
- Asset issues: ensure files in `/public` or imported correctly.

## Security & Best Practices

- Keep dependencies up to date.
- Do not commit secrets.
- Use environment-specific configs and secure secret storage.
- Enable HTTPS and secure headers in production.

## Maintainers & Support

- Add maintainer contact info here.
- For bug reports: open issues with repro steps, logs, and environment.
- For feature requests: describe problem, proposed solution, and migration/compat concerns.

## License

Include a `LICENSE` file (MIT, Apache-2.0, etc.) appropriate for the project.

---

This README is a concise, editable guide — adapt commands and configuration to your project's needs.
