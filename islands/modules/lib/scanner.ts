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

// --- HELPER: AUTO DETECT EXPORTS ---
// Membaca file dan mencari semua bentuk export (Function, Const, Named)
export const getExportsFromFile = (filePath: string): string[] => {
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const exports: Set<string> = new Set();

        // 1. Match: export function X
        const funcMatches = content.matchAll(/export\s+function\s+([a-zA-Z0-9_]+)/g);
        for (const match of funcMatches) exports.add(match[1]);

        // 2. Match: export const X
        const constMatches = content.matchAll(/export\s+const\s+([a-zA-Z0-9_]+)/g);
        for (const match of constMatches) {
            if (match[1] !== 'config') exports.add(match[1]);
        }

        // 3. Match: export { X, Y }
        const braceMatch = content.match(/export\s+\{([\s\S]+?)\}/);
        if (braceMatch && braceMatch[1]) {
            braceMatch[1].split(',').forEach(item => {
                const name = item.trim().split(' as ')[0]; // Handle "X as Y" -> ambil X (atau Y sesuai kebutuhan, disini simplifikasi)
                if (name) exports.add(name);
            });
        }

        return Array.from(exports);
    } catch (e) {
        return [];
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