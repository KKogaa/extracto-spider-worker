import { chromium, Browser, Page } from 'playwright';
import type { FetchJobData, FetchResult } from '../types';
import { ActionExecutor } from './action-executor.service';

export class FetchService {
  private browser: Browser | null = null;
  private actionExecutor: ActionExecutor;

  constructor() {
    this.actionExecutor = new ActionExecutor();
  }

  async initialize(): Promise<void> {
    this.browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--disable-dev-shm-usage',
      ],
    });
    console.log('Playwright browser initialized');
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      console.log('Playwright browser closed');
    }
  }

  async fetchPage(jobData: FetchJobData): Promise<FetchResult> {
    if (!this.browser) {
      throw new Error('Browser not initialized. Call initialize() first.');
    }

    const { url, jobId, actions, options = {} } = jobData;

    // If actions are provided, use action-based workflow
    if (actions && actions.length > 0) {
      return this.executeActionsWorkflow(jobData);
    }

    // Otherwise, use simple fetch mode (backward compatibility)
    return this.simpleFetch(jobData);
  }

  private async simpleFetch(jobData: FetchJobData): Promise<FetchResult> {
    const { url, jobId, options = {} } = jobData;
    const {
      waitFor,
      timeout = 30000,
      screenshot = false,
      headers = {},
    } = options;

    const context = await this.browser!.newContext({
      extraHTTPHeaders: headers,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
      locale: 'es-PE',
    });

    let page: Page | null = null;

    try {
      page = await context.newPage();
      
      // Remove webdriver flag
      await page.addInitScript(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => false });
      });

      const response = await page.goto(url, {
        timeout,
        waitUntil: 'networkidle',
      });

      if (!response) {
        throw new Error('Failed to load page');
      }

      if (waitFor) {
        await page.waitForSelector(waitFor, { timeout });
      }

      const html = await page.content();
      const statusCode = response.status();
      const responseHeaders = response.headers();

      let screenshotData: string | undefined;
      if (screenshot) {
        const screenshotBuffer = await page.screenshot({
          fullPage: true,
          type: 'png',
        });
        screenshotData = screenshotBuffer.toString('base64');
      }

      return {
        jobId,
        url,
        html,
        screenshot: screenshotData,
        statusCode,
        headers: responseHeaders,
        fetchedAt: new Date(),
      };
    } finally {
      if (page) {
        await page.close();
      }
      await context.close();
    }
  }

  private async executeActionsWorkflow(jobData: FetchJobData): Promise<FetchResult> {
    const { url, jobId, actions = [], options = {} } = jobData;
    const { headers = {} } = options;

    const context = await this.browser!.newContext({
      extraHTTPHeaders: headers,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
      locale: 'es-PE',
    });

    let page: Page | null = null;

    try {
      page = await context.newPage();
      
      // Remove webdriver flag
      await page.addInitScript(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => false });
      });

      // Execute all actions
      const { results, extractedData } = await this.actionExecutor.executeActions(
        page,
        context,
        actions
      );

      // Get final page state
      const html = await page.content();
      const currentUrl = page.url();

      return {
        jobId,
        url: currentUrl,
        html,
        fetchedAt: new Date(),
        actionResults: results,
        extractedData,
      };
    } finally {
      if (page) {
        await page.close();
      }
      await context.close();
    }
  }
}
