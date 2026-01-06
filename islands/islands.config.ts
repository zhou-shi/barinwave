import type { IslandConfig } from "./core/island-builder";

const MODULE_ROOT = ['islands', 'modules'];
const HUGO_PARTIALS = ['layouts', 'partials'];

// Helper path
const getModule = (...path: string[]) => [...MODULE_ROOT, ...path];

export const islandsConfig: IslandConfig[] = [
    {
        name: 'basic',
        outputDir: [...HUGO_PARTIALS, 'structure', 'header'],
        moduleSource : [...getModule('components', 'header', 'hotodus')],
        mode: 'interactive'
    },
    {
        name: 'brainwave',
        outputDir: [...HUGO_PARTIALS, 'structure', 'header'],
        moduleSource : [...getModule('components', 'header', 'brainwave')],
        mode: 'interactive'
    },
    {
        name: 'home',
        outputDir: [...HUGO_PARTIALS, 'pages'],
        moduleSource : [...getModule('pages', 'home')],
        mode: 'interactive',
        createShortcode: true
    },
    {
        name: 'wbs',
        outputDir: [...HUGO_PARTIALS, 'pages'],
        moduleSource : [...getModule('pages', 'layanan', 'wbs')],
        mode: 'interactive',
        createShortcode: true
    },
    {
        name: 'footer',
        outputDir: [...HUGO_PARTIALS, 'structure'],
        moduleSource : [...getModule('components', 'footer')],
        mode: 'static',
    },

];

