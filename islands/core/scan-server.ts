import fs from 'fs';
import path from 'path';
import { toPascalCase, MODULES_ROOT, getFilesStrict, getAllIslandFiles, getExportsFromFile } from '@/modules/lib/scanner';

const OUTPUT_FILE = path.resolve(process.cwd(), 'islands/modules/core/server-manifest.ts');

export async function scanServer() {
    console.log("📡 Generating Server Map (Universal Namespace Mode)...");

    const imports: string[] = [];
    const mapEntries: string[] = [];
    const usedAliases = new Set<string>();
    const registeredKeys = new Set<string>();

    /**
     * Helper: Menambahkan entri
     */
    const addEntry = (filePath: string, rootDir: string, keyNamespace: string = "") => {
        const fileName = path.basename(filePath, '.tsx');
        if (fileName === 'index') return;

        // 1. Buat Alias Unik untuk Import Static
        // Contoh path: islands/modules/ui/shadcn/accordion.tsx
        const relativeFromRoot = path.relative(MODULES_ROOT, filePath); // ui/shadcn/accordion.tsx
        const cleanRelPath = relativeFromRoot.replace(/\.tsx$/, '').replace(/[^a-zA-Z0-9]/g, '_'); 
        // Hasil Alias: Ui_Shadcn_Accordion
        
        let importAlias = toPascalCase(cleanRelPath);
        
        // Anti Duplikat Variable Import
        let finalAlias = importAlias;
        let counter = 1;
        while (usedAliases.has(finalAlias)) {
            finalAlias = `${importAlias}_${counter++}`;
        }
        usedAliases.add(finalAlias);

        // 2. Generate Import Line
        // import * as Ui_Shadcn_Accordion from "../../../modules/ui/shadcn/accordion";
        let importPath = path.relative(path.dirname(OUTPUT_FILE), filePath);
        importPath = importPath.split(path.sep).join('/').replace(/\.tsx$/, '');

        // 🔥 FIX KRUSIAL: Tambahkan ./ jika file berada di folder yang sama (Sibling)
        if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
            importPath = `./${importPath}`;
        }

        imports.push(`import * as ${finalAlias} from "${importPath}";`);

        // 3. Generate Map Entries (Logic Namespace)
        if (keyNamespace.endsWith('/')) {
            // A. Auto-Discovery Named Exports
            const detectedExports = getExportsFromFile(filePath);
            
            if (detectedExports.length > 0) {
                detectedExports.forEach(exportName => {
                    const kebabName = exportName.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
                    const subKey = `${keyNamespace}${kebabName}`;

                    if (!registeredKeys.has(subKey)) {
                        // MAPPING LANGSUNG KE EXPORT NAME
                        // "shadcn/accordion-item": Ui_Shadcn_Accordion.AccordionItem
                        mapEntries.push(`    "${subKey}": ${finalAlias}.${exportName},`);
                        registeredKeys.add(subKey);
                    }
                });
            }

            // B. Default Fallback
            // "shadcn/accordion": Ui_Shadcn_Accordion.default || Ui_Shadcn_Accordion.Accordion
            const cleanPath = path.relative(rootDir, filePath).replace(/\.tsx$/, '');
            const kebabPath = cleanPath.split(path.sep).map(seg => 
                seg.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
            ).join('/');
            
            const baseKey = `${keyNamespace}${kebabPath}`;

            if (!registeredKeys.has(baseKey)) {
                // Gunakan helper resolveDefault di output nanti
                mapEntries.push(`    "${baseKey}": resolveDefault(${finalAlias}, "${path.basename(filePath, '.tsx')}"),`);
                registeredKeys.add(baseKey);
            }

        } else {
            // Legacy Mode (Jika ada yang tidak pakai namespace)
            const pascalName = toPascalCase(path.basename(filePath, '.tsx'));
            const legacyKey = `${keyNamespace}${pascalName}`;
            
            if (!registeredKeys.has(legacyKey)) {
                mapEntries.push(`    "${legacyKey}": resolveDefault(${finalAlias}, "${pascalName}"),`);
                registeredKeys.add(legacyKey);
            }
        }
    };

    // =========================================================
    // SCANNER EXECUTION
    // =========================================================
    
    const filesMap = getAllIslandFiles();

    // 1. Brainwave
    filesMap.brainwave.forEach(f => addEntry(f, path.join(MODULES_ROOT, "ui", "brainwave"), "brainwave/"));
    
    // 2. Lightswind
    filesMap.lightswind.forEach(f => addEntry(f, path.join(MODULES_ROOT, "ui", "lightswind"), "lightswind/"));
    
    // 3. Shadcn
    filesMap.shadcn.forEach(f => addEntry(f, path.join(MODULES_ROOT, "ui", "shadcn"), "shadcn/"));
    
    // 4. Spline
    filesMap.spline.forEach(f => addEntry(f, path.join(MODULES_ROOT, "ui", "spline"), "spline/"));
    
    // 5. Components
    filesMap.components.forEach(f => addEntry(f, path.join(MODULES_ROOT, "components"), "components/"));

    // 6. Pages
    if (filesMap.pages) {
        filesMap.pages.forEach(f => addEntry(f, path.join(MODULES_ROOT, "pages"), "page/"));
    }

    // 7. Core
    filesMap.core.forEach(f => {
        if (path.basename(f) === 'ui-engine-client.tsx' || path.basename(f) === 'ui-engine-server.tsx') {
             addEntry(f, path.join(MODULES_ROOT, "core"), ""); 
        }
    });

    // ---------------------------------------------------------
    // HELPER FUNCTIONS (INJECTED)
    // ---------------------------------------------------------
    const helperFunctions = `
/**
 * Helper: Mencari Default Export secara Aman
 */
const resolveDefault = (module: any, name: string) => {
    // 1. Cek Default
    if (module.default) return module.default;
    
    // 2. Cek Named Export yang sama dengan nama file (PascalCase)
    // Contoh: file button.tsx -> export const Button
    const pascalName = name.charAt(0).toUpperCase() + name.slice(1);
    if (module[pascalName]) return module[pascalName];

    // 3. Fallback: Ambil apa saja yang ada
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
${mapEntries.join('\n')}
};
`;

    fs.writeFileSync(OUTPUT_FILE, fileContent.trim());
    console.log(`✅ Server Map Generated: ${OUTPUT_FILE}`);
}

scanServer();