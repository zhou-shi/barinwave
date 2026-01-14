import fs from "fs";
import path from "path";
import { buildSync } from "esbuild";
import { IslandConfig, IslandModuleConfig } from "./island-builder";


// DEFAULT CONFIG
// Tips: Gunakan function agar setiap pemanggilan menghasilkan object baru (Fresh Reference)
// Ini mencegah mutasi array outputDir terbawa ke komponen lain.
const createDefaults = (): IslandConfig => ({
    mode: undefined, // Biarkan undefined agar logic parent bisa menentukan default fallback
    name: '',
    build: true,     // Default biasanya true agar terproses
    createShortcode: true,
    moduleSource: [],
    outputDir: []
});

// Root directory modul Anda
const MODULES_ROOT = path.join(process.cwd(), "islands", "modules");

// SCANNING ENGINE (STRICT MODE)

/**
 * Scan directory dengan opsi Strict Mode (Recursive vs Flat)
 * @param dirPath Path direktori target
 * @param recursive Jika true, akan scan subfolder. Jika false, hanya root folder target.
 * @param arrayOfFiles Akumulator file (untuk rekursi)
 */
const getFilesStrict = (dirPath: string, recursive: boolean, arrayOfFiles: string[] = []) => {
    // Safety check: Jika folder tidak ada, kembalikan array kosong (jangan crash)
    if (!fs.existsSync(dirPath)) return arrayOfFiles;

    const files = fs.readdirSync(dirPath);

    files.forEach((file) => {
        const fullPath = path.join(dirPath, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            // ATURAN KETAT: Hanya masuk subfolder jika mode recursive aktif
            if (recursive) {
                getFilesStrict(fullPath, recursive, arrayOfFiles);
            }
            // Jika flat (misal folder 'ui'), subfolder 'shadcn' akan DIABAIKAN.
        } else {
            // Hanya ambil file .tsx (bukan .d.ts)
            if (file.endsWith(".tsx") && !file.endsWith(".d.ts")) {
                arrayOfFiles.push(fullPath);
            }
        }
    });

    return arrayOfFiles;
};

// Helper: Intip Config dari File (Lightweight Build)
const extractConfig = (filePath: string): IslandConfig => {
    try {
        // LIGHTWEIGHT BUILD
        // Kita hanya ekstrak config, jadi 'external: ["*"]' sangat tepat agar cepat
        const result = buildSync({
            entryPoints: [filePath],
            write: false,
            bundle: true,
            format: 'cjs',
            platform: 'node',
            external: ['*'], 
            loader: { '.tsx': 'tsx', '.ts': 'ts' }
        });

        const code = result.outputFiles[0].text;

        // UNIVERSAL PROXY (Fix TS7023)
        // --- FIX TS7023: Explicit Return Type 'any' ---
        // Proxy ini HARUS bertipe 'any' karena ia berpura-pura menjadi
        // segala hal (string, function, object, array) untuk menipu library.
        // Proxy ini "menelan" semua akses properti/fungsi agar tidak crash saat mockRequire
        const createProxy = (): any => new Proxy(() => {}, {
            get: () => createProxy(),       // Rekursif aman karena tipe eksplisit
            apply: () => createProxy(),     // Aman
            construct: () => createProxy()  // Aman
        });
        
        const mockRequire = (id: string) => {
            return createProxy();
        };

        // VIRTUAL EXECUTION
        const module = { exports: {} as any };
        const wrapper = new Function('module', 'exports', 'require', code);
        
        wrapper(module, module.exports, mockRequire); 

        // MERGING STRATEGY (CRITICAL FIX)
        const userConfig = module.exports.config || {};

        // Gabungkan: Default <-- User Config
        // Properti user akan menimpa default jika ada.
        return {
            ...createDefaults(), 
            ...userConfig
        } as IslandConfig;
        
    } catch (e) {
        console.warn(`⚠️ Warning: Failed to extract config from ${path.basename(filePath)}. Using defaults.`);
        return createDefaults();
    }
};

export const scanIslands = (): IslandConfig[] => {
    console.log("📡 Scanning for Islands with Strict Rules...");
    
    // --- DEFINISI ATURAN SCANNING ---
    
    // Rule A: components/**/*.tsx (Recursive)
    const componentsFiles = getFilesStrict(path.join(MODULES_ROOT, "components"), true);
    
    // Rule B: pages/**/*.tsx (Recursive)
    const pagesFiles = getFilesStrict(path.join(MODULES_ROOT, "pages"), true);

    const coreFiles = getFilesStrict(path.join(MODULES_ROOT, "core"), true);
    
    // Rule C: ui/*.tsx (FLAT / DANGKAL)
    // Subfolder seperti ui/shadcn/ akan dilewati
    const uiFiles = getFilesStrict(path.join(MODULES_ROOT, "ui"), false);

    // Gabungkan semua temuan
    const allFiles = [...componentsFiles, ...pagesFiles, ...uiFiles, ...coreFiles];
    
    console.log(`   found ${componentsFiles.length} components`);
    console.log(`   found ${pagesFiles.length} pages`);
    console.log(`   found ${uiFiles.length} top-level ui elements`);

    // --- CONFIG EXTRACTION (Sama seperti sebelumnya) ---

    const configs: IslandConfig[] = [];

    allFiles.forEach((filePath) => {
        const fileName = path.basename(filePath, ".tsx");
        const userConfig = extractConfig(filePath);

        // Jika user secara eksplisit set build: false, kita SKIP file ini.
        // Defaultnya adalah true (jika undefined).
        if (userConfig.build === false) {
             console.log(`   ⏭️  Skipping ${fileName} (build: false)`);
             return; 
        }

        // Logic Output Dir Otomatis
        let outputDir = userConfig.outputDir;
        if (!outputDir || outputDir.length === 0) {
            const relativeDir = path.dirname(path.relative(MODULES_ROOT, filePath));
            outputDir = ['layouts', 'partials', ...relativeDir.split(path.sep)].filter(p => p !== '.');
        } else {
            if (userConfig.outputDir[0] !== 'layouts') {
                 outputDir = ['layouts', 'partials', ...userConfig.outputDir];
            }
        }

        const relativeSource = path.relative(process.cwd(), filePath);
        const sourceWithoutExt = relativeSource.replace(/\.tsx$/, '');
        const moduleSource = sourceWithoutExt.split(path.sep);

        configs.push({
            name: userConfig.name || fileName,
            moduleSource: moduleSource,
            outputDir: outputDir,
            mode: userConfig.mode,
            createShortcode: userConfig.createShortcode,
            build: userConfig.build
        });
    });

    return configs;
};

export const generateClientManifest = (islands: IslandConfig[]) => {
    const interactiveIslands = islands.filter(i => i.mode !== 'static');

    const imports = interactiveIslands.map(island => {
        // Ubah array path source menjadi string path import
        // Contoh: ['islands','modules','pages','home'] -> '@/modules/pages/home'
        // Kita asumsikan moduleSource selalu dimulai dengan islands/modules
        // Kita perlu potong 2 elemen awal ('islands', 'modules')
        const relativePath = island.moduleSource.slice(2).join('/');
        return `    "${island.name}": () => import("@/modules/${relativePath}"),`;
    }).join('\n');

    const content = `// ⚠️ AUTO-GENERATED FILE. DO NOT EDIT.
// This file is generated by islands/core/scanner.ts

import { FunctionalComponent } from "preact";
import { IslandProps } from "@/modules/types";

type IslandModul = {
    default: FunctionalComponent<IslandProps>;
}

export const COMPONENT_LOADERS: Record<string, () => Promise<IslandModul>> = {
${imports}
};
`;

    const destPath = path.join(process.cwd(), "assets", "ts", "client-manifest.ts");
    fs.writeFileSync(destPath, content);
    console.log(`✨ Generated client manifest: ${destPath}`);
};