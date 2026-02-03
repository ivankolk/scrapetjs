import { z } from 'zod';

// API Request Schema
export const scrapeRequestSchema = z.object({
	url: z.string().url('Invalid URL format'),
	includeReplies: z.boolean().optional().default(true),
	maxReplies: z.number().positive().optional(),
	timeout: z
		.number()
		.positive()
		.max(60000, 'Timeout cannot exceed 60 seconds')
		.optional(),
});

export type ScrapeRequest = z.infer<typeof scrapeRequestSchema>;

// API Response Types
export interface ScrapeResponse {
	success: true;
	data: {
		thread: unknown;
		replies: unknown[];
		metadata: {
			scrapedAt: string;
			url: string;
			replyCount: number;
			processingTime: number;
		};
	};
}

export interface ErrorResponse {
	success: false;
	error: {
		code: string;
		message: string;
		details?: unknown;
	};
}

export type ApiResponse = ScrapeResponse | ErrorResponse;
