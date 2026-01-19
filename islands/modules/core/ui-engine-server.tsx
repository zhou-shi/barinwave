import { Fragment } from "preact/compat";
import { safeLucideIcon } from "../lib/safe";
import { HelpCircle } from "lucide-react";
import { ComponentSchema, IslandConfig, IslandProps } from "../types";
import { SERVER_COMPONENTS } from "./server-manifest";


// --- DAFTAR PROPS YANG DILARANG DI STATIC MODE ---
// Props ini menyebabkan error di Hugo atau tidak berguna tanpa JS
const BLACKLIST_PROPS = [
    "initial", 
    "animate", 
    "exit", 
    "whileHover", 
    "whileTap", 
    "transition", 
    "variants",
    "viewport" 
];

// --- HELPER: ISLAND WRAPPER (Jembatan Static -> Interactive) ---
const IslandWrapper = ({ component, islandProps, context }: {component: string, islandProps: IslandProps, context: any}) => {
    // 1. Generate ID Unik (agar tidak bentrok jika ada banyak island)
    // Kita gunakan random string sederhana karena ini berjalan di build time Node.js
    const uniqueId = `island-${Math.random().toString(36).substr(2, 9)}`;
    const dataId = `data-${uniqueId}`;

    // 2. Siapkan Props
    // Kita gabungkan props dari YAML (islandProps) dengan Context (jika ada loop)
    const finalProps = { ...islandProps, ...context };

    // 3. Serialize Props ke JSON string
    // Ini agar browser bisa membacanya nanti
    const jsonProps = JSON.stringify(finalProps);

    // 4. Render HTML Wrapper
    // Ini meniru persis output yang biasa dihasilkan Hugo untuk ui-engine-client
    return (
        <div className="island-wrapper contents">
            {/* Tempat React akan me-render komponen nanti */}
            <div id={uniqueId}></div>

            {/* Script untuk memberitahu main.js */}
            <script dangerouslySetInnerHTML={{ __html: `
                (function() {
                    window.requestIslands = window.requestIslands || [];
                    window.requestIslands.push({
                        component: "${component}",
                        targetId: "${uniqueId}",
                        dataId: "${dataId}"
                    });
                })();
            `}} />

            {/* Data Props disimpan di sini */}
            <script id={dataId} type="application/json" dangerouslySetInnerHTML={{ __html: jsonProps }} />
        </div>
    );
};

// --- STATIC MAP ---
const STATIC_MAP: Record<string, React.ElementType> = {
    ...SERVER_COMPONENTS,
    Div: "div", Span: "span", P: "p", A: "a", Img: "img",
    H1: "h1", H2: "h2", H3: "h3", Ul: "ul", Li: "li", 
    Nav: "nav", Footer: "footer", Br: "br", Button: "button",
    MotionDiv: "div", MotionH1: "h1", MotionP: "p", MotionA: "a", MotionSpan: "span",
    Fragment: Fragment,
    ErrorBoundary: ({ children }: any) => <>{children}</>,
    Suspense: ({ children, fallback }: any) => <>{fallback || children}</>,
    State: ({ children }: any) => <>{children}</>,
    Map: ({ data, template, context }: any) => {
         if (!data || !Array.isArray(data)) return null;
         return (
             <>
                 {data.map((item: any, index: number) => {
                     const newContext = { ...context, item, index };
                     return <StaticRenderer key={index} schema={template} context={newContext} />;
                 })}
             </>
         );
    },
    Island: ({ component, passProps, context }: { component: string, passProps: IslandProps, context: any }) => {
        if (!component) return null;
        return <IslandWrapper component={component} islandProps={passProps} context={context} />;
    },
    Client: ({Data = {}}: IslandProps) => {
        return (
            <IslandWrapper 
                component="ui-engine-client" 
                islandProps={{ Data }} 
                context={{}}
            />
        );
    }
};

// --- HELPER: DATA INJECTION ---
const injectStaticData = (obj: any, context: any): any => {
    if (!context || Object.keys(context).length === 0) return obj;

    if (typeof obj === 'string') {
        return obj.replace(/\$\{(.+?)\}/g, (match, exp) => {
            try {
                const keys = Object.keys(context);
                const values = Object.values(context);
                const fn = new Function(...keys, `return ${exp}`);
                const result = fn(...values);
                return result !== undefined ? result : match;
            } catch (e) { return match; }
        });
    }
    if (Array.isArray(obj)) return obj.map(c => injectStaticData(c, context));
    if (obj && typeof obj === 'object') {
        const res: any = {};
        for (const k in obj) res[k] = injectStaticData(obj[k], context);
        return res;
    }
    return obj;
};

// --- HELPER: CLEAN PROPS ---
const cleanPropsForStatic = (props: Record<string, any>) => {
    const cleaned: Record<string, any> = {};
    Object.keys(props).forEach(key => {
        // 1. Buang props animasi (blacklist)
        if (BLACKLIST_PROPS.includes(key)) return;
        
        // 2. Buang event handlers (onClick, dll) karena ini static HTML
        if (key.startsWith('on') && typeof props[key] === 'string') return;

        cleaned[key] = props[key];
    });
    return cleaned;
};

// --- MAIN RENDERER ---
const StaticRenderer = ({ schema, context = {} }: { schema: ComponentSchema, context?: any }) => {
    if (!schema || typeof schema !== 'object') return null;
    
    // 1. Inject Data
    const finalSchema = injectStaticData(schema, context);

    // 2. Resolve Component
    let Component = STATIC_MAP[finalSchema.component];
    
    if (!Component) {
        const key = Object.keys(STATIC_MAP).find(k => k.toLowerCase() === finalSchema.component.toLowerCase());
        if (key) Component = STATIC_MAP[key];
    }

    // 3. Handle Icon
    if (finalSchema.component === 'icon' || finalSchema.component === 'Icon') {
        const Icon = safeLucideIcon(finalSchema.props?.name) || HelpCircle;
        return <Icon {...(finalSchema.props || {})} />;
    }

    // 🔥 DEBUGGING: JIKA KOMPONEN TIDAK DITEMUKAN
    if (!Component) {
        // Cek apakah ini komponen HTML biasa (huruf kecil semua)
        const isHTML = /^[a-z0-9]+$/.test(finalSchema.component);
        
        if (!isHTML) {
            console.warn(`⚠️ [UI Engine] Component NOT FOUND: "${finalSchema.component}"`);
            console.warn(`   Available Keys (sample):`, Object.keys(STATIC_MAP).slice(0, 5));
        }
        
        // Kembalikan null atau div error merah untuk visualisasi di browser
        return (
            <div style={{border: '2px dashed red', padding: '10px', color: 'red'}}>
                ❌ Component Not Found: <strong>{finalSchema.component}</strong>
            </div>
        );
    }

    // 4. Props Handling & SANITIZATION (🔥 PENTING)
    const rawProps = finalSchema.props || {};
    let props = cleanPropsForStatic(rawProps);

    // Special Case: Map context passing
    if (['Map', 'Island'].includes(finalSchema.component)) {
        props = { ...props, context }; 
    }

    // 5. Render Children
    let childrenToRender: any = finalSchema.text || null;
    
    if (finalSchema.children && Array.isArray(finalSchema.children) && finalSchema.children.length > 0) {
        const renderedChildren = finalSchema.children.map((child: any, idx: number) => (
            <StaticRenderer key={idx} schema={child} context={context} />
        ));

        if (childrenToRender) {
            childrenToRender = [childrenToRender, ...renderedChildren];
        } else {
            childrenToRender = renderedChildren;
        }
    }

    return <Component {...props}>{childrenToRender}</Component>;
};

// --- ENTRY POINT ---
// --- 7. ENTRY POINT ---
export const config: IslandConfig = { 
    name: "ui-engine-server",
    moduleSource: ['islands', 'modules', 'core', 'ui-engine-server'],
    mode: 'static',
    outputDir: ['layouts', 'partials', 'core'], 
};

export default function UIEngineServer({ Data = {} }: { Data: any }) {
    const tree = Data.tree || [];
    
    if (tree.length === 0) {
        console.warn("⚠️ [Server Engine] Received EMPTY Tree! Check your YAML indentation.");
    }

    return (
        <div className="ui-engine-server-root w-full">
            {tree.map((node: any, idx: number) => (
                <StaticRenderer key={idx} schema={node} />
            ))}
        </div>
    );
}