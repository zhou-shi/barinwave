import { buildIsland } from "./island-builder";
import { islandsConfig } from "../islands.config";

console.log("🏝️  Starting Brainwave Islands Architecture Build...");

const startTime = performance.now();

islandsConfig.forEach((island) => {
    buildIsland(island);
})

const endTime = performance.now();
console.log(`✨ Successfully built ${islandsConfig.length} islands in ${(endTime - startTime).toFixed(2)}ms`);