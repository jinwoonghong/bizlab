# SPEC-PAPER-001: Implementation Plan

## Metadata

| Field | Value |
|-------|-------|
| SPEC ID | SPEC-PAPER-001 |
| Title | BizLab MVP - Research Paper Management System |
| Priority | High |

---

## 1. Implementation Phases

### Phase 1: Foundation Setup (Primary Goal)

**Scope**: Project initialization, database schema, and core infrastructure.

**Tasks:**

1. **T1.1** Initialize Next.js 15 project with TypeScript, Tailwind CSS 4, App Router
2. **T1.2** Configure Prisma 6 with SQLite provider and define Paper schema
3. **T1.3** Run initial migration and create seed script with sample papers
4. **T1.4** Create Prisma client singleton (`src/lib/prisma.ts`)
5. **T1.5** Define Zod validation schemas (`src/lib/validations.ts`)
6. **T1.6** Define TypeScript types (`src/types/index.ts`)
7. **T1.7** Set up environment variables (`.env`, `.env.example`)
8. **T1.8** Configure root layout with global styles and metadata

**Dependencies**: None (starting phase)

**Deliverables**:
- Working Next.js project with database
- Prisma schema with Paper model
- Zod schemas for paper creation/update
- Seed data for development

---

### Phase 2: API Layer (Primary Goal)

**Scope**: REST API endpoints for all paper operations.

**Tasks:**

1. **T2.1** Implement `GET /api/papers` - List with pagination, search, filter, sort
2. **T2.2** Implement `POST /api/papers` - Create paper with Zod validation
3. **T2.3** Implement `GET /api/papers/[id]` - Get single paper detail
4. **T2.4** Implement `PUT /api/papers/[id]` - Update paper with password verification
5. **T2.5** Implement `DELETE /api/papers/[id]` - Delete paper with password verification
6. **T2.6** Implement `POST /api/auth/verify` - Admin password verification endpoint
7. **T2.7** Implement utility functions (`src/lib/utils.ts`)

**Dependencies**: Phase 1 (database schema and validation schemas)

**Deliverables**:
- Complete REST API for paper CRUD
- Admin password verification endpoint
- Structured error response format
- Query parameter handling for search/filter/sort

---

### Phase 3: UI Components (Secondary Goal)

**Scope**: Reusable UI primitives and layout components.

**Tasks:**

1. **T3.1** Create UI primitives: Button, Input, Modal, Pagination, Badge
2. **T3.2** Create layout components: Header, Footer
3. **T3.3** Create PaperCard component (list item)
4. **T3.4** Create PaperForm component (shared create/edit form)
5. **T3.5** Create PaperDetail component (full detail display)
6. **T3.6** Create PaperList component (list with pagination)
7. **T3.7** Create SearchBar component
8. **T3.8** Create FilterPanel component (author, keyword, year filters)
9. **T3.9** Create PasswordModal component

**Dependencies**: Phase 1 (types, validation schemas)

**Deliverables**:
- Complete component library
- Responsive design with Tailwind CSS
- Consistent UI patterns across all components

---

### Phase 4: Page Integration (Secondary Goal)

**Scope**: Connect pages with API and components.

**Tasks:**

1. **T4.1** Implement home page (redirect to /papers)
2. **T4.2** Implement paper list page with search, filter, pagination
3. **T4.3** Implement paper registration page (new)
4. **T4.4** Implement paper detail page
5. **T4.5** Implement paper edit page with password protection
6. **T4.6** Implement loading states (loading.tsx) and error boundaries (error.tsx)
7. **T4.7** Add metadata (page titles, descriptions) for each route

**Dependencies**: Phase 2 (API), Phase 3 (components)

**Deliverables**:
- All pages functional and connected
- Loading and error states handled
- SEO metadata configured

---

### Phase 5: Polish and Optional Features (Final Goal)

**Scope**: UX enhancements, dark mode, and quality improvements.

**Tasks:**

1. **T5.1** Implement dark mode toggle with preference persistence
2. **T5.2** Add sorting options to paper list
3. **T5.3** Optimize responsive design for mobile devices
4. **T5.4** Add empty state messages for no results
5. **T5.5** Final UI polish and accessibility review

**Dependencies**: Phase 4 (all pages functional)

**Deliverables**:
- Dark mode support
- Enhanced UX with sort options and empty states
- Mobile-responsive layout

---

## 2. Technical Approach

### 2.1 Architecture Strategy

- **Server Components**: Default for pages (PaperList, PaperDetail) for server-side data fetching
- **Client Components**: Used for interactive elements (PaperForm, SearchBar, FilterPanel, PasswordModal)
- **Route Handlers**: REST API in `src/app/api/` for all data operations
- **Validation**: Zod schemas shared between API routes and form components

### 2.2 Data Flow

```
User Action -> Client Component -> API Route Handler -> Prisma Client -> SQLite
                                                     <- Response
                                 <- JSON Response
              <- UI Update
```

### 2.3 Search and Filter Strategy

- Full-text search: Prisma `contains` filter on title and abstract fields (case-insensitive)
- Author filter: JSON array search using Prisma's `string_contains` on authors field
- Keyword filter: JSON array search using Prisma's `string_contains` on keywords field
- Year range: Simple numeric comparison with `gte` and `lte`
- Combined filters: AND logic for multiple criteria

### 2.4 Admin Password Strategy

- Password stored in `ADMIN_PASSWORD` environment variable
- Client sends password via `POST /api/auth/verify` to get verification result
- Protected API routes (PUT, DELETE) accept password in `x-admin-password` header
- Server-side comparison only; password never returned in responses

### 2.5 Pagination Strategy

- Offset-based pagination using Prisma `skip` and `take`
- Default: 10 items per page, max 50
- Response includes total count for UI pagination controls

---

## 3. Risk Analysis

### 3.1 Technical Risks

| Risk | Severity | Probability | Mitigation |
|------|----------|-------------|------------|
| SQLite JSON query performance for large datasets | Medium | Low | Acceptable for MVP scale (<10K papers); monitor and migrate to PostgreSQL if needed |
| Full-text search limitations with SQLite | Medium | Medium | Use Prisma `contains` for MVP; consider SQLite FTS5 extension or external search if needed |
| Tailwind CSS 4 breaking changes | Low | Low | Pin version in package.json; follow official migration guide |
| Prisma 6 API changes | Low | Low | Follow Prisma upgrade guide; use stable APIs only |

### 3.2 Scope Risks

| Risk | Severity | Probability | Mitigation |
|------|----------|-------------|------------|
| Feature creep beyond MVP | Medium | Medium | Strict adherence to SPEC requirements; optional features clearly marked |
| Admin password model insufficient | Low | Low | Designed for small team use; document upgrade path to proper auth if needed |

### 3.3 Assumptions to Validate

| Assumption | Validation Method |
|------------|------------------|
| A1: SQLite handles target scale | Load test with 10K sample papers |
| A2: Single admin password is adequate | User feedback after initial deployment |
| A3: JSON arrays for authors/keywords | Test query performance with varied data |

---

## 4. Expert Consultation Recommendations

### 4.1 Frontend Expert Consultation (Recommended)

This SPEC includes significant UI components (9 components, 5 pages) with:
- Responsive design requirements
- Dark mode implementation
- Search/filter interactive patterns
- Modal-based password verification
- Pagination UI

**Recommendation**: Consult `expert-frontend` during Phase 3 and Phase 4 for component architecture and UX patterns.

### 4.2 Backend Expert Consultation (Optional)

The API layer is relatively straightforward (CRUD + search), but consultation may help with:
- Optimizing SQLite queries for search/filter combinations
- Admin password verification patterns
- Error response standardization

**Recommendation**: Consult `expert-backend` during Phase 2 if complex query patterns emerge.
