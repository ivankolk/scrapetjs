# Development Guide

## Prerequisites

- **Node.js**: Version 18 or higher.
- **npm**: Or yarn/pnpm.

## Setup

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd scrapetjs
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Install Service Browsers:**
    Playwright needs to download the browser binaries.

    ```bash
    npx playwright install chromium
    ```

4.  **Environment Setup:**
    Copy the example environment file (if available) or create `.env.local`:
    ```bash
    # .env.local
    NODE_ENV=development
    SCRAPER_HEADLESS=true
    ```

## Running Locally

Start the development server:

```bash
npm run dev
```

The server will start at `http://localhost:3000`.

## Testing

Run the unit tests:

```bash
npm test
```

You can use `curl` or Postman to test the API.

```bash
curl -X POST http://localhost:3000/api/scrape \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.threads.net/t/C8H5FiCtESk/"}'
```

## Project Structure

- **Types:** Modification of data structures should be reflected in `src/types/`.
- **Logic:** Core scraping changes happen in `src/lib/scraper/`.
- **Validation:** Update Zod schemas in `src/types/api.ts` if adding request parameters.

## Linting & Formatting

Run the linter to ensure code quality:

```bash
npm run lint
```
