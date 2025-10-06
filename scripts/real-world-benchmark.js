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

// Simulate the actual redirect flow
function simulateRedirect(query, bangs) {
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

	// Lookup bang
	const selectedBang = bangName ? bangs[bangName] : null;

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

// Test cases that simulate real user queries
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
	"!maps new york",
	"!translate hello",
	"!imdb inception",
	"!netflix",
	"!spotify",
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
	"!haskell",
	"!lisp",
	"!erlang",
	"!elixir",
	"!clojure",
	"!scala",
	"!kotlin",
	"!crystal",
	"!nim",
	"!zig",
	"!julia",
	"!dart",
	"!flutter",
	"!nonexistent",
	"!fakebang",
	"!test123",
];

console.log("🌍 Real-World Performance Test\n");

// Test 1: Minimal bangs performance
console.log("1️⃣ Minimal Bangs Performance:");
const minimalResults = [];
for (const query of testQueries) {
	const result = simulateRedirect(query, minimalHashbang);
	minimalResults.push(result);
	if (result.success) {
		console.log(`"${query}": ✅ ${result.time.toFixed(4)}ms -> ${result.url}`);
	} else {
		console.log(`"${query}": ❌ ${result.time.toFixed(4)}ms`);
	}
}

// Test 2: Essential bangs performance
console.log("\n2️⃣ Essential Bangs Performance:");
const essentialResults = [];
for (const query of testQueries) {
	const result = simulateRedirect(query, essentialHashbang);
	essentialResults.push(result);
	if (result.success) {
		console.log(`"${query}": ✅ ${result.time.toFixed(4)}ms -> ${result.url}`);
	} else {
		console.log(`"${query}": ❌ ${result.time.toFixed(4)}ms`);
	}
}

// Test 3: Progressive lookup simulation
console.log("\n3️⃣ Progressive Lookup Performance:");
const progressiveResults = [];
for (const query of testQueries) {
	const start = performance.now();

	// Parse query
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

	// Progressive lookup
	let selectedBang = null;
	if (minimalHashbang[bangName]) {
		selectedBang = minimalHashbang[bangName];
	} else if (essentialHashbang[bangName]) {
		selectedBang = essentialHashbang[bangName];
	}

	const end = performance.now();
	const time = end - start;

	if (selectedBang) {
		// URL construction
		let finalUrl = "";
		if (!cleanQuery && selectedBang.d) {
			finalUrl = ensureProtocol(selectedBang.d);
		} else if (selectedBang.u) {
			let encodedQuery = cleanQuery;
			if (
				cleanQuery.includes(" ") ||
				cleanQuery.includes("&") ||
				cleanQuery.includes("=")
			) {
				encodedQuery = encodeURIComponent(cleanQuery);
			}
			finalUrl = selectedBang.u.replace("{{{s}}}", encodedQuery);
		}

		progressiveResults.push({ success: true, url: finalUrl, time });
		console.log(`"${query}": ✅ ${time.toFixed(4)}ms -> ${finalUrl}`);
	} else {
		progressiveResults.push({ success: false, time });
		console.log(`"${query}": ❌ ${time.toFixed(4)}ms`);
	}
}

// Test 4: Batch performance test
console.log("\n4️⃣ Batch Performance Test (1000 iterations):");
const batchQueries = [
	"!g hello",
	"!yt test",
	"!w javascript",
	"!a laptop",
	"!r programming",
];

// Minimal bangs batch
const minimalBatchStart = performance.now();
for (let i = 0; i < 1000; i++) {
	for (const query of batchQueries) {
		simulateRedirect(query, minimalHashbang);
	}
}
const minimalBatchEnd = performance.now();

// Essential bangs batch
const essentialBatchStart = performance.now();
for (let i = 0; i < 1000; i++) {
	for (const query of batchQueries) {
		simulateRedirect(query, essentialHashbang);
	}
}
const essentialBatchEnd = performance.now();

// Progressive lookup batch
const progressiveBatchStart = performance.now();
for (let i = 0; i < 1000; i++) {
	for (const query of batchQueries) {
		let bangName = query.startsWith("!") ? query.slice(1).split(" ")[0] : "";
		if (minimalHashbang[bangName]) {
			// Found in minimal
		} else if (essentialHashbang[bangName]) {
			// Found in essential
		}
	}
}
const progressiveBatchEnd = performance.now();

console.log(
	`Minimal batch: ${(minimalBatchEnd - minimalBatchStart).toFixed(2)}ms`
);
console.log(
	`Essential batch: ${(essentialBatchEnd - essentialBatchStart).toFixed(2)}ms`
);
console.log(
	`Progressive batch: ${(progressiveBatchEnd - progressiveBatchStart).toFixed(
		2
	)}ms`
);

// Test 5: Performance statistics
console.log("\n5️⃣ Performance Statistics:");
const minimalTimes = minimalResults.map((r) => r.time);
const essentialTimes = essentialResults.map((r) => r.time);
const progressiveTimes = progressiveResults.map((r) => r.time);

const avgMinimal =
	minimalTimes.reduce((a, b) => a + b, 0) / minimalTimes.length;
const avgEssential =
	essentialTimes.reduce((a, b) => a + b, 0) / essentialTimes.length;
const avgProgressive =
	progressiveTimes.reduce((a, b) => a + b, 0) / progressiveTimes.length;

const maxMinimal = Math.max(...minimalTimes);
const maxEssential = Math.max(...essentialTimes);
const maxProgressive = Math.max(...progressiveTimes);

const minMinimal = Math.min(...minimalTimes);
const minEssential = Math.min(...essentialTimes);
const minProgressive = Math.min(...progressiveTimes);

console.log(
	`Minimal - Avg: ${avgMinimal.toFixed(4)}ms, Max: ${maxMinimal.toFixed(
		4
	)}ms, Min: ${minMinimal.toFixed(4)}ms`
);
console.log(
	`Essential - Avg: ${avgEssential.toFixed(4)}ms, Max: ${maxEssential.toFixed(
		4
	)}ms, Min: ${minEssential.toFixed(4)}ms`
);
console.log(
	`Progressive - Avg: ${avgProgressive.toFixed(
		4
	)}ms, Max: ${maxProgressive.toFixed(4)}ms, Min: ${minProgressive.toFixed(
		4
	)}ms`
);

// Test 6: Success rates
console.log("\n6️⃣ Success Rates:");
const minimalSuccess = minimalResults.filter((r) => r.success).length;
const essentialSuccess = essentialResults.filter((r) => r.success).length;
const progressiveSuccess = progressiveResults.filter((r) => r.success).length;

console.log(
	`Minimal: ${minimalSuccess}/${testQueries.length} (${(
		(minimalSuccess / testQueries.length) *
		100
	).toFixed(1)}%)`
);
console.log(
	`Essential: ${essentialSuccess}/${testQueries.length} (${(
		(essentialSuccess / testQueries.length) *
		100
	).toFixed(1)}%)`
);
console.log(
	`Progressive: ${progressiveSuccess}/${testQueries.length} (${(
		(progressiveSuccess / testQueries.length) *
		100
	).toFixed(1)}%)`
);

console.log("\n🎯 Performance Summary:");
console.log(`- Average redirect time: ${avgProgressive.toFixed(4)}ms`);
console.log(`- Fastest redirect: ${minProgressive.toFixed(4)}ms`);
console.log(`- Slowest redirect: ${maxProgressive.toFixed(4)}ms`);
console.log(
	`- Success rate: ${((progressiveSuccess / testQueries.length) * 100).toFixed(
		1
	)}%`
);

if (avgProgressive < 0.1) {
	console.log("✅ Excellent performance - redirects are very fast");
} else if (avgProgressive < 0.5) {
	console.log("✅ Good performance - redirects are fast");
} else if (avgProgressive < 1.0) {
	console.log("⚠️  Acceptable performance - redirects are reasonably fast");
} else {
	console.log("❌ Poor performance - redirects are slow");
}

console.log("\n✅ Real-world benchmark complete!");
