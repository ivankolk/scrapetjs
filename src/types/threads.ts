// Thread Post Data Types
export interface ThreadPost {
	id: string;
	code: string;
	text: string | null;
	author: ThreadAuthor;
	stats: ThreadStats;
	media?: ThreadMedia;
	publishedAt: number; // Unix timestamp
	url: string;
}

export interface ThreadAuthor {
	username: string;
	userId: string;
	verified: boolean;
	profilePicture: string;
}

export interface ThreadStats {
	likes: number;
	replies: number;
}

export interface ThreadMedia {
	images?: string[];
	videos?: string[];
	hasAudio?: boolean;
}

// Scraper Options
export interface ScrapeOptions {
	includeReplies?: boolean; // default: true
	maxReplies?: number; // default: all
	timeout?: number; // default: 30000ms
}

// Scraper Result
export interface ScrapeResult {
	success: boolean;
	data?: {
		thread: ThreadPost;
		replies: ThreadPost[];
		metadata: ScrapeMetadata;
	};
	error?: ScraperError;
}

export interface ScrapeMetadata {
	scrapedAt: string; // ISO timestamp
	url: string;
	replyCount: number;
	processingTime: number; // ms
}

export interface ScraperError {
	code: ErrorCode;
	message: string;
	details?: unknown;
}

export enum ErrorCode {
	INVALID_URL = 'INVALID_URL',
	INVALID_REQUEST = 'INVALID_REQUEST',
	PAGE_LOAD_FAILED = 'PAGE_LOAD_FAILED',
	DATA_NOT_FOUND = 'DATA_NOT_FOUND',
	PARSE_ERROR = 'PARSE_ERROR',
	TIMEOUT = 'TIMEOUT',
	BROWSER_ERROR = 'BROWSER_ERROR',
	RATE_LIMITED = 'RATE_LIMITED',
	INTERNAL_ERROR = 'INTERNAL_ERROR',
}
