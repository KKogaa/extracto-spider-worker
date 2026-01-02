import { Page, BrowserContext } from 'playwright';
import type { Action, ActionResult } from '../types/actions';

export class ActionExecutor {
  private extractedData: Record<string, any> = {};

  async executeActions(
    page: Page,
    context: BrowserContext,
    actions: Action[]
  ): Promise<{
    results: ActionResult[];
    extractedData: Record<string, any>;
  }> {
    const results: ActionResult[] = [];
    this.extractedData = {};

    for (const action of actions) {
      const result = await this.executeAction(page, context, action);
      results.push(result);

      if (!result.success) {
        console.error(`Action failed: ${action.type}`, result.error);
        // Continue execution even if an action fails
      }
    }

    return {
      results,
      extractedData: this.extractedData,
    };
  }

  private async executeAction(
    page: Page,
    context: BrowserContext,
    action: Action
  ): Promise<ActionResult> {
    const startTime = Date.now();

    try {
      let data: any;

      switch (action.type) {
        case 'navigate':
          await page.goto(action.url, {
            waitUntil: action.waitUntil || 'networkidle',
            timeout: action.timeout,
          });
          break;

        case 'click':
          await page.click(action.selector, {
            clickCount: action.clickCount,
            button: action.button,
            timeout: action.timeout,
          });
          break;

        case 'type':
          await page.type(action.selector, action.value, {
            delay: action.delay,
            timeout: action.timeout,
          });
          break;

        case 'fill':
          await page.fill(action.selector, action.value, {
            timeout: action.timeout,
          });
          break;

        case 'select':
          await page.selectOption(action.selector, action.value, {
            timeout: action.timeout,
          });
          break;

        case 'waitForSelector':
          await page.waitForSelector(action.selector, {
            state: action.state,
            timeout: action.timeout,
          });
          break;

        case 'waitForNavigation':
          const waitUntil = action.waitUntil === 'commit' ? 'load' : (action.waitUntil || 'networkidle');
          await page.waitForLoadState(waitUntil as 'load' | 'domcontentloaded' | 'networkidle', {
            timeout: action.timeout,
          });
          break;

        case 'waitForTimeout':
          await page.waitForTimeout(action.timeout);
          break;

        case 'screenshot':
          const screenshotBuffer = await page.screenshot({
            fullPage: action.fullPage ?? true,
            type: action.format || 'png',
            quality: action.quality,
          });
          data = screenshotBuffer.toString('base64');
          if (action.saveTo) {
            this.extractedData[action.saveTo] = data;
          }
          break;

        case 'getContent':
          data = await page.content();
          if (action.saveTo) {
            this.extractedData[action.saveTo] = data;
          }
          break;

        case 'getAttribute':
          data = await page.getAttribute(action.selector, action.attribute);
          if (action.saveTo) {
            this.extractedData[action.saveTo] = data;
          }
          break;

        case 'getText':
          const element = await page.locator(action.selector);
          data = await element.textContent();
          if (action.saveTo) {
            this.extractedData[action.saveTo] = data;
          }
          break;

        case 'evaluate':
          // Limited evaluate for safety - only allow simple property access
          data = await page.evaluate((expr) => {
            // Whitelist safe operations
            if (!/^[a-zA-Z0-9._\[\]"'\s]+$/.test(expr)) {
              throw new Error('Invalid expression - only property access allowed');
            }
            return eval(expr);
          }, action.expression);
          if (action.saveTo) {
            this.extractedData[action.saveTo] = data;
          }
          break;

        case 'scroll':
          if (action.selector) {
            await page.locator(action.selector).scrollIntoViewIfNeeded();
          } else {
            await page.evaluate(
              `window.scrollTo(${action.x || 0}, ${action.y || 0})`
            );
          }
          break;

        case 'hover':
          await page.hover(action.selector, {
            timeout: action.timeout,
          });
          break;

        case 'press':
          await page.press(action.selector, action.key, {
            timeout: action.timeout,
          });
          break;

        case 'check':
          await page.check(action.selector, {
            timeout: action.timeout,
          });
          break;

        case 'uncheck':
          await page.uncheck(action.selector, {
            timeout: action.timeout,
          });
          break;

        case 'setCookies':
          await context.addCookies(action.cookies);
          break;

        default:
          throw new Error(`Unknown action type: ${(action as any).type}`);
      }

      return {
        success: true,
        action,
        data,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        action,
        error: error instanceof Error ? error.message : String(error),
        duration: Date.now() - startTime,
      };
    }
  }
}
