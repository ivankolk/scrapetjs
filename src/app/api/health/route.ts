import { NextResponse } from 'next/server';

export async function GET() {
	const health = {
		status: 'healthy' as const,
		timestamp: new Date().toISOString(),
		checks: {
			playwright: await checkPlaywright(),
		},
	};

	const statusCode = health.checks.playwright ? 200 : 503;

	return NextResponse.json(health, { status: statusCode });
}

/**
 * Check if Playwright is available
 */
async function checkPlaywright(): Promise<boolean> {
	try {
		const { chromium } = await import('playwright');
		const browser = await chromium.launch({ headless: true });
		await browser.close();
		return true;
	} catch {
		return false;
	}
}
