import { ErrorCode } from '@/types/threads';

/**
 * Base class for scraper errors
 */
export class ScraperError extends Error {
	constructor(
		public code: ErrorCode,
		message: string,
		public details?: unknown,
	) {
		super(message);
		this.name = 'ScraperError';
	}
}

/**
 * Browser-related errors
 */
export class BrowserError extends ScraperError {
	constructor(message: string, details?: unknown) {
		super(ErrorCode.BROWSER_ERROR, message, details);
		this.name = 'BrowserError';
	}
}

/**
 * Parsing-related errors
 */
export class ParseError extends ScraperError {
	constructor(message: string, details?: unknown) {
		super(ErrorCode.PARSE_ERROR, message, details);
		this.name = 'ParseError';
	}
}

/**
 * Validation errors
 */
export class ValidationError extends ScraperError {
	constructor(message: string, details?: unknown) {
		super(ErrorCode.INVALID_URL, message, details);
		this.name = 'ValidationError';
	}
}

/**
 * Timeout errors
 */
export class TimeoutError extends ScraperError {
	constructor(message: string, details?: unknown) {
		super(ErrorCode.TIMEOUT, message, details);
		this.name = 'TimeoutError';
	}
}

/**
 * Data not found errors
 */
export class DataNotFoundError extends ScraperError {
	constructor(message: string, details?: unknown) {
		super(ErrorCode.DATA_NOT_FOUND, message, details);
		this.name = 'DataNotFoundError';
	}
}
