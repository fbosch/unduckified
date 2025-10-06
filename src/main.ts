// Import minimal bangs directly for fastest lookup
import { bangs as minimalBangs } from "./bangs/hashbang-minimal.ts";

// Progressive bang loading system for larger datasets
let essentialBangs: any = null;
let extendedBangs: any = null;

// Load essential bangs (most comprehensive)
const loadEssentialBangs = async () => {
	if (!essentialBangs) {
		const module = await import("./bangs/hashbang-essential.ts");
		essentialBangs = module.bangs;
	}
	return essentialBangs;
};

// Load extended bangs (fallback)
const loadExtendedBangs = async () => {
	if (!extendedBangs) {
		const module = await import("./bangs/hashbang-extended.ts");
		extendedBangs = module.bangs;
	}
	return extendedBangs;
};

// Progressive loading: check minimal first, then race between essential and extended
const loadBangsProgressive = async (bangName: string) => {
	// Check minimal bangs first (already loaded)
	if (minimalBangs[bangName]) {
		return minimalBangs;
	}

	// If not found in minimal, race between essential and extended
	const winner = await Promise.race([
		loadEssentialBangs().then((bangs) => ({ bangs, tier: "essential" })),
		loadExtendedBangs().then((bangs) => ({ bangs, tier: "extended" })),
	]);

	return winner.bangs;
};
import { storage } from "./libs.ts";

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
	CUTIES: {
		NOTFOUND: [
			"(╯︵╰,)",
			"(｡•́︿•̀｡)",
			"(⊙_☉)",
			"(╯°□°）╯︵ ┻━┻",
			"(ಥ﹏ಥ)",
			"(✿◕‿◕✿)",
			"(╥﹏╥)",
			"(｡•́︿•̀｡)",
			"(✧ω✧)",
			"(•́_•̀)",
			"(╯°□°）╯︵ ┻━┻",
		],
		LEFT: ["╰（°□°╰）", "(◕‿◕´)", "(・ω・´)"],
		RIGHT: ["(╯°□°）╯", "(｀◕‿◕)", "(｀・ω・)"],
		UP: ["(↑°□°)↑", "(´◕‿◕)↑", "↑(´・ω・)↑"],
		DOWN: ["(↓°□°)↓", "(´◕‿◕)↓", "↓(´・ω・)↓"],
	},
};
// Cache frequently accessed localStorage values
const cachedSettings = (() => {
	try {
		return {
			customBangs: JSON.parse(localStorage.getItem("custom-bangs") || "{}"),
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
		s: string;
		sc?: string;
		t: string;
		u: string;
	};
} = cachedSettings.customBangs;

function getFocusableElements(
	root: HTMLElement = document.body
): HTMLElement[] {
	return Array.from(
		root.querySelectorAll<HTMLElement>(
			'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
		)
	);
}

function setOutsideElementsTabindex(modal: HTMLElement, tabindex: number) {
	const modalElements = getFocusableElements(modal);
	const allElements = getFocusableElements();

	for (const element of allElements) {
		if (!modalElements.includes(element)) {
			element.setAttribute("tabindex", tabindex.toString());
		}
	}
}

const createTemplate = (data: { LS_DEFAULT_BANG: string }) => `
	<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh;">
		<header style="position: absolute; top: 1rem; width: 100%;">
			<div style="display: flex; justify-content: flex-end; padding: 0 1rem;">
				<button class="settings-button">
					<img src="/gear.svg" alt="Settings" class="settings" />
				</button>
			</div>
		</header>
		<div class="content-container">
			<h1 id="cutie">┐( ˘_˘ )┌</h1>
			<p>DuckDuckGo's bang redirects are too slow. Add the following URL as a custom search engine to your browser. Enables <a href="https://duckduckgo.com/bang.html" target="_blank">all of DuckDuckGo's bangs.</a></p>
			<div class="url-container">
				<input
					type="text"
					class="url-input"
					value="https://unduck.link?q=%s"
					readonly
				/>
				<button class="copy-button">
					<img src="/clipboard.svg" alt="Copy" />
				</button>
			</div>
		</div>
		<footer class="footer">
			made with ♥ by <a href="https://github.com/taciturnaxolotl" target="_blank">Kieran Klukas</a> as <a href="https://github.com/taciturnaxolotl/unduck" target="_blank">open source</a> software
		</footer>
		<div class="modal" id="settings-modal">
			<div class="modal-content">
					<button class="close-modal">&times;</button>
					<h2>Settings</h2>
					<div class="settings-section">
					    <h3>Bangs</h3>
							<label for="default-bang" id="bang-description">Default Bang: ${
								bangs[data.LS_DEFAULT_BANG]?.s || "Unknown bang"
							}</label>
							<div class="bang-select-container">
									<input type="text" id="default-bang" class="bang-select" value="${
										data.LS_DEFAULT_BANG
									}">
							</div>
							<p class="help-text">The best way to add new bangs is by submitting them on <a href="https://duckduckgo.com/newbang" target="_blank">DuckDuckGo</a> but you can also add them below</p>
							<div style="margin-top: 16px;">
								<h4>Add Custom Bang</h4>
								<div class="custom-bang-inputs">
									<input type="text" placeholder="Bang name" id="bang-name" class="bang-name">
									<input type="text" placeholder="Shortcut (e.g. !ddg)" id="bang-shortcut" class="bang-shortcut">
									<input type="text" placeholder="Search URL with {{{s}}}" id="bang-search-url" class="bang-search-url">
									<input type="text" placeholder="Base domain" id="bang-base-url" class="bang-base-url">
									<div style="text-align: right;">
										<button class="add-bang">Add Bang</button>
									</div>
								</div>
								${
									Object.keys(customBangs).length > 0
										? `
  								<h4>Your Custom Bangs</h4>
  								<div class="custom-bangs-list">
  								${Object.entries(customBangs)
										.map(
											([shortcut, bang]) => `
  									<div class="custom-bang-item">
   									<table class="custom-bang-info">
   											<tr>
  												<td class="custom-bang-name">${bang.t}</td>
  												<td class="custom-bang-shortcut"><code>!${shortcut}</code></td>
  												<td class="custom-bang-base">${bang.d}</td>
   											</tr>
   									</table>
  										<div class="custom-bang-url">${bang.u}</div>
  										<button class="remove-bang" data-shortcut="${shortcut}">Remove</button>
  									</div>
  								`
										)
										.join("")}
  								</div>
								`
										: ""
								}
							</div>
					</div>
				</div>
			</div>
		</div>
	</div>
`;

function noSearchDefaultPageRender() {
	const app = document.querySelector<HTMLDivElement>("#app");
	if (!app) throw new Error("App element not found");

	app.innerHTML = createTemplate({
		LS_DEFAULT_BANG,
	});

	const elements = {
		app,
		cutie: app.querySelector<HTMLHeadingElement>("#cutie"),
		copyInput: app.querySelector<HTMLInputElement>(".url-input"),
		copyButton: app.querySelector<HTMLButtonElement>(".copy-button"),
		copyIcon: app.querySelector<HTMLImageElement>(".copy-button img"),
		urlInput: app.querySelector<HTMLInputElement>(".url-input"),
		settingsButton: app.querySelector<HTMLButtonElement>(".settings-button"),
		modal: app.querySelector<HTMLDivElement>("#settings-modal"),
		closeModal: app.querySelector<HTMLSpanElement>(".close-modal"),
		defaultBangSelect: app.querySelector<HTMLSelectElement>("#default-bang"),
		description: app.querySelector<HTMLParagraphElement>("#bang-description"),
		bangName: app.querySelector<HTMLInputElement>(".bang-name"),
		bangShortcut: app.querySelector<HTMLInputElement>(".bang-shortcut"),
		bangSearchUrl: app.querySelector<HTMLInputElement>(".bang-search-url"),
		bangBaseUrl: app.querySelector<HTMLInputElement>(".bang-base-url"),
		addBang: app.querySelector<HTMLButtonElement>(".add-bang"),
		removeBangs: app.querySelectorAll<HTMLButtonElement>(".remove-bang"),
	} as const;

	// Validate all elements exist
	for (const [key, element] of Object.entries(elements)) {
		if (!element) throw new Error(`${key} not found`);
	}

	// After validation, we can assert elements are non-null
	const validatedElements = elements as {
		[K in keyof typeof elements]: NonNullable<(typeof elements)[K]>;
	};

	validatedElements.urlInput.value = `${window.location.protocol}//${window.location.host}?q=%s`;

	// Add mouse tracking behavior for cutie animations
	document.addEventListener("click", (e) => {
		const x = e.clientX;
		const y = e.clientY;
		const centerX = window.innerWidth / 2;
		const centerY = window.innerHeight / 2;
		const differenceX = x - centerX;
		const differenceY = y - centerY;

		if (
			Math.abs(differenceX) > Math.abs(differenceY) &&
			Math.abs(differenceX) > 100
		) {
			validatedElements.cutie.textContent =
				differenceX < 0
					? CONSTANTS.CUTIES.LEFT[
							Math.floor(Math.random() * CONSTANTS.CUTIES.LEFT.length)
					  ]
					: CONSTANTS.CUTIES.RIGHT[
							Math.floor(Math.random() * CONSTANTS.CUTIES.RIGHT.length)
					  ];
		} else if (Math.abs(differenceY) > 100) {
			validatedElements.cutie.textContent =
				differenceY < 0
					? CONSTANTS.CUTIES.UP[
							Math.floor(Math.random() * CONSTANTS.CUTIES.UP.length)
					  ]
					: CONSTANTS.CUTIES.DOWN[
							Math.floor(Math.random() * CONSTANTS.CUTIES.DOWN.length)
					  ];
		}
	});

	validatedElements.copyButton.addEventListener("click", async () => {
		await navigator.clipboard.writeText(validatedElements.urlInput.value);
		validatedElements.copyIcon.src = "/clipboard-check.svg";
		validatedElements.copyInput.classList.add("flash-white");

		setTimeout(() => {
			validatedElements.copyInput.classList.remove("flash-white");
			validatedElements.copyIcon.src = "/clipboard.svg";
		}, 375);
	});

	validatedElements.settingsButton.addEventListener("click", () => {
		validatedElements.settingsButton.classList.add("rotate");
		validatedElements.modal.style.display = "block";
		setOutsideElementsTabindex(validatedElements.modal, -1);
	});

	validatedElements.closeModal.addEventListener("click", () => {
		validatedElements.closeModal.dispatchEvent(new Event("closed"));
	});

	window.addEventListener("click", (event) => {
		if (event.target === validatedElements.modal) {
			validatedElements.closeModal.dispatchEvent(new Event("closed"));
		}
	});

	validatedElements.closeModal.addEventListener("closed", () => {
		validatedElements.modal.style.display = "none";
		setOutsideElementsTabindex(validatedElements.modal, 0);
	});

	validatedElements.defaultBangSelect.addEventListener(
		"change",
		async (event) => {
			const newDefaultBang = (event.target as HTMLSelectElement).value.replace(
				/^!+/,
				""
			);
			const bang = await getBang(newDefaultBang);

			if (!bang) {
				validatedElements.defaultBangSelect.value = LS_DEFAULT_BANG;
				validatedElements.defaultBangSelect.classList.add("shake", "flash-red");
				setTimeout(() => {
					validatedElements.defaultBangSelect.classList.remove(
						"shake",
						"flash-red"
					);
				}, 300);
				return;
			}
			storage.set(CONSTANTS.LOCAL_STORAGE_KEYS.DEFAULT_BANG, newDefaultBang);
			validatedElements.description.innerText = "Default Bang: " + bang.s;
		}
	);

	validatedElements.addBang.addEventListener("click", () => {
		const name = validatedElements.bangName.value.trim();
		const shortcut = validatedElements.bangShortcut.value
			.trim()
			.replace(/^!+/, "");
		const searchUrl = validatedElements.bangSearchUrl.value.trim();
		const baseUrl = validatedElements.bangBaseUrl.value.trim();

		if (!name || !searchUrl || !baseUrl) return;

		customBangs[shortcut] = {
			t: name,
			s: shortcut,
			u: searchUrl,
			d: baseUrl,
			r: 0,
		};
		storage.set(
			CONSTANTS.LOCAL_STORAGE_KEYS.CUSTOM_BANGS,
			JSON.stringify(customBangs)
		);

		setTimeout(() => {
			window.location.reload();
		}, 375);
	});

	validatedElements.removeBangs.forEach((button) => {
		button.addEventListener("click", (event) => {
			const shortcut = (event.target as HTMLButtonElement).dataset
				.shortcut as string;
			delete customBangs[shortcut];
			storage.set(
				CONSTANTS.LOCAL_STORAGE_KEYS.CUSTOM_BANGS,
				JSON.stringify(customBangs)
			);

			setTimeout(() => {
				window.location.reload();
			}, 375);
		});
	});
}

const LS_DEFAULT_BANG = cachedSettings.defaultBang;
const defaultBang = bangs[LS_DEFAULT_BANG];

// Optimized protocol checking - avoid URL constructor when possible
function ensureProtocol(url: string, defaultProtocol = "https://") {
	// Fast path: already has protocol
	if (url.includes("://")) {
		return url;
	}

	// Fast path: starts with common protocols
	if (url.startsWith("http://") || url.startsWith("https://")) {
		return url;
	}

	// Only use URL constructor for validation if needed
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

	// Pre-extract bang info to avoid duplicate parsing
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

	return {
		pathname: url.pathname.replace(/\/$/, ""),
		query,
		bangName,
		cleanQuery,
		url, // Keep reference to avoid re-parsing
	};
})();

// Fast path for common bangs - check these first
const COMMON_BANGS = new Set([
	"g",
	"yt",
	"w",
	"a",
	"r",
	"so",
	"gh",
	"npm",
	"ddg",
	"kagi",
]);

// Progressive bang lookup with fallback
const getBang = async (bangName: string) => {
	// Try custom bangs first (fastest lookup)
	const customBang = customBangs[bangName];
	if (customBang) return customBang;

	// Try common bangs in local bangs object
	if (COMMON_BANGS.has(bangName)) {
		return bangs[bangName];
	}

	// Use progressive loading for other bangs
	const fullBangs = await loadBangsProgressive(bangName);
	return fullBangs[bangName];
};

async function getBangredirectUrl() {
	switch (urlParams.pathname) {
		case "": {
			const { query, bangName, cleanQuery } = urlParams;

			// Fast path: empty query or settings
			if (!query || query === "!" || query === "!settings") {
				noSearchDefaultPageRender();
				return null;
			}

			// Progressive bang lookup
			const selectedBang = bangName ? await getBang(bangName) : defaultBang;

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

// Performance monitoring and service worker integration
const performanceStart = performance.now();

// Service worker performance tracking
function trackRedirectPerformance(redirectTime: number, bangName: string) {
	// Send metrics to service worker if available
	if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
		navigator.serviceWorker.controller.postMessage({
			type: "TRACK_REDIRECT",
			data: {
				redirectTime,
				bangName,
				timestamp: Date.now(),
			},
		});
	}

	// Log in development
	if (
		typeof window !== "undefined" &&
		window.location.hostname === "localhost"
	) {
		console.log(
			`Redirect processed in ${redirectTime.toFixed(2)}ms for bang: ${bangName}`
		);
	}
}

// Cache warming for common bangs
function warmUpCommonBangs() {
	const commonBangs = ["g", "yt", "w", "a", "r", "so", "gh", "npm", "ddg"];
	commonBangs.forEach((bang) => {
		// Prefetch common bang pages
		const url = `${window.location.origin}?q=!${bang}`;
		fetch(url, { mode: "no-cors" }).catch(() => {
			// Ignore errors - this is just for warming
		});
	});
}

// Initialize cache warming after a delay
setTimeout(warmUpCommonBangs, 2000);

async function doRedirect() {
	const searchUrl = await getBangredirectUrl();
	if (!searchUrl) return;

	const redirectTime = performance.now() - performanceStart;

	// Use pre-parsed bang name (no regex needed!)
	const bangName = urlParams.bangName || "default";

	// Track performance
	trackRedirectPerformance(redirectTime, bangName);

	// Optimized URL construction - avoid creating new URL object
	let finalUrl = searchUrl;
	if (searchUrl.includes("?")) {
		finalUrl += `&_perf=${redirectTime}`;
	} else {
		finalUrl += `?_perf=${redirectTime}`;
	}

	window.location.replace(finalUrl);
}

// Minimal bangs are already loaded, so we can redirect immediately
doRedirect();
