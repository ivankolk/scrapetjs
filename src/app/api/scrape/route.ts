import { NextRequest, NextResponse } from 'next/server';
import { scrapeThread, scrapeProfile } from '@/lib/scraper/threadsScraper';
import { scrapeRequestSchema } from '@/types/api';
import type { ApiResponse } from '@/types/api';

export async function POST(request: NextRequest) {
	try {
		// Parse and validate request body
		const body = await request.json();
		const validatedData = scrapeRequestSchema.parse(body);

		// Perform scraping based on mode
		let result;
		if (validatedData.mode === 'profile') {
			result = await scrapeProfile(validatedData.url, {
				postCount: validatedData.postCount,
				timeout: validatedData.timeout,
			});
		} else {
			result = await scrapeThread(validatedData.url, {
				includeReplies: validatedData.includeReplies,
				maxReplies: validatedData.maxReplies,
				timeout: validatedData.timeout,
			});
		}

		// Return appropriate response based on result
		if (result.success) {
			const response: ApiResponse = {
				success: true,
				data: {
					thread: result.data!.thread,
					replies: result.data!.replies,
					metadata: result.data!.metadata,
				},
			};
			return NextResponse.json(response, { status: 200 });
		} else {
			const errorResponse: ApiResponse = {
				success: false,
				error: {
					code: result.error!.code,
					message: result.error!.message,
					details:
						process.env.NODE_ENV === 'development'
							? result.error!.details
							: undefined,
				},
			};

			// Map error codes to HTTP status codes
			const statusCode = getHttpStatusCode(result.error!.code);
			return NextResponse.json(errorResponse, { status: statusCode });
		}
	} catch (error) {
		// Handle validation errors from Zod
		if (
			error &&
			typeof error === 'object' &&
			'name' in error &&
			error.name === 'ZodError'
		) {
			const errorResponse: ApiResponse = {
				success: false,
				error: {
					code: 'INVALID_REQUEST',
					message: 'Invalid request parameters',
					details: process.env.NODE_ENV === 'development' ? error : undefined,
				},
			};
			return NextResponse.json(errorResponse, { status: 400 });
		}

		// Handle unexpected errors
		const errorResponse: ApiResponse = {
			success: false,
			error: {
				code: 'INTERNAL_ERROR',
				message: 'An unexpected error occurred',
				details: process.env.NODE_ENV === 'development' ? error : undefined,
			},
		};
		return NextResponse.json(errorResponse, { status: 500 });
	}
}

/**
 * Maps error codes to HTTP status codes
 */
function getHttpStatusCode(errorCode: string): number {
	const statusMap: Record<string, number> = {
		INVALID_URL: 400,
		INVALID_REQUEST: 400,
		DATA_NOT_FOUND: 404,
		PARSE_ERROR: 500,
		TIMEOUT: 504,
		BROWSER_ERROR: 500,
		RATE_LIMITED: 429,
		INTERNAL_ERROR: 500,
	};

	return statusMap[errorCode] || 500;
}
