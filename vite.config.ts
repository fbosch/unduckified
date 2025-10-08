import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
	// Ensure TypeScript is properly handled
	esbuild: {
		target: "es2022",
	},
	build: {
		// Ensure TypeScript files are compiled to JavaScript
		target: "es2022",
		// Optimize bundle size
		rollupOptions: {
			output: {
				// Ensure all output files have .js extension
				chunkFileNames: "assets/[name]-[hash].js",
				entryFileNames: "assets/[name]-[hash].js",
				assetFileNames: "assets/[name]-[hash].[ext]",
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
		// Ensure source maps are not included in production
		sourcemap: false,
		// Force JavaScript output
		lib: false,
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
						src: "/raven.png",
						sizes: "16x16",
						type: "image/gif",
					},
				],
			},
		}),
	],
});
