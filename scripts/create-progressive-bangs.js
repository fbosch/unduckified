#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BANGS_DIR = path.join(__dirname, "../src/bangs");

// Create separate hashbang files for each tier
async function createProgressiveBangs() {
  console.log("🔄 Creating progressive bang files...");
  
  // Read the filtered bang files
  const minimal = JSON.parse(fs.readFileSync(path.join(BANGS_DIR, "bangs-minimal.json"), "utf8"));
  const essential = JSON.parse(fs.readFileSync(path.join(BANGS_DIR, "bangs-essential.json"), "utf8"));
  const extended = JSON.parse(fs.readFileSync(path.join(BANGS_DIR, "bangs-extended.json"), "utf8"));
  
  // Create hashbang objects
  const minimalHashbang = createHashbang(minimal);
  const essentialHashbang = createHashbang(essential);
  const extendedHashbang = createHashbang(extended);
  
  // Write separate TypeScript files
  writeHashbangFile(minimalHashbang, "hashbang-minimal.ts");
  writeHashbangFile(essentialHashbang, "hashbang-essential.ts");
  writeHashbangFile(extendedHashbang, "hashbang-extended.ts");
  
  console.log("✅ Progressive bang files created!");
}

function createHashbang(bangs) {
  const hashbang = {};
  
  bangs.forEach((bang) => {
    if (!bang.t || !bang.u || !bang.s || !bang.d) return;
    
    hashbang[bang.t] = {
      c: bang.c,
      sc: bang.sc,
      d: bang.d,
      ad: bang.ad,
      r: 0,
      s: bang.s,
      t: bang.t,
      ts: bang.ts,
      u: bang.u,
      x: bang.x,
      fmt: bang.fmt,
      skip_tests: bang.skip_tests,
    };
    
    // Add additional triggers
    if (bang.ts) {
      bang.ts.forEach((trigger) => {
        hashbang[trigger] = { ...hashbang[bang.t], t: trigger };
      });
    }
  });
  
  return hashbang;
}

function writeHashbangFile(hashbang, filename) {
  const content = `export const bangs: {[key: string]: ({c?:string, d: string, r: number, s:string, sc?: string, t: string, u: string })} = ${JSON.stringify(hashbang)};`;
  const filepath = path.join(BANGS_DIR, filename);
  fs.writeFileSync(filepath, content);
  
  const sizeKB = Math.round(fs.statSync(filepath).size / 1024);
  console.log(`✅ Generated ${filename}: ${Object.keys(hashbang).length} bangs (${sizeKB}KB)`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  createProgressiveBangs().catch(console.error);
}