import fs from "fs"; // File System: Untuk baca/tulis file
import path from "path"; // Path: Untuk atur lokasi folder
import { createRequire } from "module"; // Agar bisa pakai 'require' di ES Module
import { BuildResult, buildSync } from "esbuild"; // Compiler: Mengubah TSX jadi JS biasa

// IMPORT CORE DEPENDENCIES
import * as Preact from "preact";
import * as PreactHooks from "preact/hooks";
import * as PreactCompat from "preact/compat";
import * as dotenv from "dotenv";
import render from "preact-render-to-string";
import { fileURLToPath } from "url";
import { IslandConfig } from "@/modules/types";

const require = createRequire(import.meta.url);

// --- 1. SETUP PATH & DEBUGGING ---

const __filename = fileURLToPath(import.meta.url);
let envConfig: Record<string, string> = {};

const __dirname = path.dirname(__filename);

console.log("--------- DEBUG ENV START ---------");
console.log(`📂 Current Dir (__dirname): ${__dirname}`);
console.log(`📂 Project Root (cwd):      ${process.cwd()}`);

// Target: themes/brainwave/islands/.env
// Karena builder ada di islands/core/, kita harus naik satu level (..)
const targetEnvPath = path.resolve(__dirname, "../.env");

console.log(`🎯 Target .env Path:        ${targetEnvPath}`);
console.log(`❓ File Exists?             ${fs.existsSync(targetEnvPath) ? "YES ✅" : "NO ❌"}`);


if (fs.existsSync(targetEnvPath)) {
    // Baca raw content untuk memastikan file tidak corrupt/permission error
    const rawContent = fs.readFileSync(targetEnvPath, 'utf-8');
    console.log(`📄 Raw Content Length:      ${rawContent.length} chars`);
    
    // Parse
    const result = dotenv.config({ path: targetEnvPath });
    envConfig = result.parsed || {};
    
    console.log(`🔑 Loaded Keys:             ${Object.keys(envConfig).join(", ")}`);
    
    // Validasi Spesifik
    if (envConfig.VITE_SUPABASE_URL) {
        console.log(`✅ VITE_SUPABASE_URL:       Found (Length: ${envConfig.VITE_SUPABASE_URL.length})`);
    } else {
        console.error(`❌ VITE_SUPABASE_URL:       MISSING/EMPTY`);
    }
} else {
    console.error("❌ CRITICAL: .env file not found at the calculated path!");
}
console.log("--------- DEBUG ENV END ---------");


// --- 2. DEFINE CONFIGURATION ---

// Kita buat strategi define yang lebih aman:
// 1. Inject per-key (Paling prioritas)
const define: Record<string, string> = {};
Object.keys(envConfig).forEach((key) => {
    define[`import.meta.env.${key}`] = JSON.stringify(envConfig[key]);
});

// 2. Inject fallback object (agar import.meta.env tidak undefined)
define['import.meta.env'] = JSON.stringify(envConfig);


// --- 2. ADVANCED MOCKING STRATEGY ---

/**
 * Universal Mock (Black Hole Pattern)
 * Objek ini akan "menelan" properti apapun yang diakses tanpa error.
 * Berguna untuk library UI berat (Framer Motion, GSAP) yang crash di Node.js.
 */
const createUniversalMock = () => {
    const handler: ProxyHandler<any> = {
        get: (target, prop) => {
            // Jika mengakses 'default', kembalikan fungsi kosong
            if (prop === 'default') return () => null;
            // Jika mengakses properti komponen (misal: motion.div), kembalikan null component
            if (typeof prop === 'string' && /^[A-Z]/.test(prop)) return () => null;
            // Rekursif: Apapun yang diambil, kembalikan Proxy lagi
            return new Proxy(() => null, handler);
        },
        apply: () => null // Jika dipanggil sebagai fungsi
    };
    return new Proxy({}, handler);
};

/**
 * getMock: Centralized Dependency Injection
 * Menentukan apa yang dikembalikan saat komponen memanggil require('...')
 */
const getMock = (pkg: string): any => {
    // Core Framework Aliasing
    if (pkg === 'preact') return Preact;
    if (pkg === 'preact/hooks') return PreactHooks;
    // React Compatibility Layer
    if (pkg === 'react' || pkg === 'react-dom' || pkg === 'preact/compat') {
        return {
            ...PreactCompat,
            // Override lazy: Kembalikan komponen dummy sinkron, bukan Promise
            lazy: (_fn: any) => () => null, 
            // Override Suspense: Langsung render children (atau null), jangan tunggu promise
            Suspense: ({ children, fallback }: any) => fallback || children || null,
        }
    }
    // Spline butuh WebGL & Async loader, kita matikan di server side.
    if (pkg === '@splinetool/react-spline' || pkg === '@splinetool/runtime') {
        return { default: () => null }; // Return komponen kosong
    }

    try {
        return require(pkg);
    } catch (e) {
        // Jika gagal require (misal module browser-only), gunakan Universal Mock
        // console.warn(`⚠️ Mocking external module: ${pkg}`); // Uncomment untuk debug
        return createUniversalMock();
    }
};

// --- 3. COMPONENT LOADER (THE ENGINE) ---

/**
 * Membaca Source TSX -> Compile -> Execute di Virtual Environment -> Return Component
 */
const loadComponentFromSource = (srcPath: string): any => {
    // 1. Compile dengan esbuild
    const result: BuildResult = buildSync({
        entryPoints: [srcPath],
        write: false,           
        bundle: true,           
        format: 'cjs',          
        platform: 'node',
        define: define,         // Inject env variables
        // Externalize semua library agar kita bisa handle via getMock
        external: ['preact', 'preact/hooks', 'preact/compat', 'react', 'react-dom'], 
        // PAKSA ALIAS DI LEVEL BUILD (Solusi Error Radix UI / Hooks __H)
        alias: {
            'react': 'preact/compat',
            'react-dom': 'preact/compat',
            'react/jsx-runtime': 'preact/jsx-runtime'
        },
        jsx: 'automatic',
        jsxImportSource: 'preact',
        loader: { '.tsx': 'tsx', '.ts': 'ts' }
    });

    // 2. Defensive Check (Anti-Crash)
    if (!result.outputFiles || result.outputFiles.length === 0) {
        throw new Error(`❌ Esbuild failed: No output files generated for ${srcPath}`);
    }

    const code = result.outputFiles[0].text;
    
    // 3. Virtual Machine Environment
    const module = { exports: {} as any };
    // Kita menyuntikkan 'getMock' kita sebagai pengganti 'require' asli
    const wrapper = new Function('module', 'exports', 'require', code);
    
    wrapper(module, module.exports, getMock);

    // 4. Export Detection Logic
    let Component = module.exports.default;
    if (!Component) {
        // Fallback: Try PascalCase name or first export
        const pascalName = toPascalCase(path.basename(srcPath, '.tsx'));
        Component = module.exports[pascalName];
        if (!Component) {
            const keys = Object.keys(module.exports);
            if (keys.length > 0) Component = module.exports[keys[0]];
        }
    }

    if (!Component) throw new Error(`Default export NOT found in ${srcPath}`);

    return Component;
}

// --- 4. HUGO HELPERS ---

const toPascalCase = (str: string) => str.replace(/(^\w|-\w)/g, (text) => text.replace(/-/, "").toUpperCase());

const HUGO_PROPS_PARTIAL = "core/hugo-props.html";

const injectHugoProps = (html: string): string => {
    // Regex: Mencari Tag Pembuka (Opening Tag) pertama
    // <div class="..." id="...">
    const tagRegex = /<([a-z0-9-]+)((?:\s+[^\s/>="]+(?:=(?:(?:"[^"]*")|(?:'[^']*')|(?:[^>\s]+)))?)*)\s*>/i;
    
    return html.replace(tagRegex, (match, tagName, existingAttrs) => {
        // Kita tidak perlu lagi membersihkan class secara manual di sini.
        // Biarkan 'hugo-props.html' yang menangani logika class merging.
        // TAPI, kita harus hapus class="___" dari HTML statis Preact agar tidak duplikat dengan yang dicetak Hugo.

        // Cari atribut class bawaan Preact (jika ada) dan simpan nilainya untuk dipass ke partial (opsional)
        // Namun, karena hugo-props.html kita belum support menangkap class bawaan dari sini, 
        // lebih aman kita biarkan class static tetap ada, dan Hugo menambahkan class dinamis di sebelahnya.
        // Browser modern cukup pintar menggabungkan dua atribut class, tapi untuk amannya:
        
        // Cara Paling Aman: Selipkan partial tepat setelah nama tag.
        // Partial ini akan merender: class="user-class" data-props="..."
        
        // Hasil: <div {{ partial "..." . }} class="static-class">
        return `<${tagName} {{ partial "${HUGO_PROPS_PARTIAL}" . }} ${existingAttrs}>`;
    });
};

// =========================================================
// 🔥 FITUR BARU: SMART CLEANUP (GRANULAR) 🔥
// =========================================================

/**
 * Membersihkan folder output dengan presisi tinggi.
 * Bisa melindungi folder utuh ATAU file spesifik di dalam folder.
 */
export const cleanGeneratedDirs = () => {
    const rootDir = process.cwd();
    const partialsDir = path.join(rootDir, 'layouts', 'partials');
    const shortcodesDir = path.join(rootDir, 'layouts', 'shortcodes');

    // --- ⚙️ KONFIGURASI PROTEKSI ---
    const PROTECT_CONFIG = {
        IGNORE_DIRS: ['_default', 'structure'],
        KEEP_FILES: ['core/hugo-props.html']
    };

    console.log("🧹 Cleaning up generated artifacts (Smart Mode)...");

    // Helper: Normalisasi Path (agar Windows/Mac/Linux konsisten pakai '/')
    const toPathStr = (p: string) => p.split(path.sep).join('/');

    // Fungsi Hapus Rekursif
    const recursiveClean = (currentDir: string, relativePath = '') => {
        if (!fs.existsSync(currentDir)) return;

        const entries = fs.readdirSync(currentDir);

        entries.forEach(entry => {
            const fullEntryPath = path.join(currentDir, entry);
            const entryRelativePath = relativePath ? path.join(relativePath, entry) : entry;
            const normalizedRelative = toPathStr(entryRelativePath);

            // 1. CEK FOLDER PROTECTED
            // Jika folder ini ada di daftar IGNORE_DIRS, skip total.
            if (PROTECT_CONFIG.IGNORE_DIRS.includes(entry)) {
                // console.log(`   🛡️  Skipping Folder: ${normalizedRelative}`);
                return;
            }

            const stat = fs.statSync(fullEntryPath);

            if (stat.isDirectory()) {
                // --- JIKA FOLDER ---
                // Masuk ke dalam (Recurse)
                recursiveClean(fullEntryPath, entryRelativePath);

                // Setelah bersih-bersih di dalam, cek apakah folder jadi kosong?
                // Jika kosong, hapus foldernya sekalian.
                if (fs.readdirSync(fullEntryPath).length === 0) {
                    fs.rmdirSync(fullEntryPath);
                    // console.log(`   🗑️  Empty Folder Removed: ${normalizedRelative}`);
                }

            } else {
                // --- JIKA FILE ---
                // Cek apakah file ini ada di daftar KEEP_FILES?
                if (PROTECT_CONFIG.KEEP_FILES.includes(normalizedRelative)) {
                    // console.log(`   🛡️  Preserved File: ${normalizedRelative}`);
                    return;
                }

                // Jika tidak dilindungi, HAPUS.
                try {
                    fs.unlinkSync(fullEntryPath);
                    // console.log(`   🗑️  Deleted File: ${normalizedRelative}`);
                } catch (e) {
                    console.warn(`   ⚠️ Failed to delete ${normalizedRelative}`);
                }
            }
        });
    };

    // 1. Eksekusi di Partials
    console.log("   📍 Scanning Partials...");
    recursiveClean(partialsDir);

    // 2. Eksekusi di Shortcodes (Opsional)
    console.log("   📍 Scanning Shortcodes...");
    recursiveClean(shortcodesDir);
    
    console.log("✨ Workspace cleaned. Ready to build.");
};

// --- 6. MAIN BUILDER FUNCTION ---

export const buildIsland = (config: IslandConfig): void => {
    try {
        // EARLY EXIT: Cek Validitas Mode
        // Jika mode undefined, null, atau kosong -> Skip Build
        if (!config.mode) {
            console.log(`⏭️  Skipping ${config.name}: No mode defined (config.mode is undefined).`);
            return; // Berhenti di sini, tidak ada file yang ditulis.
        }

        // Validasi Mode String
        // Hanya izinkan 'static' atau 'interactive'
        if (config.mode !== 'static' && config.mode !== 'interactive') {
            console.warn(`⚠️  Skipping ${config.name}: Unknown mode '${config.mode}'. Supported: 'static' | 'interactive'.`);
            return;
        }

        console.log(`🔨 Building Island (${config.mode || 'interactive'}): ${config.name}...`);

        const destDir = path.join(process.cwd(), ...config.outputDir);
        const destFile = path.join(destDir, `${config.name}.html`);
        const srcPath = path.join(process.cwd(), ...config.moduleSource) + '.tsx';

        if (!fs.existsSync(srcPath)) throw new Error(`Source not found: ${srcPath}`);
        if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

        // A. LOAD COMPONENT (Satu kali untuk semua mode)
        const Component = loadComponentFromSource(srcPath);

        if (config.mode === 'static') {
            // --- MODE STATIC ---
            const PLACEHOLDER = "___HUGO_INNER_CONTENT___";

            // Render Component
            const htmlString = render(Preact.h(Component, { children: PLACEHOLDER }));

            // Hugo Logic Injection
            // (?m)^[ \t]+ artinya: "Cari spasi/tab di awal baris (multiline) dan hapus".
            // Ini menjamin teks selalu rata kiri saat masuk ke parser Markdown.
            const HUGO_LOGIC = '\n\t{{ .Inner | replaceRE "(?m)^[ \\t]+" "" | markdownify }}\n';
            let finalHtml = htmlString.replace(PLACEHOLDER, HUGO_LOGIC);

            // Inject Props Partial
            finalHtml = injectHugoProps(finalHtml);
            
            fs.writeFileSync(destFile, finalHtml);
            console.log(`✅ Static Component generated: ${destFile}`);

        } else if (config.mode === 'interactive') {
            // --- MODE INTERACTIVE (ISOMORPHIC) ---
            
            // 1. Generate ID
            const idLogic = `{{ $uniqueID := now.UnixNano }}{{ $targetId := printf "island-%d" $uniqueID }}{{ $dataId := printf "data-%d" $uniqueID }}`;

            // [BARU] 2. Siapkan Environment Variables untuk Browser
            // Kita hanya memilih variabel PUBLIC (VITE_*) agar aman.
            const publicEnv = {
                VITE_SUPABASE_URL: envConfig.VITE_SUPABASE_URL,
                VITE_SUPABASE_ANON_KEY: envConfig.VITE_SUPABASE_ANON_KEY
            };

            // [BARU] 3. Inject Script Global
            // Script ini akan berjalan di browser sebelum React/Preact mulai (Hydration)
            const envInjection = `
<script>
    window.__BRAINWAVE_ENV__ = window.__BRAINWAVE_ENV__ || {};
    Object.assign(window.__BRAINWAVE_ENV__, ${JSON.stringify(publicEnv)});
</script>`;

            // 4. PRE-RENDER (Solusi CLS)
            // Render komponen ke string HTML awal agar tidak kosong saat load
            let initialHtml = "";
            try {
                // Pass prop 'isBuildTime' agar komponen tau ini server-side
                // Siapkan Mock Props Lengkap
                const mockProps = {
                    isBuildTime: true, // Flag khusus
                    Menus: [],         // Agar map() tidak error
                    Params: {},        // Agar akses properti tidak error
                    Page: {},
                    Data: {}
                };
                initialHtml = render(Preact.h(Component, mockProps));
            } catch (e) {
                console.error(`❌ PRE-RENDER ERROR [${config.name}]:`);
                console.error(e instanceof Error ? e.message : e);

                console.warn(`⚠️ Warning: Failed to pre-render interactive component ${config.name}. Rendering empty div.`);
                // Jika error, fallback ke string kosong (aman)
                initialHtml = ""; 
            }

            // 5. Template dengan Konten Awal
            // Perhatikan: ${initialHtml} berada DI DALAM div target
            const template = `${envInjection}
${idLogic}
<div id="{{ $targetId }}">${initialHtml}</div>

<script id="{{ $dataId }}" type="application/json">
    {{/* --- INISIALISASI VARIABEL DEFAULT (Asumsi: Halaman Hugo Biasa) --- */}}
    {{ $finalData := .Site.Data }}
    {{ $finalParams := .Site.Params }}
    {{ $finalMenus := .Site.Menus.main }}
    {{ $pageCtx := . }} {{/* Default context adalah dot saat ini */}}

    {{/* --- LOGIKA PENCABANGAN (MAP vs STRUCT) --- */}}
    {{ if reflect.IsMap . }}
        {{/* === JALUR 1: ASSEMBLER (Input berupa Map/Dict) === */}}
        
        {{/* 1. Ambil Data Spesifik dari Props */}}
        {{ $finalData = .Data | default .Site.Data }}
        
        {{/* 2. Ambil Params Spesifik (Merge dengan Global jika perlu) */}}
        {{ if .Params }}
            {{ $finalParams = merge $finalParams .Params }}
        {{ end }}

        {{/* 3. Ambil Page Context Asli yang diselipkan di key 'ctx' */}}
        {{/* PENTING: Gunakan fungsi 'index' agar aman mengambil key dari Map */}}
        {{ $extractedCtx := index . "ctx" }}
        {{ if $extractedCtx }}
            {{ $pageCtx = $extractedCtx }}
        {{ end }}

    {{ else }}
        {{/* === JALUR 2: STANDARD PAGE / SHORTCODE (Input berupa Page Object/Struct) === */}}
        
        {{/* 1. Ambil Params Lokal Page */}}
        {{ if .Params }}
            {{ $finalParams = merge $finalParams .Params }}
        {{ end }}

        {{/* 2. Cek apakah ini Shortcode (.Page merujuk ke parent page) */}}
        {{ if .Page }}
            {{ $pageCtx = .Page }}
        {{ end }}
        
        {{/* 3. Halaman List kadang punya .Data yang berbahaya, jadi kita tetap pakai .Site.Data (default diatas) */}}
    {{ end }}


    {{/* --- EKSTRAKSI PAGE META --- */}}
    {{/* Sekarang $pageCtx dijamin berisi Objek Page yang valid (baik dari Assembler maupun Page biasa) */}}
    {{ $pageMeta := dict "Title" ($pageCtx.Title | default "") "Permalink" ($pageCtx.Permalink | default "") "IsHome" ($pageCtx.IsHome | default false) }}


    {{/* --- RENDER FINAL JSON --- */}}
    {{ dict "Params" $finalParams "Menus" $finalMenus "Data" $finalData "Page" $pageMeta | jsonify | safeJS }}
</script>

<script>
    (function() {
        window.requestIslands = window.requestIslands || [];
        window.requestIslands.push({
            component: "${config.name}",
            targetId: "{{ $targetId }}",
            dataId: "{{ $dataId }}"
        });
    })();
</script>`;
            fs.writeFileSync(destFile, template);
            console.log(`✅ Interactive Island wrapper deployed: ${destFile}`);
        }

        // --- SHORTCODE GENERATOR (Opsional) ---
        if (config.createShortcode) {
            // A. Tentukan lokasi folder Shortcodes
            // Kita asumsikan outputDir mengandung 'partials'. Kita ganti jadi 'shortcodes'.
            const shortcodeOutputDir = config.outputDir.map(d => d === 'partials' ? 'shortcodes' : d);
            
            // B. Tentukan Path Partial untuk dipanggil di dalam file shortcode
            // Contoh: layouts/partials/ui/card -> ui/card/card.html
            const partialIndex = config.outputDir.indexOf('partials');
            if (partialIndex !== -1) {
                // Ambil path setelah 'partials' (misal: ['ui', 'card'])
                const relativePath = config.outputDir.slice(partialIndex + 1);
                // Gabungkan menjadi string: "ui/card/card.html"
                const partialImportPath = [...relativePath, `${config.name}.html`].join('/');
                
                // C. Buat Isi File Shortcode
                const shortcodeContent = `{{/* Auto-generated for ${config.name} */}}\n{{ $inner := .Inner }}\n{{ partial "${partialImportPath}" . }}`;

                // D. Simpan File
                const destShortcodeDir = path.join(process.cwd(), ...shortcodeOutputDir);
                if (!fs.existsSync(destShortcodeDir)) {
                    fs.mkdirSync(destShortcodeDir, { recursive: true });
                }

                const destShortcodeFile = path.join(destShortcodeDir, `${config.name}.html`);
            
                fs.writeFileSync(destShortcodeFile, shortcodeContent);
                console.log(`✨ Shortcode wrapper generated: ${destShortcodeFile}`);
            } else {
                console.warn(`⚠️ Cannot generate shortcode: 'partials' directory not found in outputDir path.`);
            }
        }
    } catch (err) {
        console.error(`❌ Error building island for ${config.name}:`, err);
        process.exit(1);
    }
};