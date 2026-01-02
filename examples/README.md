# Example Workflows

This directory contains example action workflows for common scraping scenarios.

## Using Examples

### With curl

```bash
curl -X POST http://localhost:3000/fetch \
  -H "Content-Type: application/json" \
  -d @examples/login-example.json
```

### With httpie

```bash
http POST http://localhost:3000/fetch < examples/search-example.json
```

### Response

You'll get a job ID:
```json
{
  "jobId": "1",
  "status": "queued",
  "url": "https://example.com",
  "actionsCount": 8
}
```

### Check Job Status

```bash
curl http://localhost:3000/job/1
```

The response will include:
- `actionResults`: Array of results for each action
- `extractedData`: Data saved using `saveTo` parameter
- `html`: Final page HTML
- `state`: Job state (completed, failed, active, waiting)

## Available Examples

- `login-example.json` - Complete login flow with form filling and navigation
- `search-example.json` - Search form submission and result extraction

## Creating Your Own

1. Start with one of the examples
2. Modify the actions to match your target website
3. Test with a local instance
4. See [ACTIONS.md](../ACTIONS.md) for all available actions
