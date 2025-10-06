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
const extendedBangs = JSON.parse(
	fs.readFileSync(path.join(BANGS_DIR, "bangs-extended.json"), "utf8")
);

// Create hashbang objects
const minimalHashbang = createHashbang(minimalBangs);
const essentialHashbang = createHashbang(essentialBangs);
const extendedHashbang = createHashbang(extendedBangs);

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

// Test cases
const testCases = [
	// Common bangs (should be in minimal)
	"g",
	"google",
	"yt",
	"youtube",
	"w",
	"wikipedia",
	"a",
	"amazon",
	"r",
	"reddit",
	"so",
	"stackoverflow",
	"gh",
	"github",
	"npm",
	"ddg",
	"duckduckgo",
	"kagi",
	"fb",
	"facebook",
	"tw",
	"twitter",
	"ig",
	"instagram",
	"maps",
	"translate",
	"steam",
	"twitch",
	"discord",
	"netflix",
	"spotify",

	// Less common bangs (should be in essential)
	"aws",
	"azure",
	"gcp",
	"docker",
	"kubernetes",
	"react",
	"vue",
	"angular",
	"nodejs",
	"python",
	"java",
	"rust",
	"go",
	"php",
	"ruby",
	"swift",
	"vscode",
	"atom",
	"sublime",
	"vim",
	"emacs",

	// Rare bangs (should be in extended)
	"haskell",
	"lisp",
	"erlang",
	"elixir",
	"clojure",
	"scala",
	"kotlin",
	"crystal",
	"nim",
	"zig",
	"julia",
	"dart",
	"flutter",

	// Non-existent bangs
	"nonexistent1",
	"nonexistent2",
	"nonexistent3",
	"fakebang",
	"test123",
];

// Benchmark functions
function benchmarkDirectLookup(bangs, testCases, iterations = 10000) {
	const start = performance.now();

	for (let i = 0; i < iterations; i++) {
		for (const bangName of testCases) {
			const bang = bangs[bangName];
			if (bang) {
				// Simulate some work
				const url = bang.u;
				const description = bang.s;
			}
		}
	}

	const end = performance.now();
	return end - start;
}

function benchmarkProgressiveLookup(testCases, iterations = 1000) {
	const start = performance.now();

	for (let i = 0; i < iterations; i++) {
		for (const bangName of testCases) {
			// Simulate the progressive lookup logic
			if (minimalHashbang[bangName]) {
				const bang = minimalHashbang[bangName];
				const url = bang.u;
				const description = bang.s;
			} else if (essentialHashbang[bangName]) {
				const bang = essentialHashbang[bangName];
				const url = bang.u;
				const description = bang.s;
			} else if (extendedHashbang[bangName]) {
				const bang = extendedHashbang[bangName];
				const url = bang.u;
				const description = bang.s;
			}
		}
	}

	const end = performance.now();
	return end - start;
}

function benchmarkObjectSize(bangs) {
	const jsonString = JSON.stringify(bangs);
	return {
		sizeBytes: jsonString.length,
		sizeKB: Math.round(jsonString.length / 1024),
		sizeMB: Math.round((jsonString.length / (1024 * 1024)) * 100) / 100,
		keyCount: Object.keys(bangs).length,
	};
}

// Run benchmarks
console.log("🚀 Bang Performance Benchmarks\n");

// Test object sizes
console.log("📊 Object Sizes:");
const minimalSize = benchmarkObjectSize(minimalHashbang);
const essentialSize = benchmarkObjectSize(essentialHashbang);
const extendedSize = benchmarkObjectSize(extendedHashbang);

console.log(
	`Minimal: ${minimalSize.keyCount} bangs, ${minimalSize.sizeKB}KB (${minimalSize.sizeMB}MB)`
);
console.log(
	`Essential: ${essentialSize.keyCount} bangs, ${essentialSize.sizeKB}KB (${essentialSize.sizeMB}MB)`
);
console.log(
	`Extended: ${extendedSize.keyCount} bangs, ${extendedSize.sizeKB}KB (${extendedSize.sizeMB}MB)`
);

// Test direct lookups
console.log("\n⚡ Direct Lookup Performance (10,000 iterations):");
const minimalTime = benchmarkDirectLookup(minimalHashbang, testCases);
const essentialTime = benchmarkDirectLookup(essentialHashbang, testCases);
const extendedTime = benchmarkDirectLookup(extendedHashbang, testCases);

console.log(
	`Minimal: ${minimalTime.toFixed(2)}ms (${(
		minimalTime / testCases.length
	).toFixed(4)}ms per lookup)`
);
console.log(
	`Essential: ${essentialTime.toFixed(2)}ms (${(
		essentialTime / testCases.length
	).toFixed(4)}ms per lookup)`
);
console.log(
	`Extended: ${extendedTime.toFixed(2)}ms (${(
		extendedTime / testCases.length
	).toFixed(4)}ms per lookup)`
);

// Test progressive lookup
console.log("\n🏁 Progressive Lookup Performance (1,000 iterations):");
const progressiveTime = benchmarkProgressiveLookup(testCases);
console.log(
	`Progressive: ${progressiveTime.toFixed(2)}ms (${(
		progressiveTime / testCases.length
	).toFixed(4)}ms per lookup)`
);

// Test specific bang lookups
console.log("\n🎯 Specific Bang Lookup Tests:");
const specificTests = ["g", "youtube", "github", "steam", "nonexistent"];
for (const bang of specificTests) {
	const start = performance.now();
	let found = false;
	let tier = "none";

	if (minimalHashbang[bang]) {
		found = true;
		tier = "minimal";
	} else if (essentialHashbang[bang]) {
		found = true;
		tier = "essential";
	} else if (extendedHashbang[bang]) {
		found = true;
		tier = "extended";
	}

	const end = performance.now();
	console.log(
		`"${bang}": ${found ? "✅" : "❌"} (${tier}) - ${(end - start).toFixed(
			4
		)}ms`
	);
}

// Memory usage simulation
console.log("\n💾 Memory Usage Simulation:");
const memoryTest = () => {
	const start = performance.now();

	// Simulate loading all three datasets
	const allBangs = {
		...minimalHashbang,
		...essentialHashbang,
		...extendedHashbang,
	};

	const end = performance.now();
	const totalKeys = Object.keys(allBangs).length;
	const totalSize = JSON.stringify(allBangs).length;

	return {
		loadTime: end - start,
		totalKeys,
		totalSizeKB: Math.round(totalSize / 1024),
		totalSizeMB: Math.round((totalSize / (1024 * 1024)) * 100) / 100,
	};
};

const memoryResult = memoryTest();
console.log(
	`Combined dataset: ${memoryResult.totalKeys} bangs, ${memoryResult.totalSizeKB}KB (${memoryResult.totalSizeMB}MB)`
);
console.log(`Load time: ${memoryResult.loadTime.toFixed(2)}ms`);

// Performance recommendations
console.log("\n💡 Performance Recommendations:");
console.log(
	`- Minimal bangs are ${(essentialTime / minimalTime).toFixed(
		1
	)}x faster than essential`
);
console.log(
	`- Essential bangs are ${(extendedTime / essentialTime).toFixed(
		1
	)}x faster than extended`
);
console.log(
	`- Progressive lookup is ${(progressiveTime / minimalTime).toFixed(
		1
	)}x slower than minimal-only`
);

if (minimalTime < 1) {
	console.log("✅ Minimal bangs are extremely fast - good for hotpath");
} else {
	console.log("⚠️  Minimal bangs could be faster - consider reducing size");
}

if (essentialTime < 5) {
	console.log("✅ Essential bangs are reasonably fast");
} else {
	console.log("⚠️  Essential bangs are slow - consider optimization");
}

console.log("\n🎉 Benchmark complete!");
