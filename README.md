# Syncbot

Frontend for Syncbot — Next.js 16 + better-auth. A clean template for building authenticated apps with a separate backend.

## Stack

| Category | Choice |
|----------|--------|
| Framework | Next.js 16 (App Router, React 19) |
| Package Manager | Bun |
| Auth | better-auth + @better-auth-ui/react |
| UI | shadcn/ui (Radix primitives, OKLCH colors) |
| Styling | Tailwind CSS v4 (CSS-first config via `@theme inline`) |
| Linting | Biome |
| Formatting | Prettier (.ts/.tsx) |

## Setup

```bash
bun install
```

```bash
cp .env.example .env.local
# Edit NEXT_PUBLIC_BETTER_AUTH_URL if your backend runs elsewhere
```

```bash
bun dev
```

## Architecture

```
app/
├── (auth)/          # Auth pages (sign-in, sign-up, magic-link, etc.)
├── (dashboard)/     # Protected layout with sidebar
│   ├── dashboard/   # Dashboard + settings sub-routes
│   └── layout.tsx    # SidebarProvider + AppSidebar
├── (marketing)/     # Public pages
lib/
├── auth.ts           # authClient + getServerSession (route protection)
└── utils.ts          # cn() helper (clsx + tailwind-merge)
components/
├── auth/             # Auth forms (sign-in, sign-up, etc.)
├── providers/        # AuthProvider + Toaster wrappers
├── settings/         # Account + security settings components
├── ui/               # shadcn/ui components
└── user/             # UserButton, UserAvatar, UserView
```

**Auth flow:** This is a frontend-only repo. It connects to a `better-auth` backend at `http://localhost:3000` (configurable via `NEXT_PUBLIC_BETTER_AUTH_URL`). Server components protect routes with `getServerSession(cookieHeader)`. Client components use `useSession()` from `@better-auth-ui/react`.

## Commands

```bash
bun dev          # Dev server with Turbopack
bun build        # Production build
bun start        # Start production server
bun lint         # Biome lint (check only — no auto-fix)
bun format       # Prettier on .ts/.tsx
bun typecheck    # tsc --noEmit
```

**CI order:** lint → typecheck → build

## Adding components

```bash
bun x shadcn@latest add button
```

Components land in `components/ui/`. Import with `@/components/ui/<name>`.

## Routes

| Path | Description |
|------|-------------|
| `/auth/sign-in` | Sign in (email/password + social providers) |
| `/auth/sign-up` | Sign up |
| `/auth/reset-password` | Password reset flow |
| `/dashboard` | Protected — redirects to `/auth/sign-in` if no session |
| `/dashboard/settings/account` | Account settings |
| `/dashboard/settings/security` | Security settings (sessions, passkeys, linked accounts) |