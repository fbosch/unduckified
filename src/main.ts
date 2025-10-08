// Lazy load bangs for better performance - only load when needed
import "./global.css";
import notFoundPageRender from "./404";

// Bang cache to store loaded bangs
const bangCache = new Map<string, any>();

// Lazy load bang files when needed
async function loadBangFile(fileName: string) {
	if (bangCache.has(fileName)) {
		return bangCache.get(fileName);
	}

	try {
		let module;
		switch (fileName) {
			case "hashbang-minimal":
				module = await import("./bangs/hashbang-minimal");
				break;
			case "hashbang-essential":
				module = await import("./bangs/hashbang-essential");
				break;
			default:
				console.warn(`Unknown bang file: ${fileName}`);
				return {};
		}
		const bangs = module.bangs;
		bangCache.set(fileName, bangs);
		return bangs;
	} catch (error) {
		console.warn(`Failed to load bang file: ${fileName}`, error);
		return {};
	}
}

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

// Ultra-fast bang lookup with switch statement for top bangs
const getBang = (bangName: string) => {
	// Switch statement is faster than Map for small sets
	switch (bangName) {
		case "g":
			return {
				u: "https://www.google.com/search?q={{{s}}}",
				d: "https://www.google.com",
			};
		case "r":
			return {
				u: "https://www.reddit.com/search/?q={{{s}}}",
				d: "https://www.reddit.com",
			};
		case "w":
			return {
				u: "https://en.wikipedia.org/wiki/{{{s}}}",
				d: "https://en.wikipedia.org",
			};
		case "gh":
			return {
				u: "https://github.com/search?q={{{s}}}",
				d: "https://github.com",
			};
		case "so":
			return {
				u: "https://stackoverflow.com/search?q={{{s}}}",
				d: "https://stackoverflow.com",
			};
		case "a":
			return {
				u: "https://www.amazon.com/s?k={{{s}}}",
				d: "https://www.amazon.com",
			};
		case "ddg":
			return {
				u: "https://duckduckgo.com/?q={{{s}}}",
				d: "https://duckduckgo.com",
			};
		case "kagi":
			return { u: "https://kagi.com/search?q={{{s}}}", d: "https://kagi.com" };
		case "yt":
			return {
				u: "https://www.youtube.com/results?search_query={{{s}}}",
				d: "https://www.youtube.com",
			};
		case "y":
			return {
				u: "https://www.youtube.com/results?search_query={{{s}}}",
				d: "https://www.youtube.com",
			};
		case "tw":
			return {
				u: "https://twitter.com/search?q={{{s}}}",
				d: "https://twitter.com",
			};
		case "fb":
			return {
				u: "https://www.facebook.com/search/?q={{{s}}}",
				d: "https://www.facebook.com",
			};
		case "ig":
			return {
				u: "https://www.instagram.com/explore/tags/{{{s}}}",
				d: "https://www.instagram.com",
			};
		case "li":
			return {
				u: "https://www.linkedin.com/search/results/?keywords={{{s}}}",
				d: "https://www.linkedin.com",
			};
		case "ebay":
			return {
				u: "https://www.ebay.com/sch/i.html?_nkw={{{s}}}",
				d: "https://www.ebay.com",
			};
		case "imdb":
			return {
				u: "https://www.imdb.com/find?q={{{s}}}",
				d: "https://www.imdb.com",
			};
		case "npm":
			return {
				u: "https://www.npmjs.com/search?q={{{s}}}",
				d: "https://www.npmjs.com",
			};
		case "mdn":
			return {
				u: "https://developer.mozilla.org/en-US/search?q={{{s}}}",
				d: "https://developer.mozilla.org",
			};
		case "ytm":
			return {
				u: "https://music.youtube.com/search?q={{{s}}}",
				d: "https://music.youtube.com",
			};
		case "wiki":
			return {
				u: "https://en.wikipedia.org/wiki/{{{s}}}",
				d: "https://en.wikipedia.org",
			};
		case "wh":
			return {
				u: "https://www.wowhead.com/search?q={{{s}}}",
				d: "https://www.wowhead.com",
			};
	}

	// Try custom bangs (fastest lookup)
	const customBang = customBangs[bangName];
	if (customBang) return customBang;

	// Not found in common bangs - will need lazy loading
	return null;
};

// Async bang lookup for rare bangs (lazy loaded)
async function getBangAsync(bangName: string) {
	// First try the fast synchronous lookup
	const bang = getBang(bangName);
	if (bang) return bang;

	// Try lazy loading minimal bangs
	const minimalBangs = await loadBangFile("hashbang-minimal");
	if (minimalBangs[bangName]) {
		return minimalBangs[bangName];
	}

	// Try lazy loading essential bangs
	const essentialBangs = await loadBangFile("hashbang-essential");
	if (essentialBangs[bangName]) {
		return essentialBangs[bangName];
	}

	// Not found
	return null;
}

async function noSearchDefaultPageRender() {
	// Load the rendering module asynchronously only when needed
	const { renderDefaultPage } = await import("./render");
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

// Ultra-fast URL parsing - avoid expensive URL constructor and decodeURIComponent
const urlParams = (() => {
	const href = window.location.href;
	const queryIndex = href.indexOf("?q=");

	if (queryIndex === -1) {
		return {
			pathname: window.location.pathname.slice(1),
			rawQuery: "",
			bangName: null,
			cleanQuery: "",
		};
	}

	const queryStart = queryIndex + 3;
	const queryEnd = href.indexOf("&", queryStart);
	const rawQuery =
		queryEnd === -1 ? href.slice(queryStart) : href.slice(queryStart, queryEnd);

	// Only decode if necessary (contains % encoding)
	const needsDecode = rawQuery.includes("%");
	const query = needsDecode ? decodeURIComponent(rawQuery) : rawQuery;

	const bangName = query.startsWith("!") ? query.slice(1).split(" ")[0] : null;
	const cleanQuery = bangName ? query.slice(bangName.length + 1).trim() : query;

	return {
		pathname: window.location.pathname.slice(1),
		rawQuery,
		bangName,
		cleanQuery,
	};
})();

async function getBangredirectUrl() {
	if (urlParams.pathname !== "") {
		notFoundPageRender();
		return null;
	}

	const { rawQuery, bangName, cleanQuery } = urlParams;

	// Fast path: empty query or settings
	if (!rawQuery || rawQuery === "!" || rawQuery === "!settings") {
		noSearchDefaultPageRender();
		return null;
	}

	// Ultra-fast pre-computed URLs for most common bangs
	if (bangName && cleanQuery) {
		switch (bangName) {
			case "g":
				return `https://www.google.com/search?q=${encodeURIComponent(
					cleanQuery
				)}`;
			case "r":
				return `https://www.reddit.com/search/?q=${encodeURIComponent(
					cleanQuery
				)}`;
			case "w":
				return `https://en.wikipedia.org/wiki/${encodeURIComponent(
					cleanQuery
				)}`;
			case "gh":
				return `https://github.com/search?q=${encodeURIComponent(cleanQuery)}`;
			case "so":
				return `https://stackoverflow.com/search?q=${encodeURIComponent(
					cleanQuery
				)}`;
			case "a":
				return `https://www.amazon.com/s?k=${encodeURIComponent(cleanQuery)}`;
			case "ddg":
				return `https://duckduckgo.com/?q=${encodeURIComponent(cleanQuery)}`;
			case "kagi":
				return `https://kagi.com/search?q=${encodeURIComponent(cleanQuery)}`;
			case "yt":
				return `https://www.youtube.com/results?search_query=${encodeURIComponent(
					cleanQuery
				)}`;
			case "y":
				return `https://www.youtube.com/results?search_query=${encodeURIComponent(
					cleanQuery
				)}`;
			case "tw":
				return `https://twitter.com/search?q=${encodeURIComponent(cleanQuery)}`;
			case "fb":
				return `https://www.facebook.com/search/?q=${encodeURIComponent(
					cleanQuery
				)}`;
			case "ig":
				return `https://www.instagram.com/explore/tags/${encodeURIComponent(
					cleanQuery
				)}`;
			case "li":
				return `https://www.linkedin.com/search/results/?keywords=${encodeURIComponent(
					cleanQuery
				)}`;
			case "ebay":
				return `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(
					cleanQuery
				)}`;
			case "imdb":
				return `https://www.imdb.com/find?q=${encodeURIComponent(cleanQuery)}`;
			case "npm":
				return `https://www.npmjs.com/search?q=${encodeURIComponent(
					cleanQuery
				)}`;
			case "mdn":
				return `https://developer.mozilla.org/en-US/search?q=${encodeURIComponent(
					cleanQuery
				)}`;
			case "ytm":
				return `https://music.youtube.com/search?q=${encodeURIComponent(
					cleanQuery
				)}`;
			case "wiki":
				return `https://en.wikipedia.org/wiki/${encodeURIComponent(
					cleanQuery
				)}`;
			case "wh":
				return `https://www.wowhead.com/search?q=${encodeURIComponent(
					cleanQuery
				)}`;
		}
	}

	// Fallback to general bang lookup (async for rare bangs)
	const selectedBang = bangName ? await getBangAsync(bangName) : defaultBang;

	// Early return for base domain redirect
	if (!cleanQuery && selectedBang?.d) {
		return ensureProtocol(selectedBang.d);
	}

	// Optimized URL construction
	if (!selectedBang?.u) return null;

	// Ultra-fast URL encoding - only encode if necessary
	const encodedQuery =
		cleanQuery.includes(" ") ||
		cleanQuery.includes("&") ||
		cleanQuery.includes("=")
			? encodeURIComponent(cleanQuery)
			: cleanQuery;

	return selectedBang.u.replace("{{{s}}}", encodedQuery);
}

async function doRedirect() {
	const searchUrl = await getBangredirectUrl();
	if (!searchUrl) return;

	// Ultra-fast client-side redirect - window.location.replace is faster than href
	window.location.replace(searchUrl);
}

// Fast synchronous redirect for common cases
doRedirect();
