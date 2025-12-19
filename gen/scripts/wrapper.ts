import type { GenerateWrapperProps } from "@/helper/generate-wrapper";


const brainwave = ['gen', 'templates', 'brainwave'];
const radix = ['gen', 'templates', 'radix'];
const lightswind = ['gen', 'templates', 'lightswind'];


export const wrapper: GenerateWrapperProps[] = [
    {
        outputDir: ['layouts', 'partials', 'radix-ui'],
        componentName: 'navigation-menu',
        templateFile : [...radix, 'navigation']
    },
    {
        outputDir: ['layouts', 'partials', 'lightswind-ui'],
        componentName: 'border-beam',
        templateFile : [...lightswind, 'border-beam']
    },
    {
        outputDir: ['layouts', 'partials', 'structure', 'header'],
        componentName: 'basic',
        templateFile : [...brainwave, 'header', 'basic']
    }
];