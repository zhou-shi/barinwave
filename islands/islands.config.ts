import type { IslandConfig } from "./core/island-builder";

const TEMPLATES_ROOT = ['islands', 'templates'];
const HUGO_PARTIALS = ['layouts', 'partials'];

// Helper path
const getTemplate = (...path: string[]) => [...TEMPLATES_ROOT, ...path];

export const islandsConfig: IslandConfig[] = [
    // Feature Components
    {
        name: 'basic',
        outputDir: [...HUGO_PARTIALS, 'structure', 'header'],
        templateSource : [...getTemplate('brainwave', 'header', 'basic')]
    },
    {
        name: 'brainwave',
        outputDir: [...HUGO_PARTIALS, 'structure', 'header'],
        templateSource : [...getTemplate('brainwave', 'header', 'brainwave')]
    },
    // Lightswind UI Components
    {
        name: 'border-beam',
        outputDir: [...HUGO_PARTIALS, 'lightswind-ui'],
        templateSource : [...getTemplate('lightswind', 'border-beam')]
    },
];