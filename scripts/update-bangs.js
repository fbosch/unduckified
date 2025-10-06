#!/usr/bin/env node

import fs from "fs";
import path from "path";
import https from "https";
import { spawn } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BANGS_URL =
	"https://raw.githubusercontent.com/kagisearch/bangs/main/data/bangs.json";
const BANGS_FILE = path.join(__dirname, "../src/bangs/bangs.json");
const HASHBANG_GEN = path.join(__dirname, "../src/bangs/hashbanggen.ts");

async function downloadBangs() {
	console.log("🔄 Downloading latest bangs from Kagi...");

	return new Promise((resolve, reject) => {
		const file = fs.createWriteStream(BANGS_FILE);

		https
			.get(BANGS_URL, (response) => {
				if (response.statusCode !== 200) {
					reject(new Error(`Failed to download bangs: ${response.statusCode}`));
					return;
				}

				response.pipe(file);

				file.on("finish", () => {
					file.close();
					console.log("✅ Downloaded bangs.json successfully");
					resolve();
				});

				file.on("error", (err) => {
					fs.unlink(BANGS_FILE, () => {}); // Delete the file on error
					reject(err);
				});
			})
			.on("error", (err) => {
				reject(err);
			});
	});
}

async function generateHashbang() {
	console.log("🔄 Generating hashbang.ts...");

	return new Promise((resolve, reject) => {
		const process = spawn("bun", ["run", HASHBANG_GEN], {
			cwd: path.join(__dirname, ".."),
			stdio: "inherit",
		});

		process.on("close", (code) => {
			if (code === 0) {
				console.log("✅ Generated hashbang.ts successfully");
				resolve();
			} else {
				reject(new Error(`hashbanggen.ts failed with code ${code}`));
			}
		});

		process.on("error", (err) => {
			reject(err);
		});
	});
}

async function updatePackageJson() {
	console.log("🔄 Updating package.json...");

	const packagePath = path.join(__dirname, "../package.json");
	const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));

	// Add or update the update-bangs script
	if (!packageJson.scripts) {
		packageJson.scripts = {};
	}

	packageJson.scripts["update-bangs"] = "node scripts/update-bangs.js";

	fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + "\n");
	console.log("✅ Updated package.json with update-bangs script");
}

async function main() {
	try {
		await downloadBangs();
		await generateHashbang();
		await updatePackageJson();

		console.log("\n🎉 Successfully updated bangs!");
		console.log('📦 Run "bun run update-bangs" to update bangs in the future');
		console.log('🔧 Run "bun run build" to build with the new bangs');
	} catch (error) {
		console.error("❌ Error updating bangs:", error.message);
		process.exit(1);
	}
}

// Check if this script is being run directly
if (import.meta.url === `file://${process.argv[1]}`) {
	main();
}

export { downloadBangs, generateHashbang, updatePackageJson };
