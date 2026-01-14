import { buildIsland } from "./island-builder";
import { generateClientManifest, scanIslands } from "./scanner";

console.log("🏝️  Starting Brainwave Islands Architecture Build...");

const startTime = performance.now();

// 1. SCAN FILE SYSTEM & BACA CONFIG
const islandsConfig = scanIslands();

// 2. GENERATE CLIENT MANIFEST (Otomatis update main.tsx logic)
generateClientManifest(islandsConfig);

// 3. BUILD SETIAP ISLAND
islandsConfig.forEach((island) => {
    buildIsland(island);
})

const endTime = performance.now();
console.log(`✨ Successfully built ${islandsConfig.length} islands in ${(endTime - startTime).toFixed(2)}ms`);






// import { buildIsland } from "./island-builder";
// import { islandsConfig } from "../islands.config";

// console.log("🏝️  Starting Brainwave Islands Architecture Build...");

// const startTime = performance.now();

// islandsConfig.forEach((island) => {
//     buildIsland(island);
// })

// const endTime = performance.now();
// console.log(`✨ Successfully built ${islandsConfig.length} islands in ${(endTime - startTime).toFixed(2)}ms`);