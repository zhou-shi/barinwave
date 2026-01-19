import fs from "fs";
import path from "path";
import { buildSync } from "esbuild";
import { IslandConfig } from "../types";

// KONFIGURASI PATH
export const MODULES_ROOT = path.join(process.cwd(), "islands", "modules");

// DEFAULT CONFIG ---
export const createDefaults = (): IslandConfig => ({
    mode: undefined,
    name: '',
    build: true,
    createShortcode: true,
    moduleSource: [],
    outputDir: []
});

// --- HELPER: UNIVERSAL PASCAL CASE ---
export const toPascalCase = (str: string) => {
    return str
        .replace(/[^a-zA-Z0-9]/g, '-') // Ganti karakter aneh jadi dash
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
};

// SCANNING ENGINE (STRICT FILE SCANNER)

/**
 * Scan directory dengan opsi Strict Mode (Recursive vs Flat)
 * @param dirPath Path direktori target
 * @param recursive Jika true, akan scan subfolder. Jika false, hanya root folder target.
 * @param arrayOfFiles Akumulator file (untuk rekursi)
 */
export const getFilesStrict = (dirPath: string, recursive: boolean, arrayOfFiles: string[] = []) => {
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

// --- CONFIG EXTRACTOR (Lightweight Build) ---
export const extractConfig = (filePath: string): IslandConfig => {
    try {
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

        // Proxy Trick untuk menghindari error TS/Runtime saat evaluasi
        const createProxy = (): any => new Proxy(() => {}, {
            get: () => createProxy(),
            apply: () => createProxy(),
            construct: () => createProxy()
        });
        
        const mockRequire = (id: string) => createProxy();

        const module = { exports: {} as any };
        const wrapper = new Function('module', 'exports', 'require', code);
        
        wrapper(module, module.exports, mockRequire); 

        const userConfig = module.exports.config || {};

        return {
            ...createDefaults(), 
            ...userConfig
        } as IslandConfig;
        
    } catch (e) {
        console.warn(`⚠️ Warning: Failed to extract config from ${path.basename(filePath)}. Using defaults.`);
        return createDefaults();
    }
};

// DATA GATHERER (Fungsi Utama) ---
// Mengembalikan daftar file mentah per kategori
export const getAllIslandFiles = () => {
    return {
        components: getFilesStrict(path.join(MODULES_ROOT, "components"), true),
        pages: getFilesStrict(path.join(MODULES_ROOT, "pages"), true),
        core: getFilesStrict(path.join(MODULES_ROOT, "core"), false),
        ui: getFilesStrict(path.join(MODULES_ROOT, "ui"), false),
        brainwave: getFilesStrict(path.join(MODULES_ROOT, "ui", "brainwave"), false), 
        shadcn: getFilesStrict(path.join(MODULES_ROOT, "ui", "shadcn"), false), 
        lightswind: getFilesStrict(path.join(MODULES_ROOT, "ui", "lightswind"), false), 
        spline: getFilesStrict(path.join(MODULES_ROOT, "ui", "spline"), false), 
    };
};