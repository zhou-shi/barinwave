/**
 * HUGO BRIDGE SDK
 * ------------------------------------------------------------------
 * Library ini berfungsi sebagai "Generator Syntax" untuk Hugo.
 * Kode ini berjalan di Build Time (saat esbuild memproses TSX),
 * menghasilkan string Template Hugo yang valid untuk dirender.
 */

// 1. DEFINISI TIPE
export type HugoScope = 
    | "site.Params" 
    | "site.Data" 
    | "site.Menus" 
    | "Params" 
    | "Data" 
    | "." 
    | string; 

export interface HugoFetchOptions {
    scope?: HugoScope;                  // Default: "site.Params"
    key?: string;                       // Dot notation: "home.hero.title"
    default?: string | number | boolean;// Nilai default jika data kosong
    func?: string;                      // Pipe functions: "markdownify", "lower"
    raw?: boolean;                      // True = return string mentah (tanpa {{ }})
}

// 2. FUNGSI UTAMA: GET
export const get = (keyOrOptions: string | HugoFetchOptions): string => {
    // A. Normalisasi Input
    let opts: HugoFetchOptions;
    
    if (typeof keyOrOptions === "string") {
        opts = { key: keyOrOptions, scope: "site.Params" };
    } else {
        opts = { scope: "site.Params", ...keyOrOptions };
    }

    // B. Inisialisasi Pipeline
    let pipeline: string = opts.scope ?? "site.Params";

    // C. Bangun Path (Scope + Key)
    if (opts.key) {
        // FIX: Handle current context (.) dengan rapi
        if (pipeline === ".") {
            pipeline = `.${opts.key}`; 
        } else {
            pipeline += `.${opts.key}`;
        }
    }

    // D. Tambahkan Default Value
    if (opts.default !== undefined) {
        let defVal = String(opts.default);
        // Bungkus string dengan kutip, kecuali variable Hugo ($) atau raw (`)
        if (typeof opts.default === "string") {
            const isVariable = defVal.startsWith("$") || defVal.startsWith("`");
            if (!isVariable) {
                defVal = `"${defVal}"`;
            }
        }
        pipeline += ` | default ${defVal}`;
    }
    
    // E. Tambahkan Fungsi Pipa
    if (opts.func) {
        pipeline += ` | ${opts.func}`;
    }

    // F. Return Format
    if (opts.raw) {
        return pipeline; // Return: site.Params.title
    }
    
    return `{{ ${pipeline} }}`; // Return: {{ site.Params.title }}
};

// 3. FACTORY: SCOPE CREATOR (UPDATED)
/**
 * Membuat instance getter khusus untuk section tertentu.
 * UPDATE: Menambahkan parameter 'raw' ke-4.
 */
export const scope = (sectionRoot: string, baseScope: HugoScope = "site.Params") => {
    return (key: string, def?: string | number | boolean, func?: string, raw: boolean = false) => {
        // Gabungkan root + key anak
        const fullKey = sectionRoot ? `${sectionRoot}.${key}` : key;
        
        return get({ 
            scope: baseScope, 
            key: fullKey, 
            func: func,
            default: def,
            raw: raw // <-- Fitur baru: Bypass kurung kurawal
        });
    };
};

// 4. LOGIC HELPERS

/**
 * Membuat sintaks loop range
 */
export const range = (key: string, scope: HugoScope = "site.Params"): string => {
    let fullPath = scope;

    if (key) {
        if (scope === ".") {
            fullPath = `.${key}`; 
        } else {
            fullPath = `${scope}.${key}`; 
        }
    }
    
    return `{{ range ${fullPath} }}`;
};

export const end = (): string => `{{ end }}`;

export const mergeParams = (targetVarName: string = "$mergedParams"): string => {
    return `{{ ${targetVarName} := merge site.Params .Params }}`;
};

export const menu = (identifier: string, menuName: string = "main"): string => {
    return `{{ range where site.Menus.${menuName} "Identifier" "${identifier}" }}`;
};

// 5. EXPORT
export const h = {
    get,
    scope,
    range,
    end,
    mergeParams,
    menu,
    footer: scope("footer"),
    social: scope("social", "site.Params.footer"),
};