# BizLab - Product Definition

## Project Overview

- **Name**: BizLab
- **Type**: Full-stack Web Application (Research Paper Management)
- **Status**: Production (deployed on Vercel)
- **Production URL**: https://bizlab-chi.vercel.app
- **GitHub**: https://github.com/jinwoonghong/bizlab
- **Language**: Korean (UI fully localized, html lang="ko")

## Description

BizLab is a research paper management service that enables researchers to easily register, manage, and browse research paper information including original text links and metadata. The application features an advanced metadata extraction engine that automatically fetches paper details from URLs across 13+ academic publishers. Edit and delete operations require an admin password configured in advance, ensuring controlled access to data modification while keeping read access open to all users. The entire user interface is localized in Korean.

## Target Audience

- **Primary Users**: Researchers and academic professionals who need to organize and retrieve research paper references
- **Secondary Users**: Research lab members, graduate students, and academic teams collaborating on literature management
- **Access Model**: Public read access for browsing and searching; password-protected write access for content management

## Core Features

### 1. Paper Registration

Register research papers with comprehensive metadata:

- Title (required)
- Authors (required, supports multiple authors)
- Abstract
- Keywords (supports multiple keywords for categorization)
- URL to original paper or source
- Publication year
- Additional metadata (journal name, DOI, volume, pages)

### 2. Advanced Metadata Extraction Engine

Automatically extract paper metadata from URLs with support for 13+ academic publishers:

- **Direct Lookup Services**: DOI resolution, arXiv API, Semantic Scholar API
- **Publisher URL Patterns**: Nature, ACM, Springer, Wiley, IEEE, ScienceDirect, PLOS, MDPI, Frontiers, APS, Science
- **PDF URL Handling**: Strips .pdf extension and fetches HTML version for metadata extraction
- **Universal Fallback**: Web page scraping using meta tags (citation_doi, dc.identifier, og:title)
- **Auto-Fetch on Paste**: Metadata extraction triggers automatically when a URL is pasted into the URL field

### 3. Paper Listing and Viewing

- Paginated list view of all registered papers (default 10, max 50 per page)
- Detailed single-paper view with full metadata display
- Skeleton loading states for improved perceived performance

### 4. Search and Filtering

- Full-text search across titles and abstracts
- Filter by author name
- Filter by keyword tags
- Filter by publication year or year range
- Sort options (by date added, publication year, title)
- Combined filter support for refined results

### 5. Admin Password-Based Access Control

- A single admin password is configured at the application level (ADMIN_PASSWORD env var)
- Edit and delete operations require the admin password via x-admin-password header
- No user account system; lightweight security model suitable for small teams
- Password verification occurs server-side for each protected operation
- Dedicated password verification endpoint for client-side validation

### 6. Korean Localization

- All UI text rendered in Korean
- HTML lang attribute set to "ko"
- Korean labels, buttons, messages, and navigation throughout the application

## Use Cases

### Use Case 1: Registering a Paper via URL

A researcher finds a relevant paper online and pastes its URL into the registration form. The metadata extraction engine automatically fetches the title, authors, abstract, DOI, journal, and other details from the publisher page. The researcher reviews the auto-filled fields, makes any corrections, and submits. The paper is immediately available for browsing and searching.

### Use Case 2: Searching for Related Work

A researcher preparing a literature review searches for papers by keyword and filters by year range 2023-2025. The system returns matching papers with titles, authors, and links for quick access.

### Use Case 3: Updating Paper Information

A lab member notices incorrect metadata on a paper entry. They click edit, enter the admin password, correct the information, and save. The updated record is immediately reflected across all views.

### Use Case 4: Removing Outdated Entries

An administrator decides to remove papers that are no longer relevant. They select the paper, click delete, confirm with the admin password, and the entry is removed from the database.

### Use Case 5: Browsing the Collection

A new lab member browses the full paper collection to familiarize themselves with the research group's focus areas, using the list view sorted by publication year.
