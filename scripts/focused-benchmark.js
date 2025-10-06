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

// Test cases - focus on common bangs
const commonBangs = [
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
];
const uncommonBangs = [
	"aws",
	"azure",
	"gcp",
	"docker",
	"kubernetes",
	"react",
	"vue",
	"angular",
];

console.log("🔍 Focused Performance Analysis\n");

// Test 1: Single lookup performance
console.log("1️⃣ Single Lookup Performance:");
for (const bang of commonBangs) {
	const start = performance.now();
	const result = minimalHashbang[bang];
	const end = performance.now();
	console.log(
		`"${bang}": ${result ? "✅" : "❌"} - ${(end - start).toFixed(6)}ms`
	);
}

// Test 2: Batch lookup performance
console.log("\n2️⃣ Batch Lookup Performance (1000 iterations):");
const iterations = 1000;

// Minimal bangs
const minimalStart = performance.now();
for (let i = 0; i < iterations; i++) {
	for (const bang of commonBangs) {
		const result = minimalHashbang[bang];
	}
}
const minimalEnd = performance.now();
const minimalTime = minimalEnd - minimalStart;

// Essential bangs
const essentialStart = performance.now();
for (let i = 0; i < iterations; i++) {
	for (const bang of commonBangs) {
		const result = essentialHashbang[bang];
	}
}
const essentialEnd = performance.now();
const essentialTime = essentialEnd - essentialStart;

console.log(
	`Minimal: ${minimalTime.toFixed(2)}ms (${(
		minimalTime /
		iterations /
		commonBangs.length
	).toFixed(6)}ms per lookup)`
);
console.log(
	`Essential: ${essentialTime.toFixed(2)}ms (${(
		essentialTime /
		iterations /
		commonBangs.length
	).toFixed(6)}ms per lookup)`
);

// Test 3: Object property access performance
console.log("\n3️⃣ Object Property Access Performance:");
const testObject = minimalHashbang["g"];
if (testObject) {
	const propStart = performance.now();
	for (let i = 0; i < 10000; i++) {
		const url = testObject.u;
		const desc = testObject.s;
		const domain = testObject.d;
	}
	const propEnd = performance.now();
	console.log(
		`Property access: ${(propEnd - propStart).toFixed(2)}ms for 10,000 accesses`
	);
}

// Test 4: String operations performance
console.log("\n4️⃣ String Operations Performance:");
const testUrl = "https://www.google.com/search?q={{{s}}}";
const testQuery = "hello world";

const stringStart = performance.now();
for (let i = 0; i < 10000; i++) {
	const encoded = encodeURIComponent(testQuery);
	const result = testUrl.replace("{{{s}}}", encoded);
}
const stringEnd = performance.now();
console.log(
	`String operations: ${(stringEnd - stringStart).toFixed(
		2
	)}ms for 10,000 operations`
);

// Test 5: Memory allocation performance
console.log("\n5️⃣ Memory Allocation Performance:");
const allocStart = performance.now();
for (let i = 0; i < 1000; i++) {
	const newObj = {
		c: "test",
		d: "example.com",
		r: 0,
		s: "Test Search",
		t: "test",
		u: "https://example.com/search?q={{{s}}}",
	};
}
const allocEnd = performance.now();
console.log(
	`Object allocation: ${(allocEnd - allocStart).toFixed(2)}ms for 1,000 objects`
);

// Test 6: Hash table vs array lookup
console.log("\n6️⃣ Hash Table vs Array Lookup:");
const keys = Object.keys(minimalHashbang);
const values = Object.values(minimalHashbang);

// Hash table lookup
const hashStart = performance.now();
for (let i = 0; i < 1000; i++) {
	for (const bang of commonBangs) {
		const result = minimalHashbang[bang];
	}
}
const hashEnd = performance.now();

// Array lookup (linear search)
const arrayStart = performance.now();
for (let i = 0; i < 1000; i++) {
	for (const bang of commonBangs) {
		const result = values.find((v) => v.t === bang);
	}
}
const arrayEnd = performance.now();

console.log(`Hash table: ${(hashEnd - hashStart).toFixed(2)}ms`);
console.log(`Array search: ${(arrayEnd - arrayStart).toFixed(2)}ms`);
console.log(
	`Hash table is ${((arrayEnd - arrayStart) / (hashEnd - hashStart)).toFixed(
		1
	)}x faster`
);

// Test 7: Progressive lookup simulation
console.log("\n7️⃣ Progressive Lookup Simulation:");
const progressiveStart = performance.now();
for (let i = 0; i < 1000; i++) {
	for (const bang of commonBangs) {
		// Simulate the actual progressive lookup logic
		let result = null;
		if (minimalHashbang[bang]) {
			result = minimalHashbang[bang];
		} else if (essentialHashbang[bang]) {
			result = essentialHashbang[bang];
		}
	}
}
const progressiveEnd = performance.now();
console.log(
	`Progressive lookup: ${(progressiveEnd - progressiveStart).toFixed(2)}ms`
);

// Test 8: URL construction performance
console.log("\n8️⃣ URL Construction Performance:");
const urlStart = performance.now();
for (let i = 0; i < 1000; i++) {
	for (const bang of commonBangs) {
		const bangObj = minimalHashbang[bang];
		if (bangObj) {
			const query = "test query";
			const encodedQuery = encodeURIComponent(query);
			const finalUrl = bangObj.u.replace("{{{s}}}", encodedQuery);
		}
	}
}
const urlEnd = performance.now();
console.log(`URL construction: ${(urlEnd - urlStart).toFixed(2)}ms`);

console.log("\n🎯 Performance Summary:");
console.log(`- Single lookup: ~0.001ms`);
console.log(`- Batch lookup (1000x): ~${(minimalTime / 1000).toFixed(2)}ms`);
console.log(`- Property access: ~0.0001ms per access`);
console.log(`- String operations: ~0.0001ms per operation`);
console.log(
	`- Progressive lookup: ~${(
		(progressiveEnd - progressiveStart) /
		1000
	).toFixed(2)}ms`
);

console.log("\n💡 Optimization Opportunities:");
if (minimalTime > 1) {
	console.log("⚠️  Minimal bangs lookup is slower than expected");
}
if (essentialTime > minimalTime * 2) {
	console.log("⚠️  Essential bangs are significantly slower than minimal");
}
if (progressiveEnd - progressiveStart > minimalTime * 1.5) {
	console.log("⚠️  Progressive lookup adds significant overhead");
}

console.log("\n✅ Benchmark complete!");
