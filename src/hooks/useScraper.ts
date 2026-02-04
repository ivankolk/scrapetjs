import { useState } from 'react';
import type { ScrapeResult } from '@/types/threads';

export type ScrapeMode = 'post' | 'profile';

export function useScraper() {
	const [url, setUrl] = useState('');
	const [mode, setMode] = useState<ScrapeMode>('profile');
	const [postCount, setPostCount] = useState(10);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [data, setData] = useState<NonNullable<ScrapeResult['data']> | null>(
		null,
	);

	const scrape = async () => {
		if (!url) return;

		setLoading(true);
		setError(null);
		setData(null);

		try {
			const response = await fetch('/api/scrape', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ url, mode, postCount }),
			});

			const result: ScrapeResult = await response.json();

			if (!response.ok) {
				throw new Error(result.error?.message || 'Failed to scrape');
			}

			if (!result.success || !result.data) {
				throw new Error(result.error?.message || 'Unknown error');
			}

			setData(result.data);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : 'An unexpected error occurred',
			);
		} finally {
			setLoading(false);
		}
	};

	return {
		url,
		setUrl,
		mode,
		setMode,
		postCount,
		setPostCount,
		loading,
		error,
		data,
		scrape,
	};
}
