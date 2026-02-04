'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Field, FieldLabel, FieldDescription } from '@/components/ui/field';
import { useScraper } from '@/hooks/useScraper';
import { ModeSelector } from './scraper/ModeSelector';
import { ScraperResults } from './scraper/ScraperResults';

export function ScraperForm() {
	const { url, setUrl, mode, setMode, loading, error, data, scrape } =
		useScraper();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		await scrape();
	};

	return (
		<div className='mx-auto max-w-3xl space-y-8'>
			<form onSubmit={handleSubmit}>
				<ModeSelector mode={mode} setMode={setMode} disabled={loading} />

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
							className='bg-neutral-900 text-white font-bold px-8'
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

			{data && <ScraperResults data={data} mode={mode} />}
		</div>
	);
}
