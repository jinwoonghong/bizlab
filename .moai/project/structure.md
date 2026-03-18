# BizLab - Project Structure

## Recommended Directory Layout

The project follows the Next.js App Router convention with a full-stack architecture. All source code resides under the `src/` directory.

```
bizlab/
├── .env                        # Environment variables (DATABASE_URL, ADMIN_PASSWORD)
├── .env.example                # Template for environment variables
├── .gitignore
├── next.config.ts              # Next.js configuration
├── package.json
├── tsconfig.json
├── tailwind.config.ts          # Tailwind CSS configuration
├── postcss.config.js
├── prisma/
│   ├── schema.prisma           # Database schema definition
│   ├── seed.ts                 # Database seed script
│   └── migrations/             # Auto-generated migration files
├── public/
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout (global styles, metadata)
│   │   ├── page.tsx            # Home page (paper listing)
│   │   ├── globals.css         # Global styles and Tailwind directives
│   │   ├── papers/
│   │   │   ├── page.tsx        # Paper list page with search/filter
│   │   │   ├── new/
│   │   │   │   └── page.tsx    # Paper registration form
│   │   │   └── [id]/
│   │   │       ├── page.tsx    # Paper detail view
│   │   │       └── edit/
│   │   │           └── page.tsx # Paper edit form (password-protected)
│   │   └── api/
│   │       ├── papers/
│   │       │   ├── route.ts    # GET (list/search), POST (create)
│   │       │   └── [id]/
│   │       │       └── route.ts # GET (detail), PUT (update), DELETE (remove)
│   │       └── auth/
│   │           └── verify/
│   │               └── route.ts # POST (admin password verification)
│   ├── components/
│   │   ├── ui/                 # Reusable UI primitives
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Pagination.tsx
│   │   │   └── Badge.tsx
│   │   ├── papers/             # Paper-specific components
│   │   │   ├── PaperCard.tsx   # Paper summary card for list view
│   │   │   ├── PaperForm.tsx   # Shared form for create/edit
│   │   │   ├── PaperDetail.tsx # Full paper detail display
│   │   │   └── PaperList.tsx   # Paper list with pagination
│   │   ├── search/             # Search and filter components
│   │   │   ├── SearchBar.tsx   # Text search input
│   │   │   └── FilterPanel.tsx # Filter controls (author, keyword, year)
│   │   ├── auth/               # Authentication components
│   │   │   └── PasswordModal.tsx # Admin password input modal
│   │   └── layout/             # Layout components
│   │       ├── Header.tsx      # Site header with navigation
│   │       └── Footer.tsx      # Site footer
│   ├── lib/
│   │   ├── prisma.ts           # Prisma client singleton
│   │   ├── validations.ts      # Zod schemas for input validation
│   │   └── utils.ts            # Shared utility functions
│   └── types/
│       └── index.ts            # TypeScript type definitions
└── .moai/
    └── project/
        ├── product.md
        ├── structure.md
        └── tech.md
```

## Directory Responsibilities

### `src/app/` - Pages and API Routes

Follows the Next.js App Router file-system routing convention. Each directory under `app/` maps to a URL route. The `api/` subdirectory contains server-side Route Handlers that serve as the REST API layer.

### `src/components/` - React Components

Organized by domain concern:

- **ui/**: Generic, reusable UI primitives with no business logic
- **papers/**: Components specific to paper display and management
- **search/**: Search input and filter controls
- **auth/**: Password verification modal
- **layout/**: Page-level layout components (header, footer)

### `src/lib/` - Shared Libraries

Contains utility code shared across the application:

- **prisma.ts**: Singleton Prisma client instance to avoid multiple connections in development
- **validations.ts**: Zod validation schemas used by both API routes and form components
- **utils.ts**: General-purpose helper functions

### `src/types/` - Type Definitions

Centralized TypeScript type definitions and interfaces used across the application.

### `prisma/` - Database Layer

Contains the Prisma schema, migration files, and seed script. The schema defines the data model for papers, and migrations track schema evolution over time.

## Data Model Overview

### Paper

The primary entity with fields for: id, title, authors (stored as JSON array), abstract, keywords (stored as JSON array), url, year, journal, doi, volume, pages, createdAt, updatedAt.

### Design Decisions

- **Authors and Keywords as JSON arrays**: Simplifies the schema for a small-scale application while still supporting multiple values. Avoids the complexity of separate junction tables for a lightweight use case.
- **No User model**: The application uses a single admin password stored as an environment variable, eliminating the need for a user authentication system.
- **SQLite database**: File-based storage suitable for single-server deployment with no external database dependency.
