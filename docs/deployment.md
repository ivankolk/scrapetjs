# Deployment Guide

## Environment Variables

Configure the following environment variables in your deployment platform or `.env.local` file.

| Variable           | Default       | Description                                          |
| :----------------- | :------------ | :--------------------------------------------------- |
| `NODE_ENV`         | `development` | Node.js environment (`development` or `production`). |
| `SCRAPER_TIMEOUT`  | `30000`       | Global scraper timeout in milliseconds.              |
| `SCRAPER_HEADLESS` | `true`        | Whether to run Playwright in headless mode.          |

## Deploying to Vercel

The easiest way to deploy is using Vercel.

1.  Push your code to a Git repository (GitHub, GitLab, Bitbucket).
2.  Import the project into Vercel.
3.  Vercel will automatically detect the Next.js framework.
4.  **Important:** Vercel has a serverless function execution timeout (usually 10s on specific plans). Scraping can take longer. Ensure your plan supports longer timeouts or adjust `SCRAPER_TIMEOUT` accordingly, though Playwright on Vercel Serverless can be heavy.
5.  **Alternative:** For consistent scraping performance, consider using a containerized hosted environment (like Railway, Fly.io, or DigitalOcean App Platform) due to Playwright's browser requirements.

## Docker Deployment

For best stability with Playwright, use Docker.

### 1. Build the Image

```bash
docker build -t threads-scraper .
```

### 2. Run the Container

```bash
docker run -p 3000:3000 threads-scraper
```

### Dockerfile Breakdown

The included `Dockerfile` ensures all browser dependencies are installed:

- **Base Image:** `node:20-alpine` based.
- **Dependencies:** Installs necessary system libraries for Chromium.
- **Playwright:** Runs `npx playwright install --with-deps chromium` to set up the browser binary.

## Resource Requirements

- **Memory:** At least 1GB RAM recommended for Playwright operations.
- **CPU:** 1 vCPU is sufficient for low concurrency. Scale up for higher loads.
