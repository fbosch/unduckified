#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BANGS_FILE = path.join(__dirname, "../src/bangs/bangs.json");
const OUTPUT_DIR = path.join(__dirname, "../src/bangs");

// Priority categories for different tiers
const ESSENTIAL_CATEGORIES = [
	"Online Services", // Search engines, maps, etc.
	"Tech", // Programming, software, etc.
	"Research", // Wikipedia, academic, etc.
	"Entertainment", // YouTube, Netflix, games, etc.
];

const EXTENDED_CATEGORIES = [
	...ESSENTIAL_CATEGORIES,
	"Shopping", // Amazon, eBay, etc.
	"Multimedia", // Music, video, etc.
	"News", // News sites
];

// Popular bang triggers to always include
const POPULAR_TRIGGERS = [
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
	"li",
	"linkedin",
	"maps",
	"translate",
	"tr",
	"imdb",
	"netflix",
	"spotify",
	"discord",
	"aws",
	"azure",
	"gcp",
	"docker",
	"kubernetes",
	"react",
	"vue",
	"angular",
	// Popular gaming bangs
	"steam",
	"epic",
	"xbox",
	"ps",
	"playstation",
	"nintendo",
	"switch",
	"pcgaming",
	"twitch",
	"youtube-gaming",
	"gaming",
	"games",
	"gamefaqs",
	"ign",
	"gamespot",
];

// Ultra-minimal triggers (only the most essential)
const ULTRA_MINIMAL_TRIGGERS = [
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
	"maps",
	"translate",
	"imdb",
	"netflix",
	"steam",
	"twitch",
	"discord", // Essential gaming platforms
];

// Categories to deprioritize or exclude
const LOW_PRIORITY_CATEGORIES = [
	"Translation", // Most users don't need extensive translation bangs
];

// Subcategories to deprioritize (but keep some gaming subcategories)
const LOW_PRIORITY_SUBCATEGORIES = [
	"Games (offline)",
	"Games (specific)", // Keep general gaming but remove very specific ones
	"Reference (fun)",
	"Reference (religion)",
	"Magazine (car)",
	"Magazine (fashion)",
	"Newspaper (intl)",
	"Languages (perl)",
	"Languages (Crystal)",
	"Languages (Mathematica)",
	"Languages (Matlab)",
	"Languages (coldfusion)",
	"Languages (d)",
	"Languages (erlang)",
	"Languages (haskell)",
	"Languages (lisp)",
	"Languages (lua)",
	"Languages (racket)",
	"Languages (scheme)",
	"Languages (vala)",
	"Languages (nix)",
];

function loadBangs() {
	const data = fs.readFileSync(BANGS_FILE, "utf8");
	return JSON.parse(data);
}

function filterBangs(bangs, tier = "essential") {
	let filtered = [...bangs];

	if (tier === "minimal") {
		// Ultra-minimal: Only the most essential triggers
		filtered = filtered.filter((bang) => {
			return ULTRA_MINIMAL_TRIGGERS.includes(bang.t);
		});
	} else if (tier === "essential") {
		// Essential: Only top categories + popular triggers
		filtered = filtered.filter((bang) => {
			// Always include popular triggers
			if (POPULAR_TRIGGERS.includes(bang.t)) return true;

			// Include essential categories (now includes Entertainment with games)
			if (ESSENTIAL_CATEGORIES.includes(bang.c)) return true;

			// Include gaming subcategories from Entertainment
			if (
				bang.c === "Entertainment" &&
				bang.sc &&
				bang.sc.startsWith("Games")
			) {
				return true;
			}

			// Include some key shopping bangs
			if (
				bang.c === "Shopping" &&
				["a", "amazon", "ebay", "steam"].includes(bang.t)
			) {
				return true;
			}

			return false;
		});
	} else if (tier === "extended") {
		// Extended: Essential + more categories
		filtered = filtered.filter((bang) => {
			// Always include popular triggers
			if (POPULAR_TRIGGERS.includes(bang.t)) return true;

			// Include extended categories
			if (EXTENDED_CATEGORIES.includes(bang.c)) return true;

			return false;
		});
	}

	// Remove low priority subcategories
	filtered = filtered.filter((bang) => {
		if (bang.sc && LOW_PRIORITY_SUBCATEGORIES.includes(bang.sc)) {
			return false;
		}
		return true;
	});

	// Remove very specific or niche bangs (long trigger names often indicate niche)
	filtered = filtered.filter((bang) => {
		// Skip bangs with very long or complex trigger names
		if (bang.t.length > 20) return false;

		// Skip bangs with special characters (except common ones)
		if (!/^[a-zA-Z0-9._-]+$/.test(bang.t)) return false;

		return true;
	});

	// Sort by trigger length (shorter = more common)
	filtered.sort((a, b) => a.t.length - b.t.length);

	return filtered;
}

function generateBangsFile(bangs, filename) {
	const outputPath = path.join(OUTPUT_DIR, filename);
	fs.writeFileSync(outputPath, JSON.stringify(bangs, null, 2));

	const sizeKB = Math.round(fs.statSync(outputPath).size / 1024);
	console.log(`✅ Generated ${filename}: ${bangs.length} bangs (${sizeKB}KB)`);

	return { count: bangs.length, sizeKB };
}

async function main() {
	console.log("🔄 Loading bangs...");
	const allBangs = loadBangs();
	console.log(`📊 Total bangs: ${allBangs.length}`);

	// Generate different tiers
	console.log("\n🔄 Generating bang tiers...");

	const minimal = filterBangs(allBangs, "minimal");
	const essential = filterBangs(allBangs, "essential");
	const extended = filterBangs(allBangs, "extended");

	// Generate files
	const minimalStats = generateBangsFile(minimal, "bangs-minimal.json");
	const essentialStats = generateBangsFile(essential, "bangs-essential.json");
	const extendedStats = generateBangsFile(extended, "bangs-extended.json");

	// Update the main bangs.json with essential by default
	generateBangsFile(essential, "bangs.json");

	console.log("\n📈 Summary:");
	console.log(
		`Minimal:   ${minimalStats.count} bangs (${minimalStats.sizeKB}KB)`
	);
	console.log(
		`Essential: ${essentialStats.count} bangs (${essentialStats.sizeKB}KB)`
	);
	console.log(
		`Extended:  ${extendedStats.count} bangs (${extendedStats.sizeKB}KB)`
	);
	console.log(
		`Full:      ${allBangs.length} bangs (${Math.round(
			fs.statSync(BANGS_FILE).size / 1024
		)}KB)`
	);

	console.log("\n🎉 Bang filtering complete!");
	console.log(
		"💡 To use different tiers, update the bangs.json reference in hashbanggen.ts"
	);
}

if (import.meta.url === `file://${process.argv[1]}`) {
	main().catch(console.error);
}

export { filterBangs, loadBangs };
