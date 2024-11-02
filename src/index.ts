// src/index.ts
import type { Browser, Page } from "puppeteer";
import { getBrowser } from "./lib/browser.js";
import config from "./lib/config.js";
import fs from "node:fs/promises";
import path from "node:path";
import { cleanData } from "./lib/utils.js";

let browser: Browser | null = null;

const main = async () => {
	try {
		browser = await getBrowser();

		const page = await browser.newPage();
		// Navigate the page to a URL
		await page.goto("https://insurancebcx.insuredmine.com/", {
			waitUntil: "networkidle2",
		});

		// Login page
		const email = await page.locator('input[name="email"]');
		await email?.fill(config.insuredmineEmail);

		const password = await page.locator('input[name="password"]');
		await password?.fill(config.insuredminePassword);

		const loginBtn = await page.locator("#customer-loginbtn");
		await loginBtn?.click();

		// Dashboard page
		const engagementIcon = await page.locator(".icon-engagement");
		await engagementIcon?.click();

		// Engagement page
		const linkToDrip = await page.locator(
			'a[href="/agent/campaign/single-drip"]',
		);
		await linkToDrip?.click();

		// Drip Campaign page
		await page.waitForSelector(".single-drip-card");

		const rawData = await processDripCards(page);
		const cleanedData = cleanData(rawData);

		// Use environment variable for output directory with fallback
		const outputPath = path.join(config.outputDir, "data.json");

		try {
			// Ensure output directory exists
			await fs.mkdir(config.outputDir, { recursive: true });

			await fs.writeFile(outputPath, JSON.stringify(cleanedData, null, 2));
			console.log(`Data successfully written to ${outputPath}`);

			// Verify file was written
			const stats = await fs.stat(outputPath);
			console.log(`File size: ${stats.size} bytes`);
		} catch (writeError) {
			console.error("Error writing file:", writeError);
		}
	} catch (error) {
		console.error("Main process error:", error);
		process.exit(1);
	} finally {
		if (browser) await browser.close();
	}
};

async function processDripCards(page: Page) {
	// Get all cards info in one browser context operation
	const cards = await page.evaluate(() => {
		return Array.from(document.querySelectorAll(".dripEmail-name")).map(
			(link, index) => ({
				title: link?.textContent?.trim() || "",
				index,
			}),
		);
	});

	const allData = [];

	for (const card of cards) {
		try {
			// Click card
			await page.waitForSelector(".dripEmail-name");

			const cardNode = await page.waitForSelector(
				`div.dripEmail-name ::-p-text("${card.title}")`,
			);
			if (!cardNode) throw new Error("Card node not found");

			await cardNode.scrollIntoView();
			await cardNode.click();

			// Get timeline data in browser context
			const timelineData = await getTimelineData(page, card.title);
			allData.push({ [card.title]: timelineData });

			// Navigate back
			const backLink = await page.waitForSelector(
				'a[href="/agent/campaign/single-drip/overview"]',
			);
			if (!backLink) throw new Error("Back link not found");
			await backLink.click();

			await page.waitForSelector(".dripEmail-name");
		} catch (error) {
			throw new Error(`Error processing card ${card.title}: ${error}`);
		}
	}

	return allData;
}

async function getTimelineData(page: Page, cardTitle: string) {
	// Wait for timeline to be present
	await page.waitForSelector(".timeline");

	// Get all stages at once
	const stages = await page.$$(".stage-name");
	console.log(`Found ${stages.length} stages for ${cardTitle}`);

	const allStagesData = [];

	for (let i = 0; i < stages.length; i++) {
		// if (cardTitle === "CAB Drip - Brendan") {
		// 	console.log(`Skipping stage for ${cardTitle}`);
		// 	continue;
		// }
		// if (cardTitle !== "CAB Drip - Brendan") {
		// 	console.log(`Skipping stage non-Brendan for ${cardTitle}`);
		// 	continue;
		// }

		// Get stage info before clicking
		const stageInfo = await page.evaluate((index) => {
			const stages = Array.from(document.querySelectorAll(".stage-name"));
			const stage = stages[index];
			if (!stage) return null;

			// Get stage type
			const typeIcon = stage.querySelector(".fa, .voice-o");
			let type = "unknown"; // Default value instead of undefined
			if (typeIcon) {
				if (typeIcon.classList.contains("fa-envelope")) type = "email";
				else if (typeIcon.classList.contains("fa-tasks")) type = "task";
				else if (typeIcon.classList.contains("voice-o")) type = "voicemail";
			}

			// Get timing info
			const timingSpan = stage.querySelector("span");
			const timing = timingSpan
				? timingSpan.childNodes[0].textContent?.trim() || null
				: null;
			const timeDiv = stage.querySelector('div[style*="font-size: 14px"]');
			const scheduleTime = timeDiv ? timeDiv.textContent?.trim() || null : null;

			return {
				type, // Will never be undefined
				timing,
				scheduleTime,
				index,
			};
		}, i);

		if (!stageInfo) continue;

		// Click the stage
		await page.evaluate((index) => {
			const stages = Array.from(document.querySelectorAll(".stage-name"));
			const stage = stages[index];
			if (stage) {
				stage.scrollIntoView({ behavior: "smooth", block: "center" });
				const clickEvent = new MouseEvent("click", {
					view: window,
					bubbles: true,
					cancelable: true,
				});
				stage.dispatchEvent(clickEvent);
			}
		}, i);

		// Wait for content update
		await new Promise((resolve) => setTimeout(resolve, 100));

		// Get updated content
		const content = await page.evaluate(() => {
			const titleElem = document.querySelector(".drip-title");
			const stageDetails = document.querySelector("app-html-rendrer");
			const contentSpan = stageDetails?.shadowRoot?.querySelector("span");

			return {
				title: titleElem?.textContent?.trim() || null,
				details: contentSpan?.textContent?.trim() || null,
			};
		});

		allStagesData.push({
			type: stageInfo.type,
			timing: stageInfo.timing,
			scheduleTime: stageInfo.scheduleTime,
			index: stageInfo.index,
			dripTitle: content.title,
			details: content.details,
		});

		console.log(`Processed stage ${i}:`, {
			type: stageInfo.type,
			title: content.title,
		});
	}

	return allStagesData;
}

main();
