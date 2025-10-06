// Example of how progressive bang loading could work

// 1. Load minimal bangs first (12 bangs, 3KB)
const minimalBangs = await import("./bangs/hashbang-minimal.ts");

// 2. If bang not found, load essential bangs (7,000 bangs, 1.4MB)
const essentialBangs = await import("./bangs/hashbang-essential.ts");

// 3. If still not found, load extended bangs (10,000 bangs, 2MB)
const extendedBangs = await import("./bangs/hashbang-extended.ts");

// 4. Finally, load full bangs (11,000 bangs, 2.1MB)
const fullBangs = await import("./bangs/hashbang-full.ts");

function getBangProgressive(bangName) {
  // Try minimal first (fastest)
  if (minimalBangs.bangs[bangName]) {
    return minimalBangs.bangs[bangName];
  }
  
  // Try essential (most common)
  if (essentialBangs.bangs[bangName]) {
    return essentialBangs.bangs[bangName];
  }
  
  // Try extended (less common)
  if (extendedBangs.bangs[bangName]) {
    return extendedBangs.bangs[bangName];
  }
  
  // Try full (everything)
  if (fullBangs.bangs[bangName]) {
    return fullBangs.bangs[bangName];
  }
  
  return null;
}
