import fs from 'fs';
import path from 'path';
// Pastikan path import ini benar
import { toPascalCase, MODULES_ROOT, getFilesStrict, getAllIslandFiles } from '@/modules/lib/scanner';

const OUTPUT_FILE = path.resolve(process.cwd(), 'islands/modules/core/server-manifest.ts');

export async function scanServer() {
    console.log("📡 Generating Server Map (Lazy Resolution Mode)...");

    const imports: string[] = [];
    const expansionLines: string[] = [];
    const usedAliases = new Set<string>();
    const registeredKeys = new Set<string>();

    /**
     * Helper: Menambahkan entri
     */
    const addEntry = (filePath: string, aliasPrefix: string, rootDir: string, keyNamespace: string = "") => {
        const fileName = path.basename(filePath, '.tsx');
        if (fileName === 'index') return;

        // 1. Path Unik
        const relativeFromRoot = path.relative(rootDir, filePath);
        const pathSegments = relativeFromRoot.replace(/\.tsx$/, '').split(path.sep);
        const pascalSegments = pathSegments.map(seg => toPascalCase(seg));
        const uniquePascalName = pascalSegments.join('');
        
        // Import Alias: "UiSection", "CompHeaderBrainwave"
        const importAlias = `${aliasPrefix}${uniquePascalName}`;

        // Anti Duplikat Variable Import
        let finalAlias = importAlias;
        let counter = 1;
        while (usedAliases.has(finalAlias)) {
            finalAlias = `${importAlias}_${counter++}`;
        }
        usedAliases.add(finalAlias);

        // 2. Import Line
        let importPath = path.relative(path.dirname(OUTPUT_FILE), filePath);
        importPath = importPath.split(path.sep).join('/').replace(/\.tsx$/, '');
        imports.push(`import * as ${finalAlias} from "${importPath}";`);

        // 3. Map Entry
        // 🔥 PERUBAHAN UTAMA DI SINI 🔥
        
        // A. Expand Module (Named Exports untuk anak-anaknya)
        expansionLines.push(`    ...expandModule(${finalAlias}, "${keyNamespace}"),`);

        // B. Resolve Main Key (Lazy Resolution)
        // Kita TIDAK mengakses .default di sini. Kita kirim object module-nya saja.
        const mainKey = `${keyNamespace}${uniquePascalName}`;
        
        if (!registeredKeys.has(mainKey)) {
            // Kita panggil helper 'resolveComponent'
            // Parameter 1: Module Object
            // Parameter 2: Nama PascalCase yang diharapkan (misal "Section")
            expansionLines.push(`    "${mainKey}": resolveComponent(${finalAlias}, "${uniquePascalName}"),`);
            registeredKeys.add(mainKey);
        }
    };

    // =========================================================
    // SCANNER EXECUTION
    // =========================================================

    // 1. Brainwave UI
    const uiBrainwaveRoot = path.join(MODULES_ROOT, "ui", "brainwave");
    if (fs.existsSync(uiBrainwaveRoot)) {
        const files = getFilesStrict(uiBrainwaveRoot, false); 
        files.forEach(file => addEntry(file, "Ui", uiBrainwaveRoot, "Ui")); 
    }

    // 2. Lightswind UI
    const uiLightswindRoot = path.join(MODULES_ROOT, "ui", "lightswind");
    if (fs.existsSync(uiLightswindRoot)) {
        const files = getFilesStrict(uiLightswindRoot, false);
        files.forEach(file => addEntry(file, "Lw", uiLightswindRoot, "Lw"));
    }

    // 3. Shadcn UI
    const uiShadcnRoot = path.join(MODULES_ROOT, "ui", "shadcn");
    if (fs.existsSync(uiShadcnRoot)) {
        const files = getFilesStrict(uiShadcnRoot, false);
        files.forEach(file => addEntry(file, "Shadcn", uiShadcnRoot, "shadcn/"));
    }

    // 4. Components
    const componentsRoot = path.join(MODULES_ROOT, "components");
    const { components } = getAllIslandFiles(); 
    components.forEach(file => addEntry(file, "Comp", componentsRoot, "Comp"));


    // ---------------------------------------------------------
    // HELPER FUNCTIONS (INJECTED TO MANIFEST)
    // ---------------------------------------------------------
    const helperFunctions = `
/**
 * Helper 1: Membongkar export (kecuali default)
 */
const expandModule = (module: any, prefix: string) => {
    const result: Record<string, any> = {};
    Object.keys(module).forEach(key => {
        if (key === 'default') return;
        const Component = module[key];
        if (typeof Component === 'function' || typeof Component === 'object') {
            result[\`\${prefix}\${key}\`] = Component;
        }
    });
    return result;
};

/**
 * Helper 2: Mencari Komponen Utama secara Aman (Lazy)
 * Urutan Prioritas:
 * 1. Named Export yang sesuai nama file (misal: export const Section)
 * 2. Default Export
 * 3. Named Export pertama yang ditemukan (Fallback terakhir)
 */
const resolveComponent = (module: any, name: string) => {
    // Coba cari Named Export spesifik (misal: "Section")
    if (module[name]) return module[name];
    
    // Coba cari Default
    if (module.default) return module.default;
    
    // Fallback: Cari export apapun yang bukan default
    const keys = Object.keys(module).filter(k => k !== 'default');
    if (keys.length > 0) return module[keys[0]];

    return undefined;
};
`;

    const fileContent = `
// ----------------------------------------------------------------------
// AUTO-GENERATED FILE by islands/core/scan-server.ts
// ----------------------------------------------------------------------

import React from "preact/compat";

${imports.join('\n')}

${helperFunctions}

export const SERVER_COMPONENTS: Record<string, any> = {
${expansionLines.join('\n')}
};
`;

    fs.writeFileSync(OUTPUT_FILE, fileContent.trim());
    console.log(`✅ Server Map Generated: ${OUTPUT_FILE}`);
}

scanServer();