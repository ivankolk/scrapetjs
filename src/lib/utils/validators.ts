/**
 * Validates if a URL is a valid Threads post URL
 * Supports both formats:
 * - https://www.threads.net/@username/post/CODE
 * - https://www.threads.net/t/CODE/
 */
export function isValidThreadsUrl(url: string): boolean {
	try {
		const parsedUrl = new URL(url);

		if (
			parsedUrl.hostname !== 'www.threads.net' &&
			parsedUrl.hostname !== 'threads.net' &&
			parsedUrl.hostname !== 'www.threads.com' &&
			parsedUrl.hostname !== 'threads.com'
		) {
			return false;
		}

		const pathname = parsedUrl.pathname;

		// Format 1: /t/CODE/ or /t/CODE
		const shortFormat = /^\/t\/[\w.-]+\/?$/;

		// Format 2: /@username/post/CODE or /@username/post/CODE/
		// Updated to allow hyphens in usernames and dots in post codes
		const longFormat = /^\/@[\w.-]+\/post\/[\w.-]+\/?$/;

		return shortFormat.test(pathname) || longFormat.test(pathname);
	} catch {
		return false;
	}
}

/**
 * Normalizes a Threads URL to standard format
 */
export function normalizeThreadsUrl(url: string): string {
	const parsedUrl = new URL(url);

	// Ensure correct hostname
	if (
		parsedUrl.hostname === 'threads.net' ||
		parsedUrl.hostname === 'threads.com' ||
		parsedUrl.hostname === 'www.threads.com'
	) {
		parsedUrl.hostname = 'www.threads.net';
	}

	// Remove trailing slash
	parsedUrl.pathname = parsedUrl.pathname.replace(/\/$/, '');

	return parsedUrl.toString();
}
