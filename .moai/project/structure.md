# BizLab - Project Structure

## Directory Layout

The project follows the Next.js App Router convention with a full-stack architecture. All source code resides under the `src/` directory.

```
bizlab/
├── .env                        # Environment variables (DATABASE_URL, ADMIN_PASSWORD)
├── .env.example                # Template for environment variables
├── .gitignore
├── next.config.ts              # Next.js configuration
├── package.json
├── tsconfig.json
├── vitest.config.ts            # Vitest test configuration
├── postcss.config.js
├── prisma/
│   ├── schema.prisma           # Database schema definition (PostgreSQL)
│   └── migrations/             # Auto-generated migration files
├── public/
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout (Header/Footer, html lang="ko")
│   │   ├── page.tsx            # Home page (redirects to /papers)
│   │   ├── globals.css         # Global styles and Tailwind imports
│   │   ├── papers/
│   │   │   ├── page.tsx        # Paper list page (server component)
│   │   │   ├── PapersPageClient.tsx  # Client search/filter state
│   │   │   ├── loading.tsx     # Skeleton loading state
│   │   │   ├── new/
│   │   │   │   └── page.tsx    # Paper creation form
│   │   │   └── [id]/
│   │   │       ├── page.tsx    # Paper detail view
│   │   │       ├── not-found.tsx  # 404 page for missing papers
│   │   │       └── edit/
│   │   │           └── page.tsx   # Paper edit form (password-protected)
│   │   └── api/
│   │       ├── papers/
│   │       │   ├── route.ts          # GET (list/search/filter), POST (create)
│   │       │   ├── [id]/
│   │       │   │   └── route.ts      # GET (detail), PUT (update), DELETE (remove)
│   │       │   └── fetch-metadata/
│   │       │       └── route.ts      # POST (URL -> metadata extraction)
│   │       └── auth/
│   │           └── verify/
│   │               └── route.ts      # POST (admin password verification)
│   ├── components/
│   │   ├── ui/                 # Reusable UI primitives
│   │   │   ├── Badge.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Pagination.tsx
│   │   ├── papers/             # Paper-specific components
│   │   │   ├── PaperCard.tsx   # Paper summary card for list view
│   │   │   ├── PaperDetail.tsx # Full paper detail display
│   │   │   ├── PaperForm.tsx   # Shared form for create/edit with auto-fetch
│   │   │   └── PaperList.tsx   # Paper list with pagination
│   │   ├── search/             # Search and filter components
│   │   │   ├── SearchBar.tsx   # Text search input
│   │   │   └── FilterPanel.tsx # Filter controls (author, keyword, year)
│   │   ├── auth/               # Authentication components
│   │   │   └── PasswordModal.tsx  # Admin password input modal
│   │   └── layout/             # Layout components
│   │       ├── Header.tsx      # Site header with navigation
│   │       └── Footer.tsx      # Site footer
│   ├── lib/
│   │   ├── prisma.ts           # PrismaClient singleton
│   │   ├── validations.ts      # 4 Zod schemas for input validation
│   │   └── utils.ts            # Paper serialization (JSON <-> DB)
│   ├── types/
│   │   └── index.ts            # TypeScript interfaces
│   └── __tests__/              # Test setup, mocks, helpers
│       ├── setup.ts
│       ├── helpers/
│       └── mocks/
└── .moai/
    ├── project/
    │   ├── product.md
    │   ├── structure.md
    │   └── tech.md
    └── config/
        └── sections/
```

## Directory Responsibilities

### `src/app/` - Pages and API Routes

Follows the Next.js App Router file-system routing convention. Each directory under `app/` maps to a URL route. The `api/` subdirectory contains server-side Route Handlers that serve as the REST API layer. The root `page.tsx` redirects to `/papers`. The `papers/` directory uses a server component for the list page with a dedicated client component (`PapersPageClient.tsx`) for interactive search and filter state.

### `src/app/api/papers/fetch-metadata/` - Metadata Extraction API

Dedicated endpoint for the advanced metadata extraction engine. Accepts a URL via POST request and returns extracted paper metadata. Supports 13+ academic publishers with DOI, arXiv, and Semantic Scholar direct lookup, publisher-specific URL pattern matching, PDF URL handling, and universal web page scraping fallback.

### `src/components/` - React Components

Organized by domain concern:

- **ui/**: Generic, reusable UI primitives (Badge, Button, Input, Modal, Pagination) with no business logic
- **papers/**: Components specific to paper display and management, including the form with auto-fetch metadata capability
- **search/**: Search input and filter controls for the paper list
- **auth/**: Password verification modal for admin operations
- **layout/**: Page-level layout components (header, footer)

### `src/lib/` - Shared Libraries

Contains utility code shared across the application:

- **prisma.ts**: Singleton PrismaClient instance to avoid multiple connections in development
- **validations.ts**: 4 Zod validation schemas used by API routes for request validation
- **utils.ts**: Paper serialization helpers for converting between JSON string fields and typed objects

### `src/types/` - Type Definitions

Centralized TypeScript type definitions and interfaces used across the application.

### `src/__tests__/` - Test Infrastructure

Contains test setup, mock configurations, and helper utilities for the Vitest test suite. Individual test files are co-located with or reference source modules.

### `prisma/` - Database Layer

Contains the Prisma schema and migration files. The schema defines the Paper data model targeting PostgreSQL via Vercel Postgres (Neon).

## Data Model

### Paper

The primary entity with the following fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | String (cuid) | Auto | Primary key |
| title | String | Yes | Paper title |
| authors | String (JSON) | Yes | JSON-encoded array of author names |
| abstract | String | No | Paper abstract |
| keywords | String (JSON) | No | JSON-encoded array of keywords |
| url | String | No | URL to original paper |
| year | Int | No | Publication year |
| journal | String | No | Journal name |
| doi | String | No | Digital Object Identifier |
| volume | String | No | Journal volume |
| pages | String | No | Page range |
| createdAt | DateTime | Auto | Record creation timestamp |
| updatedAt | DateTime | Auto | Record update timestamp |

### Design Decisions

- **Authors and Keywords as JSON strings**: Simplifies the schema for a small-scale application while still supporting multiple values. Avoids the complexity of separate junction tables for a lightweight use case.
- **No User model**: The application uses a single admin password stored as an environment variable, eliminating the need for a user authentication system.
- **PostgreSQL via Vercel Postgres**: Production database hosted on Neon through Vercel's managed PostgreSQL integration, providing reliable cloud-hosted storage with connection pooling.

## API Endpoints

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | /api/papers | No | List papers with search, filter, and pagination |
| POST | /api/papers | No | Create a new paper |
| GET | /api/papers/[id] | No | Get paper detail by ID |
| PUT | /api/papers/[id] | Yes | Update paper (x-admin-password header) |
| DELETE | /api/papers/[id] | Yes | Delete paper (x-admin-password header) |
| POST | /api/papers/fetch-metadata | No | Extract metadata from a given URL |
| POST | /api/auth/verify | No | Verify admin password |
