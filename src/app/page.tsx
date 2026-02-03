export default function Home() {
	return (
		<div className='min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900'>
			<div className='mx-auto max-w-4xl px-6 py-16'>
				<div className='mb-12 text-center'>
					<h1 className='mb-4 text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50'>
						Threads Scraper API
					</h1>
					<p className='text-xl text-zinc-600 dark:text-zinc-400'>
						Extract posts and replies from Threads.net with a simple HTTP API
					</p>
				</div>

				<div className='space-y-8'>
					{/* Scrape Endpoint */}
					<section className='rounded-xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900'>
						<div className='mb-4 flex items-center gap-3'>
							<span className='rounded bg-green-100 px-3 py-1 text-sm font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400'>
								POST
							</span>
							<code className='text-lg font-mono text-zinc-900 dark:text-zinc-100'>
								/api/scrape
							</code>
						</div>
						<p className='mb-6 text-zinc-600 dark:text-zinc-400'>
							Scrape a Threads post and its replies
						</p>

						<div className='space-y-4'>
							<div>
								<h3 className='mb-2 font-semibold text-zinc-900 dark:text-zinc-100'>
									Request Body
								</h3>
								<pre className='overflow-x-auto rounded-lg bg-zinc-100 p-4 text-sm dark:bg-zinc-950'>
									<code>{`{
  "url": "https://www.threads.net/t/C8H5FiCtESk/",
  "includeReplies": true,
  "maxReplies": 50,
  "timeout": 30000
}`}</code>
								</pre>
							</div>

							<div>
								<h3 className='mb-2 font-semibold text-zinc-900 dark:text-zinc-100'>
									Example with cURL
								</h3>
								<pre className='overflow-x-auto rounded-lg bg-zinc-100 p-4 text-sm dark:bg-zinc-950'>
									<code>{`curl -X POST http://localhost:3000/api/scrape \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://www.threads.net/t/C8H5FiCtESk/"}'`}</code>
								</pre>
							</div>
						</div>
					</section>

					{/* Health Endpoint */}
					<section className='rounded-xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900'>
						<div className='mb-4 flex items-center gap-3'>
							<span className='rounded bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'>
								GET
							</span>
							<code className='text-lg font-mono text-zinc-900 dark:text-zinc-100'>
								/api/health
							</code>
						</div>
						<p className='mb-6 text-zinc-600 dark:text-zinc-400'>
							Check the health status of the service
						</p>

						<div>
							<h3 className='mb-2 font-semibold text-zinc-900 dark:text-zinc-100'>
								Example
							</h3>
							<pre className='overflow-x-auto rounded-lg bg-zinc-100 p-4 text-sm dark:bg-zinc-950'>
								<code>{`curl http://localhost:3000/api/health`}</code>
							</pre>
						</div>
					</section>

					{/* Response Format */}
					<section className='rounded-xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900'>
						<h2 className='mb-4 text-2xl font-bold text-zinc-900 dark:text-zinc-100'>
							Response Format
						</h2>
						<div className='space-y-4'>
							<div>
								<h3 className='mb-2 font-semibold text-zinc-700 dark:text-zinc-300'>
									Success (200)
								</h3>
								<pre className='overflow-x-auto rounded-lg bg-zinc-100 p-4 text-sm dark:bg-zinc-950'>
									<code>{`{
  "success": true,
  "data": {
    "thread": {...},
    "replies": [...],
    "metadata": {
      "scrapedAt": "2026-02-02T08:00:00.000Z",
      "url": "...",
      "replyCount": 15,
      "processingTime": 2543
    }
  }
}`}</code>
								</pre>
							</div>

							<div>
								<h3 className='mb-2 font-semibold text-zinc-700 dark:text-zinc-300'>
									Error (4xx/5xx)
								</h3>
								<pre className='overflow-x-auto rounded-lg bg-zinc-100 p-4 text-sm dark:bg-zinc-950'>
									<code>{`{
  "success": false,
  "error": {
    "code": "INVALID_URL",
    "message": "Invalid Threads URL format"
  }
}`}</code>
								</pre>
							</div>
						</div>
					</section>

					{/* Tech Stack */}
					<section className='rounded-xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900'>
						<h2 className='mb-4 text-2xl font-bold text-zinc-900 dark:text-zinc-100'>
							Tech Stack
						</h2>
						<div className='flex flex-wrap gap-2'>
							{['Next.js 16', 'TypeScript', 'Playwright', 'Zod'].map((tech) => (
								<span
									key={tech}
									className='rounded-full bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
								>
									{tech}
								</span>
							))}
						</div>
					</section>
				</div>
			</div>
		</div>
	);
}
