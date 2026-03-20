# BizLab - Technology Stack

## Stack Summary

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 15.1.3 |
| UI Library | React | 18.3.1 |
| Language | TypeScript | 5.x |
| ORM | Prisma | 6.19.2 |
| Database | PostgreSQL (Vercel Postgres / Neon) | - |
| Styling | Tailwind CSS | 4.x |
| Validation | Zod | 3.25.76 |
| Testing | Vitest | 4.1.0 |
| Linting | ESLint | 9.x |
| Runtime | Node.js | 20.x LTS |
| Deployment | Vercel | - |

## Framework: Next.js 15.1.3 with App Router

### Why Next.js

- **Full-stack in one framework**: Server-side API routes and client-side UI share the same codebase, reducing infrastructure complexity for a small project.
- **App Router**: The latest routing paradigm with React Server Components, enabling server-side data fetching without client-side JavaScript overhead.
- **Built-in optimizations**: Automatic code splitting, image optimization, and font loading out of the box.
- **Large ecosystem**: Extensive community support, documentation, and third-party integrations.

### Key Features Used

- **Route Handlers** (`route.ts`): REST API endpoints for paper CRUD operations and metadata extraction, replacing the need for a separate backend server.
- **Server Components**: Default rendering mode for pages that read data, reducing client-side bundle size.
- **Client Components**: Used selectively for interactive elements like forms, search inputs, modals, and the papers page client state manager (`PapersPageClient.tsx`).
- **Dynamic Routes** (`[id]`): Parameter-based routing for paper detail and edit pages.
- **Loading States** (`loading.tsx`): Skeleton loading UI for improved perceived performance.
- **Not Found** (`not-found.tsx`): Custom 404 pages for missing papers.
- **Redirects**: Root page redirects to `/papers`.

## Language: TypeScript

### Why TypeScript

- **Type safety**: Catches data shape errors at compile time, critical for API request/response handling and database operations.
- **Developer experience**: Autocompletion, refactoring support, and inline documentation through type definitions.
- **Prisma integration**: Prisma generates TypeScript types from the database schema, ensuring end-to-end type safety from database to UI.
- **Industry standard**: Widely adopted in the Next.js ecosystem with first-class support.

## ORM: Prisma 6.19.2

### Why Prisma

- **Declarative schema**: The `schema.prisma` file serves as the single source of truth for the data model, readable by both developers and non-developers.
- **Auto-generated client**: Type-safe database queries generated from the schema, eliminating manual SQL and reducing runtime errors.
- **Migration system**: Automatic migration generation tracks schema changes over time with rollback capability.
- **PostgreSQL support**: First-class PostgreSQL support with connection pooling compatibility for serverless environments.

### Key Features Used

- **Prisma Client**: Auto-generated query builder with full TypeScript type inference, instantiated as a singleton in `src/lib/prisma.ts`.
- **Prisma Migrate**: Schema migration management for database evolution.
- **Connection Pooling**: Supports both pooled (`DATABASE_URL`) and direct (`DATABASE_URL_UNPOOLED`) connections for Vercel Postgres / Neon.

## Database: PostgreSQL (Vercel Postgres / Neon)

### Why PostgreSQL

- **Production-ready**: Robust, battle-tested relational database suitable for production workloads.
- **Vercel integration**: Managed PostgreSQL via Vercel Postgres (powered by Neon) with automatic provisioning, connection pooling, and serverless compatibility.
- **Connection pooling**: Pooled connections via `DATABASE_URL` for serverless function compatibility; direct connections via `DATABASE_URL_UNPOOLED` for Prisma migrations.
- **Scalable**: Handles concurrent reads and writes without the limitations of file-based databases.

## Styling: Tailwind CSS 4

### Why Tailwind CSS

- **Utility-first approach**: Rapid UI development without context-switching between HTML and CSS files.
- **Design consistency**: Built-in design tokens (spacing, colors, typography) enforce visual consistency across the application.
- **Small production bundle**: Unused styles are automatically purged, resulting in minimal CSS output.
- **Next.js integration**: First-class support with zero additional configuration.

### Key Features Used

- **Responsive design**: Mobile-first responsive utilities for all screen sizes.
- **Custom theme**: Extended configuration for project-specific colors and typography.

## Validation: Zod 3.25.76

### Why Zod

- **TypeScript-first**: Schema definitions automatically infer TypeScript types, avoiding duplicate type declarations.
- **Runtime validation**: Validates API request bodies at runtime, complementing TypeScript's compile-time checks.
- **Composable schemas**: 4 schemas defined in `src/lib/validations.ts` used across API routes.
- **Error messages**: Structured error output suitable for API responses.

## Testing: Vitest 4.1.0

### Why Vitest

- **Fast execution**: Native ESM support with instant hot module replacement for rapid test feedback.
- **Vitest-compatible with Jest API**: Familiar testing API with describe/it/expect patterns.
- **TypeScript support**: First-class TypeScript support without additional configuration.
- **Prisma mocking**: Integrated with Prisma mocks for database layer testing.

### Test Coverage

- **5 test files** with **67 tests** (all passing)
- Covers: Zod schema validation, utility functions, API routes (papers CRUD + auth verification)
- Test infrastructure in `src/__tests__/` with setup, mocks, and helpers

## Linting: ESLint 9

### Configuration

- ESLint 9 flat config format
- Next.js recommended rules
- TypeScript-aware linting

## Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| DATABASE_URL | PostgreSQL connection string (pooled) | postgres://...?pgbouncer=true |
| DATABASE_URL_UNPOOLED | PostgreSQL direct connection (for migrations) | postgres://... |
| ADMIN_PASSWORD | Admin password for edit/delete operations | (secret) |

## Deployment

### Platform: Vercel

- **Automatic GitHub deployment**: Pushes to the main branch trigger automatic builds and deployments.
- **Production URL**: https://bizlab-chi.vercel.app
- **Vercel Postgres**: Managed PostgreSQL integration powered by Neon with automatic connection pooling.
- **Serverless functions**: API routes run as Vercel serverless functions with automatic scaling.
- **Edge optimization**: Static pages served from Vercel's edge network for low latency.

### Development Scripts

| Script | Purpose |
|--------|---------|
| `dev` | Start Next.js development server with hot reload |
| `build` | Build production bundle |
| `start` | Start production server |
| `lint` | Run ESLint checks |
| `test` | Run Vitest test suite |

### Prerequisites

- **Node.js**: Version 20.x LTS or later
- **npm**: Package management
- **Git**: Version control
- **PostgreSQL**: Database (managed by Vercel Postgres in production)
