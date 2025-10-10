# Nexus Blog Creator

Modern blog platform with authentication, post management, analytics, comments system, and public sharing. Built with React, TypeScript, Vite, shadcn-ui, Supabase (Auth), and n8n (API on Railway). Deployed on Vercel.

### Overview
- Auth: Supabase Email/Password (SDK) with email confirmation flow
- Posts: Create, edit, delete, list, pagination, filters, share links with rich text editor
- Images: Upload and manage images with built-in image editor
- Analytics: Comprehensive dashboard with post performance metrics
- Comments: Full-featured commenting system with moderation
- Templates: Pre-built post templates for faster content creation
- Backup: Local backup and restore functionality
- Notifications: Real-time notification system
- Visibility: Public or private posts with visual status indicators
- API: n8n workflow hosted on Railway (webhook) consumed by the frontend
- Deploy: Vercel (SPA routing + proxy strategy as needed)

---

## Tech Stack
- React + TypeScript + Vite
- pnpm (package manager)
- Tailwind CSS + shadcn-ui
- Supabase (Auth SDK)
- n8n (REST via Webhooks) on Railway
- Vercel (hosting)
- Vitest + React Testing Library (tests)
- Recharts (analytics charts)
- date-fns (date formatting)
- Lucide React (icons)

---

## Development Setup

### Prerequisites
- [Node.js](https://nodejs.org) 18+ 
- [pnpm](https://pnpm.io) (latest version)

### Installation
```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev

# Run tests
pnpm run test

# Build for production
pnpm run build
```

### Available Scripts
- `pnpm run dev` - Start development server
- `pnpm run build` - Build for production
- `pnpm run test` - Run tests in watch mode
- `pnpm run test:run` - Run tests once
- `pnpm run test:ci` - Run CI pipeline (lint + type-check + tests + build)
- `pnpm run lint` - Run ESLint
- `pnpm run lint:fix` - Fix ESLint issues
- `pnpm run type-check` - Run TypeScript type checking

---

## Architecture & Data Flow
1) Frontend (Vite SPA)
- Routes like `/posts`, `/posts/:id`, `/posts/:id/edit`, `/public`, `/dashboard` etc.
- Components: `PostCard`, `PostForm`, `PostFilters`, `PostsPagination`, `RichEditorPro`, `AnalyticsDashboard`, `CommentsSection`, `NotificationSystem`, `BackupManager`.
- Hooks: `usePosts`, `useAsyncOperation`, `usePasswordVisibility`, `useFormValidation`, `useComments`, `useNotifications`, `useKeyboardShortcuts`.
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
# Supabase Configuration
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>

# Redis Configuration (Optional - falls back to memory cache if not provided)
VITE_REDIS_URL=redis://localhost:6379
VITE_REDIS_PASSWORD=<your-redis-password>
VITE_REDIS_DB=0

# API Configuration
VITE_API_BASE_URL=https://your-n8n-instance.up.railway.app/webhook
```

Notes
- Never commit secret keys. Use only the Supabase anon/publishable key on client.
- Redis is optional - the app will use memory cache as fallback if Redis is unavailable.
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

### 🔐 Authentication
- Register, login, logout with email confirmation
- Password reset functionality
- Protected routes and session management

### 📝 Post Management
- **Rich Text Editor**: Advanced editor with formatting, links, lists, and more
- **Image Management**: Upload, edit, and manage images with built-in editor
- **Post Templates**: Pre-built templates (Tutorial, Review, List, News)
- **CRUD Operations**: Create, read, update, delete with pagination
- **Search & Filters**: Advanced filtering by tags, author, date, and content
- **Visibility Control**: Public/private posts with visual indicators
- **Share Functionality**: Social sharing for public posts
- **Auto-save**: Automatic saving of draft content

### 📊 Analytics Dashboard
- Overview with key metrics (posts, views, comments, likes)
- Visual charts showing post performance over time
- Top performing posts analysis
- Recent activity tracking
- Engagement distribution charts

### 💬 Comments System
- Nested comments with replies
- Like functionality
- Comment moderation (approve/reject)
- Real-time comment updates
- Guest and authenticated user support

### 🔔 Notifications
- Real-time notification system
- Email, push, and in-app notifications
- Configurable notification preferences
- Activity-based notifications

### 🗂️ Templates
- Pre-built post templates for faster content creation
- Custom template creation and management
- Template categories (Tutorial, Review, List, News)

### 💾 Backup & Restore
- Local backup functionality
- Export to JSON, Markdown, and HTML formats
- Restore from backups
- Automatic backup management

### 🔍 Advanced Search
- Full-text search across posts
- Filter by author, tags, date range
- Sort by relevance, date, reading time, title
- Active filter display

### ⌨️ Keyboard Shortcuts
- Quick navigation shortcuts
- Post creation and editing shortcuts
- Theme toggle shortcuts
- Help modal with shortcut reference

### 🎛️ Dashboard Features
- **Overview Tab**: Key metrics and recent activity
- **Analytics Tab**: Detailed performance charts and insights
- **Comments Tab**: Comment management and moderation
- **Templates Tab**: Post template management
- **Search Tab**: Advanced search functionality
- **Notifications Tab**: Notification management and preferences
- **Backup Tab**: Backup and restore operations
- **Config Tab**: System settings and preferences

### 🌐 Internationalization
- Full Portuguese (Brazil) localization
- Translated dashboard interface
- Localized date formatting
- Portuguese error messages and notifications

### 🎨 User Experience
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dark/Light Theme**: Theme toggle with system preference detection
- **Loading States**: Skeleton loaders and progress indicators
- **Error Handling**: User-friendly error messages and recovery options
- **Accessibility**: ARIA labels, keyboard navigation, and screen reader support
- **Performance**: Optimized rendering and lazy loading
- **Toast Notifications**: Non-intrusive feedback system
- **Confirmation Dialogs**: Safe deletion and action confirmations

### ⚡ Performance & Caching
- **Redis Cache**: Cache-Aside Pattern implementation with Redis backend
- **Memory Fallback**: Automatic fallback to memory cache if Redis unavailable
- **Smart Invalidation**: Automatic cache invalidation on data changes
- **TTL Management**: Configurable time-to-live for different data types
- **Cache Statistics**: Real-time cache monitoring and management
- **Optimistic Updates**: Immediate UI updates for better UX

---

## Key Files & Directories

### Core Services
- `src/services/api.ts`: API client (axios) + Supabase auth HTTP
- `src/services/analytics.ts`: Analytics data processing and calculations
- `src/services/comments.ts`: Comments management and local storage
- `src/services/notifications.ts`: Notification system and preferences
- `src/lib/supabase.ts`: Supabase SDK client and helpers
- `src/config/n8n.ts`: Determines API base URL per environment

### Pages & Components
- `src/pages/*`: Pages (Posts, PostDetail, PublicPosts, Auth, Dashboard, etc.)
- `src/components/*`: Reusable UI components
  - `RichEditorPro.tsx`: Advanced rich text editor
  - `AnalyticsDashboard.tsx`: Analytics charts and metrics
  - `CommentsSection.tsx`: Comments system with moderation
  - `NotificationSystem.tsx`: Notification management
  - `BackupManager.tsx`: Backup and restore functionality
  - `PostTemplates.tsx`: Template management
  - `AdvancedSearch.tsx`: Advanced search with filters
  - `ImageEditor.tsx`: Image upload and editing

### Hooks & Context
- `src/hooks/*`: Custom hooks for data management
  - `useComments.ts`: Comments state management
  - `useNotifications.ts`: Notification state management
  - `useKeyboardShortcuts.ts`: Keyboard shortcut handling
- `src/contexts/*`: React contexts for global state

### Utilities
- `src/lib/*`: Utility libraries
  - `backup-manager.ts`: Backup and restore logic
  - `rss-generator.ts`: RSS feed generation
  - `toast-helpers.ts`: Toast notification helpers
- `vercel.json`: SPA routing configuration

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

## Dependencies

### Core Dependencies
- `react` & `react-dom`: UI framework
- `typescript`: Type safety
- `vite`: Build tool and dev server
- `tailwindcss`: Utility-first CSS framework
- `@radix-ui/*`: Accessible UI primitives
- `lucide-react`: Icon library

### Analytics & Charts
- `recharts`: Chart library for analytics dashboard
- `date-fns`: Date manipulation and formatting

### State Management
- `@supabase/supabase-js`: Authentication and database
- `axios`: HTTP client for API calls

### Development
- `vitest`: Testing framework
- `@testing-library/react`: React testing utilities
- `eslint`: Code linting

## Scripts
```json
{
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "test": "vitest",
  "lint": "eslint .",
  "type-check": "tsc --noEmit"
}
```

---

## License
MIT
