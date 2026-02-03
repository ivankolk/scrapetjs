import { ScraperForm } from '@/components/ScraperForm';

export default function Home() {
	return (
		<main className='min-h-screen bg-gradient-to-b from-background to-muted/20 pb-20 pt-16'>
			<div className='container mx-auto px-4'>
				<div className='mb-12 text-center'>
					<h1 className='mb-4 text-5xl font-extrabold tracking-tight lg:text-6xl'>
						Threads Scraper
					</h1>
					<p className='text-xl text-muted-foreground'>
						Extract posts and replies from Threads.net with ease
					</p>
				</div>

				<ScraperForm />
			</div>
		</main>
	);
}
