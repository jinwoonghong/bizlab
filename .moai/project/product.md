# BizLab - Product Definition

## Project Overview

- **Name**: BizLab
- **Type**: Web Application
- **Status**: New Project

## Description

BizLab is a research paper management service that enables researchers to easily register, manage, and browse research paper information including original text links and metadata. Edit and delete operations require an admin password configured in advance, ensuring controlled access to data modification while keeping read access open to all users.

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

### 2. Paper Listing and Viewing

- Paginated list view of all registered papers
- Detailed single-paper view with full metadata display
- Sorted display options (by date added, publication year, title)

### 3. Search and Filtering

- Full-text search across titles and abstracts
- Filter by author name
- Filter by keyword tags
- Filter by publication year or year range
- Combined filter support for refined results

### 4. Admin Password-Based Access Control

- A single admin password is configured at the application level
- Edit and delete operations require the admin password
- No user account system; lightweight security model suitable for small teams
- Password verification occurs server-side for each protected operation

### 5. Database Integration

- Persistent storage for all paper records
- Relational data model supporting papers, authors, and keywords
- Data integrity with proper constraints and validation

## Use Cases

### Use Case 1: Registering a New Paper

A researcher finds a relevant paper and wants to add it to the lab's collection. They navigate to the registration form, fill in the title, authors, abstract, keywords, and a link to the original source, then submit. The paper is immediately available for browsing and searching.

### Use Case 2: Searching for Related Work

A researcher preparing a literature review searches for papers by keyword "machine learning" and filters by year range 2023-2025. The system returns matching papers with titles, authors, and links for quick access.

### Use Case 3: Updating Paper Information

A lab member notices incorrect metadata on a paper entry. They click edit, enter the admin password, correct the information, and save. The updated record is immediately reflected across all views.

### Use Case 4: Removing Outdated Entries

An administrator decides to remove papers that are no longer relevant. They select the paper, click delete, confirm with the admin password, and the entry is removed from the database.

### Use Case 5: Browsing the Collection

A new lab member browses the full paper collection to familiarize themselves with the research group's focus areas, using the list view sorted by publication year.
