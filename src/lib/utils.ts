import type { Page } from "puppeteer";
import type { Campaign, CampaignData } from "./types.js";

// Helper utilities
export const wait = (ms = 1000) =>
	new Promise((resolve) => setTimeout(resolve, ms));

export const retry = async <T>(
	fn: () => Promise<T>,
	maxAttempts = 3,
	delay = 1000,
): Promise<T> => {
	let lastError: Error | undefined;

	for (let attempt = 1; attempt <= maxAttempts; attempt++) {
		try {
			return await fn();
		} catch (error) {
			lastError = error as Error;
			if (attempt === maxAttempts) break;
			await wait(delay * attempt);
		}
	}

	throw lastError;
};

export const isElementReady = async (
	page: Page,
	selector: string,
): Promise<boolean> => {
	return await page.evaluate((sel) => {
		const element = document.querySelector(sel);
		return !!(
			element?.isConnected && (element as HTMLElement).offsetParent !== null
		);
	}, selector);
};

// Create a hash of campaign content for comparison
const createCampaignHash = (campaign: Campaign) => {
	const [name, stages] = Object.entries(campaign)[0];
	return JSON.stringify({ name, stages });
};

// Updated cleaning function that checks content equality
export const cleanData = (data: CampaignData): CampaignData => {
	const seen = new Set<string>();
	const cleaned: CampaignData = [];

	for (const campaign of data) {
		const hash = createCampaignHash(campaign);
		if (!seen.has(hash)) {
			seen.add(hash);
			cleaned.push(campaign);
			console.log(`Added campaign: ${Object.keys(campaign)[0]}`);
		} else {
			console.log(`Skipping duplicate campaign: ${Object.keys(campaign)[0]}`);
		}
	}

	console.log(`Cleaned ${cleaned.length} campaigns from ${data.length} total`);
	return cleaned;
};
