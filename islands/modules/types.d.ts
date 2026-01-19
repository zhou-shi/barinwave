import { Label } from "@radix-ui/react-label";
import { R } from "node_modules/framer-motion/dist/types.d-DagZKalS";


// ------------------------------ GLOBAL ISLAND REQUESTS -----------------------------
declare global {
    interface Window {
        requestIslands?: IslandRequest[];
    }
};

export type IslandRequest = {
    component: string;
    targetId: string;
    dataId?: string;
};

// ------------------------------ ISLAND TYPES -----------------------------
export type ConfigIsland = Partial<IslandConfig>;
export interface IslandMenuParams {
    description?: string;
    decoration?: string;
    icon?: string;
    [key: string]: any;
};


export interface IslandProps {
    Menus?: HugoMenuEntry[];
    Params?: Record<string, any>;
    Data?: Record<string, any>;
    Page?: Record<string, any>;
    isBuildTime?: boolean;
};

export type IslandModuleConfig = {
    mode?: 'interactive' | 'static';
    outputDir: string[];
    createShortcode?: boolean;
    build?: boolean;
}

export type IslandConfig = IslandModuleConfig & {
    name: string; // Wajib ada setelah diproses scanner
    moduleSource: string[]; // Path source wajib ada
}

export interface ComplexTitle {
    start?: string;
    gradient?: string;
    end?: string;        
    [key: string]: any;
}

export type ComponentSchema = {
    component: string;
    props?: Record<string, unknown>;
    children?: ComponentSchema[];
    text?: string;
    if?: boolean | string;
}

// ------------------------------ HUGO TYPES -----------------------------
export interface HugoMenuEntry  {
    Identifier?: string;
    Parent?: string;
    Name?: string;
    Pre?: string;
    Post?: string; 
    URL?: string;
    PageRef? : string;
    Weight?: number;
    Title?: string;
    Params?: IslandMenuParams;
    Menu?: string;
    ConfiguredURL?: string;
    Page?: any;
    Children?: HugoMenuEntry[];
}

export {};



// export interface IslandProps {
//     Menus?: HugoMenuEntry[];
//     Params?: HugoParamsEntry;
//     Data?: HugoDataEntry;
//     Page?: Record<string, any>;
//     isBuildTime?: boolean;
// };

// export interface HugoDataEntry {
//     title?: string | ComplexTitle;
//     description?: string | string[];
//     descriptions?: Record<string, string>;
//     componets?: Record<string, any>;
//     [key: string]: any;
// }

// export interface HugoParamsEntry {
//     componets?: Record<string, any>;
//     [key: string]: any;
// }