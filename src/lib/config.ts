export const config = {
	scraper: {
		timeout: parseInt(process.env.SCRAPER_TIMEOUT || '30000', 10),
		headless: process.env.SCRAPER_HEADLESS !== 'false',
		viewport: {
			width: 1920,
			height: 1080,
		},
		selectors: {
			contentLoaded: '[data-pressable-container=true]',
			hiddenData: 'script[type="application/json"][data-sjs]',
		},
		keys: {
			scheduledServerJS: 'ScheduledServerJS',
			threadItems: 'thread_items',
		},
	},
} as const;
