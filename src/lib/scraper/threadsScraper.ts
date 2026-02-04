import { BrowserManager } from './browser';
import {
	extractHiddenData,
	findThreadItems,
	transformThreadData,
} from './parser';
import { isValidThreadsUrl, normalizeThreadsUrl } from '@/lib/utils/validators';
import { ValidationError, ScraperError } from '@/lib/utils/errors';
import { config } from '@/lib/config';
import type { ScrapeOptions, ScrapeResult, ThreadPost } from '@/types/threads';
import { ErrorCode } from '@/types/threads';

/**
 * Main scraper function to extract Threads post data
 */
export async function scrapeThread(
	url: string,
	options: ScrapeOptions = {},
): Promise<ScrapeResult> {
	const startTime = Date.now();
	const browserManager = new BrowserManager();

	try {
		// Validate URL
		if (!isValidThreadsUrl(url)) {
			throw new ValidationError('Invalid Threads URL format');
		}

		const normalizedUrl = normalizeThreadsUrl(url);
		const {
			includeReplies = true,
			maxReplies,
			timeout = config.scraper.timeout,
		} = options;

		// Launch browser and navigate
		await browserManager.launch();
		await browserManager.navigateToPage(normalizedUrl, timeout);

		// Wait for content to load
		await browserManager.waitForSelector(
			config.scraper.selectors.contentLoaded,
			timeout,
		);

		// Get page HTML
		const html = await browserManager.getPageContent();

		// Extract hidden datasets
		const hiddenDatasets = extractHiddenData(html);

		if (hiddenDatasets.length === 0) {
			throw new ValidationError(
				'No hidden data found in page. The URL might be invalid or the page structure has changed.',
			);
		}

		// Find thread items in each dataset
		let allThreadItems: unknown[] = [];
		for (const dataset of hiddenDatasets) {
			try {
				const items = findThreadItems(dataset);
				allThreadItems = [...allThreadItems, ...items];
			} catch {
				// Try next dataset
				continue;
			}
		}

		if (allThreadItems.length === 0) {
			throw new ValidationError(
				'No thread data found. The post might be private or deleted.',
			);
		}

		// Transform raw data to ThreadPost structures
		const transformedThreads: ThreadPost[] = allThreadItems.map((item) =>
			transformThreadData(item),
		);

		// Separate main thread and replies
		const mainThread = transformedThreads[0];
		let replies = transformedThreads.slice(1);

		// Apply reply filters
		if (!includeReplies) {
			replies = [];
		} else if (maxReplies !== undefined && maxReplies > 0) {
			replies = replies.slice(0, maxReplies);
		}

		const processingTime = Date.now() - startTime;

		return {
			success: true,
			data: {
				thread: mainThread,
				replies,
				metadata: {
					scrapedAt: new Date().toISOString(),
					url: normalizedUrl,
					replyCount: replies.length,
					processingTime,
				},
			},
		};
	} catch (error) {
		// Map errors to appropriate error codes
		let errorCode: ErrorCode;
		let errorMessage: string;
		let errorDetails: unknown;

		if (error instanceof ScraperError) {
			errorCode = error.code;
			errorMessage = error.message;
			errorDetails = error.details;
		} else if (error instanceof Error) {
			errorCode = 'INTERNAL_ERROR' as ErrorCode;
			errorMessage = error.message;
			errorDetails = error.stack;
		} else {
			errorCode = 'INTERNAL_ERROR' as ErrorCode;
			errorMessage = 'An unknown error occurred';
			errorDetails = error;
		}

		return {
			success: false,
			error: {
				code: errorCode,
				message: errorMessage,
				details: errorDetails,
			},
		};
	} finally {
		// Always clean up browser resources
		try {
			await browserManager.close();
		} catch {
			// Silently fail on cleanup errors
		}
	}
}

/**
 * Scrape a Threads profile for posts
 */
export async function scrapeProfile(
	url: string,
	options: ScrapeOptions = {},
): Promise<ScrapeResult> {
	const startTime = Date.now();
	const browserManager = new BrowserManager();

	try {
		// Validate URL (basic check, improve regex if needed to allow profile URLs)
		if (!url.includes('threads.net/@')) {
			// Fallback or specific validation logic could go here
		}

		const normalizedUrl = normalizeThreadsUrl(url);
		const { timeout = config.scraper.timeout } = options;

		await browserManager.launch();
		const page = browserManager.getPage();
		if (!page) {
			throw new Error('Failed to get page instance');
		}

		// Intercept GraphQL/API responses
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const capturedPayloads: any[] = [];

		await page.route('**/*', async (route) => {
			// Continue all requests
			await route.continue();
		});

		page.on('response', async (response) => {
			try {
				const responseUrl = response.url();
				if (responseUrl.includes('graphql') || responseUrl.includes('/api/')) {
					if (response.status() === 200) {
						try {
							const json = await response.json();
							capturedPayloads.push(json);
						} catch {
							// non-json response
						}
					}
				}
			} catch {
				// ignore
			}
		});

		await browserManager.navigateToPage(normalizedUrl, timeout);

		// Initial wait
		await page.waitForTimeout(2500);

		// Scroll loop
		const MAX_SCROLLS = 5;
		for (let i = 0; i < MAX_SCROLLS; i++) {
			await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
			await page.waitForTimeout(1500);
		}

		// Parse captured payloads to find posts
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const rawPosts: any[] = [];
		const seenIds = new Set<string>();

		// Also add the initial page data if possible (hidden datasets)
		try {
			const html = await browserManager.getPageContent();
			const hiddenDatasets = extractHiddenData(html);
			capturedPayloads.push(...hiddenDatasets);
		} catch {
			// ignore
		}

		for (const payload of capturedPayloads) {
			const items = findPostLikeObjects(payload);
			for (const item of items) {
				const id = item.id || item.pk || item.code;
				if (id && !seenIds.has(String(id))) {
					seenIds.add(String(id));
					rawPosts.push(item);
				}
			}
		}

		const posts: ThreadPost[] = rawPosts
			.map((post) => {
				try {
					return transformThreadData(post);
				} catch {
					return null;
				}
			})
			.filter((p): p is ThreadPost => p !== null);

		// Sort by publishedAt desc
		posts.sort((a, b) => (b.publishedAt || 0) - (a.publishedAt || 0));

		const processingTime = Date.now() - startTime;

		return {
			success: true,
			data: {
				thread: posts[0] || ({} as ThreadPost),
				replies: posts,
				metadata: {
					scrapedAt: new Date().toISOString(),
					url: normalizedUrl,
					replyCount: posts.length,
					processingTime,
				},
			},
		};
	} catch (error) {
		let errorCode: ErrorCode = ErrorCode.INTERNAL_ERROR;
		let errorMessage = 'An unknown error occurred';
		let errorDetails: unknown;

		if (error instanceof Error) {
			errorMessage = error.message;
			errorDetails = error.stack;
		}

		return {
			success: false,
			error: {
				code: errorCode,
				message: errorMessage,
				details: errorDetails,
			},
		};
	} finally {
		try {
			await browserManager.close();
		} catch {}
	}
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function findPostLikeObjects(node: any): any[] {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const found: any[] = [];
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const seen = new Set<any>();

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	function isPost(d: any): boolean {
		if (!d || typeof d !== 'object') return false;
		if (!('id' in d) && !('pk' in d) && !('code' in d)) return false;

		// Check for content signals
		const hasText = typeof d.text === 'string' && d.text.trim().length > 0;
		const hasCaption =
			d.caption &&
			typeof d.caption === 'object' &&
			typeof d.caption.text === 'string';
		const hasTimestamp =
			'taken_at' in d || 'timestamp' in d || 'created_at' in d;

		return hasText || hasCaption || hasTimestamp;
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	function walk(x: any) {
		if (!x || typeof x !== 'object') return;
		if (seen.has(x)) return;
		seen.add(x);

		if (Array.isArray(x)) {
			x.forEach((v) => walk(v));
			return;
		}

		// Check if current object is a post wrapper
		if ('post' in x && isPost(x.post)) {
			found.push(x.post);
		} else if (isPost(x)) {
			found.push(x);
		}

		for (const k in x) {
			// Avoid re-walking the post we just added
			if (k === 'post' && isPost(x[k])) continue;
			walk(x[k]);
		}
	}

	walk(node);
	return found;
}
