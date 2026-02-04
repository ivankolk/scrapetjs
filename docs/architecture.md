# System Architecture

## Overview

Threads Scraper is a Next.js service that provides an API to extract data from Threads.net posts. It leverages Playwright for browser automation to handle Javascript-heavy rendering and hidden data extraction.

## Core Components

### 1. API Layer (`src/app/api`)

- **Route:** `/api/scrape`
- **Framework:** Next.js App Router
- **Role:** Handles incoming HTTP requests, validates input using Zod, and orchestrates the scraping process.
- **Error Handling:** Maps internal errors to appropriate HTTP status codes and JSON error responses.

### 2. Scraper Service (`src/lib/scraper`)

The core logic resides here, split into specialized modules:

- **`threadsScraper.ts`**: The main coordinator. It manages the scraping workflow:
  1.  Validates URL.
  2.  Launches Browser.
  3.  Navigates to page.
  4.  Handles dynamic loading (scrolling) to fetch requested number of posts.
  5.  Extracts hidden data.
  6.  Parses and transforms data.
  7.  Returns structured result.
- **`browser.ts`**: Wrapper around Playwright. Handles browser launching, context management, and page navigation. Includes logic for headless execution and resource cleanup.
- **`parser.ts`**: Responsible for parsing the raw HTML/JSON data extracted from Threads and transforming it into our internal `ThreadPost` types.

### 3. Utility Layer (`src/lib/utils`)

- **`validators.ts`**: Validates Threads URLs.
- **`errors.ts`**: Custom error classes for structured error handling (e.g., `ValidationError`, `ScraperError`).

## Data Flow

1.  **Request**: Client sends `POST /api/scrape` with target URL.
2.  **Validation**: API route validates payload schema.
3.  **Execution**: `threadsScraper` is invoked.
4.  **Browser Interaction**: Playwright launches a Chromium instance and navigates to the URL.
5.  **Extraction**: Scripts run in the browser context to find hidden JSON data embedded in the page.
6.  **Transformation**: Raw data is cleaned and mapped to `ThreadPost` objects.
7.  **Response**: JSON response is sent back to the client.

## Directory Structure

```
src/
├── app/          # Next.js App Router (API Routes)
├── lib/
│   ├── scraper/  # Core scraping logic
│   └── utils/    # Shared helpers
├── types/        # TypeScript definitions
└── ...
```
