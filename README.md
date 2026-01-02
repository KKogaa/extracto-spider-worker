# Extracto Spider Worker

A high-performance spider worker service built with Playwright and BullMQ for web scraping and content extraction. This worker processes scraping jobs from the queue using headless browser automation.

## Features

- **Playwright** - Headless browser automation for dynamic content fetching
- **Action-Based Workflows** - Support for complex multi-step scraping flows (login, clicks, form filling, etc.)
- **BullMQ** - Robust queue system with Redis for job processing
- **Scalable** - Run multiple worker instances in parallel
- **TypeScript** - Full type safety
- **Docker** - Easy deployment with Docker Compose

## Architecture

This is the worker layer of the Extracto scraping system:

```
Client → [Fetch API] → Redis Queue → [Spider Workers] → Results
```

- **Fetch API**: Accepts requests, validates, enqueues jobs
- **Spider Workers** (this project): Consumes jobs, executes scraping with Playwright
- **Redis**: Message broker for job queue

## Installation

```bash
npm install
```

Install Playwright browsers:

```bash
npx playwright install chromium
```

## Configuration

Copy `.env.example` to `.env` and configure:

```env
REDIS_HOST=localhost
REDIS_PORT=6379
NODE_ENV=development
QUEUE_CONCURRENCY=5
```

## Development

Start the worker:

```bash
npm run dev
```

## Production

Build and start:

```bash
npm run build
npm start
```

## Docker

Build the image:

```bash
docker build -f Dockerfile.worker -t extracto-spider-worker .
```

Run:

```bash
docker run \
  -e REDIS_HOST=redis \
  -e REDIS_PORT=6379 \
  -e QUEUE_CONCURRENCY=5 \
  extracto-spider-worker
```

## Supported Actions

This worker supports complex action-based workflows. See [ACTIONS.md](./ACTIONS.md) for complete documentation.

### Example Actions

- **Navigation**: `navigate`, `waitForNavigation`
- **Input**: `type`, `fill`, `select`, `check`, `uncheck`
- **Interaction**: `click`, `hover`, `press`, `scroll`
- **Waiting**: `waitForSelector`, `waitForTimeout`
- **Extraction**: `getText`, `getAttribute`, `getContent`, `evaluate`
- **Output**: `screenshot`, `setCookies`

### Example Job

```json
{
  "url": "https://example.com",
  "actions": [
    { "type": "navigate", "url": "https://example.com/login" },
    { "type": "fill", "selector": "#username", "value": "user@example.com" },
    { "type": "fill", "selector": "#password", "value": "secret" },
    { "type": "click", "selector": "button[type='submit']" },
    { "type": "waitForNavigation" },
    { "type": "screenshot", "saveTo": "screenshot" }
  ]
}
```

## Scaling Workers

Run multiple worker instances for parallel processing:

```bash
# Terminal 1
QUEUE_CONCURRENCY=5 npm start

# Terminal 2
QUEUE_CONCURRENCY=5 npm start

# Terminal 3
QUEUE_CONCURRENCY=5 npm start
```

Or use Docker Compose (see parent directory).

## Job Result Format

Completed jobs return:

```json
{
  "jobId": "job-1234567890",
  "url": "https://example.com",
  "html": "<html>...</html>",
  "screenshot": "base64...",
  "fetchedAt": "2024-01-01T00:00:00.000Z",
  "actionResults": [...],
  "extractedData": {
    "screenshot": "base64...",
    "customData": "..."
  }
}
```

## Related Projects

- [extracto-fetch-api](../extracto-fetch-api) - API service for submitting and tracking jobs

## License

MIT
