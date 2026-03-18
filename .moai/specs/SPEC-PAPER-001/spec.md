# SPEC-PAPER-001: BizLab MVP - Research Paper Management System

## Metadata

| Field | Value |
|-------|-------|
| SPEC ID | SPEC-PAPER-001 |
| Title | BizLab MVP - Research Paper Management System |
| Status | Planned |
| Priority | High |
| Created | 2026-03-17 |
| Lifecycle | spec-first |

---

## 1. Environment

### 1.1 Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 15.x |
| Language | TypeScript | 5.x |
| ORM | Prisma | 6.x |
| Database | SQLite | 3.x |
| Styling | Tailwind CSS | 4.x |
| Validation | Zod | 3.x |
| Runtime | Node.js | 20.x LTS |

### 1.2 Project Type

- New project (greenfield)
- Full-stack web application
- Single-server deployment with file-based database

### 1.3 Target Users

- Primary: Researchers and academic professionals
- Secondary: Research lab members, graduate students
- Access Model: Public read / Password-protected write

---

## 2. Assumptions

- **A1**: SQLite is sufficient for the target scale (single research lab, < 10,000 papers)
- **A2**: A single admin password is adequate security for small team environments
- **A3**: Authors and keywords stored as JSON arrays is acceptable (no need for relational junction tables)
- **A4**: No user account system is needed; authentication is limited to admin password verification
- **A5**: The application will be deployed on a single server with persistent file storage
- **A6**: Dark mode is an optional enhancement, not a core requirement
- **A7**: All paper metadata fields except title and authors are optional

---

## 3. Requirements (EARS Format)

### 3.1 Ubiquitous Requirements (always active)

- **REQ-U01**: The system SHALL store all paper data in SQLite via Prisma ORM.
- **REQ-U02**: The system SHALL validate all user inputs using Zod schemas before processing.
- **REQ-U03**: The system SHALL return structured error responses for all API failures.
- **REQ-U04**: The system SHALL use TypeScript strict mode across the entire codebase.

### 3.2 Event-Driven Requirements (WHEN trigger THEN action)

- **REQ-E01**: WHEN a user submits the paper registration form with valid data, THEN the system SHALL create a new paper record and redirect to the paper detail page.
- **REQ-E02**: WHEN a user requests the paper list page, THEN the system SHALL return paginated results with default sorting by creation date (newest first).
- **REQ-E03**: WHEN a user clicks a paper in the list, THEN the system SHALL display the full detail view with all metadata fields.
- **REQ-E04**: WHEN a user submits a search query, THEN the system SHALL return papers matching the query across titles and abstracts.
- **REQ-E05**: WHEN a user applies filters (author, keyword, year range), THEN the system SHALL return only papers matching all active filter criteria.
- **REQ-E06**: WHEN a user provides the correct admin password, THEN the system SHALL allow the requested edit or delete operation.
- **REQ-E07**: WHEN a user submits an updated paper form with valid data, THEN the system SHALL update the existing paper record.
- **REQ-E08**: WHEN a user confirms paper deletion with a valid admin password, THEN the system SHALL permanently remove the paper record.

### 3.3 State-Driven Requirements (WHILE condition THEN behavior)

- **REQ-S01**: WHILE the admin password has not been verified for the current operation, the system SHALL disable edit and delete buttons on the paper detail page.
- **REQ-S02**: WHILE search filters are active, the system SHALL display only matching results and show active filter indicators.
- **REQ-S03**: WHILE the paper list is loading, the system SHALL display a loading skeleton UI.
- **REQ-S04**: WHILE no papers match the current search/filter criteria, the system SHALL display an empty state message.

### 3.4 Unwanted Behavior Requirements (SHALL NOT)

- **REQ-N01**: IF the admin password is incorrect, THEN the system SHALL display an error message and deny the edit/delete operation.
- **REQ-N02**: IF required fields (title, authors) are missing, THEN the system SHALL display validation errors and prevent form submission.
- **REQ-N03**: IF a paper ID does not exist, THEN the system SHALL return a 404 response.
- **REQ-N04**: The system SHALL NOT expose the admin password in API responses or client-side code.
- **REQ-N05**: The system SHALL NOT allow SQL injection or XSS through user inputs.

### 3.5 Optional Requirements (WHERE supported)

- **REQ-O01**: WHERE supported, the system SHALL provide a dark mode toggle that persists user preference.
- **REQ-O02**: WHERE supported, the system SHALL provide sorting options (by title, year, date added) on the paper list.

---

## 4. Specifications

### 4.1 Data Model

**Paper Entity:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | String (cuid) | Auto | Primary key |
| title | String | Yes | Paper title |
| authors | Json (String[]) | Yes | List of author names |
| abstract | String | No | Paper abstract |
| keywords | Json (String[]) | No | Keyword tags |
| url | String | No | Link to original paper |
| year | Int | No | Publication year |
| journal | String | No | Journal name |
| doi | String | No | Digital Object Identifier |
| volume | String | No | Journal volume |
| pages | String | No | Page range |
| createdAt | DateTime | Auto | Record creation timestamp |
| updatedAt | DateTime | Auto | Last update timestamp |

### 4.2 API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/papers | No | List papers (paginated, searchable, filterable) |
| POST | /api/papers | No | Create a new paper |
| GET | /api/papers/[id] | No | Get paper detail |
| PUT | /api/papers/[id] | Yes | Update paper (admin password required) |
| DELETE | /api/papers/[id] | Yes | Delete paper (admin password required) |
| POST | /api/auth/verify | - | Verify admin password |

**Query Parameters for GET /api/papers:**

| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 10, max: 50) |
| search | string | Full-text search query |
| author | string | Filter by author name |
| keyword | string | Filter by keyword |
| yearFrom | number | Filter by minimum year |
| yearTo | number | Filter by maximum year |
| sort | string | Sort field (createdAt, year, title) |
| order | string | Sort direction (asc, desc) |

### 4.3 Page Structure

| Route | Component | Description |
|-------|-----------|-------------|
| / | Home | Redirect to /papers |
| /papers | PaperList | Paginated list with search and filters |
| /papers/new | PaperForm | Paper registration form |
| /papers/[id] | PaperDetail | Full paper detail view |
| /papers/[id]/edit | PaperForm | Paper edit form (password-protected) |

### 4.4 Security Model

- Admin password stored in `ADMIN_PASSWORD` environment variable
- Password verification via server-side API route (`POST /api/auth/verify`)
- Protected operations (PUT, DELETE) require password in request header or body
- Password is never exposed to client-side code or API responses

---

## 5. Traceability

| Requirement | Product Feature | Component |
|-------------|----------------|-----------|
| REQ-U01, REQ-U02 | Database Integration | prisma.ts, validations.ts |
| REQ-E01, REQ-E07 | Paper Registration | PaperForm, POST/PUT /api/papers |
| REQ-E02, REQ-E03 | Paper Listing/Viewing | PaperList, PaperDetail, GET /api/papers |
| REQ-E04, REQ-E05 | Search and Filtering | SearchBar, FilterPanel, GET /api/papers |
| REQ-E06, REQ-E08 | Access Control | PasswordModal, auth/verify |
| REQ-S01 | Access Control | PaperDetail (button state) |
| REQ-S02 | Search and Filtering | PaperList (filter indicators) |
| REQ-N01 ~ REQ-N05 | Security / Validation | API routes, validations.ts |
| REQ-O01 | Dark Mode | layout.tsx, globals.css |
| REQ-O02 | Sorting | PaperList, GET /api/papers |
