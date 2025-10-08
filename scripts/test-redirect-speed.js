#!/usr/bin/env node

/**
 * Test redirect speed by measuring time from request to redirect
 */

import { chromium } from "playwright";

async function testRedirectSpeed() {
	const browser = await chromium.launch();
	const page = await browser.newPage();

	// Enable performance monitoring
	await page.coverage.startJSCoverage();

	console.log("Testing redirect speed...\n");

	// Test 1: Service worker redirect
	console.log("Test 1: Service worker redirect (!g test)");
	const startTime1 = Date.now();

	try {
		await page.goto("http://localhost:5173/?q=!g%20test%20search", {
			waitUntil: "networkidle",
			timeout: 10000,
		});

		const endTime1 = Date.now();
		const redirectTime1 = endTime1 - startTime1;

		console.log(`✅ Service worker redirect: ${redirectTime1}ms`);
		console.log(`   Final URL: ${page.url()}`);

		// Check if we're on Google
		if (page.url().includes("google.com")) {
			console.log("   ✅ Successfully redirected to Google");
		} else {
			console.log("   ❌ Did not redirect to Google");
		}
	} catch (error) {
		console.log(`❌ Service worker redirect failed: ${error.message}`);
	}

	// Test 2: Direct Google search (baseline)
	console.log("\nTest 2: Direct Google search (baseline)");
	const startTime2 = Date.now();

	try {
		await page.goto("https://www.google.com/search?q=test%20search", {
			waitUntil: "networkidle",
			timeout: 10000,
		});

		const endTime2 = Date.now();
		const directTime2 = endTime2 - startTime2;

		console.log(`✅ Direct Google search: ${directTime2}ms`);
	} catch (error) {
		console.log(`❌ Direct Google search failed: ${error.message}`);
	}

	// Test 3: DuckDuckGo bang redirect (comparison)
	console.log("\nTest 3: DuckDuckGo bang redirect (comparison)");
	const startTime3 = Date.now();

	try {
		await page.goto("https://duckduckgo.com/?q=!g%20test%20search", {
			waitUntil: "networkidle",
			timeout: 10000,
		});

		const endTime3 = Date.now();
		const ddgTime3 = endTime3 - startTime3;

		console.log(`✅ DuckDuckGo redirect: ${ddgTime3}ms`);
		console.log(`   Final URL: ${page.url()}`);
	} catch (error) {
		console.log(`❌ DuckDuckGo redirect failed: ${error.message}`);
	}

	// Test 4: Multiple redirects to test consistency
	console.log("\nTest 4: Multiple redirects (consistency test)");
	const redirects = ["!g", "!yt", "!w", "!gh"];
	const times = [];

	for (const bang of redirects) {
		const startTime = Date.now();

		try {
			await page.goto(`http://localhost:5173/?q=${bang}%20test`, {
				waitUntil: "networkidle",
				timeout: 5000,
			});

			const endTime = Date.now();
			const redirectTime = endTime - startTime;
			times.push(redirectTime);

			console.log(`   ${bang}: ${redirectTime}ms`);
		} catch (error) {
			console.log(`   ${bang}: ❌ Failed (${error.message})`);
		}
	}

	if (times.length > 0) {
		const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
		const minTime = Math.min(...times);
		const maxTime = Math.max(...times);

		console.log(`\n📊 Redirect Performance Summary:`);
		console.log(`   Average: ${avgTime.toFixed(1)}ms`);
		console.log(`   Min: ${minTime}ms`);
		console.log(`   Max: ${maxTime}ms`);
		console.log(
			`   Consistency: ${(((maxTime - minTime) / avgTime) * 100).toFixed(
				1
			)}% variance`
		);
	}

	await browser.close();
}

// Run the test
testRedirectSpeed().catch(console.error);
