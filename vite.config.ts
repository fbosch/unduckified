import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
	build: {
		// Optimize bundle size
		rollupOptions: {
			output: {
				manualChunks: {
					// Split bangs data into separate chunk
					bangs: ["./src/bangs/hashbang.ts"],
					// Keep main app code separate
					app: ["./src/main.ts", "./src/libs.ts", "./src/404.ts"],
				},
			},
		},
		// Enable minification
		minify: "terser",
		terserOptions: {
			compress: {
				drop_console: true, // Remove console.log in production
				drop_debugger: true,
			},
		},
		// Increase chunk size warning limit
		chunkSizeWarningLimit: 3000,
	},
	plugins: [
		VitePWA({
			registerType: "autoUpdate",
			workbox: {
				// Optimized for redirect app with code splitting
				globPatterns: [
					"**/*.{js,css,html}",
					"*.{svg,gif}", // Image assets
					"manifest.webmanifest",
					"opensearch.xml",
				],
				// Increased cache size to accommodate the large bangs bundle
				maximumFileSizeToCacheInBytes: 3 * 1048576, // 3MB to handle the bangs data

				// Custom runtime caching strategies optimized for redirect app
				runtimeCaching: [
					{
						// Cache static assets with cache-first for maximum performance
						urlPattern: /\.(?:js|css|woff2|svg|gif|webmanifest)$/,
						handler: "CacheFirst",
						options: {
							cacheName: "static-resources-v1",
							expiration: {
								maxEntries: 30,
								maxAgeSeconds: 60 * 24 * 60 * 60, // 60 days
							},
							// Note: cacheKeyWillBeUsed is not available in this workbox version
							// Versioning handled by workbox automatically
						},
					},
					{
						// Cache HTML with stale-while-revalidate for fast loading
						urlPattern: /\.(?:html)$/,
						handler: "StaleWhileRevalidate",
						options: {
							cacheName: "html-cache-v1",
							expiration: {
								maxEntries: 5,
								maxAgeSeconds: 24 * 60 * 60, // 24 hours
							},
						},
					},
					{
						// Network-first for redirect requests with aggressive caching
						urlPattern: ({ url }) => url.searchParams.has("q"),
						handler: "NetworkFirst",
						options: {
							cacheName: "redirect-cache-v1",
							expiration: {
								maxEntries: 200,
								maxAgeSeconds: 10 * 60, // 10 minutes
							},
							networkTimeoutSeconds: 2, // Very fast timeout for redirects
							cacheableResponse: {
								statuses: [0, 200, 302, 301, 307, 308], // Include redirects
							},
						},
					},
				],

				// Optimize cleanup
				cleanupOutdatedCaches: true,
				skipWaiting: true,
				clientsClaim: true,

				// Note: backgroundSync not available in this workbox version
				// Offline handling done through network-first strategy
			},

			// PWA manifest optimizations
			manifest: {
				name: "Unduckified - Fast DuckDuckGo Bangs",
				short_name: "Unduckified",
				description: "Lightning-fast DuckDuckGo bang redirects",
				theme_color: "#1a1a1a",
				background_color: "#ffffff",
				display: "standalone",
				orientation: "portrait",
				scope: "/",
				start_url: "/",
				icons: [
					{
						src: "/goose.gif",
						sizes: "16x16",
						type: "image/gif",
					},
				],
			},
		}),
	],
});
