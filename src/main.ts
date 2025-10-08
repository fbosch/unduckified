// Import minimal and essential bangs directly for instant lookup
import { bangs as minimalBangs } from "./bangs/hashbang-minimal.ts";
import { bangs as essentialBangs } from "./bangs/hashbang-essential.ts";

import "./global.css";
import notFoundPageRender from "./404.ts";

// Initialize bangs with default Kagi bang, load others lazily
const bangs = {
	kagi: {
		t: "Kagi",
		s: "kagi",
		u: "https://www.kagi.com/search?q={{{s}}}",
		d: "https://www.kagi.com",
		r: 0,
	},
} as {
	[key: string]: { t: string; s: string; u: string; d: string; r: number };
};

export const CONSTANTS = {
	ANIMATION_DURATION: 375,
	LOCAL_STORAGE_KEYS: {
		DEFAULT_BANG: "default-bang",
		CUSTOM_BANGS: "custom-bangs",
	},
};

// Filter out invalid custom bangs
const filterValidCustomBangs = (
	customBangs: Record<string, any>
): Record<string, any> => {
	const filtered: Record<string, any> = {};

	for (const [shortcut, bang] of Object.entries(customBangs)) {
		// Check if bang has all required properties and they're not undefined/null/empty
		if (
			bang &&
			typeof bang === "object" &&
			bang.t &&
			typeof bang.t === "string" &&
			bang.t.trim() !== "" &&
			bang.s &&
			typeof bang.s === "string" &&
			bang.s.trim() !== "" &&
			bang.u &&
			typeof bang.u === "string" &&
			bang.u.trim() !== "" &&
			bang.d &&
			typeof bang.d === "string" &&
			bang.d.trim() !== ""
		) {
			filtered[shortcut] = bang;
		}
	}

	return filtered;
};

// Cache frequently accessed localStorage values
const cachedSettings = (() => {
	try {
		const rawCustomBangs = JSON.parse(
			localStorage.getItem("custom-bangs") || "{}"
		);
		const filteredCustomBangs = filterValidCustomBangs(rawCustomBangs);

		// If filtering removed any bangs, save the cleaned version back to storage
		if (
			Object.keys(filteredCustomBangs).length !==
			Object.keys(rawCustomBangs).length
		) {
			localStorage.setItem("custom-bangs", JSON.stringify(filteredCustomBangs));
		}

		return {
			customBangs: filteredCustomBangs,
			defaultBang: localStorage.getItem("default-bang") || "kagi",
		};
	} catch (e) {
		// Fallback for corrupted localStorage
		return {
			customBangs: {},
			defaultBang: "kagi",
		};
	}
})();

const customBangs: {
	[key: string]: {
		c?: string;
		d: string;
		r: number;
		t: string;
		u: string;
		s: string;
	};
} = cachedSettings.customBangs;

// Common bangs for fast lookup (most frequently used)
const COMMON_BANGS = new Set([
	"g",
	"ddg",
	"y",
	"r",
	"w",
	"gh",
	"so",
	"am",
	"imdb",
	"tw",
	"kagi",
]);

// Synchronous bang lookup for minimal and essential bangs
const getBang = (bangName: string) => {
	// Try custom bangs first (fastest lookup)
	const customBang = customBangs[bangName];
	if (customBang) return customBang;

	// Try common bangs in local bangs object
	if (COMMON_BANGS.has(bangName)) {
		return bangs[bangName];
	}

	// Try minimal bangs (instant lookup)
	if (minimalBangs[bangName]) {
		return minimalBangs[bangName];
	}

	// Try essential bangs (instant lookup)
	if (essentialBangs[bangName]) {
		return essentialBangs[bangName];
	}

	// Not found in common sets
	return null;
};

async function noSearchDefaultPageRender() {
	// Load the rendering module asynchronously only when needed
	const { renderDefaultPage } = await import("./render.ts");
	await renderDefaultPage();
}

const LS_DEFAULT_BANG = cachedSettings.defaultBang;
const defaultBang = bangs[LS_DEFAULT_BANG];

// Optimized protocol checking - avoid URL constructor when possible
function ensureProtocol(url: string, defaultProtocol = "https://") {
	if (url.startsWith("http://") || url.startsWith("https://")) {
		return url;
	}

	// For simple domains, just prepend protocol
	if (!url.includes("/") && !url.includes(":")) {
		return `${defaultProtocol}${url}`;
	}

	// For complex URLs, use URL constructor
	try {
		const parsedUrl = new URL(url);
		return parsedUrl.href;
	} catch (e) {
		return `${defaultProtocol}${url}`;
	}
}

// Pre-parse URL parameters once for better performance
const urlParams = (() => {
	const url = new URL(window.location.href);
	const query = url.searchParams.get("q")?.trim() ?? "";
	const bangName = query.startsWith("!") ? query.slice(1).split(" ")[0] : null;
	const cleanQuery = bangName ? query.slice(bangName.length + 1).trim() : query;

	return {
		pathname: url.pathname.slice(1), // Remove leading slash
		query,
		bangName,
		cleanQuery,
	};
})();

function getBangredirectUrl() {
	switch (urlParams.pathname) {
		case "": {
			const { query, bangName, cleanQuery } = urlParams;

			// Fast path: empty query or settings
			if (!query || query === "!" || query === "!settings") {
				noSearchDefaultPageRender();
				return null;
			}

			// Fast synchronous bang lookup
			const selectedBang = bangName ? getBang(bangName) : defaultBang;

			// Early return for base domain redirect
			if (!cleanQuery && selectedBang?.d) {
				return ensureProtocol(selectedBang.d);
			}

			// Optimized URL construction
			if (!selectedBang?.u) return null;

			// Optimized URL encoding - only encode what's necessary
			let encodedQuery = cleanQuery;
			if (
				cleanQuery.includes(" ") ||
				cleanQuery.includes("&") ||
				cleanQuery.includes("=")
			) {
				// Only encode if necessary, and avoid the replace operation
				encodedQuery = encodeURIComponent(cleanQuery);
			}

			return selectedBang.u.replace("{{{s}}}", encodedQuery);
		}
		default:
			notFoundPageRender();
			return null;
	}
}

function doRedirect() {
	const searchUrl = getBangredirectUrl();
	if (!searchUrl) return;
	window.location.replace(searchUrl);
}

// Fast synchronous redirect for common cases
doRedirect();
