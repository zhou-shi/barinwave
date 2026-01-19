import { h, render } from "preact";
import { COMPONENT_LOADERS } from "../../assets/ts/client-manifest";
import { HugoMenuEntry, IslandProps } from "@/modules/types";

// --- TYPE GUARDS & TYPES ---
type ManifestKey = keyof typeof COMPONENT_LOADERS;

function isValidComponentKey(key: string): key is ManifestKey {
    return Object.prototype.hasOwnProperty.call(COMPONENT_LOADERS, key);
}

// --- MAIN LOGIC ---
export const hydrateIslands = async () => {
    const queue = window.requestIslands || [];

    if (queue.length === 0) return;

    console.log(`🏝️ Hydrating ${queue.length} islands...`);

    for (const req of queue) {
        const { component, targetId, dataId } = req;
        const root = document.getElementById(targetId);
        
        // Ambil elemen data (opsional, karena dataId mungkin undefined)
        const dataScript = dataId ? document.getElementById(dataId) : null;

        // Validasi elemen root dan key komponen
        if (root && isValidComponentKey(component)) {
            try {
                const loader = COMPONENT_LOADERS[component];
                
                // Lazy Load
                const module = await loader();
                
                // Ambil Default Export atau Named Export pertama
                // @ts-ignore - Kadang tipe module kompleks, kita ambil default/first key
                const Component = module.default || module[Object.keys(module)[0]];

                if (!Component) {
                    console.error(`❌ Component ${component} loaded but export not found.`);
                    continue;
                }

                // Bersihkan HTML statis (undangan)
                root.innerHTML = '';

                // --- LOGIKA PARSING PROPS (Milik Anda) ---
                let props: IslandProps = { Menus: [], Params: {} };

                if (dataScript && dataScript.textContent) {
                    try {
                        const rawData = JSON.parse(dataScript.textContent);
                        
                        if (rawData) {
                            if (Array.isArray(rawData)) {
                                props.Menus = rawData as HugoMenuEntry[];
                            } else if (typeof rawData === 'object') {
                                // Cek struktur objek
                                const hasMenuKey = 'Menus' in rawData;
                                const hasParamsKey = 'Params' in rawData;
                                const hasDataKey = 'Data' in rawData;
                                const hasPageKey = 'Page' in rawData;

                                if (hasMenuKey || hasParamsKey || hasDataKey || hasPageKey) {
                                    if (rawData.Menus) props.Menus = rawData.Menus as HugoMenuEntry[];
                                    if (rawData.Params) props.Params = rawData.Params as Record<string, any>;
                                    if (rawData.Data) props.Data = rawData.Data as Record<string, any>;
                                    if (rawData.Page) props.Page = rawData.Page as Record<string, any>;
                                } else {
                                    // Jika objek biasa tanpa key khusus, anggap sebagai Params
                                    props.Params = rawData as Record<string, any>;
                                }
                            }
                        }
                    } catch (e) {
                        console.warn(`⚠️ Failed to parse props for ${component}`, e);
                    }
                }

                // Render Preact
                render(h(Component, props), root);

            } catch (err) {
                console.error(`❌ Error rendering ${component}:`, err);
            }
        } else if (!root) {
            // console.warn(`Target ID ${targetId} not found`);
        } else {
            console.warn(`⚠️ Unknown component: ${component}`);
        }
    }
};