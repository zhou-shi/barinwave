import { ConfigIsland, IslandProps } from "../types";
import { safeLucideIcon } from "../lib/safe";
import { HelpCircle } from "lucide-react";
import React, { 
    createContext, 
    Fragment, 
    lazy, 
    Suspense, 
    useMemo,
    useContext,
    useState,
    useEffect
} from "preact/compat";
import { Section } from "../ui/brainwave/section";
import { Container } from "../ui/brainwave/container";
import { Typography } from "../ui/brainwave/typography";
import { ANIM, MotionDiv, MotionH1, MotionH2, MotionH3, MotionP, MotionSpan } from "../lib/motion";
import { ErrorBoundary } from "../lib/error-boundry";
import ScenePlaceholder from "../ui/spline/scene-paceholder";
import { P } from "node_modules/framer-motion/dist/types.d-DagZKalS";

// --- 1. TYPE DEFINITIONS ---

export type ComponentSchema = {
    component: string;
    props?: Record<string, unknown>;
    children?: ComponentSchema[];
    text?: string;
    if?: boolean | string;
}

type ScopeType = Record<string, any>;

type EffectDefinition = {
    deps?: string[];
    code: string;
};

// --- 2. SCOPE CONTEXT ---
const ScopeContext = createContext<ScopeType>({});


// --- 3. UNIVERSAL HELPERS ---

const injectTemplateData = (obj: any, scope: ScopeType): any => {
    if (typeof obj === 'string') {
        // 1. PRIORITAS UTAMA: Pure Variable (Agar tipe data Object/Array terjaga)
        // Regex: ^\$\{([^}]+)\}$ -> Hanya berisi satu ${...} dari awal sampai akhir
        const pureMatch = obj.match(/^\$\{([^}]+)\}$/);
        
        if (pureMatch) {
            const exp = pureMatch[1];
            try {
                const keys = Object.keys(scope);
                const values = Object.values(scope);
                const result = new Function(...keys, `return ${exp}`)(...values);
                // Return result apa adanya (Array, Object, Boolean, dll)
                return result !== undefined ? result : obj;
            } catch (e) {
                // Jika error, mungkin ini bukan variabel valid, lanjut ke logika string biasa
            }
        }

        // 2. PRIORITAS KEDUA: String Interpolation (Campuran Teks & Variabel)
        // Kita gunakan replace dengan callback function
        return obj.replace(/\$\{([^}]+)\}/g, (match, exp) => {
            try {
                const keys = Object.keys(scope);
                const values = Object.values(scope);
                // Evaluasi ekspresi di dalam ${...}
                const result = new Function(...keys, `return ${exp}`)(...values);
                
                // Jika hasil undefined, jangan crash, kembalikan string kosong atau match aslinya
                return result !== undefined ? String(result) : ""; 
            } catch (e) {
                // Jika error (misal variable belum ada), biarkan string aslinya (${...})
                // Agar tidak hilang di UI, dan memberi petunjuk visual ada yg salah
                // Atau return "" jika ingin menyembunyikan error.
                return match; 
            }
        });
    }

    if (Array.isArray(obj)) {
        return obj.map(child => injectTemplateData(child, scope));
    }

    if (obj && typeof obj === 'object') {
        const result: any = {};
        for (const key in obj) {
            result[key] = injectTemplateData(obj[key], scope);
        }
        return result;
    }

    return obj;
};

const hydrateProps = (props: Record<string, any> = {}, scope: ScopeType = {}): Record<string, any> => {
    const hydrated: Record<string, any> = {};

    Object.keys(props).forEach((key) => {
        const value = props[key];
        
        if (typeof value === 'string') {
            const trimmed = value.trim();

            // 1. Deteksi Fungsi (Logic Lama)
            if (trimmed.startsWith('() =>') || trimmed.startsWith('(e) =>') || trimmed.startsWith('function')) {
                try {
                    const keys = Object.keys(scope);
                    const values = Object.values(scope);
                    const factory = new Function(...keys, `return ${trimmed}`);
                    const fn = factory(...values);
                    if (typeof fn === 'function') {
                        hydrated[key] = fn;
                        return;
                    }
                } catch (err) {}
            }

            // 2. [INI YANG HILANG] Deteksi Objek/Array (Support format {{...}} atau [...])
            const isObject = (trimmed.startsWith('{') && trimmed.endsWith('}'));
            const isArray = (trimmed.startsWith('[') && trimmed.endsWith(']'));
            
            if (isObject || isArray) {
                try {
                    let jsExpression = trimmed;
                    
                    // Hapus kurung kurawal ganda {{ }} jika ada (Gaya YAML Anda)
                    // "{{ a: 1 }}" -> "{ a: 1 }"
                    if (trimmed.startsWith('{{') && trimmed.endsWith('}}')) {
                        jsExpression = trimmed.slice(1, -1); 
                    }

                    const keys = Object.keys(scope);
                    const values = Object.values(scope);
                    
                    // Evaluasi string menjadi Object JS Asli
                    // Ini memungkinkan penggunaan variable 'Infinity', '$state', dll
                    const result = new Function(...keys, `return ${jsExpression}`)(...values);

                    hydrated[key] = result;
                    return; // Lanjut ke key berikutnya
                } catch (e) {
                    console.warn(`[Hydrator] Failed to parse object: ${key}`, e);
                }
            }
        }
        
        hydrated[key] = value;
    });
    return hydrated;
};

const resolveDependencies = (deps: string[] = [], scope: ScopeType): any[] => {
    if (!deps) return [];
    return deps.map(depKey => {
        try {
            const keys = Object.keys(scope);
            const values = Object.values(scope);
            return new Function(...keys, `return ${depKey}`)(...values);
        } catch (e) {
            return undefined;
        }
    });
};


// --- 4. LOGIC COMPONENTS (FIXED) ---

const Mapper = ({ data, template }: { data: any[], template: ComponentSchema }) => {
    const parentScope = useContext(ScopeContext);
    
    // Guard: Pastikan data array valid
    if (!data || !Array.isArray(data) || !template) return null;

    return (
        <Fragment>
            {data.map((item, index) => {
                const itemScope = {
                    ...parentScope,
                    item: item, 
                    index: index
                };
                return (
                    <ScopeContext.Provider key={index} value={itemScope}>
                        <Renderer schema={template} />
                    </ScopeContext.Provider>
                );
            })}
        </Fragment>
    );
};

// FIX STATE WRAPPER:
// 1. Terima props langsung (init, effects), bukan di dalam object 'props'.
// 2. Terima 'schemaChildren' (Schema Mentah), bukan 'children' (VNode jadi).
const StateWrapper = ({ init, effects, schemaChildren }: { init: any, effects: EffectDefinition, schemaChildren: ComponentSchema[] }) => {
    // 1. Hook State
    const [state, setState] = useState(init || {});

    // 2. Setters
    const setters = useMemo(() => {
        const helpers: Record<string, Function> = {};
        Object.keys(state).forEach(key => {
            helpers[key] = (val: any) => {
                setState((prev: any) => {
                    const newValue = typeof val === 'function' ? val(prev[key]) : val;
                    return { ...prev, [key]: newValue };
                });
            };
        });
        return helpers;
    }, [state]);

    // 3. Gabungkan Scope
    const parentScope = useContext(ScopeContext);
    const currentScope = { ...parentScope, $state: state, $set: setters };

    // 4. Effects
    if (effects && Array.isArray(effects)) {
        effects.forEach((effect, idx) => {
            const resolvedDeps = resolveDependencies(effect.deps, currentScope);
            useEffect(() => {
                try {
                    const fnStr = effect.code;
                    if (!fnStr) return;
                    const keys = Object.keys(currentScope);
                    const values = Object.values(currentScope);
                    const factory = new Function(...keys, `return ${fnStr}`);
                    const executableEffect = factory(...values);
                    if (typeof executableEffect === 'function') return executableEffect();
                } catch (err) {
                    console.error(`[State] Error effect #${idx}:`, err);
                }
                // eslint-disable-next-line react-hooks/exhaustive-deps
            }, resolvedDeps);
        });
    }

    // 5. RENDER CHILDREN SECARA MANUAL DI DALAM PROVIDER
    // Kita gunakan schemaChildren agar Renderer baru dibuat di dalam Context yang benar.
    return (
        <ScopeContext.Provider value={currentScope}>
            {schemaChildren && schemaChildren.map((child, idx) => (
                <Renderer key={idx} schema={child} />
            ))}
        </ScopeContext.Provider>
    );
};


// --- 5. COMPONENT RESOLVER ---

const INTERNAL_MAP: Record<string, React.ElementType> = {
    Section: Section,
    Container: Container,
    Map: Mapper,
    State: StateWrapper,
    ScenePlaceholder: ScenePlaceholder,
    MotionDiv: MotionDiv,
    MotionH1: MotionH1,
    MotionH2: MotionH2,
    MotionH3: MotionH3,
    MotionP: MotionP,
    MotionSpan: MotionSpan,
    Typography: Typography,
    ErrorBoundary: ErrorBoundary,
    Suspense: Suspense,
    Fragment: Fragment,
    Div: "div",
    Span: "span",
    Img: "img",
    Ul: "ul",
    Li: "li",
    P: "p",
    A: "a",
    Button: "button",
};

const resolveDynamicComponent = (componentName: string) => {
    // 1. Cek apakah ini komponen internal (seperti 'container', 'section')
    if (INTERNAL_MAP[componentName]) {
        return { mode: 'static', component: INTERNAL_MAP[componentName] };
    }

    // 2. Cek apakah ini Icon (Format: "icon")
    if (componentName === 'icon') {
        return { mode: 'icon' }; // Kita handle khusus di render
    }

    // 3. Parsing Format "folder/file.NamedExport"
    // Contoh: "shadcn/card.CardHeader" -> folder="shadcn", file="card", export="CardHeader"
    // Contoh: "shadcn/button" -> folder="shadcn", file="button", export="default"
    
    const [pathPart, exportName] = componentName.split('.');
    const pathSegments = pathPart.split('/');
    
    // Validasi: Harus ada format "folder/file" minimal
    if (pathSegments.length < 2) {
        console.warn(`[UI-Engine] Invalid format: ${componentName}. Use 'folder/file'`);
        return { mode: 'missing', name: componentName };
    }

    const folder = pathSegments[0]; // "shadcn", "lightswind", "brainwave"
    const file = pathSegments[1];   // "button", "card"

    // 4. THE DYNAMIC IMPORT (Lazy Load)
    // Esbuild akan melihat string ini dan mem-bundle semua file di folder ui/shadcn, ui/brainwave, dll.
    const LazyComponent = lazy(async () => {
        try {
            let module: any;

            // Import dinamis (Pastikan path relatif ini benar sesuai struktur folder Anda)
            if (folder === 'components') {
                module = await import(`../components/${file}.tsx`);
            } else if (folder === 'shadcn') {
                module = await import(`../ui/shadcn/${file}.tsx`);
            } else if (folder === 'lightswind') {
                module = await import(`../ui/lightswind/${file}.tsx`);
            } else if (folder === 'brainwave') {
                module = await import(`../ui/brainwave/${file}.tsx`);
            } else if ( folder === 'spline') {
                module = await import(`../ui/spline/${file}.tsx`);
            } else {
                throw new Error(`Unknown UI folder: ${folder}`);
            }

            // --- PERBAIKAN LOGIKA EXPORT ---
            
            let Component = null;

            if (exportName) {
                // A. Jika user minta spesifik (misal: shadcn/card.CardHeader)
                Component = module[exportName];
            } else {
                // B. Jika user cuma minta file (misal: shadcn/button)
                // 1. Coba ambil Default Export
                if (module.default) {
                    Component = module.default;
                } 
                // 2. Jika tidak ada Default, coba PascalCase dari nama file
                // Contoh: file "button" -> cari export "Button"
                else {
                    // Ubah 'button' jadi 'Button', 'alert-dialog' jadi 'AlertDialog' (jika perlu)
                    // Untuk simplifikasi, kita asumsi PascalCase sederhana:
                    const pascalName = file.charAt(0).toUpperCase() + file.slice(1);
                    Component = module[pascalName];
                }
            }
            
            // Debugging: Buka Console Browser (F12) jika masih error
            if (!Component) {
                console.error(`[UI-Engine] Export not found in ${folder}/${file}.tsx`, {
                    requested: exportName || 'default/PascalCase',
                    availableExports: Object.keys(module)
                });
                throw new Error(`Export not found`);
            }
            
            return { default: Component }; 

        } catch (err) {
            console.error(`[UI-Engine] Failed to load: ${componentName}`, err);
            return { default: () => <div className="text-red-500 text-xs p-2 border border-red-500">Missing: {componentName}</div> };
        }
    });

    return { mode: 'lazy', component: LazyComponent };
};


// --- 6. MAIN RENDERER (UPDATED) ---

const Renderer = ({ schema }: { schema: ComponentSchema }) => {
    if (!schema || typeof schema !== 'object' || !schema.component) return null;

    const scope = useContext(ScopeContext);

    // Conditional
    if (schema.if !== undefined) {
        let shouldRender = schema.if;
        if (typeof schema.if === 'string' && schema.if.includes('${')) {
            const evaluated = injectTemplateData(schema.if, scope);
            shouldRender = evaluated === 'true' || (evaluated !== 'false' && evaluated !== '' && evaluated !== '0');
        }
        if (!shouldRender) return null;
    }

    // Inject Data
    const injectedSchema = useMemo(() => injectTemplateData(schema, scope), [schema, scope]);
    
    // Resolve
    const resolved = useMemo(() => resolveDynamicComponent(injectedSchema.component), [injectedSchema.component]);

    if (!resolved) return <div className="text-red-500">Render Error</div>;
    if (resolved.mode === 'missing') return <div className="text-orange-500">Missing: {injectedSchema.component}</div>;

    // Hydrate Props
    const rawProps = injectedSchema.props || {};
    const hydratedProps = useMemo(() => hydrateProps(rawProps, scope), [rawProps, scope]);

    // Cek apakah ada prop 'fallback' yang bentuknya adalah Object Schema (punya properti 'component')
    if (rawProps.fallback && typeof rawProps.fallback === 'object') {
        const fallbackSchema = rawProps.fallback as ComponentSchema;
        
        // Cek validitas sederhana: apakah ini schema valid?
        if (fallbackSchema.component) {
            // RENDER ULANG Schema tersebut menjadi VNode menggunakan Renderer ini sendiri
            // Lalu timpa prop 'fallback' dengan hasil rendernya
            hydratedProps.fallback = <Renderer schema={fallbackSchema} />;
        }
    }

    const Component = resolved.component;

    // --- CHILDREN HANDLING (CRITICAL FIX) ---
    // 1. Render Children biasa (VNodes) untuk komponen UI standar (Card, Container)
    let childrenToRender: any = injectedSchema.text || null;
    
    if (injectedSchema.children && injectedSchema.children.length > 0) {
        childrenToRender = injectedSchema.children.map((child: any, idx: number) => (
            <Renderer key={idx} schema={child} />
        ));
    }

    // 2. Pass 'schemaChildren' (Schema Mentah)
    // Ini khusus untuk komponen LOGIC (StateWrapper) yang butuh merender ulang children di dalam Context-nya.
    const extraProps = {
        schemaChildren: injectedSchema.children // 👈 Props rahasia untuk StateWrapper
    };

    if (resolved.mode === 'icon') {
        const Icon = safeLucideIcon(hydratedProps.name as string) ?? HelpCircle;
        return <Icon {...hydratedProps} />;
    }

    if (resolved.mode === 'lazy') {
        return (
            <Suspense fallback={null}> 
                <Component {...hydratedProps} {...extraProps}>{childrenToRender}</Component>
            </Suspense>
        );
    }

    return <Component {...hydratedProps} {...extraProps}>{childrenToRender}</Component>;
};


// --- 7. ENTRY POINT ---
export const config: ConfigIsland = { mode: "interactive", build: true };

export default function UIEngine({ Data = {} }: IslandProps) {
    const tree = (Data as any).tree || [];
    const globalScope = {
        ANIM: ANIM,
        Math: Math,
        Date: Date,
    }

    return (
        <div className="ui-engine-root w-full">
            <ScopeContext.Provider value={globalScope}>
                {tree.map((node: any, idx: number) => (
                    <Renderer key={idx} schema={node} />
                ))}
            </ScopeContext.Provider>
        </div>
    );
}




// import { ConfigIsland, IslandProps } from "../types";
// import { safeLucideIcon } from "../lib/safe";
// import { HelpCircle } from "lucide-react";
// import { 
//     createContext, 
//     Fragment, 
//     lazy, 
//     Suspense, 
//     useMemo
// } from "preact/compat";
// import { Section } from "../ui/brainwave/section";
// import { Container } from "../ui/brainwave/container";
// import { Typography } from "../ui/brainwave/typography";

// // --- TYPE DEFINITIONS ---

// // Tipe Scope gabungan (bisa berisi item loop, index, $state, $set)
// type ScopeType = Record<string, unknown>;

// // Tipe untuk Schema Komponen (Tree)
// export type ComponentSchema = {
//     component: string;
//     props?: Record<string, unknown>;
//     children?: ComponentSchema[];
//     text?: string;
//     if?: boolean | string;
// }

// // Tipe untuk Props StateWrapper
// type EffectDefinition = {
//     deps?: string[];
//     code: string;
// };

// type StateInitProps = {
//     init?: Record<string, unknown>;
//     effects?: EffectDefinition[];
// };

// // --- SCOPE CONTEXT ---
// const ScopeContext = createContext<ScopeType>({});


// /**
//  * Mengganti placeholder variable dengan data asli.
//  * Input: "Halo ${item.name}", Data: { name: "Dao" }
//  * Output: "Halo Dao"
//  */
// const injectTemplateData = (obj: any, dataItem: any, index: number): any => {
//     // 1. Jika String: Lakukan Replace regex
//     if (typeof obj === 'string') {
//         // Ganti ${item.key} dengan value
//         let result = obj.replace(/\$\{\s*item\.([a-zA-Z0-9_.]+)\s*\}/g, (_, key) => {
//             // Support nested key: item.address.city
//             const keys = key.split('.');
//             let value = dataItem;
//             for (const k of keys) {
//                 value = value?.[k];
//             }
//             return value !== undefined ? value : "";
//         });

//         // Ganti ${index} dengan angka index
//         result = result.replace(/\$\{\s*index\s*\}/g, String(index));
        
//         return result;
//     }

//     // 2. Jika Array: Rekursif
//     if (Array.isArray(obj)) {
//         return obj.map(child => injectTemplateData(child, dataItem, index));
//     }

//     // 3. Jika Object: Rekursif (Clone object agar tidak mutasi referensi asli)
//     if (obj && typeof obj === 'object') {
//         const result: any = {};
//         for (const key in obj) {
//             result[key] = injectTemplateData(obj[key], dataItem, index);
//         }
//         return result;
//     }

//     return obj;
// };

// const Mapper = ({ data, template }: { data: any[], template: ComponentSchema }) => {
//     if (!data || !Array.isArray(data) || !template) return null;

//     return (
//         <Fragment>
//             {data.map((item, index) => {
//                 // 1. Inject Data ke dalam Template untuk item ini
//                 const itemSchema = injectTemplateData(template, item, index);
                
//                 // 2. Render ulang menggunakan Renderer utama
//                 // Kita pass 'key' agar React senang
//                 return <Renderer key={index} schema={itemSchema} />;
//             })}
//         </Fragment>
//     );
// };

// const INTERNAL_MAP: Record<string, any> = {
//     section: Section,
//     container: Container,
//     map: Mapper,
//     typography: Typography,
//     fragment: Fragment,
// };

// // --- HELPER: FUNCTION HYDRATOR ---
// /**
//  * Mengubah string fungsi dari YAML menjadi fungsi JS asli.
//  * Contoh Input: "() => alert('Hello')"
//  * Contoh Output: () => alert('Hello') (Executable Function)
//  */
// const hydrateProps = (props: Record<string, any> = {}): Record<string, any> => {
//     const hydrated: Record<string, any> = {};

//     Object.keys(props).forEach((key) => {
//         const value = props[key];

//         // Cek apakah value adalah string yang diawali pola fungsi
//         if (typeof value === 'string') {
//             const trimmed = value.trim();
            
//             // Pola 1: Arrow Function "() => ..." atau "(e) => ..."
//             // Pola 2: Function Keyword "function() { ... }"
//             if (trimmed.startsWith('() =>') || trimmed.startsWith('(e) =>') || trimmed.startsWith('function')) {
//                 try {
//                     // PENTING: new Function() membuat fungsi di scope global.
//                     // Untuk arrow function, kita perlu membungkusnya agar return value-nya adalah fungsi itu sendiri.
                    
//                     // Cara kerja:
//                     // new Function("return " + "() => alert('Hi')")()
//                     // -> Hasilnya adalah fungsi () => alert('Hi')
                    
//                     // eslint-disable-next-line no-new-func
//                     const fn = new Function(`return ${trimmed}`)();
                    
//                     if (typeof fn === 'function') {
//                         hydrated[key] = fn;
//                         return; // Lanjut ke key berikutnya
//                     }
//                 } catch (err) {
//                     console.warn(`[UI-Engine] Failed to hydrate prop '${key}':`, err);
//                     // Jika gagal parse, biarkan tetap string (fallback)
//                 }
//             }
//         }

//         // Jika bukan fungsi, salin apa adanya
//         hydrated[key] = value;
//     });

//     return hydrated;
// };

// // --- THE MAGIC: DYNAMIC COMPONENT RESOLVER ---

// /**
//  * Fungsi ini memecah string "folder/file.ExportName"
//  * dan melakukan import dinamis.
//  */
// const resolveDynamicComponent = (componentName: string) => {
//     // 1. Cek apakah ini komponen internal (seperti 'container', 'section')
//     if (INTERNAL_MAP[componentName]) {
//         return { mode: 'static', component: INTERNAL_MAP[componentName] };
//     }

//     // 2. Cek apakah ini Icon (Format: "icon")
//     if (componentName === 'icon') {
//         return { mode: 'icon' }; // Kita handle khusus di render
//     }

//     // 3. Parsing Format "folder/file.NamedExport"
//     // Contoh: "shadcn/card.CardHeader" -> folder="shadcn", file="card", export="CardHeader"
//     // Contoh: "shadcn/button" -> folder="shadcn", file="button", export="default"
    
//     const [pathPart, exportName] = componentName.split('.');
//     const pathSegments = pathPart.split('/');
    
//     // Validasi: Harus ada format "folder/file" minimal
//     if (pathSegments.length < 2) {
//         console.warn(`[UI-Engine] Invalid format: ${componentName}. Use 'folder/file'`);
//         return { mode: 'missing', name: componentName };
//     }

//     const folder = pathSegments[0]; // "shadcn", "lightswind", "brainwave"
//     const file = pathSegments[1];   // "button", "card"

//     // 4. THE DYNAMIC IMPORT (Lazy Load)
//     // Esbuild akan melihat string ini dan mem-bundle semua file di folder ui/shadcn, ui/brainwave, dll.
//     const LazyComponent = lazy(async () => {
//         try {
//             let module: any;

//             // Import dinamis (Pastikan path relatif ini benar sesuai struktur folder Anda)
//             if (folder === 'components') {
//                 module = await import(`../components/${file}.tsx`);
//             } else if (folder === 'shadcn') {
//                 module = await import(`../ui/shadcn/${file}.tsx`);
//             } else if (folder === 'lightswind') {
//                 module = await import(`../ui/lightswind/${file}.tsx`);
//             } else if (folder === 'brainwave') {
//                 module = await import(`../ui/brainwave/${file}.tsx`);
//             } else {
//                 throw new Error(`Unknown UI folder: ${folder}`);
//             }

//             // --- PERBAIKAN LOGIKA EXPORT ---
            
//             let Component = null;

//             if (exportName) {
//                 // A. Jika user minta spesifik (misal: shadcn/card.CardHeader)
//                 Component = module[exportName];
//             } else {
//                 // B. Jika user cuma minta file (misal: shadcn/button)
//                 // 1. Coba ambil Default Export
//                 if (module.default) {
//                     Component = module.default;
//                 } 
//                 // 2. Jika tidak ada Default, coba PascalCase dari nama file
//                 // Contoh: file "button" -> cari export "Button"
//                 else {
//                     // Ubah 'button' jadi 'Button', 'alert-dialog' jadi 'AlertDialog' (jika perlu)
//                     // Untuk simplifikasi, kita asumsi PascalCase sederhana:
//                     const pascalName = file.charAt(0).toUpperCase() + file.slice(1);
//                     Component = module[pascalName];
//                 }
//             }
            
//             // Debugging: Buka Console Browser (F12) jika masih error
//             if (!Component) {
//                 console.error(`[UI-Engine] Export not found in ${folder}/${file}.tsx`, {
//                     requested: exportName || 'default/PascalCase',
//                     availableExports: Object.keys(module)
//                 });
//                 throw new Error(`Export not found`);
//             }
            
//             return { default: Component }; 

//         } catch (err) {
//             console.error(`[UI-Engine] Failed to load: ${componentName}`, err);
//             return { default: () => <div className="text-red-500 text-xs p-2 border border-red-500">Missing: {componentName}</div> };
//         }
//     });

//     return { mode: 'lazy', component: LazyComponent };
// };

// // --- 3. RENDERER ---

// const Renderer = ({ schema }: { schema: ComponentSchema }) => {
//     if (schema.if === false) return null;

//     // Resolve component (Memoize agar tidak re-calc setiap render)
//     const resolved = useMemo(() => resolveDynamicComponent(schema.component), [schema.component]);

//     if (!resolved) {
//         return <div className="text-red-500">Render Error: {schema.component}</div>;
//     };

//     if (resolved.mode === 'missing') {
//         return <div className="border border-orange-500 bg-orange-900/20 text-orange-400 p-2 text-xs font-mono my-2 rounded">Invalid Format: <strong>{schema.component}</strong> (Use 'folder/file')</div>;
//     }

//     // --- [NEW] HYDRATE PROPS HERE ---
//     // Sebelum diberikan ke komponen, kita konversi dulu props-nya
//     const rawProps = schema.props || {};
//     const hydratedProps = useMemo(() => hydrateProps(rawProps), [rawProps]);

//     // Handle Icon Case
//     if (resolved.mode === 'icon') {
//         const Icon = safeLucideIcon(schema.props?.name as string) ?? HelpCircle;

//         return <Icon {...(hydratedProps || {})} />;
//     }

//     const Component = resolved.component;

//     // Prepare Children
//     let childrenToRender: any = schema.text || null;
//     if (schema.children && schema.children.length > 0) {
//         childrenToRender = schema.children.map((child, idx) => (
//             <Renderer key={idx} schema={child} />
//         ));
//     }

//     // Render Logic
//     if (resolved.mode === 'lazy') {
//         // Jika Lazy, WAJIB dibungkus Suspense
//         return (
//             <Suspense fallback={null}> 
//                 <Component {...(hydratedProps || {})}>
//                     {childrenToRender}
//                 </Component>
//             </Suspense>
//         );
//     }

//     // Jika Static (Internal helper)
//     return (
//         <Component {...(hydratedProps || {})}>
//             {childrenToRender}
//         </Component>
//     );
// };


// // --- 4. MAIN ENTRY ---
// export const config: ConfigIsland = { mode: "interactive", build: true };

// export default function UIEngine({ Data = {} }: IslandProps) {
//     const tree = (Data as any).tree || [];
//     return (
//         <div className="ui-engine-root w-full">
//             {tree.map((node: any, idx: number) => (
//                 <Renderer key={idx} schema={node} />
//             ))}
//         </div>
//     );
// };