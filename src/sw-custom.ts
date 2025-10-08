import { precacheAndRoute } from "workbox-precaching";
import { clientsClaim } from "workbox-core";

// Give TypeScript the correct global.
declare let self: ServiceWorkerGlobalScope;

// Precache the app shell
precacheAndRoute(self.__WB_MANIFEST);

// Only cache the most common bangs to keep service worker small and fast
const COMMON_BANGS: Record<string, string> = {
	// Most frequently used bangs for instant redirects
	g: "https://www.google.com/search?q={{{s}}}",
	yt: "https://www.youtube.com/results?search_query={{{s}}}",
	w: "https://en.wikipedia.org/wiki/{{{s}}}",
	r: "https://www.reddit.com/search/?q={{{s}}}",
	gh: "https://github.com/search?q={{{s}}}",
	so: "https://stackoverflow.com/search?q={{{s}}}",
	a: "https://www.amazon.com/s?k={{{s}}}",
	ddg: "https://duckduckgo.com/?q={{{s}}}",
	kagi: "https://kagi.com/search?q={{{s}}}",
	y: "https://www.youtube.com/results?search_query={{{s}}}",
	tw: "https://twitter.com/search?q={{{s}}}",
	fb: "https://www.facebook.com/search/?q={{{s}}}",
	ig: "https://www.instagram.com/explore/tags/{{{s}}}",
	li: "https://www.linkedin.com/search/results/?keywords={{{s}}}",
	ebay: "https://www.ebay.com/sch/i.html?_nkw={{{s}}}",
	imdb: "https://www.imdb.com/find?q={{{s}}}",
	npm: "https://www.npmjs.com/search?q={{{s}}}",
	mdn: "https://developer.mozilla.org/en-US/search?q={{{s}}}",
	stack: "https://stackoverflow.com/search?q={{{s}}}",
	wiki: "https://en.wikipedia.org/wiki/{{{s}}}",
};

// Fast redirect handler - check cache first, then handle redirect
self.addEventListener("fetch", (event: any) => {
	const url = new URL(event.request.url);

	// Handle redirect requests
	if (url.searchParams.has("q")) {
		const query = url.searchParams.get("q") || "";
		const bangMatch = query.match(/^!(\w+)(?:\s+(.*))?$/);

		if (bangMatch) {
			const [, bangName, searchTerm] = bangMatch;
			const urlTemplate = COMMON_BANGS[bangName];

			if (urlTemplate) {
				// Fast redirect - construct URL using template and redirect immediately
				const finalUrl = urlTemplate.replace(
					"{{{s}}}",
					encodeURIComponent(searchTerm || "")
				);
				event.respondWith(Response.redirect(finalUrl, 302));
				return;
			}
		}
	}

	// For all other requests, use offline-first approach
	event.respondWith(
		caches.match(event.request).then((response) => {
			// Return cached version if available
			if (response) {
				return response;
			}

			// Otherwise fetch from network and cache it
			return fetch(event.request)
				.then((response) => {
					// Don't cache redirects or non-successful responses
					if (
						!response ||
						response.status !== 200 ||
						response.type !== "basic"
					) {
						return response;
					}

					// Clone the response before caching
					const responseToCache = response.clone();

					// Cache the response for future use
					caches.open("offline-cache").then((cache) => {
						cache.put(event.request, responseToCache);
					});

					return response;
				})
				.catch(() => {
					// If both cache and network fail, return a fallback
					if (event.request.destination === "document") {
						return caches.match("/index.html");
					}
					return new Response("Offline", { status: 503 });
				});
		})
	);
});

// Skip waiting and claim clients for immediate activation
self.skipWaiting();
clientsClaim();
