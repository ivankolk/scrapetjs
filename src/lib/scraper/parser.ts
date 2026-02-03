import { config } from '@/lib/config';
import { findNestedKey } from '@/lib/utils/nested-lookup';
import { ParseError, DataNotFoundError } from '@/lib/utils/errors';
import type { ThreadPost } from '@/types/threads';

/**
 * Extracts hidden JSON data from HTML script tags
 */
export function extractHiddenData(html: string): unknown[] {
	const datasets: unknown[] = [];

	// Find all script tags with data-sjs attribute
	const scriptRegex =
		/<script[^>]*type="application\/json"[^>]*data-sjs[^>]*>([\s\S]*?)<\/script>/gi;
	let match;

	while ((match = scriptRegex.exec(html)) !== null) {
		const scriptContent = match[1];

		// Filter by required keys
		if (
			!scriptContent.includes(config.scraper.keys.scheduledServerJS) ||
			!scriptContent.includes(config.scraper.keys.threadItems)
		) {
			continue;
		}

		try {
			const parsed = JSON.parse(scriptContent);
			datasets.push(parsed);
		} catch (error) {
			// Skip invalid JSON
			continue;
		}
	}

	return datasets;
}

/**
 * Finds thread_items in nested data structure
 */
export function findThreadItems(data: unknown): unknown[] {
	const threadItemsArrays = findNestedKey<unknown[]>(
		data,
		config.scraper.keys.threadItems,
	);

	if (threadItemsArrays.length === 0) {
		throw new DataNotFoundError('thread_items not found in hidden data');
	}

	// Return the first array found (usually there's only one)
	return threadItemsArrays[0] || [];
}

/**
 * Transforms raw thread data to ThreadPost structure
 */
export function transformThreadData(rawData: unknown): ThreadPost {
	try {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const data = rawData as any;

		const post = data.post || data;

		// Extract reply count
		let replyCount = 0;
		if (post.text_post_app_info?.direct_reply_count !== undefined) {
			replyCount = post.text_post_app_info.direct_reply_count;
		} else if (data.view_replies_cta_string) {
			const match = String(data.view_replies_cta_string).match(/(\d+)/);
			replyCount = match ? parseInt(match[1], 10) : 0;
		}

		// Extract media
		const media: { images?: string[]; videos?: string[]; hasAudio?: boolean } =
			{};

		if (post.carousel_media && Array.isArray(post.carousel_media)) {
			media.images = post.carousel_media
				.map((item: any) => item.image_versions2?.candidates?.[1]?.url)
				.filter(Boolean);
		}

		if (post.video_versions && Array.isArray(post.video_versions)) {
			media.videos = [
				...new Set(post.video_versions.map((v: any) => v.url).filter(Boolean)),
			];
		}

		if (post.has_audio !== undefined) {
			media.hasAudio = post.has_audio;
		}

		const threadPost: ThreadPost = {
			id: post.id || '',
			code: post.code || '',
			text: post.caption?.text || null,
			author: {
				username: post.user?.username || '',
				userId: post.user?.pk || post.user?.id || '',
				verified: post.user?.is_verified || false,
				profilePicture: post.user?.profile_pic_url || '',
			},
			stats: {
				likes: post.like_count || 0,
				replies: replyCount,
			},
			media: Object.keys(media).length > 0 ? media : undefined,
			publishedAt: post.taken_at || 0,
			url: `https://www.threads.net/@${post.user?.username}/post/${post.code}`,
		};

		return threadPost;
	} catch (error) {
		throw new ParseError('Failed to transform thread data', error);
	}
}
