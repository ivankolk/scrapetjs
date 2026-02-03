'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Field, FieldLabel, FieldDescription } from '@/components/ui/field';
import type { ScrapeResult } from '@/types/threads';

export function ScraperForm() {
	const [url, setUrl] = useState('');
	const [mode, setMode] = useState<'post' | 'profile'>('post');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [data, setData] = useState<NonNullable<ScrapeResult['data']> | null>(
		null,
	);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!url) return;

		setLoading(true);
		setError(null);
		setData(null);

		try {
			const response = await fetch('/api/scrape', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ url, mode }),
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

	const formatNumber = (num: number) => {
		return new Intl.NumberFormat('en-US', { notation: 'compact' }).format(num);
	};

	return (
		<div className='mx-auto max-w-3xl space-y-8'>
			<form onSubmit={handleSubmit}>
				<Field>
					<FieldLabel htmlFor='mode-select'>Parsing Mode</FieldLabel>
					<div className='relative'>
						<select
							id='mode-select'
							value={mode}
							onChange={(e) => setMode(e.target.value as 'post' | 'profile')}
							disabled={loading}
							className='flex h-9 w-[200px] rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm'
						>
							<option value='post'>Single Post</option>
							<option value='profile'>Profile Posts</option>
						</select>
					</div>
					<FieldDescription>
						Choose whether to scrape a single post or a user&apos;s recent
						posts.
					</FieldDescription>
				</Field>

				<Field className='mt-4'>
					<FieldLabel htmlFor='url-input'>Threads URL</FieldLabel>
					<div className='flex gap-2'>
						<Input
							id='url-input'
							placeholder={
								mode === 'post'
									? 'https://www.threads.net/t/...'
									: 'https://www.threads.net/@username'
							}
							value={url}
							onChange={(e) => setUrl(e.target.value)}
							disabled={loading}
							className='flex-1 text-lg'
						/>
						<Button
							type='submit'
							disabled={loading || !url}
							className='bg-blue-600 hover:bg-blue-500 text-white font-bold px-8'
						>
							{loading ? (
								<>
									<Loader2 className='mr-2 h-4 w-4 animate-spin' />
									Scraping
								</>
							) : (
								'Scrape'
							)}
						</Button>
					</div>
					<FieldDescription>
						{mode === 'post'
							? 'Enter a Threads post URL to extract content and replies.'
							: 'Enter a Threads profile URL to extract recent posts.'}
					</FieldDescription>
				</Field>

				{error && (
					<Alert variant='destructive' className='mt-4'>
						<AlertCircle className='h-4 w-4' />
						<AlertTitle>Error</AlertTitle>
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}
			</form>

			{data && (
				<Tabs defaultValue='preview' className='w-full'>
					<TabsList className='grid w-full grid-cols-2'>
						<TabsTrigger value='preview'>Preview</TabsTrigger>
						<TabsTrigger value='json'>JSON Result</TabsTrigger>
					</TabsList>

					<TabsContent value='preview' className='mt-4 space-y-4'>
						{/* Thread Post Preview */}
						{data.thread && (
							<Card>
								<CardHeader className='pb-4'>
									<div className='flex items-center gap-3'>
										<div className='h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted'>
											{data.thread.author?.profilePicture && (
												// eslint-disable-next-line @next/next/no-img-element
												<img
													src={data.thread.author.profilePicture}
													alt={data.thread.author.username}
													className='h-full w-full object-cover'
													referrerPolicy='no-referrer'
													crossOrigin='anonymous'
												/>
											)}
										</div>
										<div className='flex h-10 flex-col justify-center'>
											<CardTitle className='text-base leading-none'>
												@{data.thread.author?.username}
											</CardTitle>
											{data.thread.publishedAt && (
												<CardDescription className='text-xs leading-none mt-1'>
													{new Date(
														data.thread.publishedAt * 1000,
													).toLocaleString()}
												</CardDescription>
											)}
										</div>
									</div>
								</CardHeader>
								<CardContent className='space-y-4'>
									<p className='whitespace-pre-wrap text-base'>
										{data.thread.text}
									</p>
								</CardContent>
								<div className='flex items-center gap-4 border-t px-6 py-4 text-sm text-muted-foreground'>
									<div className='flex items-center gap-1'>
										<span className='font-medium text-foreground'>
											{formatNumber(data.thread.stats?.likes || 0)}
										</span>{' '}
										Likes
									</div>
									<div className='flex items-center gap-1'>
										<span className='font-medium text-foreground'>
											{formatNumber(data.thread.stats?.replies || 0)}
										</span>{' '}
										Replies
									</div>
								</div>
							</Card>
						)}

						{/* Stats / Metadata */}
						<div className='grid gap-4 md:grid-cols-2'>
							<Card>
								<CardHeader className='pb-2'>
									<CardTitle className='text-sm font-medium text-muted-foreground'>
										Scraped At
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className='text-2xl font-bold'>
										{data.metadata?.scrapedAt
											? new Date(data.metadata.scrapedAt).toLocaleTimeString()
											: '-'}
									</div>
								</CardContent>
							</Card>
							<Card>
								<CardHeader className='pb-2'>
									<CardTitle className='text-sm font-medium text-muted-foreground'>
										Processing Time
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className='text-2xl font-bold'>
										{data.metadata?.processingTime}ms
									</div>
								</CardContent>
							</Card>
						</div>
					</TabsContent>

					<TabsContent value='json'>
						<Card>
							<CardHeader>
								<CardTitle>Raw JSON</CardTitle>
							</CardHeader>
							<CardContent>
								<ScrollArea className='h-[600px] w-full rounded-md border p-4 bg-muted/50'>
									<pre className='text-xs font-mono'>
										{JSON.stringify(data, null, 2)}
									</pre>
								</ScrollArea>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			)}
		</div>
	);
}
