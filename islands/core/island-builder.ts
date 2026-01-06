import fs from "fs"; // File System: Untuk baca/tulis file
import path from "path"; // Path: Untuk atur lokasi folder
import { createRequire } from "module"; // Agar bisa pakai 'require' di ES Module
import { buildSync } from "esbuild"; // Compiler: Mengubah TSX jadi JS biasa

// IMPORT DEPENDENSI CORE
import * as Preact from "preact";
import * as PreactHooks from "preact/hooks";
import * as PreactCompat from "preact/compat";
import render from "preact-render-to-string";

const require = createRequire(import.meta.url);

export type IslandConfig = {
    name: string;
    outputDir: string[];
    moduleSource: string[];
    mode?: 'interactive' | 'static';
    createShortcode?: boolean;
}

// Helper toPascalCase, HUGO_PROPS_LOGIC, injectHugoProps
const toPascalCase = (str: string) => str.replace(/(^\w|-\w)/g, (text) => text.replace(/-/, "").toUpperCase());

// Update HUGO_PROPS_LOGIC agar lebih rapi (opsional, tapi disarankan)
const HUGO_PROPS_PARTIAL = "core/hugo-props.html";


const injectHugoProps = (html: string): string => {
    // Regex: Mencari Tag Pembuka (Opening Tag) pertama
    // <div class="..." id="...">
    const tagRegex = /<([a-z0-9-]+)((?:\s+[^\s/>="]+(?:=(?:(?:"[^"]*")|(?:'[^']*')|(?:[^>\s]+)))?)*)\s*>/i;
    
    return html.replace(tagRegex, (match, tagName, existingAttrs) => {
        // Kita tidak perlu lagi membersihkan class secara manual di sini.
        // Biarkan 'hugo-props.html' yang menangani logika class merging.
        // TAPI, kita harus hapus class="___" dari HTML statis Preact agar tidak duplikat dengan yang dicetak Hugo.
        
        let cleanAttrs = existingAttrs;
        
        // Cari atribut class bawaan Preact (jika ada) dan simpan nilainya untuk dipass ke partial (opsional)
        // Namun, karena hugo-props.html kita belum support menangkap class bawaan dari sini, 
        // lebih aman kita biarkan class static tetap ada, dan Hugo menambahkan class dinamis di sebelahnya.
        // Browser modern cukup pintar menggabungkan dua atribut class, tapi untuk amannya:
        
        // Cara Paling Aman: Selipkan partial tepat setelah nama tag.
        // Partial ini akan merender: class="user-class" data-props="..."
        
        // Hasil: <div {{ partial "..." . }} class="static-class">
        return `<${tagName} {{ partial "${HUGO_PROPS_PARTIAL}" . }} ${cleanAttrs}>`;
    });
};

export const buildIsland = (config: IslandConfig): void => {
    try {
        console.log(`🔨 Building Island (${config.mode || 'interactive'}): ${config.name}...`);

        const destDir = path.join(process.cwd(), ...config.outputDir);
        const destFile = path.join(destDir, `${config.name}.html`);
        const srcPath = path.join(process.cwd(), ...config.moduleSource) + '.tsx';

        if (!fs.existsSync(srcPath)) throw new Error(`Source not found: ${srcPath}`);
        if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

        if (config.mode === 'static') {
            const result = buildSync({
                entryPoints: [srcPath], // File TSX sumber
                write: false,           // Jangan tulis ke file, simpan di memori saja
                bundle: true,           // Gabungkan semua dependensi
                format: 'cjs',          // Format CommonJS (agar bisa dibaca Node.js)
                platform: 'node',
                external: ['preact', 'preact/hooks', 'preact/compat', 'react', 'react-dom', '@/modules/*'], // JANGAN ikutkan Preact dalam bundle (kita akan suntik manual)
                loader: { '.tsx': 'tsx', '.ts': 'ts' }
            });

            const code = result.outputFiles[0].text;
            const module = { exports: {} as any };
            const wrapper = new Function('module', 'exports', 'require', code);
            
            wrapper(module, module.exports, (pkg: string) => {
                // 1. SINGLETON INSTANCE: Return object yang sudah di-import di atas
                // Jangan gunakan require() baru di sini.
                if (pkg === 'preact') return Preact;
                if (pkg === 'preact/hooks') return PreactHooks;
                
                // 2. REACT ALIASING ke Singleton PreactCompat
                if (pkg === 'react' || pkg === 'react-dom' || pkg === 'preact/compat') {
                    return PreactCompat;
                }

                // 3. Handle @emotion/is-prop-valid
                // Ini sering dipanggil oleh Framer Motion / Styled Components
                if (pkg === '@emotion/is-prop-valid') {
                    try {
                        return require('@emotion/is-prop-valid');
                    } catch (e) {
                        // MOCK AMAN: Jika gagal require, kembalikan fungsi dummy yang selalu return true.
                        // Ini mencegah crash "isPropValid is not a function"
                        return { default: () => true }; 
                    }
                }
                
                // 4. Mock Utils
                if (pkg.includes('/lib/utils')) {
                    return { 
                        cn: (...inputs: any[]) => inputs.filter(Boolean).join(' '),
                        keysToCamel: (o: any) => o,
                        // Mock framer-motion utils jika diperlukan
                        motion: new Proxy({}, { get: () => 'div' }) 
                    }; 
                }
                
                // Fallback untuk library lain (seperti framer-motion)
                // Hati-hati: Framer motion mungkin butuh mock lebih kompleks jika digunakan di static render
                try {
                    return require(pkg);
                } catch (e) {
                    console.warn(`⚠️ Warning: Could not require '${pkg}' during static build. Mocking as empty object.`);
                    return {};
                }
            });

            // --- EXPORT DETECTION ---
            let Component = module.exports.default;
            if (!Component) {
                const pascalName = toPascalCase(config.name);
                Component = module.exports[pascalName] || module.exports[config.name];
            }
            if (!Component) {
                const keys = Object.keys(module.exports);
                if (keys.length > 0) Component = module.exports[keys[0]];
            }

            if (!Component) throw new Error(`Default export NOT found in ${config.name}.tsx`);

            const PLACEHOLDER = "___HUGO_INNER_CONTENT___";
            
            // Render menggunakan instance 'h' yang sama dengan yang dipakai komponen
            const htmlString = render(Preact.h(Component, { children: PLACEHOLDER }));

            // Kita ganti .InnerDeindent dengan Regex Replacement yang lebih kuat.
            // (?m)^[ \t]+ artinya: "Cari spasi/tab di awal baris (multiline) dan hapus".
            // Ini menjamin teks selalu rata kiri saat masuk ke parser Markdown.
            const HUGO_LOGIC = '\n\t{{ .Inner | replaceRE "(?m)^[ \\t]+" "" | markdownify }}\n';

            let finalHtml = htmlString.replace(PLACEHOLDER, HUGO_LOGIC);
            finalHtml = injectHugoProps(finalHtml);
            
            fs.writeFileSync(destFile, finalHtml);
            console.log(`✅ Static Component generated: ${destFile}`);

            // -AUTO GENERATE SHORTCODE WRAPPER ---
//             if (config.createShortcode) {
//                 // A. Tentukan lokasi folder Shortcodes
//                 // Kita asumsikan outputDir mengandung 'partials'. Kita ganti jadi 'shortcodes'.
//                 const shortcodeOutputDir = config.outputDir.map(d => d === 'partials' ? 'shortcodes' : d);
                
//                 // B. Tentukan Path Partial untuk dipanggil di dalam file shortcode
//                 // Contoh: layouts/partials/ui/card -> ui/card/card.html
//                 const partialIndex = config.outputDir.indexOf('partials');
//                 if (partialIndex !== -1) {
//                     // Ambil path setelah 'partials' (misal: ['ui', 'card'])
//                     const relativePath = config.outputDir.slice(partialIndex + 1);
//                     // Gabungkan menjadi string: "ui/card/card.html"
//                     const partialImportPath = [...relativePath, `${config.name}.html`].join('/');
                    
//                     // C. Buat Isi File Shortcode
//                     const shortcodeContent = `{{/* Auto-generated shortcode for ${config.name} */}}
// {{/* HACK: Trigger .Inner untuk validasi Hugo */}}
// {{ $inner := .Inner }}

// {{/* Panggil Partial hasil generate */}}
// {{ partial "${partialImportPath}" . }}`;

//                     // D. Simpan File
//                     const destShortcodeDir = path.join(process.cwd(), ...shortcodeOutputDir);
//                     if (!fs.existsSync(destShortcodeDir)) {
//                         fs.mkdirSync(destShortcodeDir, { recursive: true });
//                     }
//                     const destShortcodeFile = path.join(destShortcodeDir, `${config.name}.html`);
                    
//                     fs.writeFileSync(destShortcodeFile, shortcodeContent);
//                     console.log(`✨ Shortcode wrapper generated: ${destShortcodeFile}`);
//                 } else {
//                     console.warn(`⚠️ Cannot generate shortcode: 'partials' directory not found in outputDir path.`);
//                 }
//             }

        } else {
            // Interactive Logic (Sibling Structure & Page Params) ---
            // 1. Variabel ID Unik
            const idLogic = `{{ $uniqueID := now.UnixNano }}{{ $targetId := printf "island-%d" $uniqueID }}{{ $dataId := printf "data-%d" $uniqueID }}`;
            // 2. HTML Template (Sibling Structure)
            // Div Wadah dan Script Data dipisah agar aman dari .innerHTML = ''
            const template = `${idLogic}
<div id="{{ $targetId }}"></div>

<script id="{{ $dataId }}" type="application/json">
    {{/* Tambahkan .Page.Params ke dalam Dictionary */}}
    {{ dict "Params" .Site.Params "Page" .Page.Params "Menus" .Site.Menus.main "Data" .Site.Data | jsonify | safeJS }}
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
                const shortcodeContent = `{{/* Auto-generated shortcode for ${config.name} */}}
{{/* HACK: Trigger .Inner untuk validasi Hugo */}}
{{ $inner := .Inner }}

{{/* Panggil Partial hasil generate */}}
{{ partial "${partialImportPath}" . }}`;

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
}









// import fs from "fs"; // File System: Untuk baca/tulis file
// import path from "path"; // Path: Untuk atur lokasi folder
// import { createRequire } from "module"; // Agar bisa pakai 'require' di ES Module
// import { buildSync } from "esbuild"; // Compiler: Mengubah TSX jadi JS biasa

// // IMPORT DEPENDENSI CORE
// import * as Preact from "preact";
// import * as PreactHooks from "preact/hooks";
// import * as PreactCompat from "preact/compat";
// import render from "preact-render-to-string";

// const require = createRequire(import.meta.url);

// export type IslandConfig = {
//     name: string;
//     outputDir: string[];
//     moduleSource: string[];
//     mode?: 'interactive' | 'static';
//     createShortcode?: boolean;
// }

// // Helper toPascalCase, HUGO_PROPS_LOGIC, injectHugoProps
// const toPascalCase = (str: string) => str.replace(/(^\w|-\w)/g, (text) => text.replace(/-/, "").toUpperCase());

// // Update HUGO_PROPS_LOGIC agar lebih rapi (opsional, tapi disarankan)
// const HUGO_PROPS_LOGIC = `{{ $userClass := .Get "className" | default (.Get "class") }}
// {{ $otherAttributes := dict }}
// {{ range $k, $v := .Params }}
//     {{ if and (ne $k "className") (ne $k "class") }}
//         {{ $otherAttributes = merge $otherAttributes (dict $k $v) }}
//     {{ end }}
// {{ end }}`;

// const injectHugoProps = (html: string): string => {
//     // Regex ini membaca:
//     // 1. Tag Name ([a-z0-9-]+)
//     // 2. Kumpulan Atribut yang menghormati tanda kutip.
//     //    Ia tidak akan berhenti di '>' jika '>' ada di dalam "..." atau '...'
//     const tagRegex = /<([a-z0-9-]+)((?:\s+[^\s/>="]+(?:=(?:(?:"[^"]*")|(?:'[^']*')|(?:[^>\s]+)))?)*)\s*>/i;
    
//     return html.replace(tagRegex, (match, tagName, existingAttrs) => {
//         let tsxClass = "";
        
//         // Cari atribut class (class="..." atau class='...')
//         const classRegex = /class=(["'])([\s\S]*?)\1/;
//         const classMatch = existingAttrs.match(classRegex);

//         if (classMatch) {
//             tsxClass = classMatch[2];
//             // Hapus atribut class secara bersih
//             existingAttrs = existingAttrs.replace(classMatch[0], "");
//         }

//         // Sanitasi: Ubah quote ganda/tunggal menjadi HTML entity agar aman
//         tsxClass = tsxClass
//             .replace(/"/g, "&quot;") 
//             .replace(/'/g, "&#39;");

//         // Bersihkan spasi
//         existingAttrs = existingAttrs.replace(/\s+/g, " ").trim();

//         // Return satu baris HTML (compact)
//         return `
// ${HUGO_PROPS_LOGIC}
// <${tagName} ${existingAttrs} {{ range $k, $v := $otherAttributes }} {{ $k }}="{{ $v }}" {{ end }} class="${tsxClass} {{ $userClass }}">`.replace(/\n/g, "");
//     });
// };

// export const buildIsland = (config: IslandConfig): void => {
//     try {
//         console.log(`🔨 Building Island (${config.mode || 'interactive'}): ${config.name}...`);

//         const destDir = path.join(process.cwd(), ...config.outputDir);
//         const destFile = path.join(destDir, `${config.name}.html`);
//         const srcPath = path.join(process.cwd(), ...config.moduleSource) + '.tsx';

//         if (!fs.existsSync(srcPath)) throw new Error(`Source not found: ${srcPath}`);
//         if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

//         if (config.mode === 'static') {
//             const result = buildSync({
//                 entryPoints: [srcPath], // File TSX sumber
//                 write: false,           // Jangan tulis ke file, simpan di memori saja
//                 bundle: true,           // Gabungkan semua dependensi
//                 format: 'cjs',          // Format CommonJS (agar bisa dibaca Node.js)
//                 platform: 'node',
//                 external: ['preact', 'preact/hooks', 'preact/compat', 'react', 'react-dom', '@/modules/*'], // JANGAN ikutkan Preact dalam bundle (kita akan suntik manual)
//                 loader: { '.tsx': 'tsx', '.ts': 'ts' }
//             });

//             const code = result.outputFiles[0].text;
            
//             // --- CONTEXT FIX ---
//             const module = { exports: {} as any };
//             const wrapper = new Function('module', 'exports', 'require', code);
            
//             wrapper(module, module.exports, (pkg: string) => {
//                 // 1. SINGLETON INSTANCE: Return object yang sudah di-import di atas
//                 // Jangan gunakan require() baru di sini.
//                 if (pkg === 'preact') return Preact;
//                 if (pkg === 'preact/hooks') return PreactHooks;
                
//                 // 2. REACT ALIASING ke Singleton PreactCompat
//                 if (pkg === 'react' || pkg === 'react-dom' || pkg === 'preact/compat') {
//                     return PreactCompat;
//                 }

//                 // 3. Handle @emotion/is-prop-valid
//                 // Ini sering dipanggil oleh Framer Motion / Styled Components
//                 if (pkg === '@emotion/is-prop-valid') {
//                     try {
//                         return require('@emotion/is-prop-valid');
//                     } catch (e) {
//                         // MOCK AMAN: Jika gagal require, kembalikan fungsi dummy yang selalu return true.
//                         // Ini mencegah crash "isPropValid is not a function"
//                         return { default: () => true }; 
//                     }
//                 }
                
//                 // 4. Mock Utils
//                 if (pkg.includes('/lib/utils')) {
//                     return { 
//                         cn: (...inputs: any[]) => inputs.filter(Boolean).join(' '),
//                         keysToCamel: (o: any) => o,
//                         // Mock framer-motion utils jika diperlukan
//                         motion: new Proxy({}, { get: () => 'div' }) 
//                     }; 
//                 }
                
//                 // Fallback untuk library lain (seperti framer-motion)
//                 // Hati-hati: Framer motion mungkin butuh mock lebih kompleks jika digunakan di static render
//                 try {
//                     return require(pkg);
//                 } catch (e) {
//                     console.warn(`⚠️ Warning: Could not require '${pkg}' during static build. Mocking as empty object.`);
//                     return {};
//                 }
//             });

//             // --- EXPORT DETECTION ---
//             let Component = module.exports.default;
//             if (!Component) {
//                 const pascalName = toPascalCase(config.name);
//                 Component = module.exports[pascalName] || module.exports[config.name];
//             }
//             if (!Component) {
//                 const keys = Object.keys(module.exports);
//                 if (keys.length > 0) Component = module.exports[keys[0]];
//             }

//             if (!Component) throw new Error(`Default export NOT found in ${config.name}.tsx`);

//             const PLACEHOLDER = "___HUGO_INNER_CONTENT___";
            
//             // Render menggunakan instance 'h' yang sama dengan yang dipakai komponen
//             const htmlString = render(Preact.h(Component, { children: PLACEHOLDER }));

//             // Kita ganti .InnerDeindent dengan Regex Replacement yang lebih kuat.
//             // (?m)^[ \t]+ artinya: "Cari spasi/tab di awal baris (multiline) dan hapus".
//             // Ini menjamin teks selalu rata kiri saat masuk ke parser Markdown.
//             const HUGO_LOGIC = '\n\t{{ .Inner | replaceRE "(?m)^[ \\t]+" "" | markdownify }}\n';

//             let finalHtml = htmlString.replace(PLACEHOLDER, HUGO_LOGIC);
//             finalHtml = injectHugoProps(finalHtml);
            
//             fs.writeFileSync(destFile, finalHtml);
//             console.log(`✅ Static Component generated: ${destFile}`);

//             // -AUTO GENERATE SHORTCODE WRAPPER ---
//             if (config.createShortcode) {
//                 // A. Tentukan lokasi folder Shortcodes
//                 // Kita asumsikan outputDir mengandung 'partials'. Kita ganti jadi 'shortcodes'.
//                 const shortcodeOutputDir = config.outputDir.map(d => d === 'partials' ? 'shortcodes' : d);
                
//                 // B. Tentukan Path Partial untuk dipanggil di dalam file shortcode
//                 // Contoh: layouts/partials/ui/card -> ui/card/card.html
//                 const partialIndex = config.outputDir.indexOf('partials');
//                 if (partialIndex !== -1) {
//                     // Ambil path setelah 'partials' (misal: ['ui', 'card'])
//                     const relativePath = config.outputDir.slice(partialIndex + 1);
//                     // Gabungkan menjadi string: "ui/card/card.html"
//                     const partialImportPath = [...relativePath, `${config.name}.html`].join('/');
                    
//                     // C. Buat Isi File Shortcode
//                     const shortcodeContent = `{{/* Auto-generated shortcode for ${config.name} */}}
// {{/* HACK: Trigger .Inner untuk validasi Hugo */}}
// {{ $inner := .Inner }}

// {{/* Panggil Partial hasil generate */}}
// {{ partial "${partialImportPath}" . }}`;

//                     // D. Simpan File
//                     const destShortcodeDir = path.join(process.cwd(), ...shortcodeOutputDir);
//                     if (!fs.existsSync(destShortcodeDir)) {
//                         fs.mkdirSync(destShortcodeDir, { recursive: true });
//                     }
//                     const destShortcodeFile = path.join(destShortcodeDir, `${config.name}.html`);
                    
//                     fs.writeFileSync(destShortcodeFile, shortcodeContent);
//                     console.log(`✨ Shortcode wrapper generated: ${destShortcodeFile}`);
//                 } else {
//                     console.warn(`⚠️ Cannot generate shortcode: 'partials' directory not found in outputDir path.`);
//                 }
//             }

//         } else {
//             // ... Interactive Logic ...
//             const id = `{{ $id := delimit (slice "${config.name}" (now.UnixNano)) "-" }}`;
//             const template = `${id}
// <div id="{{ $id }}">
//     <script id="data-{{ $id }}" type="application/json">
//         {{ dict "Params" .Site.Params "Menus" .Site.Menus.main | jsonify | safeJS }}
//     </script>
//     <script>
//         window.requestIslands = window.requestIslands || [];
//         window.requestIslands.push({
//             component: "${config.name}",
//             targetId: "{{ $id }}",
//             dataId: "data-{{ $id }}"
//         });
//     </script>
// </div>`;
//             fs.writeFileSync(destFile, template);
//             console.log(`✅ Interactive Island wrapper deployed: ${destFile}`);
//         }
//     } catch (err) {
//         console.error(`❌ Error building island for ${config.name}:`, err);
//         process.exit(1);
//     }
// }













// import fs from "fs";
// import path from "path";

// export type IslandConfig = {
//     name: string;
//     outputDir: string[];
//     templateSource: string[];
// }

// export const buildIsland = (config: IslandConfig): void => {
//     try {
//         console.log(`🔨 Building Island: ${config.name}...`);

//         const destDir = path.join(process.cwd(), ...config.outputDir);
//         const destFile = path.join(destDir, `${config.name}.html`);

//         const srcTemplate = `${path.join(process.cwd(), ...config.templateSource)}.html`;

//         if (!fs.existsSync(srcTemplate)) {
//             throw new Error(`Template source not found: ${srcTemplate}`);
//         }

//         const template = fs.readFileSync(srcTemplate, 'utf-8');

//         if (!fs.existsSync(destDir)) {
//             fs.mkdirSync(destDir, { recursive: true });
//         }

//         fs.writeFileSync(destFile, template);

//         console.log(`✅ Island: ${config.name} deployed to Hugo partials at ${destFile}`);
        
//     } catch (err) {
//         console.error(`❌ Error building island for ${config.name}:`, err);
//         process.exit(1);
//     }
// }

