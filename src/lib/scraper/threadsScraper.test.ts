import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { scrapeProfile } from './threadsScraper';

// Mocks
const mockPage = {
	goto: vi.fn(),
	route: vi.fn(),
	on: vi.fn(),
	evaluate: vi.fn().mockResolvedValue(100), // Height
	content: vi.fn().mockResolvedValue('<html></html>'),
};

const mockBrowser = {
	launch: vi.fn(),
	newPage: vi.fn().mockResolvedValue(mockPage),
	getPage: () => mockPage,
	navigateToPage: vi.fn(),
	getPageContent: mockPage.content,
	close: vi.fn(),
};

// Mock BrowserManager
vi.mock('./browser', () => {
	return {
		BrowserManager: class {
			launch = mockBrowser.launch;
			newPage = mockBrowser.newPage;
			getPage = mockBrowser.getPage;
			navigateToPage = mockBrowser.navigateToPage;
			getPageContent = mockBrowser.getPageContent;
			close = mockBrowser.close;
			// Add default constructor
			constructor() {}
		},
	};
});

// Mock parser to simplify data requirements
vi.mock('./parser', () => ({
	extractHiddenData: vi.fn().mockReturnValue([]),
	findThreadItems: vi.fn().mockReturnValue([]),
	transformThreadData: vi.fn().mockImplementation((item) => ({
		id: item.id,
		text: item.text,
		publishedAt: Date.now(),
		// Add other required fields if strictly typed, but let's see
	})),
}));

describe('scrapeProfile', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('should limit posts based on postCount', async () => {
		const postCount = 3;

		// Setup mock behavior
		// We want to simulate capturing 10 posts
		const mockPosts = Array.from({ length: 10 }, (_, i) => ({
			id: `post-${i}`,
			text: `Post ${i}`,
			created_at: 1234567890,
		}));

		// Mock navigateToPage to simulate the data capture
		mockBrowser.navigateToPage.mockImplementation(async () => {
			// Get the response listener registered in scrapeProfile
			const calls = mockPage.on.mock.calls;
			const responseListener = calls.find(
				(call) => call[0] === 'response',
			)?.[1];

			if (responseListener) {
				// simulate response with posts
				await responseListener({
					url: () => 'https://www.threads.net/api/graphql',
					status: () => 200,
					json: async () => ({
						result: mockPosts, // simplified structure, hopefully findPostLikeObjects digs it out
					}),
				});
			}
		});

		// Check logic in scrapeProfile to see what findPostLikeObjects expects
		// It recursively walks.
		// So passing { result: [ ...posts ] } should work if posts match isPost criteria
		// isPost needs: (id|pk|code) AND (text|caption|timestamp)

		// Start the scrape in a promise but don't await it yet because we need to advance time
		const scrapePromise = scrapeProfile('https://www.threads.net/@user', {
			postCount,
			timeout: 5000,
		});

		// Advance time to get past the initial sleep
		await vi.runAllTimersAsync();

		const result = await scrapePromise;

		expect(result.success).toBe(true);
		expect(result.data?.replies.length).toBe(postCount);
		expect(result.data?.replies[0].id).toBe('post-0');
	});
});
