# Nexus Blog Creator

Modern blog platform with authentication, post management, and public sharing. Built with React, TypeScript, Vite, shadcn-ui, Supabase (Auth), and n8n (API on Railway). Deployed on Vercel.

### Overview
- Auth: Supabase Email/Password (SDK) with email confirmation flow
- Posts: Create, edit, delete, list, pagination, filters, share links
- Visibility: Public or private posts with visual status indicators
- API: n8n workflow hosted on Railway (webhook) consumed by the frontend
- Deploy: Vercel (SPA routing + proxy strategy as needed)

---

## Tech Stack
- React + TypeScript + Vite
- Tailwind CSS + shadcn-ui
- Supabase (Auth SDK)
- n8n (REST via Webhooks) on Railway
- Vercel (hosting)
- Vitest + React Testing Library (tests)

---

## Architecture & Data Flow
1) Frontend (Vite SPA)
- Routes like `/posts`, `/posts/:id`, `/posts/:id/edit`, `/public` etc.
- Components: `PostCard`, `PostForm`, `PostFilters`, `PostsPagination`.
- Hooks: `usePosts`, `useAsyncOperation`, `usePasswordVisibility`, `useFormValidation`.
- Context: `AuthContext` manages Supabase session, token, user.

2) API (n8n on Railway)
- Webhook base: `https://primary-production-e91c.up.railway.app/webhook`
- Endpoints used: `/posts`, `/posts/:id`, `/posts/public`, etc.
- Response Mode: Last Node (JSON). Ensure Content-Type is `application/json`.

3) Auth (Supabase)
- SDK configured in `src/lib/supabase.ts` using `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- Email confirmation route: `/email-confirmation`.

4) Environment-based API base URL
- Development: uses Vite dev proxy via `/webhook` (no CORS issues)
- Production: calls Railway directly using absolute URL
- Source: `src/config/n8n.ts`

---

## Environment Variables
Create `.env.local` (ignored by Git) with:
```bash
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

Notes
- Never commit secret keys. Use only the Supabase anon/publishable key on client.
- On Vercel, set the same variables in Project Settings → Environment Variables.

---

## Development
Requirements: Node 18+, pnpm/npm, Git.

Install and run:
```bash
pnpm i        # or npm i
pnpm dev      # or npm run dev
```

Dev URLs
- App: `http://localhost:8080`
- API base (proxied): `/webhook`

Tests:
```bash
pnpm test
```

Lint:
```bash
pnpm lint
```

Build locally:
```bash
pnpm build
pnpm preview
```

---

## Production (Vercel)

Routing
- SPA fallback configured in `vercel.json` so client routes (e.g. `/posts/:id`) render `index.html` and let the client router handle them.

API Base in Production
- The app calls Railway directly to avoid SPA fallback issues:
  - `https://primary-production-e91c.up.railway.app/webhook`
- Defined in `src/config/n8n.ts` for `import.meta.env.PROD`.

Deploy Steps
1. Push to `main`
2. Vercel builds and deploys
3. Validate network calls return JSON (not HTML)

---

## Features
- Authentication (register, login, logout, email confirmation)
- Post CRUD with pagination, search, filters
- Public/private visibility with colored indicators on `PostCard` (green=public, red=private)
- Share button for public posts
- Responsive UI with shadcn-ui

---

## Key Files & Directories
- `src/services/api.ts`: API client (axios) + Supabase auth HTTP (when applicable)
- `src/lib/supabase.ts`: Supabase SDK client and helpers
- `src/config/n8n.ts`: Determines API base URL per environment
- `src/pages/*`: Pages (Posts, PostDetail, PublicPosts, Auth, etc.)
- `src/components/*`: Reusable UI components
- `vercel.json`: SPA routing

---

## Troubleshooting

1) Receiving HTML instead of JSON in production
- Symptoms: `content-type: text/html`, `content-disposition: index.html`, `x-vercel-cache: HIT`.
- Cause: Calling a path handled by SPA fallback.
- Fix: Production API base uses absolute Railway URL (already configured in `src/config/n8n.ts`). Redeploy and verify `/webhook/*` returns JSON.

2) Supabase error: "Invalid API key"
- Cause: Missing or wrong `VITE_SUPABASE_ANON_KEY`.
- Fix: Add `.env.local` with correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Restart dev server. On Vercel, set env vars.

3) 404 on client routes (/posts/:id)
- Cause: No SPA fallback.
- Fix: `vercel.json` includes filesystem handle + fallback to `/index.html`.

4) CORS in development
- Use Vite proxy via `/webhook` (already configured). Do not add custom CORS headers on the client.

5) CI Lint errors
- Run `pnpm lint`. Warnings about unused variables can be fixed or prefixed with `_` when intentional.

---

## Security Notes
- Use only Supabase anon/publishable key on the client.
- Do not expose service role keys.
- Ensure RLS is enabled on tables and policies are configured.

---

## Scripts
```json
{
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "test": "vitest",
  "lint": "eslint ."
}
```

---

## License
MIT
