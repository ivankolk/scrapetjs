import { BrowserManager } from './browser';
import {
	extractHiddenData,
	findThreadItems,
	transformThreadData,
} from './parser';
import { isValidThreadsUrl, normalizeThreadsUrl } from '@/lib/utils/validators';
import { ValidationError, ScraperError } from '@/lib/utils/errors';
import { config } from '@/lib/config';
import type {
	ScrapeOptions,
	ScrapeResult,
	ThreadPost,
	ErrorCode,
} from '@/types/threads';

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
