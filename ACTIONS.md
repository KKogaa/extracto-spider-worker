# Action-Based Workflows

The Spider Worker supports action-based workflows for complex scraping scenarios that require multiple steps, such as logging in, clicking buttons, filling forms, and extracting specific data.

## Table of Contents

- [Quick Start](#quick-start)
- [Available Actions](#available-actions)
- [Examples](#examples)
- [Best Practices](#best-practices)

## Quick Start

Instead of just providing a URL, you can provide a sequence of actions:

```json
{
  "url": "https://example.com",
  "actions": [
    { "type": "navigate", "url": "https://example.com/login" },
    { "type": "fill", "selector": "#username", "value": "user@example.com" },
    { "type": "fill", "selector": "#password", "value": "secret" },
    { "type": "click", "selector": "button[type='submit']" },
    { "type": "waitForNavigation" },
    { "type": "getContent", "saveTo": "finalHtml" }
  ]
}
```

## Available Actions

### Navigation Actions

#### navigate
Navigate to a URL.

```json
{
  "type": "navigate",
  "url": "https://example.com",
  "waitUntil": "networkidle",
  "timeout": 30000
}
```

Parameters:
- `url` (required): URL to navigate to
- `waitUntil` (optional): When to consider navigation succeeded - `load`, `domcontentloaded`, `networkidle`, or `commit`
- `timeout` (optional): Maximum time in milliseconds

#### waitForNavigation
Wait for navigation to complete.

```json
{
  "type": "waitForNavigation",
  "waitUntil": "networkidle",
  "timeout": 30000
}
```

### Input Actions

#### type
Type text into an input field with realistic delays between keystrokes.

```json
{
  "type": "type",
  "selector": "#search",
  "value": "search query",
  "delay": 100,
  "timeout": 5000
}
```

#### fill
Fill an input field instantly (faster than type).

```json
{
  "type": "fill",
  "selector": "#email",
  "value": "user@example.com",
  "timeout": 5000
}
```

#### select
Select option(s) from a dropdown.

```json
{
  "type": "select",
  "selector": "#country",
  "value": "US",
  "timeout": 5000
}
```

For multiple selections:
```json
{
  "type": "select",
  "selector": "#languages",
  "value": ["en", "es", "fr"]
}
```

### Click Actions

#### click
Click on an element.

```json
{
  "type": "click",
  "selector": "button.submit",
  "button": "left",
  "clickCount": 1,
  "timeout": 5000
}
```

Parameters:
- `selector` (required): CSS selector
- `button` (optional): `left`, `right`, or `middle`
- `clickCount` (optional): Number of clicks (for double-click, use 2)

#### check / uncheck
Check or uncheck a checkbox.

```json
{ "type": "check", "selector": "#agree-terms" }
{ "type": "uncheck", "selector": "#newsletter" }
```

### Wait Actions

#### waitForSelector
Wait for an element to appear/disappear.

```json
{
  "type": "waitForSelector",
  "selector": ".loading-complete",
  "state": "visible",
  "timeout": 10000
}
```

Parameters:
- `selector` (required): CSS selector
- `state` (optional): `attached`, `detached`, `visible`, or `hidden`

#### waitForTimeout
Wait for a specific amount of time.

```json
{
  "type": "waitForTimeout",
  "timeout": 2000
}
```

**Note**: Try to avoid this and use `waitForSelector` instead for better reliability.

### Data Extraction Actions

#### getContent
Get the HTML content of the page.

```json
{
  "type": "getContent",
  "saveTo": "pageHtml"
}
```

#### getText
Get text content of an element.

```json
{
  "type": "getText",
  "selector": ".product-price",
  "saveTo": "price"
}
```

#### getAttribute
Get an attribute value from an element.

```json
{
  "type": "getAttribute",
  "selector": "img.product",
  "attribute": "src",
  "saveTo": "imageUrl"
}
```

#### evaluate
Evaluate a simple JavaScript expression.

```json
{
  "type": "evaluate",
  "expression": "document.title",
  "saveTo": "pageTitle"
}
```

**Security Note**: Only simple property access is allowed (no function calls).

#### screenshot
Take a screenshot.

```json
{
  "type": "screenshot",
  "fullPage": true,
  "format": "png",
  "quality": 80,
  "saveTo": "screenshot"
}
```

### Other Actions

#### hover
Hover over an element.

```json
{
  "type": "hover",
  "selector": ".dropdown-trigger",
  "timeout": 5000
}
```

#### press
Press a keyboard key.

```json
{
  "type": "press",
  "selector": "#search-input",
  "key": "Enter",
  "timeout": 5000
}
```

#### scroll
Scroll the page or an element.

```json
{ "type": "scroll", "x": 0, "y": 1000 }
{ "type": "scroll", "selector": ".infinite-scroll-container" }
```

#### setCookies
Set browser cookies.

```json
{
  "type": "setCookies",
  "cookies": [
    {
      "name": "session_id",
      "value": "abc123",
      "domain": "example.com",
      "path": "/",
      "secure": true,
      "httpOnly": true
    }
  ]
}
```

## Examples

### Example 1: Login Flow

```json
{
  "url": "https://example.com",
  "actions": [
    { "type": "navigate", "url": "https://example.com/login" },
    { "type": "fill", "selector": "#username", "value": "user@example.com" },
    { "type": "fill", "selector": "#password", "value": "mypassword" },
    { "type": "click", "selector": "button[type='submit']" },
    { "type": "waitForNavigation" },
    { "type": "waitForSelector", "selector": ".dashboard" },
    { "type": "getContent", "saveTo": "dashboardHtml" },
    { "type": "screenshot", "saveTo": "dashboardScreenshot" }
  ]
}
```

### Example 2: Search and Extract Results

```json
{
  "url": "https://example.com",
  "actions": [
    { "type": "navigate", "url": "https://example.com/search" },
    { "type": "fill", "selector": "#search-input", "value": "playwright" },
    { "type": "press", "selector": "#search-input", "key": "Enter" },
    { "type": "waitForSelector", "selector": ".search-results" },
    { "type": "getText", "selector": ".result-count", "saveTo": "resultCount" },
    { "type": "getContent", "saveTo": "resultsHtml" }
  ]
}
```

### Example 3: Dropdown Navigation

```json
{
  "url": "https://example.com",
  "actions": [
    { "type": "navigate", "url": "https://example.com" },
    { "type": "hover", "selector": ".nav-products" },
    { "type": "waitForSelector", "selector": ".dropdown-menu", "state": "visible" },
    { "type": "click", "selector": ".dropdown-menu a[href='/category']" },
    { "type": "waitForNavigation" },
    { "type": "getContent", "saveTo": "categoryPage" }
  ]
}
```

### Example 4: Infinite Scroll

```json
{
  "url": "https://example.com/feed",
  "actions": [
    { "type": "navigate", "url": "https://example.com/feed" },
    { "type": "waitForSelector", "selector": ".post" },
    { "type": "scroll", "y": 2000 },
    { "type": "waitForTimeout", "timeout": 2000 },
    { "type": "scroll", "y": 4000 },
    { "type": "waitForTimeout", "timeout": 2000 },
    { "type": "getContent", "saveTo": "feedContent" }
  ]
}
```

### Example 5: Form Submission with Multiple Inputs

```json
{
  "url": "https://example.com/form",
  "actions": [
    { "type": "navigate", "url": "https://example.com/form" },
    { "type": "fill", "selector": "#name", "value": "John Doe" },
    { "type": "fill", "selector": "#email", "value": "john@example.com" },
    { "type": "select", "selector": "#country", "value": "US" },
    { "type": "check", "selector": "#agree-terms" },
    { "type": "fill", "selector": "#message", "value": "Hello!" },
    { "type": "click", "selector": "button.submit" },
    { "type": "waitForSelector", "selector": ".success-message" },
    { "type": "getText", "selector": ".success-message", "saveTo": "confirmationMessage" }
  ]
}
```

### Example 6: Extract Data from Multiple Pages

```json
{
  "url": "https://example.com",
  "actions": [
    { "type": "navigate", "url": "https://example.com/page1" },
    { "type": "getText", "selector": ".data", "saveTo": "page1Data" },
    { "type": "navigate", "url": "https://example.com/page2" },
    { "type": "getText", "selector": ".data", "saveTo": "page2Data" },
    { "type": "navigate", "url": "https://example.com/page3" },
    { "type": "getText", "selector": ".data", "saveTo": "page3Data" }
  ]
}
```

## Best Practices

### 1. Use Specific Selectors
Use specific CSS selectors to avoid ambiguity:
```json
{ "type": "click", "selector": "button[data-testid='submit-btn']" }
```

### 2. Add Waits After Navigation
Always wait after actions that trigger navigation:
```json
{ "type": "click", "selector": ".link" },
{ "type": "waitForNavigation" },
{ "type": "waitForSelector", "selector": ".page-loaded" }
```

### 3. Save Important Data
Use `saveTo` to extract data for later use:
```json
{ "type": "getText", "selector": ".price", "saveTo": "productPrice" }
```

The extracted data will be available in the job result under `extractedData`.

### 4. Handle Loading States
Wait for loading indicators to disappear:
```json
{ "type": "waitForSelector", "selector": ".loading", "state": "hidden" }
```

### 5. Use fill Instead of type for Speed
Unless you need to simulate human typing, use `fill`:
```json
{ "type": "fill", "selector": "#input", "value": "fast" }
```

### 6. Set Reasonable Timeouts
Don't make timeouts too long or too short:
```json
{ "type": "waitForSelector", "selector": ".element", "timeout": 10000 }
```

### 7. Take Screenshots for Debugging
Add screenshots to see what went wrong:
```json
{ "type": "screenshot", "saveTo": "debug_screenshot" }
```

## Response Format

When using actions, the response includes:

```json
{
  "jobId": "123",
  "url": "https://final-url.com",
  "html": "<html>...</html>",
  "fetchedAt": "2024-01-01T00:00:00.000Z",
  "actionResults": [
    {
      "success": true,
      "action": { "type": "navigate", "url": "..." },
      "duration": 1234
    }
  ],
  "extractedData": {
    "price": "$99.99",
    "screenshot": "base64...",
    "pageTitle": "Product Page"
  }
}
```

## Limitations

- Maximum 100 actions per job
- `waitForTimeout` cannot exceed 60 seconds
- `evaluate` only allows simple property access (no function calls)
- Actions execute sequentially, not in parallel

## Need Help?

If you need more complex workflows or have questions, please open an issue on GitHub.
