import {
	chromium,
	type Browser,
	type Page,
	type BrowserContext,
} from 'playwright';
import { config } from '@/lib/config';
import { BrowserError, TimeoutError } from '@/lib/utils/errors';

export class BrowserManager {
	private browser: Browser | null = null;
	private context: BrowserContext | null = null;
	private page: Page | null = null;

	async launch(): Promise<void> {
		try {
			this.browser = await chromium.launch({
				headless: config.scraper.headless,
			});

			this.context = await this.browser.newContext({
				viewport: config.scraper.viewport,
				userAgent:
					'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
			});

			this.page = await this.context.newPage();
		} catch (error) {
			throw new BrowserError('Failed to launch browser', error);
		}
	}

	async navigateToPage(url: string, timeout?: number): Promise<void> {
		if (!this.page) {
			throw new BrowserError('Browser not launched. Call launch() first.');
		}

		try {
			await this.page.goto(url, {
				timeout: timeout || config.scraper.timeout,
				waitUntil: 'domcontentloaded',
			});
		} catch (error) {
			if (error instanceof Error && error.name === 'TimeoutError') {
				throw new TimeoutError(
					`Page load timeout after ${timeout || config.scraper.timeout}ms`,
					error,
				);
			}
			throw new BrowserError('Failed to navigate to page', error);
		}
	}

	async waitForSelector(selector: string, timeout?: number): Promise<void> {
		if (!this.page) {
			throw new BrowserError('Browser not launched. Call launch() first.');
		}

		try {
			await this.page.waitForSelector(selector, {
				timeout: timeout || config.scraper.timeout,
				state: 'visible',
			});
		} catch (error) {
			if (error instanceof Error && error.name === 'TimeoutError') {
				throw new TimeoutError(
					`Selector "${selector}" not found within timeout`,
					error,
				);
			}
			throw new BrowserError(`Failed to wait for selector: ${selector}`, error);
		}
	}

	async getPageContent(): Promise<string> {
		if (!this.page) {
			throw new BrowserError('Browser not launched. Call launch() first.');
		}

		try {
			return await this.page.content();
		} catch (error) {
			throw new BrowserError('Failed to get page content', error);
		}
	}

	async close(): Promise<void> {
		try {
			if (this.page) {
				await this.page.close();
				this.page = null;
			}
			if (this.context) {
				await this.context.close();
				this.context = null;
			}
			if (this.browser) {
				await this.browser.close();
				this.browser = null;
			}
		} catch (error) {
			throw new BrowserError('Failed to close browser', error);
		}
	}
}
