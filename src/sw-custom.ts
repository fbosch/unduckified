/// <reference lib="webworker" />
import { precacheAndRoute } from "workbox-precaching";

// Give TypeScript the correct global.
declare let self: ServiceWorkerGlobalScope;

// Precache the app shell
precacheAndRoute(self.__WB_MANIFEST);

// Service worker focused on caching and offline support
// Bang redirects are handled by client-side JavaScript for maximum speed
// This provides offline functionality and caching only

// Skip waiting and claim clients for immediate activation
self.skipWaiting();
self.clients.claim();

// Message listener for debugging (development only)
self.addEventListener("message", (event) => {
	if (event.data && event.data.type === "TEST") {
		event.ports[0].postMessage("SW is working!");
	}
});
