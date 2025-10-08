#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BANGS_DIR = path.join(__dirname, "../src/bangs");

// Load bang files
const minimalBangs = JSON.parse(
	fs.readFileSync(path.join(BANGS_DIR, "bangs-minimal.json"), "utf8")
);
const essentialBangs = JSON.parse(
	fs.readFileSync(path.join(BANGS_DIR, "bangs-essential.json"), "utf8")
);

// Create hashbang objects
const minimalHashbang = createHashbang(minimalBangs);
const essentialHashbang = createHashbang(essentialBangs);

function createHashbang(bangs) {
	const hashbang = {};

	bangs.forEach((bang) => {
		if (!bang.t || !bang.u || !bang.s || !bang.d) return;

		hashbang[bang.t] = {
			c: bang.c,
			sc: bang.sc,
			d: bang.d,
			ad: bang.ad,
			r: 0,
			s: bang.s,
			t: bang.t,
			ts: bang.ts,
			u: bang.u,
			x: bang.x,
			fmt: bang.fmt,
			skip_tests: bang.skip_tests,
		};

		// Add additional triggers
		if (bang.ts) {
			bang.ts.forEach((trigger) => {
				hashbang[trigger] = { ...hashbang[bang.t], t: trigger };
			});
		}
	});

	return hashbang;
}

// Simulate the actual redirect flow (synchronous version)
function simulateRedirect(query) {
	const start = performance.now();

	// Parse query (simulate URL parsing)
	let bangName = "";
	let cleanQuery = query;

	if (query.startsWith("!")) {
		const spaceIndex = query.indexOf(" ");
		if (spaceIndex === -1) {
			bangName = query.slice(1).toLowerCase();
			cleanQuery = "";
		} else {
			bangName = query.slice(1, spaceIndex).toLowerCase();
			cleanQuery = query.slice(spaceIndex + 1).trim();
		}
	} else if (query.endsWith("!")) {
		const lastSpaceIndex = query.lastIndexOf(" ");
		if (lastSpaceIndex === -1) {
			bangName = query.slice(0, -1).toLowerCase();
			cleanQuery = "";
		} else {
			bangName = query.slice(lastSpaceIndex + 1, -1).toLowerCase();
			cleanQuery = query.slice(0, lastSpaceIndex).trim();
		}
	}

	// Fast synchronous bang lookup (like our new implementation)
	let selectedBang = null;

	// Try minimal bangs first (instant)
	if (minimalHashbang[bangName]) {
		selectedBang = minimalHashbang[bangName];
	} else if (essentialHashbang[bangName]) {
		selectedBang = essentialHashbang[bangName];
	}

	if (!selectedBang) {
		return { success: false, time: performance.now() - start };
	}

	// Early return for base domain redirect
	if (!cleanQuery && selectedBang.d) {
		const finalUrl = ensureProtocol(selectedBang.d);
		return { success: true, url: finalUrl, time: performance.now() - start };
	}

	// URL construction
	if (!selectedBang.u) {
		return { success: false, time: performance.now() - start };
	}

	// URL encoding - only encode what's necessary
	let encodedQuery = cleanQuery;
	if (
		cleanQuery.includes(" ") ||
		cleanQuery.includes("&") ||
		cleanQuery.includes("=")
	) {
		encodedQuery = encodeURIComponent(cleanQuery);
	}

	const finalUrl = selectedBang.u.replace("{{{s}}}", encodedQuery);

	return { success: true, url: finalUrl, time: performance.now() - start };
}

function ensureProtocol(url) {
	if (url.startsWith("http://") || url.startsWith("https://")) {
		return url;
	}
	return "https://" + url;
}

// Test cases
const testQueries = [
	"!g hello world",
	"!yt how to code",
	"!w javascript",
	"!a laptop",
	"!r programming",
	"!so react hooks",
	"!gh facebook/react",
	"!npm lodash",
	"!steam",
	"!twitch",
	"!discord",
	"!aws",
	"!docker",
	"!kubernetes",
	"!react",
	"!vue",
	"!angular",
	"!nodejs",
	"!python",
	"!java",
	"!rust",
	"!go",
	"!php",
	"!ruby",
	"!swift",
	"!vscode",
	"!atom",
	"!sublime",
	"!vim",
	"!emacs",
];

console.log("🚀 Redirect Speed Test (Synchronous)\n");

// Test individual redirects
console.log("1️⃣ Individual Redirect Performance:");
const results = [];
for (const query of testQueries) {
	const result = simulateRedirect(query);
	results.push(result);
	if (result.success) {
		console.log(`"${query}": ✅ ${result.time.toFixed(6)}ms -> ${result.url}`);
	} else {
		console.log(`"${query}": ❌ ${result.time.toFixed(6)}ms`);
	}
}

// Test batch performance
console.log("\n2️⃣ Batch Performance (10,000 iterations):");
const batchStart = performance.now();
for (let i = 0; i < 10000; i++) {
	for (const query of testQueries) {
		simulateRedirect(query);
	}
}
const batchEnd = performance.now();
const batchTime = batchEnd - batchStart;

console.log(`Total time: ${batchTime.toFixed(2)}ms`);
console.log(
	`Per redirect: ${(batchTime / (10000 * testQueries.length)).toFixed(6)}ms`
);
console.log(
	`Per second: ${Math.round(
		(10000 * testQueries.length) / (batchTime / 1000)
	)} redirects/sec`
);

// Performance statistics
console.log("\n3️⃣ Performance Statistics:");
const times = results.map((r) => r.time);
const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
const maxTime = Math.max(...times);
const minTime = Math.min(...times);
const successCount = results.filter((r) => r.success).length;

console.log(`Average time: ${avgTime.toFixed(6)}ms`);
console.log(`Fastest: ${minTime.toFixed(6)}ms`);
console.log(`Slowest: ${maxTime.toFixed(6)}ms`);
console.log(
	`Success rate: ${successCount}/${testQueries.length} (${(
		(successCount / testQueries.length) *
		100
	).toFixed(1)}%)`
);

// Performance assessment
console.log("\n4️⃣ Performance Assessment:");
if (avgTime < 0.001) {
	console.log("✅ Excellent - redirects are extremely fast");
} else if (avgTime < 0.005) {
	console.log("✅ Very good - redirects are very fast");
} else if (avgTime < 0.01) {
	console.log("✅ Good - redirects are fast");
} else if (avgTime < 0.05) {
	console.log("⚠️  Acceptable - redirects are reasonably fast");
} else {
	console.log("❌ Slow - redirects need optimization");
}

console.log(`\n🎯 Summary:`);
console.log(`- Average redirect time: ${avgTime.toFixed(6)}ms`);
console.log(
	`- Throughput: ${Math.round(
		(10000 * testQueries.length) / (batchTime / 1000)
	)} redirects/sec`
);
console.log(
	`- Success rate: ${((successCount / testQueries.length) * 100).toFixed(1)}%`
);

console.log("\n✅ Redirect speed test complete!");
