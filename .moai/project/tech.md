# BizLab - Technology Stack

## Stack Summary

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 15.x |
| Language | TypeScript | 5.x |
| ORM | Prisma | 6.x |
| Database | SQLite | 3.x |
| Styling | Tailwind CSS | 4.x |
| Validation | Zod | 3.x |
| Runtime | Node.js | 20.x LTS |
| Package Manager | npm or pnpm | Latest |

## Framework: Next.js 15 with App Router

### Why Next.js

- **Full-stack in one framework**: Server-side API routes and client-side UI share the same codebase, reducing infrastructure complexity for a small project.
- **App Router**: The latest routing paradigm with React Server Components, enabling server-side data fetching without client-side JavaScript overhead.
- **Built-in optimizations**: Automatic code splitting, image optimization, and font loading out of the box.
- **Large ecosystem**: Extensive community support, documentation, and third-party integrations.

### Key Features Used

- **Route Handlers** (`route.ts`): REST API endpoints for paper CRUD operations, replacing the need for a separate backend server.
- **Server Components**: Default rendering mode for pages that read data, reducing client-side bundle size.
- **Client Components**: Used selectively for interactive elements like forms, search inputs, and modals.
- **Dynamic Routes** (`[id]`): Parameter-based routing for paper detail and edit pages.
- **Metadata API**: Built-in SEO support with dynamic page titles and descriptions.

## Language: TypeScript

### Why TypeScript

- **Type safety**: Catches data shape errors at compile time, critical for API request/response handling and database operations.
- **Developer experience**: Autocompletion, refactoring support, and inline documentation through type definitions.
- **Prisma integration**: Prisma generates TypeScript types from the database schema, ensuring end-to-end type safety from database to UI.
- **Industry standard**: Widely adopted in the Next.js ecosystem with first-class support.

## ORM: Prisma

### Why Prisma

- **Declarative schema**: The `schema.prisma` file serves as the single source of truth for the data model, readable by both developers and non-developers.
- **Auto-generated client**: Type-safe database queries generated from the schema, eliminating manual SQL and reducing runtime errors.
- **Migration system**: Automatic migration generation tracks schema changes over time with rollback capability.
- **SQLite support**: First-class SQLite support makes it easy to start development without external database setup.

### Key Features Used

- **Prisma Client**: Auto-generated query builder with full TypeScript type inference.
- **Prisma Migrate**: Schema migration management for database evolution.
- **Prisma Studio**: Visual database browser for development and debugging (accessed via `npx prisma studio`).
- **Seeding**: Database seed script for populating initial development data.

## Database: SQLite

### Why SQLite

- **Zero configuration**: File-based database requires no server process, installation, or connection management.
- **Portable**: The entire database is a single file, easy to back up, copy, or reset during development.
- **Sufficient for scope**: BizLab is a small-to-medium scale application serving a research lab; SQLite handles this workload efficiently.
- **Low operational cost**: No database server to maintain, monitor, or secure separately.

### Migration Path

If the application grows beyond SQLite's capabilities (concurrent write-heavy workloads, multi-server deployment), Prisma makes it straightforward to migrate to PostgreSQL by changing the provider in `schema.prisma` and updating the connection string.

## Styling: Tailwind CSS

### Why Tailwind CSS

- **Utility-first approach**: Rapid UI development without context-switching between HTML and CSS files.
- **Design consistency**: Built-in design tokens (spacing, colors, typography) enforce visual consistency across the application.
- **Small production bundle**: Unused styles are automatically purged, resulting in minimal CSS output.
- **Next.js integration**: First-class support with zero additional configuration.

### Key Features Used

- **Responsive design**: Mobile-first responsive utilities for all screen sizes.
- **Dark mode**: Built-in dark mode support via class strategy.
- **Custom theme**: Extended configuration for project-specific colors and typography.

## Validation: Zod

### Why Zod

- **TypeScript-first**: Schema definitions automatically infer TypeScript types, avoiding duplicate type declarations.
- **Runtime validation**: Validates API request bodies and form inputs at runtime, complementing TypeScript's compile-time checks.
- **Composable schemas**: Schemas can be composed and reused across API routes and form components.
- **Error messages**: Structured error output suitable for both API responses and form field validation.

## Development Environment Requirements

### Prerequisites

- **Node.js**: Version 20.x LTS or later
- **npm** (v10+) or **pnpm** (v9+): Package management
- **Git**: Version control

### Initial Setup Commands

1. Create the Next.js project with TypeScript and Tailwind CSS
2. Install Prisma and initialize with SQLite provider
3. Install Zod for validation
4. Configure the Prisma schema and run initial migration
5. Start the development server

### Environment Variables

The application requires the following environment variables defined in `.env`:

- `DATABASE_URL`: SQLite connection string (e.g., `file:./dev.db`)
- `ADMIN_PASSWORD`: The admin password required for edit and delete operations

### Development Scripts

| Script | Purpose |
|--------|---------|
| `dev` | Start Next.js development server with hot reload |
| `build` | Build production bundle |
| `start` | Start production server |
| `lint` | Run ESLint checks |
| `db:migrate` | Run Prisma migrations |
| `db:seed` | Seed database with sample data |
| `db:studio` | Open Prisma Studio for visual database management |

## Deployment Considerations

- **Vercel**: Recommended deployment platform for Next.js with zero configuration. SQLite works with Vercel if using a persistent filesystem or switching to a hosted database.
- **Self-hosted**: Can run on any Node.js server. SQLite file must be on persistent storage.
- **Database upgrade**: For production deployments with higher concurrency requirements, consider migrating to PostgreSQL or MySQL using Prisma's provider switching capability.
