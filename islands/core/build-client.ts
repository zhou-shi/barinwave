import { buildIsland, cleanGeneratedDirs } from "./island-builder";
import { generateClientManifest, scanClient } from "./scan-client";

console.log("🏝️  Starting Brainwave Client Build...");

cleanGeneratedDirs();

const startTime = performance.now();

// --- SCAN & PARSE CONFIGS --- 
const islandsConfig = scanClient();

// --- GENERATE MANIFEST (Agar main.tsx tahu komponen apa yang tersedia) ---
generateClientManifest(islandsConfig);

// --- BUILD INDIVIDUAL ISLANDS (Output ke folder Hugo layouts/partials) ---
console.log(`🔨 Building ${islandsConfig.length} client bundles...`);

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