import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ThreadCard } from './ThreadCard';
import type { ScrapeResult } from '@/types/threads';
import type { ScrapeMode } from '@/hooks/useScraper';

interface ScraperResultsProps {
	data: NonNullable<ScrapeResult['data']>;
	mode: ScrapeMode;
}

export function ScraperResults({ data, mode }: ScraperResultsProps) {
	return (
		<Tabs defaultValue='preview' className='w-full'>
			<TabsList className='grid w-full grid-cols-2'>
				<TabsTrigger value='preview'>Preview</TabsTrigger>
				<TabsTrigger value='json'>JSON Result</TabsTrigger>
			</TabsList>

			<TabsContent value='preview' className='mt-4 space-y-4'>
				<div className='space-y-4'>
					{mode === 'profile' && data.replies && data.replies.length > 0 ? (
						data.replies.map((post) => <ThreadCard key={post.id} post={post} />)
					) : data.thread ? (
						<ThreadCard post={data.thread} />
					) : (
						<div className='text-center text-muted-foreground'>
							No data available
						</div>
					)}
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
	);
}
