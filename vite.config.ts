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
			strategies: "injectManifest",
			srcDir: "src",
			filename: "sw-custom.ts",
			// Enable service worker in development mode
			devOptions: {
				enabled: true,
				type: "module",
			},
			workbox: {
				// Minimal caching - focus on speed
				globPatterns: ["**/*.{js,css,html,svg}"],
				maximumFileSizeToCacheInBytes: 3 * 1048576, // 3MB

				// Simple cleanup
				cleanupOutdatedCaches: true,
				skipWaiting: true,
				clientsClaim: true,
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
