import path from "path";
import { IslandConfig } from "@/modules/types";
import { extractConfig, toPascalCase, MODULES_ROOT, getAllIslandFiles, getExportsFromFile } from "@/modules/lib/scanner";
import fs from "fs";

export const scanClient = (): IslandConfig[] => {
    console.log("📡 Scanning for Client Islands (Universal Namespace Mode)...");
    
    const configs: IslandConfig[] = [];
    const processedKeys = new Set<string>();
    const filesMap = getAllIslandFiles(); 
    
    // --- MAIN PROCESSOR ---
    const processFile = (
        filePath: string, 
        aliasPrefix: string, // Tidak lagi digunakan di mode namespace, tapi dibiarkan untuk backward compat
        rootDir: string, 
        keyNamespace: string = "" // "shadcn/", "brainwave/", etc.
    ) => {
        const fileName = path.basename(filePath, ".tsx");
        if (fileName === 'index') return;

        const userConfig = extractConfig(filePath);
        
        // Filter Static (kecuali dipaksa build)
        if (userConfig.mode === 'static' && userConfig.build !== true) return; 

        const defaultOutputDir = ['layouts', 'partials', 'islands', 'generated'];
        const outputDir = (userConfig.outputDir && userConfig.outputDir.length > 0) ? userConfig.outputDir : defaultOutputDir;
        
        const relativeModulePath = path.relative(MODULES_ROOT, filePath);
        const moduleSource = ['islands', 'modules', ...relativeModulePath.replace(/\.tsx$/, '').split(path.sep)];

        // --- MODE NAMESPACE (Menggunakan slash '/') ---
        if (keyNamespace.endsWith('/')) {
            // 1. AUTO-DISCOVERY (Prioritas: Named Exports)
            // Ini menangani kasus file yang punya banyak komponen (Shadcn) 
            // atau file biasa dengan Named Export.
            const detectedExports = getExportsFromFile(filePath);

            if (detectedExports.length > 0) {
                detectedExports.forEach(exportName => {
                    // Konversi PascalCase ke kebab-case
                    // Contoh: "AuroraTextEffect" -> "aurora-text-effect"
                    const kebabName = exportName.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
                    const subKey = `${keyNamespace}${kebabName}`;

                    if (!processedKeys.has(subKey)) {
                        configs.push({
                            name: subKey, 
                            moduleSource: moduleSource,
                            outputDir: outputDir,
                            mode: userConfig.mode,
                            createShortcode: false, // Sub-komponen biasanya tidak butuh shortcode
                            build: true,
                            exportName: exportName // 🔥 Penting untuk Manifest Generator
                        });
                        processedKeys.add(subKey);
                    }
                });
            }

            // 2. FALLBACK DEFAULT (File-based)
            // Ini menangani Default Export.
            // Contoh: container.tsx -> brainwave/container
            
            // Hitung nama kebab dari nama file
            const cleanPath = path.relative(rootDir, filePath).replace(/\.tsx$/, '');
            // Pastikan path separator '/' dan convert ke kebab-case
            const kebabPath = cleanPath.split(path.sep).map(seg => 
                seg.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
            ).join('/');

            // Jika user punya override nama di config, pakai itu. Jika tidak, pakai pola namespace.
            const baseName = userConfig.name || `${keyNamespace}${kebabPath}`;

            if (!processedKeys.has(baseName)) {
                 configs.push({
                    name: baseName,
                    moduleSource: moduleSource,
                    outputDir: outputDir,
                    mode: userConfig.mode,
                    createShortcode: userConfig.createShortcode ?? false,
                    build: true
                    // Tanpa exportName = Default Export
                });
                processedKeys.add(baseName);
            }

        } else {
            // --- MODE LEGACY (Tanpa slash, PascalCase) ---
            // Hanya dipanggil jika Anda tidak memberi slash di parameter keyNamespace
            const relativeFromRoot = path.relative(rootDir, filePath);
            const uniquePascalName = relativeFromRoot.replace(/\.tsx$/, '').split(path.sep).map(seg => toPascalCase(seg)).join('');
            const defaultName = `${keyNamespace}${uniquePascalName}`;
            const baseName = userConfig.name || defaultName;

            if (!processedKeys.has(baseName)) {
                configs.push({
                    name: baseName,
                    moduleSource: moduleSource,
                    outputDir: outputDir,
                    mode: userConfig.mode,
                    createShortcode: userConfig.createShortcode ?? false,
                    build: true
                });
                processedKeys.add(baseName);
            }
        }
    };

    // =========================================================
    // EKSEKUSI SCAN (STANDARISASI BARU) 🚀
    // =========================================================

    // 1. Brainwave ("brainwave/*")
    filesMap.brainwave.forEach(f => 
        processFile(f, "", path.join(MODULES_ROOT, "ui", "brainwave"), "brainwave/")
    );

    // 2. Lightswind ("lightswind/*")
    filesMap.lightswind.forEach(f => 
        processFile(f, "", path.join(MODULES_ROOT, "ui", "lightswind"), "lightswind/")
    );

    // 3. Shadcn ("shadcn/*")
    filesMap.shadcn.forEach(f => 
        processFile(f, "", path.join(MODULES_ROOT, "ui", "shadcn"), "shadcn/")
    );

    // 4. Spline ("spline/*")
    filesMap.spline.forEach(f => 
        processFile(f, "", path.join(MODULES_ROOT, "ui", "spline"), "spline/")
    );

    // 5. Components ("components/*")
    const componentsRoot = path.join(MODULES_ROOT, "components");
    filesMap.components.forEach(f => 
        processFile(f, "", componentsRoot, "components/")
    );

    // 6. Pages ("page/*") - Jika ada folder pages
    if (filesMap.pages) {
        const pagesRoot = path.join(MODULES_ROOT, "pages");
        filesMap.pages.forEach(f => 
            processFile(f, "", pagesRoot, "page/")
        );
    } else {
        // Fallback manual scan jika 'pages' belum ada di getAllIslandFiles()
        const pagesPath = path.join(MODULES_ROOT, "pages");
        if (fs.existsSync(pagesPath)) {
             // Simple recursive scan (jika utils belum support)
             // Atau Anda bisa tambahkan 'pages' di lib/scanner.ts Anda nanti
             // Untuk sekarang, kita skip atau asumsikan user sudah update lib scanner.
        }
    }

    // 7. Core (Tanpa Namespace, tapi file spesifik)
    filesMap.core.forEach(f => {
        if (path.basename(f) === 'ui-engine-client.tsx' || path.basename(f) === 'ui-engine-server.tsx') {
             processFile(f, "", path.join(MODULES_ROOT, "core"), ""); // Legacy mode untuk core engine
        }
    });

    return configs;
};

// --- GENERATOR MANIFEST ---
export const generateClientManifest = (islands: IslandConfig[]) => {
    const imports = islands.map(island => {
        const cleanSource = island.moduleSource.slice(2).join('/'); 
        
        // 🔥 WRAPPER: Jika exportName ada, bungkus menjadi Default
        // Ini membuat Hydrator dan Lazy Load tidak perlu tahu apakah itu Named atau Default
        if (island.exportName) {
            return `    "${island.name}": () => import("@/modules/${cleanSource}").then(m => ({ default: m.${island.exportName} })),`;
        }

        // Default Export
        return `    "${island.name}": () => import("@/modules/${cleanSource}")as unknown as Promise<IslandModul>,`;
    }).join('\n');

    const content = `// ⚠️ AUTO-GENERATED FILE. DO NOT EDIT.
// This file is generated by islands/core/scan-client.ts

import { ComponentType } from "preact";

type IslandModul = {
    default: ComponentType<any>;
    [key: string]: unknown;
}

export const COMPONENT_LOADERS: Record<string, () => Promise<IslandModul>> = {
${imports}
};
`;
    const destPath = path.join(process.cwd(), "assets", "ts", "client-manifest.ts");
    fs.writeFileSync(destPath, content);
    console.log(`✨ Client Manifest Generated: ${destPath} (${islands.length} items)`);
};