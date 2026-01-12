# Main App (Umi)

This package hosts the unified frontend app. The admin pages have been organized under `src/pages/admin` and mounted under the `/admin` route prefix.

## Structure
- `src/pages/admin/` — admin pages, components, services, utils, styles for prompt engineering, evaluation, and observability.
- `src/pages/` — native Umi pages for Studio (App, Component, Knowledge, etc.).
- `tailwind.css` and `tailwind.config.js` — Tailwind setup (admin content globs included).

## Routes
- `/admin` — admin landing page (placeholder).
- `/admin/playground` — Playground.
- `/admin/prompts` — Prompts.
- `/admin/tracing` — Tracing.
- `/admin/evaluation/experiment` — Experiment list.
- `/admin/evaluation/gather` — Gather list.
- `/admin/evaluation/evaluator` — Evaluator list.

## Development
```bash
cd frontend_studio
npm install
npm run dev -w packages/main
```

App will be served at http://localhost:8000 (or the port chosen by Umi).

## Backend Proxy
API requests to `/api/*` are proxied via Umi to `process.env.WEB_SERVER` or `http://localhost:8080` by default (see `.umirc.ts`).

## Notes
- TypeScript is configured with `allowJs` to load JS/JSX from admin pages.
- Global styles import includes `src/pages/admin/styles/tailwind.css` and `src/pages/admin/styles/index.css` in `src/app.tsx`.
