import path from "path";
import { IslandConfig } from "@/modules/types";
import { extractConfig, toPascalCase, MODULES_ROOT, getAllIslandFiles } from "@/modules/lib/scanner";
import fs from "fs";

export const scanClient = (): IslandConfig[] => {
    console.log("📡 Scanning for Client Islands (Config Override Mode)...");
    
    const configs: IslandConfig[] = [];
    const processedKeys = new Set<string>();

    // 1. AMBIL SEMUA FILE DARI UTILS
    const filesMap = getAllIslandFiles(); 
    
    // --- HELPER SCANNER ---
    const processFile = (
        filePath: string, 
        aliasPrefix: string, 
        rootDir: string, 
        keyNamespace: string = ""
    ) => {
        const fileName = path.basename(filePath, ".tsx");
        if (fileName === 'index') return;

        // 1. EKSTRAK CONFIG DARI DALAM FILE
        // Ini akan membaca export const config = { ... }
        const userConfig = extractConfig(filePath);

        // if (!userConfig.mode) return;

        // Filter: Jika mode static eksplisit, skip (kecuali user memaksa build: true)
        if (userConfig.mode === 'static' && userConfig.build !== true) return; 

        // 2. HITUNG NILAI DEFAULT (Sistem Otomatis)
        const relativeFromRoot = path.relative(rootDir, filePath);
        const uniquePascalName = relativeFromRoot
            .replace(/\.tsx$/, '')
            .split(path.sep)
            .map(seg => toPascalCase(seg))
            .join('');
        
        // Default Name: "CompHeaderHotodus"
        const defaultName = `${keyNamespace}${uniquePascalName}`;
        
        // Default Output: layouts/partials/islands/generated
        const defaultOutputDir = ['layouts', 'partials', 'islands', 'generated'];


        // 3. LOGIKA OVERRIDE (YANG ANDA INGINKAN) 🔥
        // Jika userConfig.name ada ("hotodus"), pakai itu. Jika tidak, pakai defaultName.
        const finalName = userConfig.name || defaultName;

        // Jika userConfig.outputDir ada, pakai itu. Jika tidak, pakai defaultOutputDir.
        const finalOutputDir = (userConfig.outputDir && userConfig.outputDir.length > 0) 
            ? userConfig.outputDir 
            : defaultOutputDir;


        // 4. Module Source Path (Tetap sama)
        const relativeModulePath = path.relative(MODULES_ROOT, filePath);
        const moduleSource = ['islands', 'modules', ...relativeModulePath.replace(/\.tsx$/, '').split(path.sep)];


        // 5. REGISTER KE CONFIG
        if (!processedKeys.has(finalName)) {
            configs.push({
                name: finalName,            // "hotodus" (jika di-override) atau "CompHeaderHotodus"
                moduleSource: moduleSource,
                outputDir: finalOutputDir,  // Custom path atau Default path
                mode: userConfig.mode,      // "interactive" / "static"
                createShortcode: userConfig.createShortcode ?? false, // Default false jika undefined
                build: true
            });
            processedKeys.add(finalName);
        }
        
        // 6. Lowercase Fallback (Hanya jika TIDAK di-override user)
        // Jika user sudah menentukan nama sendiri ("hotodus"), kita tidak perlu membuat duplikat lowercase lagi.
        if (!userConfig.name && keyNamespace.endsWith('/')) {
            const lowerKey = `${keyNamespace}${fileName.toLowerCase()}`;
            if (lowerKey !== finalName && !processedKeys.has(lowerKey)) {
                configs.push({
                    name: lowerKey,
                    moduleSource: moduleSource,
                    outputDir: finalOutputDir,
                    mode: userConfig.mode,
                    createShortcode: false,
                    build: true
                });
                processedKeys.add(lowerKey);
            }
        }
    };

    // =========================================================
    // EKSEKUSI SCAN
    // =========================================================

    // 1. Brainwave UI (Prefix: Ui)
    filesMap.brainwave.forEach(f => 
        processFile(f, "Ui", path.join(MODULES_ROOT, "ui", "brainwave"), "Ui")
    );

    // 2. Lightswind UI (Prefix: Lw)
    filesMap.lightswind.forEach(f => 
        processFile(f, "Lw", path.join(MODULES_ROOT, "ui", "lightswind"), "Lw")
    );

    // 3. Shadcn UI (Namespace: shadcn/)
    filesMap.shadcn.forEach(f => 
        processFile(f, "Shadcn", path.join(MODULES_ROOT, "ui", "shadcn"), "shadcn/")
    );

    // 4. Spline UI (Namespace: spline/)
    filesMap.spline.forEach(f => 
        processFile(f, "Spline", path.join(MODULES_ROOT, "ui", "spline"), "spline/")
    );

    // 5. Components (Prefix: Comp)
    // Sekarang kita tidak perlu if-else "header" disini lagi.
    // Cukup tambahkan config di file hotodus.tsx, scanner akan patuh.
    const componentsRoot = path.join(MODULES_ROOT, "components");
    filesMap.components.forEach(f => 
        processFile(f, "Comp", componentsRoot, "Comp")
    );

    // 6. Core
    filesMap.core.forEach(f => {
        if (path.basename(f) === 'ui-engine-client.tsx' || path.basename(f) === 'ui-engine-server.tsx') {
             processFile(f, "", path.join(MODULES_ROOT, "core"), "");
        }
    });

    return configs;
};

// ... (generateClientManifest Tetap Sama)
export const generateClientManifest = (islands: IslandConfig[]) => {
    const imports = islands.map(island => {
        const cleanSource = island.moduleSource.slice(2).join('/'); 
        return `    "${island.name}": () => import("@/modules/${cleanSource}"),`;
    }).join('\n');

    const content = `// ⚠️ AUTO-GENERATED FILE. DO NOT EDIT.
// This file is generated by islands/core/scan-client.ts

import { ComponentType } from "preact";

type IslandModul = {
    default?: ComponentType<any>;
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



















// import path from "path";
// import { IslandConfig } from "@/modules/types";
// import { extractConfig, toPascalCase, MODULES_ROOT, getAllIslandFiles } from "@/modules/lib/scanner";
// import fs from "fs";

// export const scanIslandsForClient = (): IslandConfig[] => {
//     console.log("📡 Scanning for Client Islands (Centralized Data Source)...");
    
//     const configs: IslandConfig[] = [];
//     const processedKeys = new Set<string>();

//     // 1. AMBIL SEMUA FILE DARI UTILS (Pusat Data)
//     const filesMap = getAllIslandFiles(); 
    
//     // --- HELPER SCANNER ---
//     const processFile = (filePath: string, aliasPrefix: string, rootDir: string, keyNamespace: string = "") => {
//         const fileName = path.basename(filePath, ".tsx");
//         if (fileName === 'index') return;

//         // Cek Config (Mode Static skip)
//         const userConfig = extractConfig(filePath);
//         if (userConfig.mode === 'static' || userConfig.build === false) return; 

//         // Generate Key PascalCase (Contoh: "shadcn/Button")
//         const relativeFromRoot = path.relative(rootDir, filePath);
//         const uniquePascalName = relativeFromRoot
//             .replace(/\.tsx$/, '')
//             .split(path.sep)
//             .map(seg => toPascalCase(seg))
//             .join('');
        
//         const finalKey = `${keyNamespace}${uniquePascalName}`;

//         // Module Source Path
//         const relativeModulePath = path.relative(MODULES_ROOT, filePath);
//         const moduleSource = ['islands', 'modules', ...relativeModulePath.replace(/\.tsx$/, '').split(path.sep)];

//         // A. Register PascalCase Key (Utama)
//         if (!processedKeys.has(finalKey)) {
//             configs.push({
//                 name: finalKey, 
//                 moduleSource: moduleSource,
//                 outputDir: [],
//                 mode: userConfig.mode,
//                 createShortcode: false,
//                 build: true
//             });
//             processedKeys.add(finalKey);
//         }

//         // B. Register Lowercase Key (Fallback untuk namespace 'shadcn/', 'spline/')
//         if (keyNamespace.endsWith('/')) {
//             const lowerKey = `${keyNamespace}${fileName.toLowerCase()}`;
//             if (lowerKey !== finalKey && !processedKeys.has(lowerKey)) {
//                 configs.push({
//                     name: lowerKey,
//                     moduleSource: moduleSource,
//                     outputDir: [],
//                     mode: userConfig.mode,
//                     createShortcode: false,
//                     build: true
//                 });
//                 processedKeys.add(lowerKey);
//             }
//         }
//     };

//     // =========================================================
//     // EKSEKUSI SCAN (Jauh Lebih Bersih!)
//     // =========================================================

//     // 1. Brainwave UI (Prefix: Ui)
//     filesMap.brainwave.forEach(f => 
//         processFile(f, "Ui", path.join(MODULES_ROOT, "ui", "brainwave"), "Ui")
//     );

//     // 2. Lightswind UI (Prefix: Lw)
//     filesMap.lightswind.forEach(f => 
//         processFile(f, "Lw", path.join(MODULES_ROOT, "ui", "lightswind"), "Lw")
//     );

//     // 3. Shadcn UI (Namespace: shadcn/)
//     filesMap.shadcn.forEach(f => 
//         processFile(f, "Shadcn", path.join(MODULES_ROOT, "ui", "shadcn"), "shadcn/")
//     );

//     // 4. Spline UI (Namespace: spline/)
//     filesMap.spline.forEach(f => 
//         processFile(f, "Spline", path.join(MODULES_ROOT, "ui", "spline"), "spline/")
//     );

//     // 5. Components (Prefix: Comp)
//     const componentsRoot = path.join(MODULES_ROOT, "components");
//     filesMap.components.forEach(f => 
//         processFile(f, "Comp", componentsRoot, "Comp")
//     );

//     // 6. Core (Khusus ui-engine-client)
//     filesMap.core.forEach(f => {
//         if (path.basename(f) === 'ui-engine-client.tsx') {
//              configs.push({
//                 name: "ui-engine-client",
//                 moduleSource: ['islands', 'modules', 'core', 'ui-engine-client'],
//                 mode: 'interactive',
//                 build: true,
//                 outputDir: [],
//              });
//         }
//     });

//     return configs;
// };

// // --- MANIFEST GENERATOR ---
// export const generateClientManifest = (islands: IslandConfig[]) => {
//     const imports = islands.map(island => {
//         const cleanSource = island.moduleSource.slice(2).join('/'); 
//         return `    "${island.name}": () => import("@/modules/${cleanSource}"),`;
//     }).join('\n');

//     const content = `// ⚠️ AUTO-GENERATED FILE. DO NOT EDIT.
// // This file is generated by islands/core/scan-client.ts

// import { FunctionalComponent } from "preact";
// import { IslandProps } from "@/modules/types";

// type IslandModul = {
//     default: FunctionalComponent<IslandProps>;
// }

// export const COMPONENT_LOADERS: Record<string, () => Promise<IslandModul>> = {
// ${imports}
// };
// `;

//     const destPath = path.join(process.cwd(), "assets", "ts", "client-manifest.ts");
//     fs.writeFileSync(destPath, content);
//     console.log(`✨ Client Manifest Generated: ${destPath} (${islands.length} items)`);
// };





// import fs from "fs";
// import path from "path";
// import { buildSync } from "esbuild";
// import { IslandConfig } from "@/modules/types";


// // DEFAULT CONFIG
// // Tips: Gunakan function agar setiap pemanggilan menghasilkan object baru (Fresh Reference)
// // Ini mencegah mutasi array outputDir terbawa ke komponen lain.
// const createDefaults = (): IslandConfig=> ({
//     mode: undefined, // Biarkan undefined agar logic parent bisa menentukan default fallback
//     name: '',
//     build: true,     // Default biasanya true agar terproses
//     createShortcode: true,
//     moduleSource: [],
//     outputDir: []
// });

// // Root directory modul Anda
// const MODULES_ROOT = path.join(process.cwd(), "islands", "modules");

// // SCANNING ENGINE (STRICT MODE)

// /**
//  * Scan directory dengan opsi Strict Mode (Recursive vs Flat)
//  * @param dirPath Path direktori target
//  * @param recursive Jika true, akan scan subfolder. Jika false, hanya root folder target.
//  * @param arrayOfFiles Akumulator file (untuk rekursi)
//  */
// const getFilesStrict = (dirPath: string, recursive: boolean, arrayOfFiles: string[] = []) => {
//     // Safety check: Jika folder tidak ada, kembalikan array kosong (jangan crash)
//     if (!fs.existsSync(dirPath)) return arrayOfFiles;

//     const files = fs.readdirSync(dirPath);

//     files.forEach((file) => {
//         const fullPath = path.join(dirPath, file);
//         const stat = fs.statSync(fullPath);

//         if (stat.isDirectory()) {
//             // ATURAN KETAT: Hanya masuk subfolder jika mode recursive aktif
//             if (recursive) {
//                 getFilesStrict(fullPath, recursive, arrayOfFiles);
//             }
//             // Jika flat (misal folder 'ui'), subfolder 'shadcn' akan DIABAIKAN.
//         } else {
//             // Hanya ambil file .tsx (bukan .d.ts)
//             if (file.endsWith(".tsx") && !file.endsWith(".d.ts")) {
//                 arrayOfFiles.push(fullPath);
//             }
//         }
//     });

//     return arrayOfFiles;
// };

// // Helper: Intip Config dari File (Lightweight Build)
// const extractConfig = (filePath: string): IslandConfig => {
//     try {
//         // LIGHTWEIGHT BUILD
//         // Kita hanya ekstrak config, jadi 'external: ["*"]' sangat tepat agar cepat
//         const result = buildSync({
//             entryPoints: [filePath],
//             write: false,
//             bundle: true,
//             format: 'cjs',
//             platform: 'node',
//             external: ['*'], 
//             loader: { '.tsx': 'tsx', '.ts': 'ts' }
//         });

//         const code = result.outputFiles[0].text;

//         // UNIVERSAL PROXY (Fix TS7023)
//         // --- FIX TS7023: Explicit Return Type 'any' ---
//         // Proxy ini HARUS bertipe 'any' karena ia berpura-pura menjadi
//         // segala hal (string, function, object, array) untuk menipu library.
//         // Proxy ini "menelan" semua akses properti/fungsi agar tidak crash saat mockRequire
//         const createProxy = (): any => new Proxy(() => {}, {
//             get: () => createProxy(),       // Rekursif aman karena tipe eksplisit
//             apply: () => createProxy(),     // Aman
//             construct: () => createProxy()  // Aman
//         });
        
//         const mockRequire = (id: string) => {
//             return createProxy();
//         };

//         // VIRTUAL EXECUTION
//         const module = { exports: {} as any };
//         const wrapper = new Function('module', 'exports', 'require', code);
        
//         wrapper(module, module.exports, mockRequire); 

//         // MERGING STRATEGY (CRITICAL FIX)
//         const userConfig = module.exports.config || {};

//         // Gabungkan: Default <-- User Config
//         // Properti user akan menimpa default jika ada.
//         return {
//             ...createDefaults(), 
//             ...userConfig
//         } as IslandConfig;
        
//     } catch (e) {
//         console.warn(`⚠️ Warning: Failed to extract config from ${path.basename(filePath)}. Using defaults.`);
//         return createDefaults();
//     }
// };

// export const scanIslands = (): IslandConfig[] => {
//     console.log("📡 Scanning for Islands with Strict Rules...");
    
//     // --- DEFINISI ATURAN SCANNING ---
    
//     // Rule A: components/**/*.tsx (Recursive)
//     const componentsFiles = getFilesStrict(path.join(MODULES_ROOT, "components"), true);
    
//     // Rule B: pages/**/*.tsx (Recursive)
//     const pagesFiles = getFilesStrict(path.join(MODULES_ROOT, "pages"), true);

//     const coreFiles = getFilesStrict(path.join(MODULES_ROOT, "core"), true);
    
//     // Rule C: ui/*.tsx (FLAT / DANGKAL)
//     // Subfolder seperti ui/shadcn/ akan dilewati
//     const uiFiles = getFilesStrict(path.join(MODULES_ROOT, "ui"), false);

//     // Gabungkan semua temuan
//     const allFiles = [...componentsFiles, ...pagesFiles, ...uiFiles, ...coreFiles];
    
//     console.log(`   found ${componentsFiles.length} components`);
//     console.log(`   found ${pagesFiles.length} pages`);
//     console.log(`   found ${uiFiles.length} top-level ui elements`);

//     // --- CONFIG EXTRACTION (Sama seperti sebelumnya) ---

//     const configs: IslandConfig[] = [];

//     allFiles.forEach((filePath) => {
//         const fileName = path.basename(filePath, ".tsx");
//         const userConfig = extractConfig(filePath);

//         // Jika user secara eksplisit set build: false, kita SKIP file ini.
//         // Defaultnya adalah true (jika undefined).
//         if (userConfig.build === false) {
//              console.log(`   ⏭️  Skipping ${fileName} (build: false)`);
//              return; 
//         }

//         // Logic Output Dir Otomatis
//         let outputDir = userConfig.outputDir;
//         if (!outputDir || outputDir.length === 0) {
//             const relativeDir = path.dirname(path.relative(MODULES_ROOT, filePath));
//             outputDir = ['layouts', 'partials', ...relativeDir.split(path.sep)].filter(p => p !== '.');
//         } else {
//             if (userConfig.outputDir[0] !== 'layouts') {
//                  outputDir = ['layouts', 'partials', ...userConfig.outputDir];
//             }
//         }

//         const relativeSource = path.relative(process.cwd(), filePath);
//         const sourceWithoutExt = relativeSource.replace(/\.tsx$/, '');
//         const moduleSource = sourceWithoutExt.split(path.sep);

//         configs.push({
//             name: userConfig.name || fileName,
//             moduleSource: moduleSource,
//             outputDir: outputDir,
//             mode: userConfig.mode,
//             createShortcode: userConfig.createShortcode,
//             build: userConfig.build
//         });
//     });

//     return configs;
// };

// export const generateClientManifest = (islands: IslandConfig[]) => {
//     const interactiveIslands = islands.filter(i => i.mode !== 'static');

//     const imports = interactiveIslands.map(island => {
//         // Ubah array path source menjadi string path import
//         // Contoh: ['islands','modules','pages','home'] -> '@/modules/pages/home'
//         // Kita asumsikan moduleSource selalu dimulai dengan islands/modules
//         // Kita perlu potong 2 elemen awal ('islands', 'modules')
//         const relativePath = island.moduleSource.slice(2).join('/');
//         return `    "${island.name}": () => import("@/modules/${relativePath}"),`;
//     }).join('\n');

//     const content = `// ⚠️ AUTO-GENERATED FILE. DO NOT EDIT.
// // This file is generated by islands/core/scanner.ts

// import { FunctionalComponent } from "preact";
// import { IslandProps } from "@/modules/types";

// type IslandModul = {
//     default: FunctionalComponent<IslandProps>;
// }

// export const COMPONENT_LOADERS: Record<string, () => Promise<IslandModul>> = {
// ${imports}
// };
// `;

//     const destPath = path.join(process.cwd(), "assets", "ts", "client-manifest.ts");
//     fs.writeFileSync(destPath, content);
//     console.log(`✨ Generated client manifest: ${destPath}`);
// };

